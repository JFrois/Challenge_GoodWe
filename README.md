# ⚡ EV ChargeOps: Gestão Inteligente de Recarga Compartilhada

**Enterprise Challenge 2026 — FIAP + GoodWe**

---

## 👥 Equipe

| Nome | RM |
| :--- | :--- |
| Juan de Lucas Frois | RM563260 |
| Flávia Roberta Pennachin | RM561860 |
| Pedro Valente Toledo | RM570394 |

---

## 🎯 1. Contexto e Descrição do Problema

O crescimento exponencial da frota de veículos elétricos (VEs) no Brasil trouxe um desafio operacional crítico em ambientes com infraestrutura compartilhada. Condomínios residenciais, edifícios corporativos e campus universitários não dispõem de mecanismos integrados para individualizar o consumo energético de recarga.

**O problema central:** sem gestão digital, a energia consumida pelo carregador é diluída nas despesas comuns do condomínio — penalizando moradores sem VEs — ou controlada por processos manuais sujeitos a falhas e inadimplência.

**A solução — EV ChargeOps:** plataforma que transforma dados brutos de sessões de recarga em inteligência acionável, automatizando o rateio por utilizador, calculando consumos exatos em kWh e aplicando Inteligência Artificial para previsão de demanda e deteção de anomalias.

### Desafios por Ambiente

| Ambiente | Principais Desafios |
| :--- | :--- |
| Condomínio Residencial | Conflitos entre moradores; rateio de custos; poucas vagas; adaptação de prédios antigos |
| Edifício Corporativo | Controle de acesso; uso simultâneo em horários de pico; integração com estacionamento |
| Campus Universitário | Alta rotatividade; múltiplos pontos necessários; alto consumo em horários específicos |

### Fluxo Técnico de uma Sessão de Recarga

1. **Conexão física** — cabo conectado; carregador deteta o veículo e realiza verificação elétrica e de segurança
2. **Handshake** — negociação eletrónica de potência máxima, capacidade da bateria e compatibilidade entre veículo e carregador (protocolo PWM / ISO 15118)
3. **Autenticação** — utilizador identifica-se via RFID, app, QR Code ou login; sistema regista quem iniciou, em qual carregador e o horário
4. **Liberação de energia e monitoramento** — contatores fecham; fluxo AC/DC iniciado; dados enviados continuamente: potência (kW), energia acumulada (kWh), tensão, corrente, frequência
5. **Encerramento** — bateria no limite ou desconexão; contatores abertos; pacote completo de dados enviado à nuvem

**Dados gerados por sessão:**

| Categoria | Dados | Uso na Plataforma |
| :--- | :--- | :--- |
| Elétricos | Potência (kW), energia (kWh), tensão, corrente, frequência | Base do faturamento e deteção de anomalias |
| Temporais | Início, fim, duração | Análise de padrões de uso e picos de demanda |
| Do utilizador | ID, método de autenticação, histórico | Vinculação da sessão ao rateio individualizado |
| Operacionais | Status, falhas, ID do carregador, vaga | Auditoria e relatórios para o síndico |

### Modelos de Negócio Avaliados

| Modelo | Funcionamento | Vantagens | Limitações |
| :--- | :--- | :--- | :--- |
| Recarga Gratuita | Custo assumido pelo estabelecimento | Atrai clientes; incentiva VEs | Alto custo operacional; baixa rotatividade |
| Cobrança por kWh | Utilizador paga pela energia exata | Transparência; justiça financeira | Exige equipamentos certificados |
| Cobrança por Tempo | Valor por minuto/hora conectada | Incentiva rotatividade | Injusto para veículos com recarga mais lenta |
| Assinatura Mensal | Taxa fixa por acesso ilimitado | Previsibilidade financeira | Ineficiente para uso baixo |
| **Rateio Proporcional (Adotado)** | kWh consumido + taxa fixa de infraestrutura, apenas para quem tem VE | Máxima justiça; transparência; escalável | Requer carregador inteligente com API |

