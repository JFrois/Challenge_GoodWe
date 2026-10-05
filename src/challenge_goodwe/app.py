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

def df_to_records(df: pd.DataFrame) -> list:
    if df is None or df.empty:
        return []
    clean_df = df.astype(object).where(pd.notnull(df), None)
    return clean_df.to_dict(orient="records")


def sanitize_json_val(val):
    import math
    if isinstance(val, dict):
        return {k: sanitize_json_val(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [sanitize_json_val(v) for v in val]
    elif isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    elif pd.isna(val):
        return None
    return val


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
    sessoes_df = consultas.dataset_sessoes()
    
    # Process pandas to clean dict
    faturas = df_to_records(faturas_df)
    consumo = df_to_records(consumo_df)
    alertas = df_to_records(alertas_df)
    carregadores = df_to_records(carregadores_df)
    sessoes = df_to_records(sessoes_df)
    
    total_energy = round(sum(float(f.get("energia_total_kwh", 0) or 0) for f in faturas), 2)
    if total_energy == 0 and sessoes:
        total_energy = round(sum(float(s.get("energia_kwh", 0) or 0) for s in sessoes), 2)

    total_revenue = round(sum(float(f.get("valor_total_brl", 0) or 0) for f in faturas), 2)
    if total_revenue == 0 and total_energy > 0:
        total_revenue = round(total_energy * 0.92, 2)

    active_sessions = len([s for s in sessoes if s.get("status_final") in ["ativa", "em_andamento"]])

    # Previsao de Demanda e Capacidade (Modelo ML Ridge)
    previsao_data = None
    try:
        from challenge_goodwe.core.previsao import PrevisorDeDemanda
        from challenge_goodwe.domain.models import Sessao as DomainSessao
        from decimal import Decimal
        sessoes_domain = []
        for _, row in sessoes_df.iterrows():
            sessoes_domain.append(
                DomainSessao(
                    id_sessao=int(row["id_sessao"]),
                    id_sessao_sems=None,
                    id_carregador=int(row["id_carregador"]),
                    id_usuario=int(row["id_usuario"]),
                    id_unidade=int(row["id_unidade"]),
                    dt_inicio=pd.to_datetime(row["dt_inicio"]),
                    dt_fim=pd.to_datetime(row["dt_fim"]) if pd.notnull(row["dt_fim"]) else None,
                    energia_kwh=Decimal(str(row["energia_kwh"])),
                    potencia_media_kw=Decimal(str(row["potencia_media_kw"])) if pd.notnull(row["potencia_media_kw"]) else None,
                    potencia_max_kw=Decimal(str(row["potencia_max_kw"])) if pd.notnull(row["potencia_max_kw"]) else None,
                    status_final=str(row["status_final"]),
                    anomaly_score=float(row["anomaly_score"]) if pd.notnull(row["anomaly_score"]) else None,
                    is_anomaly=bool(row["is_anomaly"]),
                )
            )
        previsao_data = PrevisorDeDemanda().prever(sessoes_domain).to_dict()
    except Exception as e:
        logger.warning("Falha ao calcular previsao de demanda: %s", e)

    from fastapi.encoders import jsonable_encoder
    result = {
        "metrics": {
            "totalEnergy": total_energy,
            "totalRevenue": total_revenue,
            "activeSessions": active_sessions,
            "activeAlerts": len(alertas)
        },
        "faturas": faturas,
        "consumo": consumo,
        "alertas": alertas,
        "carregadores": carregadores,
        "sessoes": sessoes,
        "previsao": previsao_data,
    }
    return jsonable_encoder(sanitize_json_val(result))


class StatusCarregadorRequest(BaseModel):
    status: str


@app.get("/api/admin/carregadores")
def get_carregadores(
    consultas: ConsultasEVChargeOps = Depends(get_consultas),
    current_user: Usuario = Depends(require_admin)
):
    carregadores_df = consultas.carregadores()
    return carregadores_df.to_dict(orient="records") if not carregadores_df.empty else []


@app.put("/api/admin/carregadores/{id_carregador}/status")
def atualizar_status_carregador(
    id_carregador: int,
    req: StatusCarregadorRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    from challenge_goodwe.infrastructure.orm import Carregador
    c = db.query(Carregador).filter(Carregador.id_carregador == id_carregador).first()
    if not c:
        raise HTTPException(status_code=404, detail="Carregador não encontrado")
    
    st = req.status.lower()
    if st in ["offline", "manutencao", "manutenção"]:
        c.estado_operacional = "manutencao"
    elif st in ["online", "available", "disponivel"]:
        c.estado_operacional = "online"
    elif st in ["in_use", "charging", "carregando"]:
        c.estado_operacional = "in_use"
    else:
        c.estado_operacional = st
        
    db.commit()
    db.refresh(c)
    return {
        "id_carregador": c.id_carregador,
        "estado_operacional": c.estado_operacional,
        "mensagem": f"Status do carregador {id_carregador} alterado para {c.estado_operacional}"
    }


@app.get("/api/admin/previsao-demanda")
def get_previsao_demanda(
    consultas: ConsultasEVChargeOps = Depends(get_consultas),
    current_user: Usuario = Depends(require_admin)
):
    from challenge_goodwe.core.previsao import PrevisorDeDemanda
    from challenge_goodwe.domain.models import Sessao as DomainSessao
    from decimal import Decimal

    df_sessoes = consultas.dataset_sessoes()
    sessoes_domain = []
    for _, row in df_sessoes.iterrows():
        sessoes_domain.append(
            DomainSessao(
                id_sessao=int(row["id_sessao"]),
                id_sessao_sems=None,
                id_carregador=int(row["id_carregador"]),
                id_usuario=int(row["id_usuario"]),
                id_unidade=int(row["id_unidade"]),
                dt_inicio=pd.to_datetime(row["dt_inicio"]),
                dt_fim=pd.to_datetime(row["dt_fim"]) if pd.notnull(row["dt_fim"]) else None,
                energia_kwh=Decimal(str(row["energia_kwh"])),
                potencia_media_kw=Decimal(str(row["potencia_media_kw"])) if pd.notnull(row["potencia_media_kw"]) else None,
                potencia_max_kw=Decimal(str(row["potencia_max_kw"])) if pd.notnull(row["potencia_max_kw"]) else None,
                status_final=str(row["status_final"]),
                anomaly_score=float(row["anomaly_score"]) if pd.notnull(row["anomaly_score"]) else None,
                is_anomaly=bool(row["is_anomaly"]),
            )
        )
    resultado = PrevisorDeDemanda().prever(sessoes_domain)
    return resultado.to_dict()

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
        sessoes = df_to_records(extrato["sessoes"])
        faturas_list = df_to_records(extrato["fatura"])
        fatura = faturas_list[0] if faturas_list else None
        
        carregadores_df = consultas.carregadores()
        carregadores = df_to_records(carregadores_df)

        # Calcular métricas dinâmicas do residente
        total_kwh = float(fatura["energia_total_kwh"]) if fatura and fatura.get("energia_total_kwh") is not None else sum(float(s.get("energia_kwh", 0) or 0) for s in sessoes)
        total_cost = float(fatura["valor_total_brl"]) if fatura and fatura.get("valor_total_brl") is not None else round(total_kwh * 0.92, 2)

        durations = []
        for s in sessoes:
            if s.get("dt_inicio") and s.get("dt_fim"):
                try:
                    t_ini = pd.to_datetime(s["dt_inicio"])
                    t_fim = pd.to_datetime(s["dt_fim"])
                    durations.append((t_fim - t_ini).total_seconds() / 60.0)
                except Exception:
                    pass
        avg_duration_min = round(sum(durations) / len(durations)) if durations else 0
        
        from fastapi.encoders import jsonable_encoder
        res = {
            "usuario": {
                "id_usuario": current_user.id_usuario,
                "nome": current_user.nome,
                "username": current_user.username
            },
            "metrics": {
                "totalEnergy": round(total_kwh, 2),
                "totalCost": round(total_cost, 2),
                "avgDurationMinutes": avg_duration_min
            },
            "fatura": fatura,
            "sessoes": sessoes,
            "carregadores": carregadores
        }
        return jsonable_encoder(sanitize_json_val(res))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class UpdateProfileRequest(BaseModel):
    nome: str
    email: str
    telefone: str
    veiculo_modelo: Optional[str] = None
    veículo_modelo: Optional[str] = None
    veiculo_bateria_kwh: Optional[float] = None
    veículo_bateria_kwh: Optional[float] = None

@app.get("/api/me")
def get_me(current_user: Usuario = Depends(get_current_user)):
    return {
        "id_usuario": current_user.id_usuario,
        "nome": current_user.nome,
        "email": current_user.email,
        "telefone": current_user.telefone,
        "veiculo_modelo": current_user.veiculo_modelo or "",
        "veículo_modelo": current_user.veiculo_modelo or "",
        "veiculo_bateria_kwh": current_user.veiculo_bateria_kwh or 0.0,
        "veículo_bateria_kwh": current_user.veiculo_bateria_kwh or 0.0,
        "id_rfid": current_user.id_rfid,
    }

@app.patch("/api/me")
def update_me(req: UpdateProfileRequest, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.nome = req.nome
    current_user.email = req.email
    current_user.telefone = req.telefone
    
    modelo = req.veiculo_modelo if req.veiculo_modelo is not None else req.veículo_modelo
    if modelo is not None:
        current_user.veiculo_modelo = modelo
        
    bateria = req.veiculo_bateria_kwh if req.veiculo_bateria_kwh is not None else req.veículo_bateria_kwh
    if bateria is not None:
        current_user.veiculo_bateria_kwh = bateria

    db.commit()
    return {
        "message": "Profile updated",
        "nome": current_user.nome,
        "veiculo_modelo": current_user.veiculo_modelo,
        "veiculo_bateria_kwh": current_user.veiculo_bateria_kwh
    }

from datetime import datetime

class CriarReservaRequest(BaseModel):
    id_carregador: int
    dt_inicio_agendado: datetime
    dt_fim_agendado: datetime

@app.get("/api/reservations")
def get_reservations(
    id_carregador: Optional[int] = None,
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    from challenge_goodwe.infrastructure.orm import ReservaCarregador, Usuario, Unidade
    
    query = db.query(
        ReservaCarregador,
        Usuario.nome.label("usuario_nome"),
        Usuario.telefone.label("usuario_telefone"),
        Unidade.cd_unidade.label("unidade_cd")
    ).outerjoin(Usuario, Usuario.id_usuario == ReservaCarregador.id_usuario)\
     .outerjoin(Unidade, Unidade.id_unidade == ReservaCarregador.id_unidade)
    
    if current_user.role != "ADMIN":
        query = query.filter(ReservaCarregador.id_usuario == current_user.id_usuario)
    elif id_carregador is not None:
        query = query.filter(ReservaCarregador.id_carregador == id_carregador)
        
    results = query.order_by(ReservaCarregador.dt_inicio_agendado.asc()).all()
    
    lista = []
    for r, nome, tel, cd_unidade in results:
        lista.append({
            "id_reserva": r.id_reserva,
            "id_carregador": r.id_carregador,
            "id_usuario": r.id_usuario,
            "id_unidade": r.id_unidade,
            "usuario_nome": nome,
            "usuario_telefone": tel,
            "unidade_cd": cd_unidade,
            "dt_inicio_agendado": r.dt_inicio_agendado.isoformat() if r.dt_inicio_agendado else None,
            "dt_fim_agendado": r.dt_fim_agendado.isoformat() if r.dt_fim_agendado else None,
            "status_reserva": r.status_reserva,
            "criado_em": r.criado_em.isoformat() if r.criado_em else None,
        })
    return lista

@app.post("/api/reservations")
def create_reservation(req: CriarReservaRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    from challenge_goodwe.infrastructure.orm import ReservaCarregador
    
    # Validar se o horário já passou
    agora = datetime.now()
    dt_inicio = req.dt_inicio_agendado.replace(tzinfo=None) if req.dt_inicio_agendado.tzinfo else req.dt_inicio_agendado
    if dt_inicio < agora:
        raise HTTPException(status_code=400, detail="Não é permitido agendar reservas para horários passados")

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

@app.patch("/api/reservations/{id_reserva}/cancel")
@app.delete("/api/reservations/{id_reserva}")
def cancel_reservation(id_reserva: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    from challenge_goodwe.infrastructure.orm import ReservaCarregador
    
    reserva = db.query(ReservaCarregador).filter(ReservaCarregador.id_reserva == id_reserva).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
        
    if current_user.role != "ADMIN" and reserva.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar esta reserva")
        
    reserva.status_reserva = "cancelada"
    db.commit()
    return {"message": "Reserva cancelada com sucesso", "id_reserva": id_reserva, "status_reserva": "cancelada"}
