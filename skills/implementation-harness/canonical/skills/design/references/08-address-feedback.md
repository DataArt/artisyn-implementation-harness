# Address Feedback stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics unit is
`--stage address-feedback`. Metrics ownership is conditional: Step 1 first
completes Review Gate (`stage complete --stage review-gate`) now that the
outcome is known, then either starts this stage (`stage start --stage
address-feedback`, when there are concerns) or skips it (`stage skip --stage
address-feedback --reason no_concerns`, when approved outright or declined
outright — neither needs a rework loop). Follow the metrics pattern's wait,
check, and exit commands for everything after Step 1. When this reference is
used only as a correction recipe within another active stage, retain that
stage's metrics ownership.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`. This
stage opens by confirming the review outcome — Review Gate's own concern ends
once the draft MR is parked for approval; deciding what happens next belongs
here. If there are concerns, it loops until the MR is re-approved, or ends
early if the approver declines the design outright. Every outcome still ends
the same way as every other stage: Sign-off → Report → Commit — here the
sign-off is the approval question itself (Step 1 or Step 3), an external fact
rather than an agent decision, but Report (Step 4) and Commit (Step 5) are
routine `patterns/do-report-commit.md` steps like any other stage's.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`.

## Step 1 — Confirm outcome

`$DESIGN_DIR` comes from the router's Resume Detection. Read `design/Report.md` — confirm the `## Gate` section shows an `Approver` and `Draft MR` recorded and `Approved: pending`, and the phase tracker shows `🔎 Review 🔄`. If Review Gate hasn't opened a draft MR yet, tell the developer to run `{{provider:invoke:design}} review-gate {TICKET}` first and stop.

Ask:

> "Has the MR been approved? (**yes** / **concerns** / **declined**)"

This is a sign-off gate (`patterns/approval-sign-off.md`) — the actual MR approval
state is an external fact only the developer can attest to. **Stop and wait.**

- If **yes** → `stage complete --stage review-gate`, record a passed `Design approval` acceptance check with attributed evidence, then `stage skip --stage address-feedback --reason no_concerns --evidence <confirmation>`. Update the `Approved:` field in `design/Report.md`'s `## Gate` section to today's date. Update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback ⏭️ (skipped) · 📤 Publish ⏳ · 🏁 Completion ⏳`. Note the outcome as **approved**, no rework needed — continue to Step 4.
- If **declined** → `stage complete --stage review-gate`, record a failed `Design approval` check with the decline reason as evidence, then `stage skip --stage address-feedback --reason declined_outright`. Ask the developer for the decline reason if not already given. Set the `Approved:` field in `design/Report.md`'s `## Gate` section to `declined`, and fill in the `Decline reason:` field on the line below it. Update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback ❌ (declined) · 📤 Publish ⏭️ (skipped) · 🏁 Completion ⏳`. Note the outcome as **declined** — continue to Step 4.
- If **concerns** → `stage complete --stage review-gate`, record a failed `Design approval` check, then `stage start --stage address-feedback`. Update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback 🔄 · 📤 Publish ⏳ · 🏁 Completion ⏳`. Continue to Step 2 below in this same session.

---

## Step 2 — Identify the concern and suggest a reiterate path

Ask the developer to describe the concern. Identify which phase/step it traces to and suggest a named reiterate path:

| Concern type                 | Reiterate suggestion                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Architectural approach wrong | Reiterate from Solution, Step 2 — rewrite Architecture                        |
| Recommendation wrong         | Reiterate from Evaluate, Step 4 — revisit recommendation                      |
| Missing option               | Reiterate from Research, Step 2 — re-delegate to `{{DESIGN_ARCHITECT_AGENT}}` |
| Scope wrong                  | Reiterate from Frame, Step 1 — re-draft Boundaries                            |

Keep Address Feedback as the metrics owner while using an earlier reference as a correction recipe. Its first attempt records rework; on further rounds, use `stage retry --stage address-feedback --reason review_feedback`.

Confirm the reiterate path with the developer, then follow it — apply the fix in the traced-to stage's reference.

---

## Step 3 — Confirm re-approval

This is Step 1's question again, asked after a rework round instead of the
first time. Once the reiteration is applied and committed, ask:

> "Has this been re-approved on the MR now? (**yes** / **still concerns** / **declined**)"

Before yielding, record an approval wait and run `report`.

This is a sign-off gate (`patterns/approval-sign-off.md`) — the actual MR approval
state is an external fact only the developer can attest to. **Stop and wait.**

- If **still concerns** → resume and record a failed `Design approval` check with a new round ID; return to Step 2 for the new or ongoing concern. Loop until resolved.
- If **yes** → resume and record a passed `Design approval` check with attributed evidence and a new round ID; update the `Approved:` field in `design/Report.md`'s `## Gate` section to today's date. Update phase tracker: `... · 💬 Address Feedback ✅ · 📤 Publish ⏳ · 🏁 Completion ⏳`. Note the outcome as **re-approved** — continue to Step 4.
- If **declined** → the approver is rejecting the design outright, not asking for more rework. Ask the developer for the decline reason if not already given. Record a failed `Design approval` check with that reason as evidence, set the `Approved:` field in `design/Report.md`'s `## Gate` section to `declined`, and fill in the `Decline reason:` field on the line below it. Update phase tracker: `... · 💬 Address Feedback ❌ (declined) · 📤 Publish ⏭️ (skipped) · 🏁 Completion ⏳`. Note the outcome as **declined** — continue to Step 4.

---

## Step 4 — Report

Every outcome above — whether Step 1 resolved it immediately (approved/declined
outright) or Step 3 resolved it after one or more rework rounds (re-approved/
declined) — converges here. `design/Report.md`'s `## Gate` fields and phase
tracker are already updated by whichever branch resolved the outcome. Metrics
`report`.

## Step 5 — Commit

The reiteration fix itself (if any) was already committed by the traced-to
stage's own Commit step in Step 2 — this commit covers only Address Feedback's
own bookkeeping. Propose:

> `docs({TICKET}): record review outcome for <short title>`

covering `design/Report.md` and `stat.json`.

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit
exists and the worktree holds nothing from this phase. If not, say what is
missing and wait again. If this stage was started (the **concerns** path),
`stage complete --stage address-feedback`; if it was skipped (approved or
declined outright at Step 1), it is already closed — no further metrics call.

Tell the developer the next command for the noted outcome:

- **approved** or **re-approved** → "Run `{{provider:invoke:design}} publish {TICKET}` to continue."
- **declined** → "Run `{{provider:invoke:design}} complete {TICKET}` to archive and close it out."

🔁 Re-read `{{provider:skills_root}}/design/SKILL.md` and resume the router from the next stage. For **declined**, that next stage is Completion directly, skipping Publish.
