# Sistema de pontuação — Agent Platform Advisor

Documento de referência sobre como funciona o motor de pontuação do APA. Todos os dados vêm do `apa.yaml`.

## Plataformas

| ID | Rótulo | Descrição |
|---|---|---|
| `agent_builder` | Agent Builder | Agentes declarativos no-code dentro do Microsoft 365 Copilot |
| `m365_copilot` | Microsoft 365 Copilot | Experiências nativas do Copilot — Copilot Chat, Search, assistência nos apps e agentes criados pela Microsoft (somente no wizard de ponto de entrada) |
| `copilot_studio` | Copilot Studio | Agentes corporativos low-code governados, com ferramentas, fluxos, gatilhos, computer use, avaliação, monitoramento e publicação ampla |
| `foundry` | Microsoft Foundry | Runtime gerenciado de agentes em produção, para prompt agents, agentes de código hospedados, recuperação personalizada, ferramentas, identidade, observabilidade e controles em escala Azure |
| `databricks` | Databricks Agent Bricks | Agentes construídos, avaliados, governados e servidos na plataforma de dados — fundamentados em tabelas do Unity Catalog e coleções de documentos governadas |

O `databricks` é a única plataforma não-Microsoft da matriz. Ele só é pontuado quando o cenário está ancorado na plataforma de dados: o conhecimento está em um lakehouse, o time de dados é dono da construção e o agente é servido ao lado dos dados. Como o Agent Bricks não consegue se fundamentar em conteúdo do Microsoft 365 nem publicar no chat do Microsoft 365 Copilot, essas respostas o zeram por regras rígidas, exatamente como os limites das outras plataformas são aplicados.

O M365 Copilot fica fora da avaliação pontuada. Ele só é recomendado pelo wizard de ponto de entrada (ou pelos links antigos `?ft=1` / `?dt=copilot_chat`). No wizard completo, `m365_copilot` é sempre zerado.

## Destinos não pontuados: wizard de ponto de entrada (Microsoft 365 Copilot, Cowork e Scout)

Microsoft 365 Copilot, Cowork e Scout **não** são plataformas de construção — são lugares prontos para *realizar trabalho*, e não plataformas sobre as quais você constrói. Eles **não** fazem parte do wizard pontuado, **não** estão em `meta.platforms` e nunca entram na soma de 0 a 15. São alcançados pelo caminho de prescreen **"Me ajude a encontrar o lugar certo para realizar meu trabalho"**, que abre um breve **wizard de ponto de entrada** ("Onde você deve realizar esse trabalho?"). Esse wizard existe porque a Microsoft pede ao usuário final que escolha entre pontos de entrada demais (Microsoft 365 Copilot vs. Cowork vs. Scout); o wizard resolve essa escolha a partir de padrões de trabalho, e não de nomes de produto. Não existe mais um bloco de prescreen separado para "experiência nativa do Microsoft 365 Copilot" — esse destino agora vive dentro deste wizard.

**O Copilot Chat não é um destino.** O Copilot Chat e os agentes nativos (Researcher, Analyst, Facilitator, Interpreter, …) são *superfícies do* Microsoft 365 Copilot, e não produtos que competem com ele. Por isso, participar ativamente sempre resolve para o único card `m365_copilot`; a resposta de tipo de tarefa apenas seleciona por qual superfície o card manda **começar**, via `recommendations.m365_copilot.start_here` no `apa.yaml` (`chat` ou `agents`).

A primeira pergunta bifurca o fluxo:

| Pergunta | Opções |
|---|---|
| **Participação** — como você quer trabalhar? | Conduzir eu mesmo e iterar turno a turno · Delegar e deixar um agente executar |

- **Participação ativa / interativa** → um desdobramento pergunta **que tipo de tarefa** é:

  | Pergunta | Opções |
  |---|---|
  | **Tipo de tarefa** | Ajuda geral (brainstorm, buscar informação, colocar e-mails/reuniões em dia, redigir e editar documentos) · Uma tarefa especializada (pesquisa aprofundada, análise de dados, facilitação de reuniões, tradução) |

  As duas respostas resolvem para **Microsoft 365 Copilot** (`m365_copilot`). Ajuda geral seleciona a superfície inicial **Copilot Chat**; especializada seleciona a superfície dos **agentes nativos** (Researcher, Analyst, Facilitator, Interpreter, …).

