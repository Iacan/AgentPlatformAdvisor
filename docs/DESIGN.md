# Design System do Agent Platform Advisor

## Contexto do produto

- **O que é:** uma aplicação web estática, orientada por YAML, de apoio à decisão, que recomenda a experiência de agente da Microsoft certa para um cenário.
- **Para quem:** clientes corporativos Microsoft, usuários de negócio, profissionais de TI, desenvolvedores profissionais, arquitetos e engenheiros de dados/ML escolhendo como usar, delegar ou criar agentes.
- **Espaço/setor:** produtividade Microsoft, Copilot, ferramentas de IA corporativa e orientação na escolha de plataforma.
- **Tipo de projeto:** aplicação de página única com fluxo de prescreen, wizard pontuado, resultados de recomendação e orientação exploratória.
- **Distribuição:** site estático no GitHub Pages, publicado por Iacan Ramos.
- **Coisa memorável:** software sério de decisão para quem constrói e compra IA Microsoft.

## Direção estética

- **Direção:** Warm Charcoal Instrument (instrumento em carvão quente).
- **Nível de decoração:** intencional. Use divisores finos, trilhos de pontuação, textura sutil de grade e leituras diagnósticas. Não use blobs decorativos, seções hero com gradiente, brilhos (glows) nem ornamentos de ícone dentro de círculo.
- **Sensação:** a aplicação deve parecer um console de decisão de engenharia. O usuário deve sentir que a ferramenta está medindo o cenário dele, e não vendendo um produto genérico de IA.
- **Postura na categoria:** manter fluência Microsoft por meio de confiança, clareza e acessibilidade. Afastar-se do visual padrão de ferramenta de IA (fundo quase preto + brilho azul de sinal) usando um workspace em carvão fosco e quente com um único azul Microsoft contido como sinal, sem brilhos.
- **Referências:** princípios do Fluent 2, páginas de produto do Microsoft 365 Copilot, páginas do Copilot Studio, superfícies do Microsoft Foundry e orientações atuais de dashboards de IA corporativa.

## Tipografia

- **Display/Hero:** `"IBM Plex Sans", sans-serif` em peso 600-700.
  - Use para o título do produto, texto das perguntas, títulos de recomendação e afirmações grandes de decisão.
  - Motivo: transmite engenharia, seriedade e legibilidade sem cair na convergência padrão Segoe/Inter/Roboto.
- **Corpo/UI:** `"IBM Plex Sans", sans-serif` em peso 400-500.
  - Use para todo o texto corrido, texto de opções, explicações, botões e rótulos de interface que não sejam metadados diagnósticos.
- **Dados/Tabelas/Rótulos:** `"IBM Plex Mono", "Geist Mono", "Cascadia Code", monospace`.
  - Use para números de pontuação, IDs de plataforma, contadores de etapa, deltas de encaixe, metadados diagnósticos e rótulos compactos.
  - Sempre use `font-variant-numeric: tabular-nums` em pontuações numéricas e comparações de pontuação.
- **Fallback:** Aptos ou Segoe UI podem aparecer depois da IBM Plex na pilha, para ambientes Microsoft, mas são fallbacks, não a assinatura visual.
- **Carregamento:** use Google Fonts ou uma estratégia de fontes auto-hospedadas com `font-display: swap`.
  - `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`

### Escala tipográfica

| Token | Variável CSS | Tamanho | Peso | Uso |
|---|---|---:|---:|---|
| display | `--fs-display` | 3rem / 48px | 700 | Tese da primeira tela, título da recomendação final |
| title | `--fs-title` | 2.25rem / 36px | 700 | Títulos de página, títulos principais de resultado |
| heading | `--fs-heading` | 1.625rem / 26px | 600 | Texto das perguntas, títulos de seção |
| subhead | `--fs-subhead` | 1.25rem / 20px | 600 | Títulos de card, títulos de painel |
| body-lg | `--fs-body-lg` | 1.125rem / 18px | 400 | Texto de abertura, explicações importantes |
| body | `--fs-body` | 1rem / 16px | 400 | Texto padrão da interface, rótulos de opção |
| body-sm | `--fs-body-sm` | .9375rem / 15px | 400-500 | Texto de apoio, descrições de opção, botões |
| caption | `--fs-caption` | .875rem / 14px | 400 | Detalhes secundários |
| mono | `--fs-mono` | .8125rem / 13px | 500-600 | IDs de plataforma, contadores, rótulos de pontuação |
| mono-sm | `--fs-mono-sm` | .75rem / 12px | 500-600 | Selos e legendas (**o menor tamanho permitido**) |

