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
        # Limpa e recria o banco antes de popular
        from challenge_goodwe.infrastructure.orm import Base
        Base.metadata.create_all(conn.bind)
        if conn.bind.dialect.name == "postgresql":
            conn.execute(text('TRUNCATE "Sessao_Recarga", "Fatura", "Leitura_Medicao", "Alerta", "Reserva_Carregador", "Tarifa", "Carregador", "Unidade_Usuario", "Unidade", "Usuario" CASCADE;'))
        else:
            Base.metadata.drop_all(conn.bind)
            Base.metadata.create_all(conn.bind)
            
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

        # Configurar credenciais de acesso padrao (PIN 123456)
        from challenge_goodwe.infrastructure.orm import Usuario
        from challenge_goodwe.auth.security import get_pin_hash

        default_hash = get_pin_hash("123456")

        mapa_logins = {
            10: "42B",   # Juan (Apt 42 - Bloco B)
            11: "43B",   # Flavia (Apt 43 - Bloco B)
            12: "01T",   # Pedro (Loja 01 - Terreo)
            13: "55A",   # Mariana (Apt 55 - Bloco A)
            14: "11B",   # Carlos (Apt 11 - Bloco B)
            15: "21B",   # Ana Beatriz (Apt 21 - Bloco B)
            16: "31A",   # Roberto (Apt 31 - Bloco A)
            17: "32A",   # Camila (Apt 32 - Bloco A)
            18: "71C",   # Fernando (Apt 71 - Bloco C)
            19: "72C",   # Juliana (Apt 72 - Bloco C)
            20: "42B2",  # Renata
        }

        for uid, user_login in mapa_logins.items():
            u = conn.query(Usuario).filter(Usuario.id_usuario == uid).first()
            if u:
                u.username = user_login
                u.pin_hash = default_hash
                u.role = "MORADOR"
                u.ativo = True

        # Configurar Sindico Admin com logins '000A' e 'admin'
        for admin_login in ["000A", "admin"]:
            admin_user = conn.query(Usuario).filter(Usuario.username == admin_login).first()
            if not admin_user:
                admin_user = Usuario(
                    nome="Sindico Admin" if admin_login == "000A" else "Administrador Geral",
                    email=f"{admin_login.lower()}@chargeops.com",
                    telefone="(11) 99999-0000",
                    tipo_vinculo="administrador",
                    id_rfid=f"TAG_{admin_login}",
                    id_app=f"APP_{admin_login}",
                    username=admin_login,
                    pin_hash=default_hash,
                    role="ADMIN",
                    ativo=True,
                )
                conn.add(admin_user)
            else:
                admin_user.pin_hash = default_hash
                admin_user.role = "ADMIN"
                admin_user.ativo = True

        conn.commit()

        # Fechar faturamento 2026-06 automaticamente com IA no seed principal (fora dos testes)
        if conexao is None:
            try:
                from challenge_goodwe.core.faturamento import MotorDeFaturamento
                from challenge_goodwe.domain.avaliacao import AvaliadorIsolationForest
                motor = MotorDeFaturamento(conexao=conn, avaliador=AvaliadorIsolationForest())
                motor.fechar_periodo("2026-06", refazer=True)
                conn.commit()
            except Exception as e:
                logger.warning("Falha ao fechar faturamento no seed: %s", e)
        
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

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    inicializar_banco()
    print("Banco inicializado com sucesso!")
