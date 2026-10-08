# Evaluate stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics unit is
`--stage evaluate`. First action, at Step 1: `stage start --stage evaluate`.
Follow the pattern's wait, check, and exit commands for everything after. When
this reference is used only as a correction recipe within another active
stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`.
Evaluate is the judgment phase. It maps requirements against options, surfaces
tradeoffs across all WAF pillars, makes a recommendation with explicit WHY, and
runs a closing WAF assessment of the recommended option. Output:
`design/02 Evaluate.md` + `design/Report.md` WAF section.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`.

## Step 1 — Read inputs

`$DESIGN_DIR` comes from the router's Resume Detection.

Read in full:

- `design/Report.md` — restore Assumptions recorded during Research
- `design/00 Frame.md` — ECs (both known and accepted proposed)
- `design/01 Research.md` — the options

If either Frame or Research is missing, tell the developer which phase to complete first and stop.

**Multi-decision check:** if `design/00 Frame.md`'s Decisions section lists two
or more decisions confirmed at Frame's dedicated decisions sign-off (Step 2),
apply `{{provider:skills_root}}/design/references/00-decision-router.md` for
the loop boundary (Steps 1b–6 loop, Steps 7–9 close once) and
`{{provider:skills_root}}/design/patterns/multi-decision-split.md` for the
file-split policy. Already decided in Frame; do not re-detect or re-ask here.

---

## Step 1b — Resolve viability OQs before the matrix

Read the Open Questions table in `design/01 Research.md`. This is an
intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval condition: no OQ classified **(V) Viability** is still unresolved.

Condition met → continue to Step 2 without asking.

Unresolved `(V)` OQs exist → this is a sign-off gate (`patterns/approval-sign-off.md`):

> "The following viability OQs from Research are still open and would block the matrix if left unresolved: [list]. Can you answer any of these now, or should I mark the affected option as conditional?"

**Stop and wait.** Record resolutions in `design/01 Research.md` before building
the matrix, or mark affected options conditional.

See `{{provider:skills_root}}/design/patterns/design-oq-triage.md` for the full protocol.

---

## Step 2 — Build the Requirements × Options matrix and Tradeoffs table

**Matrix:** Rows = evaluation criteria derived from the requirements and constraints in `design/00 Frame.md` (functional requirements, NFRs, architectural constraints, operational concerns). Columns = every option from `design/01 Research.md`. Cell values: ✅ (yes) · ⚠️ (partially / with caveats) · ❌ (no). Add a brief note in any ⚠️ or ❌ cell.

> **SPIKE tickets** — the requirements listed in the ticket are often meta-level documentary requirements ("assess X", "score against 5 criteria"), not technical evaluation axes. Derive the actual evaluation criteria from the named dimensions (e.g. implementation simplicity, delivery cost, infra running cost, runtime performance, Azure stack alignment) and use those as rows.

**Tradeoffs table:** One row per option. Columns = {{WAF_PILLAR_COLUMNS}}. Plus two extra columns: Integration Complexity and Vendor Lock-in. Each cell: ✅ · ⚠️ · ❌ with a one-line rationale.

---

## Step 2b — Write the draft

The matrix + tradeoffs are already the bulk of the draft content and too large to
review comfortably in the console — that review happens once, in the IDE, at the
end-of-phase sign-off (Step 7), together with the recommendation. Apply the
docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`):
delegate the write of `design/02 Evaluate.md` (matrix + tradeoffs, recommendation
section left as a placeholder, using `{{provider:skills_root}}/design/templates/evaluate.md`)
to `@docs-writer` using the selected delegation procedure. Continue straight to
Step 3 — do not stop here.

---

## Step 3 — Write the Recommendation

State which option is recommended and why — explicitly referencing:

- Which ECs it satisfies best (from the matrix)
- Which tradeoffs are acceptable and why (from the tradeoffs table)
- What the disqualifying factors are for the other options

The recommendation must be falsifiable: if a stated assumption later turns out wrong, the recommendation can be revisited.

Also list the **open questions** that must be resolved before implementation begins — with a suggested owner for each.

---

## Step 4 — Fill the recommendation in 02 Evaluate.md

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`): delegate filling the recommendation placeholder (from Step 3) and the open questions with their owners to `@docs-writer` using the selected delegation procedure. Continue straight to Step 5 — do not stop here.

**Reiterate paths**, for use from Step 7's sign-off if the developer raises a concern:

- Missing option in the matrix → "Reiterate from Research, Step 2 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` with the specific gap."
- Wrong or missing EC → "Reiterate from Frame, Step 1 — re-draft the Success section."
- Tradeoff cell wrong → "Reiterate from Evaluate, Step 2 — rebuild the tradeoffs table with the correction."
- Recommendation needs revisiting after a fix → "Reiterate from Evaluate, Step 4 — restate the recommendation against the updated table."

---

## Step 5 — Run closing WAF assessment

Run a WAF assessment **of the recommended option only** against all {{WAF_FRAMEWORK}} pillars.

**{{WAF_FRAMEWORK}} pillars:**

{{WAF_PILLARS_TABLE}}

Use RAG ratings: 🟢 Green · 🟡 Amber · 🔴 Red.

For each pillar: Strengths · Gaps · Recommendations (P1 / P2 / P3). Any P1 found
is carried into Step 7's sign-off as a named decision — do not stop here to ask
about it.

**Reiterate paths**, for use from Step 7's sign-off if a P1 gap is found that the
current recommendation cannot address:

- Security or reliability gap at architecture level → "Reiterate from Evaluate, Step 4 — revisit the recommendation to address [gap]."
- Gap that requires an option not in the matrix → "Reiterate from Research, Step 2 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` with the specific constraint."

---

## Step 6 — Save both artifacts

**6a — 02 Evaluate.md.** Write the recommendation, open questions, and WAF
findings into the file (matrix/tradeoffs from Step 2b stay as written unless a
reiterate path touches them).

**6b — Add WAF block inside Report.md.** The `## WAF Assessment` section already
exists in `design/Report.md` (pre-created by the template). Append a dated block
**inside** that section — do not add a new `##` heading:

```markdown
### WAF — Evaluate — {YYYY-MM-DD}

_Recommended option: <option name>._

{{WAF_PILLAR_SUMMARY_ROWS}}

**P1 items (resolve before implementation):**

- {list}

Full elaboration: `design/02 Evaluate.md`
```

---

## Step 7 — Sign-off

Apply `patterns/phase-sign-off.md`. Present, in one message: the matrix + tradeoffs
summary, the recommendation and why, open questions with owners, and any WAF P1
items as named decisions. Multi-decision: present every decision's matrix,
recommendation, and WAF result together, per `references/00-decision-router.md`
— still one sign-off, not one per decision.

> "Evaluate drafted at `design/02 Evaluate.md` — recommending <option name>. WAF:
> {RAG summary}, {N} P1 items. Good to go, or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting evaluate sign-off"`.
**Stop and wait.** On approval, record the acceptance check
(`--name "Evaluate sign-off"`, `--source developer`); without it `stage complete`
is refused.

Rework: apply the named reiterate path, present again.

## Step 8 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution 🔄 · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Evaluate | Recommended <option name>; WAF: <summary of RAG ratings>; {N} P1 items |`

Then metrics `report`.

## Step 9 — Commit

Propose:

> `docs({TICKET}): evaluate, recommend <option name>`

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage evaluate`.

🔁 Re-read `{{provider:skills_root}}/design/SKILL.md` and resume the router from the next stage.
