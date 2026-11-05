# Launch guide

Run `/harness-bootstrap launch` to install or adopt the harness. This file owns the
stage sequence and tracking contract; each stage's procedure lives in its own
reference, loaded when that stage starts. Routing lives in [SKILL.md](../../SKILL.md);
manifests and baselines follow [Patch State](../patch/06-patch-state.md).

**Path convention:** `package:` means the actual bootstrap directory under the
project root (record its path once; it need not match a selected provider); `project:` means the project root. These prefixes explain paths and are
not literal JSON values. Canonical `package:canonical/skills/`,
`package:canonical/agents/`, and `package:canonical/docs/` stay unchanged — `canonical/`
is the package's single root for deployable payload. Record defects and launch-specific exceptions locally;
never silently fix or harvest canonical sources. This guide takes precedence over
conflicting older INTENT or doc checklists for launch; record each exception and
preserve unrelated shared behavior.

## Stage references

| Stages                                                                    | Reference                                             |
| ------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1–3: storage, recovery, context, Q&A, JSON plan, materialization          | [01a Launch plan](01a-launch-plan.md)                 |
| A, B, C, D.1: skills, agents, root context/MCP, Engineering Guide         | [01b Launch install](01b-launch-install.md)           |
| D.2–D.5, E: layer/component documentation, indexes, review, Mermaid gate  | [01c Launch docs](01c-launch-docs.md)                 |
| 13: operational graph materialization; 14–15: cleanup, final audit, close | [01d Launch graph/verify](01d-launch-graph-verify.md) |

## Launch task table

Track one task per row. Prefix each subject with `[harness-bootstrap <run_id>] `,
where `<run_id>` is the exact run identifier already recorded in this run's
`selection.json`/`plan.json` and the report's `Run ID` field (e.g.
`20260930T192108Z-launch`) — never a shortened form, the mode name alone (`launch`),
or any other placeholder. Every task subject's prefix must match that string exactly,
since it is used to identify this run's tasks. Dependency numbers identify rows;
resolve them to real task IDs, never pass row numbers as task IDs.

| #   | Stage                                   | Depends on | Completion evidence                                                                                          |
| --- | --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Select providers and initialize storage | —          | Recorded providers, package path, ignore rules and durable launch records                                    |
| 2   | Context                                 | 1          | Existing code/docs/context inventory                                                                         |
| 3   | Knowns and plan                         | 2          | [Question checklist](02-launch-questions.md) resolved, answers persisted, reviewed inventory and frozen plan |
| 4   | A — Skills                              | 3          | Materialized/adapted skills and companions                                                                   |
| 5   | B — Agents                              | 4          | Selected specialists and writing/review dependencies                                                         |
| 6   | C — Root context/MCP                    | 5          | One instruction file per Q6-selected provider, reconciled guidance and selected tool config                  |
| 7   | D.1 — Engineering Guide                 | 6          | Installed documentation contracts                                                                            |
| 8   | D.2 — LLD                               | 7          | Verified components or explicit greenfield scaffold                                                          |
| 9   | D.3 — HLD                               | 8          | Verified containers and system overview/sizing                                                               |
| 10  | D.4 — NFRs                              | 9          | Verified pillar documents, or Complete with skip reason in Notes                                             |
| 11  | D.5 — Indexes                           | 10         | Links to actual verified outputs                                                                             |
| 12  | E — Satellite review                    | 11         | Recorded verdict, docs-writer final edits, resolved findings and Mermaid rendering gate passed               |
| 13  | Materialize operational graph           | 12         | `docs/.og/*` deployed verbatim (never `cli.test.mjs`), `build()` exit code recorded                          |
| 14  | Cleanup and final audit                 | 13         | Rechecked outputs, links, and final baselines                                                                |
| 15  | F/G — Recommendations                   | 14         | Outcome and suggested commit                                                                                 |

## Tracking protocol

The initial report, plan, and materialization receipt are checkpoints, not launch
completion. Continue to the next pending stage in the same launch; do not return
merely because the report truthfully says work remains. Stop only at a concrete
external blocker that prevents the next required action, or after final verification.

Do not dispatch the launch, or any remaining span of its stages, to a background/async
subagent and end the turn to await its completion notification later — that is
returning while stages remain pending, and an interrupted or killed background task
leaves the run stuck mid-stage with no session left to resume it. Run every stage's
work directly in the current session. Delegating a single stage's disjoint work to a
worker (see "Delegation safety" in SKILL.md) is fine, but only dispatched and awaited
synchronously before the orchestrator continues — never as a fire-and-forget handoff.

Initialize tracking immediately after ignore setup and report initialization, before
context inspection or Q&A. Load the execution host's
`canonical/adaptors/<host>/task-tracking.md` (independent of Q6 installation targets)
and follow its native tracker contract:
Claude uses `TaskCreate`/`TaskUpdate`/`TaskList` when exposed; Codex uses `update_plan`
when exposed. Copilot uses the durable report and mirrors an exposed native TODO tracker.
Inspect tools available in this session first; a failed tool-discovery
call alone does not prove a tracker is absent. Record the selected tracker (and, when
falling back, the discovery evidence) once in the report.

With native task/progress tools: reuse this run's existing tasks, or create one task
per row above and chain each stage to its predecessors when dependencies are
supported. Codex's `update_plan` uses a flat status list, so enforce stage order
explicitly. Mark a stage in progress before starting it and completed
only after verifying its completion evidence; mirror every transition and evidence
in the report before moving to the next stage. A component-agent dispatch is not
completion — the parent verifies all required worker outputs first. Keep a failed
stage in progress and its dependents pending, recording the failure and next action.
An authorized optional skip completes its stage only after recording the reason and
checking that downstream stages remain valid. The report's Status cell is always
byte-for-byte exactly one of `⏳ Pending`, `🔄 In progress`, or `✅ Complete` — nothing
else may ever appear in that cell, not `(skip)`, `(recorded skip)`, a stage number, or
any other parenthetical. A skipped stage is still `✅ Complete`; its skip reason goes
only in the Notes column, e.g.:
`| 10 | D.4 — NFRs | ✅ Complete | Q8/Q11 = None — skipped, no pillar docs written |`.
On resume, reconcile the task list
with recorded IDs and rechecked evidence: recreate missing tasks, rebuild
dependencies where available, restore verified statuses from the report, and reopen
invalidated stages — never create a duplicate chain while the run's tasks exist.
Before a final response, reconcile all 14 report rows with the native tracker;
completed flags must agree. Preserve table order in Codex plans and Claude task
creation. A blocked stage stays in progress and its dependents stay pending.
Future dependency checks recorded under the installation verification procedure
do not prevent completion of the current stage's local work; their owning stages
must resolve them before final verification.

Without native Task tools: keep the same stages, order, and evidence in a native progress
checklist, or in the report alone when neither tracker exists. For report-only tracking,
update the current stage before starting it and record verified completion evidence at
each stage boundary. Do not start later-stage work while earlier completed stages remain
marked pending. State which fallback is active before proceeding; do not claim native
Tasks were created when using a checklist or report.

Track each worker destination, inputs, hashes, result, and pending/verified status in
the operation record. One failed worker keeps its stage incomplete. Missing results
are failures, not implicit success; retry only failed or invalidated destinations.
