"""Repositorios — unica porta de entrada para o banco.

Cada repositorio traduz linhas de tabela em objetos de dominio e vice-versa.
Isso isola o SQL em um lugar so: trocar SQLite por PostgreSQL significa
reescrever este arquivo, nada alem dele.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime
from decimal import Decimal
from typing import Iterable, Sequence

from ..config import STATUS_FATURAVEIS
from ..domain.exceptions import TarifaNaoEncontradaError
from ..domain.models import (
    Alerta,
    ConsumoUnidade,
    Fatura,
    Sessao,
    Tarifa,
    validar_periodo,
)

_FORMATOS_DATA = ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ")


def _para_datetime(valor) -> datetime | None:
    if valor is None or isinstance(valor, datetime):
        return valor
    texto = str(valor).strip()
    for formato in _FORMATOS_DATA:
        try:
            return datetime.strptime(texto, formato)
        except ValueError:
            continue
    return datetime.fromisoformat(texto.replace("Z", "+00:00")).replace(tzinfo=None)


def _dec(valor) -> Decimal | None:
    return None if valor is None else Decimal(str(valor))


def _linha_para_sessao(linha: sqlite3.Row) -> Sessao:
    return Sessao(
        id_sessao=linha["id_sessao"],
        id_sessao_sems=linha["id_sessao_sems"],
        id_carregador=linha["id_carregador"],
        id_usuario=linha["id_usuario"],
        id_unidade=linha["id_unidade"],
        dt_inicio=_para_datetime(linha["dt_inicio"]),
        dt_fim=_para_datetime(linha["dt_fim"]),
        energia_kwh=_dec(linha["energia_kwh"]),
        potencia_media_kw=_dec(linha["potencia_media_kw"]),
        potencia_max_kw=_dec(linha["potencia_max_kw"]),
        status_final=linha["status_final"],
        id_fatura=linha["id_fatura"],
        anomaly_score=linha["anomaly_score"],
        is_anomaly=bool(linha["is_anomaly"]),
    )


class TarifaRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def por_periodo(self, periodo: str) -> Tarifa:
        validar_periodo(periodo)
        linha = self._conn.execute(
            "SELECT * FROM Tarifa WHERE referencia_mes_ano = ?", (periodo,)
        ).fetchone()
        if linha is None:
            raise TarifaNaoEncontradaError(periodo)
        return Tarifa(
            id_tarifa=linha["id_tarifa"],
            referencia_mes_ano=linha["referencia_mes_ano"],
            distribuidora=linha["distribuidora"],
            valor_kwh_centavos=linha["valor_kwh_centavos"],
            bandeira_vigente=linha["bandeira_vigente"],
            adicional_bandeira_centavos=linha["adicional_bandeira_centavos"],
            taxa_infraestrutura_centavos=linha["taxa_infraestrutura_centavos"],
        )


class UsuarioRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def mapa_rfid(self) -> dict[str, tuple[int, int]]:
        """Devolve {rfid: (id_usuario, id_unidade)} para atribuir as sessoes."""
        linhas = self._conn.execute(
            """
            SELECT u.id_rfid, u.id_usuario, uu.id_unidade
            FROM Usuario u
            JOIN Unidade_Usuario uu ON uu.id_usuario = u.id_usuario
            """
        ).fetchall()
        return {r["id_rfid"]: (r["id_usuario"], r["id_unidade"]) for r in linhas}

    def mapa_carregadores(self) -> dict[str, int]:
        linhas = self._conn.execute(
            "SELECT id_sems, id_carregador FROM Carregador"
        ).fetchall()
        return {r["id_sems"]: r["id_carregador"] for r in linhas}


class SessaoRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def existe_sems(self, id_sessao_sems: str) -> bool:
        return (
            self._conn.execute(
                "SELECT 1 FROM Sessao_Recarga WHERE id_sessao_sems = ?",
                (id_sessao_sems,),
            ).fetchone()
            is not None
        )

    def inserir(self, sessao: Sessao) -> int:
        cursor = self._conn.execute(
            """
            INSERT INTO Sessao_Recarga (
                id_sessao_sems, id_carregador, id_usuario, id_unidade,
                dt_inicio, dt_fim, energia_kwh, potencia_media_kw,
                potencia_max_kw, status_final
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sessao.id_sessao_sems,
                sessao.id_carregador,
                sessao.id_usuario,
                sessao.id_unidade,
                sessao.dt_inicio.strftime("%Y-%m-%d %H:%M:%S"),
                sessao.dt_fim.strftime("%Y-%m-%d %H:%M:%S") if sessao.dt_fim else None,
                float(sessao.energia_kwh),
                float(sessao.potencia_media_kw)
                if sessao.potencia_media_kw is not None
                else None,
                float(sessao.potencia_max_kw)
                if sessao.potencia_max_kw is not None
                else None,
                sessao.status_final,
            ),
        )
        return cursor.lastrowid

    def inserir_leituras(self, id_sessao: int, leituras: Iterable[dict]) -> int:
        dados = [
            (
                id_sessao,
                l["timestamp"],
                l["energia_acumulada_kwh"],
                l["potencia_instantanea_kw"],
                l["tensao_v"],
                l["corrente_a"],
            )
            for l in leituras
        ]
        if not dados:
            return 0
        self._conn.executemany(
            """
            INSERT INTO Leitura_Medicao (
                id_sessao, timestamp, energia_acumulada_kwh,
                potencia_instantanea_kw, tensao_v, corrente_a
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            dados,
        )
        return len(dados)

    def do_periodo(self, periodo: str, apenas_faturaveis: bool = True) -> list[Sessao]:
        validar_periodo(periodo)
        sql = "SELECT * FROM Sessao_Recarga WHERE strftime('%Y-%m', dt_inicio) = ?"
        params: list = [periodo]
        if apenas_faturaveis:
            marcadores = ", ".join("?" * len(STATUS_FATURAVEIS))
            sql += f" AND status_final IN ({marcadores})"
            params.extend(STATUS_FATURAVEIS)
        sql += " ORDER BY dt_inicio"
        return [_linha_para_sessao(r) for r in self._conn.execute(sql, params)]

    def historico_da_unidade(self, id_unidade: int, limite: int = 200) -> list[Sessao]:
        linhas = self._conn.execute(
            """
            SELECT * FROM Sessao_Recarga
            WHERE id_unidade = ? AND status_final IN ('concluida', 'interrompida')
            ORDER BY dt_inicio DESC LIMIT ?
            """,
            (id_unidade, limite),
        ).fetchall()
        return [_linha_para_sessao(r) for r in linhas]

    def historico_geral(self, limite: int = 500) -> list[Sessao]:
        """Historico do condominio inteiro.

        Usado como linha de base quando a unidade ainda nao tem sessoes
        suficientes para ter perfil proprio (problema de partida a frio).
        """
        linhas = self._conn.execute(
            """
            SELECT * FROM Sessao_Recarga
            WHERE status_final IN ('concluida', 'interrompida')
            ORDER BY dt_inicio DESC LIMIT ?
            """,
            (limite,),
        ).fetchall()
        return [_linha_para_sessao(r) for r in linhas]

    def consumo_por_unidade(self, periodo: str) -> list[ConsumoUnidade]:
        """Agrega o consumo por UNIDADE, nao por usuario.

        E essa agregacao que resolve o caso 'dois veiculos na mesma unidade':
        as sessoes dos dois moradores caem na mesma fatura, mas o historico
        por usuario continua intacto na tabela de sessoes.
        """
        validar_periodo(periodo)
        marcadores = ", ".join("?" * len(STATUS_FATURAVEIS))
        linhas = self._conn.execute(
            f"""
            SELECT id_unidade,
                   SUM(energia_kwh)         AS total_kwh,
                   COUNT(*)                 AS qtd,
                   GROUP_CONCAT(id_sessao)  AS ids
            FROM Sessao_Recarga
            WHERE strftime('%Y-%m', dt_inicio) = ?
              AND status_final IN ({marcadores})
            GROUP BY id_unidade
            ORDER BY id_unidade
            """,
            (periodo, *STATUS_FATURAVEIS),
        ).fetchall()
        return [
            ConsumoUnidade(
                id_unidade=r["id_unidade"],
                periodo=periodo,
                energia_kwh=Decimal(str(r["total_kwh"])).quantize(Decimal("0.001")),
                qtd_sessoes=r["qtd"],
                ids_sessoes=tuple(int(i) for i in (r["ids"] or "").split(",") if i),
            )
            for r in linhas
        ]

    def vincular_fatura(self, id_fatura: int, ids_sessoes: Sequence[int]) -> None:
        if not ids_sessoes:
            return
        self._conn.executemany(
            "UPDATE Sessao_Recarga SET id_fatura = ? WHERE id_sessao = ?",
            [(id_fatura, i) for i in ids_sessoes],
        )

    def gravar_avaliacao(
        self, id_sessao: int, score: float, is_anomaly: bool
    ) -> None:
        self._conn.execute(
            "UPDATE Sessao_Recarga SET anomaly_score = ?, is_anomaly = ? "
            "WHERE id_sessao = ?",
            (score, int(is_anomaly), id_sessao),
        )


class FaturaRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def contar_do_periodo(self, periodo: str) -> int:
        return self._conn.execute(
            "SELECT count(*) FROM Fatura WHERE periodo = ?", (periodo,)
        ).fetchone()[0]

    def remover_periodo(self, periodo: str) -> int:
        self._conn.execute(
            "UPDATE Sessao_Recarga SET id_fatura = NULL "
            "WHERE id_fatura IN (SELECT id_fatura FROM Fatura WHERE periodo = ?)",
            (periodo,),
        )
        cursor = self._conn.execute("DELETE FROM Fatura WHERE periodo = ?", (periodo,))
        return cursor.rowcount

    def inserir(self, fatura: Fatura) -> int:
        cursor = self._conn.execute(
            """
            INSERT INTO Fatura (
                id_unidade, id_tarifa, periodo, politica_rateio,
                energia_total_kwh, qtd_sessoes, valor_variavel_centavos,
                valor_taxa_centavos, valor_total_centavos, status_pgto
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                fatura.id_unidade,
                fatura.id_tarifa,
                fatura.periodo,
                fatura.politica_rateio,
                float(fatura.energia_total_kwh),
                fatura.qtd_sessoes,
                fatura.valor_variavel_centavos,
                fatura.valor_taxa_centavos,
                fatura.valor_total_centavos,
                fatura.status_pgto,
            ),
        )
        return cursor.lastrowid

    def do_periodo(self, periodo: str) -> list[sqlite3.Row]:
        return self._conn.execute(
            """
            SELECT f.*, u.cd_unidade
            FROM Fatura f
            JOIN Unidade u ON u.id_unidade = f.id_unidade
            WHERE f.periodo = ?
            ORDER BY f.id_unidade
            """,
            (periodo,),
        ).fetchall()


class AlertaRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def inserir(self, alerta: Alerta) -> int:
        cursor = self._conn.execute(
            """
            INSERT INTO Alerta (tipo, id_sessao, id_unidade, severidade, mensagem)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                alerta.tipo,
                alerta.id_sessao,
                alerta.id_unidade,
                alerta.severidade,
                alerta.mensagem,
            ),
        )
        return cursor.lastrowid

    def abertos(self) -> list[sqlite3.Row]:
        return self._conn.execute(
            "SELECT * FROM Alerta WHERE resolvido = 0 ORDER BY criado_em DESC"
        ).fetchall()