---

## 🔍 2. As Três Frentes de Pesquisa

### Frente 1 — Contexto e Problema de Mercado

#### Opção A — Análise de Soluções Existentes

| Solução | Problema que Resolve | Funcionalidades Principais | Modelo de Negócio | Limitações |
| :--- | :--- | :--- | :--- | :--- |
| **Zaptec** | Sobrecarga de rede e divisão de custos em condomínios | Balanceamento dinâmico de carga; RFID; relatórios individuais; pagamento integrado | Hardware + assinatura SaaS | Forte dependência do ecossistema proprietário; custo elevado |
| **Wallbox Pulsar Plus** | Controle residencial e corporativo leve | App MyWallbox; relatórios de energia; integração solar; controle remoto | Venda do hardware; software básico incluso | Recursos avançados de faturamento dependem de OCPP terceiros |
| **ChargePoint** | Gestão de frotas e recarga pública comercial | App com mapa; processamento de pagamentos; relatórios detalhados | Hardware + SaaS + taxas de transação | Escala comercial; excessivamente complexo e caro para condomínios |
| **Neocharge** | Recarga doméstica com divisor de carga | Smart Splitter para múltiplos VEs no mesmo circuito; app de controle | Venda do hardware | Limitado a uso doméstico; sem plataforma condominial |
| **Copel Telecom EV** | Rede pública de recarga no Paraná | Rede própria de eletropostos; pagamento via app | Pagamento por sessão | Focado em recarga pública; sem solução condominial |

> **Oportunidade identificada:** nenhuma solução oferece, de forma integrada e acessível para o mercado condominial brasileiro, a combinação de rateio automático por kWh, integração com ANEEL, compatibilidade com GoodWe e IA para previsão e anomalias.

#### Opção C — Análise de Dados Públicos: Cenário Brasileiro

- **Crescimento da frota:** A ABVE registou crescimento de 59% na frota eletrificada em 2025, ultrapassando 150 mil veículos emplacados acumulados. Os modelos mais vendidos são BYD Dolphin, Dolphin Mini e GWM Ora 03
- **Infraestrutura desigual:** O Brasil possui mais de 169 mil pontos de recarga (AutoIndústria, Set/2025), mas a concentração na Região Sudeste — especialmente São Paulo — é desproporcional
- **Perfil de uso:** Cerca de 80% das recargas ocorrem em residências ou locais de trabalho. O perfil é predominantemente urbano e noturno
- **Recarga AC vs DC:** Carregadores AC são os mais comuns em condomínios por menor custo de instalação. Carregadores DC concentram-se em rodovias
- **Gargalo em condomínios:** A infraestrutura elétrica de prédios antigos em São Paulo não acompanha o crescimento da frota, tornando soluções de software a alternativa viável sem reformas elétricas milionárias

---

### Frente 2 — Base Regulatória e Técnica

#### Resolução Normativa ANEEL nº 1.000/2021

| Artigo | Conteúdo | Impacto no EV ChargeOps |
| :--- | :--- | :--- |
| **Art. 550** | A recarga por terceiros (condomínio cobrando pelo serviço) **não constitui comercialização de energia** — é prestação de serviço com preços livremente negociados | Legitima o modelo de negócio sem autorização de distribuidora |
| **Art. 552** | Carregadores não exclusivamente privados devem usar **protocolos abertos de comunicação** e supervisão remota | Exige compatibilidade com OCPP; o GoodWe HCA G2 e o backend do EV ChargeOps operam via protocolos abertos |
| **Art. 553** | Exige conformidade com normas técnicas da distribuidora, padrões técnicos e normas oficiais | A instalação deve seguir ABNT NBR IEC 61851, ABNT NBR 5410 e normas ENEL SP |
| **Arts. 45 e 46** | Compartilhamento de instalações elétricas exige acordo entre participantes, individualização contratual e definição de responsabilidades | O condomínio deve formalizar em assembleia as regras de uso antes da implantação |

