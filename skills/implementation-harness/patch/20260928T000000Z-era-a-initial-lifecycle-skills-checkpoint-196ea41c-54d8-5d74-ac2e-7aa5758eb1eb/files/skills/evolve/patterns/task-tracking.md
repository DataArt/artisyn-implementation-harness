# Native task tracking

Inspect exposed tools first; a failed tool search alone does not prove tasks absent.
For an explicitly requested full candidate lifecycle create/reuse four stage tasks (Reflect, Triage, Validate, Adopt), with applicable stages
ordered by dependencies. Reflect-only and direct-stage runs track just their scope.

Mark a task active on entry and complete only after checking stage evidence. Native
tasks may lack blocked/skipped states: retain blockers as in_progress with a note,
and record not-applicable stages explicitly in Report.md without fabricating work.
Use TodoWrite if available, otherwise the durable report. Record the active tracker.
Within the current invocation reuse existing tasks for the same candidate; do not
automatically continue work from a previous session.
Report.md is authoritative across sessions; do not create duplicate candidate chains.
