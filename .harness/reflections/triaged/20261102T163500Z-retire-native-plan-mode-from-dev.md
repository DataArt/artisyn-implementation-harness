---
status: pending-triage
timestamp: 2026-11-02T16:35:00Z
ticket: DESIGN-20261102-Q5MU
---

## Observation

During `/dev plan` for DESIGN-20261102-Q5MU (Deterministic Docs Knowledge Graph),
the Plan stage completed without ever invoking native Claude Code Plan Mode
(`EnterPlanMode`/`ExitPlanMode`), even though `.claude/skills/dev/references/03-plan.md`
Step 5 references it: "If the host's native planning mode has its own approval step,
that step is this phase's sign-off and nothing else; do not add another stop."

The user asked "why havent we enter native claude plan mode?" The assistant's
in-session reasoning for not using it:

- The skill's own `patterns/phase-sign-off.md` protocol already serves as the
  approval gate, writing a persistent `1-plan.md` and recording an acceptance check
  — independent of any host plan-mode feature.
- Native Plan Mode is a single-shot, read-only-until-approval gate built for
  "think then execute once." `/dev`'s lifecycle has 7 separate stages (Context,
  Ceremony, Plan, Implement, Test, Document, Completion), each ending in its own
  sign-off and its own developer-run commit, persisted to `0-intent.md`/`1-plan.md`/
  `2-report.md` across turns and sessions. One Plan Mode gate doesn't represent
  that repeated stop/commit/continue shape.
- Plan Mode's read-only restriction would have blocked real work needed during the
  "planning" window of this run: writing `0-intent.md`, creating the story folder,
  initializing metrics, delegating to `@architect` for the plan audit (a tool call,
  not a read).

The user's own words, after the explanation: "ok, got it... the reflect that we
might need to retire 'native plan' mode completely from dev flow..." — treating
this as a recurring/structural mismatch worth fixing in the skill, not a one-off
judgment call.

## Impact

The `03-plan.md` Step 5 clause referencing native Plan Mode is currently dead
instruction: it describes a condition ("if native mode has its own approval step")
that structurally cannot apply to this lifecycle's shape, so it never fires as
written and only adds confusion about whether native Plan Mode should be invoked.
A reader of the skill may reasonably expect Plan Mode to be used and wonder why it
isn't, as the user did here.

## Suspected cause (not verified against /design source this session)

The clause was likely written generically (for a single-shot planning task) and
carried into `/dev`'s multi-stage design without re-checking fit. `/design`'s
Solution stage (`.claude/skills/design/references/06-solution.md`) may have the
same or a similar reference — not checked this session.

## Suggested direction (not committed)

- Remove or rewrite the native-Plan-Mode clause in `03-plan.md` Step 5, since the
  skill's own `phase-sign-off.md` protocol is what's actually built for the
  lifecycle's repeated stop/commit/continue shape.
- Check `.claude/skills/design/references/06-solution.md` (and any other stage
  reference files) for the same or a similar dangling reference to native planning
  mode, and apply the same fix if found.
