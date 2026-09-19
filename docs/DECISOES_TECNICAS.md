# Decisões técnicas — núcleo e motor de rateio

O conteúdo daqui deve ser incorporado ao README principal nas seções "Decisões técnicas" e "Desvios da Sprint 01", exigidas pela rubrica da Sprint 02.

---

## 1. Como executar

```bash
# dependências
uv sync

# cria o banco e carrega a massa de teste
uv run evchargeops init-db

# ingere sessões da fonte GoodWe (mock da API SEMS)
uv run evchargeops ingerir

# fecha o ciclo de faturamento de um período
uv run evchargeops fechar 2026-06

# visão do síndico e extrato do morador
uv run evchargeops painel 2026-06
uv run evchargeops extrato 1 2026-06

# fluxo inteiro de uma vez (usado para gerar as evidências)
uv run evchargeops demo

# testes
uv run pytest

# massa sintética para treinar o módulo de IA
uv run python scripts/gerar_dataset.py --meses 6 --sessoes-por-mes 120
```

---

## 2. Organização do código

```
src/challenge_goodwe/
├── domain/              regras de negócio puras — não importam sqlite3 nem pandas
│   ├── models.py        entidades e objetos de valor
│   ├── rateio.py        políticas de cobrança (Strategy)
│   ├── avaliacao.py     contrato do módulo de IA
│   └── exceptions.py    erros de negócio nomeados
├── infrastructure/      todo o SQL do projeto vive aqui
│   ├── db.py            conexão e unidade de trabalho transacional
│   ├── repositories.py  tradução tabela <-> objeto de domínio
│   └── seed.py          criação e carga do banco
├── integracao/
│   └── sems.py          adaptador da fonte de sessões (GoodWe SEMS)
├── core/                serviços de aplicação
│   ├── ingestao.py      payload da GoodWe -> sessões atribuídas
│   └── faturamento.py   fechamento do ciclo
├── services.py          consultas para o dashboard e datasets da IA
└── main.py              CLI que orquestra o fluxo
```

A separação existe por um motivo prático: o domínio não conhece o banco, então
as regras de rateio são testáveis sem subir SQLite. Os 25 testes da suíte rodam
em menos de um décimo de segundo por causa disso.

---

## 3. Decisões e o porquê de cada uma

### 3.1 Dinheiro em centavos (INTEGER), nunca em float

SQLite não tem tipo decimal: `DECIMAL(10,2)` vira `REAL` e acumula erro de
ponto flutuante. Num sistema que emite cobrança para condômino, diferença de
centavo em fatura é problema de verdade. A camada Python opera com `Decimal`
e arredondamento `ROUND_HALF_UP`, e persiste o valor em centavos.

Energia continua `REAL` — é medição física, não valor monetário.

Quem consome o `services.py` nunca vê centavos: a conversão para reais acontece
na fronteira com a apresentação.

### 3.2 `Sessao_Recarga.id_fatura` é NULL na ingestão

A fatura é gerada **a partir** das sessões. Exigir a fatura no momento do
registro criava dependência circular e tornava impossível ingerir uma sessão em
tempo real. O vínculo é escrito no fechamento do ciclo, quando a fatura já
existe.

### 3.3 A tabela `Fatura` nasce vazia

Nenhuma fatura é semeada no script SQL. Todas são produzidas pelo motor de
rateio. Isso garante que o valor exibido no dashboard sempre reconcilia com as
sessões que o originaram — há um teste (`test_fatura_reconcilia_com_as_sessoes`)
que falha se algum dia divergir.

### 3.4 Tensão e corrente são numéricos

`tensao_v REAL` e `corrente_a REAL`, com a unidade no nome da coluna. A versão
anterior guardava `'220V'` e `'32A'` como texto, o que inviabilizava usar esses
campos como features do modelo de anomalias.

### 3.5 Bandeira tarifária separada do custo base

