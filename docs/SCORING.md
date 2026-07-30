# Scoring System — Agent Platform Advisor

Reference document for how the APA scoring engine works. All data is driven from `apa.yaml`.

## Platforms

| ID | Label | Description |
|---|---|---|
| `agent_builder` | Agent Builder | No-code declarative agents inside Microsoft 365 Copilot |
| `m365_copilot` | Microsoft 365 Copilot | Built-in Copilot experiences — Copilot Chat, Search, app-native assistance, and Microsoft-built agents (entry-point wizard only) |
| `copilot_studio` | Copilot Studio | Governed low-code enterprise agents with tools, workflows, triggers, computer use, evaluation, monitoring, and broad publishing |
| `foundry` | Microsoft Foundry | Managed production agent runtime for prompt agents, hosted code agents, custom retrieval, tools, identity, observability, and Azure-scale controls |
| `databricks` | Databricks Agent Bricks | Agents built, evaluated, governed, and served on the data platform — grounded in Unity Catalog tables and governed document collections |

`databricks` is the one non-Microsoft platform in the matrix. It is scored only when the scenario is anchored in the data platform: the knowledge lives in a lakehouse, the data team owns the build, and the agent is served next to the data. Because Agent Bricks cannot ground on Microsoft 365 content and cannot publish into Microsoft 365 Copilot chat, those answers zero it out through hard rules, exactly as other platform limits are enforced.

M365 Copilot is excluded from the scored assessment. It is only recommended via the entry-point wizard (or the legacy `?ft=1` / `?dt=copilot_chat` share links). In the full wizard, `m365_copilot` is always zeroed.

## Non-scored destinations: entry-point wizard (Microsoft 365 Copilot, Cowork & Scout)

Microsoft 365 Copilot, Cowork, and Scout are **not** build platforms — they are ready-made places to *get work done*, not platforms you build on. They are **not** part of the scored wizard, are **not** in `meta.platforms`, and never enter the 0–15 sum. They are reached via the prescreen path **"Help me find the right place to get work done,"** which opens a short **entry-point wizard** ("Where should you get this work done?"). This wizard exists because Microsoft asks end users to choose between too many entry points (Microsoft 365 Copilot vs. Cowork vs. Scout); the wizard resolves that choice from work patterns instead of product names. There is no longer a separate "built-in Microsoft 365 Copilot experience" prescreen tile — that destination now lives inside this wizard.

**Copilot Chat is not a destination.** Copilot Chat and the built-in agents (Researcher, Analyst, Facilitator, Interpreter, …) are *surfaces of* Microsoft 365 Copilot, not products that compete with it. Staying hands-on therefore always resolves to the single `m365_copilot` card; the task-type answer only selects which surface the card tells you to **Start Here** with, via `recommendations.m365_copilot.start_here` in `apa.yaml` (`chat` or `agents`).

The first question forks the flow:

| Question | Options |
|---|---|
| **Involvement** — how do you want to work? | Stay hands-on and iterate turn-by-turn · Hand it off and let an agent run |

- **Hands-on / interactive** → a follow-up asks **what kind of task** it is:

  | Question | Options |
  |---|---|
  | **Task type** | General help (brainstorm, find info, catch up on email/meetings, draft & edit documents) · A specialized task (deep research, data analysis, meeting facilitation, translation) |

  Both answers resolve to **Microsoft 365 Copilot** (`m365_copilot`). General selects the **Copilot Chat** start surface; specialized selects the **built-in agents** start surface (Researcher, Analyst, Facilitator, Interpreter, …).

- **Hand it off / delegate** → two follow-up questions decide between Cowork and Scout. They are asked **progressively**: Cadence appears first, and Reach is revealed only once a cadence has been answered (so both questions never show at once).

  | Question | Options |
  |---|---|
  | **Cadence** (asked first) — how should the agent work? | On-demand (finish a multi-step job in one go — several artifacts or a process across systems) · Continuous (always-on, manage & coordinate my day) · Not sure |
  | **Reach** (revealed after Cadence) — where does it need to reach? | Microsoft 365 only · Also desktop/browser/local/CLI · Not sure |

**Routing rule** (`resolveDelegateResult(involvement, taskType, cadence, reach)` in `apa.js`):

| Condition | Result |
|---|---|
| Involvement = interactive | **Microsoft 365 Copilot** (`m365_copilot`) — `resolveDelegateStart` then picks the start surface: specialized → `agents`, general → `chat` |
| Cadence = continuous | **Scout** |
| Reach = cross-environment | **Scout** |
| Cadence = on-demand **and** Reach = Microsoft 365 | **Cowork** |
| Otherwise (undecided signals) | **Both** (Cowork + Scout), shown as a complementary pair |