- **Delegar** → duas perguntas de desdobramento decidem entre Cowork e Scout. Elas são feitas **progressivamente**: a Cadência aparece primeiro e o Alcance só é revelado depois que a cadência é respondida (assim as duas nunca aparecem ao mesmo tempo).

  | Pergunta | Opções |
  |---|---|
  | **Cadência** (perguntada primeiro) — como o agente deve trabalhar? | Sob demanda (concluir um trabalho de várias etapas de uma vez — vários artefatos ou um processo entre sistemas) · Contínua (sempre ativo, gerenciar e coordenar meu dia) · Ainda não sei |
  | **Alcance** (revelado após a Cadência) — até onde ele precisa alcançar? | Somente Microsoft 365 · Também desktop/navegador/local/CLI · Ainda não sei |

**Regra de roteamento** (`resolveDelegateResult(involvement, taskType, cadence, reach)` no `apa.js`):

| Condição | Resultado |
|---|---|
| Participação = interativa | **Microsoft 365 Copilot** (`m365_copilot`) — o `resolveDelegateStart` então escolhe a superfície inicial: especializada → `agents`, geral → `chat` |
| Cadência = contínua | **Scout** |
| Alcance = multiambiente | **Scout** |
| Cadência = sob demanda **e** Alcance = Microsoft 365 | **Cowork** |
| Caso contrário (sinais indefinidos) | **Ambos** (Cowork + Scout), exibidos como par complementar |

**Prontidão** (`isDelegateReady` no `apa.js`): o caminho interativo exige um tipo de tarefa; o de delegação exige cadência e alcance antes de o wizard poder concluir.

> O `m365_copilot` continua em `meta.platforms` por causa do conteúdo, mas é sempre zerado no wizard pontuado (`if (!fastTrack) zeroed['m365_copilot'] = true`) — ele só aparece como destino deste wizard. O link antigo `?ft=1` ainda resolve para o mesmo card por compatibilidade, assim como o link antigo `?dt=copilot_chat` (mapeado para `dt=m365_copilot` com a superfície inicial `chat`). Novos links de compartilhamento carregam a superfície como `&st=chat|agents`.

## Perguntas e matriz de pontuação

Cinco perguntas, cada uma pontuada de 0 a 3 por plataforma. Pontuação bruta máxima: **15** (5 × 3).

### Q1 — Quem vai criar este agente?

| Opção | ID | Agent Builder | CS | Foundry | DBX |
|---|---|---|---|---|---|
| Usuário de negócio / especialista — sem programação | q1a | **3** | 1 | 0 | 1 |
| Criador low-code / profissional de TI | q1b | 1 | **3** | 0 | 1 |
| Desenvolvedor profissional | q1c | 0 | 2 | **3** | 2 |
| Cientista de dados / engenheiro de ML | q1d | 0 | 1 | **3** | **3** |
| Time de plataforma / engenharia de dados | q1e | 0 | 1 | 2 | **3** |

O CS recebe 2 em q1c porque suporta desenvolvedores profissionais via autoria em YAML e a extensão do VS Code.

**q1e** foi adicionada junto com o Agent Bricks. O perfil que é dono do lakehouse, dos pipelines e da governança do Unity Catalog é distinto de um cientista de dados: ele cria agentes *como parte da plataforma de dados*, então o Agent Bricks lidera e o Foundry segue como alternativa crível do lado Azure. O Agent Bricks ainda pontua 1 em q1a/q1b porque seus construtores gerenciados são usáveis sem código — mas apenas dentro de um workspace Databricks que outra pessoa provisiona.

### Q8 — Quem vai usar este agente?

O escopo de público separa o ponto forte do Agent Builder (times pequenos, entrega rápida) do modelo de implantação gerenciada do Copilot Studio. Público externo continua sendo uma restrição rígida que elimina Agent Builder e M365 Copilot.

