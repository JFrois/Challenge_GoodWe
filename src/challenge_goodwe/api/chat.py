import json
import logging
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google import genai
from dotenv import load_dotenv

from challenge_goodwe.infrastructure.database import get_db
from challenge_goodwe.infrastructure.orm import (
    Usuario,
    Fatura,
    Alerta,
    Carregador,
    ReservaCarregador,
    Unidade,
)
from challenge_goodwe.api.dependencies import get_current_user

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


def get_gemini_client() -> Optional[genai.Client]:
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Erro ao inicializar Gemini Client: {e}")
        return None


class ChatAction(BaseModel):
    label: str
    path: str


class ChatHistoryItem(BaseModel):
    sender: str
    text: str


class ChatMessage(BaseModel):
    message: str
    history: Optional[List[ChatHistoryItem]] = None


class ChatResponse(BaseModel):
    reply: str
    actions: Optional[List[ChatAction]] = None


def extract_actions_by_intent(user_msg: str, reply_text: str, role: str) -> List[ChatAction]:
    combined = f"{user_msg} {reply_text}".lower()
    actions: List[ChatAction] = []
    if role == "ADMIN":
        if any(w in combined for w in ["reserva", "agend", "manuten", "opera", "carregador", "bloque", "status", "sess"]):
            actions.append(ChatAction(label="Operações e Carregadores", path="/admin/operations"))
        if any(w in combined for w in ["fatura", "pago", "receb", "inadimpl", "cobranca", "financeiro", "rateio", "dinheiro"]):
            actions.append(ChatAction(label="Gestão Financeira", path="/admin/billing"))
        if any(w in combined for w in ["rede", "visao geral", "resumo", "alerta", "indicador", "metric"]):
            actions.append(ChatAction(label="Painel Geral", path="/admin/overview"))
        if any(w in combined for w in ["morador", "usuario", "cadastro", "apartamento", "unidade"]):
            actions.append(ChatAction(label="Gerenciar Moradores", path="/admin/residents"))
    else:
        if any(w in combined for w in ["reserva", "agend", "horario", "cancel", "slot"]):
            actions.append(ChatAction(label="Minhas Reservas", path="/resident/bookings"))
        if any(w in combined for w in ["carregador", "vaga", "ponto", "livre", "ocupad", "disponiv"]):
            actions.append(ChatAction(label="Encontrar Carregador", path="/resident/chargers"))
        if any(w in combined for w in ["consumo", "gastei", "fatura", "kwh", "conta", "valor", "pag"]):
            actions.append(ChatAction(label="Meu Consumo e Faturas", path="/resident/usage"))
        if any(w in combined for w in ["carro", "veiculo", "bateria", "modelo", "perfil", "cadastro"]):
            actions.append(ChatAction(label="Meu Perfil e Veículo", path="/resident/profile"))

    seen = set()
    unique: List[ChatAction] = []
    for a in actions:
        if a.path not in seen:
            seen.add(a.path)
            unique.append(a)
    return unique[:3]


