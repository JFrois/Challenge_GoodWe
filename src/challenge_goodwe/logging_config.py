"""Configuracao de logging da aplicacao.

Substitui os prints espalhados pelo codigo. Em um sistema que emite alerta de
anomalia e gera cobranca, rastreabilidade de execucao nao e opcional.
"""

from __future__ import annotations

import logging
import sys

_FORMATO = "%(asctime)s | %(levelname)-7s | %(name)-28s | %(message)s"


def configurar(nivel: int = logging.INFO) -> None:
    raiz = logging.getLogger()
    if raiz.handlers:
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(_FORMATO, datefmt="%H:%M:%S"))
    raiz.addHandler(handler)
    raiz.setLevel(nivel)
