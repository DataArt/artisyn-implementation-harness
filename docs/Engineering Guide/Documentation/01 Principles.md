# Documentation Principles

_Why these principles exist, what they are, and which structure fits which doc type._

---

## Why

Documentation degrades in two ways: it grows too long to read, or it grows too thin to trust. Both failures have the same root cause — the author did not have a rule for what belongs here versus somewhere else.

These principles exist so that every document in this repo is worth reading: short enough to consume, precise enough to act on, and located where a future reader would look for it.

A secondary reason: frontier AI models follow ~150–200 instructions reliably before quality degrades uniformly. Root context files (CLAUDE.md) that exceed this budget dilute every instruction in them. The principles below apply to human-facing docs and AI-facing context files equally.

---

## What

**Separation of Concerns (SoC)** — each document covers one concern. If a README covers local setup _and_ architecture _and_ deployment, split it. Each topic goes where its audience looks: architecture to `docs/`, operations to `Engineering Guide/`, local setup to the app README.

**Keep It Simple (KISS)** — write the minimum that is unambiguous. Prefer one sentence over three. Prefer a table over three paragraphs. Delete any sentence whose removal does not change the meaning.

**Don't Repeat Yourself (DRY)** — each concept lives in one place. Everywhere else: one sentence + a link. Never duplicate content between an app README and the Engineering Guide. When the source changes, one edit is enough.

**Progressive disclosure** — root context files point; they do not inline. A line that says "read X for Y" costs ~10–15 tokens and stays accurate indefinitely. Inlined content costs hundreds of tokens and drifts the moment the source is updated.

**Length budget** — measured in prose lines only: Mermaid diagram blocks and tables never count against it, however long, since they carry information density prose can't match. Root context files (CLAUDE.md and equivalents): 60–130 lines. Engineering Guide articles: under 150 lines. LLD container docs: under 120 lines. HLD container docs: under 80 lines. When prose still doesn't fit and the remaining content is genuinely essential, split a focused companion document along the natural topic boundary and link it — do this readily, not as a last resort fought over line-by-line; never compress essential coverage into dense, unreadable prose to stay under budget.

**Certainty principle** — architecture docs (HLD, LLD, NFR) state only settled outcomes. No unresolved comparisons or open questions, and no Gaps, open-question or TODO placeholder sections — including empty "no gaps" declarations. Keep uncertainty in the external run, design or review record (`Stories/<TICKET>/design/`). State approved targets separately from observed behavior; include rationale only when a decision source supports it. → See `docs/README.md`.

**Contradictory evidence** — test material claims against counterexamples, not only supporting examples. Inspect conflicting code, configuration and decisions; narrow or correct claims when evidence differs. Record inspected scope, exceptions and resolution in the external review record. Absence of a counterexample in a sample is not proof of a universal rule.

**Certainty principle** — architecture docs (HLD and LLD) state only settled outcomes. No comparisons, open questions, or rationale. Those belong in `Stories/<TICKET>/design/`. → See `docs/README.md`.

**Don't auto-generate root context** — CLAUDE.md and its equivalents are the highest-leverage files in the harness. Generate a scaffold from the bootstrap prompt, then edit by hand. Auto-generated root context is generic; hand-edited root context is precise.

---

## How — doc-type cheat sheet

| Doc type                           | Structure                                                                     | Length target |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------- |
| Root context file (CLAUDE.md)      | WHY (2–3 sentences) → WHAT (rules + pointers) → HOW (slash commands / agents) | 60–130 lines  |
| Engineering Guide article          | Problem → Steps → Notes                                                       | < 150 lines   |
| HLD container doc                  | Responsibilities → Technology → Data flow → NFRs → Open questions             | < 80 lines    |
| LLD container doc                  | Overview → Component detail → Integration patterns → Key decisions            | < 120 lines   |
| Convention skill                   | Rule → Why → How to apply                                                     | < 40 lines    |
| Orchestrator skill                 | Orchestration pattern + per-phase invariants                                  | < 60 lines    |
| App README                         | What → How to run locally → Links to HLD + LLD                                | < 60 lines    |
| ADR (Architecture Decision Record) | Context → Decision → Consequences                                             | < 60 lines    |

---

## Documentation destination

![Documentation placement](/images/engineering-guide/docs-principles-placement.png)

Every permanent doc lands in exactly one location. Confirm before writing.

