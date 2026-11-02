# DESIGN-20261102-Q5MU: Deterministic Docs Knowledge Graph — Report

| Field  | Value                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261102-Q5MU                                                                                           |
| Branch | `feat/dev-20261102-q5mu-deterministic-docs-knowledge-graph`                                                    |
| PR     | —                                                                                                              |
| Author | Anton Merkulov                                                                                                 |
| Status | 🔄 In Progress _(→ ✅ Complete, set by Completion)_                                                            |
| Phase  | 🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳ |

## Progress

| #   | Step                                                                       | Status     | Notes | Test | Docs |
| --- | -------------------------------------------------------------------------- | ---------- | ----- | ---- | ---- |
| 1   | Tests: canonical operational-graph module                                  | ⏳ Pending |       |      |      |
| 2   | Canonical script: module layout, CLI dispatch, SQLite schema + CRUD        | ⏳ Pending |       |      |      |
| 3   | Canonical script: ID generation + frontmatter + index()/reindex()          | ⏳ Pending |       |      |      |
| 4   | Canonical script: edge computation + build()/query()/search()              | ⏳ Pending |       |      |      |
| 5   | Canonical script: cross-runtime compatibility + generated Mermaid artifact | ⏳ Pending |       |      |      |
| 6   | Canonical launch wiring: proactive og build at Cleanup                     | ⏳ Pending |       |      |      |
| 7   | Canonical dev/design wiring: Context/Research read path                    | ⏳ Pending |       |      |      |
| 8   | Canonical dev/design wiring: Document/Publish write path                   | ⏳ Pending |       |      |      |
| 9   | harness-bootstrap-e2e: og-adoption grader                                  | ⏳ Pending |       |      |      |
| 10  | Validate: run `/harness-bootstrap launch` against this repo                | ⏳ Pending |       |      |      |
| 11  | Web (site project): build wiring                                           | ⏳ Pending |       |      |      |
| 12  | Web (site project): graph page                                             | ⏳ Pending |       |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 12m 46s · Wait: 10m 35s · Unclassified: 19s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------- | ------------------------ | ------------------------ | ----------- | ------ | ------- | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| context    | 2026-11-02T15:05:50.769Z | 2026-11-02T15:17:00.097Z | 11m 9s      | 34s    | 10m 35s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| ceremony   | 2026-11-02T15:17:08.011Z | 2026-11-02T15:19:57.038Z | 2m 49s      | 2m 49s | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| plan       | 2026-11-02T15:20:08.511Z | unavailable              | unavailable | 9m 23s | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| implement  | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| test       | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| document   | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| completion | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |

Quality (recorded inventory): findings 5 · open 2 · PR findings 0 · critical 0 · debt 0 · tests written unavailable · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 12m 46s · Wait: 10m 35s · Unclassified: 19s

| Step | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks | Flags |
| ---- | ------------- | --------------- | ------- | ---- | ---- | ------------ | ------------- | -------- | -------- | ------------- | ----- |

<!-- dev-metrics-step:end -->

## Review Findings

