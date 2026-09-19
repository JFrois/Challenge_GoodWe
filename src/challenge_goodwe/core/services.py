import pandas as pd
from challenge_goodwe.database.db import get_connection


class EVChargeOpsServices:
    """Fornece consultas e processamentos otimizados para a camada de apresentação (PWA/Streamlit)."""

    @staticmethod
    def listar_unidades():
        conn = get_connection()
        df = pd.read_sql("SELECT * FROM Unidade", conn)
        conn.close()
        return df

    @staticmethod
    def listar_carregadores():
        conn = get_connection()
        df = pd.read_sql("SELECT * FROM Carregador", conn)
        conn.close()
        return df

    @staticmethod
    def obter_extrato_morador(id_unidade: int, periodo: str = "2026-06"):
        """Retorna as sessões de recarga e a fatura consolidada de uma unidade específica."""
        conn = get_connection()

        query_sessoes = """
        SELECT 
            s.id_sessao, c.localizacao, s.dt_inicio, s.dt_fim, 
            s.energia_kwh, s.status_final
        FROM Sessao_Recarga s
        JOIN Carregador c ON s.id_carregador = c.id_carregador
        WHERE s.id_unidade = ? AND strftime('%Y-%m', s.dt_inicio) = ?
        """
        sessoes = pd.read_sql(query_sessoes, conn, params=(id_unidade, periodo))

        query_fatura = """
        SELECT * FROM Fatura 
        WHERE id_unidade = ? AND periodo = ?
        """
        fatura = pd.read_sql(query_fatura, conn, params=(id_unidade, periodo))

        conn.close()
        return {"sessoes": sessoes, "fatura": fatura}

    @staticmethod
    def obter_dados_sindico(periodo: str = "2026-06"):
        """Retorna o consolidado financeiro e operacional para o painel do síndico/administradora[cite: 11, 16]."""
        conn = get_connection()

        query_faturas = """
        SELECT 
            f.id_fatura, u.cd_unidade, f.periodo, 
            f.energia_total_kwh, f.valor_variavel, f.valor_taxa, f.valor_total, f.status_pgto
        FROM Fatura f
        JOIN Unidade u ON f.id_unidade = u.id_unidade
        WHERE f.periodo = ?
        """
        faturas_geral = pd.read_sql(query_faturas, conn, params=(periodo,))

        conn.close()
        return faturas_geral


if __name__ == "__main__":
    print("--- Testando Serviços do Síndico ---")
    print(EVChargeOpsServices.obter_dados_sindico("2026-06"))
