# Solution stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics unit is
`--stage solution`. First action, at Step 1: `stage start --stage solution`.
Follow the pattern's wait, check, and exit commands for everything after. When
this reference is used only as a correction recipe within another active
stage, retain that stage's metrics ownership.

Read `../interfaces/contract.md` first. Select only the solution artifact interfaces
that apply to the framed problem, then read each selected interface. Interfaces are
the sole authoring contract; do not copy a fixed solution template. Record selection and omissions
in the design report. Apply Documentation Principles before drafting and recheck
the actual artifacts before review.

Run the intent's preliminary concern scan before artifact selection. Record material,
informational and not-applicable concerns with evidence. Resolve each material
concern through a selected artifact, a confirmed decision, or a link to the owning
HLD/LLD/NFR requirement; an unaddressed material concern keeps Solution incomplete.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`.
Solution is the clean deliverable. `solution/Architecture.md` is its integrated E2E source
of truth and contains the complete chosen approach: no
rationale, no rejected options, no debate. The rationale lives in `design/02 Evaluate.md`.
Output only the selected solution artifacts (for example, `solution/Architecture.md`,
`solution/Design.md`, `solution/Stack.md`, or `solution/Efforts.md`). Do not create an unselected or empty artifact.

> ⚠️ **Certainty principle** — `solution/` files drive doc updates (Publish)
> and implementation (`{{provider:invoke:dev}}`). Write only settled decisions and their direct
> consequences. Do not carry over open questions, rejected alternatives, comparative
> arguments, or rationale from `design/02 Evaluate.md`. Those remain in `design/02 Evaluate.md`.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`.

## Step 1 — Read inputs

`$DESIGN_DIR` comes from the router's Resume Detection.

Read in full:

- `design/00 Frame.md` — ECs and constraints
- `design/02 Evaluate.md` — the recommended option and its open questions
- `design/Report.md` — WAF P1 items that must be reflected in the solution

If `design/02 Evaluate.md` does not exist, tell the developer that Evaluate must be completed first and stop.

---

## Step 1b — Developer specification session

Run the preliminary concern scan before writing any files: look for material
missing decisions, conflicts or assumptions that cannot be resolved from the
frame, research, evaluation or existing project evidence. Do not use a fixed
list of prompts for every problem.

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval condition: the scan finds nothing material — every concern
resolves from existing evidence.

Condition met → note in one line what was checked and continue to Step 2
without asking.

A material concern exists → this is a sign-off gate
(`patterns/approval-sign-off.md`): ask directly about the specific concern(s)
found, not a generic "ready to begin?" preamble. **Stop and wait.** Record the
scan and the answers in `design/Report.md`; do not add designer-note,
open-question or concern placeholders to published solution files. Proceed only
when each material concern is selected for an artifact, linked to an owning
architecture/NFR decision, or explicitly resolved as not applicable.

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

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Architecture.md` to `@docs-writer` using the selected delegation procedure. The review happens once, at the end-of-phase sign-off (Step 8), together with every other artifact — continue straight to Step 2b.

---

## Step 2b — `{{DESIGN_ARCHITECT_AGENT}}` architecture review

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-trigger condition: `solution/Architecture.md` introduces or changes a
container boundary, cross-layer contract, infrastructure/IAM resource, or data
flow between containers — the same class of change dev's Plan-stage audit
triggers on.

Condition met → apply the satellite review pattern
(`{{provider:skills_root}}/design/patterns/satellite-review.md`) — use
`{{provider:skills_root}}/design/patterns/design-architect-review.md` for the
prompt template and scope rules — without asking permission first. A mechanical
finding (no scope change) is auto-applied and noted; anything else is carried
into Step 8's sign-off as a named decision, never a separate stop.

Condition not met → note in one line why it was skipped (no boundary/contract
change) and continue to Step 3.

---

## Step 3 — Draft Design.md

**Multi-decision check:** if Research/Evaluate were split per
`{{provider:skills_root}}/design/references/00-decision-router.md` (Step 3
loops, Steps 8–10 close once), this step loops once per decision, producing
`Design - {Decision}.md` for each. See
`{{provider:skills_root}}/design/patterns/multi-decision-split.md` for the
file-split policy. (`solution/Architecture.md` in Step 2 stays a single
integrated file regardless — one section per decision, not one file per
decision.)

Using the selected `interfaces/design.md` contract:

- Module/component design: new or changed modules, their responsibilities, their contracts (interfaces, APIs, events)
- Schema changes (new tables, columns, indexes) if applicable
- Error handling and failure modes
- Configuration and secrets

`solution/Design.md` is a detail companion. Summarize and link every material implementation
decision and its architectural consequence in `solution/Architecture.md` before accepting
this file.

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Design.md` to `@docs-writer` using the selected delegation procedure. Continue straight to Step 4 — review happens once, at Step 8.

