---
name: Dev Report Template
description: Template for 2-report.md — the living implementation report created by /dev context and updated throughout the dev lifecycle
type: reference
---

# DEV-20261115-5DUE: Harness Distribution and Release Channels — Report

| Field  | Value                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Ticket | DEV-20261115-5DUE                                                                                              |
| Branch | `docs/design-20261115-co1t-harness-distribution`                                                               |
| PR     | —                                                                                                              |
| Author | Anton Merkulov                                                                                                 |
| Status | 🔄 In Progress                                                                                                 |
| Phase  | 🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳ |

## Progress

| #   | Step                                                         | Status     | Notes | Test | Docs |
| --- | ------------------------------------------------------------ | ---------- | ----- | ---- | ---- |
| 1   | Tests: new gates, state root, migrator, CLI                  | ⏳ Pending |       |      |      |
| 2   | Package: move to `skills/implementation-harness/` and rename | ⏳ Pending |       |      |      |
| 3   | Harness Bootstrap E2E: new path and skill name               | ⏳ Pending |       |      |      |
| 4   | Log Hub: follow the moved folder                             | ⏳ Pending |       |      |      |
| 5   | Web Explorer: command strings                                | ⏳ Pending |       |      |      |
| 6   | Package scripts: state root `.harness/state/`                | ⏳ Pending |       |      |      |
| 7   | This repo's state, package procedures and docs aliases       | ⏳ Pending |       |      |      |
| 8   | Migrator                                                     | ⏳ Pending |       |      |      |
| 9   | Install CLI                                                  | ⏳ Pending |       |      |      |
| 10  | Legacy shim skill                                            | ⏳ Pending |       |      |      |
| 11  | npm package and Nx project                                   | ⏳ Pending |       |      |      |
| 12  | Marketplace manifests and skills.sh                          | ⏳ Pending |       |      |      |
| 13  | Version stamping and gate                                    | ⏳ Pending |       |      |      |
| 14  | Commit scope check and root release rules                    | ⏳ Pending |       |      |      |
| 15  | Rename gate and docs lint                                    | ⏳ Pending |       |      |      |
| 16  | CI gates                                                     | ⏳ Pending |       |      |      |
| 17  | Nx Release config and release workflow                       | ⏳ Pending |       |      |      |
| 18  | Retire the manual release flow                               | ⏳ Pending |       |      |      |
| 19  | Repo metadata references                                     | ⏳ Pending |       |      |      |
| 20  | Full local gate run                                          | ⏳ Pending |       |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 10m 28s · Wait: 16m 58s · Unclassified: 11s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------- | ------------------------ | ------------------------ | ----------- | ------ | ------ | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| context    | 2026-11-15T18:32:35.756Z | 2026-11-15T18:36:00.373Z | 3m 25s      | 25s    | 3m 0s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| ceremony   | 2026-11-15T18:36:04.110Z | 2026-11-15T18:41:26.193Z | 5m 22s      | 1s     | 5m 21s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| plan       | 2026-11-15T18:41:32.668Z | unavailable              | unavailable | 10m 2s | 8m 37s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| implement  | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| test       | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| document   | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| completion | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |

Quality (recorded inventory): findings 23 · open 0 · PR findings 0 · critical 0 · debt 0 · tests written unavailable · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 10m 28s · Wait: 16m 58s · Unclassified: 11s

| Step | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks | Flags |
| ---- | ------------- | --------------- | ------- | ---- | ---- | ------------ | ------------- | -------- | -------- | ------------- | ----- |

<!-- dev-metrics-step:end -->

## Review Findings

