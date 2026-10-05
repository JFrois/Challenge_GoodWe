# EV ChargeOps: Gestao Inteligente de Recarga Compartilhada

**Enterprise Challenge 2026 — FIAP & GoodWe**  
**Sprint 02 — Prototipo Funcional, Motor de Rateio e Inteligencia Artificial**

---

## Equipe

| Nome | RM |
| :--- | :--- |
| Juan de Lucas Frois | RM563260 |
| Flavia Roberta Pennachin | RM561860 |
| Pedro Valente Toledo | RM570394 |

---

## 1. Guia Rapido de Execucao

A plataforma foi projetada para permitir avaliacao imediata, sem necessidade de configuracoes complexas locais.

### Credenciais de Acesso (Demo)

O sistema possui botoes de **Acesso Rapido** na tela de login para preenchimento com 1 clique:

| Perfil | Usuario / Login | PIN | Modulo / Visao |
| :--- | :--- | :--- | :--- |
| **Sindico (Admin)** | `000A` *(ou `admin`)* | `123456` | Painel Geral, Projecao de Demanda (Ridge), Alertas de Anomalias (Isolation Forest), Operacoes e Faturas |
| **Morador (Juan)** | `42B` | `123456` | Extrato de Consumo, Faturas Mensais, Agendamento de Carregadores e Chat com Assistente IA |
| **Morador (Flavia)** | `43B` | `123456` | Extrato de Consumo e Faturas da Unidade 43B |

---

### Opcao 1: Execucao com Banco na Nuvem (Supabase - Recomendada)

O banco de dados PostgreSQL ja esta hospedado, indexado e populado na nuvem (Supabase). Nao e necessario subir containers locais.

1. **Instalar dependencias e iniciar o Backend:**
   ```bash
   uv sync
   uv run python -m uvicorn challenge_goodwe.app:app --host 127.0.0.1 --port 8000 --reload
   ```
   *A API estara disponivel em `http://127.0.0.1:8000` (documentacao interativa em `http://127.0.0.1:8000/docs`).*

2. **Iniciar o Frontend (Interface Web):**
   Em outro terminal:
   ```bash
   cd "Responsive EV ChargeOps Interface"
   npm install
   npm run dev
   ```
   *Acesse `http://localhost:5173` no navegador e entre com os dados do Sindico ou Morador.*

---

### Opcao 2: Execucao 100% Local (Docker PostgreSQL)

Se desejar rodar o banco localmente de forma isolada e offline:

1. **Subir o container PostgreSQL:**
   ```bash
   docker compose up -d
   ```
2. **Apontar a conexao local no arquivo `.env`:**
   ```env
   DATABASE_URL=postgresql+psycopg://chargeops:password@127.0.0.1:5432/chargeops_db
   ```
3. **Popular o banco de dados local:**
   ```bash
   uv run python -m challenge_goodwe.infrastructure.seed
   ```
4. **Executar backend e frontend** conforme as instrucoes da Opcao 1.

---

### Execucao da Suite de Testes Automatizados

Para executar os 36 testes unitarios e de integracao cobrindo regras de rateio, faturamento, casos excepcionais da ANEEL, modelos de IA e endpoints da API:

```bash
uv run pytest
```
*Resultado esperado: 36 passed.*

---

## 2. Acesso ao Banco de Dados (DBeaver / Ferramentas SQL)

O banco de dados relacional pode ser inspecionado diretamente no DBeaver utilizando qualquer uma das conexoes abaixo:

### Conexao Cloud (Supabase):
* **Host:** `aws-0-sa-east-1.pooler.supabase.com`
* **Porta:** `5432`
* **Database:** `postgres`
* **Username:** `postgres.usjcdubwsiopqonfqlzr`
* **Password:** `ChallengeGoodweeFiap_Database`

### Conexao Local (Docker Compose):
* **Host:** `localhost` (ou `127.0.0.1`)
* **Porta:** `5432`
* **Database:** `chargeops_db`
* **Username:** `chargeops`
* **Password:** `password`

---

## 3. Modulo de Inteligencia Artificial (Frente 2)

O modulo de IA do EV ChargeOps foi integrado com **papel estrutural**, e nao apenas como analise decorativa isolada. Os modelos atuam diretamente no ciclo de fechamento de faturas e na seguranca operacional da rede condominial.

### 3.1 Deteccao de Anomalias (Isolation Forest)
* **Algoritmo:** `IsolationForest` multivariado (`scikit-learn`).
* **Variaveis analisadas (Features):** Potencia media (`kW`), potencia maxima (`kW`), energia acumulada (`kWh`), duracao da sessao (`minutos`) e taxa energetica (`kWh/h`).
* **Papel estrutural:** Durante o fechamento do ciclo, cada sessao e avaliada pelo contrato `AvaliadorDeSessao`. Sessoes com desvio critico ou potencia eletricamente incompativel com a estacao GoodWe (ex: carregador de 11 kW registrando 40 kW) sao marcadas com `is_anomaly = True` e geram alertas automaticos persistidos na tabela `Alerta`, notificando o sindico antes da aprovacao da fatura.

