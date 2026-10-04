"""Testes de integracao dos endpoints de morador (perfil, reservas e cancelamento)."""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from challenge_goodwe.app import app
from challenge_goodwe.infrastructure.database import get_db
from challenge_goodwe.infrastructure.orm import Base, Usuario, ReservaCarregador
from challenge_goodwe.infrastructure.seed import inicializar_banco
from challenge_goodwe.auth.security import create_access_token

@pytest.fixture
def resident_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    inicializar_banco(conexao=session)
    yield session
    session.close()

@pytest.fixture
def client(resident_db):
    def override_get_db():
        yield resident_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def test_atualizar_e_puxar_veiculo(client, resident_db):
    user = resident_db.query(Usuario).filter(Usuario.id_usuario == 10).first()
    assert user is not None
    user.username = "101A"
    user.ativo = True
    resident_db.commit()

    token = create_access_token({"sub": "101A", "role": "MORADOR", "uid": user.id_usuario})
    headers = {"Authorization": f"Bearer {token}"}

    # Atualizar perfil incluindo veículo
    update_res = client.patch(
        "/api/me",
        headers=headers,
        json={
            "nome": "Juan de Lucas Frois",
            "email": "juan@email.com",
            "telefone": "(11) 98888-7777",
            "veiculo_modelo": "BYD Seal",
            "veiculo_bateria_kwh": 82.5,
        }
    )
    assert update_res.status_code == 200
    assert update_res.json()["veiculo_modelo"] == "BYD Seal"
    assert update_res.json()["veiculo_bateria_kwh"] == 82.5

    # Consultar /api/me
    get_res = client.get("/api/me", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["veiculo_modelo"] == "BYD Seal"
    assert data["veiculo_bateria_kwh"] == 82.5

def test_cancelar_reserva(client, resident_db):
    user = resident_db.query(Usuario).filter(Usuario.id_usuario == 10).first()
    user.username = "101A"
    user.ativo = True
    resident_db.commit()

    token = create_access_token({"sub": "101A", "role": "MORADOR", "uid": user.id_usuario})
    headers = {"Authorization": f"Bearer {token}"}

    # Criar uma reserva
    dt_inicio = (datetime.now() + timedelta(days=2)).replace(minute=0, second=0, microsecond=0)
    dt_fim = dt_inicio + timedelta(hours=1)
    
    post_res = client.post(
        "/api/reservations",
        headers=headers,
        json={
            "id_carregador": 5,
            "dt_inicio_agendado": dt_inicio.isoformat(),
            "dt_fim_agendado": dt_fim.isoformat(),
        }
    )
    assert post_res.status_code == 200
    reserva_id = post_res.json()["id_reserva"]

    # Cancelar reserva
    cancel_res = client.patch(f"/api/reservations/{reserva_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status_reserva"] == "cancelada"

    # Verificar no banco
    reserva = resident_db.query(ReservaCarregador).filter(ReservaCarregador.id_reserva == reserva_id).first()
    assert reserva.status_reserva == "cancelada"

def test_admin_marcar_fatura_paga(client, resident_db):
    from challenge_goodwe.infrastructure.orm import Fatura, Unidade, Tarifa
    admin_user = resident_db.query(Usuario).filter(Usuario.username == "admin").first()
    if not admin_user:
        admin_user = Usuario(
            nome="Administrador",
            username="admin",
            pin_hash="dummy",
            role="ADMIN",
            ativo=True
        )
        resident_db.add(admin_user)
        resident_db.commit()

    unidade = resident_db.query(Unidade).first()
    tarifa = resident_db.query(Tarifa).first()
    fatura = Fatura(
        id_unidade=unidade.id_unidade,
        id_tarifa=tarifa.id_tarifa if tarifa else 1,
        periodo="2026-06",
        energia_total_kwh=100.0,
        qtd_sessoes=5,
        politica_rateio="PROPORCIONAL",
        valor_variavel_centavos=10000,
        valor_taxa_centavos=2000,
        valor_total_centavos=12000,
        status_pgto="pendente"
    )
    resident_db.add(fatura)
    resident_db.commit()

    admin_token = create_access_token({"sub": "admin", "role": "ADMIN", "uid": admin_user.id_usuario})
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.put(f"/api/admin/faturas/{fatura.id_fatura}/pago", headers=headers)
    assert res.status_code == 200
    assert res.json()["status_pgto"] == "pago"

    # Verificar persistencia no banco
    resident_db.refresh(fatura)
    assert fatura.status_pgto == "pago"

def test_admin_reservas_por_carregador_e_cancelar(client, resident_db):
    admin_user = resident_db.query(Usuario).filter(Usuario.username == "admin").first()
    if not admin_user:
        admin_user = Usuario(
            nome="Administrador",
            username="admin",
            pin_hash="dummy",
            role="ADMIN",
            ativo=True
        )
        resident_db.add(admin_user)
        resident_db.commit()

    admin_token = create_access_token({"sub": "admin", "role": "ADMIN", "uid": admin_user.id_usuario})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Morador cria uma reserva
    user = resident_db.query(Usuario).filter(Usuario.id_usuario == 10).first()
    user.username = "101A"
    resident_db.commit()
    user_token = create_access_token({"sub": "101A", "role": "MORADOR", "uid": user.id_usuario})
    user_headers = {"Authorization": f"Bearer {user_token}"}

    dt_inicio = (datetime.now() + timedelta(days=3)).replace(minute=0, second=0, microsecond=0)
    dt_fim = dt_inicio + timedelta(hours=2)

    post_res = client.post(
        "/api/reservations",
        headers=user_headers,
        json={
            "id_carregador": 5,
            "dt_inicio_agendado": dt_inicio.isoformat(),
            "dt_fim_agendado": dt_fim.isoformat(),
        }
    )
    assert post_res.status_code == 200
    reserva_id = post_res.json()["id_reserva"]

    # Admin consulta reservas com filtro de carregador
    get_res = client.get("/api/reservations?id_carregador=5", headers=headers)
    assert get_res.status_code == 200
    reservas = get_res.json()
    assert any(r["id_reserva"] == reserva_id for r in reservas)

    # Admin cancela a reserva para manutencao do carregador
    cancel_res = client.patch(f"/api/reservations/{reserva_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status_reserva"] == "cancelada"

    # Verifica status
    reserva = resident_db.query(ReservaCarregador).filter(ReservaCarregador.id_reserva == reserva_id).first()
    assert reserva.status_reserva == "cancelada"