**Readiness** (`isDelegateReady` in `apa.js`): interactive requires a task type; delegate requires both cadence and reach before the wizard can finish.

> `m365_copilot` still exists in `meta.platforms` for content, but is always zeroed in the scored wizard (`if (!fastTrack) zeroed['m365_copilot'] = true`) — it only surfaces as this wizard destination. The legacy `?ft=1` share link still resolves to the same card for backward compatibility, as does the legacy `?dt=copilot_chat` link (it maps to `dt=m365_copilot` with the `chat` start surface). New share links carry the surface as `&st=chat|agents`.

## Questions and Scoring Matrix

Five questions, each scored 0–3 per platform. Max raw score: **15** (5 × 3).

### Q1 — Who is building this agent?

| Option | ID | Agent Builder | CS | Foundry | DBX |
|---|---|---|---|---|---|
| Business user / SME — no coding | q1a | **3** | 1 | 0 | 1 |
| Low-code maker / IT pro | q1b | 1 | **3** | 0 | 1 |
| Professional developer | q1c | 0 | 2 | **3** | 2 |
| Data scientist / ML engineer | q1d | 0 | 1 | **3** | **3** |
| Data platform / data engineering team | q1e | 0 | 1 | 2 | **3** |

CS gets 2 for q1c because it supports pro developers via YAML authoring and the VS Code extension.

**q1e** was added with Agent Bricks. The persona that owns the lakehouse, the pipelines, and Unity Catalog governance is distinct from a data scientist: they build agents *as part of the data platform*, so Agent Bricks leads and Foundry stays credible as the Azure-side alternative. Agent Bricks still scores 1 for q1a/q1b because its managed builders are usable without code — but only inside a Databricks workspace that someone else provisions.

### Q8 — Who will use this agent?

Audience scope separates Agent Builder's quick small-team sweet spot from Copilot Studio's managed deployment model. External-facing remains a hard constraint that eliminates Agent Builder and M365 Copilot.

| Option | ID | Agent Builder | CS | Foundry | DBX | Hard Rule |
|---|---|---|---|---|---|---|
| Me or a small internal team | q8a | **3** | 2 | 1 | 1 | — |
| Department or broad internal audience | q8c | 1 | **3** | 2 | 2 | — |
| External users | q8b | 0 | **3** | **3** | 2 | Zeros AB, M365 |
| Not decided yet | q8d | 2 | 2 | 1 | 1 | — |

Agent Bricks scores low on audience across the board: serving an agent to people is not where it differentiates. It gets 2 for external users because agents can be served as public endpoints or apps, but the delivery channel usually ends up being a Microsoft or custom front end.

### Q2 — Where will users interact with this agent?

Deployment surface is still a hard constraint. Agent Builder runs inside Microsoft 365 Copilot chat surfaces, not custom apps or event-driven runtimes.

| Option | ID | Agent Builder | CS | Foundry | DBX | Hard Rule |
|---|---|---|---|---|---|---|
| Microsoft 365 Copilot chat | q2a | **3** | **3** | 2 | 0 | Zeros DBX |
| Custom app (website/mobile) | q2b | 0 | **3** | **3** | **3** | Zeros AB |
| Background (event-driven) | q2c | 0 | **3** | **3** | 2 | Zeros AB |
| Multiple / not decided | q2d | 1 | **3** | **3** | 1 | — |
| Data and analytics environment | q2e | 0 | 1 | 2 | **3** | Zeros AB |

**q2e** was added with Agent Bricks: notebooks, natural-language data exploration, BI, and governed agent endpoints served by the data platform. It is the mirror image of q2a — where q2a disqualifies Agent Bricks, q2e disqualifies Agent Builder. Copilot Studio keeps a 1 because it can call a data-platform endpoint, and Foundry a 2 because it can host the application layer around one.

Foundry now scores higher for deployment flexibility because Foundry agents can publish stable endpoints, integrate with custom applications and services, and be published to Microsoft 365 Copilot or Teams. Copilot Studio remains tied or stronger when the target is low-code Microsoft 365 or Power Platform delivery.

### Q4 — What should this agent do?

Task complexity is the strongest discriminator between Agent Builder, Copilot Studio, and Foundry. Agent Builder now scores well for lightweight content/data-analysis capabilities enabled in declarative agents, but is still zeroed for action workflows.

