# Plano de implementação — EV ChargeOps

## 1. Objetivo e critérios de sucesso

Construir uma aplicação web responsiva e PWA instalável chamada **EV ChargeOps: Gestão Inteligente de Recarga Compartilhada**, em React + TypeScript + Vite + Tailwind CSS v4, como protótipo interativo totalmente local.

A entrega será considerada concluída quando:

- os perfis **Síndico/Administrador** e **Morador/Condômino** puderem ser alternados sem recarregar a aplicação;
- cada perfil tiver dashboard e navegação próprios, com os fluxos principais completos;
- o morador conseguir consultar carregadores, selecionar data/horário, criar/cancelar uma reserva e acompanhar sessões/consumo simulados;
- o administrador conseguir acompanhar indicadores, carregadores, sessões, reservas e cobranças simuladas, incluindo ações locais relevantes;
- o **ChargeOps AI Assistant powered by Gemini** estiver disponível de forma persistente em todas as telas, com conversa simulada local e respostas contextuais pré-definidas;
- a interface funcionar de forma coerente em desktop, tablet e mobile, mantendo hierarquia e legibilidade;
- a aplicação possuir manifest, ícones e service worker suficientes para instalação e uso offline do shell básico;
- navegação e estado principal sobrevivam a refresh quando fizer sentido por meio de URL e `localStorage`.

## 2. Escopo definido

### Incluído

- Protótipo local, sem autenticação ou backend reais.
- Fluxos principais completos; módulos secundários terão estados coerentes, sem integrações externas.
- Dois perfis alternáveis:
  - **Administrador:** visão operacional e financeira do condomínio.
  - **Morador:** disponibilidade, reserva, sessão e consumo individual.
- PWA instalável básica.
- Dados mockados e mutações locais persistidas no navegador.
- Estados de carregamento curto/simulado, vazio, sucesso e erro onde forem relevantes à experiência.
- Acessibilidade básica: navegação por teclado, foco visível, contraste, rótulos e semântica.

### Fora do escopo

- Login, autorização, banco de dados, APIs, pagamentos ou telemetria reais.
- Integração real com Gemini, carregadores GoodWe ou sistemas de condomínio.
- Push notifications, sincronização em segundo plano ou operação offline de mutações.
- Painel administrativo de configuração profunda, exportação real de arquivos e envio real de convites/notificações.

## 3. Direção visual

Usar os cinco contextos do Figma como referências de composição e padrões, não copiar literalmente os templates genéricos exportados:

- `1:1463`: estrutura de dashboard desktop, sidebar, KPIs, gráficos e tabela.
- `1:926`: visualização analítica, rankings/listas e densidade de dados.
- `1:2329`: adaptação mobile de visão geral e cartões compactos.
- `1:2547`: seleção de data e faixa de horário para reserva.
- `1:367`: comportamento e composição mobile do assistente/conversas.

Aplicar a identidade do produto:

- base dark/slate navy nas áreas operacionais e superfícies claras `#F8FAFC` onde a leitura de dados se beneficia;
- vermelho/laranja GoodWe (`#E11D48`, `#EA580C`) para marca, alertas e CTAs de alta prioridade;
- ciano/teal elétrico (`#0EA5E9`, `#10B981`) para energia, disponibilidade e estados positivos;
- cartões com raio predominante de 12 px, bordas discretas, sombras controladas e gráficos com brilho/gradiente sutil;
- Inter como fonte principal, carregada via Google Fonts/CSS, com fallback de sistema;
- ícones consistentes via `lucide-react`, evitando símbolos Unicode usados como ícones;
- animações curtas e funcionais para abertura de painéis, troca de perfil, feedback de reserva e expansão do chatbot; respeitar `prefers-reduced-motion`.

## 4. Arquitetura proposta

### Dependências a adicionar

- `react-router-dom`: rotas reais, links ativos e URLs recuperáveis.
- `lucide-react`: sistema único de ícones.
- `recharts`: gráficos responsivos e acessíveis o suficiente para os painéis simulados.
- `vite-plugin-pwa` (dev dependency): geração do manifest e service worker via Workbox.

