"""Configuracao central: caminhos e parametros de negocio.

Um unico lugar resolve os caminhos do projeto. A raiz e localizada subindo a
arvore ate encontrar o pyproject.toml, em vez de contar niveis de diretorio
com parent.parent.parent — contagem manual quebra em silencio quando um
modulo muda de lugar.
"""

from __future__ import annotations

import os
from decimal import Decimal
from pathlib import Path


def _encontrar_raiz(inicio: Path) -> Path:
    for candidato in [inicio, *inicio.parents]:
        if (candidato / "pyproject.toml").is_file():
            return candidato
    raise RuntimeError(
        "Nao foi possivel localizar a raiz do projeto (pyproject.toml ausente)."
    )


RAIZ = _encontrar_raiz(Path(__file__).resolve())

DIR_DADOS = RAIZ / "data"
CAMINHO_BANCO = Path(os.getenv("EVCHARGEOPS_DB", DIR_DADOS / "goodwe_chargeops.db"))
CAMINHO_SCHEMA = DIR_DADOS / "dados" / "database_goodwe.sql"
CAMINHO_MOCK_SEMS = Path(
    os.getenv("EVCHARGEOPS_MOCK", DIR_DADOS / "mock" / "sessoes_sems.json")
)

# ----------------------------- Regras de negocio -----------------------------

# Sessoes abaixo deste volume nao sao faturadas. Cobre o caso do plugue que
# solta logo apos conectar, citado na Sprint 01.
ENERGIA_MINIMA_FATURAVEL_KWH = Decimal("0.10")

# Status de sessao que entram no calculo da fatura. 'interrompida' entra:
# cobra-se a energia efetivamente entregue, sem penalidade.
STATUS_FATURAVEIS = ("concluida", "interrompida")

# Percentual da demanda contratada que dispara alerta de capacidade ao gestor,
# conforme obrigacao de comunicacao previa a distribuidora (RN ANEEL 1.000/2021).
LIMIAR_ALERTA_CAPACIDADE = Decimal("0.80")
DEMANDA_CONTRATADA_KWH_MES = Decimal("1500")