A instalação requer também **comunicação prévia à distribuidora local (ENEL SP)** com projeto elétrico assinado por responsável técnico habilitado, informando o aumento de carga e a nova demanda contratada.

#### Normas Técnicas Complementares

- **ABNT NBR IEC 61851:** requisitos técnicos para sistemas de recarga condutiva de VEs — segurança, comunicação, conectores e proteção elétrica
- **ABNT NBR 5410:** instalações elétricas de baixa tensão — dimensionamento de circuitos, proteção e aterramento
- **Normas ENEL SP:** padrões próprios da concessionária para aumento de carga, conexão de carregadores e projetos elétricos

#### Normas Estaduais e Municipais — São Paulo

- **Lei Municipal de SP nº 17.336/2020:** proíbe síndicos e assembleias de impedir a instalação de carregadores por condôminos, desde que exista viabilidade técnica. Esta lei é um habilitador direto do mercado-alvo do EV ChargeOps, removendo a principal barreira jurídica à adoção
- **IT-39 do Corpo de Bombeiros (PMESP):** regula a operação de VEs e estações de recarga em garagens e subsolos. Exige distanciamentos, exaustão, sinalização e desligamento automático em caso de incêndio. O EV ChargeOps pode integrar a interrupção de sessões via software ao acionar alarmes prediais

#### Opção B — API GoodWe (SEMS Portal)

A API SEMS expõe dados estruturados via REST. Endpoints principais:

- `/v2/PowerStation/GetMonitorDetailByPowerstationId` — status geral da infraestrutura
- `/v2/EVCharger/GetSessionDetail` — dados completos da sessão

Exemplo de resposta JSON:
```json
{
  "device_id": "GW_HCA_1234",
  "status": "charging",
  "current_power_kw": 7.2,
  "energy_delivered_kwh": 14.5,
  "start_time": "2026-06-15T08:00:00Z",
  "end_time": null,
  "user_rfid": "TAG_APT42"
}
```

#### Interfaces do GoodWe HCA G2

| Interface | Função | Uso no EV ChargeOps |
| :--- | :--- | :--- |
| RS-485 | Comunicação com Smart Meters locais | Balanceamento de carga dinâmico |
| LAN / Wi-Fi | Conectividade para telemetria | Transmissão de dados de sessão para a nuvem |
| Bluetooth | Configuração local via app | Comissionamento inicial do equipamento |
| RFID | Leitura de tags de identificação | Autenticação física do utilizador na vaga |

#### Opção C — APIs Externas Complementares

- **Google Places API (evChargeOptions):** monitora a densidade de carregadores públicos próximos para subsidiar a política de preços condominial
- **ANEEL Open Data:** busca automática das tarifas atualizadas da distribuidora local (incluindo bandeiras tarifárias), atualizando o custo base do kWh no rateio mensal

---

### Frente 3 — Arquitetura e Inteligência Artificial

#### Opção A — Benchmarking de Modelos de Rateio

| Modelo | Funcionamento | Vantagens | Limitações |
| :--- | :--- | :--- | :--- |
| Rateio Coletivo | Todos os moradores dividem igualmente o custo, independentemente do uso | Simples; sem medição individual | Injusto; gera conflitos; quem não tem VE paga por quem usa |
| Medição por Painel Analógico | Medidor físico por vaga; leitura manual mensal | Medição individualizada física | Alto custo de instalação; sem dados para IA; operação manual |
| **Pay-Per-Use Digital (Adotado)** | Plataforma mede kWh por sessão via API e gera fatura automática | Máxima justiça; transparência total; dados para IA; escalável | Requer carregador inteligente com API e conectividade |

**Fórmula adotada:**

