import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "data" / "goodwe_chargeops.db"
SQL_SCRIPT_PATH = (
    BASE_DIR / "data" / "dados" / "database_goodwe.sql"
)  # Ou database_goodwe_2.sql


def get_connection():
    """Retorna uma conexão ativa com o banco SQLite."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def inicializar_banco():
    """Executa o script SQL para criar tabelas e popular dados iniciais."""
    conn = get_connection()
    cursor = conn.cursor()

    if SQL_SCRIPT_PATH.exists():
        with open(SQL_SCRIPT_PATH, "r", encoding="utf-8") as f:
            sql_script = f.read()
            cursor.executescript(sql_script)

    conn.commit()
    conn.close()
    print(f"[Banco de Dados] Sucesso! Banco criado em: {DB_PATH}")


if __name__ == "__main__":
    inicializar_banco()