- **Sempre use `rem`, nunca `px`, para `font-size`.** Os tamanhos são declarados uma única vez como tokens `--fs-*` no `:root` e referenciados em todo o resto, para que a preferência de tamanho de fonte do navegador escale a aplicação inteira. `html { font-size: 100% }`. Não redefina para `62.5%` nem para um valor fixo em px.
- **12px é o piso.** Nenhum texto abaixo de `--fs-mono-sm`, incluindo selos, eyebrows e legendas. Pequeno + caixa alta + espaçado + `--muted-foreground` é a combinação menos legível do sistema; não empilhe as quatro coisas abaixo de 13px.
- **Nunca reduza a tipografia nos breakpoints mobile.** Ajustes responsivos podem reduzir os tamanhos de display/title por questão de comprimento de linha, mas body, caption e mono se mantêm em qualquer viewport.
- **Medida de linha:** limite o texto corrido a ~70ch. O container tem 1024px de largura, o que gera linhas de ~95ch no tamanho body.

## Cor

- **Abordagem:** sistema contido em carvão quente, com escuro como padrão. Uma cor de sinal saturada (azul), neutros quentes e foscos (sem preto-azulado), sem brilhos, cores semânticas reservadas para estado real.

| Token | Hex | Uso |
|---|---|---|
| `--canvas` | `#1A1714` | Fundo da página (carvão fosco e quente) |
| `--surface` | `#221E1A` | Painéis principais e cards |
| `--surface-raised` | `#2A241F` | Painéis ativos, opções selecionadas, leituras de resultado |
| `--surface-hot` | `#332E28` | Estado de hover/ativo da superfície |
| `--text` | `#ECE6DC` | Texto primário (off-white quente) |
| `--muted` | `#9C9384` | Texto secundário e explicativo |
| `--border` | `#332E28` | Bordas e divisores padrão |
| `--border-hot` | `#453E35` | Bordas ativas e arestas de painel |
| `--accent` | `#0078D4` | Sinal primário: vencedor, progresso, foco, trilhos de pontuação, CTA principal |
| `--accent-strong` | `#2B9AEE` | Destaques de hover/foco e rótulos de alta ênfase |
| `--accent-dim` | `#0B5187` | Preenchimentos de progresso de baixa ênfase e visualização de dados discreta |
| `--success` | `#35C08A` | Encaixe forte, delta positivo, sucesso |
| `--warning` | `#E0B24B` | Ressalvas, decisões apertadas, avisos de confiança |
| `--error` | `#E5695E` | Conflitos de regra rígida e falhas |

- **Modo claro:** modo secundário opcional, não a identidade. Se mantido, inverta o sistema deliberadamente em vez de achatar tudo em cards brancos. Use canvas `#F4F7FB`, superfície `#FFFFFF`, texto `#172033`, muted `#5D6B80`, e mantenha um azul profundo `#005A9E` como cor de sinal.
- **Sem brilhos:** não adicione `box-shadow` colorido nem `text-shadow` no accent. O sinal se comunica por matiz e posicionamento, não por bloom.
- **Contraste:** o texto corrido precisa atender ao WCAG AA. Texto em accent sobre superfícies escuras precisa ser testado, não presumido.

## Espaçamento

- **Unidade base:** 4px.
- **Densidade:** compacta-confortável. Mais apertada que uma página de marketing, menos densa que um dashboard de monitoramento.

| Token | Valor | Uso |
|---|---:|---|
| 2xs | 2px | Bordas finas, deslocamentos mínimos |
| xs | 4px | Espaços inline apertados |
| sm | 8px | Espaços de rótulo, padding compacto |
| md | 16px | Padding de opção, ritmo de formulário |
| lg | 24px | Padding de painel, interior de seções |
| xl | 32px | Espaçamento de conteúdo principal |
| 2xl | 48px | Espaços entre seções da tela |
| 3xl | 64px | Ritmo do primeiro viewport |

## Layout

- **Abordagem:** layout híbrido de instrumento. Use disciplina de grade para legibilidade, mas evite catálogos simétricos de cards como modelo mental principal.
- **Workspace principal:** um espaço de decisão com três zonas quando há espaço:
  - Esquerda: trilho de intenção ou de encaixe ao vivo.
  - Centro: pergunta atual, recomendação ou explicação do cenário.
  - Direita: painel de evidências, justificativa da pontuação, avisos ou detalhes de próximos passos.
