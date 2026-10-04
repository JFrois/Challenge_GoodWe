import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google import genai
import os

from challenge_goodwe.infrastructure.database import get_db
from challenge_goodwe.infrastructure.orm import Usuario, Fatura, SessaoRecarga, Alerta
from challenge_goodwe.api.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

# Set up Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key) if api_key else None

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("", response_model=ChatResponse)
def ask_assistant(req: ChatMessage, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if not client:
        raise HTTPException(status_code=503, detail="IA indisponível. A chave da API não foi configurada.")

    
    
    if current_user.role == "ADMIN":
        # Admin Context: Extract global metrics to inject
        total_alertas = db.query(Alerta).filter(Alerta.resolvido == False).count()
        faturas = db.query(Fatura).filter(Fatura.status_pgto == "pendente").all()
        total_receber = sum(f.valor_total_centavos for f in faturas) / 100
        
        prompt = f"""
        Você é o assistente virtual do Administrador/Síndico da plataforma EV ChargeOps.
        Regras (LGPD e Segurança):
        - Você NÃO tem acesso ao banco de dados. Responda apenas com base no contexto abaixo.
        - Não revele senhas ou dados sensíveis de moradores.

        Contexto atual do condomínio:
        - Alertas em aberto: {total_alertas}
        - Faturas pendentes de recebimento: {len(faturas)}
        - Valor total a receber: R$ {total_receber:.2f}

        O administrador pergunta: {req.message}
        """
    else:
        # Resident Context: Extract ONLY their own data
        unidade_id = current_user.unidades[0].id_unidade if current_user.unidades else None
        
        if not unidade_id:
            prompt = f"Você é o assistente do EV ChargeOps. O usuário {current_user.nome} perguntou: {req.message}. Diga que ele não tem unidade vinculada."
        else:
            faturas = db.query(Fatura).filter(Fatura.id_unidade == unidade_id).order_by(Fatura.criada_em.desc()).limit(3).all()
            gastos = [f"Mês {f.periodo}: R$ {f.valor_total_centavos / 100:.2f}" for f in faturas]
            
            prompt = f"""
            Você é o assistente virtual do morador {current_user.nome} na plataforma EV ChargeOps.
            Regras (LGPD e Segurança):
            - Responda de forma educada e concisa.
            - O morador tem acesso apenas aos seus próprios dados.

            Contexto do morador (Últimas faturas):
            {json.dumps(gastos)}

            O morador pergunta: {req.message}
            """

    try:
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao contatar o assistente de IA.")