| Opção | ID | Agent Builder | CS | Foundry | DBX | Regra rígida |
|---|---|---|---|---|---|---|
| Eu ou um pequeno time interno | q8a | **3** | 2 | 1 | 1 | — |
| Área ou público interno amplo | q8c | 1 | **3** | 2 | 2 | — |
| Usuários externos | q8b | 0 | **3** | **3** | 2 | Zera AB, M365 |
| Ainda não decidido | q8d | 2 | 2 | 1 | 1 | — |

O Agent Bricks pontua baixo em público de forma geral: servir um agente a pessoas não é onde ele se diferencia. Ele recebe 2 em usuários externos porque agentes podem ser servidos como endpoints públicos ou apps, mas o canal de entrega geralmente acaba sendo um front-end Microsoft ou personalizado.

### Q2 — Onde as pessoas vão interagir com este agente?

A superfície de implantação continua sendo uma restrição rígida. O Agent Builder roda dentro das superfícies de chat do Microsoft 365 Copilot, não em apps personalizados nem em runtimes orientados a eventos.

| Opção | ID | Agent Builder | CS | Foundry | DBX | Regra rígida |
|---|---|---|---|---|---|---|
| Chat do Microsoft 365 Copilot | q2a | **3** | **3** | 2 | 0 | Zera DBX |
| App personalizado (site/mobile) | q2b | 0 | **3** | **3** | **3** | Zera AB |
| Segundo plano (orientado a eventos) | q2c | 0 | **3** | **3** | 2 | Zera AB |
| Vários lugares / não decidido | q2d | 1 | **3** | **3** | 1 | — |
| Ambiente de dados e analytics | q2e | 0 | 1 | 2 | **3** | Zera AB |

**q2e** foi adicionada junto com o Agent Bricks: notebooks, exploração de dados em linguagem natural, BI e endpoints de agente governados servidos pela plataforma de dados. É a imagem espelhada de q2a — onde q2a desqualifica o Agent Bricks, q2e desqualifica o Agent Builder. O Copilot Studio mantém 1 porque consegue chamar um endpoint da plataforma de dados, e o Foundry 2 porque consegue hospedar a camada de aplicação em volta de um.

O Foundry pontua mais alto em flexibilidade de implantação porque agentes do Foundry podem publicar endpoints estáveis, integrar com aplicações e serviços personalizados e ser publicados no Microsoft 365 Copilot ou no Teams. O Copilot Studio permanece empatado ou mais forte quando o alvo é entrega low-code no Microsoft 365 ou na Power Platform.

### Q4 — O que este agente deve fazer?

A complexidade da tarefa é o fator de diferenciação mais forte entre Agent Builder, Copilot Studio e Foundry. O Agent Builder hoje pontua bem em recursos leves de conteúdo/análise de dados habilitados em agentes declarativos, mas continua zerado para fluxos de ação.

| Opção | ID | Agent Builder | CS | Foundry | DBX | Regra rígida |
|---|---|---|---|---|---|---|
| Perguntas e respostas simples / consultas | q4a | **3** | **3** | 1 | 2 | — |
| Conversacional (múltiplos turnos) | q4b | 2 | **3** | 2 | 2 | — |
| Criar/analisar conteúdo no Copilot | q4e | **3** | 2 | 2 | 1 | — |
| Tarefas de várias etapas com ações | q4c | 0 | **3** | **3** | 2 | Zera AB |
| Orquestração complexa | q4d | 0 | 2 | **3** | **3** | Zera AB, M365 |
| Raciocinar sobre grandes volumes de dados corporativos | q4f | 0 | 1 | 2 | **3** | Zera AB |

**q4f** foi adicionada junto com o Agent Bricks e é o tipo de tarefa que as cinco opções anteriores não acomodavam: extração estruturada em coleções de documentos, perguntas em linguagem natural sobre tabelas governadas e ajuste da qualidade das respostas com seus próprios dados. O Agent Bricks também chega a 3 em q4d porque o Supervisor Agent orquestra agentes de dados, funções do Unity Catalog, servidores MCP e agentes personalizados atrás de um único ponto de entrada.

