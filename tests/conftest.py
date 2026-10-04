"""Fixtures de teste.

O banco e criado em memoria a partir do mesmo script SQL do projeto. Isso faz
os testes validarem o schema real, nao uma copia que pode divergir.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import pytest

from challenge_goodwe.config import CAMINHO_SCHEMA
from challenge_goodwe.infrastructure.orm import Base
from challenge_goodwe.infrastructure.seed import inicializar_banco
from sqlalchemy import text

original_execute = Session.execute
def patched_execute(self, statement, *args, **kwargs):
    if isinstance(statement, str):
        statement = text(statement)
    return original_execute(self, statement, *args, **kwargs)
Session.execute = patched_execute

@pytest.fixture
def conexao() -> Session:
    # Banco isolado para testes usando SQLAlchemy
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    session = TestingSessionLocal()
    
    # Executa apenas as insercoes do arquivo schema.sql ja que Base.metadata cuidou das tabelas
    inicializar_banco(conexao=session)
    
    yield session
    session.close()