- **Página Explorar:** agrupe por modelo mental, não em uma galeria plana.
  - Usar agentes: Microsoft 365 Copilot, Copilot Cowork, Microsoft Scout.
  - Criar agentes: Agent Builder, Copilot Studio, Microsoft Foundry, Databricks Agent Bricks.
  - Os grupos têm tamanhos diferentes (3 e 4), então a grade usa trilhas `auto-fit` em vez de um número fixo de colunas: a trilha não usada colapsa e cada grupo preenche uma linha, sem deixar um card órfão.
  - Explorar é a única tela que usa a largura de instrumento de 1200px; todas as outras seções mantêm a largura de leitura de 1024px. Aplicado via `.main-container--wide` em `showSection()`.
- **Wizard:** o usuário deve sempre saber qual é a pergunta atual, o progresso atual e como cada resposta afeta a confiança da recomendação.
- **Resultados:** a recomendação vencedora deve parecer um relatório diagnóstico: delta de pontuação, por que venceu, notas de regra rígida e próximos passos.
- **Grade:** 12 colunas no desktop, 8 colunas no tablet, layout de coluna única no mobile.
- **Largura máxima de conteúdo:** 1200px para o workspace de instrumento, 1024px para painéis do wizard com muito texto.
- **Raio de borda:** `sm: 4px`, `md: 8px`, `lg: 12px`, `full: 9999px`. O raio deve expressar hierarquia de contenção, não decoração arredondada.
- **Elevação:** prefira bordas, arestas iluminadas e contraste de superfície a sombras grandes. Sombras podem ser usadas com parcimônia em modais.

## Movimento