| ID     | Stage | Origin          | Kind      | Deviation type | Severity | Classification | Finding                                                                                                                                                                                                                                                         | Evidence                                                                                                                   | Resolution | TD  | Decision                                                                                                                                                                                             |
| ------ | ----- | --------------- | --------- | -------------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-001 | plan  | plan-audit      | deviation | extension      | low      | ruled-out      | `apps/docs-graph` scaffolded as a full NX application, heavier than `solution/Architecture.md` Decision 3's "single reusable script" framing                                                                                                                    | `@architect` plan audit finding 7 (first draft)                                                                            | accepted   | —   | Superseded by the developer's Plan rework (relocated to `.canonical-implementation-harness/canonical/docs/.og/cli.mjs`, a literal single script) — the finding no longer applies to the current plan |
| RF-002 | plan  | plan-audit      | docs      | —              | low      | advisory       | `docs/Target Architecture (HLD)/v1/Containers/Web.md`'s "Key paths"/"Boundary contracts" don't yet list `docs/.og/graph.sqlite` as a new build-time artifact                                                                                                    | `@architect` plan audit finding 8                                                                                          | open       | —   | Deferred to Document stage doc-sync pass, per `@architect`'s own suggestion; not a plan edit                                                                                                         |
| RF-003 | plan  | plan-audit      | deviation | contradiction  | medium   | introduced     | Step 6 wired the kb copy+`build()` into `01d-launch-verify.md`'s "## Close" section (stage 14), which runs _after_ Final audit's hash/baseline recording — the new files would escape that recording                                                            | `@architect` plan re-audit (12-step rewrite), finding/Gap 1; `01d-launch-verify.md:29-56` (Final audit), `:58-64` (Close)  | fixed      | —   | Auto-applied: moved to "## Cleanup" (stage 13, before Final audit) in `impl/1-plan.md` Step 6; no scope change                                                                                       |
| RF-004 | plan  | plan-audit      | bug       | —              | low      | introduced     | Step 9 directed the new e2e grader into `bootstrapScenario.steps`'s `launch` step `graders` list, but that list gates only on `agentRunSucceeded()`; sibling docs-adoption graders live in the scenario-level `graders` array                                   | `@architect` plan re-audit (12-step rewrite), finding/Gap 2; `apps/harness-bootstrap-e2e/src/scenarios/bootstrap.ts:38-74` | fixed      | —   | Auto-applied: corrected Step 9 to target `bootstrapScenario.graders`; no scope change                                                                                                                |
| RF-005 | plan  | doc-consistency | docs      | —              | low      | advisory       | The tool/folder is now named "operational graph" (`docs/.og/`, per the developer's naming decision in `1-plan.md`'s Solution), but the published nav section `docs/Harness/07 Knowledge Graph/` still reads "Knowledge Graph" — a reader-facing naming mismatch | `1-plan.md` Solution; `docs/Harness/07 Knowledge Graph/`                                                                   | open       | —   | Out of this ticket's scope (no step renames the published section); flagged for a follow-up rename of `docs/Harness/07 Knowledge Graph/` to align with "Operational Graph" once this ticket ships    |

<!-- One row per underlying issue; see patterns/review-gate.md. Empty means no recorded findings, not proof of review. -->

## Implementation Notes

_Added for every step — a brief confirmation for smooth steps, detailed notes for surprises, workarounds, or decisions made._

## Tech Debt

| #   | Description | Type | Tracker | Finding | Owner | Next action |
| --- | ----------- | ---- | ------- | ------- | ----- | ----------- |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Tracker: fill in once a task is created (e.g. ND-XX), otherwise —
Rows are added here by the Implement stage (references/04-implement.md, tech debt while working on a step) as debt is discovered.
-->

## Test Results

| Project | Build | Tests | Typecheck | Lint | Written | Passed | Failed | Skipped | Evidence |
| ------- | ----- | ----- | --------- | ---- | ------- | ------ | ------ | ------- | -------- |

<!-- One row per non-overlapping project/suite scope, updated to its latest run.
Written = new test cases in this change, not files/assertions. Passed/Failed/Skipped
= latest runner case counts. Use unavailable when unknown, never infer counts from
exit status. Explicit 0 requires evidence; — is not measured. Evidence links runner
output and the diff supporting Written. Historical failed runs remain in stat.checks.
-->

## Documentation

| Doc / section | Tier | Action | Why | Done |
| ------------- | ---- | ------ | --- | ---- |

<!-- Written by the Document stage (references/06-document.md Step 3) before any doc
is touched; Done is ticked as @docs-writer returns each row. Tier is one from
Documentation/02 Structure.md. Action: new · updated · retired. Why points at the
plan Solution, an implementation note or an RF row. Empty means no doc impact was
identified, not that docs were skipped; say so in a line below the table. -->

## Efforts Spent

| Date | Phase | Human time | AI tokens | Notes |
| ---- | ----- | ---------- | --------- | ----- |