Não adicionar biblioteca de estado global; Context + reducer e hooks locais são suficientes para este protótipo.

### Estrutura de arquivos

- `src/App.tsx`: composição de providers e roteador.
- `src/index.css`: Tailwind, import da fonte, tokens globais, resets e utilitários visuais necessários.
- `src/app/AppRouter.tsx`: definição das rotas e redirecionamentos por perfil.
- `src/app/AppShell.tsx`: shell responsivo com sidebar, topbar e navegação mobile.
- `src/components/`: primitives e componentes compartilhados (`Card`, `MetricCard`, `StatusBadge`, `DataTable`, `EmptyState`, `Modal`, `Toast`, `RoleSwitcher`, `ChartCard`).
- `src/components/assistant/`: botão flutuante, painel de conversa, quick prompts e mensagens.
- `src/features/admin/`: dashboard, carregadores/sessões e financeiro.
- `src/features/resident/`: dashboard, catálogo de carregadores, reserva e histórico/consumo.
- `src/features/booking/`: calendário, slots, resumo e confirmação/cancelamento.
- `src/data/mockData.ts`: fonte única dos dados iniciais.
- `src/types/domain.ts`: tipos de usuário, carregador, reserva, sessão, cobrança e mensagem.
- `src/state/AppState.tsx`: Context/reducer, persistência e ações locais.
- `src/hooks/`: persistência, media query e comportamento do painel mobile, apenas quando necessário.
- `public/icons/`: ícones PWA em tamanhos adequados.
- `vite.config.ts`: integração do plugin PWA.
- `.figma/make/site.json`: título, descrição, idioma e favicon, caso o formato atual permita sem conflito com o manifest.

### Rotas

- `/` redireciona para a rota inicial do perfil persistido.
- `/admin/overview`
- `/admin/operations`
- `/admin/billing`
- `/resident/overview`
- `/resident/chargers`
- `/resident/bookings`
- `/resident/usage`
- rota curinga redireciona para o dashboard válido do perfil atual.

A troca de perfil navega para o dashboard correspondente. O chatbot pertence ao shell e permanece montado nas mudanças de rota.

## 5. Modelo de dados e estado local

### Entidades principais

- `UserProfile`: id, nome, unidade, papel e avatar/iniciais.
- `Charger`: id, nome/local, conector, potência, status (`available`, `charging`, `reserved`, `offline`), ocupante e energia atual.
- `Booking`: id, usuário, carregador, início, fim e status (`upcoming`, `active`, `completed`, `cancelled`).
- `ChargingSession`: id, usuário, carregador, duração, kWh, custo, início e status.
- `Invoice/Charge`: competência, consumo, valor, vencimento e status.
- `AssistantMessage`: id, remetente, texto, timestamp e categoria opcional.

### Estado e persistência

- Context/reducer central guarda perfil ativo, reservas, carregadores, sessões, toasts e preferências do assistente.
- `localStorage` persiste perfil ativo, reservas criadas/canceladas e histórico básico do chat.
- Dados persistidos recebem versão de schema; payload inválido ou antigo volta com segurança aos mocks.
- A criação de reserva valida conflito de horário e disponibilidade antes de atualizar `Booking` e o status do carregador.
- Ações administrativas simuladas (marcar manutenção, encerrar sessão, confirmar cobrança) atualizam somente o estado local e produzem toast.
- Incluir ação “Restaurar dados de demonstração” em área discreta de preferências/perfil para facilitar testes repetidos.

## 6. Experiência por perfil

### Administrador

#### Dashboard `/admin/overview`

- saudação, condomínio selecionado e indicador de atualização;
- KPIs: carregadores ativos, potência instantânea, energia no mês, taxa de ocupação e receita/custo rateado;
- gráfico de consumo e demanda por período com seletor semanal/mensal;
- distribuição de status dos carregadores;
- sessões recentes e próximos agendamentos;
- alertas operacionais (offline, manutenção preventiva, conflito/atraso);
- ações rápidas para ver operações, cobrança e abrir o assistente.

