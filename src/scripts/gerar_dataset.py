"""Gerador de massa sintetica de sessoes de recarga.

O banco de demonstracao tem ~20 sessoes, volume insuficiente para treinar um
Isolation Forest. Este script produz centenas de sessoes com padroes de uso
realistas e uma fracao controlada de anomalias plantadas, para que o modulo
de IA tenha base de treino e uma referencia de acerto.

Uso:
    uv run python scripts/gerar_dataset.py --meses 6 --sessoes-por-mes 120
    uv run python scripts/gerar_dataset.py --saida data/mock/sessoes_treino.json

A saida sai no mesmo formato da API SEMS, entao pode ser ingerida pelo
MockSemsClient como qualquer outra fonte:

    EVCHARGEOPS_MOCK=data/mock/sessoes_treino.json uv run evchargeops ingerir

Perfis de uso, derivados do clustering descrito na Sprint 01:
    noturno_diario     - carrega toda noite, sessao longa e potencia baixa
    diurno_util        - carrega de manha em dia util
    fim_de_semana      - carrega aos sabados e domingos
    comercial_intenso  - alto volume, carregador de 11 kW

Anomalias plantadas (rotuladas em `_anomalia_esperada` para avaliar o modelo):
    potencia_impossivel - potencia acima da capacidade nominal do carregador
    consumo_fantasma    - muita energia em tempo curto demais
    sessao_travada      - muitas horas conectado entregando quase nada
"""

from __future__ import annotations

import argparse
import json
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

# (rfid, id_sems do carregador, perfil)
PARTICIPANTES = [
    ("TAG_ABC123", "GW_HCA_1234", "noturno_diario"),
    ("TAG_BCD890", "GW_HCA_1234", "noturno_diario"),
    ("TAG_XYZ789", "GW_HCA_1234", "diurno_util"),
    ("TAG_GHI789", "GW_HCA_1234", "diurno_util"),
    ("TAG_PQR678", "GW_HCA_1234", "fim_de_semana"),
    ("TAG_VWX234", "GW_HCA_1234", "fim_de_semana"),
    ("TAG_STU901", "GW_HCA_1234", "diurno_util"),
    ("TAG_MNO345", "GW_HCA_1234", "noturno_diario"),
    ("TAG_DEF456", "GW_HCA_5678", "comercial_intenso"),
    ("TAG_JKL012", "GW_HCA_5678", "comercial_intenso"),
    ("TAG_YZA567", "GW_HCA_1234", "fim_de_semana"),
]


@dataclass(frozen=True)
class Perfil:
    horas_inicio: tuple[int, ...]
    energia_media: float
    energia_desvio: float
    potencia: float
    dias_semana: tuple[int, ...]  # 0 = segunda


PERFIS = {
    "noturno_diario": Perfil((20, 21, 22, 23), 28.0, 5.0, 7.2, (0, 1, 2, 3, 4, 5, 6)),
    "diurno_util": Perfil((7, 8, 9, 10), 20.5, 3.5, 7.0, (0, 1, 2, 3, 4)),
    "fim_de_semana": Perfil((9, 10, 11, 14, 15), 30.0, 6.0, 7.1, (5, 6)),
    "comercial_intenso": Perfil((8, 10, 13, 14), 42.0, 6.5, 11.0, (0, 1, 2, 3, 4, 5)),
}

CAPACIDADE_NOMINAL = {"GW_HCA_1234": 7.4, "GW_HCA_5678": 11.0}


def _sessao_normal(
    rfid: str, device: str, perfil: Perfil, inicio: datetime, contador: int
) -> dict:
    energia = max(3.0, random.gauss(perfil.energia_media, perfil.energia_desvio))
    potencia = round(random.uniform(perfil.potencia * 0.88, perfil.potencia), 2)
    duracao_h = energia / potencia
    fim = inicio + timedelta(hours=duracao_h)
    return {
        "session_id": f"SEMS-SYN-{contador:06d}",
        "device_id": device,
        "user_rfid": rfid,
        "start_time": inicio.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "end_time": fim.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "energy_delivered_kwh": round(energia, 2),
        "avg_power_kw": potencia,
        "max_power_kw": CAPACIDADE_NOMINAL[device],
        "status": "concluida",
        "_perfil": next(k for k, v in PERFIS.items() if v is perfil),
        "_anomalia_esperada": None,
    }