```
Valor_Total(u) = [Consumo_kWh(u) × Tarifa_efetiva_R$/kWh] + Taxa_infraestrutura
```

- `Consumo_kWh(u)` — soma da energia das sessões da unidade no período
- `Tarifa_efetiva_R$/kWh` — obtida da fatura do condomínio (energia + TUSD + impostos + bandeira)
- `Taxa_infraestrutura` — valor fixo mensal, cobrado apenas de utilizadores com VE cadastrado

**Casos excecionais contemplados:**
- Sessões interrompidas: contabilizadas com energia efetivamente registrada, sem penalidade
- Múltiplos VEs por unidade: consumo agregado sob o mesmo identificador condominial
- Meses sem recarga: utilizador paga apenas a cota condominial regular, sem acréscimo de energia
- Tarifa variável: atualização automática via ANEEL Open Data a cada ciclo

#### Opção B — Papel da Inteligência Artificial

A IA é estrutural na otimização de custos, segurança e experiência do utilizador:

1. **Regressão Linear — Previsão de Consumo:** treina com o histórico de sessões para estimar a carga total esperada na próxima quinzena ou mês. Permite ao síndico provisionar o caixa para pagamento da fatura de energia. Técnicas: regressão linear, gradient boosting, modelos de séries temporais

2. **Isolation Forest — Deteção de Anomalias:** monitora padrões de corrente, potência e duração de sessão. Sessões que excedam 3 desvios padrão da média, apresentem picos irregulares ou consumo incompatível com o veículo geram alertas preventivos — indicando falha de hardware ou uso não autorizado (furto de energia)

3. **k-means / DBSCAN — Clustering de Perfis de Uso:** segmenta utilizadores por padrão de recarga (ex.: "noturnos intensivos", "ocasionais de fim de semana", "diurnos em dias úteis"). Permite criar políticas diferenciadas por perfil para reduzir a demanda máxima

4. **Chatbot Conversacional:** integrado a WhatsApp ou portal web, responde automaticamente a perguntas dos moradores: consumo do mês, valor da última fatura, melhor horário para carregar

#### Opção C — Esquema Relacional da Base de Dados

| Entidade | Atributos Principais | Relacionamentos |
| :--- | :--- | :--- |
| **Unidade** | id_unidade, id_condominio, codigo_unidade, tipo, status | 1 : N Utilizadores (M:N); 1 : N Faturas |
| **Utilizador** | id_usuario, nome, email, tipo_vinculo, id_rfid, id_app | N : N Unidades; 1 : N Sessões |
| **Carregador** | id_carregador, fabricante_modelo, localizacao, potencia_nominal, id_sems, estado_operacional | 1 : N Conectores; 1 : N Sessões |
| **Sessão_Recarga** | id_sessao, id_carregador, id_usuario, id_unidade, dt_inicio, dt_fim, energia_kwh, potencia_media, status_final | N : 1 Utilizador; N : 1 Fatura; 1 : N Leituras |
| **Leitura_Medicao** | id_leitura, id_sessao, timestamp, energia_acumulada_kwh, potencia_kw, tensao, corrente | N : 1 Sessão (série temporal) |
| **Tarifa** | id_tarifa, referencia_mes_ano, distribuidora, valor_kwh_efetivo, bandeira_vigente, taxa_infraestrutura | 1 : N Faturas (rastreabilidade histórica) |
| **Fatura** | id_fatura, id_unidade, periodo, energia_total_kwh, valor_variavel, valor_taxa, valor_total, status_pgto | 1 : N Sessões; N : 1 Tarifa |

---

## 🏗️ 3. Arquitetura da Solução

> O diagrama de arquitetura encontra-se no ficheiro `arquitetura.png` na raiz do repositório.

### Camadas da Plataforma

