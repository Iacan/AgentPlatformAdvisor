# Instruções para o Copilot do Agent Platform Advisor

## Arquitetura

Uma aplicação web estática de página única, sem etapa de build, backend, framework ou módulos, publicada no GitHub Pages. O `index.html` já contém a marcação de todas as seções; o `assets/apa.js` busca o `apa.yaml` em tempo de execução, faz o parse com o script js-yaml vindo de CDN para dentro de um único objeto global `apa`, e alterna as seções com `showSection()`. As views são construídas como strings HTML de template literal atribuídas a `innerHTML`. Todo o estado e todas as funções são globais no nível do arquivo em `assets/apa.js`.

Arquivos principais:
- `apa.yaml`: fonte da verdade de todo o conteúdo e da lógica de pontuação
- `assets/apa.js`: todo o JavaScript (estado, renderização, motor de pontuação)
- `assets/apa.css`: todos os estilos
- `index.html`: estrutura da aplicação

Mudanças de conteúdo vão no `apa.yaml`. Lógica de interface vai em `assets/apa.js`. Estilos vão em `assets/apa.css`. Nunca deixe texto de plataforma visível ao usuário fixo no JS ou no HTML. O lugar dele é o `apa.yaml`, em `recommendations` ou `questions`.

## Idioma

A interface e a documentação estão em **português do Brasil**. Nomes de produto permanecem em inglês (Microsoft 365 Copilot, Copilot Studio, Microsoft Foundry, Agent Builder, Databricks Agent Bricks, Copilot Cowork, Microsoft Scout, Copilot Chat), assim como termos técnicos consagrados: lakehouse, Unity Catalog, tabelas Delta, RAG, MCP, computer use, prompt agents, toolboxes.

Os rótulos de faixa em `apa.yaml` ("Encaixe forte", "Bom encaixe", "Encaixe parcial", "Não recomendado") **são lidos pelo código**: `badgeClass()` casa pelas palavras `forte` / `bom` / `parcial`, e a constante `NOT_RECOMMENDED_LABEL` em `apa.js` precisa espelhar exatamente a menor faixa. Ao renomear qualquer rótulo de faixa, atualize os dois lugares e os testes.

## Desenvolvimento local

Não há nada para compilar, mas a aplicação precisa ser servida por HTTP. Abrir o `index.html` pelo sistema de arquivos quebra a chamada `fetch('./apa.yaml')`:

```bash
npx serve . -l 4173      # depois acesse http://localhost:4173
```

## Testes

Testes end-to-end com Playwright. O `playwright.config.js` sobe o servidor estático sozinho (`npx serve . -l 4173`, com `reuseExistingServer` localmente), então não é preciso um servidor separado.

```bash
npm install                                              # instala as dependências
npm test                                                 # roda todos os testes headless
npm run test:headed                                      # roda com o navegador visível
npx playwright test tests/e2e/wizard-completion.spec.js  # um único arquivo de teste
npx playwright test -g "completes full wizard"           # um único teste pelo nome
```

Specs em `tests/e2e/`: `wizard-completion` (caminho pontuado), `delegate-path` (wizard de ponto de entrada), `shared-link` e `temporal-change` (resultados carregados por URL), `fast-track` (`?ft=1` legado), `share-buttons`, `databricks-path` (a plataforma não-Microsoft e suas regras de desqualificação).

## Dois caminhos pela aplicação

**Wizard pontuado**, o "Criar um agente personalizado". Cinco perguntas pontuam `agent_builder`, `copilot_studio`, `foundry` e `databricks` (Databricks Agent Bricks, a única plataforma não-Microsoft, pontuada apenas em cenários ancorados no lakehouse).

**Wizard de ponto de entrada**, o "Me ajude a encontrar o lugar certo para realizar meu trabalho". Roteamento não pontuado para `m365_copilot`, `cowork`, `scout` ou o par Cowork+Scout, com base no padrão de trabalho (participação → tipo de tarefa, ou cadência → alcance) em vez de nomes de produto. A lógica está em `resolveDelegateResult()` / `resolveDelegateStart()`.

O Copilot Chat e os agentes nativos (Researcher, Analyst, Facilitator, Interpreter) são **superfícies do** Microsoft 365 Copilot, e não destinos separados. A resposta de tipo de tarefa seleciona uma superfície `start_here` (`chat` ou `agents`), renderizada no destaque "Comece por aqui" no card único do `m365_copilot`. Não os reintroduza como plataformas irmãs.

## Pipeline de pontuação

Documentado em `docs/SCORING.md` e `docs/FLOWCHART.md`:

