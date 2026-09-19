"""Adaptador da fonte de sessoes de recarga (GoodWe SEMS).

O projeto nao tem credencial de conta organizacional SEMS, entao a ingestao
roda contra um mock. A ausencia de credencial, porem, nao e motivo para
ausencia de arquitetura: `FonteDeSessoes` e o contrato, e ha duas
implementacoes. Trocar mock por API real e trocar uma linha no main.

O formato de SessaoBruta reproduz o payload documentado na Sprint 01
(GET /v2/EVCharger/GetSessionDetail).
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Protocol, runtime_checkable

from ..config import CAMINHO_MOCK_SEMS

logger = logging.getLogger(__name__)

_FORMATOS = ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S")


def _parse_data(texto: str) -> datetime:
    for formato in _FORMATOS:
        try:
            return datetime.strptime(texto, formato)
        except ValueError:
            continue
    raise ValueError(f"Timestamp em formato nao reconhecido: {texto!r}")


@dataclass(frozen=True, slots=True)
class SessaoBruta:
    """Payload de uma sessao como chega da GoodWe, antes de ser atribuida."""

    session_id: str
    device_id: str
    user_rfid: str
    start_time: datetime
    end_time: datetime | None
    energy_delivered_kwh: Decimal
    avg_power_kw: Decimal | None
    max_power_kw: Decimal | None
    status: str
    leituras: tuple[dict, ...] = ()

    @classmethod
    def de_json(cls, dados: dict) -> "SessaoBruta":
        return cls(
            session_id=dados["session_id"],
            device_id=dados["device_id"],
            user_rfid=dados["user_rfid"],
            start_time=_parse_data(dados["start_time"]),
            end_time=_parse_data(dados["end_time"]) if dados.get("end_time") else None,
            energy_delivered_kwh=Decimal(str(dados["energy_delivered_kwh"])),
            avg_power_kw=Decimal(str(dados["avg_power_kw"]))
            if dados.get("avg_power_kw") is not None
            else None,
            max_power_kw=Decimal(str(dados["max_power_kw"]))
            if dados.get("max_power_kw") is not None
            else None,
            status=dados.get("status", "concluida"),
            leituras=tuple(dados.get("leituras", ())),
        )


@runtime_checkable
class FonteDeSessoes(Protocol):
    """Contrato de qualquer origem de sessoes de recarga."""

    nome: str

    def buscar_sessoes(self, desde: datetime | None = None) -> list[SessaoBruta]: ...


class MockSemsClient:
    """Le sessoes de um arquivo JSON no formato da API SEMS.

    Usado para desenvolvimento e para as evidencias da Sprint 02.
    """

    nome = "mock_sems"

    def __init__(self, caminho: Path | None = None) -> None:
        self.caminho = Path(caminho or CAMINHO_MOCK_SEMS)

    def buscar_sessoes(self, desde: datetime | None = None) -> list[SessaoBruta]:
        if not self.caminho.is_file():
            logger.warning("Arquivo de mock ausente: %s", self.caminho)
            return []
        dados = json.loads(self.caminho.read_text(encoding="utf-8"))
        sessoes = [SessaoBruta.de_json(item) for item in dados]
        if desde is not None:
            sessoes = [s for s in sessoes if s.start_time >= desde]
        logger.info("Mock SEMS devolveu %d sessao(oes) de %s", len(sessoes), self.caminho)
        return sessoes


class SemsApiClient:
    """Cliente HTTP da API SEMS Portal.

    Fluxo documentado na Sprint 01:
      1. POST /api/v1/Common/CrossLogin  -> token JWT
      2. GET  /v2/EVCharger/GetSessionDetail com o token no header

    Nao implementado: a Open API exige conta organizacional SEMS, que a equipe
    nao possui. A classe existe para fixar o contrato e o ponto de extensao.
    """

    nome = "sems_api"
    BASE_URL = "https://www.semsportal.com"

    def __init__(self, usuario: str, senha: str, station_id: str) -> None:
        self.usuario = usuario
        self.senha = senha
        self.station_id = station_id

    def buscar_sessoes(self, desde: datetime | None = None) -> list[SessaoBruta]:
        raise NotImplementedError(
            "Integracao com a API SEMS pendente de credencial de conta "
            "organizacional GoodWe. Use MockSemsClient enquanto isso."
        )