O Foundry recebe 1 em q4a porque consegue fazer perguntas e respostas simples, mas costuma ser exagero para cenários simples de conhecimento. Recebe 2 em q4e porque interpretador de código, busca em arquivos e agentes hospedados suportam cargas mais ricas de conteúdo/análise de dados quando o time precisa de controle de desenvolvimento.

### Q3 — A que informações este agente precisa acessar?

O Agent Builder não é mais tratado como "somente arquivos do Microsoft 365". Ele consegue usar conteúdo do Microsoft 365, web delimitada, arquivos incorporados e conectores do Microsoft 365 Copilot habilitados pelo administrador. O Copilot Studio é a opção low-code mais forte para Dataverse, conectores personalizados, APIs de negócio e integração com a Power Platform. O Foundry hoje recebe crédito fraco em fundamentação no Microsoft 365, web e arquivos porque as ferramentas do Foundry e o Foundry IQ alcançam essas fontes, mas ele segue mais forte para RAG personalizado, Azure AI Search, índices privados, bases de conhecimento ajustadas no Foundry IQ e sistemas de recuperação mantidos pela engenharia.

| Opção | ID | Agent Builder | CS | Foundry | DBX | Regra rígida |
|---|---|---|---|---|---|---|
| Conteúdo do Microsoft 365 | q3a | **3** | 2 | 1 | 0 | Zera DBX |
| Sistemas de negócio via conectores | q3b | 2 | **3** | 2 | 0 | Zera DBX |
| Dataverse / conectores personalizados / APIs de negócio | q3c | 0 | **3** | 2 | 1 | Zera AB |
| M365 + sistemas via conectores | q3d | 2 | **3** | 2 | 0 | Zera DBX |
| Sites públicos ou arquivos enviados | q3e | **3** | 2 | 1 | 1 | — |
| RAG personalizado / Azure AI Search / índices privados / Foundry IQ | q3f | 0 | 1 | **3** | 2 | Zera AB |
| Lakehouse / Unity Catalog / tabelas Delta | q3g | 0 | 1 | 2 | **3** | Zera AB |

**q3g** foi adicionada junto com o Agent Bricks e é o sinal isolado mais forte a favor dele. A Q3 também é onde o Agent Bricks é mais frequentemente eliminado: as três fontes de perfil Microsoft 365 (q3a, q3b, q3d) o zeram, porque o Agent Bricks se fundamenta em dados de lakehouse governados no Unity Catalog e não tem caminho até SharePoint, OneDrive, Teams, Outlook ou o catálogo de conectores do Microsoft 365 Copilot. Ele mantém 2 em q3f — recuperação mantida pela engenharia é o formato para o qual foi construído, mesmo quando o índice em si está em outro lugar.

## Pipeline de pontuação

### Passo 1 — Regras rígidas (antes da soma)

As regras rígidas zeram plataformas antes de as pontuações serem somadas. Elas representam limitações reais das plataformas.

