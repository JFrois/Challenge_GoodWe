from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    Numeric,
    String,
    Table,
    Text,
    func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


unidade_usuario = Table(
    "Unidade_Usuario",
    Base.metadata,
    Column("id_unidade", Integer, ForeignKey("Unidade.id_unidade"), primary_key=True),
    Column("id_usuario", Integer, ForeignKey("Usuario.id_usuario"), primary_key=True),
)


class Configuracao(Base):
    __tablename__ = "Configuracao"

    chave: Mapped[str] = mapped_column(String, primary_key=True)
    valor: Mapped[str] = mapped_column(Text)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Unidade(Base):
    __tablename__ = "Unidade"

    id_unidade: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_condominio: Mapped[int] = mapped_column(Integer, nullable=False)
    cd_unidade: Mapped[str] = mapped_column(String, nullable=False)
    tipo: Mapped[str] = mapped_column(String, nullable=False, server_default="residencial")
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="ativo")

    usuarios: Mapped[List["Usuario"]] = relationship(
        secondary=unidade_usuario, back_populates="unidades"
    )
    sessoes: Mapped[List["SessaoRecarga"]] = relationship(back_populates="unidade")


class Usuario(Base):
    __tablename__ = "Usuario"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String)
    telefone: Mapped[Optional[str]] = mapped_column(String)
    tipo_vinculo: Mapped[Optional[str]] = mapped_column(String)
    id_rfid: Mapped[Optional[str]] = mapped_column(String)
    id_app: Mapped[Optional[str]] = mapped_column(String)
    
    # Auth & RBAC extensions
    username: Mapped[str] = mapped_column(String, unique=True, nullable=True) # e.g., '101A'
    pin_hash: Mapped[str] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, nullable=False, server_default="MORADOR") # ADMIN | MORADOR
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    
    veiculo_modelo: Mapped[Optional[str]] = mapped_column(String)
    veiculo_bateria_kwh: Mapped[Optional[float]] = mapped_column(Float)

    unidades: Mapped[List["Unidade"]] = relationship(
        secondary=unidade_usuario, back_populates="usuarios"
    )


class Carregador(Base):
    __tablename__ = "Carregador"

    id_carregador: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fabricante_modelo: Mapped[str] = mapped_column(String, nullable=False)
    localizacao: Mapped[str] = mapped_column(String, nullable=False)
    potencia_nominal_kw: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    tipo_conector: Mapped[str] = mapped_column(String)
    id_sems: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    estado_operacional: Mapped[str] = mapped_column(String, server_default="online")


class Tarifa(Base):
    __tablename__ = "Tarifa"

    id_tarifa: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    referencia_mes_ano: Mapped[str] = mapped_column(String, nullable=False) # 'YYYY-MM'
    distribuidora: Mapped[str] = mapped_column(String)
    valor_kwh_centavos: Mapped[int] = mapped_column(Integer)
    bandeira_vigente: Mapped[str] = mapped_column(String)
    adicional_bandeira_centavos: Mapped[int] = mapped_column(Integer, server_default="0")
    taxa_infraestrutura_centavos: Mapped[int] = mapped_column(Integer, server_default="0")


class Fatura(Base):
    __tablename__ = "Fatura"

    id_fatura: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_unidade: Mapped[int] = mapped_column(Integer, ForeignKey("Unidade.id_unidade"), nullable=False)
    id_tarifa: Mapped[int] = mapped_column(Integer, ForeignKey("Tarifa.id_tarifa"), nullable=False)
    periodo: Mapped[str] = mapped_column(String, nullable=False) # 'YYYY-MM'
    politica_rateio: Mapped[str] = mapped_column(String, nullable=False)
    energia_total_kwh: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    qtd_sessoes: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_variavel_centavos: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_taxa_centavos: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_total_centavos: Mapped[int] = mapped_column(Integer, nullable=False)
    status_pgto: Mapped[str] = mapped_column(String, nullable=False, server_default="pendente")
    criada_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    sessoes: Mapped[List["SessaoRecarga"]] = relationship(back_populates="fatura")


class SessaoRecarga(Base):
    __tablename__ = "Sessao_Recarga"

    id_sessao: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_sessao_sems: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    id_carregador: Mapped[int] = mapped_column(Integer, ForeignKey("Carregador.id_carregador"), nullable=False)
    id_usuario: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("Usuario.id_usuario"))
    id_unidade: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("Unidade.id_unidade"))
    id_fatura: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("Fatura.id_fatura"))
    
    dt_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    dt_fim: Mapped[Optional[datetime]] = mapped_column(DateTime)
    energia_kwh: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    potencia_media_kw: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2))
    potencia_max_kw: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2))
    status_final: Mapped[str] = mapped_column(String, nullable=False)
    anomaly_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    is_anomaly: Mapped[bool] = mapped_column(Boolean, server_default="false")
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    unidade: Mapped[Optional["Unidade"]] = relationship(back_populates="sessoes")
    fatura: Mapped[Optional["Fatura"]] = relationship(back_populates="sessoes")


class LeituraMedicao(Base):
    __tablename__ = "Leitura_Medicao"

    id_leitura: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_sessao: Mapped[int] = mapped_column(Integer, ForeignKey("Sessao_Recarga.id_sessao"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    energia_acumulada_kwh: Mapped[Decimal] = mapped_column(Numeric(10, 3))
    potencia_instantanea_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    tensao_v: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    corrente_a: Mapped[Decimal] = mapped_column(Numeric(6, 2))


class Alerta(Base):
    __tablename__ = "Alerta"

    id_alerta: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String, nullable=False)
    id_sessao: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("Sessao_Recarga.id_sessao"))
    id_unidade: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("Unidade.id_unidade"))
    severidade: Mapped[str] = mapped_column(String, nullable=False, server_default="media")
    mensagem: Mapped[str] = mapped_column(Text, nullable=False)
    resolvido: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ReservaCarregador(Base):
    __tablename__ = "Reserva_Carregador"

    id_reserva: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_carregador: Mapped[int] = mapped_column(Integer, ForeignKey("Carregador.id_carregador"), nullable=False)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("Usuario.id_usuario"), nullable=False)
    id_unidade: Mapped[int] = mapped_column(Integer, ForeignKey("Unidade.id_unidade"), nullable=False)
    dt_inicio_agendado: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    dt_fim_agendado: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status_reserva: Mapped[str] = mapped_column(String, nullable=False, server_default="pendente")
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class Auditoria(Base):
    __tablename__ = 'Auditoria'
    id_auditoria: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey('Usuario.id_usuario'), nullable=False)
    acao: Mapped[str] = mapped_column(String, nullable=False)
    detalhes: Mapped[Optional[str]] = mapped_column(String)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

