# DESIGN-20261117-7931: OKF-Compatible Knowledge Base — Report

| Field  | Value                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261117-7931 _(local design ID, no tracker record)_                                                    |
| Branch | `docs/design-20261117-7931-okf-knowledge-base` _(design branch, kept by developer decision)_                   |
| PR     | —                                                                                                              |
| Author | Anton Merkulov                                                                                                 |
| Status | 🔄 In Progress                                                                                                 |
| Phase  | 🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳ |

Task tracking: Claude `TaskCreate`/`TaskUpdate` (tasks #1–#7, one per stage), mirrored in this report.

## Progress

| #   | Step                                                        | Status     | Notes | Test | Docs |
| --- | ----------------------------------------------------------- | ---------- | ----- | ---- | ---- |
| 1   | Tests: canonical OG cases for AC-1 to AC-8                  | ⏳ Pending |       |      |      |
| 2   | Canonical OG: scope guard and retirements                   | ⏳ Pending |       |      |      |
| 3   | Canonical OG: frontmatter parser, B+ writer, type map       | ⏳ Pending |       |      |      |
| 4   | Canonical OG: schema v1, config, CLI renames                | ⏳ Pending |       |      |      |
| 5   | Canonical OG: check command                                 | ⏳ Pending |       |      |      |
| 6   | Canonical OG: migrate command                               | ⏳ Pending |       |      |      |
| 7   | Canonical harness flows: launch, reindex-graph, patch apply | ⏳ Pending |       |      |      |
| 8   | Canonical docs flow: writers, rules, templates              | ⏳ Pending |       |      |      |
| 9   | Implementation Harness E2E: follow the key rename           | ⏳ Pending |       |      |      |
| 10  | Release: commit, minor version stamp, patch prepare         | ⏳ Pending |       |      |      |
| 11  | This repo: patch apply                                      | ⏳ Pending |       |      |      |
| 12  | This repo: reindex-graph migration                          | ⏳ Pending |       |      |      |
| 13  | Web Docs: nav and README links                              | ⏳ Pending |       |      |      |
| 14  | Web Explorer: Dogfood page                                  | ⏳ Pending |       |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 21m 48s · Wait: 9m 7s · Unclassified: 16s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------- | ------------------------ | ------------------------ | ----------- | ------ | ------ | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| context    | 2026-11-18T13:21:21.058Z | 2026-11-18T13:27:33.993Z | 6m 13s      | 2m 38s | 3m 35s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| ceremony   | 2026-11-18T13:27:42.955Z | 2026-11-18T13:33:19.761Z | 5m 37s      | 5s     | 5m 32s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| plan       | 2026-11-18T13:33:27.013Z | unavailable              | unavailable | 19m 5s | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| implement  | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| test       | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| document   | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| completion | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |

Quality (recorded inventory): findings 22 · open 0 · PR findings 0 · critical 0 · debt 0 · tests written unavailable · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 21m 48s · Wait: 9m 7s · Unclassified: 16s

| Step | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks | Flags |
| ---- | ------------- | --------------- | ------- | ---- | ---- | ------------ | ------------- | -------- | -------- | ------------- | ----- |

<!-- dev-metrics-step:end -->

## Review Findings

| ID     | Stage | Origin     | Kind      | Deviation type | Severity | Classification | Finding                                                                                                                                             | Evidence                                                                                              | Resolution | TD  | Decision                                                                                                                                                                                                                |
| ------ | ----- | ---------- | --------- | -------------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-001 | plan  | plan-audit | bug       | —              | high     | introduced     | Step 10 version stamp would compute from v4.0.2: no local v4.1.0 tag                                                                                | `git tag --list 'v4*'` → newest v4.0.2; `version-harness.mjs:68-80` reads local tags only             | fixed      | —   | Auto-applied, no scope change: Step 10 starts with `git fetch --tags` and checks v4.1.0; AC-12 updated; confirmed resolved by plan-audit round 2                                                                        |
| RF-002 | plan  | plan-audit | deviation | contradiction  | high     | introduced     | Step 11 commit would break `web-docs:build`: `check-tier-sync.mjs` imports the removed `APP_README_PATTERN`; design says same change as patch apply | `check-tier-sync.mjs:9`; Architecture cross-cutting "AppReadme retirement in this repo"               | fixed      | —   | Auto-applied, no scope change: tier-sync and Graph Explorer edits moved into Step 11; build check added there; confirmed resolved by plan-audit round 2                                                                 |
| RF-003 | plan  | plan-audit | deviation | omission       | medium   | introduced     | Tier sync would read config-driven prefixes instead of the static tier names                                                                        | `check-tier-sync.mjs:11`; design D2 "Tier names"                                                      | fixed      | —   | Auto-applied, no scope change: Step 4 exports static `TIER_NAMES`; Step 11 switches the script to it; confirmed resolved by plan-audit round 2                                                                          |
| RF-004 | plan  | plan-audit | deviation | omission       | medium   | introduced     | Step 8 omitted canonical Lifecycles `05 Documents Flow.md`                                                                                          | Efforts item 6, Done-when 6; `canonical/docs/Engineering Guide/Lifecycles/05 Documents Flow.md`       | fixed      | —   | Auto-applied, no scope change: added to Step 8 and AC-10; confirmed resolved by plan-audit round 2                                                                                                                      |
| RF-005 | plan  | plan-audit | design    | —              | medium   | introduced     | Canonical `docs/.og/.gitignore` would not ship: `yarn pack` drops `.gitignore`                                                                      | Probe 2026-11-18: temporary `.gitignore` absent from `yarn pack --dry-run`, probe removed             | fixed      | —   | Auto-applied, called out at sign-off: ship `gitignore`, deploy as `.gitignore` (launch, reindex Step 0); design outcome unchanged; confirmed resolved by plan-audit round 2                                             |
| RF-006 | plan  | plan-audit | bug       | —              | medium   | introduced     | Step 12 idempotency rerun would exit 1 on dirty `.md` files                                                                                         | Design D2 "Clean-worktree scope"                                                                      | fixed      | —   | Auto-applied, no scope change: developer commit before the rerun; `--check` used before it; confirmed resolved by plan-audit round 2                                                                                    |
| RF-007 | plan  | plan-audit | bug       | —              | medium   | introduced     | Live reindex-graph E2E would meet `missingConfig` and confirmation prompts                                                                          | `reindex-graph.ts:21-62` fixture seeds no config                                                      | fixed      | —   | Auto-applied, no scope change: fixture seeds `og.config.json` `{}` and B+ docs (Step 9, AC-11); confirmed resolved by plan-audit round 2                                                                                |
| RF-008 | plan  | plan-audit | design    | —              | medium   | introduced     | "Resolve drift toward canonical" contradicts the patch-apply no-silent-overwrite contract                                                           | `05-patch-apply.md:64-67`; `.harness/state/index.json` kept customizations                            | fixed      | —   | Auto-applied, no scope change: keep recorded customizations, other overlaps go to the developer; confirmed resolved by plan-audit round 2                                                                               |
| RF-009 | plan  | plan-audit | deviation | omission       | low      | introduced     | Decline path missed "still run build and check"                                                                                                     | Design D2 "Trigger", cross-cutting "Confirm before migrate"                                           | fixed      | —   | Auto-applied, no scope change: Step 7 and AC-9 spell it out; confirmed resolved by plan-audit round 2                                                                                                                   |
| RF-010 | plan  | plan-audit | deviation | omission       | low      | introduced     | Clean check omitted out-of-scope files touched by stray-id cleanup                                                                                  | Design D2 "Clean-worktree scope"                                                                      | fixed      | —   | Auto-applied, no scope change: Step 6 and AC-7 fixture; confirmed resolved by plan-audit round 2                                                                                                                        |
| RF-011 | plan  | plan-audit | improve   | —              | low      | introduced     | Done-when 5 (greenfield launch) had no runnable check                                                                                               | Efforts Done-when 5                                                                                   | fixed      | —   | Auto-applied, no scope change: greenfield fixtures in `cli.test.mjs`, `:integration` added; live run is the developer's; confirmed resolved by plan-audit round 2                                                       |
| RF-012 | plan  | plan-audit | bug       | —              | low      | introduced     | Bundle path `package-patch/` wrong and bundle not committed                                                                                         | `06-patch-state.md:13-14`                                                                             | fixed      | —   | Auto-applied, no scope change: `skills/implementation-harness/patch/`, committed in Step 11; confirmed resolved by plan-audit round 2                                                                                   |
| RF-013 | plan  | plan-audit | bug       | —              | low      | introduced     | Story `.md` writes between Step 11 commit and `migrate` would block it                                                                              | Design D2 "Clean-worktree scope"                                                                      | fixed      | —   | Auto-applied, no scope change: no story writes in that window; confirmed resolved by plan-audit round 2                                                                                                                 |
| RF-014 | plan  | plan-audit | improve   | —              | info     | introduced     | Done-when 2's "50 docs get tags" not an explicit AC                                                                                                 | Efforts Done-when 2                                                                                   | fixed      | —   | Auto-applied, no scope change: AC-3 counts them; confirmed resolved by plan-audit round 2                                                                                                                               |
| RF-015 | plan  | plan-audit | docs      | —              | info     | introduced     | AC-13 allowed `docs/.og/` differences omitted `cli.test.mjs`                                                                                        | Step 11 verification                                                                                  | fixed      | —   | Auto-applied, no scope change: AC-13 aligned; confirmed resolved by plan-audit round 2                                                                                                                                  |
| RF-016 | plan  | plan-audit | improve   | —              | info     | introduced     | Edge baseline taken after the new OG had already migrated the DB                                                                                    | Step 12                                                                                               | fixed      | —   | Auto-applied, no scope change: baseline taken with old OG before Step 11; confirmed resolved by plan-audit round 2                                                                                                      |
| RF-017 | plan  | plan-audit | design    | —              | info     | introduced     | Q10c still asks free text, so new projects hit `missingConfig`                                                                                      | `02-launch-questions.md:27`; this repo's Q10c is free text                                            | fixed      | —   | Auto-applied, called out at sign-off: Q10c asks for a folder path (Step 7); confirmed resolved by plan-audit round 2                                                                                                    |
| RF-018 | plan  | plan-audit | docs      | —              | info     | introduced     | Intent had stray pasted text and still said "major version stamp"                                                                                   | `0-intent.md` lines 50, 62                                                                            | fixed      | —   | Corrected in `0-intent.md` (text fix, confirmed answers unchanged); confirmed by plan-audit round 2                                                                                                                     |
| RF-019 | plan  | plan-audit | bug       | —              | medium   | introduced     | `gitignore` rename had no deploy rule; patch apply would ship a literal `docs/.og/gitignore`                                                        | `canonical/manifest.json` maps `canonical/docs` → `docs` one-to-one; only rename is `skillEntrypoint` | fixed      | —   | Auto-applied, no scope change: manifest rename rule honoured by launch, reindex Step 0 and patch apply (Step 7); Step 11 checks the deployed file and `git check-ignore`; confirmed resolved by plan-audit round 3 (go) |
| RF-020 | plan  | plan-audit | bug       | —              | low      | introduced     | Step 12 "git status clean" after rerun fails: tracked DB and `graph.mmd` change on every reindex                                                    | `git ls-files docs/.og`; schema v1 `indexed_at`                                                       | fixed      | —   | Auto-applied, no scope change: check `.md` only; DB and `graph.mmd` go into the phase-end commit; confirmed resolved by plan-audit round 3 (go)                                                                         |
| RF-021 | plan  | plan-audit | docs      | —              | info     | introduced     | Step 6 said the live DB is untouched before Step 12, but Step 11's build migrates it; Product tier missing until Step 12                            | Plan Step 6 vs Step 11                                                                                | fixed      | —   | Auto-applied, no scope change: wording fixed; no site deploy between the Step 11 and Step 12 commits; confirmed resolved by plan-audit round 3 (go)                                                                     |
| RF-022 | plan  | plan-audit | improve   | —              | info     | introduced     | Launch E2E grader does not cover the `gitignore` deploy                                                                                             | `docs-adoption.grader.ts:123-132`                                                                     | fixed      | —   | Auto-applied, no scope change: grader asserts `.gitignore` present, literal `gitignore` absent (Step 9); confirmed resolved by plan-audit round 3 (go)                                                                  |

<!-- One row per underlying issue; see patterns/review-gate.md. Empty means no recorded findings, not proof of review. -->

## Implementation Notes

_Added for every step — a brief confirmation for smooth steps, detailed notes for surprises, workarounds, or decisions made._

## Tech Debt

| #   | Description | Type | Tracker | Finding | Owner | Next action |
| --- | ----------- | ---- | ------- | ------- | ----- | ----------- |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Tracker: fill in once a task is created (e.g. ND-XX), otherwise —
-->

## Test Results

| Project | Build | Tests | Typecheck | Lint | Written | Passed | Failed | Skipped | Evidence |
| ------- | ----- | ----- | --------- | ---- | ------- | ------ | ------ | ------- | -------- |

## Documentation

| Doc / section | Tier | Action | Why | Done |
| ------------- | ---- | ------ | --- | ---- |

## Efforts Spent

| Date | Phase | Human time | AI tokens | Notes |
| ---- | ----- | ---------- | --------- | ----- |
