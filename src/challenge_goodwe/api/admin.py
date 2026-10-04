from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import csv
import io

from challenge_goodwe.infrastructure.database import get_db
from challenge_goodwe.infrastructure.orm import Usuario, Unidade, Configuracao
from challenge_goodwe.auth.security import get_pin_hash
from challenge_goodwe.api.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

from pydantic import BaseModel, ConfigDict

class UsuarioResponse(BaseModel):
    id_usuario: int
    nome: str
    username: Optional[str]
    email: Optional[str]
    telefone: Optional[str]
    ativo: bool
    role: str

    model_config = ConfigDict(from_attributes=True)

class CriarUsuarioRequest(BaseModel):
    nome: str
    email: Optional[str]
    telefone: Optional[str]
    tipo_vinculo: str
    id_rfid: str
    username: str
    pin: str
    role: str = "MORADOR"
    id_unidade: int

@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    usuarios = db.query(Usuario).all()
    return usuarios

@router.post("/usuarios", response_model=UsuarioResponse)
def criar_usuario(req: CriarUsuarioRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    # Check if username exists
    if db.query(Usuario).filter(Usuario.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username já em uso")

    novo_usuario = Usuario(
        nome=req.nome,
        email=req.email,
        telefone=req.telefone,
        tipo_vinculo=req.tipo_vinculo,
        id_rfid=req.id_rfid,
        username=req.username,
        pin_hash=get_pin_hash(req.pin),
        role=req.role,
        ativo=True
    )
    
    unidade = db.query(Unidade).filter(Unidade.id_unidade == req.id_unidade).first()
    if not unidade:
        raise HTTPException(status_code=404, detail="Unidade não encontrada")
        
    novo_usuario.unidades.append(unidade)
    
    db.add(novo_usuario)
    from challenge_goodwe.infrastructure.orm import Auditoria
    db.add(Auditoria(id_usuario=current_user.id_usuario, acao='CREATE_USER', detalhes=f'Criou morador {req.username}'))
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@router.delete("/usuarios/{id_usuario}")
def desativar_usuario(id_usuario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario não encontrado")
    
    # Soft delete
    usuario.ativo = False
    from challenge_goodwe.infrastructure.orm import Auditoria
    db.add(Auditoria(id_usuario=current_user.id_usuario, acao='DEACTIVATE_USER', detalhes=f'Inativou morador {usuario.username}'))
    db.commit()
    return {"message": "Usuario desativado com sucesso"}

@router.post("/usuarios/importar-csv")
def importar_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um CSV")
        
    contents = file.file.read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(contents))
    
    erros = []
    usuarios_para_inserir = []
    
    for row_number, row in enumerate(csv_reader, start=2): # Headers is line 1
        username = row.get("username")
        if not username:
            erros.append({"linha": row_number, "erro": "Coluna 'username' obrigatoria"})
            continue
            
        if db.query(Usuario).filter(Usuario.username == username).first():
            erros.append({"linha": row_number, "erro": f"Username '{username}' ja cadastrado"})
            continue
            
        try:
            unidade_id = int(row.get("id_unidade", 0))
            unidade = db.query(Unidade).filter(Unidade.id_unidade == unidade_id).first()
            if not unidade:
                erros.append({"linha": row_number, "erro": f"Unidade com ID {unidade_id} nao encontrada"})
                continue
        except ValueError:
            erros.append({"linha": row_number, "erro": "id_unidade deve ser numero inteiro"})
            continue

        novo_user = Usuario(
            nome=row.get("nome"),
            email=row.get("email"),
            telefone=row.get("telefone"),
            tipo_vinculo=row.get("tipo_vinculo", "proprietario"),
            id_rfid=row.get("id_rfid", f"TAG_{username}"),
            username=username,
            pin_hash=get_pin_hash(row.get("pin", "123456")),
            role=row.get("role", "MORADOR"),
            ativo=True
        )
        novo_user.unidades.append(unidade)
        usuarios_para_inserir.append(novo_user)
        
    if erros:
        # Se houver erro, rejeita o lote inteiro (all-or-nothing)
        return {"sucesso": False, "mensagem": "Foram encontrados erros na validacao. Lote rejeitado.", "erros": erros}
        
    try:
        db.add_all(usuarios_para_inserir)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao importar CSV: {str(e)}")
        
    return {"sucesso": True, "mensagem": f"{len(usuarios_para_inserir)} usuarios importados com sucesso"}

@router.get("/usuarios/exportar")
def exportar_excel(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    import pandas as pd
    from fastapi.responses import StreamingResponse
    import io
    
    usuarios = db.query(Usuario).all()
    data = []
    for u in usuarios:
        unidade_nome = u.unidades[0].cd_unidade if u.unidades else "N/A"
        data.append({
            "ID": u.id_usuario,
            "Nome": u.nome,
            "E-mail": u.email,
            "Telefone": u.telefone,
            "Unidade": unidade_nome,
            "Username": u.username,
            "Status": "Ativo" if u.ativo else "Inativo",
            "Veículo Modelo": u.veiculo_modelo,
            "Veículo Bateria (kWh)": u.veiculo_bateria_kwh
        })
        
    df = pd.DataFrame(data)
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Moradores")
    
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=moradores.xlsx"}
    )

class ConfigResponse(BaseModel):
    chave: str
    valor: str

@router.get("/configuracoes", response_model=List[ConfigResponse])
def listar_configuracoes(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return db.query(Configuracao).all()

@router.post("/configuracoes")
def salvar_configuracao(req: ConfigResponse, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    config = db.query(Configuracao).filter(Configuracao.chave == req.chave).first()
    if config:
        config.valor = req.valor
    else:
        config = Configuracao(chave=req.chave, valor=req.valor)
        db.add(config)
    db.commit()
    return {"message": "Configuração salva com sucesso"}


class CarregadorCreate(BaseModel):
    fabricante_modelo: str
    localizacao: str
    potencia_nominal_kw: float
    tipo_conector: str
    id_sems: str

@router.post("/carregadores")
def create_carregador(req: CarregadorCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    from challenge_goodwe.infrastructure.orm import Carregador
    novo = Carregador(
        fabricante_modelo=req.fabricante_modelo,
        localizacao=req.localizacao,
        potencia_nominal_kw=req.potencia_nominal_kw,
        tipo_conector=req.tipo_conector,
        id_sems=req.id_sems,
        estado_operacional="online"
    )
    db.add(novo)
    db.commit()
    return {"message": "Carregador criado com sucesso"}

@router.put("/carregadores/{id_carregador}")
def update_carregador(id_carregador: int, req: CarregadorCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    from challenge_goodwe.infrastructure.orm import Carregador
    carregador = db.query(Carregador).filter(Carregador.id_carregador == id_carregador).first()
    if not carregador:
        raise HTTPException(status_code=404, detail="Carregador não encontrado")
    
    carregador.fabricante_modelo = req.fabricante_modelo
    carregador.localizacao = req.localizacao
    carregador.potencia_nominal_kw = req.potencia_nominal_kw
    carregador.tipo_conector = req.tipo_conector
    carregador.id_sems = req.id_sems
    
    db.commit()
    return {"message": "Carregador atualizado com sucesso"}

from sqlalchemy.exc import IntegrityError

@router.delete("/carregadores/{id_carregador}")
def delete_carregador(id_carregador: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    from challenge_goodwe.infrastructure.orm import Carregador
    carregador = db.query(Carregador).filter(Carregador.id_carregador == id_carregador).first()
    if not carregador:
        raise HTTPException(status_code=404, detail="Carregador não encontrado")
    
    try:
        db.delete(carregador)
        db.commit()
        return {"message": "Carregador excluído com sucesso"}
    except IntegrityError:
        db.rollback()
        # Fallback to Soft Delete if there are foreign keys
        carregador.estado_operacional = "offline"
        db.commit()
        return {"message": "Carregador possui histórico. Status alterado para Offline em vez de exclusão."}


class CarregadorStatusUpdate(BaseModel):
    status: str

@router.put("/carregadores/{id_carregador}/status")
def update_carregador_status(id_carregador: int, req: CarregadorStatusUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    from challenge_goodwe.infrastructure.orm import Carregador
    carregador = db.query(Carregador).filter(Carregador.id_carregador == id_carregador).first()
    if not carregador:
        raise HTTPException(status_code=404, detail="Carregador não encontrado")
    
    carregador.estado_operacional = req.status
    db.commit()
    return {"message": "Status do carregador atualizado"}

@router.put("/faturas/{id_fatura}/pago")
def update_fatura_pago(id_fatura: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    from challenge_goodwe.infrastructure.orm import Fatura
    fatura = db.query(Fatura).filter(Fatura.id_fatura == id_fatura).first()
    if not fatura:
        raise HTTPException(status_code=404, detail="Fatura não encontrada")
    
    fatura.status_pgto = "pago"
    db.commit()
    return {"message": "Fatura marcada como paga"}

@router.post("/usuarios/{id_usuario}/reativar")
def reativar_usuario(id_usuario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario nǜo encontrado")
    
    usuario.ativo = True
    from challenge_goodwe.infrastructure.orm import Auditoria
    db.add(Auditoria(id_usuario=current_user.id_usuario, acao='ACTIVATE_USER', detalhes=f'Reativou morador {usuario.username}'))
    db.commit()
    return {"message": "Usuário reativado"}
