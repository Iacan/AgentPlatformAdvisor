# Agent Platform Advisor

Escolha a experiência de agente da Microsoft certa para o que você quer fazer: usar os recursos nativos do Copilot, delegar trabalho a um agente pessoal ou criar um agente personalizado na plataforma adequada.

A ferramenta está publicada em [https://iacan.github.io/AgentPlatformAdvisor/](https://iacan.github.io/AgentPlatformAdvisor/).

---

## O que ele faz

O Agent Platform Advisor é uma aplicação web estática de página única que ajuda as pessoas a navegar pelo cenário de agentes da Microsoft. Ele atende a duas intenções distintas:

1. **Realizar trabalho**. Um wizard de ponto de entrada direciona o usuário final ao lugar certo para fazer o trabalho (**Microsoft 365 Copilot**, **Copilot Cowork** ou **Microsoft Scout**) com base em como o trabalho deve acontecer, e não em qual produto ele conhece pelo nome. Quando o resultado é o Microsoft 365 Copilot, ele também indica por qual superfície começar: Copilot Chat ou um agente nativo como Researcher, Analyst, Facilitator ou Interpreter.
2. **Criar agentes**. Responda a uma avaliação pontuada que recomenda **Agent Builder**, **Copilot Studio**, **Microsoft Foundry** ou **Databricks Agent Bricks**.

A página inicial apresenta as formas de usar ou criar agentes:

| Intenção | Destino | Ideal para |
|---|---|---|
| Usar | Microsoft 365 Copilot | Chat, busca, Copilot nativo dos apps, Pages, Notebooks e agentes criados pela Microsoft, sensíveis a permissões |
| Delegar | Copilot Cowork | Trabalho de várias etapas no Microsoft 365, sob demanda, com pontos de aprovação |
| Delegar | Microsoft Scout | Trabalho sempre ativo e proativo no desktop, navegador, arquivos locais, shell e Microsoft 365 |
| Criar | Agent Builder | Agentes no-code do Microsoft 365 Copilot para cenários de conhecimento, web, arquivos e conectores, voltados a times pequenos |
| Criar | Copilot Studio | Agentes low-code governados com ferramentas, fluxos, gatilhos, avaliação, monitoramento e implantação ampla |
| Criar | Microsoft Foundry | Agentes de produção code-first com runtime gerenciado, recuperação personalizada, identidade, rede, observabilidade e controles em escala Azure |
| Criar | Databricks Agent Bricks | Agentes construídos, avaliados, governados e servidos no lakehouse, fundamentados em tabelas do Unity Catalog e coleções de documentos governadas |

## Caminhos do usuário

A partir de **Começar**, o usuário escolhe um de três caminhos:

1. **Wizard de ponto de entrada** ("Me ajude a encontrar o lugar certo para realizar meu trabalho"). Pergunta o quanto você quer participar e então direciona para o Microsoft 365 Copilot (destacando o Copilot Chat ou os agentes nativos), Cowork, Scout ou o par Cowork+Scout. Não pontuado.
2. **Avaliação de agente personalizado**. Executa o wizard pontuado de 5 perguntas para Agent Builder, Copilot Studio, Foundry e Databricks Agent Bricks.
3. **Explorar o que é possível**. Compara as formas de usar ou criar agentes antes de decidir fazer a avaliação.

A avaliação de agente personalizado pergunta sobre:

- Quem vai criar o agente: usuário de negócio, criador low-code, desenvolvedor profissional, cientista de dados/engenheiro de IA ou time de plataforma de dados
- Quem vai usá-lo: pequeno time interno, público interno amplo, usuários externos ou indefinido
- Onde as pessoas vão interagir com ele: chat do Microsoft 365 Copilot, app personalizado, execução em segundo plano/disparada por evento, ambiente de dados e analytics ou vários lugares
- O que o agente deve fazer: perguntas e respostas, conversa de múltiplos turnos, análise de conteúdo/dados, fluxos de ação de várias etapas, orquestração complexa ou raciocínio sobre grandes volumes de dados corporativos
- A que informações ele precisa acessar: conteúdo do Microsoft 365, sistemas via conectores, Dataverse/APIs personalizadas, web pública/arquivos enviados, arquitetura de recuperação personalizada ou dados de lakehouse governados no Unity Catalog

Ao concluir um caminho, o usuário recebe:

- Uma recomendação principal com selo de encaixe, fatores-chave e orientação específica da plataforma
- Um destaque "Comece por aqui" nos resultados de ponto de entrada, nomeando a superfície a abrir primeiro
- Um card secundário "Considere também" quando outra opção está próxima ou é complementar
- Um painel de comparação de pontuação no wizard pontuado
- Avisos contextuais para combinações de respostas contraditórias
- Uma explicação de "por que não?" quando as duas primeiras plataformas pontuadas ficam a até 2 pontos de distância
- Um link compartilhável que codifica o caminho, as respostas, a recomendação e a data da recomendação

A aplicação suporta modo escuro, navegação pelo histórico do navegador, persistência das respostas via `sessionStorage`, links de resultado compartilhados e avisos de mudança temporal quando uma recomendação salva muda após uma atualização do `apa.yaml`.

## Estrutura do projeto

```text
agent-platform-advisor/
├── index.html              # Estrutura da aplicação e marcação estática
├── apa.yaml                # Fonte da verdade: perguntas, pontuações, roteamento, recomendações e conteúdo
├── assets/
│   ├── apa.css             # Estilos, tokens de tema, layout responsivo e modo escuro
│   └── apa.js              # Estado, renderização, roteamento, motor de pontuação, compartilhamento e persistência
├── images/                 # Ícones das plataformas e favicons
├── docs/
│   ├── CHANGELOG.md        # Histórico de versões
│   ├── DESIGN.md           # Referência do design system
│   ├── FLOWCHART.md        # Árvore de decisão de pontuação e roteamento
│   └── SCORING.md          # Referência do sistema de pontuação
└── tests/
    └── e2e/                # Testes end-to-end com Playwright
```

A aplicação é puramente estática: sem backend, sem bundler e sem etapa de build. O `index.html` carrega o `assets/apa.js`, que busca o `apa.yaml` em tempo de execução e renderiza a experiência a partir desses dados.

> **Precisa de um servidor HTTP.** Abrir o `index.html` direto pelo sistema de arquivos (`file://`) não funciona, porque o navegador bloqueia o `fetch` do `apa.yaml`. Use `npx serve . -l 4173 --no-clipboard` e acesse `http://localhost:4173`.

## Como funciona a lógica de recomendação

Veja [docs/SCORING.md](docs/SCORING.md) para a referência completa e [docs/FLOWCHART.md](docs/FLOWCHART.md) para a árvore de decisão visual.

Existem dois modos de recomendação:

1. **Wizard de ponto de entrada**, não pontuado. Ele primeiro pergunta o quanto o usuário quer participar:
   - Participar ativamente → **Microsoft 365 Copilot**, mais uma pergunta de tipo de tarefa que escolhe a superfície inicial: ajuda geral -> Copilot Chat; tarefa especializada (pesquisa, dados, reuniões, tradução) -> um agente nativo (Researcher, Analyst, Facilitator, Interpreter)
   - Delegar → perguntas de cadência + alcance: trabalho contínuo ou alcance multiambiente -> Scout; trabalho sob demanda dentro do Microsoft 365 -> Cowork; sinais indefinidos -> ambos

   O Copilot Chat e os agentes nativos são superfícies *do* Microsoft 365 Copilot, e não destinos concorrentes, então o caminho de participação ativa sempre produz um único card do Microsoft 365 Copilot.
2. **Avaliação de agente personalizado**, pontuada entre Agent Builder, Copilot Studio, Foundry e Databricks Agent Bricks:
   - Regras rígidas zeram plataformas em combinações desqualificantes antes da pontuação.
   - As pontuações brutas somam 5 perguntas, com máximo de 15 pontos por plataforma.
   - Preferências por perfil e critérios de desempate ajustam o ranking quando as pontuações empatam ou enganam para o perfil de criador selecionado.
   - As faixas mapeiam pontuações em rótulos de encaixe: Encaixe forte (12-15), Bom encaixe (8-11), Encaixe parcial (4-7), Não recomendado (0-3).

Microsoft 365 Copilot, Cowork e Scout não fazem parte do wizard pontuado de 0 a 15. Eles são alcançados apenas pelo wizard de ponto de entrada.

## Posicionamento atual das plataformas

O advisor reflete a divisão atual entre as opções de agente da Microsoft:

- **Agent Builder** foi além dos cenários restritos a SharePoint/OneDrive. Hoje cobre agentes no-code fundamentados em conteúdo do Microsoft 365, web delimitada, arquivos enviados e conectores do Microsoft 365 Copilot habilitados pelo administrador, incluindo auxiliares leves de conteúdo e análise de dados.
- **Copilot Studio** é o caminho low-code governado padrão para agentes corporativos que precisam de ações, fluxos, gatilhos, conectores, ferramentas MCP, computer use, agentes conectados, avaliação, monitoramento e implantação multicanal.
- **Microsoft Foundry** é o runtime de produção controlado pelo desenvolvedor, para prompt agents, agentes de código hospedados, recuperação personalizada, endpoints gerenciados, toolboxes, MCP, identidade, rede privada, tracing, avaliação, monitoramento e integração com apps e serviços personalizados.
- **Databricks Agent Bricks** é a opção não-Microsoft, incluída para cenários ancorados na plataforma de dados em vez do Microsoft 365: agentes construídos, avaliados, governados e servidos ao lado dos dados do lakehouse, sob as mesmas permissões e linhagem do Unity Catalog que já cobrem esses dados. Ele é desqualificado quando o conhecimento está no Microsoft 365 ou quando o agente precisa rodar dentro do chat do Microsoft 365 Copilot.
- **Microsoft 365 Copilot** é tratado como a camada nativa de produtividade e como um único produto, e não vários: Copilot Chat, Copilot Search, Copilot nativo dos apps, Pages, Notebooks e agentes criados pela Microsoft são todos superfícies dentro dele.
- **Copilot Cowork** e **Microsoft Scout** são agentes pessoais aos quais você delega trabalho, e não plataformas da avaliação pontuada de construção.

## Compartilhamento de resultados

Os links de compartilhamento codificam o caminho da recomendação:

- Resultados do wizard incluem as respostas selecionadas, a plataforma recomendada e a data da recomendação.
- Resultados de ponto de entrada incluem `dt=m365_copilot`, `dt=cowork`, `dt=scout` ou `dt=both`, mais `st=chat` ou `st=agents` para a superfície inicial do Microsoft 365 Copilot.
- Links antigos continuam funcionando: `ft=1` e `dt=copilot_chat` resolvem ambos para o card do Microsoft 365 Copilot.
- Quem recebe pode ver a recomendação diretamente ou refazer a avaliação com as respostas pré-preenchidas.

Quando o `apa.yaml` muda depois que um link foi compartilhado, a aplicação pode exibir um aviso de mudança temporal caso a recomendação tenha mudado. Se o schema de perguntas mudar, uma nota de desvio de schema explica que os critérios foram atualizados.

## Executando os testes

O projeto usa [Playwright](https://playwright.dev/) para testes end-to-end. Os testes rodam contra um servidor local de arquivos estáticos na porta 4173.

```bash
npm install
npm test              # headless
npm run test:headed   # com o navegador visível
```

São 45 testes em 7 arquivos de spec, cobrindo a conclusão do wizard, o carregamento de links compartilhados, a detecção de mudança temporal, links antigos de fast-track, o roteamento do wizard de ponto de entrada, o caminho do Databricks e o comportamento do botão de compartilhar. Para rodar um único arquivo ou teste: `npx playwright test tests/e2e/delegate-path.spec.js` ou `npx playwright test -g "completes full wizard"`. A CI roda automaticamente em push e pull request via GitHub Actions.

## Contribuindo

Mudanças de conteúdo vão no `apa.yaml`: perguntas, pontuações, recomendações, descrições das plataformas, regras rígidas, critérios de desempate, conteúdo de roteamento de delegação e textos de exploração. O comportamento da interface vai em `assets/apa.js`. Os estilos vão em `assets/apa.css`.

Leia [docs/DESIGN.md](docs/DESIGN.md) antes de fazer mudanças visuais. Sempre atualize [docs/CHANGELOG.md](docs/CHANGELOG.md) depois de fazer mudanças. Atualize [docs/FLOWCHART.md](docs/FLOWCHART.md) e [docs/SCORING.md](docs/SCORING.md) quando as mudanças afetarem roteamento, pontuação, regras rígidas, desempates ou fluxo do usuário.

## Créditos

Esta versão em português do Brasil foi feita por **Iacan Ramos**.

Baseado no Agent Platform Advisor, distribuído sob licença MIT (Copyright Microsoft Corporation). Veja [LICENSE](LICENSE).
