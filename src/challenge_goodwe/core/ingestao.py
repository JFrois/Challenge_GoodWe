"""Ingestao de sessoes de recarga.

Recebe sessoes brutas de uma FonteDeSessoes, resolve RFID -> usuario/unidade,
e persiste. A ingestao e idempotente: o id_sessao_sems e unico, entao rodar
duas vezes nao duplica cobranca.
"""

from __future__ import annotations

import logging
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal

from ..domain.models import Sessao
from ..infrastructure.repositories import SessaoRepository, UsuarioRepository
from ..integracao.sems import FonteDeSessoes, SessaoBruta

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class ResultadoIngestao:
    inseridas: int
    duplicadas: int
    descartadas: int
    leituras: int

    def resumo(self) -> str:
        return (
            f"{self.inseridas} sessao(oes) inserida(s), "
            f"{self.duplicadas} ja existente(s), "
            f"{self.descartadas} descartada(s), "
            f"{self.leituras} leitura(s) de telemetria"
        )


class ServicoDeIngestao:
    """Traduz o payload da GoodWe em sessoes do dominio.

    A conexao chega por parametro em vez de ser criada dentro da classe: quem
    controla a transacao e o chamador, e o servico fica testavel com um banco
    em memoria.
    """

    def __init__(self, conexao: sqlite3.Connection, fonte: FonteDeSessoes) -> None:
        self._conn = conexao
        self._fonte = fonte
        self._sessoes = SessaoRepository(conexao)
        self._usuarios = UsuarioRepository(conexao)

    def ingerir(self, desde: datetime | None = None) -> ResultadoIngestao:
        brutas = self._fonte.buscar_sessoes(desde)
        mapa_rfid = self._usuarios.mapa_rfid()
        mapa_carregadores = self._usuarios.mapa_carregadores()

        inseridas = duplicadas = descartadas = leituras = 0

        for bruta in brutas:
            if self._sessoes.existe_sems(bruta.session_id):
                duplicadas += 1
                continue

            vinculo = mapa_rfid.get(bruta.user_rfid)
            id_carregador = mapa_carregadores.get(bruta.device_id)

            if vinculo is None:
                logger.warning(
                    "Sessao %s descartada: RFID %s nao cadastrado",
                    bruta.session_id,
                    bruta.user_rfid,
                )
                descartadas += 1
                continue
            if id_carregador is None:
                logger.warning(
                    "Sessao %s descartada: carregador %s desconhecido",
                    bruta.session_id,
                    bruta.device_id,
                )
                descartadas += 1
                continue

            id_usuario, id_unidade = vinculo
            sessao = Sessao(
                id_sessao=None,
                id_sessao_sems=bruta.session_id,
                id_carregador=id_carregador,
                id_usuario=id_usuario,
                id_unidade=id_unidade,
                dt_inicio=bruta.start_time,
                dt_fim=bruta.end_time,
                energia_kwh=bruta.energy_delivered_kwh,
                potencia_media_kw=bruta.avg_power_kw,
                potencia_max_kw=bruta.max_power_kw,
                status_final=bruta.status,
            )
            id_sessao = self._sessoes.inserir(sessao)
            inseridas += 1

            pontos = list(bruta.leituras) or sintetizar_telemetria(bruta)
            leituras += self._sessoes.inserir_leituras(id_sessao, pontos)

        resultado = ResultadoIngestao(inseridas, duplicadas, descartadas, leituras)
        logger.info("Ingestao concluida: %s", resultado)
        return resultado


def sintetizar_telemetria(
    bruta: SessaoBruta, intervalo_minutos: int = 15
) -> list[dict]:
    """Gera pontos de telemetria a partir dos totais da sessao.

    A API SEMS entrega o consolidado da sessao, nao a serie temporal completa.
    Como a tabela Leitura_Medicao alimenta o modelo de anomalias, derivamos os
    pontos intermediarios por interpolacao linear. Isso e uma aproximacao, e
    esta explicitado aqui para nao ser confundido com medicao real.
    """
    if bruta.end_time is None or bruta.energy_delivered_kwh <= 0:
        return []

    duracao_min = (bruta.end_time - bruta.start_time).total_seconds() / 60
    if duracao_min <= 0:
        return []

    passos = max(1, int(duracao_min // intervalo_minutos))
    incremento = bruta.energy_delivered_kwh / Decimal(passos)
    potencia = float(bruta.avg_power_kw or 0)
    # Trifasico acima de 7,4 kW; monofasico 220 V abaixo disso.
    tensao = 380.0 if float(bruta.max_power_kw or 0) > 7.4 else 220.0
    corrente = round((potencia * 1000) / tensao, 2) if tensao else 0.0

    pontos = []
    for i in range(1, passos + 1):
        instante = bruta.start_time + timedelta(minutes=intervalo_minutos * i)
        pontos.append(
            {
                "timestamp": instante.strftime("%Y-%m-%d %H:%M:%S"),
                "energia_acumulada_kwh": float(round(incremento * i, 3)),
                "potencia_instantanea_kw": potencia,
                "tensao_v": tensao,
                "corrente_a": corrente,
            }
        )
    return pontos