| Gatilho | Plataformas zeradas | Motivo |
|---|---|---|
| q8b (usuários externos) | AB, M365 | Não publicam externamente |
| q4d (orquestração complexa) | AB, M365 | Exige orquestração do Copilot Studio ou do Foundry |
| q4c (fluxos de ação de várias etapas) | AB | Não envia formulários, não atualiza registros nem executa ações entre sistemas |
| q2b (app personalizado) | AB | Só roda dentro das superfícies do Microsoft 365 Copilot |
| q2c (segundo plano) | AB | Sem runtime orientado a eventos ou autônomo em segundo plano |
| q3c (integração direta com sistemas de negócio) | AB | Não conecta diretamente a Dataverse, conectores personalizados ou APIs de negócio |
| q3f (arquitetura de recuperação personalizada) | AB | Não usa diretamente RAG personalizado, Azure AI Search, índices privados, Foundry IQ ou sistemas de recuperação mantidos pela engenharia |
| q3g (dados governados pelo lakehouse) | AB | Não consulta Unity Catalog, tabelas Delta nem coleções de documentos governadas pelo warehouse |
| q2e (ambiente de dados e analytics) | AB | Só roda dentro do Microsoft 365, não em notebooks, BI ou endpoints da plataforma de dados |
| q4f (raciocínio sobre dados em larga escala) | AB | Não faz extração em escala sobre coleções de documentos, não consulta tabelas governadas nem ajusta a qualidade das respostas com seus dados |
| q3a (conteúdo do Microsoft 365) | DBX | Fundamenta-se em dados de lakehouse, não em SharePoint, OneDrive, Teams ou Outlook |
| q3b (conectores do Microsoft 365 Copilot) | DBX | Não consome o catálogo de conectores do Microsoft 365 |
| q3d (conteúdo M365 + conectores) | DBX | Sem caminho de fundamentação em fontes do Microsoft 365 |
| q2a (chat do Microsoft 365 Copilot) | DBX | Os agentes são servidos pelo Databricks e não têm caminho nativo de publicação no Microsoft 365 Copilot |

Além disso, o M365 Copilot é sempre zerado na avaliação completa (fixado no JS).

### Passo 2 — Soma das pontuações brutas

Para cada plataforma não zerada: soma as pontuações de todas as perguntas respondidas. Faixa: 0–15.

### Passo 2.5 — Preferências por perfil (ajustes suaves)

As preferências por perfil forçam uma plataforma acima de outra no ranking, independentemente das pontuações. Diferente das regras rígidas, todas as pontuações são preservadas — o ajuste só afeta a ordem. Uma justificativa é exibida como fator-chave no card de recomendação.

| Gatilho | Prefere | Sobre | Justificativa |
|---|---|---|---|
| q1d (cientista de dados / IA-ML) | Copilot Studio | Agent Builder | O CS oferece seleção curada de modelos, avaliações, integração com Foundry IQ, desenvolvimento code-first e orquestração flexível, que faltam no AB |

### Passo 3 — Rótulos das faixas

| Pontuação | Rótulo |
|---|---|
| 12–15 | Encaixe forte |
| 8–11 | Bom encaixe |
| 4–7 | Encaixe parcial |
| 0–3 | Não recomendado |

### Passo 4 — Ranquear e recomendar

As plataformas são ordenadas por pontuação decrescente. A de maior pontuação é a recomendação principal. A segunda é exibida como "Considere também" quando é viável.

### Passo 5 — Tratamento de empate

Quando as duas primeiras plataformas ficam a até **2 pontos** de diferença, elas são apresentadas como par complementar, desde que esse par esteja listado em `valid_pairs`.

| Par | Justificativa |
|---|---|
| Copilot Studio + Foundry | Construa no CS e estenda com código personalizado no Foundry |
| M365 Copilot + Copilot Studio | M365 Copilot para os usuários finais, CS para personalização |
| Agent Builder + M365 Copilot | AB para agentes nativos do Microsoft 365, M365 para extensibilidade |
| Agent Bricks + Foundry | Agent Bricks para raciocínio fundamentado no lakehouse, Foundry para a aplicação Azure, identidade, rede e publicação no Microsoft 365 |
| Copilot Studio + Agent Bricks | Agent Bricks para raciocinar sobre os dados do lakehouse, CS para levar a resposta aos funcionários no Teams e no Microsoft 365 |

**Critérios de desempate por perfil** — quando duas plataformas empatam e uma resposta de perfil específica foi selecionada, uma delas é preferida:

| Gatilho | Plataformas | Prefere | Justificativa |
|---|---|---|---|
| q1c (desenvolvedor profissional) | AB, CS | CS | O CS suporta autoria code-first pela extensão do VS Code |
| q1d (cientista de dados / IA-ML) | CS, Foundry | CS | O CS oferece um caminho mais rápido até agentes em produção |
| q3g (dados no lakehouse) | CS, DBX | DBX | Constrói o agente onde os dados, permissões e linhagem já estão, em vez de exportar ou reindexar |
| q1e (time de plataforma de dados) | Foundry, DBX | DBX | Mantém o agente no mesmo plano de governança dos dados, em vez de acrescentar uma segunda plataforma para operar |

