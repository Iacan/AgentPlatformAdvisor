# Árvore de decisão

Fluxo completo do advisor: o prescreen, o wizard de ponto de entrada (não pontuado)
e a avaliação pontuada de agente personalizado.

## Legenda das plataformas

As caixas de pontuação usam abreviações. Cada pergunta atribui de 0 a 3 pontos a cada
uma das quatro plataformas da avaliação pontuada:

| Sigla | Plataforma | Papel na avaliação |
|---|---|---|
| **AB** | Agent Builder | Agentes declarativos no-code dentro do Microsoft 365 Copilot |
| **CS** | Copilot Studio | Agentes corporativos low-code governados, com ações e fluxos |
| **Foundry** | Microsoft Foundry | Agentes de produção code-first com runtime gerenciado |
| **DBX** | Databricks Agent Bricks | Agentes construídos e servidos no lakehouse, governados pelo Unity Catalog |

**Databricks Agent Bricks (DBX)** é a única opção não-Microsoft da matriz. Ele só
pontua alto quando o cenário está ancorado na plataforma de dados: conhecimento
governado pelo Unity Catalog, grandes coleções de documentos, ou o time de plataforma
de dados como responsável pela construção. Como não consegue se fundamentar em conteúdo
do Microsoft 365 nem publicar no chat do Microsoft 365 Copilot, três regras rígidas o
zeram: `q3a`, `q3b` e `q3d` (fontes do Microsoft 365) e `q2a` (implantação no chat do
Copilot). Dois critérios de desempate favorecem o DBX: `q3g` (conhecimento no lakehouse,
empate CS/DBX) e `q1e` (time de plataforma de dados, empate Foundry/DBX).

O **Microsoft 365 Copilot**, o **Copilot Cowork** e o **Microsoft Scout** não fazem parte
da pontuação de 0 a 15. Eles são alcançados apenas pelo wizard de ponto de entrada.

Símbolos usados no diagrama: ⚠️ = a resposta dispara uma regra rígida · 🔀 = a resposta
dispara um desempate ou preferência por perfil.

## Diagrama

