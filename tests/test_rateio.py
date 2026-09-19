"""Testes da politica de rateio.

Cobrem exatamente os casos excepcionais que a Sprint 01 documentou. Nao
precisam de banco: o dominio e puro.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from challenge_goodwe.domain.models import ConsumoUnidade, Tarifa
from challenge_goodwe.domain.rateio import (
    RateioProporcionalKwh,
    RateioTaxaFixaComFranquia,
)

TARIFA = Tarifa(
    id_tarifa=8,
    referencia_mes_ano="2026-06",
    distribuidora="ENEL SP",
    valor_kwh_centavos=92,
    bandeira_vigente="Verde",
    adicional_bandeira_centavos=0,
    taxa_infraestrutura_centavos=5000,
)


def consumo(kwh: str, sessoes: int = 1) -> ConsumoUnidade:
    return ConsumoUnidade(
        id_unidade=1, periodo="2026-06", energia_kwh=Decimal(kwh), qtd_sessoes=sessoes
    )


def test_custo_do_kwh_inclui_bandeira():
    tarifa = Tarifa(
        id_tarifa=9,
        referencia_mes_ano="2026-07",
        distribuidora="ENEL SP",
        valor_kwh_centavos=95,
        bandeira_vigente="Vermelha",
        adicional_bandeira_centavos=8,
        taxa_infraestrutura_centavos=5000,
    )
    assert tarifa.custo_kwh == Decimal("1.03")


def test_rateio_proporcional_soma_variavel_e_taxa():
    valor = RateioProporcionalKwh().calcular(consumo("124.00", 4), TARIFA)
    assert valor.valor_variavel_centavos == 11408   # 124 x R$ 0,92
    assert valor.valor_taxa_centavos == 5000
    assert valor.valor_total_centavos == 16408


def test_arredondamento_monetario_nao_usa_float():
    # 10.005 kWh x R$ 0,92 = R$ 9,2046 -> R$ 9,20
    valor = RateioProporcionalKwh().calcular(consumo("10.005"), TARIFA)
    assert valor.valor_variavel_centavos == 920


def test_sessao_interrompida_cobra_energia_entregue():
    """Caso excepcional da Sprint 01: sem penalidade, cobra o que foi entregue."""
    valor = RateioProporcionalKwh().calcular(consumo("4.05"), TARIFA)
    assert valor.valor_variavel_centavos == 373
    assert valor.valor_taxa_centavos == 5000


def test_consumo_abaixo_do_minimo_nao_gera_cobranca():
    """Plugue que solta: nem energia, nem taxa de infraestrutura."""
    valor = RateioProporcionalKwh().calcular(consumo("0.05"), TARIFA)
    assert valor.valor_total_centavos == 0


def test_taxa_fixa_com_franquia_cobra_apenas_excedente():
    valor = RateioTaxaFixaComFranquia(
        mensalidade_centavos=12000, franquia_kwh=Decimal("50")
    ).calcular(consumo("124.00"), TARIFA)
    assert valor.valor_variavel_centavos == 6808   # 74 kWh excedentes
    assert valor.valor_taxa_centavos == 12000


@pytest.mark.parametrize(
    "politica", [RateioProporcionalKwh(), RateioTaxaFixaComFranquia()]
)
def test_toda_politica_respeita_o_minimo_faturavel(politica):
    assert politica.calcular(consumo("0.01"), TARIFA).valor_total_centavos == 0
