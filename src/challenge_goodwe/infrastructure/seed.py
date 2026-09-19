"""Criacao e carga inicial do banco a partir do script SQL."""

from __future__ import annotations

import logging
import sqlite3
from pathlib import Path

from ..config import CAMINHO_BANCO, CAMINHO_SCHEMA
from ..domain.exceptions import SchemaNaoEncontradoError
from .db import conectar

logger = logging.getLogger(__name__)


def inicializar_banco(
    caminho_banco: Path | None = None,
    caminho_schema: Path | None = None,
    conexao: sqlite3.Connection | None = None,
) -> Path:
    """Executa o script de schema e carga.

    Se o script nao existir, levanta erro. A versao anterior deste modulo
    tinha um `if caminho.exists()` que engolia a ausencia do arquivo e ainda
    imprimia 'Sucesso!' sobre um banco vazio — falha silenciosa que custou
    horas de depuracao.
    """
    schema = Path(caminho_schema or CAMINHO_SCHEMA)
    if not schema.is_file():
        raise SchemaNaoEncontradoError(schema)

    destino = Path(caminho_banco or CAMINHO_BANCO)
    script = schema.read_text(encoding="utf-8")

    conn = conexao or conectar(destino)
    try:
        # executescript encerra a transacao implicita; o commit vem em seguida.
        conn.executescript(script)
        conn.commit()
        tabelas = conn.execute(
            "SELECT count(*) FROM sqlite_master WHERE type = 'table'"
        ).fetchone()[0]
        sessoes = conn.execute("SELECT count(*) FROM Sessao_Recarga").fetchone()[0]
    finally:
        if conexao is None:
            conn.close()

    logger.info(
        "Banco inicializado em %s | %d tabelas | %d sessoes carregadas",
        destino,
        tabelas,
        sessoes,
    )
    return destino
