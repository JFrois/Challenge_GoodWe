"""Camada de consulta para a apresentacao (dashboard Streamlit / app)."""
from __future__ import annotations

from pathlib import Path
import pandas as pd

from sqlalchemy import text, func, cast, Integer
from sqlalchemy.orm import Session

from .domain.models import centavos_para_decimal
from .infrastructure.db import conectar
from .infrastructure.orm import SessaoRecarga, Fatura, Unidade, Carregador, Usuario, Alerta, LeituraMedicao, Tarifa

def _converter_centavos(df: pd.DataFrame) -> pd.DataFrame:
    for coluna in [c for c in df.columns if c.endswith("_centavos")]:
        df[coluna.replace("_centavos", "_brl")] = df[coluna].apply(
            lambda v: float(centavos_para_decimal(int(v)))
        )
        df = df.drop(columns=[coluna])
    return df

class ConsultasEVChargeOps:
    """Consultas somente-leitura para a camada de apresentacao.
    Agora refatorado para utilizar SQLAlchemy ORM / Core, garantindo compatibilidade entre Postgres e SQLite.
    """

    def __init__(self, conexao: Session | None = None, caminho: Path | None = None) -> None:
        self._externa = conexao is not None
        self._conn = conexao or conectar()

    def fechar(self) -> None:
        if not self._externa:
            self._conn.close()

    def __enter__(self) -> "ConsultasEVChargeOps":
        return self

    def __exit__(self, *_) -> None:
        self.fechar()

    def unidades(self) -> pd.DataFrame:
        query = self._conn.query(Unidade).order_by(Unidade.id_unidade)
        return pd.read_sql(query.statement, self._conn.bind)

    def carregadores(self) -> pd.DataFrame:
        query = self._conn.query(Carregador).order_by(Carregador.id_carregador)
        return pd.read_sql(query.statement, self._conn.bind)

    def periodos_faturados(self) -> list[str]:
        linhas = self._conn.query(Fatura.periodo).distinct().order_by(Fatura.periodo.desc()).all()
        return [r[0] for r in linhas]

    def extrato_morador(self, id_unidade: int, periodo: str) -> dict[str, pd.DataFrame]:
        # C3: Extracting correct period and filtering
        year, month = periodo.split("-")
        
        # Sessoes
        sessoes_query = self._conn.query(
            SessaoRecarga.id_sessao,
            Carregador.localizacao,
            Usuario.nome.label("motorista"),
            SessaoRecarga.dt_inicio,
            SessaoRecarga.dt_fim,
            SessaoRecarga.energia_kwh,
            SessaoRecarga.status_final,
            SessaoRecarga.is_anomaly
        ).join(Carregador, Carregador.id_carregador == SessaoRecarga.id_carregador)\
         .join(Usuario, Usuario.id_usuario == SessaoRecarga.id_usuario)\
         .filter(SessaoRecarga.id_unidade == id_unidade)\
         .filter(func.extract('year', SessaoRecarga.dt_inicio) == int(year))\
         .filter(func.extract('month', SessaoRecarga.dt_inicio) == int(month))\
         .order_by(SessaoRecarga.dt_inicio)
         
        sessoes = pd.read_sql(sessoes_query.statement, self._conn.bind)
        
        # Fatura
        fatura_query = self._conn.query(
            Fatura,
            Tarifa.distribuidora,
            Tarifa.bandeira_vigente
        ).join(Tarifa, Tarifa.id_tarifa == Fatura.id_tarifa)\
         .filter(Fatura.id_unidade == id_unidade)\
         .filter(Fatura.periodo == periodo)
         
        fatura = pd.read_sql(fatura_query.statement, self._conn.bind)
        
        return {"sessoes": sessoes, "fatura": _converter_centavos(fatura)}

    def painel_sindico(self, periodo: str) -> pd.DataFrame:
        from challenge_goodwe.infrastructure.orm import Usuario, unidade_usuario
        query = self._conn.query(
            Fatura.id_fatura,
            Unidade.cd_unidade,
            Unidade.tipo,
            func.coalesce(func.min(Usuario.nome), Unidade.cd_unidade).label("morador"),
            Fatura.periodo,
            Fatura.energia_total_kwh,
            Fatura.qtd_sessoes,
            Fatura.politica_rateio,
            Fatura.valor_variavel_centavos,
            Fatura.valor_taxa_centavos,
            Fatura.valor_total_centavos,
            Fatura.status_pgto
        ).join(Unidade, Unidade.id_unidade == Fatura.id_unidade)\
         .outerjoin(unidade_usuario, unidade_usuario.c.id_unidade == Unidade.id_unidade)\
         .outerjoin(Usuario, Usuario.id_usuario == unidade_usuario.c.id_usuario)\
         .filter(Fatura.periodo == periodo)\
         .group_by(
            Fatura.id_fatura,
            Unidade.cd_unidade,
            Unidade.tipo,
            Fatura.periodo,
            Fatura.energia_total_kwh,
            Fatura.qtd_sessoes,
            Fatura.politica_rateio,
            Fatura.valor_variavel_centavos,
            Fatura.valor_taxa_centavos,
            Fatura.valor_total_centavos,
            Fatura.status_pgto
         )\
         .order_by(Fatura.valor_total_centavos.desc())
         
        df = pd.read_sql(query.statement, self._conn.bind)
        return _converter_centavos(df)

    def consumo_por_hora(self, periodo: str) -> pd.DataFrame:
        year, month = periodo.split("-")
        
        query = self._conn.query(
            cast(func.extract('hour', SessaoRecarga.dt_inicio), Integer).label('hora'),
            func.count(SessaoRecarga.id_sessao).label('sessoes'),
            func.sum(SessaoRecarga.energia_kwh).label('energia_kwh')
        ).filter(func.extract('year', SessaoRecarga.dt_inicio) == int(year))\
         .filter(func.extract('month', SessaoRecarga.dt_inicio) == int(month))\
         .filter(SessaoRecarga.status_final.in_(['concluida', 'interrompida']))\
         .group_by('hora')\
         .order_by('hora')
         
        return pd.read_sql(query.statement, self._conn.bind)

    def alertas_abertos(self) -> pd.DataFrame:
        query = self._conn.query(Alerta).filter(Alerta.resolvido == False).order_by(Alerta.criado_em.desc())
        return pd.read_sql(query.statement, self._conn.bind)

    def dataset_sessoes(self) -> pd.DataFrame:
        # Avoid julianday in ORM, do a cross-compatible duration calc or just fetch and calc in pandas
        query = self._conn.query(
            SessaoRecarga.id_sessao, SessaoRecarga.id_usuario, SessaoRecarga.id_unidade, SessaoRecarga.id_carregador,
            SessaoRecarga.dt_inicio, SessaoRecarga.dt_fim, SessaoRecarga.energia_kwh,
            SessaoRecarga.potencia_media_kw, SessaoRecarga.potencia_max_kw, SessaoRecarga.status_final,
            SessaoRecarga.anomaly_score, SessaoRecarga.is_anomaly,
            cast(func.extract('hour', SessaoRecarga.dt_inicio), Integer).label('hora_inicio'),
            # Postgres extract dow is 0-6 (Sun-Sat), sqlite strftime %w is 0-6
            cast(func.extract('dow', SessaoRecarga.dt_inicio) if self._conn.bind.dialect.name == "postgresql" else func.extract('dow', SessaoRecarga.dt_inicio), Integer).label('dia_semana')
        ).filter(SessaoRecarga.status_final.in_(['concluida', 'interrompida']))\
         .order_by(SessaoRecarga.dt_inicio)
         
        df = pd.read_sql(query.statement, self._conn.bind)
        
        # Calculate duration_min directly in pandas to be 100% db-agnostic and avoid julianday/extract epoch issues
        if not df.empty and 'dt_fim' in df.columns and 'dt_inicio' in df.columns:
            # Ensure datetime
            df['dt_fim'] = pd.to_datetime(df['dt_fim'])
            df['dt_inicio'] = pd.to_datetime(df['dt_inicio'])
            df['duracao_min'] = (df['dt_fim'] - df['dt_inicio']).dt.total_seconds() // 60
            df['duracao_min'] = df['duracao_min'].fillna(0).astype(int)
        
        return df

    def dataset_leituras(self) -> pd.DataFrame:
        query = self._conn.query(
            LeituraMedicao.id_leitura, LeituraMedicao.id_sessao, SessaoRecarga.id_unidade, LeituraMedicao.timestamp,
            LeituraMedicao.energia_acumulada_kwh, LeituraMedicao.potencia_instantanea_kw,
            LeituraMedicao.tensao_v, LeituraMedicao.corrente_a
        ).join(SessaoRecarga, SessaoRecarga.id_sessao == LeituraMedicao.id_sessao)\
         .order_by(LeituraMedicao.id_sessao, LeituraMedicao.timestamp)
         
        return pd.read_sql(query.statement, self._conn.bind)
