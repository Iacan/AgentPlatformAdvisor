# Changelog

Todas as mudanças relevantes do Agent Platform Advisor estão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), organizado pela data do commit no repositório.

## 2026-07-30

### Alterado

- **Aplicação e documentação traduzidas para português do Brasil.** Toda a interface visível ao usuário foi traduzida: `index.html`, os textos gerados em `assets/apa.js` e todo o conteúdo do `apa.yaml` (perguntas, opções, recomendações, regras rígidas, justificativas e notas contextuais). Os `id`s, as pontuações e as URLs do `apa.yaml` foram preservados sem alteração, de modo que links compartilhados antigos continuam resolvendo para as mesmas respostas e recomendações.
  - Nomes de produto permanecem em inglês (Microsoft 365 Copilot, Copilot Studio, Microsoft Foundry, Agent Builder, Databricks Agent Bricks, Copilot Cowork, Microsoft Scout, Copilot Chat), assim como os termos técnicos consagrados: lakehouse, Unity Catalog, tabelas Delta, RAG, MCP, computer use, prompt agents, toolboxes.
  - **Rótulos de faixa traduzidos** para "Encaixe forte / Bom encaixe / Encaixe parcial / Não recomendado". Isso exigiu duas mudanças de código, porque a lógica dependia do texto em inglês: `badgeClass()` agora casa pelas palavras `forte` / `bom` / `parcial` em vez dos prefixos `Strong` / `Good` / `Partial`, e a checagem do card secundário passou a usar a constante `NOT_RECOMMENDED_LABEL`, que espelha a menor faixa do `apa.yaml` — antes eram três literais `'Not recommended'` espalhados pelo arquivo.
  - `formatDateDisplay()` passou a produzir datas no formato brasileiro (`1 de jan de 2026`), e `<html lang>` e `og:locale` passaram a `pt-BR` / `pt_BR`.
  - Os 45 testes end-to-end foram reapontados para os textos em português e continuam passando. As asserções que dependiam de texto em inglês eram: contador de perguntas, rótulo de faixa, "Start Here", "Copied", "Take your own assessment", "recommendation has changed", "Retake assessment", o formato de data, o título da aba e o nome do grupo "Build agents".
- **Links da documentação no rodapé repontados** para este repositório. O link "Abra uma issue" apontava para `github.com/microsoft/cat/issues`, um repositório diferente do projeto; agora aponta para as issues deste repositório.
- **Crédito de autoria** desta versão atribuído a Iacan Ramos, no rodapé, na meta tag `og:author` e no README. A licença MIT original (Copyright Microsoft Corporation) permanece intacta em `LICENSE`.
- **Publicado no GitHub Pages** a partir da branch `main` (raiz), em `https://iacan.github.io/AgentPlatformAdvisor/`.

### Corrigido

- **`docs/FLOWCHART.md` ganhou uma legenda das plataformas.** O diagrama usava as siglas `AB`, `CS`, `Foundry` e `DBX` em todas as caixas de pontuação sem nunca dizer o que significavam — `DBX` (Databricks Agent Bricks) em particular aparecia 14 vezes sem uma única menção ao nome do produto. A legenda também explica quando o Agent Bricks pontua, quais quatro regras rígidas o zeram e quais dois desempates o favorecem.
- **`docs/SCORING.md` dizia "todas as 1.920 combinações possíveis"** logo acima de uma tabela cujos números somam 4.200 — e de uma nota, no parágrafo seguinte, explicando justamente que o espaço havia crescido de 1.920 para 4.200 quando o Agent Bricks acrescentou q1e, q2e, q4f e q3g. O total foi corrigido para 4.200.
- **A contagem de testes no README** dizia "39 testes em 6 arquivos de spec"; são 45 testes em 7 arquivos desde que `databricks-path.spec.js` foi adicionado. O README também não mencionava que a aplicação precisa ser servida por HTTP — abrir o `index.html` por `file://` faz o `fetch` do `apa.yaml` falhar e a tela de erro aparecer. Agora há uma nota explícita.

## 2026-07-28

### Adicionado

