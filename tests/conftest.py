"""Fixtures de teste.

O banco e criado em memoria a partir do mesmo script SQL do projeto. Isso faz
os testes validarem o schema real, nao uma copia que pode divergir.
"""

from __future__ import annotations

import sqlite3

import pytest

from challenge_goodwe.config import CAMINHO_SCHEMA


@pytest.fixture
def conexao() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(CAMINHO_SCHEMA.read_text(encoding="utf-8"))
    conn.execute("PRAGMA foreign_keys = ON")
    yield conn
    conn.close()
