"""Testes da ingestao de sessoes vindas da fonte GoodWe."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from challenge_goodwe.core.ingestao import ServicoDeIngestao, sintetizar_telemetria
from challenge_goodwe.integracao.sems import SessaoBruta


class FonteFake:
    nome = "fake"

    def __init__(self, sessoes):
        self._sessoes = sessoes

    def buscar_sessoes(self, desde=None):
        return list(self._sessoes)


def bruta(session_id: str, rfid: str = "TAG_ABC123", device="GW_HCA_1234"):
    return SessaoBruta(
        session_id=session_id,
        device_id=device,
        user_rfid=rfid,
        start_time=datetime(2026, 7, 2, 22, 0),
        end_time=datetime(2026, 7, 3, 2, 0),
        energy_delivered_kwh=Decimal("28.00"),
        avg_power_kw=Decimal("7.0"),
        max_power_kw=Decimal("7.4"),
        status="concluida",
    )


def test_ingestao_atribui_usuario_e_unidade_pelo_rfid(conexao):
    resultado = ServicoDeIngestao(conexao, FonteFake([bruta("S1")])).ingerir()
    assert resultado.inseridas == 1

    linha = conexao.execute(
        "SELECT id_usuario, id_unidade, id_fatura FROM Sessao_Recarga "
        "WHERE id_sessao_sems = 'S1'"
    ).fetchone()
    assert linha["id_usuario"] == 10
    assert linha["id_unidade"] == 1
    assert linha["id_fatura"] is None, "a sessao nasce sem fatura"


def test_ingestao_e_idempotente(conexao):
    fonte = FonteFake([bruta("S1")])
    ServicoDeIngestao(conexao, fonte).ingerir()
    segunda = ServicoDeIngestao(conexao, fonte).ingerir()

    assert segunda.inseridas == 0
    assert segunda.duplicadas == 1


def test_rfid_desconhecido_e_descartado_sem_derrubar_a_ingestao(conexao):
    resultado = ServicoDeIngestao(
        conexao, FonteFake([bruta("S1"), bruta("S2", rfid="TAG_FANTASMA")])
    ).ingerir()
    assert resultado.inseridas == 1
    assert resultado.descartadas == 1


def test_telemetria_sintetizada_fecha_com_a_energia_da_sessao(conexao):
    pontos = sintetizar_telemetria(bruta("S1"))
    assert len(pontos) == 16          # 4 horas a cada 15 minutos
    assert pontos[-1]["energia_acumulada_kwh"] == 28.0
    assert pontos[0]["tensao_v"] == 220.0
    assert isinstance(pontos[0]["corrente_a"], float)
