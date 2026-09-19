"""Motor de faturamento — o fluxo central da solucao.

Fecha o ciclo de um periodo:
  sessoes -> avaliacao de IA -> agregacao por unidade -> politica de rateio
          -> fatura persistida -> vinculo das sessoes -> alertas

A versao anterior calculava as faturas e devolvia uma lista de dicionarios que
ninguem gravava. Aqui a fatura e escrita, as sessoes sao vinculadas a ela e
tudo acontece dentro de uma transacao.
"""

from __future__ import annotations

import logging
import sqlite3
from dataclasses import dataclass, field, replace
from decimal import Decimal

from ..config import (
    DEMANDA_CONTRATADA_KWH_MES,
    ENERGIA_MINIMA_FATURAVEL_KWH,
    LIMIAR_ALERTA_CAPACIDADE,
)
from ..domain.avaliacao import AvaliadorDeSessao, AvaliadorNulo
from ..domain.exceptions import FaturaJaFechadaError
from ..domain.models import Alerta, Fatura, formatar_brl, validar_periodo
from ..domain.rateio import PoliticaRateio, obter_politica
from ..infrastructure.repositories import (
    AlertaRepository,
    FaturaRepository,
    SessaoRepository,
    TarifaRepository,
)

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ResultadoFechamento:
    periodo: str
    politica: str
    faturas: list[Fatura] = field(default_factory=list)
    unidades_sem_cobranca: list[int] = field(default_factory=list)
    sessoes_avaliadas: int = 0
    anomalias: int = 0
    alertas: list[str] = field(default_factory=list)

    @property
    def energia_total_kwh(self) -> Decimal:
        return sum((f.energia_total_kwh for f in self.faturas), Decimal("0"))

    @property
    def receita_total_centavos(self) -> int:
        return sum(f.valor_total_centavos for f in self.faturas)

    def resumo(self) -> str:
        return (
            f"Periodo {self.periodo} | politica '{self.politica}' | "
            f"{len(self.faturas)} fatura(s) | {self.energia_total_kwh} kWh | "
            f"{formatar_brl(self.receita_total_centavos)} | "
            f"{self.anomalias} anomalia(s) em {self.sessoes_avaliadas} sessao(oes)"
        )


