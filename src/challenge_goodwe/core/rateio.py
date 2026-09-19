import pandas as pd
from challenge_goodwe.database.db import get_connection


class MotorRateio:
    def __init__(self):
        self.conn = get_connection()

    def calcular_faturas_mes(self, periodo: str, id_tarifa: int):
        # 1. Pega os valores da tarifa vigente (kWh e taxa fixa)
        tarifa = pd.read_sql(
            "SELECT * FROM Tarifa WHERE id_tarifa = ?", self.conn, params=(id_tarifa,)
        ).iloc[0]
        valor_kwh = tarifa["valor_kwh_efetivo"]
        taxa_infra = tarifa["taxa_infraestrutura"]

        # 2. Soma o consumo em kWh por unidade no período selecionado
        query_sessoes = """
        SELECT 
            s.id_unidade,
            SUM(s.energia_kwh) as total_kwh
        FROM Sessao_Recarga s
        WHERE strftime('%Y-%m', s.dt_inicio) = ? AND s.status_final = 'concluida'
        GROUP BY s.id_unidade
        """
        consumo_unidades = pd.read_sql(query_sessoes, self.conn, params=(periodo,))

        faturas = []
        for _, row in consumo_unidades.iterrows():
            total_kwh = float(row["total_kwh"])
            valor_variavel = round(total_kwh * valor_kwh, 2)
            valor_total = round(valor_variavel + taxa_infra, 2)

            faturas.append(
                {
                    "id_unidade": int(row["id_unidade"]),
                    "id_tarifa": id_tarifa,
                    "periodo": periodo,
                    "energia_total_kwh": total_kwh,
                    "valor_variavel": valor_variavel,
                    "valor_taxa": taxa_infra,
                    "valor_total": valor_total,
                    "status_pgto": "pendente",
                }
            )

        return faturas
