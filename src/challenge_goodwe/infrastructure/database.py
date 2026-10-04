import os
from contextlib import contextmanager
from typing import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from dotenv import load_dotenv

from challenge_goodwe.config import DIR_DADOS

load_dotenv()

# Default to SQLite for simplicity if URL is not provided
# But in production/Docker, this would be postgresql+psycopg://user:pass@localhost:5432/db
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    f"sqlite:///{DIR_DADOS}/goodwe_chargeops.db"
)

# For SQLite we need specific arguments to support threading if we use it in FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency injection for FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def db_session() -> Generator[Session, None, None]:
    """Context manager for non-API operations."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
