"""Conexao com o banco e unidade de trabalho transacional.

Uma unica forma de abrir conexao em todo o sistema. O context manager garante
commit no sucesso e rollback na excecao — nenhum caminho de codigo deixa o
banco em estado parcial.
"""

from __future__ import annotations

import logging
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from ..config import CAMINHO_BANCO
from ..domain.exceptions import EVChargeOpsError

logger = logging.getLogger(__name__)


def conectar(caminho: Path | None = None) -> sqlite3.Connection:
    destino = Path(caminho or CAMINHO_BANCO)
    destino.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(destino, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def unidade_de_trabalho(
    caminho: Path | None = None,
    conexao: sqlite3.Connection | None = None,
) -> Iterator[sqlite3.Connection]:
    """Abre uma transacao. Commit ao sair sem erro, rollback em excecao.

    Aceita uma conexao existente (usado nos testes com banco em memoria), e
    nesse caso nao fecha a conexao ao final — quem abriu e quem fecha.
    """
    externa = conexao is not None
    conn = conexao or conectar(caminho)
    try:
        yield conn
        conn.commit()
    except EVChargeOpsError as erro:
        # Erro de negocio previsto: reverte e propaga sem poluir o log com
        # stack trace. Quem chamou sabe tratar.
        conn.rollback()
        logger.warning("Transacao revertida: %s", erro)
        raise
    except Exception:
        conn.rollback()
        logger.exception("Transacao revertida por erro inesperado")
        raise
    finally:
        if not externa:
            conn.close()
