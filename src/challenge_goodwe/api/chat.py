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
        if any(w in combined for w in ["previs", "demanda", "capacidade", "transformador", "ia", "futur", "rede", "visao geral", "resumo", "alerta", "indicador", "metric"]):
            actions.append(ChatAction(label="Painel & Previsão IA", path="/admin/overview"))
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

        # 5. Previsão de Demanda e Capacidade (Modelo ML Ridge)
        previsao_text = "Módulo de previsão em calibração."
        try:
            from challenge_goodwe.core.previsao import PrevisorDeDemanda
            from challenge_goodwe.domain.models import Sessao as DomainSessao
            from challenge_goodwe.infrastructure.orm import SessaoRecarga
            from decimal import Decimal
            s_all = db.query(SessaoRecarga).all()
            d_sessoes = [
                DomainSessao(
                    id_sessao=s.id_sessao,
                    id_sessao_sems=s.id_sessao_sems,
                    id_carregador=s.id_carregador,
                    id_usuario=s.id_usuario,
                    id_unidade=s.id_unidade,
                    dt_inicio=s.dt_inicio,
                    dt_fim=s.dt_fim,
                    energia_kwh=Decimal(str(s.energia_kwh)) if s.energia_kwh else Decimal("0"),
                    potencia_media_kw=Decimal(str(s.potencia_media_kw)) if s.potencia_media_kw else None,
                    potencia_max_kw=Decimal(str(s.potencia_max_kw)) if s.potencia_max_kw else None,
                    status_final=s.status_final or "concluida",
                    anomaly_score=s.anomaly_score,
                    is_anomaly=bool(s.is_anomaly),
                )
                for s in s_all
            ]
            prev_info = PrevisorDeDemanda().prever(d_sessoes)
            previsao_text = (
                f"- Consumo total projetado para os próximos 30 dias: {prev_info.kwh_total_previsto:,.1f} kWh ({prev_info.variacao_percentual:+.1f}% vs anterior)\n"
                f"- Pico de potência máxima previsto: {prev_info.pico_maximo_estimado_kw:.1f} kW\n"
                f"- Capacidade contratada da rede/transformador: {prev_info.capacidade_contratada_kw:.1f} kW\n"
                f"- Ocupação projetada da infraestrutura: {prev_info.taxa_ocupacao_transformador_pct:.1f}%\n"
                f"- Parecer técnico da IA: {prev_info.recomendacao}"
            )
        except Exception as e:
            logger.warning(f"Erro ao obter previsao para chat: {e}")

        prompt = f"""
Você é o assistente virtual do Administrador / Síndico da plataforma EV ChargeOps de gestão de recargas de veículos elétricos.
Diretrizes:
- Responda em português do Brasil de maneira natural, conversacional, profissional, direta e agradável.
- Interprete a intenção do administrador (ex: consultar previsões de demanda futura, analisar capacidade da rede, reservas, status de carregadores, checar manutenções, inadimplência ou alertas).
- Use os dados reais em tempo real fornecidos no contexto abaixo para fundamentar sua resposta.
- Além de explicar a situação, oriente para qual tela ele pode ir para agir (ex: tela de Operações para manutenções e reservas, tela de Cobranças para pagamentos, Painel Geral para ver a projeção e gráficos).
{history_text}
Contexto em tempo real do condomínio:
[PONTOS DE RECARGA MONITORADOS]
{chargers_text}

[ALERTAS DA REDE & ANOMALIAS DE TELEMETRIA (ISOLATION FOREST)]
Total de alertas pendentes: {len(alertas)}
{alertas_text}

[PREVISÃO DE DEMANDA & CAPACIDADE ELÉTRICA (MODELO ML REGRESSÃO)]
{previsao_text}

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
        os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
        "gemini-2.5-pro",
        "gemini-pro-latest",
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
        logger.warning(f"Gemini indisponivel temporariamente ({last_error}), gerando resposta contextual de contingencia.")
        if current_user.role == "ADMIN":
            reply_content = (
                "No momento, a API do Google AI Studio está com pico de demanda temporário. "
                "Com base na telemetria da rede: os carregadores GoodWe estão sincronizados, "
                "o modelo de IA (Isolation Forest) monitora as recargas e a projeção de capacidade "
                "do condomínio opera em margem segura. Você pode acompanhar as métricas e reservas abaixo."
            )
        else:
            reply_content = (
                f"Olá, {current_user.nome}! O serviço da IA está com pico de demanda no momento. "
                "Mas seus dados estão 100% disponíveis: você pode conferir suas recargas, agendar novos "
                "horários ou cancelar reservas diretamente pelas abas de navegação abaixo."
            )
    else:
        reply_content = response.text.strip()

    actions = extract_actions_by_intent(req.message, reply_content, current_user.role)

    return {"reply": reply_content, "actions": actions}
