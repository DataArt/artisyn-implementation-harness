---
status: pending-triage
timestamp: 2026-11-03T17:08:53Z
ticket: DESIGN-20261103-LBBI
---

## Observation

The `/dev` Completion stage finished genuinely — the story was archived, `2-report.md`'s phase banner showed `🏁 Completion ✅`, the close-out commit landed, and I reported the ticket complete. Despite that, the native Claude Code task tracker still showed the Completion-stage task (#17) as `in_progress`. The user caught it directly: "not now, why tasks still open? reflect this." The fix was a single `TaskUpdate({taskId: "17", status: "completed"})` call after the fact.

## Impact

Anyone relying on the native task tracker as a status signal — the user mid-session, or a future session resuming this ticket — would see an open task for a stage that had already shipped, archived, and been reported done. This erodes trust in the tracker as a source of truth and could cause a future resume flow to misjudge where the ticket actually stands.

## Suspected cause (not verified against /dev source this session)

`references/07-completion.md` and the router's Phase 7 section describe archiving, metrics finalization, the tracker/PR handover, and the final sign-off message, but neither explicitly calls out a last step to mirror the phase-banner's final state into the native tracker via `TaskUpdate`. `patterns/task-tracking.md` states the general rule ("mark a stage `completed` only when the phase banner shows it done"), but nothing in the Completion stage's own procedure triggers that call at the very end — unlike earlier stages, where the phase sign-off and the next stage's entry made the mirror step easy to remember by habit. Completion has no "next stage" to prompt it.

## Suggested direction (not committed)

Add an explicit final step to `references/07-completion.md` (or to the shared `patterns/task-tracking.md`, since this is a generic "last stage has no natural next-stage trigger" problem) instructing the stage to call `TaskUpdate` to close the stage's own task immediately after the phase banner is set to done, before the "ticket is complete" message is given. Worth checking whether `/design`'s Completion stage (`references/10-completion.md`) has the identical gap, since it has the same structural shape — last phase, no next phase to carry the reminder.
