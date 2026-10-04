from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from challenge_goodwe.services import ConsultasEVChargeOps
from challenge_goodwe.infrastructure.db import conectar
from challenge_goodwe.infrastructure.database import get_db
from sqlalchemy.orm import Session
from challenge_goodwe.api import auth, admin, chat
from challenge_goodwe.api.dependencies import get_current_user
from challenge_goodwe.infrastructure.orm import Usuario
import pandas as pd
import json

app = FastAPI(title="EV ChargeOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

# Dependency
def get_consultas():
    # Will use default db path from infrastructure.db (should be in data/)
    with ConsultasEVChargeOps() as consultas:
        yield consultas


from challenge_goodwe.api.dependencies import require_admin, get_current_user
from challenge_goodwe.infrastructure.orm import Usuario

@app.get("/api/admin/dashboard")
def admin_dashboard(
    periodo: str = "2026-06", 
    consultas: ConsultasEVChargeOps = Depends(get_consultas),
    current_user: Usuario = Depends(require_admin)
):
    faturas_df = consultas.painel_sindico(periodo)
    consumo_df = consultas.consumo_por_hora(periodo)
    alertas_df = consultas.alertas_abertos()
    carregadores_df = consultas.carregadores()
    
    # Process pandas to dict
    faturas = faturas_df.to_dict(orient="records") if not faturas_df.empty else []
    consumo = consumo_df.to_dict(orient="records") if not consumo_df.empty else []
    alertas = alertas_df.to_dict(orient="records") if not alertas_df.empty else []
    carregadores = carregadores_df.to_dict(orient="records") if not carregadores_df.empty else []
    
    # Calculate some metrics
    total_energy = faturas_df["energia_total_kwh"].sum() if not faturas_df.empty else 0
    total_revenue = faturas_df["valor_total_brl"].sum() if not faturas_df.empty else 0
    active_sessions = len(faturas_df) # Simplified
    
    return {
        "metrics": {
            "totalEnergy": total_energy,
            "totalRevenue": total_revenue,
            "activeSessions": active_sessions,
            "activeAlerts": len(alertas)
        },
        "faturas": faturas,
        "consumo": consumo,
        "alertas": alertas,
        "carregadores": carregadores
    }

@app.get("/api/resident/dashboard")
def resident_dashboard(
    periodo: str = "2026-06", 
    consultas: ConsultasEVChargeOps = Depends(get_consultas),
    current_user: Usuario = Depends(get_current_user)
):
    # C3: Extract unidade_id safely from the JWT authenticated user, preventing IDOR
    unidade_id = current_user.unidades[0].id_unidade if current_user.unidades else 0
    
    try:
        extrato = consultas.extrato_morador(unidade_id, periodo)
        sessoes = extrato["sessoes"].to_dict(orient="records") if not extrato["sessoes"].empty else []
        fatura = extrato["fatura"].to_dict(orient="records")[0] if not extrato["fatura"].empty else None
        
        carregadores_df = consultas.carregadores()
        carregadores = carregadores_df.to_dict(orient="records") if not carregadores_df.empty else []
        
        return {
            "fatura": fatura,
            "sessoes": sessoes,
            "carregadores": carregadores
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class UpdateProfileRequest(BaseModel):
    nome: str
    email: str
    telefone: str
    veiculo_modelo: str = ""
    veiculo_bateria_kwh: float = 0.0

@app.get("/api/me")
def get_me(current_user: Usuario = Depends(get_current_user)):
    return {
        "id_usuario": current_user.id_usuario,
        "nome": current_user.nome,
        "email": current_user.email,
        "telefone": current_user.telefone,
        "veiculo_modelo": current_user.veiculo_modelo,
        "veiculo_bateria_kwh": current_user.veiculo_bateria_kwh,
        "id_rfid": current_user.id_rfid,
    }

@app.patch("/api/me")
def update_me(req: UpdateProfileRequest, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.nome = req.nome
    current_user.email = req.email
    current_user.telefone = req.telefone
    current_user.veiculo_modelo = req.veiculo_modelo
    current_user.veiculo_bateria_kwh = req.veiculo_bateria_kwh
    db.commit()
    return {"message": "Profile updated"}

from datetime import datetime

class CriarReservaRequest(BaseModel):
    id_carregador: int
    dt_inicio_agendado: datetime
    dt_fim_agendado: datetime

@app.get("/api/reservations")
def get_reservations(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    from challenge_goodwe.infrastructure.orm import ReservaCarregador
    
    # Se for admin, pode ver todas. Se for morador, apenas as dele ou apenas os slots ocupados
    if current_user.role == "ADMIN":
        reservas = db.query(ReservaCarregador).all()
    else:
        # Retorna apenas as reservas do morador
        reservas = db.query(ReservaCarregador).filter(ReservaCarregador.id_usuario == current_user.id_usuario).all()
        
    return reservas

@app.post("/api/reservations")
def create_reservation(req: CriarReservaRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    from challenge_goodwe.infrastructure.orm import ReservaCarregador
    
    # Valida conflito de horario simples
    conflito = db.query(ReservaCarregador).filter(
        ReservaCarregador.id_carregador == req.id_carregador,
        ReservaCarregador.status_reserva != "cancelada",
        ReservaCarregador.dt_inicio_agendado < req.dt_fim_agendado,
        ReservaCarregador.dt_fim_agendado > req.dt_inicio_agendado
    ).first()
    
    if conflito:
        raise HTTPException(status_code=409, detail="Horario ja reservado para este carregador")
        
    unidade_id = current_user.unidades[0].id_unidade if current_user.unidades else None
    if not unidade_id:
        raise HTTPException(status_code=400, detail="Usuario nao vinculado a nenhuma unidade")

    nova_reserva = ReservaCarregador(
        id_carregador=req.id_carregador,
        id_usuario=current_user.id_usuario,
        id_unidade=unidade_id,
        dt_inicio_agendado=req.dt_inicio_agendado,
        dt_fim_agendado=req.dt_fim_agendado,
        status_reserva="pendente"
    )
    db.add(nova_reserva)
    db.commit()
    db.refresh(nova_reserva)
    return nova_reserva
