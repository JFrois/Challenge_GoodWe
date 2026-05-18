# ⚡ EV ChargeOps: Gestão Inteligente de Recarga Compartilhada
**Enterprise Challenge 2026 – FIAP + GoodWe**

## 👥 Equipe (FIAP 2026)
| Nome | RM |
| :--- | :--- |
| **Juan de Lucas Frois** | RM563260 |
| **Flávia Roberta Pennachin** | RM561860 |
| **Pedro Valente Toledo** | RM570394 |
| **Bruno Antonio Santos Silva** | RM573180 | 

---

## 🎯 1. Contexto e Descrição do Problema
O crescimento acelerado da frota de veículos elétricos (VEs) no Brasil trouxe um desafio operacional crítico para condomínios e edifícios corporativos. A infraestrutura de recarga compartilhada — como o carregador **GoodWe HCA G2** — gera dados contínuos, mas os ambientes não dispõem de mecanismos integrados para individualizar o consumo. 

**O Problema:** Atualmente, a energia consumida pelo carregador em áreas comuns é diluída nas despesas do condomínio, prejudicando moradores sem VEs, ou é controlada manualmente, o que gera atrito e inadimplência.
**A Solução:** O **EV ChargeOps** transforma sessões de recarga em dados estruturados, automatizando o rateio, estruturando as sessões por usuário e utilizando Inteligência Artificial para prever consumos e garantir segurança operacional.

---

## 🔍 2. As Três Frentes de Pesquisa

### Frente 1 — Contexto e Problema
A recarga compartilhada exige a autenticação do usuário, o *handshake* técnico (negociação de potência) e o registro final da energia (kWh) entregue. Mapeamos que o modelo mais justo de negócio para condomínios é o **rateio condominial proporcional ao uso**.

<details>
<summary><strong>👉 Opção A: Análise de Mercado (Soluções Existentes)</strong></summary>

Mapeamos os principais players do mercado para identificar oportunidades:
* **Zaptec:** Resolve a divisão de custos com forte balanceamento de carga, mas tem forte dependência do seu ecossistema de hardware proprietário.
* **Wallbox Pulsar Plus:** Excelente para uso residencial e gestão via app (MyWallbox), mas os recursos avançados de faturamento de frotas/condomínios dependem de softwares de terceiros.
* **ChargePoint:** Foco em recarga pública comercial, oferecendo processamento de pagamentos complexo, mas é excessivamente robusto e caro para um condomínio residencial padrão.
</details>

<details>
<summary><strong>👉 Opção C: Análise de Dados Públicos</strong></summary>

Dados da **ABVE** demonstram o crescimento recorde da frota eletrificada no Brasil. Como cerca de 80% das recargas ocorrem em residências e a infraestrutura pública ainda é escassa (dados ANEEL/Open Charge Map), condomínios precisam de soluções em software como o EV ChargeOps para gerir suas vagas sem exigir reformas elétricas milionárias de imediato.
</details>

### Frente 2 — Base Regulatória e Técnica
O EV ChargeOps foi desenhado para operar 100% dentro da lei. A **Resolução Normativa ANEEL nº 1.000/2021** (Art. 550) define que cobrar pela recarga em condomínios é uma **prestação de serviço** (livre negociação) e não comercialização de energia. O carregador GoodWe HCA G2 fornece os meios para isso através de suas interfaces (RFID para autenticação; LAN/Wi-Fi para telemetria em nuvem).

<details>
<summary><strong>👉 Opção A: Mapeamento Regulatório Completo</strong></summary>

Além da ANEEL, a solução considera normas de segurança locais, como a **IT-39 do Corpo de Bombeiros de SP**, que regula estações em subsolos. O EV ChargeOps prevê a integração para desligamento remoto da sessão em caso de alarmes de incêndio, garantindo a conformidade predial.
</details>

<details>
<summary><strong>👉 Opção B: Exploração da API GoodWe (SEMS Portal)</strong></summary>

A extração de dados ocorre via API SEMS, recebendo respostas em JSON. Os dados vitais capturados incluem: `device_id` (identificador da estação), `status` (carregando, ocioso), `current_power_kw` (potência instantânea) e `energy_delivered_kwh` (total de energia consumida na sessão para o cálculo financeiro).
</details>

