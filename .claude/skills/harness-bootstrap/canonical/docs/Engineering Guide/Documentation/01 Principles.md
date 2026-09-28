# Documentation Principles

_Why these principles exist, what they are, and which structure fits which doc type._

---

## Why

Documentation degrades in two ways: it grows too long to read, or it grows too thin to trust. Both failures have the same root cause — the author did not have a rule for what belongs here versus somewhere else.

These principles exist so that every document in this repo is worth reading: short enough to consume, precise enough to act on, and located where a future reader would look for it.

Root context files should prioritize actionable project rules and links to detailed guidance; apply the document budgets below without removing essential information.

---

## Core doc principles

Every permanent-doc writer — including the `docs-writer` agent — applies this full list before drafting and rereads the actual file against it before handing work to a reviewer. Nothing here is restated in agent instructions; an agent points here instead.

**Separation of Concerns (SoC)** — each document covers one concern. If a README covers local setup _and_ architecture _and_ deployment, split it. Each topic goes where its audience looks: architecture to `docs/`, operations to `Engineering Guide/`, local setup to the app README.

**Keep It Simple (KISS)** — write the minimum that is unambiguous. Prefer one sentence over three. Prefer a table over three paragraphs. Delete any sentence whose removal does not change the meaning.

**Don't Repeat Yourself (DRY)** — each concept lives in one place. Everywhere else: one sentence + a link. Never duplicate content between an app README and the Engineering Guide. When the source changes, one edit is enough.

**Progressive disclosure** — root context files point; they do not inline. A line that says "read X for Y" costs ~10–15 tokens and stays accurate indefinitely. Inlined content costs hundreds of tokens and drifts the moment the source is updated.

**Length budget** — measured in prose lines only: Mermaid diagram blocks and tables never count against it, however long, since they carry information density prose can't match. Root context files ({{ROOT_INSTRUCTIONS}} and equivalents): 60–130 lines. Engineering Guide articles: under 150 lines. LLD container docs: under 120 lines. HLD container docs: under 80 lines. When prose still doesn't fit and the remaining content is genuinely essential, split a focused companion document along the natural topic boundary and link it — do this readily, not as a last resort fought over line-by-line; never compress essential coverage into dense, unreadable prose to stay under budget.

**Certainty principle** — architecture docs (HLD, LLD, NFR) state only settled outcomes. No unresolved comparisons or open questions, and no Gaps, open-question or TODO placeholder sections — including empty "no gaps" declarations. Keep uncertainty in the external run, design or review record (`Stories/<TICKET>/design/`). State approved targets separately from observed behavior; include rationale only when a decision source supports it. → See `docs/README.md`.

**Contradictory evidence** — test material claims against counterexamples, not only supporting examples. Inspect conflicting code, configuration and decisions; narrow or correct claims when evidence differs. Record inspected scope, exceptions and resolution in the external review record. Absence of a counterexample in a sample is not proof of a universal rule.

**Coverage keys over headings** — each Intent defines required semantic coverage as keys. Headings may vary: verify the coverage keys, not a fixed heading count or skeleton, and never invent content to fill a key. Record non-applicability in the verification record, not the document.

**Don't auto-generate root context** — {{ROOT_INSTRUCTIONS}} and its equivalents are the highest-leverage files in the harness. Generate a scaffold from the bootstrap prompt, then edit by hand. Auto-generated root context is generic; hand-edited root context is precise.

**Diagrams first** — port or create diagrams before writing prose. Every architecture doc needs at least one Mermaid diagram; add drill-down diagrams for complex sub-sections (deploy lifecycle, auth flow, data flow, topology). See Diagram and format standards below for ordering, coloring, and type selection.

**Destination confirmation** — before writing, confirm the doc's tier against Documentation destination below; if the caller specifies a destination, trust it, but flag a destination that looks wrong before writing rather than after.

---

## Docs index

`docs/README.md` is the navigation index for this repository's documentation.

**When adding a new file** under any docs directory, add a corresponding entry to the matching section in `docs/README.md`. **When renaming or removing a file**, update or remove the matching entry.

This is a project-specific invariant — AI tools and developers rely on it to discover docs without scanning the full tree.

---

## Documentation destination

Every permanent doc lands in exactly one location. Confirm before writing.

| Destination           | Path                              | What belongs here                                             |
| --------------------- | --------------------------------- | ------------------------------------------------------------- |
| **HLD**               | `docs/Target Architecture (HLD)/` | Design intent for containers, data flows, NFRs                |
| **LLD**               | `docs/System Architecture (LLD)/` | Implementation detail grounded in what is actually built      |
| **Engineering Guide** | `docs/Engineering Guide/`         | Cross-cutting conventions, operational procedures, onboarding |

SoC test: _"Does this describe design intent for a container?"_ → HLD. _"Is this an implementation detail?"_ → LLD. _"Is this a convention the whole team follows?"_ → Engineering Guide.

---

## Diagram and format standards

**Applicability**: architecture documents need diagrams that explain actual structure and important sequences. Add drill-down diagrams where ordering, branching or ownership would otherwise be unclear. A checklist, convention or requirement table does not need a decorative diagram.

**Format priority — apply in order:**

1. Mermaid diagram — for any structural or flow concept
2. Table — for structured comparisons, inventories, matrices
3. Short bullet list — only when a table would not fit
4. Prose — one-liner explanations only

Never write as prose what can be a diagram. Never write as bullets what can be a table.

**Coloring**: use semantically consistent colors supported by the diagram type. Flowcharts use `classDef` and subgraph `style`; sequence diagrams use supported theme/actor/region styling. Do not inject flowchart syntax into other diagram types.

Default palette tokens — reuse these roles across all harness diagrams instead of inventing per-document colors: `context` (supporting elements: fill `#e2e8f0`, stroke `#475569`, text `#0f172a`) and `required` (the elements the diagram is about: fill `#dbeafe`, stroke `#1d4ed8`, text `#172554`). Extend with additional semantically named classes when a diagram needs more roles.

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

| Doc type                                  | Structure                                                             | Length target |
| ----------------------------------------- | --------------------------------------------------------------------- | ------------- |
| Root context file ({{ROOT_INSTRUCTIONS}}) | WHY (2–3 sentences) → WHAT (rules + pointers) → HOW (skills / agents) | 60–130 lines  |
| Engineering Guide article                 | Problem → Steps → Notes                                               | < 150 lines   |
| HLD container doc                         | Coverage keys in `03 HLD Intent.md`                                   | < 80 lines    |
| LLD component doc                         | Coverage keys in `04 LLD Intent.md`                                   | < 120 lines   |
| Convention skill                          | Rule → Why → How to apply                                             | < 40 lines    |
| Orchestrator skill                        | Orchestration pattern + per-phase invariants                          | < 60 lines    |
| App README                                | What → How to run locally → Links to HLD + LLD                        | < 60 lines    |
| ADR (Architecture Decision Record)        | Context → Decision → Consequences                                     | < 60 lines    |

This document follows its own rules: it states why these principles exist, what they are, and how to apply them — nothing else.
