# Launch guide

Run `/harness-bootstrap launch` to install or adopt the harness. This file owns the
stage sequence and tracking contract; each stage's procedure lives in its own
reference, loaded when that stage starts. Routing lives in [SKILL.md](../SKILL.md);
manifests and baselines follow [Patch State](06-patch-state.md).

**Path convention:** `package:` means `.claude/skills/harness-bootstrap/` under the
project root; `project:` means the project root. These prefixes explain paths and are
not literal JSON values. Canonical `package:canonical/skills/`,
`package:canonical/agents/`, and `package:canonical/docs/` stay unchanged — `canonical/`
is the package's single root for deployable payload. Record defects and launch-specific exceptions locally;
never silently fix or harvest canonical sources. This guide takes precedence over
conflicting older INTENT or doc checklists for launch; record each exception and
preserve unrelated shared behavior.

## Stage references

| Stages                                                            | Reference                                   |
| ----------------------------------------------------------------- | ------------------------------------------- |
| 1–3: storage, recovery, context, Q&A, JSON plan, materialization  | [01a Launch plan](01a-launch-plan.md)       |
| A, B, C, D.1: skills, agents, root context/MCP, Engineering Guide | [01b Launch install](01b-launch-install.md) |
| D.2–D.5, E: LLD/HLD/NFR workflows, indexes, review, Mermaid gate  | [01c Launch docs](01c-launch-docs.md)       |
| Cleanup, final audit, close                                       | [01d Launch verify](01d-launch-verify.md)   |

## Launch task table

Track one task per row. Prefix each subject with `[harness-bootstrap <run_id>] `.
Dependency numbers identify rows; resolve them to real task IDs, never pass row
numbers as task IDs.

| #   | Stage                                 | Depends on | Completion evidence                                                                                          |
| --- | ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Ignore toolkit and initialize storage | —          | Root ignore entry and durable project records                                                                |
| 2   | Context                               | 1          | Existing code/docs/context inventory                                                                         |
| 3   | Knowns and plan                       | 2          | [Question checklist](02-launch-questions.md) resolved, answers persisted, reviewed inventory and frozen plan |
| 4   | A — Skills                            | 3          | Materialized/adapted skills and companions                                                                   |
| 5   | B — Agents                            | 4          | Selected specialists and writing/review dependencies                                                         |
| 6   | C — Root context/MCP                  | 5          | Exactly one Q6-selected instruction authority, reconciled guidance and selected tool config                  |
| 7   | D.1 — Engineering Guide               | 6          | Installed documentation contracts                                                                            |
| 8   | D.2 — LLD                             | 7          | Verified components or explicit greenfield scaffold                                                          |
| 9   | D.3 — HLD                             | 8          | Verified containers and system overview/sizing                                                               |
| 10  | D.4 — NFRs                            | 9          | Verified pillar documents or recorded skip                                                                   |
| 11  | D.5 — Indexes                         | 10         | Links to actual verified outputs                                                                             |
| 12  | E — Satellite review                  | 11         | Recorded verdict, docs-writer final edits, resolved findings and Mermaid rendering gate passed               |
| 13  | Cleanup and final audit               | 12         | Rechecked outputs, links, and final baselines                                                                |
| 14  | F/G — Recommendations                 | 13         | Outcome and suggested commit                                                                                 |

## Tracking protocol

Initialize tracking immediately after ignore setup and report initialization, before
context inspection or Q&A. Inspect the tools already exposed in this session first;
a failed `ToolSearch` alone does not prove native Task tools are absent. Record the
selected tracker (and, when falling back, the discovery evidence) once in the report.

With native Task tools: reuse this run's existing tasks, or create one task per row
above and chain each stage to its predecessors via task dependencies. Mark a stage
in-progress before starting it and completed only after verifying its completion
evidence; mirror each transition and its evidence in the report. A workflow dispatch
is not completion — the parent verifies all required worker outputs first. Keep a
failed stage in-progress and its dependents pending, recording the failure and next
action. An authorized optional skip completes its stage only after recording the
reason and checking that downstream stages remain valid. On resume, reconcile the
task list with recorded IDs and rechecked evidence: recreate missing tasks, rebuild
dependencies, restore verified statuses from the report, and reopen invalidated
stages — never create a duplicate chain while the run's tasks exist.

Without native Task tools: keep the same stages, order, and evidence in a `TodoWrite`
checklist, or in the report alone when neither tracker exists. State which fallback
is active before proceeding; do not claim native Tasks were created when using a
checklist or report.

Track each worker destination, inputs, hashes, result, and pending/verified status in
the operation record. One failed worker keeps its stage incomplete. Missing results
are failures, not implicit success; retry only failed or invalidated destinations.
