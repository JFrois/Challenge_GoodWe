"""Motor de rateio — politicas de cobranca.

A Sprint 01 comparou cinco modelos de cobranca e adotou o rateio proporcional
por kWh. Aqui esse comparativo vira codigo: cada modelo e uma implementacao do
protocolo PoliticaRateio (padrao Strategy). Trocar a politica de cobranca do
condominio nao exige tocar no motor de faturamento — o que era exatamente o
objetivo do benchmarking.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Protocol, runtime_checkable

from ..config import ENERGIA_MINIMA_FATURAVEL_KWH
from .models import ConsumoUnidade, Tarifa, ValorFatura, decimal_para_centavos


@runtime_checkable
class PoliticaRateio(Protocol):
    """Contrato de uma politica de cobranca.

    Recebe o consumo agregado de uma unidade e a tarifa vigente; devolve o
    valor a cobrar. Nao acessa banco, nao tem efeito colateral.
    """

    nome: str

    def calcular(self, consumo: ConsumoUnidade, tarifa: Tarifa) -> ValorFatura: ...


class RateioProporcionalKwh:
    """Modelo ADOTADO na Sprint 01.

        valor = (kWh consumido x custo efetivo do kWh) + taxa de infraestrutura

    Regras excepcionais tratadas aqui, conforme documentado na Sprint 01:

    - Sessao interrompida: cobra a energia efetivamente entregue, sem
      penalidade. O filtro de status acontece na consulta; o valor entra
      normalmente no agregado.
    - Consumo irrisorio (abaixo de ENERGIA_MINIMA_FATURAVEL_KWH): nao gera
      cobranca nenhuma, nem a taxa fixa. Cobre o plugue que solta sozinho.
    - Taxa de infraestrutura no modelo 'pay as you go': so incide sobre quem
      teve ao menos uma sessao faturavel no periodo. Quem nao carregou nao
      recebe fatura.
    """

    nome = "proporcional_kwh"

    def calcular(self, consumo: ConsumoUnidade, tarifa: Tarifa) -> ValorFatura:
        if consumo.energia_kwh < ENERGIA_MINIMA_FATURAVEL_KWH:
            return ValorFatura(valor_variavel_centavos=0, valor_taxa_centavos=0)

        variavel = decimal_para_centavos(consumo.energia_kwh * tarifa.custo_kwh)
        return ValorFatura(
            valor_variavel_centavos=variavel,
            valor_taxa_centavos=tarifa.taxa_infraestrutura_centavos,
        )


class RateioTaxaFixaComFranquia:
    """Modelo ALTERNATIVO do benchmarking (Modelo 2 da Sprint 01).

    Mensalidade fixa com franquia de kWh; o excedente e cobrado por kWh.
    Mantido implementado para que o comparativo da Sprint 01 possa ser
    demonstrado com numeros reais, nao apenas descrito em tabela.
    """

    nome = "taxa_fixa_com_franquia"

    def __init__(
        self,
        mensalidade_centavos: int = 12000,
        franquia_kwh: Decimal = Decimal("50"),
    ) -> None:
        self.mensalidade_centavos = mensalidade_centavos
        self.franquia_kwh = franquia_kwh

    def calcular(self, consumo: ConsumoUnidade, tarifa: Tarifa) -> ValorFatura:
        if consumo.energia_kwh < ENERGIA_MINIMA_FATURAVEL_KWH:
            return ValorFatura(valor_variavel_centavos=0, valor_taxa_centavos=0)

        excedente = max(Decimal("0"), consumo.energia_kwh - self.franquia_kwh)
        return ValorFatura(
            valor_variavel_centavos=decimal_para_centavos(excedente * tarifa.custo_kwh),
            valor_taxa_centavos=self.mensalidade_centavos,
        )


POLITICAS: dict[str, PoliticaRateio] = {
    RateioProporcionalKwh.nome: RateioProporcionalKwh(),
    RateioTaxaFixaComFranquia.nome: RateioTaxaFixaComFranquia(),
}

POLITICA_PADRAO = RateioProporcionalKwh.nome


def obter_politica(nome: str | None = None) -> PoliticaRateio:
    return POLITICAS[nome or POLITICA_PADRAO]