#### Operações `/admin/operations`

- grid/tabela responsiva de carregadores com busca e filtros por status;
- detalhe selecionável em drawer/modal contendo localização, potência, sessão/reserva atual e histórico curto;
- ações locais: alternar manutenção/disponível e encerrar sessão ativa com confirmação;
- lista de reservas/sessões com filtros e estado vazio.

#### Financeiro `/admin/billing`

- resumo do mês: energia, custo, valor a ratear, adimplência;
- gráfico por unidade/morador;
- tabela de cobranças com status;
- ação simulada de marcar pagamento/reenviar aviso e feedback em toast;
- botão de exportar com feedback explícito de demonstração, sem gerar arquivo real.

### Morador

#### Dashboard `/resident/overview`

- resumo de próxima reserva ou sessão ativa;
- saldo/consumo do mês, custo estimado e comparação com mês anterior;
- disponibilidade imediata dos carregadores;
- atalhos para reservar, ver reservas e consumo;
- recomendações contextuais do assistente.

#### Carregadores `/resident/chargers`

- lista/cartões com localização, potência, conector, status e próximo horário livre;
- filtros de disponibilidade e potência;
- seleção de carregador abre o fluxo de reserva mantendo o carregador escolhido.

#### Reservas `/resident/bookings`

- fluxo em etapas no mesmo módulo:
  1. escolher carregador;
  2. escolher data em calendário horizontal/mensal responsivo;
  3. escolher slot disponível;
  4. revisar duração, energia/custo estimados e regras;
  5. confirmar e exibir estado de sucesso;
- lista de próximas reservas e histórico;
- cancelamento com confirmação e atualização imediata da disponibilidade;
- conflitos ou slots indisponíveis exibem mensagem acionável e preservam as escolhas válidas.

#### Consumo `/resident/usage`

- consumo/custo por período;
- gráfico de sessões;
- histórico detalhado com duração, kWh, valor e carregador;
- cartões compactos em mobile e tabela em telas maiores.

## 7. ChargeOps AI Assistant

- Botão flutuante persistente no canto inferior, reposicionado acima da navegação inferior em mobile.
- Desktop: painel lateral/flutuante; mobile: bottom sheet quase em tela cheia.
- Cabeçalho com nome **ChargeOps AI Assistant**, selo “powered by Gemini”, status online simulado, minimizar e fechar.
- Mensagem inicial muda conforme perfil e rota.
- Quick prompts contextuais, por exemplo:
  - administrador: “Quais carregadores exigem atenção?”, “Resuma o consumo do mês”, “Há conflitos de agenda?”;
  - morador: “Quando há vaga hoje?”, “Quanto gastei este mês?”, “Como cancelar minha reserva?”.
- Campo de envio aceita texto, adiciona mensagem do usuário, mostra indicador de digitação curto e retorna resposta determinística baseada em palavras-chave e dados atuais.
- Sem chamada de rede nem chave Gemini; a interface deixa claro em texto secundário que se trata de uma demonstração quando apropriado.
- Histórico curto persistido localmente e ação para iniciar nova conversa.
- Foco gerenciado ao abrir/fechar, `aria-live` para novas mensagens e teclado funcional.

## 8. Responsividade e navegação

- Desktop (`lg+`): sidebar fixa/colapsável, topbar e grade de conteúdo em múltiplas colunas.
- Tablet: sidebar compacta ou drawer, grids de duas colunas.
- Mobile: topbar simplificada, conteúdo em coluna única e bottom navigation por perfil.
- Tabelas viram listas/cartões sem exigir rolagem horizontal nos fluxos principais.
- Gráficos usam contêiner responsivo e legendas reduzidas no mobile.
- Modais grandes viram bottom sheets; áreas clicáveis mantêm pelo menos 44 px.
- Evitar alturas fixas de viewport que cortem conteúdo; considerar safe areas para PWA em iOS.

## 9. PWA instalável

