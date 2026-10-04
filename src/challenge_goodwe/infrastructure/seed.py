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
        from challenge_goodwe.infrastructure.orm import Base, Usuario, SessaoRecarga
        from challenge_goodwe.auth.security import get_pin_hash

        # Garante que as tabelas existem (especialmente em SQLite ou bancos novos)
        Base.metadata.create_all(bind=conn.bind)

        # Limpa o banco antes de popular para garantir idempotencia
        tabelas = [
            "Auditoria", "Alerta", "Leitura_Medicao", "Sessao_Recarga",
            "Reserva_Carregador", "Fatura", "Tarifa", "Carregador",
            "Unidade_Usuario", "Usuario", "Unidade", "Configuracao"
        ]
        if conn.bind.dialect.name == "postgresql":
            conn.execute(text('TRUNCATE "Sessao_Recarga", "Fatura", "Leitura_Medicao", "Alerta", "Reserva_Carregador", "Tarifa", "Carregador", "Unidade_Usuario", "Unidade", "Usuario", "Auditoria", "Configuracao" CASCADE;'))
        else:
            for t in tabelas:
                try:
                    conn.execute(text(f'DELETE FROM "{t}";'))
                except Exception:
                    pass
            
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

        # Configura credenciais padrao de autenticacao para desenvolvimento e testes
        user_unidade_map = {
            10: "42B",  # Juan de Lucas Frois (Apt 42 - Bloco B)
            11: "43B",  # Flavia R. Pennachin (Apt 43 - Bloco B)
            12: "01T",  # Pedro Valente Toledo (Loja 01 - Terreo)
            13: "55A",  # Mariana Silva (Apt 55 - Bloco A)
            14: "11B",  # Carlos Souza (Apt 11 - Bloco B)
            15: "21B",  # Ana Beatriz Costa (Apt 21 - Bloco B)
            16: "31A",  # Roberto Almeida (Apt 31 - Bloco A)
            17: "32A",  # Camila Rocha (Apt 32 - Bloco A)
            18: "71C",  # Fernando Oliveira (Apt 71 - Bloco C)
            19: "72C",  # Juliana Mendes (Apt 72 - Bloco C)
            20: "42B2", # Renata Frois (2o veiculo Apt 42 - Bloco B)
        }
        padrao_pin_hash = get_pin_hash("123456")

        for u in conn.query(Usuario).all():
            if not u.username and u.id_usuario in user_unidade_map:
                u.username = user_unidade_map[u.id_usuario]
            if not u.pin_hash:
                u.pin_hash = padrao_pin_hash
            u.ativo = True

        # Cria usuario administrador se nao existir
        admin = conn.query(Usuario).filter(Usuario.username == "admin").first()
        if not admin:
            admin = Usuario(
                nome="Administrador",
                email="admin@chargeops.com",
                username="admin",
                pin_hash=padrao_pin_hash,
                role="ADMIN",
                ativo=True,
                tipo_vinculo="gestor",
                id_rfid="TAG_ADMIN",
            )
            conn.add(admin)
                
        conn.commit()
        
        tabelas_count = 13
        sessoes = conn.query(SessaoRecarga).count()
    finally:
        if conexao is None:
            conn.close()

    logger.info(
        "Banco inicializado em %s | %d tabelas | %d sessoes carregadas",
        destino,
        tabelas_count,
        sessoes,
    )
    return destino