```mermaid
flowchart TD
    START([Início]) --> PRESCREEN{"**Prescreen: por onde você quer começar?**"}

    PRESCREEN -->|"Me ajude a encontrar o lugar certo para realizar meu trabalho"| DELEGATE{"**Wizard de ponto de entrada**\nOnde você deve realizar esse trabalho?\n(não pontuado)"}
    PRESCREEN -->|"Explorar o que é possível"| EXPLORE["Grade de exploração\n(todas as plataformas + Cowork + Scout)"]
    PRESCREEN -->|"Criar um agente personalizado"| Q1

    DELEGATE -->|"Participação: conduzir eu mesmo / iterar"| INTERACTIVE{"**Desdobramento interativo**\nQue tipo de tarefa?"}
    DELEGATE -->|"Participação: delegar"| DELEGATE2{"**Desdobramento de delegação**\nCadência (perguntada primeiro)"}
    INTERACTIVE -->|"Ajuda geral"| CHAT["**Microsoft 365 Copilot**\nComece por aqui: Copilot Chat\nPergunte, resuma e redija no fluxo do trabalho"]
    INTERACTIVE -->|"Tarefa especializada (pesquisa, dados, reuniões, tradução)"| M365AGENTS["**Microsoft 365 Copilot**\nComece por aqui: agentes nativos\nResearcher · Analyst · Facilitator · Interpreter …"]
    DELEGATE2 -->|"Cadência respondida → revela Alcance"| REACH{"**Alcance**\nAté onde ele precisa alcançar?"}
    REACH -->|"Cadência: contínua OU Alcance: multiambiente"| SCOUT["**Microsoft Scout**\nAutopilot sempre ativo no desktop, navegador e M365\n(preview do Frontier)"]
    REACH -->|"Cadência: sob demanda E Alcance: Microsoft 365"| COWORK["**Copilot Cowork**\nEntregas M365 de várias etapas sob demanda"]
    REACH -->|"Sinais indefinidos"| BOTH["**Ambos**, como par complementar\nScout monitora · Cowork entrega"]

    Q1["**Q1: quem vai criar este agente?**"]
    Q1 -->|"Usuário de negócio / sem código"| Q1A["AB:3 · CS:1 · Foundry:0 · DBX:1"]
    Q1 -->|"Criador low-code / profissional de TI"| Q1B["AB:1 · CS:3 · Foundry:0 · DBX:1"]
    Q1 -->|"🔀 Desenvolvedor profissional"| Q1C["AB:0 · CS:2 · Foundry:3 · DBX:2\n→ DESEMPATE: empate com AB → prefere CS"]
    Q1 -->|"🔀 Cientista de dados / IA-ML"| Q1D["AB:0 · CS:1 · Foundry:3 · DBX:3\n→ PREF. DE PERFIL: CS sempre acima de AB\n→ DESEMPATE: empate CS/Foundry → prefere CS"]
    Q1 -->|"🔀 Time de plataforma / engenharia de dados"| Q1E["AB:0 · CS:1 · Foundry:2 · DBX:3\n→ DESEMPATE: empate Foundry/DBX → prefere DBX"]

    Q1A & Q1B & Q1C & Q1D & Q1E --> Q8

    Q8["**Q8: quem vai usar este agente?**"]
    Q8 -->|"Eu ou um pequeno time interno"| Q8A["AB:3 · CS:2 · Foundry:1 · DBX:1"]
    Q8 -->|"Área / público interno amplo"| Q8C["AB:1 · CS:3 · Foundry:2 · DBX:2"]
    Q8 -->|"⚠️ Usuários externos"| Q8B["AB:0 · CS:3 · Foundry:3 · DBX:2\n→ REGRA RÍGIDA: AB=0"]
    Q8 -->|"Ainda não decidido"| Q8D["AB:2 · CS:2 · Foundry:1 · DBX:1"]

    Q8A & Q8C & Q8B & Q8D --> Q2

    Q2["**Q2: onde as pessoas vão interagir?**"]
    Q2 -->|"⚠️ Chat do Microsoft 365 Copilot"| Q2A["AB:3 · CS:3 · Foundry:2 · DBX:0\n→ REGRA RÍGIDA: DBX=0"]
    Q2 -->|"⚠️ App personalizado / site"| Q2B["AB:0 · CS:3 · Foundry:3 · DBX:3\n→ REGRA RÍGIDA: AB=0"]
    Q2 -->|"⚠️ Segundo plano / disparado por evento"| Q2C["AB:0 · CS:3 · Foundry:3 · DBX:2\n→ REGRA RÍGIDA: AB=0"]
    Q2 -->|"Vários lugares / indefinido"| Q2D["AB:1 · CS:3 · Foundry:3 · DBX:1"]
    Q2 -->|"⚠️ Ambiente de dados e analytics"| Q2E["AB:0 · CS:1 · Foundry:2 · DBX:3\n→ REGRA RÍGIDA: AB=0"]

    Q2A & Q2B & Q2C & Q2D & Q2E --> Q4

    Q4["**Q4: o que este agente deve fazer?**"]
    Q4 -->|"Perguntas e respostas, consultas, resumos"| Q4A["AB:3 · CS:3 · Foundry:1 · DBX:2"]
    Q4 -->|"Conversa de múltiplos turnos"| Q4B["AB:2 · CS:3 · Foundry:2 · DBX:2"]
    Q4 -->|"Criar/analisar conteúdo no Copilot"| Q4E["AB:3 · CS:2 · Foundry:2 · DBX:1"]
    Q4 -->|"⚠️ Fluxos de ação de várias etapas"| Q4C["AB:0 · CS:3 · Foundry:3 · DBX:2\n→ REGRA RÍGIDA: AB=0"]
    Q4 -->|"⚠️ Fluxos complexos / multiagente"| Q4D["AB:0 · CS:2 · Foundry:3 · DBX:3\n→ REGRA RÍGIDA: AB=0"]
    Q4 -->|"⚠️ Raciocinar sobre grandes volumes de dados corporativos"| Q4F["AB:0 · CS:1 · Foundry:2 · DBX:3\n→ REGRA RÍGIDA: AB=0"]

    Q4A & Q4B & Q4E & Q4C & Q4D & Q4F --> Q3

    Q3["**Q3: a que informações o agente precisa acessar?**"]
    Q3 -->|"⚠️ Conteúdo do Microsoft 365"| Q3A["AB:3 · CS:2 · Foundry:1 · DBX:0\n→ REGRA RÍGIDA: DBX=0"]
    Q3 -->|"⚠️ Sistemas de negócio via conectores"| Q3B["AB:2 · CS:3 · Foundry:2 · DBX:0\n→ REGRA RÍGIDA: DBX=0"]
    Q3 -->|"⚠️ Dataverse / conectores personalizados / APIs"| Q3C["AB:0 · CS:3 · Foundry:2 · DBX:1\n→ REGRA RÍGIDA: AB=0"]
    Q3 -->|"⚠️ M365 + sistemas via conectores"| Q3D["AB:2 · CS:3 · Foundry:2 · DBX:0\n→ REGRA RÍGIDA: DBX=0"]
    Q3 -->|"Sites públicos / arquivos enviados"| Q3E["AB:3 · CS:2 · Foundry:1 · DBX:1"]
    Q3 -->|"⚠️ RAG personalizado / índices privados"| Q3F["AB:0 · CS:1 · Foundry:3 · DBX:2\n→ REGRA RÍGIDA: AB=0"]
    Q3 -->|"🔀 Lakehouse / Unity Catalog / tabelas Delta"| Q3G["AB:0 · CS:1 · Foundry:2 · DBX:3\n→ REGRA RÍGIDA: AB=0\n→ DESEMPATE: empate CS/DBX → prefere DBX"]

    Q3A & Q3B & Q3C & Q3D & Q3E & Q3F & Q3G --> SCORE

    SCORE["**Aplica regras rígidas + soma as pontuações**\nAntes da soma: zera plataformas conforme as regras rígidas\nMáximo possível: 15 pts por plataforma"]

    SCORE --> PREF["**Preferências por perfil**\nAjustes suaves: forçam a ordem do ranking\nsem alterar as pontuações\n(ex.: q1d → CS sempre acima de AB)"]

    PREF --> RESULT["**Faixas de recomendação**\n12–15: Encaixe forte\n8–11: Bom encaixe\n4–7: Encaixe parcial\n0–3: Não recomendado"]

    RESULT --> NOTES["**Pós-processamento**\nNotas de contradição entre perguntas\nAvisos de descompasso com o perfil\nTratamento de empate → pares complementares"]

    style Q1C fill:#e8f0fe,stroke:#4a86e8
    style Q1D fill:#e8f0fe,stroke:#4a86e8
    style Q1E fill:#e8f0fe,stroke:#4a86e8
    style Q3G fill:#e8f0fe,stroke:#4a86e8
    style SCOUT fill:#ECEBFB,stroke:#5B5FC7
    style COWORK fill:#ECEBFB,stroke:#5B5FC7
    style CHAT fill:#ECEBFB,stroke:#5B5FC7
    style M365AGENTS fill:#ECEBFB,stroke:#5B5FC7
    style BOTH fill:#ECEBFB,stroke:#5B5FC7
    style DELEGATE fill:#ECEBFB,stroke:#5B5FC7
    style DELEGATE2 fill:#ECEBFB,stroke:#5B5FC7
    style INTERACTIVE fill:#ECEBFB,stroke:#5B5FC7
    style Q8B fill:#fff3cd,stroke:#ffc107
    style Q2A fill:#fff3cd,stroke:#ffc107
    style Q2B fill:#fff3cd,stroke:#ffc107
    style Q2C fill:#fff3cd,stroke:#ffc107
    style Q2E fill:#fff3cd,stroke:#ffc107
    style Q4C fill:#fff3cd,stroke:#ffc107
    style Q4D fill:#fff3cd,stroke:#ffc107
    style Q4F fill:#fff3cd,stroke:#ffc107
    style Q3A fill:#fff3cd,stroke:#ffc107
    style Q3B fill:#fff3cd,stroke:#ffc107
    style Q3C fill:#fff3cd,stroke:#ffc107
    style Q3D fill:#fff3cd,stroke:#ffc107
    style Q3F fill:#fff3cd,stroke:#ffc107
    style SCORE fill:#e8f4fd,stroke:#0078D4
    style PREF fill:#e8f0fe,stroke:#4a86e8
    style RESULT fill:#d4edda,stroke:#28a745
    style NOTES fill:#f8f0fb,stroke:#6f42c1
```
