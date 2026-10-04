"""Repositorios ?" unica porta de entrada para o banco.
Refatorado para utilizar SQLAlchemy ORM e Core (Session), garantindo compatibilidade entre SQLite e PostgreSQL.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Iterable, Sequence

from sqlalchemy.orm import Session
from sqlalchemy import text, func, and_
import pandas as pd

from challenge_goodwe.config import STATUS_FATURAVEIS
from challenge_goodwe.domain.exceptions import TarifaNaoEncontradaError
from challenge_goodwe.domain.models import (
    Alerta,
    ConsumoUnidade,
    Fatura,
    Sessao,
    Tarifa,
    validar_periodo,
)
from challenge_goodwe.infrastructure.orm import (
    Tarifa as OrmTarifa,
    SessaoRecarga as OrmSessaoRecarga,
    LeituraMedicao as OrmLeituraMedicao,
    Fatura as OrmFatura,
    Alerta as OrmAlerta,
    Unidade as OrmUnidade,
    Usuario,
    Carregador,
    unidade_usuario as OrmUnidadeUsuario
)


def _para_datetime(valor) -> datetime | None:
    if valor is None or isinstance(valor, datetime):
        return valor
    texto = str(valor).strip()
    return pd.to_datetime(texto).to_pydatetime()


def _dec(valor) -> Decimal | None:
    return None if valor is None else Decimal(str(valor))

def _orm_para_sessao(orm_sessao: OrmSessaoRecarga) -> Sessao:
    return Sessao(
        id_sessao=orm_sessao.id_sessao,
        id_sessao_sems=orm_sessao.id_sessao_sems,
        id_carregador=orm_sessao.id_carregador,
        id_usuario=orm_sessao.id_usuario,
        id_unidade=orm_sessao.id_unidade,
        dt_inicio=orm_sessao.dt_inicio,
        dt_fim=orm_sessao.dt_fim,
        energia_kwh=_dec(orm_sessao.energia_kwh),
        potencia_media_kw=_dec(orm_sessao.potencia_media_kw),
        potencia_max_kw=_dec(orm_sessao.potencia_max_kw),
        status_final=orm_sessao.status_final,
        id_fatura=orm_sessao.id_fatura,
        anomaly_score=orm_sessao.anomaly_score,
        is_anomaly=bool(orm_sessao.is_anomaly),
    )


class UsuarioRepository:
    def __init__(self, conn: Session) -> None:
        self._session = conn

    def mapa_rfid(self) -> dict[str, tuple[int, int]]:
        """Devolve {rfid: (id_usuario, id_unidade)} para atribuir as sessoes."""
        rows = self._session.query(Usuario.id_rfid, Usuario.id_usuario, OrmUnidadeUsuario.c.id_unidade)\
            .join(OrmUnidadeUsuario, OrmUnidadeUsuario.c.id_usuario == Usuario.id_usuario).all()
        return {r.id_rfid: (r.id_usuario, r.id_unidade) for r in rows}

    def mapa_carregadores(self) -> dict[str, int]:
        rows = self._session.query(Carregador.id_sems, Carregador.id_carregador).all()
        return {r.id_sems: r.id_carregador for r in rows}

class TarifaRepository:
    def __init__(self, conn: Session) -> None:
        self._session = conn

    def vigente(self) -> Tarifa:
        # Pega a tarifa mais recente se nao houver flag ativa
        orm_tarifa = self._session.query(OrmTarifa).order_by(OrmTarifa.referencia_mes_ano.desc()).first()
        if not orm_tarifa:
            raise TarifaNaoEncontradaError("Nenhuma tarifa ativa encontrada.")
        
        return Tarifa(
            id_tarifa=orm_tarifa.id_tarifa,
            referencia_mes_ano=orm_tarifa.referencia_mes_ano,
            distribuidora=orm_tarifa.distribuidora,
            valor_kwh_centavos=orm_tarifa.valor_kwh_centavos,
            bandeira_vigente=orm_tarifa.bandeira_vigente,
            adicional_bandeira_centavos=orm_tarifa.adicional_bandeira_centavos,
            taxa_infraestrutura_centavos=orm_tarifa.taxa_infraestrutura_centavos,
        )

    def por_periodo(self, periodo: str) -> Tarifa:
        validar_periodo(periodo)
        orm_tarifa = self._session.query(OrmTarifa).filter(OrmTarifa.referencia_mes_ano == periodo).first()
        if not orm_tarifa:
            raise TarifaNaoEncontradaError(f"Tarifa para o periodo {periodo} nao cadastrada.")
        
        return Tarifa(
            id_tarifa=orm_tarifa.id_tarifa,
            referencia_mes_ano=orm_tarifa.referencia_mes_ano,
            distribuidora=orm_tarifa.distribuidora,
            valor_kwh_centavos=orm_tarifa.valor_kwh_centavos,
            bandeira_vigente=orm_tarifa.bandeira_vigente,
            adicional_bandeira_centavos=orm_tarifa.adicional_bandeira_centavos,
            taxa_infraestrutura_centavos=orm_tarifa.taxa_infraestrutura_centavos,
        )

class SessaoRepository:
    def __init__(self, conn: Session) -> None:
        self._session = conn

    def existe_sems(self, id_sems: str) -> bool:
        return self._session.query(OrmSessaoRecarga).filter(OrmSessaoRecarga.id_sessao_sems == id_sems).first() is not None

    def inserir(self, sessao: Sessao) -> int:
        nova_sessao = OrmSessaoRecarga(
            id_sessao_sems=sessao.id_sessao_sems,
            id_carregador=sessao.id_carregador,
            id_usuario=sessao.id_usuario,
            id_unidade=sessao.id_unidade,
            dt_inicio=sessao.dt_inicio,
            dt_fim=sessao.dt_fim,
            energia_kwh=float(sessao.energia_kwh),
            potencia_media_kw=float(sessao.potencia_media_kw) if sessao.potencia_media_kw is not None else None,
            potencia_max_kw=float(sessao.potencia_max_kw) if sessao.potencia_max_kw is not None else None,
            status_final=sessao.status_final,
        )
        self._session.add(nova_sessao)
        self._session.flush() # populates id
        return nova_sessao.id_sessao

    def inserir_leituras(self, id_sessao: int, leituras: Iterable[dict]) -> int:
        if not leituras:
            return 0
        objetos = [
            OrmLeituraMedicao(
                id_sessao=id_sessao,
                timestamp=l["timestamp"],
                energia_acumulada_kwh=l["energia_acumulada_kwh"],
                potencia_instantanea_kw=l["potencia_instantanea_kw"],
                tensao_v=l["tensao_v"],
                corrente_a=l["corrente_a"],
            ) for l in leituras
        ]
        self._session.add_all(objetos)
        return len(objetos)

    def do_periodo(self, periodo: str, apenas_faturaveis: bool = True) -> list[Sessao]:
        validar_periodo(periodo)
        year, month = map(int, periodo.split("-"))
        
        query = self._session.query(OrmSessaoRecarga)\
            .filter(func.extract('year', OrmSessaoRecarga.dt_inicio) == year)\
            .filter(func.extract('month', OrmSessaoRecarga.dt_inicio) == month)
            
        if apenas_faturaveis:
            query = query.filter(OrmSessaoRecarga.status_final.in_(STATUS_FATURAVEIS))
            
        return [_orm_para_sessao(s) for s in query.order_by(OrmSessaoRecarga.dt_inicio).all()]

    def historico_da_unidade(self, id_unidade: int, limite: int = 200) -> list[Sessao]:
        linhas = self._session.query(OrmSessaoRecarga)\
            .filter(OrmSessaoRecarga.id_unidade == id_unidade)\
            .filter(OrmSessaoRecarga.status_final.in_(['concluida', 'interrompida']))\
            .order_by(OrmSessaoRecarga.dt_inicio.desc()).limit(limite).all()
        return [_orm_para_sessao(s) for s in linhas]

    def historico_geral(self, limite: int = 500) -> list[Sessao]:
        linhas = self._session.query(OrmSessaoRecarga)\
            .filter(OrmSessaoRecarga.status_final.in_(['concluida', 'interrompida']))\
            .order_by(OrmSessaoRecarga.dt_inicio.desc()).limit(limite).all()
        return [_orm_para_sessao(s) for s in linhas]

    def consumo_por_unidade(self, periodo: str) -> list[ConsumoUnidade]:
        validar_periodo(periodo)
        year, month = map(int, periodo.split("-"))
        
        linhas = self._session.query(
            OrmSessaoRecarga.id_unidade,
            func.sum(OrmSessaoRecarga.energia_kwh).label('total_kwh'),
            func.count(OrmSessaoRecarga.id_sessao).label('qtd'),
            # Postgres: array_agg or string_agg. SQLAlchemy func.string_agg is postgres, SQLite is group_concat.
            # To be agnostic, we will fetch sessions and group in python
        ).filter(func.extract('year', OrmSessaoRecarga.dt_inicio) == year)\
         .filter(func.extract('month', OrmSessaoRecarga.dt_inicio) == month)\
         .filter(OrmSessaoRecarga.status_final.in_(STATUS_FATURAVEIS))\
         .group_by(OrmSessaoRecarga.id_unidade)\
         .order_by(OrmSessaoRecarga.id_unidade).all()
         
        # We need the IDs for each unidade
        sessoes = self._session.query(OrmSessaoRecarga.id_unidade, OrmSessaoRecarga.id_sessao)\
            .filter(func.extract('year', OrmSessaoRecarga.dt_inicio) == year)\
            .filter(func.extract('month', OrmSessaoRecarga.dt_inicio) == month)\
            .filter(OrmSessaoRecarga.status_final.in_(STATUS_FATURAVEIS)).all()
            
        ids_por_unidade = {}
        for s in sessoes:
            ids_por_unidade.setdefault(s.id_unidade, []).append(s.id_sessao)

        return [
            ConsumoUnidade(
                id_unidade=r.id_unidade,
                periodo=periodo,
                energia_kwh=Decimal(str(r.total_kwh)).quantize(Decimal("0.001")),
                qtd_sessoes=r.qtd,
                ids_sessoes=tuple(ids_por_unidade.get(r.id_unidade, [])),
            )
            for r in linhas
        ]

    def vincular_fatura(self, id_fatura: int, ids_sessoes: Sequence[int]) -> None:
        if not ids_sessoes:
            return
        self._session.query(OrmSessaoRecarga)\
            .filter(OrmSessaoRecarga.id_sessao.in_(ids_sessoes))\
            .update({OrmSessaoRecarga.id_fatura: id_fatura}, synchronize_session=False)

    def gravar_avaliacao(
        self, id_sessao: int, score: float, is_anomaly: bool
    ) -> None:
        self._session.query(OrmSessaoRecarga)\
            .filter(OrmSessaoRecarga.id_sessao == id_sessao)\
            .update({OrmSessaoRecarga.anomaly_score: score, OrmSessaoRecarga.is_anomaly: is_anomaly})


class FaturaRepository:
    def __init__(self, conn: Session) -> None:
        self._session = conn

    def contar_do_periodo(self, periodo: str) -> int:
        return self._session.query(OrmFatura).filter(OrmFatura.periodo == periodo).count()

    def remover_periodo(self, periodo: str) -> int:
        faturas = self._session.query(OrmFatura.id_fatura).filter(OrmFatura.periodo == periodo).all()
        ids_faturas = [f.id_fatura for f in faturas]
        if ids_faturas:
            self._session.query(OrmSessaoRecarga).filter(OrmSessaoRecarga.id_fatura.in_(ids_faturas)).update({OrmSessaoRecarga.id_fatura: None}, synchronize_session=False)
        return self._session.query(OrmFatura).filter(OrmFatura.periodo == periodo).delete(synchronize_session=False)

    def inserir(self, fatura: Fatura) -> int:
        nova_fatura = OrmFatura(
            id_unidade=fatura.id_unidade,
            id_tarifa=fatura.id_tarifa,
            periodo=fatura.periodo,
            politica_rateio=fatura.politica_rateio,
            energia_total_kwh=float(fatura.energia_total_kwh),
            qtd_sessoes=fatura.qtd_sessoes,
            valor_variavel_centavos=fatura.valor_variavel_centavos,
            valor_taxa_centavos=fatura.valor_taxa_centavos,
            valor_total_centavos=fatura.valor_total_centavos,
            status_pgto=fatura.status_pgto,
        )
        self._session.add(nova_fatura)
        self._session.flush()
        return nova_fatura.id_fatura

    def do_periodo(self, periodo: str):
        # Emulando sqlite3.Row retornando dicionarios
        rows = self._session.query(OrmFatura, OrmUnidade.cd_unidade)\
            .join(OrmUnidade, OrmUnidade.id_unidade == OrmFatura.id_unidade)\
            .filter(OrmFatura.periodo == periodo)\
            .order_by(OrmFatura.id_unidade).all()
            
        result = []
        for f, cd_unidade in rows:
            d = f.__dict__.copy()
            d.pop('_sa_instance_state', None)
            d['cd_unidade'] = cd_unidade
            result.append(d)
        return result


class AlertaRepository:
    def __init__(self, conn: Session) -> None:
        self._session = conn

    def inserir(self, alerta: Alerta) -> int:
        novo_alerta = OrmAlerta(
            tipo=alerta.tipo,
            id_sessao=alerta.id_sessao,
            id_unidade=alerta.id_unidade,
            severidade=alerta.severidade,
            mensagem=alerta.mensagem,
        )
        self._session.add(novo_alerta)
        self._session.flush()
        return novo_alerta.id_alerta

    def abertos(self):
        rows = self._session.query(OrmAlerta).filter(OrmAlerta.resolvido == False).order_by(OrmAlerta.criado_em.desc()).all()
        result = []
        for a in rows:
            d = a.__dict__.copy()
            d.pop('_sa_instance_state', None)
            result.append(d)
        return result