class MotorDeFaturamento:
    """Orquestra o fechamento de um ciclo de faturamento.

    Recebe politica de rateio e avaliador de IA por injecao. Nenhum dos dois e
    instanciado aqui dentro: trocar o modelo de cobranca ou plugar o Isolation
    Forest nao exige alterar esta classe.
    """

    def __init__(
        self,
        conexao: sqlite3.Connection,
        politica: PoliticaRateio | None = None,
        avaliador: AvaliadorDeSessao | None = None,
    ) -> None:
        self._conn = conexao
        self._politica = politica or obter_politica()
        self._avaliador = avaliador or AvaliadorNulo()
        self._sessoes = SessaoRepository(conexao)
        self._faturas = FaturaRepository(conexao)
        self._tarifas = TarifaRepository(conexao)
        self._alertas = AlertaRepository(conexao)

    # ------------------------------------------------------------------ #

    def fechar_periodo(
        self, periodo: str, refazer: bool = False
    ) -> ResultadoFechamento:
        validar_periodo(periodo)

        existentes = self._faturas.contar_do_periodo(periodo)
        if existentes and not refazer:
            raise FaturaJaFechadaError(periodo, existentes)
        if existentes and refazer:
            removidas = self._faturas.remover_periodo(periodo)
            logger.info(
                "Ciclo %s reaberto: %d fatura(s) removida(s)", periodo, removidas
            )

        tarifa = self._tarifas.por_periodo(periodo)
        resultado = ResultadoFechamento(periodo=periodo, politica=self._politica.nome)

        self._avaliar_sessoes(periodo, resultado)

        for consumo in self._sessoes.consumo_por_unidade(periodo):
            valor = self._politica.calcular(consumo, tarifa)

            # Consumo irrisorio nao vira cobranca: sem fatura, sem taxa fixa.
            if valor.valor_total_centavos == 0:
                resultado.unidades_sem_cobranca.append(consumo.id_unidade)
                logger.info(
                    "Unidade %s sem cobranca em %s: %s kWh abaixo do minimo "
                    "faturavel de %s kWh",
                    consumo.id_unidade,
                    periodo,
                    consumo.energia_kwh,
                    ENERGIA_MINIMA_FATURAVEL_KWH,
                )
                continue

            fatura = Fatura(
                id_fatura=None,
                id_unidade=consumo.id_unidade,
                id_tarifa=tarifa.id_tarifa,
                periodo=periodo,
                politica_rateio=self._politica.nome,
                energia_total_kwh=consumo.energia_kwh,
                qtd_sessoes=consumo.qtd_sessoes,
                valor_variavel_centavos=valor.valor_variavel_centavos,
                valor_taxa_centavos=valor.valor_taxa_centavos,
                valor_total_centavos=valor.valor_total_centavos,
                ids_sessoes=consumo.ids_sessoes,
            )
            id_fatura = self._faturas.inserir(fatura)
            self._sessoes.vincular_fatura(id_fatura, consumo.ids_sessoes)

            resultado.faturas.append(replace(fatura, id_fatura=id_fatura))
            logger.info("Fatura gerada: %s", resultado.faturas[-1].resumo())

        self._verificar_capacidade(resultado)
        logger.info("Fechamento concluido: %s", resultado.resumo())
        return resultado

    # ------------------------------------------------------------------ #

    def _avaliar_sessoes(self, periodo: str, resultado: ResultadoFechamento) -> None:
        """Chama o modulo de IA para cada sessao do periodo.

        Este e o ponto em que a IA deixa de ser decorativa: o score e gravado
        na sessao e a anomalia vira alerta para o sindico, antes do fechamento
        da fatura.
        """
        # A referencia e a populacao do condominio inteiro, nao o historico
        # isolado da unidade: com poucas sessoes por unidade, duas anomalias na
        # mesma unidade contaminam a propria media e se mascaram mutuamente.
        # Perfil individualizado por usuario e justamente o que o modelo de
        # Isolation Forest passa a oferecer sobre esta base.
        historico = self._sessoes.historico_geral()

        for sessao in self._sessoes.do_periodo(periodo):
            avaliacao = self._avaliador.avaliar(sessao, historico)
            self._sessoes.gravar_avaliacao(
                sessao.id_sessao, avaliacao.score, avaliacao.is_anomaly
            )
            resultado.sessoes_avaliadas += 1

            if not avaliacao.is_anomaly:
                continue

            resultado.anomalias += 1
            mensagem = (
                f"Sessao {sessao.id_sessao} (unidade {sessao.id_unidade}) marcada "
                f"como anomala pelo avaliador '{self._avaliador.nome}' "
                f"(score {avaliacao.score:.2f})"
            )
            if avaliacao.motivo:
                mensagem += f": {avaliacao.motivo}"

            self._alertas.inserir(
                Alerta(
                    tipo="anomalia",
                    mensagem=mensagem,
                    severidade="alta",
                    id_sessao=sessao.id_sessao,
                    id_unidade=sessao.id_unidade,
                )
            )
            resultado.alertas.append(mensagem)
            logger.warning(mensagem)

    def _verificar_capacidade(self, resultado: ResultadoFechamento) -> None:
        """Alerta de capacidade eletrica.

        A RN ANEEL 1.000/2021 obriga o condominio a comunicar previamente a
        distribuidora quando o consumo tende a ultrapassar a demanda
        contratada. O sistema avisa o gestor antes de isso acontecer.
        """
        limite = DEMANDA_CONTRATADA_KWH_MES * LIMIAR_ALERTA_CAPACIDADE
        total = resultado.energia_total_kwh
        if total < limite:
            return

        percentual = (total / DEMANDA_CONTRATADA_KWH_MES) * 100
        mensagem = (
            f"Consumo de {total} kWh em {resultado.periodo} atingiu "
            f"{percentual:.0f}% da demanda contratada "
            f"({DEMANDA_CONTRATADA_KWH_MES} kWh). Avaliar comunicacao previa "
            "a distribuidora (RN ANEEL 1.000/2021)."
        )
        self._alertas.inserir(
            Alerta(tipo="capacidade", mensagem=mensagem, severidade="alta")
        )
        resultado.alertas.append(mensagem)
        logger.warning(mensagem)
