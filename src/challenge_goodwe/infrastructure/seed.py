"""Criacao e carga inicial do banco a partir do script SQL."""

from __future__ import annotations

import logging
from pathlib import Path
from sqlalchemy import text
import re

from challenge_goodwe.config import CAMINHO_BANCO, CAMINHO_SCHEMA
from challenge_goodwe.domain.exceptions import SchemaNaoEncontradoError
from sqlalchemy.orm import Session
from challenge_goodwe.infrastructure.db import conectar

logger = logging.getLogger(__name__)

def inicializar_banco(
    caminho_banco: Path | None = None,
    caminho_schema: Path | None = None,
    conexao: Session | None = None,
) -> Path:
    schema = Path(caminho_schema or CAMINHO_SCHEMA)
    if not schema.is_file():
        raise SchemaNaoEncontradoError(schema)

    destino = Path(caminho_banco or CAMINHO_BANCO)
    script = schema.read_text(encoding="utf-8")

    conn = conexao or conectar()
    try:
        # Limpa o banco antes de popular
        if conn.bind.dialect.name == "postgresql":
            conn.execute(text('TRUNCATE "Sessao_Recarga", "Fatura", "Leitura_Medicao", "Alerta", "Reserva_Carregador", "Tarifa", "Carregador", "Unidade_Usuario", "Unidade", "Usuario" CASCADE;'))
            
        # Remove todos os comentarios para evitar split errado em ponto-e-virgula dentro de comentario
        script_sem_comentarios = re.sub(r'--.*', '', script)
        statements = script_sem_comentarios.split(";")
        for stmt in statements:
            stmt = stmt.strip()
            
            if not stmt:
                continue
                
            if stmt.upper().startswith("INSERT INTO"):
                clean_stmt = re.sub(r'INSERT INTO (\w+)', r'INSERT INTO "\1"', stmt, flags=re.IGNORECASE)
                conn.execute(text(clean_stmt))
                
        conn.commit()
        
        from challenge_goodwe.infrastructure.orm import SessaoRecarga
        tabelas = 13
        sessoes = conn.query(SessaoRecarga).count()
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