| Option | ID | Agent Builder | CS | Foundry | DBX | Hard Rule |
|---|---|---|---|---|---|---|
| Simple Q&A / lookups | q4a | **3** | **3** | 1 | 2 | — |
| Conversational (multi-turn) | q4b | 2 | **3** | 2 | 2 | — |
| Create/analyze content in Copilot | q4e | **3** | 2 | 2 | 1 | — |
| Multi-step tasks with actions | q4c | 0 | **3** | **3** | 2 | Zeros AB |
| Complex orchestration | q4d | 0 | 2 | **3** | **3** | Zeros AB, M365 |
| Reason over large volumes of enterprise data | q4f | 0 | 1 | 2 | **3** | Zeros AB |

**q4f** was added with Agent Bricks and is the task type the previous five options had no home for: structured extraction across document collections, natural-language questions over governed tables, and tuning answer quality on your own data. Agent Bricks also reaches 3 on q4d because Supervisor Agent orchestrates data agents, Unity Catalog functions, MCP servers, and custom agents behind one entry point.

Foundry gets 1 for q4a because it can do simple Q&A, but is usually overkill for simple knowledge scenarios. It gets 2 for q4e because code interpreter, file search, and hosted agents can support richer content/data-analysis workloads when the team needs developer control.

### Q3 — What information does this agent need to access?

Agent Builder is no longer treated as "Microsoft 365 files only." It can use Microsoft 365 content, scoped web, embedded files, and admin-enabled Microsoft 365 Copilot connectors. Copilot Studio is the strongest low-code option for Dataverse, custom connectors, business APIs, and Power Platform integration. Foundry now gets weak credit for Microsoft 365, web, and file grounding because Foundry tools and Foundry IQ can reach those sources, but it remains strongest for custom RAG, Azure AI Search, private indexes, tuned Foundry IQ knowledge bases, and engineering-managed retrieval systems.

| Option | ID | Agent Builder | CS | Foundry | DBX | Hard Rule |
|---|---|---|---|---|---|---|
| Microsoft 365 content | q3a | **3** | 2 | 1 | 0 | Zeros DBX |
| Connector-backed business systems | q3b | 2 | **3** | 2 | 0 | Zeros DBX |
| Dataverse / custom connectors / business APIs | q3c | 0 | **3** | 2 | 1 | Zeros AB |
| M365 + connector-backed systems | q3d | 2 | **3** | 2 | 0 | Zeros DBX |
| Public websites or uploaded files | q3e | **3** | 2 | 1 | 1 | — |
| Custom RAG / Azure AI Search / private indexes / Foundry IQ | q3f | 0 | 1 | **3** | 2 | Zeros AB |
| Lakehouse / Unity Catalog / Delta tables | q3g | 0 | 1 | 2 | **3** | Zeros AB |

**q3g** was added with Agent Bricks and is the strongest single signal for it. Q3 is also where Agent Bricks is most often eliminated: the three Microsoft 365-flavoured sources (q3a, q3b, q3d) zero it, because Agent Bricks grounds on lakehouse data governed in Unity Catalog and has no path into SharePoint, OneDrive, Teams, Outlook, or the Microsoft 365 Copilot connector catalog. It keeps a 2 on q3f — engineering-managed retrieval is the shape it is built for, even when the index itself lives elsewhere.

## Scoring Pipeline

### Step 1 — Hard rules (pre-sum)

Hard rules zero out platforms before scores are summed. They represent real platform limitations.

| Trigger | Platforms zeroed | Reason |
|---|---|---|
| q8b (external users) | AB, M365 | Cannot publish externally |
| q4d (complex orchestration) | AB, M365 | Requires Copilot Studio or Foundry orchestration |
| q4c (multi-step action workflows) | AB | Cannot submit forms, update records, or take actions across systems |
| q2b (custom app) | AB | Can only run inside Microsoft 365 Copilot surfaces |
| q2c (background) | AB | No event-driven or autonomous background runtime |
| q3c (direct business system integration) | AB | Cannot directly connect to Dataverse, custom connectors, or business APIs |
| q3f (custom retrieval architecture) | AB | Cannot directly use custom RAG, Azure AI Search, private indexes, Foundry IQ, or engineering-managed retrieval systems |
| q3g (lakehouse-governed data) | AB | Cannot query Unity Catalog, Delta tables, or warehouse-governed document collections |
| q2e (data and analytics environment) | AB | Only runs inside Microsoft 365, not in notebooks, BI, or data platform endpoints |
| q4f (large-scale data reasoning) | AB | Cannot extract at scale over document collections, query governed tables, or tune answer quality on your data |
| q3a (Microsoft 365 content) | DBX | Grounds on lakehouse data, not SharePoint, OneDrive, Teams, or Outlook |
| q3b (Microsoft 365 Copilot connectors) | DBX | Does not consume the Microsoft 365 connector catalog |
| q3d (M365 content + connectors) | DBX | No grounding path into Microsoft 365 sources |
| q2a (Microsoft 365 Copilot chat) | DBX | Agents are served from Databricks and have no native Microsoft 365 Copilot publishing path |