@router.post("", response_model=ChatResponse)
def ask_assistant(
    req: ChatMessage,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    client = get_gemini_client()
    if not client:
        raise HTTPException(
            status_code=503,
            detail="IA indisponível. A chave GEMINI_API_KEY não foi configurada no arquivo .env.",
        )

    # Formatar histórico recente da conversa (se houver)
    history_text = ""
    if req.history:
        recent = req.history[-4:]
        lines = []
        for h in recent:
            author = "Usuário" if h.sender == "user" else "Assistente"
            lines.append(f"{author}: {h.text}")
        if lines:
            history_text = "\n[HISTÓRICO RECENTE DA CONVERSA]\n" + "\n".join(lines) + "\n"

    if current_user.role == "ADMIN":
        # 1. Carregadores da rede
        carregadores = db.query(Carregador).all()
        chargers_info = []
        for c in carregadores:
            nome = c.fabricante_modelo or f"Carregador {c.id_carregador}"
            loc = c.localizacao or "Garagem"
            chargers_info.append(
                f"- {nome} (ID {c.id_carregador}): {loc}, Potência {c.potencia_nominal_kw} kW, Estado: {c.estado_operacional}"
            )
        chargers_text = "\n".join(chargers_info) if chargers_info else "Nenhum ponto cadastrado."

        # 2. Alertas em aberto
        alertas = (
            db.query(Alerta)
            .filter(Alerta.resolvido == False)
            .order_by(Alerta.criado_em.desc())
            .limit(5)
            .all()
        )
        alertas_info = []
        for a in alertas:
            tipo_alerta = getattr(a, "tipo", "ALERTA")
            msg_alerta = getattr(a, "mensagem", "Alerta do sistema")
            sev = getattr(a, "severidade", "média")
            alertas_info.append(
                f"- [{tipo_alerta.upper()}] Severidade: {sev} | {msg_alerta}"
            )
        alertas_text = "\n".join(alertas_info) if alertas_info else "Nenhum alerta em aberto. Rede 100% saudável."

        # 3. Faturamento
        faturas_pendentes = (
            db.query(Fatura)
            .filter(Fatura.status_pgto.in_(["pendente", "vencido"]))
            .all()
        )
        total_pendente = sum(f.valor_total_centavos for f in faturas_pendentes) / 100
        faturas_pagas = (
            db.query(Fatura)
            .filter(Fatura.status_pgto == "pago")
            .all()
        )
        total_pago = sum(f.valor_total_centavos for f in faturas_pagas) / 100

        # 4. Próximos agendamentos
        reservas = (
            db.query(
                ReservaCarregador,
                Usuario.nome.label("usuario_nome"),
                Unidade.cd_unidade.label("unidade_cd"),
            )
            .outerjoin(Usuario, Usuario.id_usuario == ReservaCarregador.id_usuario)
            .outerjoin(Unidade, Unidade.id_unidade == ReservaCarregador.id_unidade)
            .filter(ReservaCarregador.status_reserva.in_(["pendente", "confirmada"]))
            .order_by(ReservaCarregador.dt_inicio_agendado.asc())
            .limit(5)
            .all()
        )
        reservas_info = []
        for r, u_nome, u_unidade in reservas:
            dt_str = (
                r.dt_inicio_agendado.strftime("%d/%m/%Y %H:%M")
                if r.dt_inicio_agendado
                else ""
            )
            reservas_info.append(
                f"- Ponto {r.id_carregador} às {dt_str} | Morador: {u_nome or 'Residente'} ({u_unidade or ''})"
            )
        reservas_text = "\n".join(reservas_info) if reservas_info else "Nenhum agendamento futuro ativo."

        prompt = f"""
Você é o assistente virtual do Administrador / Síndico da plataforma EV ChargeOps de gestão de recargas de veículos elétricos.
Diretrizes:
- Responda em português do Brasil de maneira natural, conversacional, profissional, direta e agradável.
- Interprete a intenção do administrador (ex: consultar reservas, analisar status de carregadores, checar manutenções, inadimplência ou alertas).
- Use os dados reais em tempo real fornecidos no contexto abaixo para fundamentar sua resposta.
- Além de explicar a situação, oriente para qual tela ele pode ir para agir (ex: tela de Operações para manutenções e reservas, tela de Cobranças para pagamentos).
{history_text}
Contexto em tempo real do condomínio:
[PONTOS DE RECARGA MONITORADOS]
{chargers_text}

[ALERTAS DA REDE]
Total de alertas pendentes: {len(alertas)}
{alertas_text}

[COBRANÇAS E FATURAMENTO]
- Faturas pendentes/vencidas: {len(faturas_pendentes)} (Total a receber: R$ {total_pendente:.2f})
- Faturas liquidadas: {len(faturas_pagas)} (Total recebido: R$ {total_pago:.2f})

[PRÓXIMOS AGENDAMENTOS ATIVOS]
{reservas_text}

Pergunta do Administrador: {req.message}
"""
    else:
        # Contexto do Morador
        unidade_obj = current_user.unidades[0] if current_user.unidades else None
        unidade_nome = unidade_obj.cd_unidade if unidade_obj else "Não identificada"
        unidade_id = unidade_obj.id_unidade if unidade_obj else None

        veiculo_info = "Nenhum veículo cadastrado ainda"
        if current_user.veiculo_modelo:
            veiculo_info = f"{current_user.veiculo_modelo} (Bateria: {current_user.veiculo_bateria_kwh or 0} kWh)"

        # Faturas do morador
        faturas_resident = []
        if unidade_id:
            faturas = (
                db.query(Fatura)
                .filter(Fatura.id_unidade == unidade_id)
                .order_by(Fatura.periodo.desc())
                .limit(4)
                .all()
            )
            for f in faturas:
                status_br = "Pago" if f.status_pgto == "pago" else "Pendente"
                faturas_resident.append(
                    f"- Mês {f.periodo}: {float(f.energia_total_kwh):.1f} kWh, R$ {f.valor_total_centavos / 100:.2f} ({status_br})"
                )
        faturas_text = "\n".join(faturas_resident) if faturas_resident else "Nenhuma fatura registrada."

        # Agendamentos do morador
        reservas_user = (
            db.query(ReservaCarregador)
            .filter(ReservaCarregador.id_usuario == current_user.id_usuario)
            .order_by(ReservaCarregador.dt_inicio_agendado.desc())
            .limit(4)
            .all()
        )
        reservas_user_info = []
        for r in reservas_user:
            ini_str = r.dt_inicio_agendado.strftime("%d/%m às %H:%M") if r.dt_inicio_agendado else ""
            status_desc = (
                "Cancelada"
                if r.status_reserva == "cancelada"
                else "Concluída"
                if r.status_reserva == "concluida"
                else "Agendada"
            )
            reservas_user_info.append(f"- Ponto {r.id_carregador} em {ini_str} ({status_desc})")
        reservas_user_text = (
            "\n".join(reservas_user_info)
            if reservas_user_info
            else "Nenhum agendamento ativo no momento."
        )

        # Pontos disponíveis na rede
        carregadores_livres = (
            db.query(Carregador).filter(Carregador.estado_operacional == "online").all()
        )
        livres_info = [
            f"- {c.fabricante_modelo or f'Ponto {c.id_carregador}'}: {c.potencia_nominal_kw} kW ({c.localizacao or 'Garagem'})"
            for c in carregadores_livres
        ]
        livres_text = (
            "\n".join(livres_info)
            if livres_info
            else "Nenhum ponto livre ou operacional no momento."
        )

        prompt = f"""
Você é o assistente virtual do morador {current_user.nome} (Unidade {unidade_nome}) na plataforma EV ChargeOps.
Diretrizes:
- Responda em português do Brasil de maneira natural, orgânica, amigável e atenciosa.
- Compreenda com facilidade o que o morador quer (ex: se ele perguntar 'Reservas' ou 'Analisar as reservas', verifique os agendamentos dele e explique que ele pode gerenciar ou agendar na aba Reservas).
- Use os dados reais do contexto abaixo para responder perguntas sobre veículo, consumo, pontos livres e faturas.
- Se o morador perguntar como cancelar uma reserva: oriente que na aba "Reservas" ele pode localizar seu agendamento e cancelar.
- Se perguntar sobre vagas livres: informe quais pontos estão livres no momento.
{history_text}
Contexto do Morador:
- Morador: {current_user.nome}
- Unidade: {unidade_nome}
- Veículo cadastrado: {veiculo_info}

[HISTÓRICO DE CONSUMO E FATURAS DO MORADOR]
{faturas_text}

[AGENDAMENTOS DE RECARGA DO MORADOR]
{reservas_user_text}

[PONTOS DISPONÍVEIS NA REDE HOJE]
{livres_text}

Pergunta do Morador: {req.message}
"""

    models_to_try = [
        os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
        "gemini-3.5-flash",
        "gemini-3.7-flash",
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
        "gemini-pro-latest",
        "gemini-flash-latest",
    ]
    seen = set()
    unique_models = [m for m in models_to_try if not (m in seen or seen.add(m))]

    response = None
    last_error = None
    for model_name in unique_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                break
        except Exception as e:
            last_error = e
            logger.warning(f"Erro ao gerar conteúdo com modelo {model_name}: {e}")

    if not response or not response.text:
        logger.error(f"Falha ao chamar Gemini: {last_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao contatar o assistente Gemini: {last_error}",
        )

    reply_content = response.text.strip()
    actions = extract_actions_by_intent(req.message, reply_content, current_user.role)

    return {"reply": reply_content, "actions": actions}
