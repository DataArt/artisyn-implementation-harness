# Documentation Principles

_Why these principles exist, what they are, and which structure fits which doc type._

---

## Why

Documentation degrades in two ways: it grows too long to read, or it grows too thin to trust. Both failures have the same root cause — the author did not have a rule for what belongs here versus somewhere else.

These principles exist so that every document in this repo is worth reading: short enough to consume, precise enough to act on, and located where a future reader would look for it.

A secondary reason: frontier AI models follow ~150–200 instructions reliably before quality degrades uniformly. Root context files (CLAUDE.md, AGENTS.md) that exceed this budget dilute every instruction in them. The principles below apply to human-facing docs and AI-facing context files equally.

---

## What

**Separation of Concerns (SoC)** — each document covers one concern. If a README covers local setup _and_ architecture _and_ deployment, split it. Each topic goes where its audience looks: architecture to `docs/`, operations to `Engineering Guide/`, local setup to the app README.

**Keep It Simple (KISS)** — write the minimum that is unambiguous. Prefer one sentence over three. Prefer a table over three paragraphs. Delete any sentence whose removal does not change the meaning.

**Don't Repeat Yourself (DRY)** — each concept lives in one place. Everywhere else: one sentence + a link. Never duplicate content between an app README and the Engineering Guide. When the source changes, one edit is enough.

**Progressive disclosure** — root context files point; they do not inline. A line that says "read X for Y" costs ~10–15 tokens and stays accurate indefinitely. Inlined content costs hundreds of tokens and drifts the moment the source is updated.

**Length budget** — root context files (CLAUDE.md, AGENTS.md, steering files): 60–130 lines. Engineering Guide articles: under 150 lines. LLD container docs: under 120 lines. HLD container docs: under 80 lines. If a doc exceeds its budget, something is in the wrong place.

**Certainty principle** — architecture docs (HLD and LLD) state only settled outcomes. No comparisons, open questions, or rationale. Those belong in `Stories/<TICKET>/design/`. → See `docs/README.md`.

**Don't auto-generate root context** — CLAUDE.md and its equivalents are the highest-leverage files in the harness. Generate a scaffold from the bootstrap prompt, then edit by hand. Auto-generated root context is generic; hand-edited root context is precise.

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

## How — doc-type cheat sheet

| Doc type                                  | Structure                                                                     | Length target |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ------------- |
| Root context file (CLAUDE.md / AGENTS.md) | WHY (2–3 sentences) → WHAT (rules + pointers) → HOW (slash commands / agents) | 60–130 lines  |
| Engineering Guide article                 | Problem → Steps → Notes                                                       | < 150 lines   |
| HLD container doc                         | Responsibilities → Technology → Data flow → NFRs → Open questions             | < 80 lines    |
| LLD container doc                         | Overview → Component detail → Integration patterns → Key decisions            | < 120 lines   |
| Convention skill                          | Rule → Why → How to apply                                                     | < 40 lines    |
| Orchestrator skill                        | Orchestration pattern + per-phase invariants                                  | < 60 lines    |
| App README                                | What → How to run locally → Links to HLD + LLD                                | < 60 lines    |
| ADR (Architecture Decision Record)        | Context → Decision → Consequences                                             | < 60 lines    |

This document follows its own rules: it states why these principles exist, what they are, and how to apply them — nothing else.