Additionally, M365 Copilot is always zeroed in the full assessment (hard-coded in JS).

### Step 2 — Sum raw scores

For each platform not zeroed: sum the scores from all answered questions. Range: 0–15.

### Step 2.5 — Persona preferences (soft overrides)

Persona preferences force one platform above another in ranking regardless of scores. Unlike hard rules, all scores are preserved — the override only affects sort order. A rationale message is displayed as a key factor on the recommendation card.

| Trigger | Prefer | Over | Rationale |
|---|---|---|---|
| q1d (data scientist / AI-ML) | Copilot Studio | Agent Builder | CS supports curated model selection, evaluations, Foundry IQ integration, code-first development, and flexible orchestration that AB lacks |

### Step 3 — Threshold labels

| Score | Label |
|---|---|
| 12–15 | Strong fit |
| 8–11 | Good fit |
| 4–7 | Partial fit |
| 0–3 | Not recommended |

### Step 4 — Rank and recommend

Platforms are sorted by score descending. The highest-scoring platform is the primary recommendation. The second-highest is shown as "Also consider" when it is viable.

### Step 5 — Tie handling

When the top two platforms score within **2 points**, they're presented as a complementary pair when that pair is listed in `valid_pairs`.

| Pair | Rationale |
|---|---|
| Copilot Studio + Foundry | Build in CS, extend with custom code in Foundry |
| M365 Copilot + Copilot Studio | M365 Copilot for end users, CS for customization |
| Agent Builder + M365 Copilot | AB for Microsoft 365-native agents, M365 for extensibility |
| Agent Bricks + Foundry | Agent Bricks for lakehouse-grounded reasoning, Foundry for the Azure application, identity, networking, and Microsoft 365 publishing |
| Copilot Studio + Agent Bricks | Agent Bricks to reason over lakehouse data, CS to bring the answer to employees in Teams and Microsoft 365 |

**Persona-based tiebreakers** — when two platforms score equally and a specific persona answer is selected, one platform is preferred:

| Trigger | Platforms | Prefer | Rationale |
|---|---|---|---|
| q1c (professional developer) | AB, CS | CS | CS supports code-first authoring via VS Code extension |
| q1d (data scientist / AI-ML) | CS, Foundry | CS | CS provides a faster path to production agents |
| q3g (lakehouse data) | CS, DBX | DBX | Builds the agent where the data, permissions, and lineage already are, instead of exporting or re-indexing |
| q1e (data platform team) | Foundry, DBX | DBX | Keeps the agent in the same governance plane as the data instead of adding a second platform to operate |

### Step 6 — Cross-question notes

Contextual warning banners when answer combinations are logically contradictory:

| Condition | Note |
|---|---|
| q2c + q4a | Background agent doing simple Q&A — contradictory |
| q8b + q2a | External users in Microsoft 365 Copilot chat — external users can't access your tenant |
| q1a + q4d | Business user wants complex orchestration — requires dev skills |
| q1a + q3c | Business user needs direct business system integration — requires technical expertise |
| q1a + q3f | Business user needs custom retrieval architecture — requires engineering expertise |
| q3g + q2a | Lakehouse knowledge but Microsoft 365 Copilot chat delivery — no native publishing path; front it with a CS or Foundry agent |
| q1a + q3g | Business user needs lakehouse data — access and serving are owned by the data platform team |
| q1e + q3a | Data platform team but Microsoft 365 content — that content is reached through Copilot connectors and Graph, not the lakehouse |

### Step 7 — Winner-persona mismatch

| Winner | Persona | Note |
|---|---|---|
| Foundry | q1a (business user) | Requires professional development skills and Azure expertise — partner with a development team |
| Agent Bricks | q1a (business user) | Assumes the organization already runs on Databricks and someone can grant governed data access |
| Agent Bricks | q1b (low-code maker / IT pro) | Lives outside the Microsoft stack — a workspace, Unity Catalog permissions, and serving capacity are prerequisites |

## Distribution Analysis

Across all 1,920 possible answer combinations:

| Platform | Wins | % |
|---|---:|---:|
| Copilot Studio | 2,885 | 68.7% |
| Foundry | 851 | 20.3% |
| Databricks Agent Bricks | 390 | 9.3% |
| Agent Builder | 74 | 1.8% |

