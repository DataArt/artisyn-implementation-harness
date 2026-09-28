---
name: Dev Report Template
description: Template for 2-report.md — the living implementation report created by {{provider:invoke:dev}} context and updated throughout the dev lifecycle
type: reference
---

# <TICKET>: <Short Title> — Report

| Field  | Value                                                                                       |
| ------ | ------------------------------------------------------------------------------------------- |
| Ticket | {{PROJECT_KEY}}-XX                                                                          |
| Branch | `feat/{{PROJECT_KEY}}-XX-slug`                                                              |
| PR     | —                                                                                           |
| Author | _from `git config user.name`_                                                               |
| Status | 🔄 In Progress                                                                              |
| Phase  | 🎯 Context 🔄 · 🚀 Ceremony ⏳ · 📋 Plan ⏳ · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳ |

## Progress

| #   | Step         | Status     | Notes | Test | Docs |
| --- | ------------ | ---------- | ----- | ---- | ---- |
| 1   | _Step title_ | ⏳ Pending |       |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first
start to its completion (includes any wait). **Work** = summed observed work
intervals (active effort) within that span. **Wait** = summed observed wait
intervals (blocked on developer input, approval, or an external dependency) within
that span. Work + Wait can read less than Elapsed when time went unclassified, or
more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to
the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token
subtotals have unavailable coverage; ticket usage is not allocated to individual
units. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope
change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a
new judgment call — so a reader can scan for problem stages without parsing every row.

| Stage | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks | Flags |
| ----- | ------------- | --------------- | ------- | ---- | ---- | ------------ | ------------- | -------- | -------- | ------------- | ----- |

<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first
start to its completion (includes any wait). **Work** = summed observed work
intervals (active effort) within that span. **Wait** = summed observed wait
intervals (blocked on developer input, approval, or an external dependency) within
that span. Work + Wait can read less than Elapsed when time went unclassified, or
more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to
the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token
subtotals have unavailable coverage; ticket usage is not allocated to individual
units. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope
change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a
new judgment call — so a reader can scan for problem steps without parsing every row.

| Step | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks | Flags |
| ---- | ------------- | --------------- | ------- | ---- | ---- | ------------ | ------------- | -------- | -------- | ------------- | ----- |

<!-- dev-metrics-step:end -->

## Review Findings

| ID  | Stage | Origin | Kind | Deviation type | Severity | Classification | Finding | Evidence | Resolution | TD  | Decision |
| --- | ----- | ------ | ---- | -------------- | -------- | -------------- | ------- | -------- | ---------- | --- | -------- |

<!-- One row per underlying issue; see patterns/review-gate.md. Empty means no recorded findings, not proof of review. -->

## Implementation Notes

_Added for every step — a brief confirmation for smooth steps, detailed notes for surprises, workarounds, or decisions made._

## Tech Debt

| #   | Description | Type | Tracker | Finding | Owner | Next action |
| --- | ----------- | ---- | ------- | ------- | ----- | ----------- |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Tracker: fill in once a task is created (e.g. {{PROJECT_KEY}}-XX), otherwise —
Rows are added here by the Implement stage (references/04-implement.md Step 5) as debt is discovered.
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

## Efforts Spent

| Date | Phase | Human time | AI tokens | Notes |
| ---- | ----- | ---------- | --------- | ----- |