<details>
<summary><strong>👉 Opção C: APIs Complementares</strong></summary>

* **Google Places API (evChargeOptions):** Para o síndico monitorar a densidade de carregadores na região e ajustar o preço de conveniência.
* **ANEEL Open Data:** Para buscar dinamicamente os valores das bandeiras tarifárias e atualizar o valor base do rateio de energia do condomínio.
</details>

### Frente 3 — Arquitetura e IA
O sistema opera em quatro camadas: **Física** (Carregador), **Conectividade** (Wi-Fi/Rede), **Aplicação** (Backend + IA) e **Apresentação** (Dashboards). O dado flui do log do hardware, passa pela API SEMS, é calculado pelo nosso backend e consolidado na fatura do morador.

<details>
<summary><strong>👉 Opção A: Modelo de Rateio Definido</strong></summary>

Adotaremos o modelo **Pay-per-use + Taxa de Manutenção**. 
* **Cálculo:** `(Total de kWh consumidos na sessão * Tarifa R$/kWh da Distribuidora) + Cota Fixa Mensal`.
* **Justificativa:** Garante que o morador pague exatamente o que consumiu de energia, enquanto a cota fixa (cobrada apenas de quem possui VE) cria um fundo de reserva para manutenção do GoodWe HCA G2.
</details>

<details>
<summary><strong>👉 Opção B: Papel da IA na Solução</strong></summary>

A IA atua como motor de segurança e previsibilidade corporativa:
1.  **Regressão Linear:** Prevê o consumo de energia da próxima quinzena/mês baseando-se no histórico de uso, permitindo ao síndico provisionar o caixa para pagar a conta de luz do condomínio.
2.  **Detecção de Anomalias (Isolation Forest):** Analisa padrões de corrente e tempo. Picos atípicos geram alertas preventivos de falha no hardware ou indício de furto de energia (usuários não autorizados).
</details>

<details>
<summary><strong>👉 Opção C: Esquema da Base de Dados</strong></summary>

Estrutura Relacional principal:
* `Usuarios` (ID, Nome, Apartamento, Tag_RFID)
* `Carregadores` (ID, MAC_Address, Localizacao)
* `Sessoes` (ID, Usuario_ID, Carregador_ID, Inicio, Fim, Total_kWh)
* `Faturas` (ID, Usuario_ID, Mes_Referencia, Valor_Total, Status_Pgto)
</details>

---

## 🏗️ 3. Diagrama de Arquitetura

<img width="422" height="265" alt="Screenshot 2026-05-18 at 20 08 48" src="https://github.com/user-attachments/assets/0ff79149-1e03-4f19-867f-1bb42beedc04" />


---

## 🚀 4. Plano para a Sprint 02 (Desenvolvimento)
Para a próxima fase, a equipe construirá a prototipação funcional da solução. O desenvolvimento seguirá a seguinte ordem:

1.  **Estruturação de Dados (Semana 1-2):** Criação do Banco de Dados Relacional (SQLite/PostgreSQL) baseado no esquema definido.
2.  **Backend e Integração (Semana 3-4):** Desenvolvimento em **Python (FastAPI ou Flask)**. Criação de mocks para simular o JSON da API GoodWe SEMS.
3.  **Lógica de Rateio (Semana 5-6):** Construção do motor financeiro que cruza as sessões em kWh com a tarifa local, gerando o output de cobrança individualizada.
4.  **Implementação da IA (Semana 7-8):** Uso da biblioteca `scikit-learn` em Python para treinar e rodar o modelo de Regressão Linear, prevendo o consumo do condomínio com base nos dados gerados no mockup.

---

## 📚 5. Referências Consultadas
* AGÊNCIA NACIONAL DE ENERGIA ELÉTRICA (ANEEL). **Resolução Normativa nº 1.000, de 7 de dezembro de 2021**.
* ASSOCIAÇÃO BRASILEIRA DO VEÍCULO ELÉTRICO (ABVE). Estatísticas de emplacamentos e infraestrutura.
* CORPO DE BOMBEIROS DO ESTADO DE SÃO PAULO. **Instrução Técnica (IT-39)** - Segurança contra incêndio em garagens e subsolos.
* GOODWE. **Datasheet e Manual do Usuário - HCA G2 EV Charger**.
* GOODWE. **Documentação da API SEMS Portal**.