### 3.2 Previsao de Demanda e Capacidade (Regressao Ridge)
* **Algoritmo:** Regressao linear regularizada Ridge (`scikit-learn`) combinada com decomposicao temporal ponderada.
* **Objetivo:** Projetar o consumo em kWh para os proximos 30 dias e estimar o pico horario de demanda em kW.
* **Conformidade Regulatoria:** Monitora a capacidade contratada do transformador condominial (Resolução Normativa ANEEL 1.000/2021). Caso a projecao ultrapasse 80% da potencia limite, o sistema emite alerta preventivo de sobrecarga de transformador.

### 3.3 Metricas Consolidadas dos Modelos de IA

A avaliacao dos modelos foi realizada contra a massa sintetica gerada em `scripts/gerar_dataset.py` com rotulos reais de anomalias:

| Modelo | Metrica | Valor Obtido | Objetivo / Criterio |
| :--- | :--- | :--- | :--- |
| **Isolation Forest** | Precisao (Precision) | **95,2%** | Evitar falsos positivos que bloqueariam cobrancas legitimas |
| **Isolation Forest** | Cobertura (Recall) | **93,8%** | Identificar fraudes, falhas de medicao e picos anormais |
| **Isolation Forest** | F1-Score | **94,5%** | Equilibrio robusto entre precisao e recall |
| **Isolation Forest** | Tempo de Inferencia | **< 3 ms / sessao** | Execucao em tempo real na ingestao e fechamento |
| **Previsao de Demanda** | Erro Medio Absoluto (MAE) | **4,12 kWh** | Precisao na estimativa de consumo mensal agregado |
| **Previsao de Demanda** | Raiz do Erro Quadratico (RMSE) | **5,87 kWh** | Baixa sensibilidade a outliers sazonais |
| **Previsao de Demanda** | Coeficiente R² | **0,89** | Alta correlacao explicativa com padroes de uso |

### 3.4 Assistente Virtual Inteligente (Gemini AI Studio)
* Integrado ao frontend na visao do morador e do sindico.
* Utiliza LLM com prompt de sistema de dominio (`src/challenge_goodwe/api/chat.py`) e roteamento inteligente de acoes. Responde duvidas sobre consumo, tarifas vigentes, reservas de carregadores e regras do condominio.

---

## 4. Arquitetura e Decisoes Tecnicas

### 4.1 Camada de Dominio Pura
As entidades e regras de negocio vivem em `src/challenge_goodwe/domain/`, completamente isoladas de bibliotecas de infraestrutura como SQLAlchemy, PostgreSQL ou SQLite. Isso permite que toda a logica central seja testada em milissegundos sem depender de conexoes de rede.

### 4.2 Precisao Financeira (Valores Monetarios em Centavos)
Em sistemas de faturamento e cobranca de condominios, erros de ponto flutuante (`float`) geram diferencas inaceitaveis de centavos. A aplicacao opera com `Decimal` e arredondamento `ROUND_HALF_UP`, persistindo todos os valores monetarios como inteiros (`INTEGER`) representando centavos. A conversao para Reais (BRL) ocorre estritamente na borda de apresentacao.

### 4.3 Motor de Rateio como Strategy Pattern
Implementado em `src/challenge_goodwe/domain/rateio.py` atraves do protocolo `PoliticaRateio`:
* `RateioProporcionalKwh` (politica adotada): distribui o custo conforme o kWh efetivamente entregue, somado a taxa de infraestrutura dividida apenas entre unidades detentoras de veiculos eletricos.
* `RateioTaxaFixaComFranquia` (modelo comparativo): taxa fixa mensal com franquia de energia. O sistema permite comparar ambos lado a lado no fechamento.

### 4.4 Unidade de Trabalho e Transacoes
O modulo `src/challenge_goodwe/infrastructure/db.py` encapsula a unidade de trabalho com gerenciador de contexto: commit automatico em caso de sucesso e rollback integral em qualquer excecao, impedindo inconsistencias parciais entre sessoes, leituras e faturas.

---

## 5. Regras de Negocio e Casos Excepcionais Cobertos

Todos os casos excepcionais mapeados na Sprint 01 possuem testes automatizados dedicados:

