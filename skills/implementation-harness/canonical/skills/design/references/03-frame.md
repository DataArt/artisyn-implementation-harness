# Frame stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics
unit is `--stage frame`. First action: `stage start --stage frame`.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`.
`$DESIGN_DIR` comes from the router's Resume Detection. Frame frames the
problem, frames the requirements (evaluation criteria for Evaluate), and frames
the boundaries before any research begins — using the context Context Gathering
already resolved and recorded in `design/Report.md`'s `## Context` section.
Output: `design/00 Frame.md`.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`.

## Step 1 — Write 00 Frame.md

Using `{{provider:skills_root}}/design/templates/frame.md`, write `design/00 Frame.md`. Pull context from `design/Report.md`'s `## Context` and `## Evidence` sections — the tracker fetch supplies the Known ECs and background; the resolved design context supplies constraints and precedent.

**Problem** — one paragraph from the ticket description (or `{{provider:input}}`): what is broken or missing, and why it matters now.

**Success** — two sub-sections:

- _Known ECs_ — acceptance criteria and requirements stated in the ticket (verbatim, cleaned up)
- _Proposed ECs_ — requirements the developer didn't think of. Look for gaps: missing edge cases, non-functional requirements (performance, security, GDPR), operational concerns (observability, rollback), and future-proofing constraints implied by the architecture or engagement context. Propose 2–4 additions. Label each `[proposed]` so the developer can accept or reject.

These evaluation criteria become the Requirements × Options matrix rows during Evaluate.

**Boundaries**

- _In scope_ — what this design covers
- _Out of scope_ — what is explicitly excluded (derive from ticket; add obvious exclusions if missing)

**Constraints** — known deadlines, linked tickets, regulatory requirements, product or architectural constraints that directly bound this decision.

**Sizing** _(optional — include only when the ticket warrants capacity planning)_

- Expected users / MAU
- Request volume
- Data volume
- Relevant NFR targets (from the resolved design context or stakeholder requirements)

**Links**

- Ticket: `{{PROJECT_KEY}}-{number}`
- Related tickets: `<any linked {{PROJECT_KEY}} tickets if any>`
- Reference docs: `<any {{DESIGN_DOCS_ROOT}} docs referenced>`

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`): delegate the write of `design/00 Frame.md` to `@docs-writer` using the selected delegation procedure — Decisions is drafted next, in Step 2, not here.

Apply the write-confirm pattern (`{{provider:skills_root}}/design/patterns/write-confirm.md`): say "File saved at `design/00 Frame.md`." Continue straight to Step 2 — do not stop here.

---

## Step 2 — Identify decisions

Check the Problem and Success criteria against
`{{provider:skills_root}}/design/patterns/multi-decision-split.md`: does this
bundle two or more choices that could each stand alone — its own option set,
its own tradeoffs, approvable or reiterable independently of the others?

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval condition: at most one decision found — nothing to bundle, so
there is nothing to confirm, and nothing to write.

Condition met → continue straight to Step 3's sign-off. No `## Decisions`
section is added.

Two or more decisions found → draft the candidate list (each with why it's
independent) and apply the docs-writer authoring pattern
(`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`):
delegate adding the `## Decisions` section to `design/00 Frame.md` to
`@docs-writer`. Then this is a sign-off gate (`patterns/approval-sign-off.md`),
on its own — this is a material structural choice, not a content detail,
since it decides how many times Research through Solution loop:

> "This looks like it bundles {K} independent decisions: {list, each with why it's independent}. Each would get its own Research → Evaluate → Solution loop — confirm the breakdown, merge any, or say it's really one decision."

`wait start --reason approval --detail "Awaiting decisions sign-off"`. **Stop
and wait.** On the reply, delegate any correction to `@docs-writer` the same
way, then record the acceptance check (`--name "Frame decisions sign-off"`,
`--source developer`).

---

## Step 3 — Sign-off

Apply `patterns/phase-sign-off.md`. Show `design/00 Frame.md` in full if short, or
a summary: Problem, known vs. proposed ECs (with the `[proposed]` ones
called out), Decisions (if Step 2 drafted and already confirmed one), Boundaries, Constraints.

> "Frame drafted at `design/00 Frame.md` — {N} known requirements, {M} proposed.
> Good to go, or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting frame sign-off"`.
**Stop and wait.** On approval, record the acceptance check
(`--name "Frame sign-off"`, `--source developer`); without it `stage complete` is
refused.

Rework — apply the named path, present again:

- Source data or problem framing wrong → "Reiterate from Step 1 — re-draft the Problem and Boundaries sections."
- Decision breakdown wrong → "Reiterate from Step 2 — re-check the Problem/Success criteria and redraft Decisions."
- Target subfolder or design context wrong → "Reiterate from Context Gathering, Step 3 — re-resolve context and re-prime."

`design/00 Frame.md` is the single source of ticket context for all subsequent phases. It is not modified again unless the developer explicitly requests a correction.

## Step 4 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research 🔄 · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Frame | {N} known requirements, {M} proposed requirements accepted |`

Then metrics `report`.

## Step 5 — Commit

Propose:

> `docs({TICKET}): frame <short title>`

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage frame`.

🔁 Re-read `{{provider:skills_root}}/design/SKILL.md` and resume the router from the next stage.