| ID     | Stage | Origin     | Kind      | Deviation type | Severity | Classification | Finding                                                                                                                                            | Evidence                                                     | Resolution | TD  | Decision                                                                                                                                                                                                        |
| ------ | ----- | ---------- | --------- | -------------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-001 | plan  | plan-audit | design    | —              | high     | introduced     | Shim at `skills/harness-bootstrap/` is outside the package, so the tarball and ZIP (D-03) and `migrate` cannot carry it                            | Plan Steps 8, 10, 11, 17; Architecture.md D-03               | fixed      | —   | Auto-applied, no scope change: generated copy at `<package>/legacy/harness-bootstrap/SKILL.md` via `scripts/pack-shim.mjs`; AC-17 asserts it                                                                    |
| RF-002 | plan  | plan-audit | design    | —              | high     | introduced     | A re-run after a failed publish finds no new version and could skip publish, ZIP and attest                                                        | Plan Step 17; Architecture.md F1                             | fixed      | —   | Auto-applied, no scope change: publish steps read the tag at HEAD and check existence; AC-22 covers the re-run path                                                                                             |
| RF-003 | plan  | plan-audit | design    | —              | high     | introduced     | Breaking `feat(harness)!:` commit not tested against the root lane; the preset could still cut a major `v*`                                        | Plan Step 14, AC-20                                          | fixed      | —   | Auto-applied, no scope change: rules ordered before the preset; analyzer cases for `!` and `BREAKING CHANGE:` added                                                                                             |
| RF-004 | plan  | plan-audit | design    | —              | medium   | introduced     | Checkout token and identity for the release commit and tag not named                                                                               | Plan Step 17; Release Pipeline design line 77                | fixed      | —   | Auto-applied: `HARNESS_RELEASE_TOKEN` with `github.token` fallback named; ticket 10 runbook sets the secret and bypass actor                                                                                    |
| RF-005 | plan  | plan-audit | deviation | extension      | medium   | introduced     | Release-tooling tests widen the E2E container beyond "validates the package"                                                                       | HLD `Harness Bootstrap E2E.md` Responsibilities; Plan Step 1 | accepted   | —   | Named as a planning decision; Document records it in the HLD. Needs developer acknowledgement at sign-off Accepted by the developer at plan sign-off (2026-11-15: "looks good! lets do it!", default readings). |
| RF-006 | plan  | plan-audit | bug       | —              | medium   | pre-existing   | Log Hub canonical-hash check runs only if both files exist, so a stale path passes silently                                                        | `apps/log-hub/src/verify.ts:150` (checked)                   | fixed      | —   | Auto-applied: Step 4 makes a missing file a finding and adds a test                                                                                                                                             |
| RF-007 | plan  | plan-audit | design    | —              | medium   | introduced     | ZIP integrity checked on the staged tree, not the downloaded ZIP bytes the `.sha256` covers                                                        | Plan Step 9; Architecture.md D-09, D-11                      | fixed      | —   | Auto-applied: ZIP bytes verified before extraction                                                                                                                                                              |
| RF-008 | plan  | plan-audit | security  | —              | medium   | introduced     | Fetch origin env override would let the `.sha256` come from the same attacker-chosen origin                                                        | Plan Step 9                                                  | fixed      | —   | Auto-applied: `--release-base-url` flag, `https:` or loopback `http:` only, test seam                                                                                                                           |
| RF-009 | plan  | plan-audit | design    | —              | low      | introduced     | `update` on channel `npm` is thin without a version argument                                                                                       | Plan Step 9, AC-13                                           | fixed      | —   | Auto-applied: AC-13 and `doctor` state and print the `npx …@<version> update` command; Document records it                                                                                                      |
| RF-010 | plan  | plan-audit | design    | —              | medium   | introduced     | Web Explorer string change has no design basis or AC and would advertise the new command before 4.0.0 exists                                       | Plan Step 5                                                  | accepted   | —   | AC-28 added and ordering named; needs a developer choice at sign-off (keep, or move to Document) Accepted by the developer at plan sign-off (2026-11-15: "looks good! lets do it!", default readings).          |
| RF-011 | plan  | plan-audit | docs      | —              | low      | introduced     | Expected tracked state count was wrong (158 vs 156 + registry = 157)                                                                               | `git ls-files` (checked)                                     | fixed      | —   | Auto-applied: Step 7 counts corrected                                                                                                                                                                           |
| RF-012 | plan  | plan-audit | design    | —              | low      | introduced     | Marketplace `ref` on `main` points at a tag that does not exist until the first release                                                            | Plan Step 12, AC-18                                          | accepted   | —   | Named as an accepted window in the plan; needs attributed acceptance at sign-off Accepted by the developer at plan sign-off (2026-11-15: "looks good! lets do it!", default readings).                          |
| RF-013 | plan  | plan-audit | design    | —              | low      | introduced     | Deleting committed ZIPs leaves no downloadable 3.5.0 until 4.0.0 is released                                                                       | Plan Step 18; Efforts rollout                                | accepted   | —   | Named as an accepted window; runbook notes it; needs attributed acceptance at sign-off Accepted by the developer at plan sign-off (2026-11-15: "looks good! lets do it!", default readings).                    |
| RF-014 | plan  | plan-audit | improve   | —              | low      | introduced     | New CI `rename-gate` is red until the Document stage lands                                                                                         | Plan Step 16                                                 | fixed      | —   | Auto-applied: Document commit precedes the first push; stated in Step 16                                                                                                                                        |
| RF-015 | plan  | plan-audit | improve   | —              | info     | advisory       | Step 3's integration pass uses the old state path and does not prove AC-5                                                                          | Plan Steps 3, 6                                              | fixed      | —   | Auto-applied: stated in Step 3's expected result                                                                                                                                                                |
| RF-016 | plan  | plan-audit | security  | —              | medium   | introduced     | The `github.token` fallback cannot push to a protected `main`, so it is dead and hides a missing secret                                            | Plan Step 17; Architecture.md D-17                           | fixed      | —   | Auto-applied: fallback dropped, fail fast on a missing secret; decision, Step 17 and AC-22 updated                                                                                                              |
| RF-017 | plan  | plan-audit | bug       | —              | high     | introduced     | Step 4's `log-hub:verify` could not pass: the state index sits at `skills/implementation-harness/state/` after Step 2 but Step 4 left the old path | `apps/log-hub/src/verify.ts:149` (checked); Plan Steps 4, 7  | fixed      | —   | Auto-applied: Step 4 points at the interim path, Step 7 at `.harness/state/`                                                                                                                                    |
| RF-018 | plan  | plan-audit | design    | —              | high     | introduced     | The generated shim copy was needed by Steps 8–10 before Step 11 created it; Step 11 also missed its Step 10 dependency                             | Plan Steps 8–11                                              | fixed      | —   | Auto-applied: `pack-shim.mjs` moved into Step 10, Step 11 depends on Steps 2 and 10                                                                                                                             |
| RF-019 | plan  | plan-audit | design    | —              | high     | introduced     | Git channels (marketplace, skills.sh, `gh skill`) carry no gitignored `legacy/` copy, so `migrate` had no shim to place                            | Plan Steps 9, 12; Architecture.md D-03                       | fixed      | —   | Auto-applied: lookup order `legacy/` then the sibling `skills/harness-bootstrap/`, else skip and `doctor` warns; a test case per outcome                                                                        |
| RF-020 | plan  | plan-audit | design    | —              | high     | introduced     | "Tag at HEAD" fails on a real re-run (checks out the merge SHA) or a later push                                                                    | Plan Step 17, AC-22                                          | fixed      | —   | Auto-applied: resolve the latest harness tag reachable from `origin/main`; AC-22 re-run case updated                                                                                                            |
| RF-021 | plan  | plan-audit | design    | —              | medium   | introduced     | The 4.0.0 dry run cannot pass before the developer commits the breaking rename                                                                     | Plan Step 17, AC-21                                          | fixed      | —   | Auto-applied: Step 17 uses a scratch clone with a `feat(harness)!:` commit; the Test stage repeats it on the real commits                                                                                       |
| RF-022 | plan  | plan-audit | bug       | —              | medium   | introduced     | Rename gate would hit the tracked `runs/*/report.json` and the `eslint.config.js` comment                                                          | `git grep` (checked); Plan Steps 15, 19                      | fixed      | —   | Auto-applied: `runs/**` allowlisted, eslint comment reworded in Step 19                                                                                                                                         |
| RF-023 | plan  | plan-audit | improve   | —              | low      | introduced     | `check-commit-scope` named only `harness`; the stamped release commit uses `harness-release`                                                       | Plan Step 14                                                 | fixed      | —   | Auto-applied: both scopes accepted; the analyzer test stays a hard gate                                                                                                                                         |

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