### Passo 6 — Notas entre perguntas

Avisos contextuais quando as combinações de respostas são logicamente contraditórias:

| Condição | Nota |
|---|---|
| q2c + q4a | Agente em segundo plano fazendo perguntas e respostas simples — contraditório |
| q8b + q2a | Usuários externos no chat do Microsoft 365 Copilot — externos não acessam o seu tenant |
| q1a + q4d | Usuário de negócio quer orquestração complexa — exige habilidades de desenvolvimento |
| q1a + q3c | Usuário de negócio precisa de integração direta com sistemas de negócio — exige conhecimento técnico |
| q1a + q3f | Usuário de negócio precisa de arquitetura de recuperação personalizada — exige conhecimento de engenharia |
| q3g + q2a | Conhecimento no lakehouse mas entrega no chat do Microsoft 365 Copilot — sem caminho nativo de publicação; coloque um agente do CS ou do Foundry na frente |
| q1a + q3g | Usuário de negócio precisa de dados do lakehouse — acesso e serving pertencem ao time de plataforma de dados |
| q1e + q3a | Time de plataforma de dados mas conteúdo do Microsoft 365 — esse conteúdo é acessado por conectores do Copilot e pelo Graph, não pelo lakehouse |

### Passo 7 — Descompasso entre vencedor e perfil

| Vencedor | Perfil | Nota |
|---|---|---|
| Foundry | q1a (usuário de negócio) | Exige habilidades de desenvolvimento profissional e conhecimento de Azure — apoie-se em um time de desenvolvimento |
| Agent Bricks | q1a (usuário de negócio) | Pressupõe que a organização já roda no Databricks e que alguém possa conceder acesso governado aos dados |
| Agent Bricks | q1b (criador low-code / profissional de TI) | Fica fora do stack Microsoft — workspace, permissões do Unity Catalog e capacidade de serving são pré-requisitos |

## Análise de distribuição

Considerando todas as 4.200 combinações possíveis de respostas:

| Plataforma | Vitórias | % |
|---|---:|---:|
| Copilot Studio | 2.885 | 68,7% |
| Foundry | 851 | 20,3% |
| Databricks Agent Bricks | 390 | 9,3% |
| Agent Builder | 74 | 1,8% |

**Empates exatos no topo:** 836 combinações (19,9%) — 562 CS/Foundry, 142 Agent Bricks/Foundry, 94 CS/Agent Bricks, 38 AB/CS. **Casos de pontuação próxima, dentro de 2 pontos:** 3.028 combinações (72,1%) — ainda dominados por CS/Foundry (2.075), refletindo a sobreposição intencional entre o runtime low-code governado do Copilot Studio e o runtime controlado pelo desenvolvedor do Foundry, com Agent Bricks/Foundry (450) como o novo segundo eixo de sobreposição.

> O espaço de combinações cresceu de 1.920 para 4.200 quando o Agent Bricks acrescentou q1e, q2e, q4f e q3g (5 × 4 × 5 × 6 × 7). A fatia do Agent Builder caiu de 3,1% para 1,8% não porque sua pontuação mudou, mas porque as quatro novas opções o desqualificam — o denominador cresceu com combinações para as quais ele nunca foi elegível. Regere esses números com uma varredura por força bruta sobre `rankPlatforms()` sempre que a matriz mudar.

### Quando o Agent Builder vence

O AB agora vence além do antigo caminho restrito a SharePoint/OneDrive. Seu ponto ideal é: **usuário de negócio ou criador low-code, time pequeno ou público interno indefinido, superfície do Microsoft 365 Copilot, perguntas e respostas/conversa/análise de conteúdo, e conhecimento vindo do Microsoft 365, da web/arquivos enviados ou de conectores**.