`valor_kwh_centavos` e `adicional_bandeira_centavos` são colunas distintas. A
propriedade `Tarifa.custo_kwh` soma as duas. Isso permite atualizar a bandeira
via ANEEL Open Data sem reescrever o histórico consolidado.

### 3.6 Política de rateio como Strategy

A Sprint 01 comparou cinco modelos de cobrança e adotou o proporcional por kWh.
Aqui o comparativo virou código: `RateioProporcionalKwh` (adotado) e
`RateioTaxaFixaComFranquia` (alternativa) implementam o mesmo protocolo
`PoliticaRateio`. Trocar a política é passar outro objeto ao motor.

Rodando o mesmo período com as duas políticas:

| Política | Receita do condomínio em 2026-06 |
| :-- | --: |
| `proporcional_kwh` | R$ 731,63 |
| `taxa_fixa_com_franquia` | R$ 903,41 |

O modelo de taxa fixa arrecada mais, mas cobra R$ 120,00 de uma unidade que
consumiu 19,8 kWh e R$ 120,00 de outra que consumiu 126,4 kWh. É o subsídio
cruzado que a Sprint 01 apontou como fonte de conflito em assembleia — e agora
está demonstrado com número, não com adjetivo.

### 3.7 Adaptador para a fonte de sessões

Não temos credencial de conta organizacional SEMS. Isso justificou o mock, não
a ausência de arquitetura: `FonteDeSessoes` é o contrato, `MockSemsClient` lê
um JSON no formato documentado na Sprint 01 e `SemsApiClient` fixa o ponto de
extensão para quando houver acesso. Trocar mock por API real é trocar uma linha
no `main.py`.

A ingestão é idempotente: `id_sessao_sems` é único, então reprocessar o mesmo
lote não duplica cobrança.

### 3.8 Contrato explícito com o módulo de IA

`domain/avaliacao.py` define `AvaliadorDeSessao`. O motor de faturamento chama
o avaliador para cada sessão do período, grava `anomaly_score` e `is_anomaly`
na tabela de sessões e transforma anomalia em registro na tabela `Alerta` —
tudo antes de fechar a fatura. É assim que a IA cumpre papel estrutural em vez
de virar notebook desconectado.

Para plugar o Isolation Forest basta uma classe com o método `avaliar()`. Nada
no backend muda.

Há duas implementações de referência: `AvaliadorNulo` (mantém o pipeline
executável) e `AvaliadorPorDesvioPadrao` (baseline estatístico, **não é a
entrega de IA da sprint**) — este último serve para provar o gancho ponta a
ponta e como linha de base contra a qual comparar o modelo nas métricas.

### 3.9 Transações com rollback

`unidade_de_trabalho()` é um context manager: commit ao sair sem erro, rollback
em exceção. Nenhum caminho de código deixa o banco em estado parcial — o que
acontecia antes, quando o registro de sessão gravava a sessão e podia falhar no
meio das leituras de telemetria.

### 3.10 Logging, não `print`

Um sistema que emite alerta de anomalia e gera cobrança precisa de
rastreabilidade. Erros de negócio previstos (período já fechado, tarifa
ausente) são logados como warning, sem stack trace; erros inesperados levam
traceback completo.

---

## 4. Regras de negócio implementadas

Os casos excepcionais que a Sprint 01 documentou, agora com teste cobrindo cada
um:

| Caso | Tratamento | Teste |
| :-- | :-- | :-- |
| Sessão interrompida | cobra a energia entregue, sem penalidade | `test_sessao_interrompida_entra_no_faturamento` |
| Consumo irrisório (< 0,10 kWh) | não gera fatura nem taxa fixa | `test_sessao_abaixo_do_minimo_nao_gera_fatura` |
| Unidade sem recarga no mês | não recebe fatura nenhuma | `test_unidade_sem_recarga_nao_recebe_fatura` |
| Dois veículos na mesma unidade | somam na mesma fatura, histórico separado por usuário | `test_dois_veiculos_na_mesma_unidade_somam_na_mesma_fatura` |
| Sessão com erro | fica fora do faturamento | `test_sessao_com_erro_fica_fora_do_faturamento` |
| Fechar o mesmo período duas vezes | recusado, a menos que `--refazer` | `test_fechar_duas_vezes_falha_sem_refazer` |
| RFID não cadastrado | sessão descartada com log, ingestão continua | `test_rfid_desconhecido_e_descartado_sem_derrubar_a_ingestao` |

