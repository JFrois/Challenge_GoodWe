from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session

from challenge_goodwe.auth.security import SECRET_KEY, ALGORITHM
from challenge_goodwe.infrastructure.database import get_db
from challenge_goodwe.infrastructure.orm import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nao foi possivel validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(Usuario).filter(Usuario.username == username).first()
    if user is None:
        raise credentials_exception
    if not user.ativo:
        raise HTTPException(status_code=400, detail="Usuario inativo")
    return user

def require_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operacao permitida apenas para administradores"
        )
    return current_user

def require_resident(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    # Admin can access resident routes if needed, or strictly resident. 
    # Usually ADMIN has superset permissions.
    if current_user.role not in ["ADMIN", "MORADOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operacao permitida apenas para moradores"
        )
    return current_user
