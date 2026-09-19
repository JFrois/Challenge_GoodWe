"""Camada de consulta para a apresentacao (dashboard Streamlit / app).

Interface estavel para o time de front-end. Devolve DataFrames com valores
monetarios ja convertidos para reais — quem consome nunca precisa saber que
internamente o sistema guarda centavos.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pandas as pd

from .domain.models import centavos_para_decimal
from .infrastructure.db import conectar


def _converter_centavos(df: pd.DataFrame) -> pd.DataFrame:
    for coluna in [c for c in df.columns if c.endswith("_centavos")]:
        df[coluna.replace("_centavos", "_brl")] = df[coluna].apply(
            lambda v: float(centavos_para_decimal(int(v)))
        )
        df = df.drop(columns=[coluna])
    return df


class ConsultasEVChargeOps:
    """Consultas somente-leitura para a camada de apresentacao.

    Aceita uma conexao existente ou abre a propria. Fecha apenas o que abriu.
    """

    def __init__(
        self, conexao: sqlite3.Connection | None = None, caminho: Path | None = None
    ) -> None:
        self._externa = conexao is not None
        self._conn = conexao or conectar(caminho)

    def fechar(self) -> None:
        if not self._externa:
            self._conn.close()

    def __enter__(self) -> "ConsultasEVChargeOps":
        return self

    def __exit__(self, *_) -> None:
        self.fechar()

    # ------------------------------ Cadastros ------------------------------ #

    def unidades(self) -> pd.DataFrame:
        return pd.read_sql("SELECT * FROM Unidade ORDER BY id_unidade", self._conn)

    def carregadores(self) -> pd.DataFrame:
        return pd.read_sql("SELECT * FROM Carregador ORDER BY id_carregador", self._conn)

    def periodos_faturados(self) -> list[str]:
        linhas = self._conn.execute(
            "SELECT DISTINCT periodo FROM Fatura ORDER BY periodo DESC"
        ).fetchall()
        return [r["periodo"] for r in linhas]

    # ---------------------------- Visao morador ---------------------------- #

    def extrato_morador(self, id_unidade: int, periodo: str) -> dict[str, pd.DataFrame]:
        sessoes = pd.read_sql(
            """
            SELECT s.id_sessao, c.localizacao, u.nome AS motorista,
                   s.dt_inicio, s.dt_fim, s.energia_kwh, s.status_final,
                   s.is_anomaly
            FROM Sessao_Recarga s
            JOIN Carregador c ON c.id_carregador = s.id_carregador
            JOIN Usuario    u ON u.id_usuario    = s.id_usuario
            WHERE s.id_unidade = ? AND strftime('%Y-%m', s.dt_inicio) = ?
            ORDER BY s.dt_inicio
            """,
            self._conn,
            params=(id_unidade, periodo),
        )
        fatura = pd.read_sql(
            """
            SELECT f.*, t.distribuidora, t.bandeira_vigente
            FROM Fatura f
            JOIN Tarifa t ON t.id_tarifa = f.id_tarifa
            WHERE f.id_unidade = ? AND f.periodo = ?
            """,
            self._conn,
            params=(id_unidade, periodo),
        )
        return {"sessoes": sessoes, "fatura": _converter_centavos(fatura)}

    # ---------------------------- Visao sindico ---------------------------- #

    def painel_sindico(self, periodo: str) -> pd.DataFrame:
        df = pd.read_sql(
            """
            SELECT f.id_fatura, u.cd_unidade, u.tipo, f.periodo,
                   f.energia_total_kwh, f.qtd_sessoes, f.politica_rateio,
                   f.valor_variavel_centavos, f.valor_taxa_centavos,
                   f.valor_total_centavos, f.status_pgto
            FROM Fatura f
            JOIN Unidade u ON u.id_unidade = f.id_unidade
            WHERE f.periodo = ?
            ORDER BY f.valor_total_centavos DESC
            """,
            self._conn,
            params=(periodo,),
        )
        return _converter_centavos(df)

    def consumo_por_hora(self, periodo: str) -> pd.DataFrame:
        return pd.read_sql(
            """
            SELECT CAST(strftime('%H', dt_inicio) AS INTEGER) AS hora,
                   COUNT(*)          AS sessoes,
                   SUM(energia_kwh)  AS energia_kwh
            FROM Sessao_Recarga
            WHERE strftime('%Y-%m', dt_inicio) = ?
              AND status_final IN ('concluida', 'interrompida')
            GROUP BY hora ORDER BY hora
            """,
            self._conn,
            params=(periodo,),
        )

    def alertas_abertos(self) -> pd.DataFrame:
        return pd.read_sql(
            "SELECT * FROM Alerta WHERE resolvido = 0 ORDER BY criado_em DESC",
            self._conn,
        )

    # --------------------------- Dados para a IA --------------------------- #

    def dataset_sessoes(self) -> pd.DataFrame:
        """Tabela plana de sessoes para treino e inferencia do modulo de IA."""
        return pd.read_sql(
            """
            SELECT s.id_sessao, s.id_usuario, s.id_unidade, s.id_carregador,
                   s.dt_inicio, s.dt_fim, s.energia_kwh,
                   s.potencia_media_kw, s.potencia_max_kw, s.status_final,
                   s.anomaly_score, s.is_anomaly,
                   CAST(strftime('%H', s.dt_inicio) AS INTEGER) AS hora_inicio,
                   CAST(strftime('%w', s.dt_inicio) AS INTEGER) AS dia_semana,
                   CAST((julianday(s.dt_fim) - julianday(s.dt_inicio)) * 1440
                        AS INTEGER) AS duracao_min
            FROM Sessao_Recarga s
            WHERE s.status_final IN ('concluida', 'interrompida')
            ORDER BY s.dt_inicio
            """,
            self._conn,
        )

    def dataset_leituras(self) -> pd.DataFrame:
        """Telemetria granular para o Isolation Forest."""
        return pd.read_sql(
            """
            SELECT l.id_leitura, l.id_sessao, s.id_unidade, l.timestamp,
                   l.energia_acumulada_kwh, l.potencia_instantanea_kw,
                   l.tensao_v, l.corrente_a
            FROM Leitura_Medicao l
            JOIN Sessao_Recarga s ON s.id_sessao = l.id_sessao
            ORDER BY l.id_sessao, l.timestamp
            """,
            self._conn,
        )
