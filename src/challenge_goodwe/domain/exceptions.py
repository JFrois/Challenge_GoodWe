"""Excecoes de dominio.

Erros de negocio precisam de nome proprio. Um IndexError vazando de um
.iloc[0] nao diz nada a quem le o log as 3 da manha.
"""

from __future__ import annotations


class EVChargeOpsError(Exception):
    """Excecao base do dominio."""


class TarifaNaoEncontradaError(EVChargeOpsError):
    def __init__(self, periodo: str) -> None:
        super().__init__(
            f"Nao ha tarifa cadastrada para o periodo {periodo}. "
            "Cadastre a tarifa da distribuidora antes de fechar o ciclo."
        )
        self.periodo = periodo


class PeriodoInvalidoError(EVChargeOpsError):
    def __init__(self, periodo: str) -> None:
        super().__init__(f"Periodo invalido: {periodo!r}. Formato esperado: 'YYYY-MM'.")
        self.periodo = periodo


class FaturaJaFechadaError(EVChargeOpsError):
    def __init__(self, periodo: str, quantidade: int) -> None:
        super().__init__(
            f"O periodo {periodo} ja possui {quantidade} fatura(s) gerada(s). "
            "Use --refazer para reabrir o ciclo."
        )
        self.periodo = periodo


class RfidNaoCadastradoError(EVChargeOpsError):
    def __init__(self, rfid: str) -> None:
        super().__init__(
            f"A tag RFID {rfid!r} nao esta associada a nenhum usuario. "
            "Sessao descartada da ingestao."
        )
        self.rfid = rfid


class SchemaNaoEncontradoError(EVChargeOpsError):
    def __init__(self, caminho) -> None:
        super().__init__(f"Script de schema nao encontrado em: {caminho}")
        self.caminho = caminho