| Destination           | Path                              | What belongs here                                                    |
| --------------------- | --------------------------------- | -------------------------------------------------------------------- |
| **HLD**               | `docs/Target Architecture (HLD)/` | Design intent for the platform itself — containers, data flows, NFRs |
| **LLD**               | `docs/System Architecture (LLD)/` | Implementation detail grounded in what is actually built             |
| **Engineering Guide** | `docs/Engineering Guide/`         | Cross-cutting conventions, operational procedures, onboarding        |

SoC test: _"Does this describe the platform's design intent?"_ → HLD. _"Is this an implementation detail for a container?"_ → LLD. _"Is this a convention the whole team follows?"_ → Engineering Guide.

---

## Wiring Principle

![Docs wiring and discovery](/images/engineering-guide/docs-wiring-discovery.png)

Documentation is connected through progressive disclosure, not through one central index containing everything.

`docs/README.md` provides only the root navigation and points readers to the appropriate documentation area. Each area then owns its local navigation, and individual documents use cross-links to connect related knowledge.

The model is:

Root index → Section navigation → Relevant document → Related documents

The rules are simple: one source of truth per concept, link instead of duplicate, keep local navigation current, and add cross-links wherever they help a human or AI agent discover the next relevant piece of context.

This creates multiple discovery paths without duplicating content, so both engineers and agents can progressively load only the context they need.

---

## Diagram and format standards

**Minimum**: every doc MUST have at least one Mermaid high-level diagram. Drill-down diagrams are required for sections with complex flows (deploy lifecycle, auth, data pipeline, topology).

**Format priority — apply in order:**

1. Mermaid diagram — for any structural or flow concept
2. Table — for structured comparisons, inventories, matrices
3. Short bullet list — only when a table would not fit
4. Prose — one-liner explanations only

Never write as prose what can be a diagram. Never write as bullets what can be a table.

**Coloring**: every Mermaid diagram MUST use `classDef` (fill + stroke + color) and `style` on subgraph containers. No default-grey diagrams. Use semantically consistent colors: same logical role = same color across all diagrams in the repo.

**Diagram types by use case:**

| Use case                                 | Type                                    |
| ---------------------------------------- | --------------------------------------- |
| System topology, component relationships | `flowchart TD` or `flowchart LR`        |
| Deploy, auth, data lifecycle sequences   | `sequenceDiagram`                       |
| Pipeline stages, state machines          | `flowchart LR` with labeled stage nodes |
| Directory / folder structure             | `flowchart TD` with labeled nodes       |

---

## Authoring and acceptance

Read this document and the applicable intent before drafting any generated document.
Intents own semantic requirements; this file alone owns presentation and readability.
After writing, reread the actual file against both before handing it to a reviewer.

| Check              | Acceptance evidence in the external review record                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Reader utility     | Identify the reader's concrete question and the section/diagram that answers it                      |
| Structure and flow | Architecture shows ownership, dependencies and important sequences, not just a file inventory        |
| Readability        | Prefer diagrams for structure/flow and tables for contracts/inventories; prose connects them briefly |
| Specificity        | Rules and behavior have project evidence; targets have decision evidence; no generic filler          |
| Claim challenge    | Material claims were checked for contradictory evidence; exceptions and resolutions are recorded     |
| Separation         | Repeated setup/deployment/context facts live once and are linked where needed                        |
| Completeness       | Essential information survives length limits; reserve focused companion docs when needed             |
| Consistency        | Names, links, current/target distinctions and related documents agree                                |

A heading, line count or nonempty coverage field is not acceptance evidence. Record
violations as actionable findings, correct them, and recheck before marking complete.
Keep this review metadata outside published architecture. Document readiness does
not imply measured system compliance. Render diagrams after the final writer edits.

## How — doc-type cheat sheet

| Doc type                           | Structure                                                             | Length target |
| ---------------------------------- | --------------------------------------------------------------------- | ------------- |
| Root context file (CLAUDE.md)      | WHY (2–3 sentences) → WHAT (rules + pointers) → HOW (skills / agents) | 60–130 lines  |
| Engineering Guide article          | Problem → Steps → Notes                                               | < 150 lines   |
| HLD container doc                  | Coverage keys in `03 HLD Intent.md`                                   | < 80 lines    |
| LLD component doc                  | Coverage keys in `04 LLD Intent.md`                                   | < 120 lines   |
| Convention skill                   | Rule → Why → How to apply                                             | < 40 lines    |
| Orchestrator skill                 | Orchestration pattern + per-phase invariants                          | < 60 lines    |
| App README                         | What → How to run locally → Links to HLD + LLD                        | < 60 lines    |
| ADR (Architecture Decision Record) | Context → Decision → Consequences                                     | < 60 lines    |

This document follows its own rules: it states why these principles exist, what they are, and how to apply them — nothing else.