- Configurar `vite-plugin-pwa` em `vite.config.ts` com:
  - `registerType: "autoUpdate"`;
  - manifest em português com nome, short name, descrição, `start_url`, `display: "standalone"`, cores de tema/fundo e ícones 192/512, incluindo máscara quando possível;
  - cache do app shell e assets estáticos gerados;
  - fallback de navegação para SPA.
- Gerar ícones simples da marca ChargeOps em `public/icons` sem depender de serviço externo.
- Adicionar meta tags de tema/apple e registrar o service worker pelo modo recomendado do plugin.
- Exibir um pequeno banner de “Atualização disponível” somente se o fluxo do plugin demandar confirmação; com `autoUpdate`, preferir atualização silenciosa para manter o escopo enxuto.
- Offline: abrir o shell e dados locais já carregados; deixar explícito que ações externas não existem no protótipo.

## 10. Acessibilidade e qualidade de interação

- Landmarks (`header`, `nav`, `main`, `aside`) e hierarquia correta de títulos.
- Nome acessível para botões somente com ícone.
- `aria-current` na navegação, `aria-expanded` em menus/painéis e `aria-live` em toasts/chat.
- Modal/drawer com foco inicial, fechamento por Escape e retorno de foco ao gatilho.
- Estados não dependem apenas de cor; combinar ícone, texto e cor.
- Contraste mínimo adequado em superfícies claras e escuras.
- Skeletons discretos apenas onde o atraso simulado agrega clareza; evitar animação excessiva.

## 11. Sequência de implementação

1. Instalar dependências e configurar tokens globais, tipografia, metadados e base PWA.
2. Criar tipos, mocks, reducer/contexto e persistência versionada.
3. Montar roteador e `AppShell` responsivo com troca de perfil.
4. Criar primitives compartilhadas e padrões de feedback (modal, toast, badges e estados vazios).
5. Implementar dashboard e módulos de operações/financeiro do administrador.
6. Implementar dashboard, carregadores, reserva e consumo do morador.
7. Implementar chatbot persistente e respostas contextuais locais.
8. Refinar responsividade, teclado, acessibilidade, animações e safe areas.
9. Validar PWA, persistência e todos os fluxos; corrigir divergências visuais/funcionais dentro do escopo.

## 12. Verificação

### Checks automatizados

- Executar `pnpm build` após as mudanças amplas para validar TypeScript, bundling, manifest e geração do service worker.
- Executar o formatador prescrito pelo repositório, `pnpm format`, e revisar o diff para garantir que somente arquivos intencionais foram alterados.
- Se forem adicionados testes durante a implementação, usar apenas a infraestrutura adotada no projeto; não introduzir framework de testes apenas para este protótipo.

### Validação manual no servidor já existente

Não iniciar outro servidor. Usar o preview já supervisionado e validar:

- redirecionamento inicial e URLs de todas as rotas;
- alternância de perfil e persistência após refresh;
- navegação desktop e mobile;
- criação de reserva válida, bloqueio de conflito, cancelamento e reflexo na disponibilidade;
- ações administrativas e feedback por toast/modal;
- filtros, buscas e estados vazios;
- abertura, envio, resposta, persistência e acessibilidade do chatbot em todas as rotas;
- layouts em aproximadamente 375 px, 768 px, 1280 px e 1440 px;
- foco por teclado, Escape, ordem de tabulação e redução de movimento;
- manifest detectável, service worker registrado, instalação possível e recarga offline do app shell.

## 13. Riscos e decisões de contenção

- Os contextos Figma são referências genéricas e não uma biblioteca de componentes pronta; implementar os padrões visualmente em componentes React responsivos, sem copiar posicionamento absoluto do código exportado.
- Para evitar escopo excessivo, gráficos terão dados mockados e controles de período locais; não haverá exploração analítica arbitrária.
- O chatbot simula Gemini; nenhum segredo, SDK ou endpoint será adicionado.
- A persistência local pode ficar desatualizada durante desenvolvimento; versionamento e “Restaurar demonstração” evitam estados quebrados.
- Imagens fotográficas não são essenciais para este produto operacional; priorizar ícones, gráficos e ilustração abstrata de energia, reduzindo peso e dependências de mídia.