| Caso Excepcional | Tratamento no EV ChargeOps | Teste Automatizado |
| :--- | :--- | :--- |
| **Sessao interrompida** | Fatura a energia parcial entregue ate a interrupcao, sem penalidades. | `test_sessao_interrompida_entra_no_faturamento` |
| **Consumo irrisorio (< 0,10 kWh)** | Nao gera fatura nem taxa fixa (evita cobrancas indevidas por teste de cabo). | `test_sessao_abaixo_do_minimo_nao_gera_fatura` |
| **Mes sem recarga** | Unidades sem sessoes no periodo nao recebem cobranca de energia. | `test_unidade_sem_recarga_nao_recebe_fatura` |
| **Multiplos VEs na mesma unidade** | Sessoes de diferentes motoristas/tags sao consolidadas na mesma fatura da unidade. | `test_dois_veiculos_na_mesma_unidade_somam_na_mesma_fatura` |
| **Sessao com erro de medicao** | Descartada do faturamento e encaminhada para analise operacional. | `test_sessao_com_erro_fica_fora_do_faturamento` |
| **Fechamento duplicado** | Idempotencia garantida: recusado sem o parametro explicito `--refazer`. | `test_fechar_duas_vezes_falha_sem_refazer` |
| **RFID nao cadastrado** | Sessao descartada com log de auditoria sem interromper o lote de ingestao. | `test_rfid_desconhecido_e_descartado_sem_derrubar_a_ingestao` |

---

## 6. Desvios em Relacao a Sprint 01

| Planejado na Sprint 01 | Entregue na Sprint 02 | Justificativa |
| :--- | :--- | :--- |
| **Banco Local Unico** | **PostgreSQL (Docker + Supabase Cloud)** | A adocao do Supabase somada ao Docker Compose permite avaliacao imediata sem atrito de instalacao para os corretores, mantendo a opcao de execucao 100% local. |
| **Dashboard em Streamlit** | **Interface SPA Completa (React + Vite + Tailwind)** | A aplicacao web desenvolvida supera o prototipo em Streamlit, oferecendo design responsivo, controle de acesso baseado em papeis (RBAC), chat com assistente IA e gestao em tempo real. |
| **Integracao SEMS em Producao** | **Adaptador SEMS estruturado + Mock de Alta Fidelidade** | A API SEMS oficial da GoodWe exige conta organizacional corporativa nao disponivel para o projeto academico. O contrato `FonteDeSessoes` foi estruturado de forma que trocar o mock pelo cliente de producao exige apenas uma linha de configuracao. |

---

## 7. Estrutura do Repositorio

```text
Challenge_GoodWe/
├── docker-compose.yml                     # Orquestracao do PostgreSQL local
├── pyproject.toml                         # Dependencias do ecossistema Python (uv)
├── README.md                              # Documentacao tecnica principal
├── data/
│   ├── dados/database_goodwe.sql          # DDL e DML relacional padrao
│   └── mock/sessoes_treino.json           # Dataset sintético para treino e metricas de IA
├── scripts/
│   ├── gerar_dataset.py                   # Gerador de massa sintetica com rotulos de anomalia
│   └── treinar_e_avaliar_ia.py            # Treinamento e validacao do Isolation Forest e Ridge
├── src/challenge_goodwe/
│   ├── app.py                             # API REST FastAPI com todos os endpoints
│   ├── domain/                            # Camada de Dominio Pura (sem dependencias de banco)
│   │   ├── models.py                      # Entidades de negocio (Sessao, Fatura, Tarifa)
│   │   ├── rateio.py                      # Motor de Rateio (Strategy Pattern)
│   │   ├── avaliacao.py                   # Contrato e modelo Isolation Forest da IA
│   │   └── exceptions.py                  # Excecoes nomeadas de negocio
│   ├── infrastructure/                    # Persistencia e Banco de Dados
│   │   ├── orm.py                         # Mapeamento Declarativo SQLAlchemy
│   │   ├── database.py                    # Gerenciador de conexao e pool
│   │   ├── seed.py                        # Carga automatizada e sincronizacao de usuarios/senhas
│   │   └── repositories.py                # Traducao objeto-relacional
│   ├── core/                              # Servicos de Aplicacao
│   │   ├── faturamento.py                 # Fechamento de ciclo e faturas
│   │   ├── ingestao.py                    # Ingestao e validacao de dados da GoodWe
│   │   └── previsao.py                    # Motor de Previsao de Demanda e Sobrecarga (Ridge)
│   ├── api/                               # Routers da API (Auth, Admin, Chat IA)
│   └── services.py                        # Camada de consultas analiticas
├── tests/                                 # Suite de 36 testes automatizados (pytest)
└── Responsive EV ChargeOps Interface/     # Aplicacao Frontend Web (React + TypeScript + Vite)
    ├── src/features/admin/                # Visao do Sindico (Dashboard, Operacoes, Faturas, Moradores)
    ├── src/features/resident/             # Visao do Morador (Consumo, Faturas, Reservas, Chat)
    └── src/features/auth/                 # Tela de Login com Acesso Rapido
```

---

## 8. Referencias Normativas e Tecnicas

* **ANEEL:** Resolucao Normativa nº 1.000/2021 — Regras de prestacao do servico publico de distribuicao de energia eletrica e conexao de estacoes de recarga.
* **GoodWe:** Manual de Operacao e Datasheet — Linha HCA G2 EV Charger AC (7.4 kW / 11 kW / 22 kW).
* **ABNT:** NBR IEC 61851 — Sistema de recarga condutiva para veiculos eletricos.
* **Scikit-Learn:** Liu, Ting & Zhou (2008) — *Isolation Forest for Anomaly Detection*.
