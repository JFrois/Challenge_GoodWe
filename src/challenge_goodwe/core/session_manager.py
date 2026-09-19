from datetime import datetime
from challenge_goodwe.database.db import get_connection

class SessionManager:
    """Simula a ingestão de dados da API GoodWe SEMS e o registro de sessões de recarga."""

    def __init__(self):
        self.conn = get_connection()

    def registrar_nova_sessao(self, id_carregador: int, id_usuario: int, id_unidade: int, id_fatura: int, 
                              energia_kwh: float, potencia_media: float, potencia_max: float, 
                              dt_inicio: str, dt_fim: str):
        """
        Insere uma nova sessão concluída de recarga no banco de dados e gera 
        alguns pontos de telemetria simulados na tabela Leitura_Medicao.
        """
        cursor = self.conn.cursor()

        # Insere a sessão de recarga
        cursor.execute("""
        INSERT INTO Sessao_Recarga (
            id_carregador, id_usuario, id_unidade, id_fatura, 
            dt_inicio, dt_fim, energia_kwh, potencia_media, potencia_max, status_final
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'concluida')
        """, (id_carregador, id_usuario, id_unidade, id_fatura, dt_inicio, dt_fim, energia_kwh, potencia_media, potencia_max))
        
        id_sessao = cursor.lastrowid

        # Simula leituras de telemetria (time-series) a cada 15 minutos da sessão
        t_inicio = datetime.fromisoformat(dt_inicio)
        t_fim = datetime.fromisoformat(dt_fim)
        duracao_horas = (t_fim - t_inicio).total_seconds() / 3600.0
        
        if duracao_horas > 0:
            passos = max(1, int(duracao_horas * 4)) # 4 leituras por hora
            incremento_kwh = energia_kwh / passos
            
            for i in range(1, passos + 1):
                timestamp_leitura = datetime.fromtimestamp(
                    t_inicio.timestamp() + (i * (duracao_horas * 3600 / passos))
                ).strftime('%Y-%m-%d %H:%M:%S')
                
                energia_acumulada = round(incremento_kwh * i, 2)
                tensao = "380V" if potencia_max > 7.2 else "220V"
                corriente = f"{int((potencia_max * 1000) / 220)}A"

                cursor.execute("""
                INSERT INTO Leitura_Medicao (
                    id_sessao, timestamp, energia_acumulada_kwh, potencia_instantanea_kw, tensao, corrente
                ) VALUES (?, ?, ?, ?, ?, ?)
                """, (id_sessao, timestamp_leitura, energia_acumulada, potencia_media, tensao, corriente))

        self.conn.commit()
        self.conn.close()
        print(f"[SessionManager] Sessão {id_sessao} registrada com sucesso para a unidade {id_unidade}!")

if __name__ == "__main__":
    manager = SessionManager()
    # Exemplo de simulação de nova sessão
    manager.registrar_nova_sessao(
        id_carregador=5,
        id_usuario=10,
        id_unidade=1,
        id_fatura=900,
        energia_kwh=18.4,
        potencia_media=7.1,
        potencia_max=7.2,
        dt_inicio="2026-09-19 20:00:00",
        dt_fim="2026-09-19 22:30:00"
    )