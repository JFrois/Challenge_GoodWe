"""Testes de integracao do motor de faturamento contra o schema real."""

from __future__ import annotations

from decimal import Decimal

import pytest

from challenge_goodwe.core.faturamento import MotorDeFaturamento
from challenge_goodwe.domain.avaliacao import AvaliadorPorDesvioPadrao
from challenge_goodwe.domain.exceptions import (
    FaturaJaFechadaError,
    PeriodoInvalidoError,
    TarifaNaoEncontradaError,
)
from challenge_goodwe.domain.rateio import RateioTaxaFixaComFranquia


def faturas_por_unidade(resultado):
    return {f.id_unidade: f for f in resultado.faturas}


def test_fechamento_gera_faturas_e_vincula_sessoes(conexao):
    motor = MotorDeFaturamento(conexao)
    resultado = motor.fechar_periodo("2026-06")

    assert resultado.faturas, "o fechamento deveria gerar faturas"

    orfas = conexao.execute(
        """
        SELECT count(*) FROM Sessao_Recarga
        WHERE strftime('%Y-%m', dt_inicio) = '2026-06'
          AND status_final IN ('concluida', 'interrompida')
          AND energia_kwh >= 0.10
          AND id_fatura IS NULL
        """
    ).fetchone()[0]
    assert orfas == 0, "toda sessao faturavel precisa apontar para sua fatura"


def test_fatura_reconcilia_com_as_sessoes(conexao):
    """A fatura nunca pode divergir do consumo que a originou."""
    MotorDeFaturamento(conexao).fechar_periodo("2026-06")

    divergentes = conexao.execute(
        """
        SELECT f.id_fatura
        FROM Fatura f
        JOIN Sessao_Recarga s ON s.id_fatura = f.id_fatura
        GROUP BY f.id_fatura
        HAVING ABS(SUM(s.energia_kwh) - f.energia_total_kwh) > 0.001
        """
    ).fetchall()
    assert divergentes == []


def test_dois_veiculos_na_mesma_unidade_somam_na_mesma_fatura(conexao):
    """Unidade 1 tem os usuarios 10 e 20; as quatro sessoes viram uma fatura."""
    resultado = MotorDeFaturamento(conexao).fechar_periodo("2026-06")
    fatura = faturas_por_unidade(resultado)[1]

    assert fatura.qtd_sessoes == 4
    assert fatura.energia_total_kwh == Decimal("124.00")

    usuarios = conexao.execute(
        "SELECT COUNT(DISTINCT id_usuario) FROM Sessao_Recarga WHERE id_fatura = ?",
        (fatura.id_fatura,),
    ).fetchone()[0]
    assert usuarios == 2, "o historico por usuario deve continuar separado"


def test_unidade_sem_recarga_nao_recebe_fatura(conexao):
    """Unidades 6 e 10 nao tiveram sessoes: nao pagam nem a taxa fixa."""
    resultado = MotorDeFaturamento(conexao).fechar_periodo("2026-06")
    assert 6 not in faturas_por_unidade(resultado)
    assert 10 not in faturas_por_unidade(resultado)


def test_sessao_abaixo_do_minimo_nao_gera_fatura(conexao):
    """Unidade 4 so teve uma sessao de 0,05 kWh."""
    resultado = MotorDeFaturamento(conexao).fechar_periodo("2026-06")
    assert 4 not in faturas_por_unidade(resultado)
    assert 4 in resultado.unidades_sem_cobranca


def test_sessao_com_erro_fica_fora_do_faturamento(conexao):
    """A sessao da unidade 8 tem status 'erro'."""
    resultado = MotorDeFaturamento(conexao).fechar_periodo("2026-06")
    assert 8 not in faturas_por_unidade(resultado)


def test_sessao_interrompida_entra_no_faturamento(conexao):
    """Unidade 3: duas concluidas (71,5) + uma interrompida (4,05)."""
    resultado = MotorDeFaturamento(conexao).fechar_periodo("2026-06")
    fatura = faturas_por_unidade(resultado)[3]
    assert fatura.qtd_sessoes == 3
    assert fatura.energia_total_kwh == Decimal("75.55")


def test_fechar_duas_vezes_falha_sem_refazer(conexao):
    motor = MotorDeFaturamento(conexao)
    motor.fechar_periodo("2026-06")
    with pytest.raises(FaturaJaFechadaError):
        motor.fechar_periodo("2026-06")


def test_refazer_nao_duplica_faturas(conexao):
    motor = MotorDeFaturamento(conexao)
    primeiro = motor.fechar_periodo("2026-06")
    segundo = motor.fechar_periodo("2026-06", refazer=True)

    total = conexao.execute(
        "SELECT count(*) FROM Fatura WHERE periodo = '2026-06'"
    ).fetchone()[0]
    assert total == len(segundo.faturas) == len(primeiro.faturas)


def test_periodo_sem_tarifa_cadastrada(conexao):
    with pytest.raises(TarifaNaoEncontradaError):
        MotorDeFaturamento(conexao).fechar_periodo("2026-12")


def test_periodo_malformado_e_rejeitado(conexao):
    with pytest.raises(PeriodoInvalidoError):
        MotorDeFaturamento(conexao).fechar_periodo("junho/2026")


def test_troca_de_politica_muda_o_valor_sem_tocar_no_motor(conexao):
    padrao = MotorDeFaturamento(conexao).fechar_periodo("2026-06")
    alternativa = MotorDeFaturamento(
        conexao, politica=RateioTaxaFixaComFranquia()
    ).fechar_periodo("2026-06", refazer=True)

    assert padrao.receita_total_centavos != alternativa.receita_total_centavos
    assert alternativa.faturas[0].politica_rateio == "taxa_fixa_com_franquia"


def test_avaliador_de_ia_grava_score_e_gera_alerta(conexao):
    """O gancho de IA precisa persistir resultado e alimentar os alertas."""
    resultado = MotorDeFaturamento(
        conexao, avaliador=AvaliadorPorDesvioPadrao(limiar_z=2.0)
    ).fechar_periodo("2026-06")

    assert resultado.sessoes_avaliadas > 0
    avaliadas = conexao.execute(
        "SELECT count(*) FROM Sessao_Recarga WHERE anomaly_score IS NOT NULL"
    ).fetchone()[0]
    assert avaliadas == resultado.sessoes_avaliadas

    if resultado.anomalias:
        alertas = conexao.execute(
            "SELECT count(*) FROM Alerta WHERE tipo = 'anomalia'"
        ).fetchone()[0]
        assert alertas == resultado.anomalias
