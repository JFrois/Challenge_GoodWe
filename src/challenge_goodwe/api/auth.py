from datetime import timedelta, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import re

from challenge_goodwe.auth.security import verify_pin, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from challenge_goodwe.infrastructure.database import get_db
from challenge_goodwe.infrastructure.orm import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])

# Rate limit in memory: username -> (tentativas, last_attempt_time)
failed_attempts = {}
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 5

class LoginRequest(BaseModel):
    username: str = Field(..., pattern=r"^[A-Za-z0-9_]{2,50}$", description="Identificador do usuário/unidade (ex: 42B ou admin)")
    pin: str = Field(..., pattern=r"^\d{6}$")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    nome: Optional[str] = None

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    from sqlalchemy import func
    now = datetime.now()
    
    # Check rate limit
    clean_username = req.username.strip()
    if clean_username in failed_attempts:
        attempts, last_time = failed_attempts[clean_username]
        if attempts >= MAX_ATTEMPTS:
            if now < last_time + timedelta(minutes=LOCKOUT_MINUTES):
                raise HTTPException(status_code=429, detail="Muitas tentativas falhas. Tente novamente mais tarde.")
            else:
                # Reset after lockout
                failed_attempts.pop(clean_username, None)
                
    user = db.query(Usuario).filter(func.lower(Usuario.username) == func.lower(clean_username)).first()
    
    if not user or not user.pin_hash or not verify_pin(req.pin, user.pin_hash):
        # Register fail
        attempts, _ = failed_attempts.get(req.username, (0, now))
        failed_attempts[req.username] = (attempts + 1, now)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario ou PIN incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Reset fails on success
    failed_attempts.pop(req.username, None)
        
    if not user.ativo:
        raise HTTPException(status_code=400, detail="Usuario inativo")

    # Extract unidade if exists
    unidade_id = None
    if user.unidades:
        unidade_id = user.unidades[0].id_unidade

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "uid": user.id_usuario,
            "unidade_id": unidade_id
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "nome": user.nome
    }