- **O Databricks Agent Bricks entra na avaliação pontuada de construção** como quinta plataforma (`databricks`) e primeira opção não-Microsoft da matriz. Ele cobre o cenário para o qual o advisor não tinha resposta: o valor do agente vem do patrimônio de dados, e não do Microsoft 365 — conhecimento governado no Unity Catalog, construído e servido pelo time que é dono dele. Baseado na [página do produto Agent Bricks](https://www.databricks.com/product/artificial-intelligence/agent-bricks) e na [documentação da Databricks](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/).
  - **As perguntas foram estendidas, e não acrescentadas** — continuam sendo cinco perguntas e escala de 0 a 15, então links compartilhados, faixas e a interface de pontuação seguem inalterados. Quatro novas opções dão lugar ao cenário de plataforma de dados: **q1e** (time de plataforma/engenharia de dados), **q2e** (entrega no ambiente de dados e analytics), **q4f** (raciocinar sobre grandes volumes de dados corporativos — extração em coleções de documentos, perguntas em linguagem natural sobre tabelas governadas, ajuste de qualidade com os próprios dados) e **q3g** (lakehouse / Unity Catalog / tabelas Delta). As quatro foram acrescentadas ao final de suas perguntas, então os índices de resposta e os links compartilhados existentes continuam resolvendo para as mesmas opções.
  - **O Agent Bricks é desqualificado onde genuinamente não alcança**, usando o mesmo mecanismo de regra rígida que já aplica os limites do Agent Builder: **q3a / q3b / q3d** (conteúdo do Microsoft 365 e catálogo de conectores do Copilot — o Agent Bricks se fundamenta no lakehouse, não em SharePoint, OneDrive, Teams ou Outlook) e **q2a** (chat do Microsoft 365 Copilot — os agentes são servidos pelo Databricks, sem caminho nativo de publicação ali). Por isso, ele nunca disputa o cenário clássico do Copilot; só aparece quando o usuário informa que o cenário está ancorado no seu patrimônio de dados. As quatro novas opções também zeram o Agent Builder, que não alcança nenhuma delas.
  - **Novos desempates e pares:** dados no lakehouse (q3g) preferem o Agent Bricks ao Copilot Studio em caso de empate; um time de plataforma de dados (q1e) o prefere ao Foundry. Dois pares complementares foram adicionados — *Agent Bricks + Foundry* (raciocínio no lakehouse mais a aplicação Azure, identidade e publicação no Microsoft 365) e *Copilot Studio + Agent Bricks* (raciocinar sobre os dados do lakehouse e entregar a resposta no Teams).
  - **Novas notas de contradição e de perfil:** conhecimento no lakehouse + entrega no chat do Copilot, usuário de negócio + lakehouse, e time de plataforma de dados + conteúdo do Microsoft 365; além de avisos de descompasso quando o Agent Bricks vence para um usuário de negócio ou um criador low-code, já que ele pressupõe um workspace Databricks, permissões do Unity Catalog e capacidade de serving.
  - Card da plataforma adicionado à página inicial e ao grupo de exploração *Criar agentes*, além de `images/databricks.svg` — uma marca provisória de camadas de lakehouse na cor de sinal da Databricks, a ser trocada pelo ativo oficial da marca.
  - **A tela Explorar passou a usar a largura ampla do workspace.** Um quarto card de construção ficava órfão na própria linha dentro do container de leitura de 1024px. O `.exploration-grid` saiu de 3 colunas fixas para `auto-fit` (que colapsa a trilha não usada, então o grupo *Usar* com 3 cards continua ocupando 3 colunas), e o `showSection()` aplica `.main-container--wide` apenas na seção de exploração — a largura de instrumento de 1200px que o `docs/DESIGN.md` já autoriza para superfícies de comparação. Os dois grupos agora preenchem exatamente uma linha a partir de 1100px; painéis do wizard com muito texto mantêm a largura de leitura de 1024px.
  - Análise de distribuição do `docs/SCORING.md` regerada por força bruta de todas as combinações através do `rankPlatforms()` real: o espaço cresceu de 1.920 para 4.200 combinações (5 × 4 × 5 × 6 × 7). Copilot Studio 68,7%, Foundry 20,3%, Agent Bricks 9,3%, Agent Builder 1,8%. A fatia do Agent Builder caiu de 3,1% apenas porque as quatro novas opções o desqualificam — sua pontuação não mudou.
  - Removida a palavra "Microsoft" da chamada da página inicial e das meta tags `description` / `og:description` ("recomendar a melhor plataforma **Microsoft** para suas necessidades de agente" → "a melhor plataforma"), já que o advisor agora pode chegar a uma plataforma não-Microsoft. Pendência conhecida: `images/og-image.png` é uma captura da página inicial de quando ela mostrava seis blocos, e o `og:image:alt` descreve seis — ambos precisam ser atualizados.
  - Novo `tests/e2e/databricks-path.spec.js` cobre o card de boas-vindas, o grupo de exploração, uma vitória de encaixe forte no lakehouse, os dois caminhos de desqualificação e a navegação pelas novas opções do wizard (45 testes passando).

## 2026-07-24

### Alterado

- **Novo favicon construído a partir da própria marca de rosto de robô da aplicação.** O `favicon.png` anterior era o ícone compartilhado do CAT em estranhos 232×193, declarado como `type="image/x-icon"` embora fosse um PNG. A substituição é o robô do logo do cabeçalho redesenhado como uma cabeça branca *sólida* sobre o bloco `#0078D4`, com os olhos e o sorriso vazados em azul e as saliências laterais mantidas como barras preenchidas. Formas sólidas eram necessárias: a cabeça em contorno lê como robô a 32px, mas vira borrão abaixo de ~24px, e remover o contorno de vez (deixando o bloco atuar como a cabeça) lê como um smiley genérico em vez de um agente. Entrega `favicon.svg` (escalável, usado pelo Chrome/Firefox em todos os tamanhos), fallbacks PNG de 16px/32px e um `apple-touch-icon.png` de 180px sangrado com cantos retos, já que o iOS aplica sua própria máscara.
- **URLs de Open Graph repontadas para o site publicado.** `og:image`, `twitter:image` e `og:url` apontavam para `microsoft.github.io/cat/agent-platform-advisor/`, que hoje é apenas um stub de redirecionamento por meta-refresh — a aplicação é servida em `microsoft.github.io/AgentPlatformAdvisor/`. O caminho antigo do `og:image` retornava 404, então as prévias de link não tinham imagem para buscar, independentemente do arquivo apontado; o `og:url` também anunciava o stub como URL canônica. Os três passaram a usar o host `AgentPlatformAdvisor`.
- **Imagem de prévia do Open Graph substituída por uma captura da aplicação.** O card apontava antes para o logo compartilhado `powercattools.png` do CAT, que não dizia nada sobre esta ferramenta; os links agora abrem `images/og-image.png`, uma captura 1200×630 da página inicial mostrando as seis plataformas entre as quais o advisor escolhe. Corrigido o `og:image:height` (declarado como `1200` para uma imagem 1200×1200), adicionados `og:image:type` e um `og:image:alt` descritivo, e adicionado `twitter:card="summary_large_image"` para que o X/Twitter renderize o card largo em vez de uma miniatura.
- **`README.md` e `.github/copilot-instructions.md` atualizados** para o destino unificado do Microsoft 365 Copilot: o wizard de ponto de entrada passou a listar três destinos mais uma superfície inicial, a seção de links de compartilhamento documenta `dt=m365_copilot` / `st=chat|agents` e os links antigos `ft=1` / `dt=copilot_chat`, e a contagem de testes foi corrigida para 39. As instruções do Copilot também ganharam uma nota de desenvolvimento local (a aplicação precisa ser servida por HTTP, senão o `fetch` do `apa.yaml` falha), uma tabela de parâmetros de link, um mapa dos arquivos de spec, comandos para rodar um único teste e fatos de design corrigidos (fontes IBM Plex, canvas em carvão quente, tokens rem `--fs-*` com piso de 12px) que haviam divergido do `docs/DESIGN.md`.
- **Cards de recomendação do ponto de entrada agora abrem seus acordeões por padrão.** Microsoft 365 Copilot, Cowork e Scout são resultados de card único, sem nada com que comparar — o card *é* a página — então *Ideal para*, *Pontos de atenção* e a lista de recursos começam expandidos, em vez de esconder a substância atrás de três cliques. Cards de plataformas pontuadas (Agent Builder, Copilot Studio, Foundry) permanecem recolhidos para manter a comparação legível. Conduzido por uma nova constante `ENTRY_POINT_PLATFORMS` no `apa.js`, substituindo o caso especial `platformId === 'm365_copilot'`.
- **Destino `copilot_chat` unificado ao `m365_copilot`.** O Copilot Chat é uma superfície *do* Microsoft 365 Copilot — assim como cada agente nativo — então modelá-lo como destino irmão de Cowork e Scout afirmava uma fronteira de produto que não existe (e, após a renomeação do título, produzia dois cards com o mesmo nome). O caminho de participação ativa do wizard de ponto de entrada agora sempre resolve para o único card do **Microsoft 365 Copilot**.
  - A resposta de **tipo de tarefa** não escolhe mais um destino; ela escolhe por qual superfície o card manda **começar**, renderizada pelo slot `spotlight` antes não utilizado: ajuda geral → **Copilot Chat**, tarefa especializada → **agentes nativos** (Researcher, Analyst, Facilitator, Interpreter).
  - Adicionado `recommendations.m365_copilot.start_here.{chat,agents}` ao `apa.yaml` e incorporada a orientação antiga do `copilot_chat` nos novos `best_for` / `watch_out_for` do `m365_copilot`; bloco de recomendação `copilot_chat` removido.
  - `resolveDelegateStart()` no `apa.js` deriva a superfície; `buildPlatformCard()` recebe um `startKey` e rotula o destaque como **Comece por aqui** (um `spotlight` estático continua sendo renderizado como *Recurso em destaque*).
  - Links de compartilhamento carregam a superfície como `&st=chat|agents`. O link antigo `?dt=copilot_chat` continua funcionando e resolve para o Microsoft 365 Copilot com a superfície Copilot Chat em destaque.
  - As notas "use X no lugar" do Cowork e do Scout agora apontam para *Microsoft 365 Copilot (Copilot Chat)* em vez de um produto irmão. Atualizados `docs/SCORING.md`, `docs/FLOWCHART.md`, os textos do prescreen e `tests/e2e/delegate-path.spec.js` (39 testes passando).
- **Título do destino `copilot_chat` renomeado para "Microsoft 365 Copilot"** (era "Copilot Chat"), o que faz com que ele compartilhe o título com o destino `m365_copilot`. `tests/e2e/delegate-path.spec.js` foi atualizado para que os dois não sejam mais distinguidos apenas por trecho do título: um novo helper `expectPrimaryCard()` verifica o texto exato de `.rec-platform-name` mais uma frase de descrição única de cada destino, para que os dois caminhos não possam trocar de lugar silenciosamente.
- **Escala tipográfica reconstruída sobre tokens rem, com todos os tamanhos elevados em um passo.** Uma auditoria descobriu que o CSS havia derivado um passo inteiro abaixo da escala documentada em `docs/DESIGN.md` — texto corrido em 14px (20 regras) contra os 15px documentados, captions em 12px e selos/eyebrows em 10-11px — e que todas as 74 declarações de `font-size` usavam `px`, então a preferência de tamanho de fonte do leitor não tinha efeito algum.
  - Adicionados tokens rem `--fs-display` … `--fs-mono-sm` no `:root` e `html { font-size: 100% }`; as 74 declarações agora referenciam um token.
  - Tamanhos sobem um passo: body 14 → 15/16px, caption 13 → 14px, mono 12 → 13px, e tudo que estava em 10-11px sobe para um **piso de 12px** (`.sc-badge`, `.pq-legend`, `.rec-spotlight-eyebrow`, `.exploration-card-spotlight-eyebrow`).
  - Removidos os dois ajustes responsivos que *reduziam* o texto em telas pequenas (`.progress-bar` → 11px em 768px, `.sc-badge` → 10px em 480px).
  - Texto corrido limitado a `70ch` — o container de 1024px produzia linhas de ~95ch.
  - Escala tipográfica do `docs/DESIGN.md` atualizada com os nomes dos tokens e as regras de dimensionamento só em rem, piso de 12px, sem redução no mobile e medida de linha.
- **Blocos de plataforma da página inicial passaram a parecer informativos, não clicáveis.** Eles eram estilizados como cards com borda e preenchimento e mudança de cor de borda no hover, o que sugeria que fossem selecionáveis. Removidos o tratamento de hover e o acabamento de card (fundo preenchido, borda completa, cantos arredondados) em favor de entradas planas, centralizadas e separadas por uma régua fina no topo, com `cursor: default`. Adicionada uma linha de introdução — "Estas são as opções que o advisor considera — clique em **Começar** abaixo para encontrar a sua." — para que a seção se leia como prévia dos destinos, e não como um menu.
- **Prévias de plataforma da página inicial centralizadas** — ícone, título e descrição ficam em um eixo central compartilhado (`.platform-preview-icon` é uma caixa flex centralizada; `.platform-preview` usa `text-align: center`).
- **Título do card de prévia de plataforma aumentado** de 16px para 20px, correspondendo ao token tipográfico `subhead` do `docs/DESIGN.md`, para que nomes de plataforma sejam lidos como títulos de card e não como texto corrido.
- **Tamanho do rótulo de grupo de delegação aumentado** de 11px para 13px (peso 500 → 600) para que os divisores de seção acima da grade de plataformas de delegação sejam legíveis de imediato.
- **Cor de sinal teal trocada pelo azul Microsoft** a pedido do usuário: o accent usado em opções selecionadas, progresso, plataforma vencedora, anéis de foco e CTAs primários agora é `#0078D4` (hover `#2B9AEE`, dim `#0B5187`) no modo escuro e `#005A9E` no modo claro. Canvas em carvão quente, neutros, tipografia e a regra de não usar brilhos permanecem inalterados; a semântica de `--success` / `--warning` / `--error` está intocada. `docs/DESIGN.md` atualizado.

## 2026-07-22

### Alterado

- **Caminho de delegação de duas perguntas substituído por um wizard de ponto de entrada** ("Onde você deve realizar esse trabalho?") que ajuda o usuário final a escolher entre Copilot Chat, agentes nativos do Microsoft 365 Copilot, Cowork e Scout a partir de padrões de trabalho em vez de nomes de produto — endereçando a dor de a Microsoft pedir ao usuário que escolha entre pontos de entrada demais.
  - Nova primeira pergunta — **Participação**: conduzir eu mesmo e iterar vs. delegar a um agente.
  - **Participação ativa** agora faz um desdobramento — **Tipo de tarefa**: ajuda geral (→ **Copilot Chat**) vs. tarefa especializada (→ **agentes nativos do Microsoft 365 Copilot**: Researcher, Analyst, Facilitator, Interpreter, …).
  - **Delegar** pergunta Cadência + Alcance (→ **Cowork**, **Scout** ou ambos). O wizard usa **revelação progressiva**: cada desdobramento só aparece quando seu ramo é escolhido (expansão suave da grade, respeitando `prefers-reduced-motion`), e desdobramentos recolhidos saem da ordem de tabulação — nada de conteúdo morto acinzentado. **O Alcance agora fica atrás da Cadência** — escolher "Delegar a tarefa inteira" revela apenas a pergunta de Cadência; a pergunta de Alcance ("Até onde ele precisa alcançar?") aparece depois que uma cadência é escolhida, de modo que os dois desdobramentos de delegação não aparecem mais ao mesmo tempo.
  - **Removido o bloco de prescreen autônomo de "experiência nativa do Microsoft 365 Copilot"** — esse destino agora é alcançado pelo wizard, eliminando a sobreposição de nomes com o Copilot Chat. O `m365_copilot` é reaproveitado como destino do wizard; o link antigo `?ft=1` ainda resolve para o mesmo card.
  - Entrada do prescreen reformulada para **"Me ajude a encontrar o lugar certo para realizar meu trabalho."**
  - Adicionado um bloco de recomendação `copilot_chat` ao `apa.yaml` com referências cruzadas do tipo "use X no lugar quando…" para os agentes nativos, Cowork e Scout (e vice-versa).
  - Compartilhável via `?dt=copilot_chat` e `?dt=m365_copilot`.
  - Textos das opções do wizard ajustados para ecoar o vocabulário de tarefas do "Microsoft 365 Copilot: o que usar e quando" — ajuda geral (brainstorm, buscar informação, colocar e-mails/reuniões em dia, redigir e editar documentos), sob demanda (trabalho de várias etapas / vários artefatos de uma vez) e contínua (sempre ativo, gerenciar e coordenar meu dia) — para que os usuários se identifiquem mais rápido.
  - `docs/SCORING.md` e `docs/FLOWCHART.md` atualizados; cobertura do Playwright estendida para o wizard de ponto de entrada e o destino de agentes nativos.
- **Identidade visual atualizada para o Warm Charcoal Instrument** (via `/design-shotgun`): o canvas quase preto `#0C0F14` anterior, com um único brilho azul-ciano de sinal, remetia à estética genérica de ferramenta de IA. O novo sistema mantém IBM Plex Sans/Mono, mas troca para um canvas em carvão fosco e quente (`#1A1714`, sem preto-azulado) com um único sinal **teal** contido (`#17B0A7`) e nenhum brilho colorido.
  - Paletas `:root` escura e clara retokenizadas; removidos os dois brilhos azuis de `box-shadow` e o tom azul da grade do canvas.
  - `docs/DESIGN.md` atualizado (direção, tabela de cores, nota de modo claro, regra de não usar brilhos, Registro de decisões). Todos os 38 testes do Playwright passando.

## 2026-07-20

### Adicionado

- Adicionada uma opção de tarefa de análise de conteúdo para cenários leves de documento, gráfico, imagem e análise de dados.
- Adicionada uma opção de dados de web/arquivos enviados para fontes web delimitadas, PDFs, arquivos do Office e conteúdo incorporado.

### Alterado

- **Design system Graphite Decision Instrument implementado** em toda a aplicação:
  - Canvas em grafite escuro (`#0C0F14`) com textura sutil de grade como tema padrão
  - Tipografia IBM Plex Sans + IBM Plex Mono (substituindo Segoe UI / Geist Mono)
  - Accent azul-ciano `#2BA8FF` para todas as cores de sinal, progresso e CTAs
  - Abordagem dark-first: escuro é o padrão, claro é o alternativo
  - Escala tipográfica atualizada: title 36px, heading 26px, subhead 20px, body 15px
  - Estilo de componentes refinado: cards com arestas iluminadas, barras de pontuação de nível instrumento, hierarquia de superfícies
  - Conformidade total de contraste WCAG AA mantida
  - Todos os 32 testes do Playwright passando
- `README.md` atualizado para refletir a evolução da ferramenta: uso do Copilot nativo, delegação a agente pessoal, formas de usar ou criar agentes, posicionamento atual das plataformas, roteamento de delegação e a cobertura de testes mais recente.
- Orientação e pontuação do Agent Builder atualizadas para os recursos atuais: conteúdo do Microsoft 365, web delimitada, arquivos enviados, conhecimento de Teams/Outlook/Pessoas, conectores do Microsoft 365 Copilot habilitados pelo administrador, interpretador de código e geração de imagens.
- Agent Builder reposicionado além dos cenários restritos a SharePoint/OneDrive, com aumento das pontuações para cenários no-code de conhecimento em times pequenos, apoiados em conectores, de web/arquivos enviados e de conteúdo/análise de dados leve.
- Esclarecido que o Agent Builder continua desqualificado para públicos externos, implantação em app personalizado, execução em segundo plano/orientada a eventos, integrações diretas com sistemas de negócio, arquiteturas de recuperação personalizadas e fluxos de ação de várias etapas que enviam formulários ou atualizam sistemas externos.
- Orientação de público interno dividida entre time pequeno e implantação interna ampla, com esclarecimentos sobre sistemas de negócio via conectores, integrações diretas e arquiteturas de recuperação personalizadas.
- Orientação e pontuação do Copilot Studio atualizadas para a experiência de agente mais recente, orquestração generativa, fluxos disparados por evento, computer use, ferramentas/recursos MCP, agentes conectados/filhos, integrações A2A, Microsoft IQ, preview do Foundry IQ, preview de memória por usuário, seleção de modelos, avaliação nativa, monitoramento, inventário de agentes e considerações de custo dos Copilot Credits.
- Pontuação do Copilot Studio aumentada para agentes em segundo plano/disparados por evento, integração com Dataverse/conectores personalizados/APIs, orquestração complexa mas low-code e perfis de IA/ML, preservando o Foundry como encaixe mais forte para treinamento de modelos personalizados, controle arbitrário de modelo/runtime próprio, orquestração code-first em larga escala e arquitetura de recuperação personalizada.
- Orientação de fontes de dados dividida entre integração com sistemas de negócio (Dataverse, conectores personalizados, APIs diretas: Copilot Studio mais forte) e arquitetura de recuperação personalizada (RAG personalizado, Azure AI Search, índices privados, Foundry IQ, recuperação mantida pela engenharia: Foundry mais forte). A matriz pontuada passou a ter 1.920 combinações de respostas.
- Orientação e pontuação do Microsoft Foundry atualizadas para refletir os recursos atuais do Foundry Agent Service: agentes baseados em prompt, agentes de código hospedados, endpoints gerenciados estáveis, publicação no Microsoft 365 Copilot e no Teams, integração com apps/serviços personalizados, Foundry IQ, toolboxes, MCP, identidades de agente, RBAC, rede privada, tracing, avaliação, otimização, monitoramento e controles de produção em escala Azure.
- Pontuação do Foundry aumentada para implantação em app personalizado, implantação em múltiplas superfícies, publicação no Microsoft 365 Copilot/Teams, análise de conteúdo/dados controlada pelo desenvolvedor e fundamentação em Microsoft 365/web/arquivos, mantendo o Foundry como mais forte para arquitetura de recuperação personalizada e agentes de produção full-code.
- Removida a linguagem excessivamente específica de posicionamento de memória do Foundry, substituída por orientação mais conservadora de runtime de produção.
- Orientação do Microsoft 365 Copilot atualizada para cobrir Copilot Chat, Copilot Search, experiências de Copilot nativas dos apps, Copilot Pages e Notebooks, e agentes criados pela Microsoft como camada nativa de produtividade para usuários internos licenciados.
- Copilot Search e Copilot Pages/Notebooks adicionados ao card de recomendação do Microsoft 365 Copilot, Researcher atualizado para usar a página oficial do Learn, e recursos do Facilitator e do Interpreter esclarecidos.
- Cowork e Scout adicionados como cards próprios na página Explorar.
- Rótulo do acordeão do card de recomendação atualizado para que o Microsoft 365 Copilot possa exibir recursos nativos ao lado dos agentes nativos.
- Linha "Usar agentes" da página inicial movida para cima da linha "Criar agentes", com Microsoft 365 Copilot, Cowork e Scout exibidos antes de Agent Builder, Copilot Studio e Microsoft Foundry.
- Página Explorar reorganizada em uma grade de três cards no desktop, para que os seis cards formem duas linhas de três.
- Links de README, Changelog, Flowchart e Scoring movidos do menu hambúrguer do cabeçalho para uma linha de documentação no rodapé, abaixo do crédito de autoria.
- Texto de ponto de partida da tela Explorar corrigido para usar o modelo de decisão aprovado, "formas de usar ou criar agentes".
- Página Explorar agrupada em seções "Usar agentes" e "Criar agentes", para que a página reflita o modelo de decisão atual em vez de uma galeria plana.
- Design system substituído pela direção Graphite Decision Instrument: superfícies em grafite escuro, tipografia IBM Plex, cor de sinal azul-ciano, trilhos de decisão, painéis de evidência e regras anti-slop mais rígidas.
- `docs/SCORING.md` e `docs/FLOWCHART.md` atualizados para corresponder à matriz de pontuação e à orientação de recomendação atuais.

## 2026-07-14

### Adicionado

- Adicionado um grupo separado de delegação com Cowork e Scout na página inicial.
- Adicionadas legendas curtas abaixo de todos os blocos de plataforma e de delegação.

### Alterado

- Cards de delegação centralizados abaixo das quatro plataformas de construção, sob um divisor "Ou delegue".
- `LICENSE.md` renomeado para `LICENSE`.

## 2026-07-13

### Adicionado

- Copilot Cowork e Microsoft Scout adicionados como destinos de delegação no `apa.yaml`, com conteúdo de recomendação e imagens.
- Adicionado um caminho de prescreen para usuários que querem um agente pronto que faça o trabalho por eles.
- Adicionado roteamento de cadência/alcance entre Cowork e Scout: trabalho sob demanda no Microsoft 365 vai para o Cowork; trabalho contínuo ou multiambiente vai para o Scout; sinais indefinidos mostram os dois.
- Adicionadas URLs compartilháveis de resultado de delegação via `dt=cowork|scout|both`.
- Adicionados testes end-to-end para o roteamento do caminho de delegação e o carregamento por URL.

### Alterado

- Caminho de delegação documentado em `docs/CHANGELOG.md`, `docs/FLOWCHART.md` e `docs/SCORING.md`.

## 2026-06-10

### Adicionado

- Adicionado `.github/improvements.md`.

### Alterado

- Copilot Cowork elevado nas superfícies do Microsoft 365 Copilot.
- Adicionado um destaque dedicado ao Cowork no card de recomendação do Microsoft 365 Copilot.
- Textos de recomendação, exploração e página inicial do Microsoft 365 Copilot atualizados para começar por Cowork e agentes nativos.

## 2026-05-09

### Alterado

- `fast-uri` atualizado de 3.1.0 para 3.1.2 no `package-lock.json`.

## 2026-04-30

### Alterado

- Textos de recomendação e de avaliação atualizados com base em feedback.

## 2026-04-24

### Adicionado

- Adicionada a licença do repositório.
- Adicionados templates de issue para relato de bug e pedido de funcionalidade.

### Alterado

- Templates de issue atualizados.

## 2026-04-21

### Alterado

- Acordeões do Microsoft 365 Copilot expandidos automaticamente no caminho de recomendação fast-track.
- Conteúdo de recomendação do Microsoft 365 Copilot atualizado.
- Informações do Cowork ajustadas nas superfícies do Microsoft 365 Copilot.

### Corrigido

- Formatação do README corrigida.

## 2026-04-20

### Adicionado

- Adicionado um menu hambúrguer de documentação no cabeçalho, com links para README, Changelog, Flowchart e Scoring.
- Adicionado `.github/copilot-instructions.md`.

### Alterado

- README atualizado para refletir os recursos da v2 e o estado atual.
- Estrutura do changelog atualizada.
- Página inicial atualizada.
- Interface do prescreen renovada com ícones, acentos coloridos e tipografia atualizada.

### Removido

- `CLAUDE.md` removido após as instruções relevantes serem movidas para `.github/copilot-instructions.md`.

## 2026-04-10

### Alterado

- Removida a regra rígida do Agent Builder para sistemas de negócio via conectores (`q3b`), refletindo uma capacidade de conectores limitada, mas não nula.
- Pontuação do Agent Builder atualizada para a combinação de Microsoft 365 e sistemas via conectores (`q3d`).
- `docs/FLOWCHART.md` e `docs/SCORING.md` atualizados para as mudanças de pontuação.

### Removido

- Removido o `CHANGELOG.md` duplicado da raiz; o `docs/CHANGELOG.md` passou a ser a única fonte do changelog.

## 2026-04-08

### Adicionado

- Adicionado o Clarity analytics.
- Adicionadas atualizações de documentação para o comportamento de pontuação e do flowchart.

### Alterado

- Lógica de pontuação e de resultado atualizada.
- Botão de compartilhar resultados movido para dentro do fluxo de recomendação.
- `apa.yaml`, `assets/apa.js`, `assets/apa.css`, `index.html` e os testes do Playwright atualizados para a lógica revisada.

## 2026-04-07

### Adicionado

- Adicionada a aplicação web estática inicial do Agent Platform Advisor v2: `apa.yaml`, `assets/apa.css`, `assets/apa.js` e `index.html`.
- Adicionadas as imagens de plataforma para Agent Builder, Microsoft 365 Copilot, Copilot Studio e Microsoft Foundry.
- Adicionados os arquivos iniciais de README e changelog.
- Adicionado o `SECURITY.md` exigido pela Microsoft.
- Adicionados os documentos de design, pontuação e flowchart em `docs/`.
- Adicionadas a configuração do Playwright e os testes end-to-end para fast-track, compartilhamento, links compartilhados, mudanças temporais e conclusão do wizard.
- Adicionados o manifesto de pacote e o lockfile.
- Adicionadas correções de favicon e de imagens.
- Adicionado um botão de CTA de recursos.

### Alterado

- Interface, CSS e comportamento iniciais da aplicação refinados.
- `.gitignore` atualizado.
- README e conteúdo da aplicação atualizados após a importação inicial.

### Removido

- Removido o `TODOS.md` temporário.
