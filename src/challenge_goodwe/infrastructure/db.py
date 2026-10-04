"""Conexao com o banco e unidade de trabalho transacional."""
from __future__ import annotations

import logging
from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy.orm import Session
from challenge_goodwe.infrastructure.database import SessionLocal
from challenge_goodwe.domain.exceptions import EVChargeOpsError

logger = logging.getLogger(__name__)

def conectar(*args, **kwargs) -> Session:
    return SessionLocal()

@contextmanager
def unidade_de_trabalho(
    caminho=None,
    conexao: Session | None = None,
) -> Iterator[Session]:
    """Abre uma transacao. Commit ao sair sem erro, rollback em excecao."""
    externa = conexao is not None
    conn = conexao or conectar()
    try:
        yield conn
        conn.commit()
    except EVChargeOpsError as erro:
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
