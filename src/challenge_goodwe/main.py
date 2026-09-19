"""Ponto de entrada da aplicacao EV ChargeOps.

Orquestra o fluxo completo da solucao:

    API GoodWe (mock)  ->  ingestao  ->  sessoes
                                          |
                                     avaliacao de IA
                                          |
                            agregacao por unidade + politica de rateio
                                          |
                                  fatura + alertas ao sindico

Uso:
    uv run evchargeops init-db
    uv run evchargeops ingerir
    uv run evchargeops fechar 2026-06 --avaliador baseline
    uv run evchargeops painel 2026-06
    uv run evchargeops extrato 1 2026-06
    uv run evchargeops demo
"""

from __future__ import annotations

import argparse
import logging
import sys

from . import logging_config
from .core.faturamento import MotorDeFaturamento
from .core.ingestao import ServicoDeIngestao
from .domain.avaliacao import AvaliadorNulo, AvaliadorPorDesvioPadrao
from .domain.exceptions import EVChargeOpsError
from .domain.models import formatar_brl
from .domain.rateio import POLITICAS, POLITICA_PADRAO, obter_politica
from .infrastructure.db import unidade_de_trabalho
from .infrastructure.seed import inicializar_banco
from .integracao.sems import MockSemsClient
from .services import ConsultasEVChargeOps

logger = logging.getLogger("challenge_goodwe")

AVALIADORES = {
    "nulo": AvaliadorNulo,
    "baseline": AvaliadorPorDesvioPadrao,
}

_LINHA = "-" * 78


def _titulo(texto: str) -> None:
    print(f"\n{texto}\n{_LINHA}")


# ------------------------------- comandos ---------------------------------- #


def cmd_init_db(args: argparse.Namespace) -> int:
    caminho = inicializar_banco()
    print(f"Banco pronto em {caminho}")
    return 0


def cmd_ingerir(args: argparse.Namespace) -> int:
    fonte = MockSemsClient()
    with unidade_de_trabalho() as conn:
        resultado = ServicoDeIngestao(conn, fonte).ingerir()
    print(f"Ingestao via '{fonte.nome}': {resultado.resumo()}")
    return 0


def cmd_fechar(args: argparse.Namespace) -> int:
    avaliador = AVALIADORES[args.avaliador]()
    politica = obter_politica(args.politica)

    with unidade_de_trabalho() as conn:
        motor = MotorDeFaturamento(conn, politica=politica, avaliador=avaliador)
        resultado = motor.fechar_periodo(args.periodo, refazer=args.refazer)

    _titulo(f"Fechamento do ciclo {resultado.periodo}")
    for fatura in resultado.faturas:
        print(
            f"  Unidade {fatura.id_unidade:>2} | "
            f"{fatura.energia_total_kwh:>8} kWh | "
            f"{fatura.qtd_sessoes} sessao(oes) | "
            f"variavel {formatar_brl(fatura.valor_variavel_centavos):>12} | "
            f"taxa {formatar_brl(fatura.valor_taxa_centavos):>10} | "
            f"total {formatar_brl(fatura.valor_total_centavos):>12}"
        )

    if resultado.unidades_sem_cobranca:
        print(
            "\n  Unidades sem cobranca (consumo abaixo do minimo faturavel): "
            + ", ".join(str(u) for u in resultado.unidades_sem_cobranca)
        )

    if resultado.alertas:
        _titulo("Alertas gerados")
        for alerta in resultado.alertas:
            print(f"  [!] {alerta}")

    _titulo("Resumo")
    print(f"  {resultado.resumo()}")
    return 0


def cmd_painel(args: argparse.Namespace) -> int:
    with ConsultasEVChargeOps() as consultas:
        df = consultas.painel_sindico(args.periodo)
        alertas = consultas.alertas_abertos()

    if df.empty:
        print(f"Nenhuma fatura gerada para {args.periodo}.")
        return 1

    _titulo(f"Painel do sindico — {args.periodo}")
    print(df.to_string(index=False))
    print(f"\n  Receita total: R$ {df['valor_total_brl'].sum():,.2f}")
    print(f"  Energia total: {df['energia_total_kwh'].sum():.2f} kWh")
    print(f"  Alertas abertos: {len(alertas)}")
    return 0


def cmd_extrato(args: argparse.Namespace) -> int:
    with ConsultasEVChargeOps() as consultas:
        extrato = consultas.extrato_morador(args.id_unidade, args.periodo)

    _titulo(f"Extrato — unidade {args.id_unidade} — {args.periodo}")
    if extrato["sessoes"].empty:
        print("  Nenhuma sessao registrada no periodo.")
    else:
        print(extrato["sessoes"].to_string(index=False))

    if extrato["fatura"].empty:
        print("\n  Sem fatura no periodo.")
    else:
        print("\n  Fatura:")
        print(extrato["fatura"].to_string(index=False))
    return 0


def cmd_demo(args: argparse.Namespace) -> int:
    """Executa o fluxo inteiro numa tacada. Usado para gerar evidencias."""
    _titulo("1/4 — Inicializando banco")
    cmd_init_db(args)

    _titulo("2/4 — Ingerindo sessoes da fonte GoodWe (mock SEMS)")
    cmd_ingerir(args)

    _titulo("3/4 — Fechando o ciclo de faturamento")
    args.periodo = args.periodo or "2026-06"
    args.avaliador = "baseline"
    args.politica = POLITICA_PADRAO
    args.refazer = True
    cmd_fechar(args)

    _titulo("4/4 — Painel do sindico")
    cmd_painel(args)
    return 0


# --------------------------------- CLI ------------------------------------- #


def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="evchargeops",
        description="EV ChargeOps — gestao de recarga compartilhada (GoodWe + FIAP)",
    )
    parser.add_argument("--verbose", action="store_true", help="log em nivel DEBUG")
    sub = parser.add_subparsers(dest="comando", required=True)

    sub.add_parser("init-db", help="cria o banco e carrega a massa de teste")
    sub.add_parser("ingerir", help="ingere sessoes da fonte GoodWe")

    p_fechar = sub.add_parser("fechar", help="fecha o ciclo de faturamento")
    p_fechar.add_argument("periodo", help="periodo no formato YYYY-MM")
    p_fechar.add_argument(
        "--politica", choices=sorted(POLITICAS), default=POLITICA_PADRAO
    )
    p_fechar.add_argument(
        "--avaliador", choices=sorted(AVALIADORES), default="baseline"
    )
    p_fechar.add_argument(
        "--refazer", action="store_true", help="reabre um ciclo ja fechado"
    )

    p_painel = sub.add_parser("painel", help="visao consolidada do sindico")
    p_painel.add_argument("periodo")

    p_extrato = sub.add_parser("extrato", help="extrato de uma unidade")
    p_extrato.add_argument("id_unidade", type=int)
    p_extrato.add_argument("periodo")

    p_demo = sub.add_parser("demo", help="executa o fluxo completo ponta a ponta")
    p_demo.add_argument("--periodo", default="2026-06")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = construir_parser().parse_args(argv)
    logging_config.configurar(logging.DEBUG if args.verbose else logging.INFO)

    comandos = {
        "init-db": cmd_init_db,
        "ingerir": cmd_ingerir,
        "fechar": cmd_fechar,
        "painel": cmd_painel,
        "extrato": cmd_extrato,
        "demo": cmd_demo,
    }
    try:
        return comandos[args.comando](args)
    except EVChargeOpsError as erro:
        logger.error("%s", erro)
        return 1


if __name__ == "__main__":
    sys.exit(main())
