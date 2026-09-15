# Target Agentic SDLC Setup

> [!WARNING] Target state
> This page describes where the organisation is heading, not where any single engagement is today. No project reaches this by running the harness once — it's the end state that project, product, and organisation-level wiring add up to over time.

[The Challenges](./03%20Challenges.md) diagnosed ten problems one at a time. Underneath all of them is the same missing piece: **every SDLC phase needs the right context, and every phase needs to leave a record the next phase — and the next project — can actually use.** Wire that in at every phase, and the ten challenges stop being ten separate fixes; they're one setup, applied consistently.

This is not a tool. It's a target configuration — which context layer feeds which phase, and what each phase is required to leave behind — that stays true regardless of which AI assistant, IDE, or vendor is running underneath it.

> **The story behind why this matters:** [From Broken Handoffs to Governed AI](./01%20From%20Broken%20Handoffs%20to%20Governed%20AI.md) — the handoff problem, why AI alone doesn't fix it yet, and the human/AI balance this setup is built around. This page is the mechanics that follow from it.

This wiring only holds if [The Mental Model Shift](./04%20The%20Mental%20Model%20Shift.md) has already landed — a phase's "Contributes to" column only becomes trusted context if the human at that gate is actually reviewing it as the deliverable, not rubber-stamping past it to get back to code.

---

## How the Layers Map to Phases

![SDLC Context Flow](/images/context/sdlc-context-flow.svg)

**Business Context** and **Technical Context** are company-level inputs, owned and governed by the organisation — not produced by the project team. Every phase consumes from them; none contributes back.

**Operational Context** (Jira, Confluence) is the live sprint layer. Analysis/Planning creates it; Design refines and enriches it; QA feeds bug reports back into it.

**Project Context** (Repo: HLD, LLD, CLAUDE.md, Engineering Guide) is the layer the harness owns directly. Implementation writes to it. QA and Deployment consume from it. It's the most volatile layer — and the most valuable for AI-assisted development, because it's the one closest to what's actually being built right now.

**Integration Context** captures cross-project contracts and shared event schemas. It sits alongside Project Context and is consumed by Implementation and Design.

---

## Phase × Context Matrix

| Phase                   | Consumes                                | Contributes to                                                                 |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| **Analysis / Planning** | Business Context · Technical Context    | Operational Context — backlog, stories, ACs, cost plan                         |
| **Design**              | Operational Context · Technical Context | Operational Context ↑ — refined tickets, sprints, UI/UX specs                  |
| **Implementation**      | Operational Context · Project Context   | Project Context — code, HLD/LLD updates; Operational Context ↑ — ticket status |
| **Quality Assurance**   | Project Context · Operational Context   | Operational Context ↑ — bug reports, QA sign-off                               |
| **Deploy / Maintain**   | Project Context                         | Running system · Maintenance loop → Jira, `/evolve reflect` → harness          |

Every row is a wiring requirement, not a suggestion — if a phase can't actually reach the context layer it's supposed to consume, or its output doesn't land where the next phase expects it, the loop breaks at that link, and the AI defaults back to generic patterns.

This matrix is the mechanics behind [Humans Gate, AI Carries Context](./01%20From%20Broken%20Handoffs%20to%20Governed%20AI.md#3-humans-gate-ai-carries-context) — each "Contributes to" cell is what a human is gating before it becomes trusted input to the next row.

---

## What This Resolves

An AI assistant operating without this map defaults to generic patterns — it cannot tell what phase it's in, which context layer is authoritative, or what output format is expected. That's the shape of nearly every challenge in [The Challenges](./03%20Challenges.md): Drift, Uneven Depth, Session Amnesia, and No Feedback Loop are all failures of a phase not consuming the right layer, or not contributing back to it.

Fully wired, the map becomes explicit at every phase:

- **At Analysis**: structured requirements land in Jira before Design starts
- **At Design**: `/design` requires Operational Context as input; produces HLD as output before a line of code is written
- **At Implementation**: `/dev` consumes the approved HLD and a scoped ticket; produces code plus an LLD update
- **At QA**: `/dev test` validates against ACs from the Operational layer; closes the loop back to Jira
- **At Deploy/Maintain**: `/where-we-are` and `/war` surface drift; `/evolve reflect` captures lessons back into the harness

Context stays proper, non-contradictory, current, and scoped — not because someone remembers to update it, but because the setup makes it a required output of the phase, not a by-product.

---

## Why This Is a Target, Not a Starting Point

A single project's harness gets that project most of the way there on its own — Project and Operational Context wired, one team's loop closed. What it can't do alone is make Business and Technical Context actually current, or make a pattern discovered in one project reach every other project that could use it. That's [Inconsistent Topology](./03%20Challenges.md) and [The Fragmentation](./03%20Challenges.md) at estate scale — wiring the [Context Topology](./02%20Context%20Landscape.md) itself, team by team, product by product.

Because the wiring is defined by context layer and phase — not by which assistant executes the work — the same setup holds regardless of which AI tool a given team is running today or switches to next. That's what makes it scalable across a product line and an organisation, and not just repeatable inside one project.