**Exact top-score ties:** 836 combos (19.9%) — 562 CS/Foundry, 142 Agent Bricks/Foundry, 94 CS/Agent Bricks, 38 AB/CS. **Close-score cases within 2 points:** 3,028 combos (72.1%) — still dominated by CS/Foundry (2,075), reflecting the intentional overlap between Copilot Studio's governed low-code runtime and Foundry's developer-controlled runtime, with Agent Bricks/Foundry (450) as the new second axis of overlap.

> The combination space grew from 1,920 to 4,200 when Agent Bricks added q1e, q2e, q4f, and q3g (5 × 4 × 5 × 6 × 7). Agent Builder's share fell from 3.1% to 1.8% not because its scoring changed, but because the four new options all disqualify it — the denominator grew with combinations it was never eligible for. Regenerate these numbers with a brute-force pass over `rankPlatforms()` whenever the matrix changes.

### When Agent Builder wins

AB now wins beyond the old SharePoint/OneDrive-only path. Its sweet spot is: **business user or low-code maker, small team or undecided internal audience, Microsoft 365 Copilot surface, Q&A/conversation/content-analysis, and Microsoft 365, web/uploaded, or connector-backed knowledge**.

Agent Builder still loses whenever the user needs external publishing, custom app deployment, background execution, direct business system integration, custom retrieval architecture, or action workflows that update external systems.

### When Foundry wins

Foundry wins when answers include strong technical or production-runtime signals: pro dev or ML persona (q1c/q1d), custom app or multi-surface deployment (q2b/q2d), complex or long-running orchestration (q4d), custom retrieval architecture (q3f), external-facing scenarios, or a need for managed endpoints, hosted code agents, private networking, tracing, evaluation, and full Azure control. Copilot Studio still ties or beats Foundry for event-triggered workflows and business APIs unless the scenario clearly needs full-code control.

### When Agent Bricks wins

Agent Bricks wins on the data-platform axis, not the Microsoft-surface axis: **data platform team or data scientist (q1e/q1d), lakehouse-governed knowledge (q3g), delivery in the data and analytics environment or a custom app (q2e/q2b), and large-scale data reasoning or multi-agent orchestration (q4f/q4d)**.

It is eliminated outright whenever the knowledge is Microsoft 365 content or connector-backed (q3a/q3b/q3d) or the agent must live inside Microsoft 365 Copilot chat (q2a). In practice this means Agent Bricks never competes for the classic Copilot scenario — it only appears when the user tells the advisor the scenario is anchored in their data estate.

### Copilot Studio dominance

CS remains the default recommendation for most combinations because it bridges Agent Builder's no-code Microsoft 365-native scenarios and Foundry's full-code scenarios. It wins when the user needs broader internal or external deployment, actions, branching workflows, event triggers, enterprise governance, Dataverse/custom connectors, MCP tools, computer use, evaluation, monitoring, or a safer path when scope is undecided.

### Score ranges when winning

| Platform | Min | Max | Avg |
|---|---:|---:|---:|
| Agent Builder | 10 | 15 | 12.5 |
| Copilot Studio | 7 | 15 | 11.8 |
| Foundry | 8 | 15 | 12.0 |
| Databricks Agent Bricks | 9 | 14 | 11.4 |

The lowest-scoring win is now 7 (Copilot Studio), a "Partial fit" — it occurs on data-platform-heavy combinations where every Microsoft platform is a compromise and Agent Bricks has been disqualified by a Microsoft 365 grounding answer. Agent Bricks never reaches 15 because it scores at most 2 on audience (Q8).

## Cross-question note frequency

| Note | Combos | % |
|---|---:|---:|
| Background + SimpleQA | 140 | 3.3% |
| External + M365 Copilot chat | 210 | 5.0% |
| BizUser + Orchestrate | 140 | 3.3% |
| BizUser + Business APIs | 120 | 2.9% |
| BizUser + Custom retrieval | 120 | 2.9% |
| Lakehouse + M365 Copilot chat | 120 | 2.9% |
| BizUser + Lakehouse | 120 | 2.9% |
| DataPlatformTeam + M365 content | 120 | 2.9% |
| Foundry + BizUser (persona mismatch) | 42 | 1.0% |
| Agent Bricks + BizUser (persona mismatch) | 85 | 2.0% |
| Agent Bricks + LowCodeMaker (persona mismatch) | 43 | 1.0% |

Notes are not mutually exclusive — a single combo can trigger multiple notes.