| Camada | Componentes | Responsabilidade |
| :--- | :--- | :--- |
| **Física** | GoodWe HCA G2; veículo elétrico; cabo de recarga | Ponto de geração de energia e dados brutos |
| **Conectividade** | Wi-Fi do condomínio; RS-485; API SEMS; OCPP | Transmissão de telemetria e recepção de comandos |
| **Aplicação** | Python (FastAPI/Flask); PostgreSQL; scikit-learn; motor de rateio | Processamento de JSONs, regras de rateio, modelos de IA, consolidação de faturas |
| **Apresentação** | Dashboard web (síndico); WebApp/Mobile (morador) | Visualização de relatórios, alertas, previsões e faturas |

### Fluxo de Dados — Da Sessão à Fatura

```
Tag RFID ──► Autenticação backend ──► Sessão inicia
                                           │
                              Telemetria periódica (kW, kWh)
                                           │
                                  Leitura_Medicao (BD)
                                           │
                              Sessão encerra (energia_kwh final)
                                           │
                         Cálculo: valor = kWh × tarifa_efetiva
                                           │
                              Sessão_Recarga salva no BD
                                           │
                      Motor de Rateio (fim do ciclo de faturamento)
                                           │
                              Fatura gerada por unidade
                                           │
               ┌───────────────────────────┴──────────────────────┐
          Dashboard síndico                              App morador
        (relatório + alertas IA)                  (notificação + fatura)
```

---

## 🚀 4. Planejamento da Sprint 02

| Fase | Entregável | Tecnologias | Semanas |
| :--- | :--- | :--- | :--- |
| 1 | Banco de Dados Relacional | SQLite (dev) / PostgreSQL (prod); schema Sprint 01 | 1–2 |
| 2 | Backend e Integração | Python (FastAPI ou Flask); Mocks da API GoodWe SEMS | 3–4 |
| 3 | Motor de Rateio | Python; cruzamento sessões × tarifa × morador; output PDF/endpoint | 5–6 |
| 4 | Implementação de IA | scikit-learn (Regressão Linear + Isolation Forest); dataset simulado | 7–8 |

---

## 📚 5. Referências

- AGÊNCIA NACIONAL DE ENERGIA ELÉTRICA (ANEEL). **Resolução Normativa nº 1.000, de 7 de dezembro de 2021**. Disponível em: portal.aneel.gov.br
- PREFEITURA DE SÃO PAULO. **Lei Municipal nº 17.336, de 24 de março de 2020**. Dispõe sobre a instalação de equipamentos de recarga de veículos elétricos em edificações
- CORPO DE BOMBEIROS DO ESTADO DE SÃO PAULO (PMESP). **Instrução Técnica IT-39** — Segurança contra incêndio em garagens e subsolos
- ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **ABNT NBR IEC 61851**: Sistemas de recarga condutiva para veículos elétricos
- ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **ABNT NBR 5410**: Instalações elétricas de baixa tensão
- GOODWE. **Datasheet e Manual do Usuário — HCA G2 EV Charger**. Disponível em: goodwe.com
- GOODWE. **Documentação da API SEMS Portal**. Disponível em: semsportal.com
- ASSOCIAÇÃO BRASILEIRA DO VEÍCULO ELÉTRICO (ABVE). **Estatísticas de emplacamentos e infraestrutura**. Disponível em: abve.org.br
- AUTOINDUSTRIA. **Brasil tem 169 mil pontos para recarga de elétricos**. Set. 2025. Disponível em: autoindustria.com.br
- FORBES BRASIL. **Pontos de recarga para veículos eletrificados crescem 59% no Brasil**. Set. 2025
- ZAPTEC. **Dynamic Load Balancing**. Disponível em: help.zaptec.com
- OPEN CHARGE ALLIANCE. **OCPP — Open Charge Point Protocol**. Disponível em: openchargealliance.org
- WALLBOX. **Charging Session Statistics — MyWallbox App**. Disponível em: support.wallbox.com
- NEOCHARGE. **Smart Splitter**. Disponível em: getneocharge.com