def _plantar_anomalia(sessao: dict, tipo: str) -> dict:
    inicio = datetime.strptime(sessao["start_time"], "%Y-%m-%dT%H:%M:%SZ")
    nominal = CAPACIDADE_NOMINAL[sessao["device_id"]]

    if tipo == "potencia_impossivel":
        potencia = round(nominal * random.uniform(3.2, 4.5), 2)
        energia = round(potencia * random.uniform(0.8, 1.2), 2)
        fim = inicio + timedelta(hours=energia / potencia)
    elif tipo == "consumo_fantasma":
        energia = round(random.uniform(55, 80), 2)
        fim = inicio + timedelta(minutes=random.randint(18, 35))
        potencia = round(energia / ((fim - inicio).total_seconds() / 3600), 2)
    else:  # sessao_travada
        energia = round(random.uniform(0.3, 1.2), 2)
        fim = inicio + timedelta(hours=random.uniform(9, 14))
        potencia = round(energia / ((fim - inicio).total_seconds() / 3600), 2)

    sessao.update(
        {
            "end_time": fim.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "energy_delivered_kwh": energia,
            "avg_power_kw": potencia,
            "_anomalia_esperada": tipo,
        }
    )
    return sessao


def gerar(
    meses: int, sessoes_por_mes: int, taxa_anomalia: float, semente: int
) -> list[dict]:
    random.seed(semente)
    tipos = ("potencia_impossivel", "consumo_fantasma", "sessao_travada")

    fim = datetime(2026, 9, 1)
    inicio_janela = fim - timedelta(days=30 * meses)
    sessoes: list[dict] = []
    contador = 1

    total = meses * sessoes_por_mes
    while len(sessoes) < total:
        rfid, device, nome_perfil = random.choice(PARTICIPANTES)
        perfil = PERFIS[nome_perfil]

        dia = inicio_janela + timedelta(days=random.randint(0, 30 * meses - 1))
        if dia.weekday() not in perfil.dias_semana:
            continue

        inicio = dia.replace(
            hour=random.choice(perfil.horas_inicio),
            minute=random.choice((0, 10, 15, 20, 30, 40, 45, 50)),
            second=0,
            microsecond=0,
        )
        sessao = _sessao_normal(rfid, device, perfil, inicio, contador)
        if random.random() < taxa_anomalia:
            sessao = _plantar_anomalia(sessao, random.choice(tipos))

        sessoes.append(sessao)
        contador += 1

    sessoes.sort(key=lambda s: s["start_time"])
    return sessoes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--meses", type=int, default=6)
    parser.add_argument("--sessoes-por-mes", type=int, default=120)
    parser.add_argument("--taxa-anomalia", type=float, default=0.05)
    parser.add_argument("--semente", type=int, default=42)
    parser.add_argument(
        "--saida", type=Path, default=RAIZ / "data" / "mock" / "sessoes_treino.json"
    )
    args = parser.parse_args()

    sessoes = gerar(args.meses, args.sessoes_por_mes, args.taxa_anomalia, args.semente)
    args.saida.parent.mkdir(parents=True, exist_ok=True)
    args.saida.write_text(
        json.dumps(sessoes, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    anomalas = sum(1 for s in sessoes if s["_anomalia_esperada"])
    print(f"{len(sessoes)} sessoes geradas em {args.saida}")
    print(f"{anomalas} anomalias plantadas ({anomalas / len(sessoes):.1%})")
    print("Rotulos em '_anomalia_esperada' para avaliar o modelo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
