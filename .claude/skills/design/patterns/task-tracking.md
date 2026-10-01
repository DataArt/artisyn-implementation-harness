# Task tracking

Track the work units supplied by the caller, their dependency order, status and
completion evidence. Use the installed procedure at
`.claude/skills/design/runtime/task-tracking.md` for the live tracking mechanism.
Record the selected mechanism once in design/Report.md.

design/Report.md is authoritative across sessions and providers. Mark a unit in progress
before starting, and complete only after inspecting its required evidence. A worker
self-report is not completion. Record failures and leave dependent work pending.
On resume, verify artifacts, reopen invalidated units, and reconcile/recreate native
tracking without duplicating this run's existing tasks. Native task IDs are session
metadata, never the durable identity of a workflow stage.
