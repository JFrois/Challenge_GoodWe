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

        # Garante que as tabelas existem
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

        # Configurar contas administrativas com logins '000A' e 'admin'
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
                    pin_hash=padrao_pin_hash,
                    role="ADMIN",
                    ativo=True,
                )
                conn.add(admin_user)
            else:
                admin_user.pin_hash = padrao_pin_hash
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

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    inicializar_banco()
    print("Banco inicializado com sucesso!")
