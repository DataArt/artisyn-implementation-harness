# Solution stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics unit is
`--stage solution`. Follow its initialization/recovery, entry, wait, check, and exit
commands. When this reference is used only as a correction recipe within another
active stage, retain that stage's metrics ownership.

Read `../interfaces/INTENT.md` first. Select only the solution artifact interfaces
that apply to the framed problem, then read each selected interface. Interfaces are
the sole authoring contract; do not copy a fixed solution template. Record selection and omissions
in the design report. Apply Documentation Principles before drafting and recheck
the actual artifacts before review.

Run the intent's preliminary concern scan before artifact selection. Record material,
informational and not-applicable concerns with evidence. Resolve each material
concern through a selected artifact, a confirmed decision, or a link to the owning
HLD/LLD/NFR requirement; an unaddressed material concern keeps Solution incomplete.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`.
Solution is the clean deliverable. `solution/Architecture.md` is its integrated E2E source
of truth and contains the complete chosen approach: no
rationale, no rejected options, no debate. The rationale lives in `design/02 Evaluate.md`.
Output only the selected solution artifacts (for example, `solution/Architecture.md`,
`solution/Design.md`, `solution/Stack.md`, or `solution/Efforts.md`). Do not create an unselected or empty artifact.

> ⚠️ **Certainty principle** — `solution/` files drive doc updates (Publish)
> and implementation (`/dev`). Write only settled decisions and their direct
> consequences. Do not carry over open questions, rejected alternatives, comparative
> arguments, or rationale from `design/02 Evaluate.md`. Those remain in `design/02 Evaluate.md`.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`.

## Step 1 — Read inputs

Find the story folder by globbing `docs/Stories/*{TICKET}*/design/**`.

Read in full:

- `design/00 Frame.md` — ECs and constraints
- `design/02 Evaluate.md` — the recommended option and its open questions
- `design/Report.md` — WAF P1 items that must be reflected in the solution

If `design/02 Evaluate.md` does not exist, tell the developer that Evaluate must be completed first and stop.

---

## Step 1b — Developer specification session

Before writing any files, walk through the following areas with the developer to capture context that may not be in `design/02 Evaluate.md`.

Ask:

> "Before I draft the solution files, I'd like to walk through a few areas to capture anything not in Evaluate. Ready?"

**Stop and wait.**

Run the preliminary concern scan and ask only about material missing decisions,
conflicts or assumptions that cannot be resolved from the frame, research, evaluation
or existing project evidence. Do not use a fixed list of prompts for every problem.
Record the scan and any answers in `design/Report.md`; do not add designer-note,
open-question or concern placeholders to published solution files. Proceed only when
each material concern is selected for an artifact, linked to an owning architecture/
NFR decision, or explicitly resolved as not applicable.

---

## Step 2 — Draft selected solution artifacts

Before drafting, write the selected interface names to `design/Report.md` State and use that
list for every subsequent step. Execute the following steps only for selected
interfaces; skip unselected artifacts and record the omission in the report.

Using the selected `interfaces/architecture.md` contract:

- Start with the end-to-end solution: boundaries, ownership, data/control flows,
  interfaces, deployment and representative normal/failure/recovery paths.
- Add a decision register covering every settled decision from `design/00 Frame.md`,
  `design/02 Evaluate.md`, the developer specification session and WAF/review feedback;
  include each decision's consequence and verification obligation.
- How it plugs into the existing system or engagement context
- How WAF P1 items from `design/Report.md` are addressed

Before moving to the next artifact, compare `solution/Architecture.md` with the decisions
and findings in `design/Report.md`, `design/00 Frame.md` and `design/02 Evaluate.md`. Every material
decision must be represented in Architecture.md; unresolved or rejected material
options remain in Evaluate only.

Apply the docs-writer authoring pattern (`.claude/skills/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Architecture.md` to `@docs-writer` rather than writing it directly.

Apply the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`): say "File saved at `solution/Architecture.md`. Review in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 2b — `{{DESIGN_ARCHITECT_AGENT}}` architecture review (optional gate)

Ask:

> "Would you like me to delegate to `{{DESIGN_ARCHITECT_AGENT}}` for an independent read-only review of `solution/Architecture.md` before I begin `solution/Design.md`?"

**Stop and wait.**

If yes: apply the satellite review pattern (`.claude/skills/design/patterns/satellite-review.md`) — use `.claude/skills/design/patterns/design-architect-review.md` for the prompt template and scope rules specific to Architecture.md.
If no: proceed to Step 3.

---

## Step 3 — Draft Design.md

**Multi-decision check:** if Research/Evaluate were split per `.claude/skills/design/patterns/multi-decision-split.md`, loop this step once per decision, producing `Design - {Decision}.md` for each. (`solution/Architecture.md` in Step 2 stays a single integrated file regardless — one section per decision, not one file per decision.)

Using the selected `interfaces/design.md` contract:

- Module/component design: new or changed modules, their responsibilities, their contracts (interfaces, APIs, events)
- Schema changes (new tables, columns, indexes) if applicable
- Error handling and failure modes
- Configuration and secrets

`solution/Design.md` is a detail companion. Summarize and link every material implementation
decision and its architectural consequence in `solution/Architecture.md` before accepting
this file.

Apply the docs-writer authoring pattern (`.claude/skills/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Design.md` to `@docs-writer` rather than writing it directly.

Apply the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`): say "File saved at `solution/Design.md`. Review in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 4 — Draft Stack.md

