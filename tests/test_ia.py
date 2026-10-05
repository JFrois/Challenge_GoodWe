"""Testes unitarios e de integracao do modulo de Inteligencia Artificial (Frente 2).

Cobre:
- AvaliadorIsolationForest (deteccao de anomalias multidimensional)
- PrevisorDeDemanda (regressao e projecao de capacidade eletrica)
"""

from datetime import datetime, timedelta
from decimal import Decimal

import pytest

from challenge_goodwe.core.previsao import PrevisorDeDemanda
from challenge_goodwe.domain.avaliacao import AvaliadorIsolationForest
from challenge_goodwe.domain.models import Sessao


def criar_sessao_fake(
    id_sessao: int,
    potencia_kw: float,
    energia_kwh: float,
    duracao_min: int,
    dt_inicio: datetime | None = None,
) -> Sessao:
    ini = dt_inicio or (datetime(2026, 6, 1, 10, 0) + timedelta(days=id_sessao))
    fim = ini + timedelta(minutes=duracao_min)
    return Sessao(
        id_sessao=id_sessao,
        id_sessao_sems=f"SEMS-TEST-{id_sessao}",
        id_carregador=1,
        id_usuario=1,
        id_unidade=101,
        dt_inicio=ini,
        dt_fim=fim,
        energia_kwh=Decimal(str(energia_kwh)),
        potencia_media_kw=Decimal(str(potencia_kw)),
        potencia_max_kw=Decimal(str(max(potencia_kw, 7.4))),
        status_final="concluida",
    )


def test_isolation_forest_detecta_potencia_impossivel():
    avaliador = AvaliadorIsolationForest()
    historico = [criar_sessao_fake(i, 7.2, 28.0, 240) for i in range(1, 20)]
    sessao_anomala = criar_sessao_fake(99, 45.0, 45.0, 60)  # 45 kW em carregador residencial

    resultado = avaliador.avaliar(sessao_anomala, historico)
    assert resultado.is_anomaly is True
    assert resultado.score >= 0.8
    assert "potencia impossivel" in resultado.motivo.lower() or "excede" in resultado.motivo.lower()


def test_isolation_forest_detecta_consumo_fantasma():
    avaliador = AvaliadorIsolationForest()
    historico = [criar_sessao_fake(i, 7.0, 25.0, 220) for i in range(1, 20)]
    sessao_fantasma = criar_sessao_fake(100, 7.0, 70.0, 20)  # 70 kWh em apenas 20 min

    resultado = avaliador.avaliar(sessao_fantasma, historico)
    assert resultado.is_anomaly is True
    assert "consumo fantasma" in resultado.motivo.lower() or "atipica" in resultado.motivo.lower()


def test_isolation_forest_detecta_sessao_travada():
    avaliador = AvaliadorIsolationForest()
    historico = [criar_sessao_fake(i, 7.0, 25.0, 220) for i in range(1, 20)]
    sessao_travada = criar_sessao_fake(101, 0.2, 0.8, 600)  # 10 horas com 0.8 kWh

    resultado = avaliador.avaliar(sessao_travada, historico)
    assert resultado.is_anomaly is True
    assert "travada" in resultado.motivo.lower()


def test_isolation_forest_sessao_normal():
    avaliador = AvaliadorIsolationForest()
    historico = [criar_sessao_fake(i, 7.1, 28.0, 240) for i in range(1, 25)]
    sessao_normal = criar_sessao_fake(102, 7.0, 27.5, 235)

    resultado = avaliador.avaliar(sessao_normal, historico)
    assert resultado.is_anomaly is False


def test_previsor_de_demanda_calcula_projecao():
    previsor = PrevisorDeDemanda(capacidade_contratada_kw=150.0, dias_previsao=30)
    data_base = datetime(2026, 6, 1, 8, 0)
    sessoes = [
        criar_sessao_fake(i, 7.0 + (i % 3) * 0.5, 22.0 + (i % 5) * 3, 180, data_base + timedelta(days=i))
        for i in range(20)
    ]

    resultado = previsor.prever(sessoes)
    assert resultado.kwh_total_previsto > 0
    assert resultado.pico_maximo_estimado_kw > 0
    assert resultado.capacidade_contratada_kw == 150.0
    assert 0 < resultado.taxa_ocupacao_transformador_pct <= 100.0
    assert isinstance(resultado.recomendacao, str)
    assert len(resultado.serie_prevista) == 30
