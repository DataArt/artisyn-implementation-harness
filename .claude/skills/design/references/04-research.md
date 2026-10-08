# Research stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics unit is
`--stage research`. First action, at Step 1: `stage start --stage research`.
Follow the pattern's wait, check, and exit commands for everything after. When
this reference is used only as a correction recipe within another active
stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`. It
produces a neutral, exhaustive options list — 3 to 5 alternatives with industry
references. **No recommendation is made here.** Judgment lives in Evaluate. Output:
`design/01 Research.md`.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`.

## Step 1 — Read Frame and Evidence

`$DESIGN_DIR` comes from the router's Resume Detection.

Read:

- `design/00 Frame.md` — the authoritative problem statement and requirements
- `design/Report.md` — session context, including the `## Context` (subfolder,
  track) and `## Evidence` table (every context source Context Gathering
  already read) — reuse this, do not re-read the source docs yourself; context
  reading happens once, in Context Gathering

If `design/00 Frame.md` does not exist, tell the developer that Frame must be completed first and stop.

**Multi-decision check:** if `design/00 Frame.md`'s Decisions section lists two
or more decisions confirmed at Frame's dedicated decisions sign-off (Step 2),
apply `.claude/skills/design/references/00-decision-router.md` for
the loop boundary (Steps 2–3 loop, Steps 4–6 close once) and
`.claude/skills/design/patterns/multi-decision-split.md` for the
file-split policy. This was already decided in Frame; do not re-detect or
re-ask here.

---

## Step 2 — Delegate to `{resolved architect agent}` for options research

Delegate to `{resolved architect agent}` with **explicit constraints**:

- Read relevant context docs under `{source docs}`
- Produce **3 to 5 distinct options** — include at least one "do nothing / minimal change" option if valid, and at least one industry-standard approach
- For each option: description, pros, cons, unknowns/risks, at least one industry reference or precedent, and a **colored Mermaid diagram** illustrating the approach (use `classDef` with fill/stroke/color — no default-grey diagrams)
- **Do not make a recommendation** — that is Evaluate's job
- Surface open questions that would block evaluation if left unanswered
- **Do not write or edit any files — return output only**

Once `{resolved architect agent}` returns, present the options output directly in the console and continue to Step 2b — the developer confirms both the option set and the OQ classification together in Step 4's sign-off, not here.

**Reiterate paths**, for use from Step 4's sign-off if the developer raises a concern:

- Option set incomplete → "Reiterate from Research, Step 2 — re-delegate to `{resolved architect agent}` with the specific gap: [gap]."
- Requirements scope has changed (new constraint discovered during research) → "Reiterate from Frame, Step 1 — re-draft the Problem/Boundaries/Proposed requirements to capture the new constraint."

---

## Step 2b — OQ triage

Propose a classification for every open question `{resolved architect agent}` surfaced — **(V) Viability** — would the answer disqualify one or more options — or **(E) Evaluation-input** — affects cost/detail but not which options survive. See `.claude/skills/design/patterns/design-oq-triage.md` for the full two-tier protocol and resolution rules. State your proposed V/E for each with a one-line reason; the developer confirms or corrects it in Step 4's sign-off, not in a separate round.

**Persist the result as Assumptions.** Once triage completes, the answered/classified OQs are a design artifact — not ephemeral conversation. Fill in the **existing** `## Assumptions` section in `design/Report.md` (pre-created by the report template — do not add a new `##` heading). Record the full OQ table (question, V/E, answer/status). Without this, Evaluate starts with no written record of what was already decided.

```markdown
_From Research OQ triage ({YYYY-MM-DD})._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |
| 1   | {question}    | (V) | {answer}        |
```

---

## Step 3 — Save 01 Research.md

Apply the docs-writer authoring pattern (`.claude/skills/design/patterns/docs-writer-authoring.md`): delegate the write of `design/01 Research.md` (using `.claude/skills/design/templates/research.md`, populated with the options from Step 2 and the proposed OQ classifications from Step 2b — including every option's Mermaid diagram from `{resolved architect agent}`'s output) to `@docs-writer` using the selected delegation procedure.

Apply the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`): say "File saved at `design/01 Research.md`."

## Step 4 — Sign-off

Apply `patterns/phase-sign-off.md`. Present, in one message: the option set (names
and one line each), the proposed OQ classifications with reasons, and the path to
`design/01 Research.md`. Multi-decision: present every decision's option set and
OQs together, one `design/01 Research - {Decision}.md` path each, per
`references/00-decision-router.md` — still one sign-off, not one per decision.

> "Research drafted at `design/01 Research.md` — {N} options, {M} OQs proposed as
> {X} Viability / {Y} Evaluation-input. Good to go, or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting research sign-off"`.
**Stop and wait.** On approval, record the acceptance check
(`--name "Research sign-off"`, `--source developer`); without it `stage complete`
is refused. On approval, persist the confirmed OQ classification into the
**existing** `## Assumptions` section in `design/Report.md` (pre-created by the
report template — do not add a new `##` heading):

```markdown
_From Research OQ triage ({YYYY-MM-DD})._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |
| 1   | {question}    | (V) | {answer}        |
```

Rework: apply the Step 2 reiterate path, present again.

## Step 5 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate 🔄 · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Research | {resolved architect agent} returned {N} options (<option names>); developer confirmed set complete |`

Then metrics `report`.

## Step 6 — Commit

Propose:

> `docs({TICKET}): research, {N} options evaluated`

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage research`.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the router from the next stage.