---

## Step 4 — Draft Stack.md

Using the selected `interfaces/stack.md` contract:

- One line per concrete technology/library choice: what it is, not why it was chosen over alternatives (that's in `design/02 Evaluate.md`)
- Include versions where they matter

Reflect each technology choice that changes a boundary, contract, operating model or
quality attribute in `solution/Architecture.md`, with its consequence; keep version/detail
inventory here.

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Stack.md` to `@docs-writer` using the selected delegation procedure. Continue straight to Step 5 — review happens once, at Step 8.

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

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`): delegate the write of `solution/Efforts.md` (with the empty estimate table) to `@docs-writer` using the selected delegation procedure. The estimate column is the one thing only the developer can fill in — ask for it once, folded into Step 8's sign-off, not as its own stop. Continue straight to Step 6.

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

## Step 7 — WAF review gate and quality gate

Apply `{{provider:skills_root}}/design/patterns/waf-review.md` with
`target: solution` — a full WAF assessment against `solution/Architecture.md`
and `solution/Design.md`. Then apply `patterns/design-quality-gate.md`. Record
both results in `design/Report.md`.

Do not stop here. A P1 gap or a failing quality check is carried into Step 8's
sign-off as a named decision, with a reiterate suggestion:

| Gap type                                       | Reiterate suggestion                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| Security or reliability gap in Architecture.md | Reiterate from Solution, Step 2 — rewrite Architecture to address [gap]       |
| Implementation gap in Design.md                | Reiterate from Solution, Step 3 — rewrite Design                              |
| Recommendation-level gap (wrong choice)        | Reiterate from Evaluate, Step 4 — revisit the recommendation                  |
| Missing option that would resolve the gap      | Reiterate from Research, Step 2 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` |

A clean pass on both → note it in one line and continue to Step 8.

## Step 8 — Sign-off

Apply `patterns/phase-sign-off.md`. This is the one stop for the whole phase —
drafts review, estimates, and every carried decision together. Multi-decision:
include every decision's `Design - {Decision}.md` in the drafts list, per
`references/00-decision-router.md` — still one sign-off, not one per decision.

> "Solution drafted: {list of selected artifacts, e.g. `solution/Architecture.md`,
> `solution/Design.md`, `solution/Stack.md`, `solution/Efforts.md`}. Review in
> your IDE and fill in the `Estimate` column in `Efforts.md`. Architect review:
> {ran, auto-applied N findings / skipped, no boundary change}. WAF: {RAG
> summary, N P1 items}. Quality gate: {pass / fail}. Good to go, or what should
> change?"

`report`, then `wait start --reason approval --detail "Awaiting solution sign-off"`.
**Stop and wait.** When the reply confirms, read `solution/Efforts.md`, compute
the `**Total**` row from the filled-in estimates, and re-save before recording
the acceptance check (`--name "Solution sign-off"`, `--source developer`);
without it `stage complete` is refused.

Rework: apply the named reiterate path (from Step 2b, Step 7, or the developer's
own correction), present again. If only the estimate numbers were missing and
everything else was approved, do not re-ask the whole message — just confirm
the total and continue.

## Step 9 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Solution | Selected artifacts written; WAF review: <pass / N P1 gaps resolved> |`

Then metrics `report`.

## Step 10 — Commit

Propose:

> `docs({TICKET}): solution, architecture, design, stack, efforts`

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage solution`.

🔁 Re-read `{{provider:skills_root}}/design/SKILL.md` and resume the router from the next stage.
