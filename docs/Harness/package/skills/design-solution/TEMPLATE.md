---
name: design-solution
metadata:
  version: 1.0.0
description: Solution phase of the design lifecycle (/design-solution or /design orchestrator). Produces solution/ with Architecture.md, Design.md, Stack.md, Efforts.md.
---

The developer wants to run the Solution phase of a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.

Solution is Phase 4 — the clean deliverable. It contains only the chosen approach: no rationale, no rejected options, no debate. The rationale lives in `02 Elaborate.md`. Output: `solution/Architecture.md`, `solution/Design.md`, `solution/Stack.md`, `solution/Efforts.md`.

> ⚠️ **Certainty principle** — `solution/` files drive doc updates (Publish) and implementation (`/dev`). Write only settled decisions and their direct consequences. Do not carry over open questions, rejected alternatives, comparative arguments, or rationale from `02 Elaborate.md`. Those live in `design/`.

---

## Step 1 — Read inputs

Find the design folder by globbing `docs/Stories/*{TICKET}*/**`.

Read in full:

- `design/00 Frame.md` — ACs and constraints
- `design/02 Elaborate.md` — the recommended option and its open questions
- `design/Report.md` — WAF P1 items that must be reflected in the solution

If `02 Elaborate.md` does not exist, tell the developer that Elaborate must be completed first and stop.

---

## Step 1b — Developer specification session

Before writing any files, walk through the following areas with the developer to capture context that may not be in `02 Elaborate.md`.

Ask:

> "Before I draft the solution files, I'd like to walk through a few areas to capture anything not in Elaborate. Ready?"

**Stop and wait.**

For each area: ask an open question, fill from discussion, ask "Anything else here?" before moving on. Skip areas where the developer has nothing to add.

- **Integration** — what systems, APIs, events, or data stores does this touch? Any quirks in existing integrations not captured in the context docs?
- **Security** — any specific credentials, secrets strategy, or security constraints beyond the WAF assessment?
- **Environment & Deployment** — region constraints, environment-specific config, deployment sequence concerns?
- **Designer Notes** — edge cases, known risks, open questions, anything that doesn't fit above?

If the developer has nothing to add to any area, proceed directly to Step 2.

Record any material additions as notes at the top of the relevant `solution/` file as you write it.

---

## Step 2 — Draft solution/Architecture.md

Using `.claude/skills/design/solution-architecture-template.md`:

- Chosen architecture: components, data flows, integration points, sequence diagrams where helpful
- How it plugs into the existing system or engagement context
- How WAF P1 items from `Report.md` are addressed

Write `solution/Architecture.md` to disk.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "File saved at `solution/Architecture.md`. Review in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 2b — `{{DESIGN_ARCHITECT_AGENT}}` architecture review (optional gate)

Ask:

> "Would you like me to delegate to `{{DESIGN_ARCHITECT_AGENT}}` for an independent read-only review of `Architecture.md` before I begin `Design.md`?"

**Stop and wait.**

If yes: apply the satellite review pattern (`.claude/skills/design/pattern-satellite-review.md`) — use `.claude/skills/design/pattern-design-architect-review.md` for the prompt template and scope rules specific to Architecture.md.
If no: proceed to Step 3.

---

## Step 3 — Draft solution/Design.md

**Multi-decision check:** if Research/Elaborate were split per `.claude/skills/design/pattern-multi-decision-split.md`, loop this step once per decision, producing `solution/Design - {Decision}.md` for each. (`Architecture.md` in Step 2 stays a single integrated file regardless — one section per decision, not one file per decision.)

Using `.claude/skills/design/solution-design-template.md`:

- Module/component design: new or changed modules, their responsibilities, their contracts (interfaces, APIs, events)
- Schema changes (new tables, columns, indexes) if applicable
- Error handling and failure modes
- Configuration and secrets

Write `solution/Design.md` to disk.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "File saved at `solution/Design.md`. Review in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 4 — Draft solution/Stack.md

Using `.claude/skills/design/solution-stack-template.md`:

- One line per concrete technology/library choice: what it is, not why it was chosen over alternatives (that's in `02 Elaborate.md`)
- Include versions where they matter

Write `solution/Stack.md` to disk.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "File saved at `solution/Stack.md`. Review in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 5 — Draft solution/Efforts.md

Using `.claude/skills/design/solution-efforts-template.md`:

**WBS (write this):**

- List of implementation tickets using the template columns: `#`, `Summary`, `Type` (feat/fix/chore/spike), `Layer`, `Depends on`
- Sequencing constraints (what must come before what) — include Mermaid diagram
- Any spikes or open questions from `02 Elaborate.md` that need a dedicated ticket

**Estimate (delegate to developer — do not self-estimate):**

- Draft the Effort Estimate table with `#`, `Description`, and an empty `Estimate` column

Write `solution/Efforts.md` to disk with the empty estimate table.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "File saved at `solution/Efforts.md`. Fill in the `Estimate` column in your IDE, then confirm."

**Stop and wait.** When the developer confirms estimates are filled in, read the file, compute the total, update the `**Total**` row, and re-save.

Say: "Total updated. Review `solution/Efforts.md` in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 6 — Add "Considered options" appendix

Append to `solution/Architecture.md`:

```markdown
## Considered Options

A full options analysis is in `design/02 Elaborate.md`. In summary: [one paragraph describing what alternatives were evaluated and why the chosen approach was selected — no detail, just enough context so a reader knows the decision wasn't arbitrary].
```

---

## Step 7 — Final review before WAF gate

Say: "All four solution files are saved. Review `solution/Architecture.md`, `Design.md`, `Stack.md`, and `Efforts.md` in your IDE — any final corrections before I run the design review?"

**Reiterate paths** — if the developer raises a concern before the WAF gate:

- Architecture gap that traces to the recommendation → "Reiterate from Elaborate, Step 4 — revisit the recommendation."
- Missing option → "Reiterate from Research, Step 3 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` with the specific gap."

Apply corrections. Iterate until the content is confirmed.

---

## Step 7b — Design review gate

Once the solution content is confirmed, run `/design-review {TICKET} solution` — a full WAF assessment against `solution/Architecture.md` and `solution/Design.md`.

**If no P1 gaps:** proceed to Step 8.

**If P1 gaps found:** present them and suggest a named reiterate path for each:

| Gap type                                       | Reiterate suggestion                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| Security or reliability gap in Architecture.md | Reiterate from Solution, Step 2 — rewrite Architecture to address [gap]       |
| Implementation gap in Design.md                | Reiterate from Solution, Step 3 — rewrite Design                              |
| Recommendation-level gap (wrong choice)        | Reiterate from Elaborate, Step 4 — revisit the recommendation                 |
| Missing option that would resolve the gap      | Reiterate from Research, Step 3 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` |

**Stop and ask:**

> "Design review found P1 gaps (listed above). Reiterate from [Phase, Step], or accept and proceed to Publish?"

**Stop and wait.** Only proceed if the developer accepts or after reiteration resolves the gaps.

---

## Step 8 — Do → Report → Commit

Apply the do→report→commit pattern (`.claude/skills/design/pattern-do-report-commit.md`):

**Report** — update `design/Report.md`:

- Phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Elaborate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Solution | 4 solution files written; design review: <pass / N P1 gaps resolved> |`

**Commit** — suggest:

> `docs({TICKET}): solution — architecture, design, stack, efforts`

**Stop and wait** for the developer to confirm the commit.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.