Além disso, o motor emite alerta de capacidade quando o consumo do período
atinge 80% da demanda contratada, apoiando a obrigação de comunicação prévia à
distribuidora prevista na RN ANEEL 1.000/2021.

---

## 5. Desvios em relação à Sprint 01

| Planejado na Sprint 01 | Entregue na Sprint 02 | Justificativa |
| :-- | :-- | :-- |
| PostgreSQL | SQLite | O protótipo roda local e precisa ser reproduzível pelo avaliador sem subir serviço. Todo o SQL está isolado na camada de repositórios: migrar para PostgreSQL significa reescrever `repositories.py`, nada além dele. |
| API REST com FastAPI | CLI + camada de consulta | A rubrica pede protótipo funcional e evidências, não serviço publicado. `services.py` já é a interface que um controller FastAPI consumiria; a API é extensão natural, não retrabalho. |
| Front-end em React | Dashboard em Streamlit | Streamlit entrega as duas visões (morador e síndico) no tempo da sprint, com o mesmo Python do backend. |
| Integração com a API SEMS em produção | `MockSemsClient` no formato da SEMS | A Open API exige conta organizacional GoodWe, que a equipe não possui. O contrato e o cliente real estão estruturados. |
| Telemetria vinda direto do carregador | Telemetria interpolada a partir dos totais da sessão | A API SEMS entrega o consolidado da sessão, não a série temporal. A função `sintetizar_telemetria` deriva os pontos por interpolação linear — e isso está explicitado no código para não ser confundido com medição real. |

---

## 6. Evidência de execução

Saída de `uv run evchargeops demo`, período 2026-06:

```
Unidade  1 |  124.000 kWh | 4 sessao(oes) | variavel R$ 114,08 | taxa R$ 50,00 | total R$ 164,08
Unidade  2 |   62.900 kWh | 3 sessao(oes) | variavel  R$ 57,87 | taxa R$ 50,00 | total R$ 107,87
Unidade  3 |   75.550 kWh | 3 sessao(oes) | variavel  R$ 69,51 | taxa R$ 50,00 | total R$ 119,51
Unidade  5 |  126.400 kWh | 3 sessao(oes) | variavel R$ 116,29 | taxa R$ 50,00 | total R$ 166,29
Unidade  7 |   19.800 kWh | 1 sessao(oes) | variavel  R$ 18,22 | taxa R$ 50,00 | total  R$ 68,22
Unidade  9 |   60.500 kWh | 2 sessao(oes) | variavel  R$ 55,66 | taxa R$ 50,00 | total R$ 105,66

Unidades sem cobranca (consumo abaixo do minimo faturavel): 4

Alertas gerados
[!] Sessao 14 (unidade 5) marcada como anomala pelo avaliador 'baseline_zscore'
    (score 0.77): potencia media de 39.6 kW esta a 4.6 desvios da media historica (9.2 kW)

Periodo 2026-06 | politica 'proporcional_kwh' | 6 fatura(s) | 469.150 kWh
                | R$ 731,63 | 1 anomalia(s) em 17 sessao(oes)
```

A sessão 14 é uma anomalia plantada de propósito na massa de teste: 39,6 kWh em
uma hora num carregador de 11 kW, fisicamente impossível. O pipeline a detecta
e gera o alerta antes do fechamento da fatura.

Suíte de testes: 25 casos, todos passando.