1. **Regras rígidas** zeram plataformas em combinações de resposta desqualificantes
2. **Pontuações brutas** somam as 5 perguntas (máx. 15 por plataforma)
3. **Desempates** no `apa.yaml` resolvem pontuações iguais usando o contexto de perfil
4. **Faixas** mapeiam pontuações em rótulos de encaixe: Encaixe forte (12–15), Bom encaixe (8–11), Encaixe parcial (4–7), Não recomendado (0–3)

O `meta.platforms` lista cinco plataformas, mas o `m365_copilot` é sempre zerado no wizard pontuado (`if (!fastTrack) zeroed['m365_copilot'] = true`), então apenas quatro podem realmente vencer. O M365 Copilot é alcançado pelo wizard de ponto de entrada, ou pelos links legados `?ft=1` / `?dt=copilot_chat`.

O `databricks` é restringido por regras rígidas nos dois sentidos: é zerado por fundamentação no Microsoft 365 (`q3a`, `q3b`, `q3d`) e por implantação no chat do Microsoft 365 Copilot (`q2a`), enquanto as quatro opções adicionadas para ele (`q1e`, `q2e`, `q4f`, `q3g`) zeram o `agent_builder`. Mantenha novas opções sempre no final de suas perguntas, porque os índices de resposta e os links compartilhados dependem da ordem existente.

## Contrato dos links de compartilhamento

Links de resultado são compartilhados externamente, então **formatos antigos de parâmetro precisam continuar resolvendo**. Adicione novos parâmetros; não reaproveite os existentes.

| Parâmetro | Significado |
|---|---|
| `q1`, `q8`, `q2`, `q4`, `q3` | Respostas do wizard pontuado (IDs das opções) |
| `dt=m365_copilot\|cowork\|scout\|both` | Destino do ponto de entrada |
| `st=chat\|agents` | Qual superfície do M365 Copilot destacar |
| `r=<plataforma>` + `d=AAAAMMDD` | Recomendação e data originais; alimentam o aviso de mudança temporal |
| `mode=card\|wizard` | Renderizar um card de resultado ou reexecutar o wizard |
| `ft=1` (legado), `dt=copilot_chat` (legado) | Resolvem para o card do M365 Copilot |

As respostas também persistem no `sessionStorage` sob `apa-answers`; parâmetros de URL sempre têm precedência sobre respostas armazenadas.

## Design system

Sempre leia `docs/DESIGN.md` antes de qualquer decisão visual ou de interface. Fontes, cores, espaçamento, raio, sombras, movimento e direção estética estão definidos lá. Não desvie sem aprovação explícita do usuário. Em modo QA, sinalize qualquer código que não siga o `docs/DESIGN.md`.

Restrições principais:

- A cor de sinal é `#0078D4` no modo escuro e `#005A9E` no claro. Use apenas uma cor de sinal. Texto azul sobre o canvas escuro precisa usar `#2B9AEE` (`#0078D4` fica em 3,94:1 e reprova no AA como texto)
- O canvas é carvão fosco e quente `#1A1714` com uma grade sutil, não preto-azulado, e sem brilhos coloridos ou `box-shadow` no accent
- A fonte de corpo é `IBM Plex Sans`; a `IBM Plex Mono` é só para pontuações, IDs, contadores, selos e rótulos diagnósticos, nunca para texto corrido
- Tamanhos de fonte são sempre `rem` via os tokens `--fs-*` no `:root`, nunca `px`. 12px (`--fs-mono-sm`) é o piso, e a tipografia nunca encolhe nos breakpoints mobile

## Convenções

- Sempre atualize o `docs/CHANGELOG.md` depois de fazer mudanças. As seções são datadas pela data do commit (`## 2026-07-24`); trabalho em andamento fica sob `## Unreleased` até ser commitado.
- Sempre atualize `docs/FLOWCHART.md` e `docs/SCORING.md` depois de mudanças que afetem o fluxo do usuário ou a lógica de pontuação.
- Os IDs de pergunta no `apa.yaml` não são sequenciais (ex.: `q1, q8, q2, q4, q3`), porque preservam identidade entre mudanças de schema. A ordem de exibição é a ordem do array no `apa.yaml`, não a do ID numérico.
- Cards de ponto de entrada (`ENTRY_POINT_PLATFORMS` no `apa.js`) renderizam seus acordeões expandidos; cards de comparação pontuada permanecem recolhidos.
- Nos testes, não identifique um card de recomendação apenas por um trecho do título, porque vários destinos compartilham a expressão "Microsoft 365 Copilot". Verifique o texto exato de `.rec-platform-name` mais algo que os distinga.
