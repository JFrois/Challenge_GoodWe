"""Contrato de integracao do modulo de IA.

Este arquivo e a fronteira entre o backend e o modulo de inteligencia
artificial. O motor de faturamento chama um AvaliadorDeSessao ao processar
cada sessao e persiste o resultado — e assim que a IA cumpre papel estrutural
em vez de virar um notebook desconectado.

Para plugar o Isolation Forest, basta criar uma classe que implemente
`avaliar()` e passa-la ao MotorDeFaturamento. Nada mais no backend muda.
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol, Sequence, runtime_checkable

from .models import Sessao


@dataclass(frozen=True, slots=True)
class ResultadoAvaliacao:
    """Saida padronizada de qualquer avaliador de sessao.

    score: quanto maior, mais atipica e a sessao. Normalizado em [0, 1].
    is_anomaly: decisao final, ja aplicado o limiar do modelo.
    motivo: texto curto que vai para o alerta exibido ao sindico.
    """

    score: float
    is_anomaly: bool
    motivo: str = ""


@runtime_checkable
class AvaliadorDeSessao(Protocol):
    """Contrato que o modulo de IA deve implementar."""

    nome: str

    def avaliar(
        self, sessao: Sessao, historico: Sequence[Sessao]
    ) -> ResultadoAvaliacao: ...


class AvaliadorNulo:
    """Implementacao neutra. Mantem o pipeline executavel enquanto o modelo
    de IA nao esta pronto, sem espalhar `if modelo is None` pelo motor."""

    nome = "nulo"

    def avaliar(
        self, sessao: Sessao, historico: Sequence[Sessao]
    ) -> ResultadoAvaliacao:
        return ResultadoAvaliacao(score=0.0, is_anomaly=False)


class AvaliadorPorDesvioPadrao:
    """Baseline estatistico — NAO e a entrega de IA da sprint.

    Serve para dois propositos: provar que o gancho de avaliacao funciona
    ponta a ponta antes do modelo chegar, e dar uma linha de base contra a
    qual comparar o Isolation Forest na secao de metricas do README.

    Marca como anomala a sessao cuja potencia media se afasta mais de
    `limiar_z` desvios padrao do historico da propria unidade.
    """

    nome = "baseline_zscore"

    def __init__(
        self,
        limiar_z: float = 3.0,
        minimo_amostras: int = 5,
        desvio_relativo_minimo: float = 0.25,
    ) -> None:
        self.limiar_z = limiar_z
        self.minimo_amostras = minimo_amostras
        # Com historico homogeneo o desvio padrao fica minusculo e qualquer
        # variacao normal vira "3 sigmas". Exigir tambem um afastamento
        # relativo evita esse falso positivo.
        self.desvio_relativo_minimo = desvio_relativo_minimo

    def avaliar(
        self, sessao: Sessao, historico: Sequence[Sessao]
    ) -> ResultadoAvaliacao:
        amostras = [
            float(s.potencia_media_kw)
            for s in historico
            if s.potencia_media_kw is not None and s.id_sessao != sessao.id_sessao
        ]
        if len(amostras) < self.minimo_amostras or sessao.potencia_media_kw is None:
            return ResultadoAvaliacao(score=0.0, is_anomaly=False)

        media = statistics.fmean(amostras)
        desvio = statistics.pstdev(amostras)
        if desvio == 0:
            return ResultadoAvaliacao(score=0.0, is_anomaly=False)

        observado = float(sessao.potencia_media_kw)
        z = abs(observado - media) / desvio
        relativo = abs(observado - media) / media if media else 0.0
        score = min(1.0, z / (self.limiar_z * 2))
        if z <= self.limiar_z or relativo < self.desvio_relativo_minimo:
            return ResultadoAvaliacao(score=round(score, 4), is_anomaly=False)

        return ResultadoAvaliacao(
            score=round(score, 4),
            is_anomaly=True,
            motivo=(
                f"potencia media de {sessao.potencia_media_kw} kW esta a "
                f"{z:.1f} desvios da media historica ({media:.1f} kW)"
            ),
        )


def kwh(valor: str | float | int) -> Decimal:
    """Atalho de conversao usado em testes e scripts."""
    return Decimal(str(valor))
