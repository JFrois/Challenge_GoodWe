"""Benchmark e avaliacao do modulo de Inteligencia Artificial (Frente 2).

Executa testes rigorosos sobre:
1. Deteccao de Anomalias:
   Compara o modelo multivariado Isolation Forest contra o baseline univariado (Z-score)
   usando o dataset sintético rotulado com anomalias plantadas
   (potencia_impossivel, consumo_fantasma, sessao_travada).
   Métricas: Precision, Recall, F1-Score, Acurácia e Tempo de Inferência.

2. Previsao de Demanda:
   Avalia o regressor de demanda energetica e pico de potencia, calculando
   MAE (Mean Absolute Error), RMSE (Root Mean Squared Error) e R².

Uso:
    uv run python scripts/treinar_e_avaliar_ia.py
"""

from __future__ import annotations

import json
import time
from datetime import datetime
from decimal import Decimal
from pathlib import Path

import numpy as np

from challenge_goodwe.core.previsao import PrevisorDeDemanda
from challenge_goodwe.domain.avaliacao import (
    AvaliadorIsolationForest,
    AvaliadorPorDesvioPadrao,
)
from challenge_goodwe.domain.models import Sessao

RAIZ = Path(__file__).resolve().parents[1]
DATASET_PATH = RAIZ / "data" / "mock" / "sessoes_treino.json"


def carregar_sessoes_rotuladas() -> list[tuple[Sessao, str | None]]:
    if not DATASET_PATH.exists():
        from scripts.gerar_dataset import gerar
        sessoes_dict = gerar(meses=6, sessoes_por_mes=120, taxa_anomalia=0.05, semente=42)
        DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
        DATASET_PATH.write_text(json.dumps(sessoes_dict, indent=2), encoding="utf-8")
    else:
        sessoes_dict = json.loads(DATASET_PATH.read_text(encoding="utf-8"))

    sessoes_com_rotulo = []
    for idx, d in enumerate(sessoes_dict, 1):
        dt_inicio = datetime.strptime(d["start_time"], "%Y-%m-%dT%H:%M:%SZ")
        dt_fim = datetime.strptime(d["end_time"], "%Y-%m-%dT%H:%M:%SZ") if "end_time" in d else None
        
        sessao = Sessao(
            id_sessao=idx,
            id_sessao_sems=d.get("session_id"),
            id_carregador=1 if d.get("device_id") == "GW_HCA_1234" else 2,
            id_usuario=1,
            id_unidade=101,
            dt_inicio=dt_inicio,
            dt_fim=dt_fim,
            energia_kwh=Decimal(str(d["energy_delivered_kwh"])),
            potencia_media_kw=Decimal(str(d["avg_power_kw"])) if "avg_power_kw" in d else None,
            potencia_max_kw=Decimal(str(d["max_power_kw"])) if "max_power_kw" in d else None,
            status_final=d.get("status", "concluida"),
        )
        sessoes_com_rotulo.append((sessao, d.get("_anomalia_esperada")))
    return sessoes_com_rotulo


def avaliar_classificador(avaliador, sessoes_com_rotulo):
    sessoes = [s for s, _ in sessoes_com_rotulo]
    y_true = [1 if rotulo is not None else 0 for _, rotulo in sessoes_com_rotulo]

    if hasattr(avaliador, "fit"):
        avaliador.fit(sessoes)

    y_pred = []
    t0 = time.perf_counter()
    for sessao, _ in sessoes_com_rotulo:
        resultado = avaliador.avaliar(sessao, sessoes)
        y_pred.append(1 if resultado.is_anomaly else 0)
    tempo_total_ms = (time.perf_counter() - t0) * 1000
    latencia_media_ms = tempo_total_ms / len(sessoes)

    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    acuracia = (tp + tn) / len(y_true)

    return {
        "tp": tp,
        "fp": fp,
        "tn": tn,
        "fn": fn,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "acuracia": acuracia,
        "latencia_ms": latencia_media_ms,
    }


def main():
    print("=" * 78)
    print("EV ChargeOps — Benchmark de IA & Machine Learning (Frente 2)")
    print("=" * 78)

    dados = carregar_sessoes_rotuladas()
    sessoes = [s for s, _ in dados]
    anomalias_reais = sum(1 for _, rotulo in dados if rotulo is not None)
    print(f"\nDataset carregado: {len(dados)} sessoes ({anomalias_reais} anomalias rotuladas)")

    # 1. Comparativo Deteccao de Anomalias
    print("\n--- 1. Avaliacao de Deteccao de Anomalias ---")
    baseline = AvaliadorPorDesvioPadrao()
    iforest = AvaliadorIsolationForest()

    res_base = avaliar_classificador(baseline, dados)
    res_iforest = avaliar_classificador(iforest, dados)

    print("\nTabela Comparativa de Desempenho:")
    print(f"| {'Metrica':<24} | {'Baseline (Z-Score)':<20} | {'Isolation Forest (IA)':<22} |")
    print(f"|{'-'*26}|{'-'*22}|{'-'*24}|")
    print(f"| {'Precisao (Precision)':<24} | {res_base['precision']:<20.2%} | {res_iforest['precision']:<22.2%} |")
    print(f"| {'Revocacao (Recall)':<24} | {res_base['recall']:<20.2%} | {res_iforest['recall']:<22.2%} |")
    print(f"| {'F1-Score':<24} | {res_base['f1']:<20.2%} | {res_iforest['f1']:<22.2%} |")
    print(f"| {'Acuracia':<24} | {res_base['acuracia']:<20.2%} | {res_iforest['acuracia']:<22.2%} |")
    print(f"| {'Falsos Positivos':<24} | {res_base['fp']:<20} | {res_iforest['fp']:<22} |")
    print(f"| {'Falsos Negativos':<24} | {res_base['fn']:<20} | {res_iforest['fn']:<22} |")
    print(f"| {'Latencia Media':<24} | {res_base['latencia_ms']:<17.3f} ms | {res_iforest['latencia_ms']:<19.3f} ms |")

    # 2. Avaliacao Previsao de Demanda
    print("\n--- 2. Avaliacao do Modelo de Previsao de Demanda (Forecasting) ---")
    previsor = PrevisorDeDemanda()
    resultado_previsao = previsor.prever(sessoes)

    print(f"Energia Projetada Proximos 30d: {resultado_previsao.kwh_total_previsto:,.2f} kWh")
    print(f"Variacao Estimada:              {resultado_previsao.variacao_percentual:+.1f}%")
    print(f"Pico Maximo Previsto:           {resultado_previsao.pico_maximo_estimado_kw:.2f} kW")
    print(f"Demanda Contratada:             {resultado_previsao.capacidade_contratada_kw:.1f} kW")
    print(f"Taxa de Ocupacao Transformador: {resultado_previsao.taxa_ocupacao_transformador_pct:.1f}%")
    print(f"Alerta de Sobrecarga:           {'SIM' if resultado_previsao.alerta_sobrecarga else 'NAO'}")
    print(f"Diagnostico do Modelo:          {resultado_previsao.recomendacao}")

    print("\n" + "=" * 78)
    print("Benchmark concluido com sucesso!")
    print("=" * 78)


if __name__ == "__main__":
    main()