- **Abordagem:** mínimo-funcional, com um comportamento assinatura: calibração de pontuação/leitura.
- **Easing:** entrada `ease-out`, saída `ease-in`, movimento `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Duração:**
  - micro: 50-100ms para hovers e foco.
  - curta: 150-220ms para seleção de opção e mudança de painel.
  - média: 250-400ms para transições de seção.
  - longa: 600-900ms para a calibração do trilho de pontuação.
- **Regras:**
  - Anime apenas transform, opacity e larguras de pontuação.
  - Não use `transition: all`.
  - Respeite `prefers-reduced-motion`.
  - O movimento precisa explicar a mudança de estado. Nada de shimmer decorativo, bounce ou teatro de rolagem.

## Componentes e padrões

### Trilho de decisão

Use um trilho persistente ou contextual para mostrar o encaixe atual das plataformas. Cada linha inclui:
- ID da plataforma em monoespaçada.
- Pontuação atual ou rótulo de encaixe.
- Barra fina de sinal.
- Delta opcional em relação ao líder.

O trilho transforma o advisor em um instrumento e reduz a sensação genérica de questionário.

### Painel de evidências

Use um painel lateral ou seção expansível para:
- Por que a recomendação líder mudou.
- Exclusões por regra rígida.
- Avisos de confiança.
- Links de fonte/justificativa.
- Próximas ações.

### Cards de opção

Cards de opção são permitidos apenas quando eles *são* a interação. Precisam ter rótulo claro, explicação concisa, estado selecionado visível, foco por teclado e área de toque suficiente.

### Grupos da tela Explorar

A tela Explorar não deve ser uma galeria indiferenciada de seis cards. Ela precisa preservar o modelo de decisão:
- Usar agentes.
- Criar agentes.

Cada grupo precisa de uma explicação curta do que ele significa antes de listar os produtos.

## Regras anti-slop

Nunca introduza estes padrões sem aprovação explícita:

- Gradientes roxo/violeta como sinal padrão de IA.
- Grades genéricas de três colunas com ícone, título e descrição de duas linhas.
- Ícones dentro de círculos coloridos como decoração.
- Seções hero com tudo centralizado.
- Blobs decorativos, ondas, orbes flutuantes ou formas abstratas de IA.
- Raio de borda grande e uniforme em todos os elementos.
- Botões de CTA com gradiente.
- Imagens hero em estilo banco de imagens.
- Texto de marketing vago como "libere o poder da IA" ou "feito para o futuro".
- Galerias de cards brancos e planos como arquitetura de informação principal.

## Acessibilidade

- Todos os alvos interativos devem ter pelo menos 44px de altura ou largura.
- Todo elemento interativo personalizado precisa ter suporte a teclado e `:focus-visible` visível.
- O contraste do texto corrido precisa atingir 4,5:1. Textos grandes e componentes de interface precisam atingir 3:1.
- Não codifique status apenas com cor. Combine cor com rótulo, ícone ou texto.
- Preserve rótulos visíveis. Nunca use placeholders como rótulos.
- Suporte a movimento reduzido.

## Orientação de migração

A implementação atual ainda pode usar o sistema Fluent-light antigo até o redesenho ser concluído. Trabalhos visuais futuros devem migrar para este sistema em seções coerentes, não um token por vez. Priorize:

1. Agrupamento e linguagem de modelo de decisão na página Explorar.
2. Estilo de relatório diagnóstico na página de resultados.
3. Progresso do wizard e comportamento de calibração da pontuação.
4. Implementação dos tokens de grafite escuro.
5. Migração tipográfica para IBM Plex Sans e IBM Plex Mono.

## Registro de decisões

| Data | Decisão | Justificativa |
|---|---|---|
| 2026-07-30 | Interface e documentação traduzidas para português do Brasil | Público-alvo desta versão é brasileiro. Nomes de produto (Microsoft 365 Copilot, Copilot Studio, Microsoft Foundry, Agent Builder, Databricks Agent Bricks, Cowork, Scout) e termos técnicos consagrados (lakehouse, RAG, MCP, Unity Catalog) permanecem em inglês. Rótulos de faixa passaram a "Encaixe forte / Bom encaixe / Encaixe parcial / Não recomendado", e `badgeClass()` no `apa.js` passou a casar por essas palavras. |
| 2026-07-28 | Explorar usa a largura de instrumento de 1200px; todas as outras seções ficam em 1024px | Uma quarta plataforma de construção ficava órfã na própria linha dentro do container de largura de leitura. Explorar é uma comparação lado a lado, que é exatamente o caso que as regras de layout já reservam para o workspace mais largo. |
| 2026-07-28 | Databricks Agent Bricks adicionado ao grupo Criar agentes com uma marca provisória | O advisor agora pontua uma plataforma não-Microsoft para cenários ancorados no lakehouse. O `images/databricks.svg` é um glifo plano de lakehouse em camadas na cor de sinal do Databricks (`#FF3621`) e deliberadamente não imita o logotipo deles. Troque pelo ativo oficial da marca quando houver um disponível. Nenhuma decoração nova foi introduzida: ele usa o mesmo tratamento plano de tile separado por hairline das outras plataformas. |
| 2026-07-20 | Direção Fluent-light substituída por Graphite Decision Instrument | Criado pelo /design-consultation depois que o usuário optou por começar do zero e escolheu "software sério de decisão para quem constrói e compra IA Microsoft" como coisa memorável. |
| 2026-07-20 | IBM Plex Sans + IBM Plex Mono | Dá ao produto uma voz técnica e de engenharia sem depender da Segoe como assinatura visual. |
| 2026-07-20 | Grafite escuro + cor de sinal azul-Azure | Aumenta a memorabilidade e reduz o risco de "AI slop", preservando uma pista de confiança próxima à Microsoft. |
| 2026-07-24 | Escala tipográfica reconstruída sobre tokens rem e todos os tamanhos elevados em um passo | Uma auditoria descobriu que o código havia derivado um passo inteiro abaixo da escala documentada (body em 14px, captions em 12px, alguns rótulos em 10-11px) e usava `px` em todo lugar, então as preferências de tamanho de fonte do navegador não faziam efeito. As 74 declarações agora referenciam tokens rem `--fs-*`, com piso de 12px e sem reduções no mobile. |
| 2026-07-24 | Sinal teal trocado pelo azul Microsoft `#0078D4` | O usuário pediu que o destaque verde/teal fosse azul. Canvas em carvão quente, neutros, tipografia e a regra de não usar brilhos permanecem inalterados; só a matiz do sinal mudou (escuro `#0078D4` / `#2B9AEE` / `#0B5187`, claro `#005A9E`). Semântica de sucesso/aviso/erro intocada. |
| 2026-07-22 | Graphite/azul-ciano substituído por Warm Charcoal + sinal teal (via /design-shotgun) | O canvas quase preto `#0C0F14` + o brilho azul-ciano único remetiam ao visual genérico de ferramenta de IA que o usuário rejeita. Novo sistema: carvão fosco e quente `#1A1714` (sem preto-azulado), um único teal contido `#17B0A7` como sinal, sem brilhos. IBM Plex Sans/Mono mantidas. O usuário rejeitou: IA-escuro genérico, Blueprint (claro/âmbar), vermelho-sinal, sage, bone, dourado-latão e esmeralda antes de chegar ao teal. |
| 2026-07-20 | Explorar dividido em Usar agentes / Criar agentes | Mantém a arquitetura de informação alinhada à forma como os usuários decidem, em vez de achatar tudo em uma galeria de seis cards. |