O Agent Builder ainda perde sempre que o usuário precisa de publicação externa, implantação em app personalizado, execução em segundo plano, integração direta com sistemas de negócio, arquitetura de recuperação personalizada ou fluxos de ação que atualizam sistemas externos.

### Quando o Foundry vence

O Foundry vence quando as respostas incluem sinais fortes de natureza técnica ou de runtime de produção: perfil de desenvolvedor profissional ou de ML (q1c/q1d), implantação em app personalizado ou em múltiplas superfícies (q2b/q2d), orquestração complexa ou de longa duração (q4d), arquitetura de recuperação personalizada (q3f), cenários voltados ao público externo, ou necessidade de endpoints gerenciados, agentes de código hospedados, rede privada, tracing, avaliação e controle total do Azure. O Copilot Studio ainda empata ou supera o Foundry em fluxos disparados por evento e APIs de negócio, a menos que o cenário claramente exija controle total por código.

### Quando o Agent Bricks vence

O Agent Bricks vence no eixo da plataforma de dados, não no eixo das superfícies Microsoft: **time de plataforma de dados ou cientista de dados (q1e/q1d), conhecimento governado pelo lakehouse (q3g), entrega no ambiente de dados e analytics ou em app personalizado (q2e/q2b), e raciocínio sobre dados em larga escala ou orquestração multiagente (q4f/q4d)**.

Ele é eliminado de imediato sempre que o conhecimento for conteúdo do Microsoft 365 ou vier de conectores (q3a/q3b/q3d), ou quando o agente precisar viver dentro do chat do Microsoft 365 Copilot (q2a). Na prática, isso significa que o Agent Bricks nunca disputa o cenário clássico do Copilot — ele só aparece quando o usuário informa ao advisor que o cenário está ancorado no seu patrimônio de dados.

### Predominância do Copilot Studio

O CS continua sendo a recomendação padrão na maioria das combinações porque faz a ponte entre os cenários no-code nativos do Microsoft 365 do Agent Builder e os cenários full-code do Foundry. Ele vence quando o usuário precisa de implantação interna ou externa mais ampla, ações, fluxos com ramificações, gatilhos por evento, governança corporativa, Dataverse/conectores personalizados, ferramentas MCP, computer use, avaliação, monitoramento, ou um caminho mais seguro quando o escopo ainda está indefinido.

### Faixas de pontuação nas vitórias

| Plataforma | Mín. | Máx. | Média |
|---|---:|---:|---:|
| Agent Builder | 10 | 15 | 12,5 |
| Copilot Studio | 7 | 15 | 11,8 |
| Foundry | 8 | 15 | 12,0 |
| Databricks Agent Bricks | 9 | 14 | 11,4 |

A vitória de menor pontuação hoje é 7 (Copilot Studio), um "Encaixe parcial" — ocorre em combinações fortemente voltadas à plataforma de dados, em que toda plataforma Microsoft é um meio-termo e o Agent Bricks foi desqualificado por uma resposta de fundamentação no Microsoft 365. O Agent Bricks nunca chega a 15 porque pontua no máximo 2 em público (Q8).

## Frequência das notas entre perguntas

| Nota | Combinações | % |
|---|---:|---:|
| Segundo plano + perguntas simples | 140 | 3,3% |
| Externo + chat do M365 Copilot | 210 | 5,0% |
| Usuário de negócio + orquestração | 140 | 3,3% |
| Usuário de negócio + APIs de negócio | 120 | 2,9% |
| Usuário de negócio + recuperação personalizada | 120 | 2,9% |
| Lakehouse + chat do M365 Copilot | 120 | 2,9% |
| Usuário de negócio + lakehouse | 120 | 2,9% |
| Time de plataforma de dados + conteúdo M365 | 120 | 2,9% |
| Foundry + usuário de negócio (descompasso de perfil) | 42 | 1,0% |
| Agent Bricks + usuário de negócio (descompasso de perfil) | 85 | 2,0% |
| Agent Bricks + criador low-code (descompasso de perfil) | 43 | 1,0% |

As notas não são mutuamente exclusivas — uma mesma combinação pode disparar várias notas.