Using the selected `interfaces/stack.md` contract:

- One line per concrete technology/library choice: what it is, not why it was chosen over alternatives (that's in `design/02 Evaluate.md`)
- Include versions where they matter

Reflect each technology choice that changes a boundary, contract, operating model or
quality attribute in `solution/Architecture.md`, with its consequence; keep version/detail
inventory here.

Apply the docs-writer authoring pattern (`.claude/skills/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Stack.md` to `@docs-writer` rather than writing it directly.

Apply the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`): say "File saved at `solution/Stack.md`. Review in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 5 — Draft Efforts.md

Using the selected `interfaces/efforts.md` contract:

**WBS (write this):**

- List implementation tickets as measurable, outcome-sized units using the template
  columns: `#`, `Summary`, `Type` (feat/fix/chore/spike), `Layer`, `Depends on`.
  Choose a component, container, FE/BE/Infra slice or another meaningful boundary;
  each unit should fit one focused dev session and include all required changes
  without ceremony overhead. Split or combine units when ownership, sequencing or
  acceptance evidence requires it.
- Sequencing constraints (what must come before what) — include Mermaid diagram
- Any spikes or open questions from `design/02 Evaluate.md` that need a dedicated ticket.
  Resolve simple spikes through the relevant MCP during design when possible; record
  the result and evidence in `design/Report.md` instead of creating a ticket.

**Estimate (delegate to developer — do not self-estimate):**

- Draft the Effort Estimate table with `#`, `Description`, and an empty `Estimate` column

Apply the docs-writer authoring pattern (`.claude/skills/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Efforts.md` (with the empty estimate table) to `@docs-writer` rather than writing it directly.

Apply the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`): say "File saved at `solution/Efforts.md`. Fill in the `Estimate` column in your IDE, then confirm."

**Stop and wait.** When the developer confirms estimates are filled in, read the file, compute the total, update the `**Total**` row, and re-save.

Say: "Total updated. Review `solution/Efforts.md` in your IDE — any corrections?"

**Stop and wait.** Apply corrections and re-save if needed, then proceed.

---

## Step 6 — Add "Considered options" appendix

Append to `solution/Architecture.md`:

```markdown
## Considered Options

A full options analysis is in `design/02 Evaluate.md`. In summary: [one paragraph describing what alternatives were evaluated and why the chosen approach was selected — no detail, just enough context so a reader knows the decision wasn't arbitrary].
```

Then perform a decision-coverage check: reconcile the decision register with every
confirmed decision, WAF finding and review correction recorded in `design/Report.md`. Do not
proceed until `solution/Architecture.md` contains the settled outcome and consequence for
each.

---

## Step 7 — Final review before WAF gate

Say: "The selected solution files are saved. Review the paths listed in `design/Report.md` — any final corrections before I run the design review?"

**Reiterate paths** — if the developer raises a concern before the WAF gate:

- Architecture gap that traces to the recommendation → "Reiterate from Evaluate, Step 4 — revisit the recommendation."
- Missing option → "Reiterate from Research, Step 3 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` with the specific gap."

Apply corrections. Iterate until the content is confirmed.

---

## Step 7b — WAF review gate

Once the solution content is confirmed, apply `.claude/skills/design/patterns/waf-review.md`
with `target: solution` — a full WAF assessment against `solution/Architecture.md`
and `solution/Design.md`.

**If no P1 gaps:** proceed to Step 8.

**If P1 gaps found:** present them and suggest a named reiterate path for each:

| Gap type                                       | Reiterate suggestion                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| Security or reliability gap in Architecture.md | Reiterate from Solution, Step 2 — rewrite Architecture to address [gap]       |
| Implementation gap in Design.md                | Reiterate from Solution, Step 3 — rewrite Design                              |
| Recommendation-level gap (wrong choice)        | Reiterate from Evaluate, Step 4 — revisit the recommendation                  |
| Missing option that would resolve the gap      | Reiterate from Research, Step 3 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` |

**Stop and ask:**

> "WAF review found P1 gaps (listed above). Reiterate from [Phase, Step], or accept and proceed to Publish?"

**Stop and wait.** Only proceed if the developer accepts or after reiteration resolves the gaps.

---

## Step 7c — Design quality gate

Apply `patterns/design-quality-gate.md`. Record the result in `design/Report.md`;
do not enter Review Gate while a required check is failing.

## Step 8 — Do → Report → Commit

Apply the do→report→commit pattern (`.claude/skills/design/patterns/do-report-commit.md`):

**Report** — update `design/Report.md`:

- Phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Solution | Selected artifacts written; WAF review: <pass / N P1 gaps resolved> |`

**Commit** — suggest:

> `docs({TICKET}): solution — architecture, design, stack, efforts`

**Stop and wait** for the developer to confirm the commit.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the router from the next stage.
