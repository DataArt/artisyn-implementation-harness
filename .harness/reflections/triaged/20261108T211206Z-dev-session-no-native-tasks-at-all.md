---
status: pending-triage
timestamp: 2026-11-08T21:12:06Z
ticket: DEV-20261108-K7XQ
---

## Observation

Across the entire `/dev` lifecycle for DEV-20261108-K7XQ (Context through Completion,
7 stages, 4 implementation steps), `TaskCreate`/`TaskUpdate`/`TaskList` were never
called once. All progress tracking ran exclusively through `2-report.md`'s Progress
table and `stat.json` metrics. This is a stronger case than the related prior
reflection (`20261103T170853Z-dev-completion-native-task-not-closed.md`, where native
tasks were used but one was left open at Completion) — here they were never created
at all.

The user's own words, prompting this reflection: "for some reason in this session
you havent launched claude-native tasks tracker... maybe someuncertancy in the
instruction."

## Impact

`.claude/skills/dev/patterns/task-tracking.md` and its installed procedure
`.claude/skills/dev/runtime/task-tracking.md` both instruct using `TaskCreate` for
one task per stage (and per Implement step), mirroring every transition. None of
that happened. The user — and anyone else watching the native task UI during this
session — had zero visibility into ticket progress through that channel; the only
source of truth was `2-report.md`, which required actively reading the file rather
than glancing at the task list.

## Suspected cause

`.claude/skills/dev/SKILL.md`'s "Stage tasks" section says: "Apply
`.claude/skills/dev/patterns/task-tracking.md` ... A system reminder about native
progress tools is the cue to do it now." This session _did_ receive multiple
system-reminders of exactly that shape — "The task tools haven't been used
recently... consider using TaskCreate and TaskUpdate" — appearing at several points
across Implement, Test, and Document stages. None were acted on. This looks like an
assistant execution gap (the reminders were treated as generic background noise
rather than the explicit "cue" the router names them as), not clearly a gap in the
instruction's wording — though "the cue to do it now" being an implicit trigger
embedded in prose, rather than an explicit numbered step like Context Gathering's
Step 2b, may make it easier to miss than other mandatory sub-steps.

## Suggested direction (not committed)

- Consider promoting "apply task-tracking.md" from a reminder-triggered aside in
  SKILL.md's Stage tasks section to an explicit, numbered first action in each
  stage reference file (the same treatment `stage start`/metrics calls already get),
  so it's structurally impossible to skip rather than dependent on noticing a
  system-reminder.
- Cross-check against the existing related reflection
  (`20261103T170853Z-dev-completion-native-task-not-closed.md`) during triage —
  both point at the same underlying fragility (native task mirroring is easy to
  drop), just at different points in the lifecycle.
