---
status: pending-triage
timestamp: 2026-11-02T08:55:19Z
ticket: DESIGN-20261102-Q5MU
---

## Observation

In a `/design` run (DESIGN-20261102-Q5MU, Product-track knowledge-graph design), the
router's mandatory "Stage tasks" step — apply `patterns/task-tracking.md`, create one
task per lifecycle stage via `TaskCreate` before Phase 1 starts — was not applied at
entry. Context Gathering ran to completion (sign-off given, commit proposed) with no
task tracker in place. The user noticed and asked "why don't we enable steps tracker?",
at which point the tracker was created retroactively (10 tasks, one per stage, chained
with blockedBy) and backfilled to mark Context Gathering already-completed.

The user's own words: "why dont we enable steps tracker?" and, when asked to capture
this for later: "this happening so frequently do we have an error in the 'design'
skill? lets reflect it to fix later" — reporting this as a recurring pattern, not a
one-off.

## Impact

Task-tracking state does not reflect the real lifecycle until a user manually flags
the gap, defeating the tracker's purpose (giving the user visibility into progress
without having to ask). Backfilling after the fact works but relies on the user
catching the omission every time.

## Suspected cause (uncertain — not verified against skill source this session)

`.claude/skills/design/SKILL.md`'s "Stage tasks" section is written as a mandatory
action but placed after the Router/Resume-Detection sections, worded as a rule to
apply "once, every entry" rather than as a concrete first step with its own
checkpoint. There is no gate (e.g., a self-check or sign-off) that blocks Phase 1
work from proceeding until the tracker exists, unlike the hard stops the lifecycle
uses elsewhere (phase sign-off, commit confirmation).

## Suggested direction (not committed)

Consider making tracker creation the literal first action inside Resume Detection
(before Step 1), or adding an explicit self-check gate that verifies a tracker exists
before Context Gathering's Step 1 begins — something that forces the omission to
surface immediately rather than requiring the user to ask.
