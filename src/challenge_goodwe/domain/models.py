"""Entidades e objetos de valor do dominio.

Dinheiro circula como Decimal e e persistido em centavos (INTEGER). Nenhuma
operacao monetaria usa float em lugar nenhum do sistema.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime
from decimal import ROUND_HALF_UP, Decimal

from .exceptions import PeriodoInvalidoError

_PERIODO_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
_CEM = Decimal("100")


def validar_periodo(periodo: str) -> str:
    if not _PERIODO_RE.match(periodo or ""):
        raise PeriodoInvalidoError(periodo)
    return periodo


def centavos_para_decimal(centavos: int) -> Decimal:
    return (Decimal(centavos) / _CEM).quantize(Decimal("0.01"))


def decimal_para_centavos(valor: Decimal) -> int:
    return int((valor * _CEM).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def formatar_brl(centavos: int) -> str:
    texto = f"{centavos_para_decimal(centavos):,.2f}"
    texto = texto.replace(",", "_").replace(".", ",").replace("_", ".")
    return f"R$ {texto}"


@dataclass(frozen=True, slots=True)
class Tarifa:
    """Tarifa vigente da distribuidora em um periodo.

    O adicional de bandeira e separado do custo base para permitir atualizacao
    independente (ANEEL Open Data) sem reescrever o historico.
    """

    id_tarifa: int
    referencia_mes_ano: str
    distribuidora: str
    valor_kwh_centavos: int
    bandeira_vigente: str
    adicional_bandeira_centavos: int
    taxa_infraestrutura_centavos: int

    @property
    def custo_kwh(self) -> Decimal:
        """Custo efetivo do kWh em reais, ja com a bandeira aplicada."""
        return centavos_para_decimal(
            self.valor_kwh_centavos + self.adicional_bandeira_centavos
        )


@dataclass(frozen=True, slots=True)
class Sessao:
    """Uma sessao de recarga ja atribuida a um usuario e a uma unidade."""

    id_sessao: int | None
    id_sessao_sems: str | None
    id_carregador: int
    id_usuario: int
    id_unidade: int
    dt_inicio: datetime
    dt_fim: datetime | None
    energia_kwh: Decimal
    potencia_media_kw: Decimal | None = None
    potencia_max_kw: Decimal | None = None
    status_final: str = "concluida"
    id_fatura: int | None = None
    anomaly_score: float | None = None
    is_anomaly: bool = False

    @property
    def duracao_minutos(self) -> int | None:
        if self.dt_fim is None:
            return None
        return int((self.dt_fim - self.dt_inicio).total_seconds() // 60)

    @property
    def periodo(self) -> str:
        return self.dt_inicio.strftime("%Y-%m")


@dataclass(frozen=True, slots=True)
class ConsumoUnidade:
    """Consumo agregado de uma unidade num periodo.

    A agregacao e por unidade, nao por usuario: e assim que o caso
    'dois veiculos na mesma unidade' da Sprint 01 fica resolvido.
    """

    id_unidade: int
    periodo: str
    energia_kwh: Decimal
    qtd_sessoes: int
    ids_sessoes: tuple[int, ...] = field(default=())


@dataclass(frozen=True, slots=True)
class ValorFatura:
    """Resultado de uma politica de rateio aplicada a um consumo."""

    valor_variavel_centavos: int
    valor_taxa_centavos: int

    @property
    def valor_total_centavos(self) -> int:
        return self.valor_variavel_centavos + self.valor_taxa_centavos


@dataclass(frozen=True, slots=True)
class Fatura:
    """Fatura consolidada de uma unidade num periodo."""

    id_fatura: int | None
    id_unidade: int
    id_tarifa: int
    periodo: str
    politica_rateio: str
    energia_total_kwh: Decimal
    qtd_sessoes: int
    valor_variavel_centavos: int
    valor_taxa_centavos: int
    valor_total_centavos: int
    status_pgto: str = "pendente"
    ids_sessoes: tuple[int, ...] = field(default=())

    def resumo(self) -> str:
        return (
            f"Unidade {self.id_unidade} | {self.periodo} | "
            f"{self.energia_total_kwh} kWh em {self.qtd_sessoes} sessao(oes) | "
            f"{formatar_brl(self.valor_total_centavos)}"
        )


@dataclass(frozen=True, slots=True)
class Alerta:
    tipo: str
    mensagem: str
    severidade: str = "media"
    id_sessao: int | None = None
    id_unidade: int | None = None
