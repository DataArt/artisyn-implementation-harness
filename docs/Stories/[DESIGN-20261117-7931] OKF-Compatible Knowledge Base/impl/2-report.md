---
id: c1b2c846
type: Implementation Report
title: 'DESIGN-20261117-7931: OKF-Compatible Knowledge Base — Report'
description: Live implementation report tracking step progress, stage metrics and decisions for the OKF-compatible knowledge base story
tags: [implementation report, okf, operational graph, frontmatter, migration]
generated: { by: process:okf-migration, at: 2026-11-18T13:31:29Z }
updated: { by: process:okf-migration, at: 2026-11-21T19:46:47Z }
---

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

| #   | Step                                                        | Status     | Notes                                                              | Test | Docs |
| --- | ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------ | ---- | ---- |
| 1   | Tests: canonical OG cases for AC-1 to AC-8                  | ✅ Done    | 96 cases; 73 red for expected reasons                              |      |      |
| 2   | Canonical OG: scope guard and retirements                   | ✅ Done    | AC-1/AC-2 green (1 waits on Step 3 parser)                         |      |      |
| 3   | Canonical OG: frontmatter parser, B+ writer, type map       | ✅ Done    | Parser/writer/type map green; golden 173 docs                      |      |      |
| 4   | Canonical OG: schema v1, config, CLI renames                | ✅ Done    | Schema v1, config, renames green; seed v1                          |      |      |
| 5   | Canonical OG: check command                                 | ✅ Done    | check green                                                        |      |      |
| 6   | Canonical OG: migrate command                               | ✅ Done    | 96/96 green; scratch dogfood run clean                             |      |      |
| 7   | Canonical harness flows: launch, reindex-graph, patch apply | ✅ Done    | References + manifest; 98/98, unit-cli 44/44                       |      |      |
| 8   | Canonical docs flow: writers, rules, templates              | ✅ Done    | B+ rules in canonical docs flow; Terminology kept empty (see note) |      |      |
| 9   | Implementation Harness E2E: follow the key rename           | ✅ Done    | E2E fixture/assertion/grader; unit 319, unit-cli 44, integration 5 |      |      |
| 10  | Release: commit, minor version stamp, patch prepare         | ✅ Done    | 4.2.0 stamped (63bf14e); bundle 6ceda622, 50 files, all verified   |      |      |
| 11  | This repo: patch apply                                      | ✅ Done    | 26 outputs; 5 conflicts resolved; DB v1; web-docs build green      |      |      |
| 12  | This repo: reindex-graph migration                          | 🔄 Active  | Migrated 220 files; check all zero; awaiting commit + rerun        |      |      |
| 13  | Web Docs: nav and README links                              | ⏳ Pending |                                                                    |      |      |
| 14  | Web Explorer: Dogfood page                                  | ⏳ Pending |                                                                    |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 1h 9m 3s · Wait: 77h 19m 38s · Unclassified: 9m 21s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait        | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------- | ------------------------ | ------------------------ | ----------- | ------- | ----------- | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| context    | 2026-11-18T13:21:21.058Z | 2026-11-18T13:27:33.993Z | 6m 13s      | 2m 38s  | 3m 35s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| ceremony   | 2026-11-18T13:27:42.955Z | 2026-11-18T13:33:19.761Z | 5m 37s      | 5s      | 5m 32s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| plan       | 2026-11-18T13:33:27.013Z | 2026-11-18T16:48:43.098Z | 3h 15m 16s  | 19m 5s  | 2h 56m 11s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| implement  | 2026-11-18T16:48:52.113Z | unavailable              | unavailable | 47m 14s | 74h 14m 20s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| test       | unavailable              | unavailable              | unavailable | 0s      | 0s          | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| document   | unavailable              | unavailable              | unavailable | 0s      | 0s          | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| completion | unavailable              | unavailable              | unavailable | 0s      | 0s          | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |

Quality (recorded inventory): findings 22 · open 0 · PR findings 0 · critical 0 · debt 4 · tests written unavailable · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 1h 9m 3s · Wait: 77h 19m 38s · Unclassified: 9m 21s

| Step                                                                 | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait       | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| -------------------------------------------------------------------- | ------------------------ | ------------------------ | ----------- | ------ | ---------- | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| step-01: Tests: canonical OG cases for AC-1 to AC-8                  | 2026-11-18T16:49:02.129Z | 2026-11-18T16:56:35.184Z | 7m 33s      | 7m 33s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-02: Canonical OG: scope guard and retirements                   | 2026-11-18T16:56:35.240Z | 2026-11-18T16:59:16.398Z | 2m 41s      | 2m 41s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-03: Canonical OG: frontmatter parser, B+ writer, type map       | 2026-11-18T16:59:16.454Z | 2026-11-18T17:03:51.996Z | 4m 36s      | 4m 36s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-04: Canonical OG: schema v1, config, CLI renames                | 2026-11-18T17:03:52.073Z | 2026-11-18T17:03:52.181Z | 0s          | 0s     | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-05: Canonical OG: check command                                 | 2026-11-18T17:03:52.232Z | 2026-11-18T17:06:09.479Z | 2m 17s      | 2m 17s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-06: Canonical OG: migrate command                               | 2026-11-18T17:06:09.541Z | 2026-11-18T17:15:40.179Z | 9m 31s      | 9m 31s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-07: Canonical harness flows: launch, reindex-graph, patch apply | 2026-11-18T17:15:40.233Z | 2026-11-18T17:18:30.967Z | 2m 51s      | 2m 51s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-08: Canonical docs flow: writers, rules, templates              | 2026-11-18T17:18:31.013Z | 2026-11-18T17:20:17.462Z | 1m 46s      | 1m 46s | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-09: Implementation Harness E2E: follow the key rename           | 2026-11-18T17:20:17.516Z | 2026-11-18T17:22:17.614Z | 2m 0s       | 2m 0s  | 0s         | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-10: Release: commit, minor version stamp, patch prepare         | 2026-11-18T17:24:40.029Z | 2026-11-21T19:32:22.355Z | 74h 7m 42s  | 5m 18s | 74h 2m 24s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-11: This repo: patch apply                                      | 2026-11-21T19:32:22.404Z | 2026-11-21T19:47:07.888Z | 14m 45s     | 4m 52s | 9m 53s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-12: This repo: reindex-graph migration                          | 2026-11-21T19:47:07.942Z | unavailable              | unavailable | 3m 39s | 2m 3s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-13: Web Docs: nav and README links                              | unavailable              | unavailable              | unavailable | 0s     | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |
| step-14: Web Explorer: Dogfood page                                  | unavailable              | unavailable              | unavailable | 0s     | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |

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

### Step 1 — Tests: canonical OG cases for AC-1 to AC-8

Rewrote `canonical/docs/.og/cli.test.mjs`. The existing cases now follow the v1 contract: five edge types, `description`/`tags`, and `list --missing description,tags`. New cases cover AC-1 to AC-8: scope guard, prune safety, parser forms, golden round-trip, Prettier stability, `type` stamping, read-compat, schema states, config, `migrate` fixtures backed by git, and `check`. New symbols are reached through namespace imports, so a missing export fails only its own case, not the whole file. First run: 96 tests, 23 pass (unchanged behaviour), 73 fail for the expected reasons. An editor formatter rewrapped the file on save, which is why it is 1,491 lines.

### Step 2 — Canonical OG: scope guard and retirements

- `utils.mjs`: added `inScope` with the four rules and stable `Out of scope [<rule>]` messages. Split the walker into `walkMarkdownFiles` (raw) and `listMarkdownFiles` (in-scope only).
- `docs.mjs`: `assign` checks scope first. The `AppReadme` branch is removed. `pruneExcept` is replaced by `staleExcept` and `remove`, so the CLI can report before it deletes.
- `edges.mjs`: added `authoredTouching`.
- `cli.mjs`: `index` checks the edge type and the `--to` scope before `assign`. `reindex` returns `scopeViolations` and `orphanedAuthored`, and keeps the row of a reserved file that still carries its id.
- `constants.mjs`: `impl-to-readme`, `APP_README_PATTERN` and `TIER_COLORS.AppReadme` are removed. Added a static `TIER_NAMES` (planned for Step 4, needed by the AC-2 case) and a `RETIRED_EDGE_TYPE` constant for `migrate`.
- Result: 34 of 96 pass. All AC-1 and AC-2 cases pass except one that only needs the Step 3 parser.

### Step 3 — Canonical OG: frontmatter parser, B+ writer, type map

- `utils.mjs`: added the hand-written YAML-subset `parseFrontmatter`. It handles the BOM and CRLF, and reports an error per rejected key (with its file line) while keeping the other keys. Added `writeFrontmatter`: B+ order, Prettier-stable quoting (double quotes when the value contains `'`), number-like strings quoted, and long lists wrapped the way Prettier does. `readFrontmatter` and `writeAdditiveId` now sit on top of them.
- `constants.mjs`: added `TYPE_MAP`, `TYPE_FALLBACK`, `UNTIERED_TYPE` and `OKF_VERSION`.
- `docs.mjs`: added `typeFor` with glob matching. `assign({stampType})` is the `index --doc` path: it refuses unsupported YAML, naming the line, and stamps a missing `type`. Bulk runs write `id` only and return parse errors. Read-compat applies: `description ?? purpose`, `tags ?? keywords`.
- `reindex` reports `frontmatterErrors`.
- Steps 3 and 4 landed in the same edit, because both rewrite `DocsStore.assign`. Each step's cases were verified separately.
- Golden: 173 tagged docs round-trip. 41 wrapped lists that the old parser read as empty now parse non-empty; the design estimated about 50, and 41 is the current count. Only `docs/index.md`, which has nested YAML, is rejected.

### Step 4 — Canonical OG: schema v1, config, CLI renames

- `schema.mjs`: v1 DDL, `SCHEMA_VERSION = 1`, and the seven v0→v1 statements.
- `cli.mjs` `ensureSchema`:
  - A new DB is created at v1.
  - A v0 DB is copied to `docs-operational-graph.v0.bak.sqlite`, then migrated in one transaction. A failing statement rolls back and the error names it.
  - A DB newer than this OG is refused untouched.
- `docs.mjs`: `loadConfig` validates `productDir` (under `docs/`, not `docs/.og`, no overlap with another tier root) and reports `invalidConfig`. Tier roots match with a trailing `/`. `TIER_PATH_PREFIXES` is replaced by `TIER_ROOTS` plus the configured Product root.
- `index` refuses a path under an invalid `productDir`, naming `invalidConfig`. `reindex` reports `invalidConfig`.
- CLI renames: `list --missing description,tags`, and `search` and keyword-match use `tags`.
- Added canonical `docs/.og/gitignore` (no dot; see RF-005). The seed DB was regenerated at v1.

### Step 5 — Canonical OG: check command

- `cli.mjs` `check --dir`: reads files only; never writes or opens the DB.
  - `missingFields` (type, description, tags).
  - `brokenIndexEntries`: file-relative bullet targets that do not exist; external and site-absolute links are skipped.
  - `unlistedConcepts`: only in folders that have an `index.md`; the docs root is excluded.
  - `unversionedBundles`: present tier roots, with the Product root only when configured.
  - `frontmatterErrors` and `counts`.
  - Results are sorted, so the output is stable. `docs/index.md` is never reported.
- `utils.mjs`: added `parseIndexBullets`, `isContentBearing`, `resolveLink`, `linkTargetExists` and `encodeLinkPath`, shared with `migrate`.
- CLI usage now lists `check` and `migrate`.

### Step 6 — Canonical OG: migrate command

- `cli.mjs` `migrate --dir [--check] [--dry-run] [--allow-dirty]`. One `planMigration` drives all three modes, so `--check` pending, the `--dry-run` report and the real run's writes always agree. Steps, in the design order:
  1. Config from the stored answers: `.harness/state/answers.json` first, then `state/launch/`. Q10b Project-scoped or Q10c "none" gives `{}`. A Q10c value counts only when it names an existing folder.
  2. Index prose moves to `00 Overview.md`, which carries the old id. Navigation bullets follow: overview first, then concept docs in file-name order, without duplicates.
  3. `impl-to-readme` edges are re-typed to `references`, merging duplicates.
  4. Frontmatter is rewritten to B+, seeded from `git log --follow --format=%aI` (UTC `Z`, or now when a file has no history). Only OG-era docs are rewritten: those with `purpose`/`keywords`, no `type`, or template meta.
  5. OG keys are stripped from every `index.md` line by line. This doubles as the fallback for unparseable frontmatter.
  6. Bundle roots get `okf_version: '0.2'`.
  7. Stray ids outside `docs/` are removed via `git ls-files`.
  8. Reindex.
  9. Report.
- Safeguards: the clean check uses `git status -z` and covers `.md` under `docs/` (not `docs/.og/`) plus stray-id targets. `docs/index.md` is never touched. `pending` is recomputed after a real run.
- `edges.mjs`: added `counts()` and `retype()`. `utils.mjs`: added `isLinkBullet`, `isHeading` and `splitFrontmatter`. `docs.mjs`: `configFrom` was split out of `loadConfig`.
- Scratch dogfood run on a copy of this repo's `docs/` with `og.config.json`:
  - Exactly the design's 11 `00 Overview.md` pages were created, plus Stories and LLD bundle-root indexes.
  - Authored edges stayed at 217, with no merge and nothing orphaned. `docs/index.md` was unchanged and the stray README id was removed.
  - A second run after commit changed 0 files.
  - `check` showed 0 for every category except 31 missing descriptions, which Step 12's writer review will fill.
- Fix found in the scratch run: a blank line separated the overview bullet from the other bullets. Blank lines between bullets are now removed.
- Note for Step 12: the Engineering Guide index keeps its old section headings with nothing under them. This follows the design's rule ("keeps its headings and link bullets"); the writer review will tidy it.

### Step 7 — Canonical harness flows: launch, reindex-graph, patch apply

- `references/reindex-graph.md`:
  - Step 0 deploys `gitignore` as `.gitignore` and never copies over `og.config.json`.
  - New Step 0b: `migrate --check`, then the `missingConfig` prompt (folder or none), then the `invalidConfig` report, then dry-run summary and confirmation, then `migrate` (`--allow-dirty` only from launch). On exit 1 it stops and skips Step 1. On decline it still builds and checks, and reports "migration pending".
  - Step 1 lists the new build report keys and prints `check`.
  - 2a uses `list --missing description,tags`, the B+ keys and the `needsWriter` docs. On a refresh, 2a runs for those docs only.
  - Five edge types; completion evidence updated.
- `references/launch/02-launch-questions.md`: Q10c now asks for the folder path (or `none`) and says it becomes `productDir` (RF-017).
- `references/launch/01c-launch-docs.md`: new D.6 for the OKF layout: `og.config.json`, versioned bundle-root `index.md` files (Product only with a folder), section `index.md` without frontmatter, overview prose in `00 Overview.md`, and B+ for every launch doc. Projects with existing docs migrate via Reindex graph Step 0b.
- `references/launch/01d-launch-graph-verify.md`: greenfield expects `migrate --check` not pending. Brownfield gets the dry-run, confirmation and `--allow-dirty`. Evidence now includes the `check` counts.
- `references/launch/01b-launch-install.md` and `references/patch/05-patch-apply.md` apply `deployRenames`. Patch apply's report ends with "run reindex-graph next" when `docs/.og/` changed; apply never migrates.
- `canonical/manifest.json`: added `deployRenames` (`docs/.og/gitignore` → `docs/.og/.gitignore`). `scripts/lib/manifest.mjs` validates it as safe relative paths (RF-019).
- `cli.test.mjs`: two greenfield fixtures, `{}` and a `productDir`: zero `check` findings, 4 or 5 versioned roots, `migrate --check` not pending. Suite 98/98; `unit-cli` 44/44.

### Step 8 — Canonical docs flow: writers, rules, templates

- Canonical `Documentation/01 Principles.md`: the "Operational graph frontmatter" rule is now the B+ contract (key order, owners, `by` actors, UTC `Z`, quoting). Added rules for `index.md` as navigation (bundle root `okf_version`, bullets kept current, overview prose in `00 Overview.md`, root created with the first doc in a bundle, no `log.md`, `docs/index.md` excepted) and for template meta.
- Canonical `Lifecycles/05 Documents Flow.md`: the App README row says it is recorded in `2-report.md` with no graph edge. Added the archive frontmatter-only exception and a Navigation paragraph.
- Canonical `agents/docs-writer/TEMPLATE.md`: a "Frontmatter and navigation" paragraph.
- Templates: the six `.md` templates in design and dev keep their meta block and gain a second block with the new doc's B+ frontmatter (`type` from the type map, `process:<lifecycle>-<stage>` actors). Each copy step now says to drop the first block: dev context (report, plus the `Dev Intent` frontmatter for `0-intent.md`), dev plan, design context, frame, research and evaluate.
- dev `06-document.md` Step 4: three `impl-to-*` types; an app README update is recorded in the report only, with no `index` call. The delegation names B+ and `index.md` upkeep. design `09-publish.md` gains item 7 (B+ and `index.md` bullets).
- **Divergence from the plan, Terminology:** canonical `07 Terminology.md` stays an empty registry. Launch D.0 seeds it per project and skips seeding when rows exist, so shipping this repo's 7 OKF rows in canonical would block every new project's seeding. The terms stay in this repo's local registry (added at Publish). Raised at the Implement sign-off.

### Step 9 — Implementation Harness E2E: follow the key rename

- `scenarios/reindex-graph.ts`:
  - The grader asserts `description:`/`tags:` instead of `purpose:`/`keywords:`.
  - `seedMaterializedGraph` now deploys `gitignore` as `.gitignore`, writes `og.config.json` = `{}`, and gives both fixture docs B+ frontmatter (`type`, `title`, `generated`, `updated`; the reference target also has `description`/`tags`). `migrate --check` is therefore not pending, so the unattended agent run meets no Step 0b prompt (RF-007).
  - The new doc still lacks `description`/`tags`, so the agent's 2a pass is what the grader proves.
- `graders/docs-adoption.grader.ts`: `gradeDocsGraphAdopted` requires `docs/.og/.gitignore` and fails on a literal `docs/.og/gitignore`, plus a new spec case (RF-022).
- Results: typecheck passes, `unit` 319/319, `unit-cli` 44/44, `integration` 5/5. The live `agent-e2e` (reindex-graph and bootstrap) is the developer's, because it is guarded.
- Tech debt: TD-1 (`answers.json` path mismatch) and TD-2 (`cli.test.mjs` not in CI).
- Environment note: `yarn nx run … --skip-nx-cache` fails in Nx itself (`hashArray is not a function` under WASI) on this machine. Runs without the flag work.

### Step 10 — Release: commit, minor version stamp, patch prepare

- Commit 1 is `88ddcf5`. `v4.1.0` was present locally. `yarn harness:version` stamped 4.2.0, and `version-harness.mjs --check` exits 0. Commit 2 is `63bf14e chore(harness-release): 4.2.0`.
- `patch prepare` made bundle `6ceda622-d5e0-4df0-bc91-395f67ead813` with 49 updates and 1 add (`canonical/docs/.og/gitignore`): 26 mapped and 24 canonical-only. It requires `e2e05348`.
- **Wider than this story:** 4.0.x and 4.1.0 shipped without bundles, so the recorded checkpoints were older than them. Prepare packages every direct canonical edit since the checkpoint, so the bundle also carries those earlier edits. Every base came from `state/objects/` or this repo's git history. Every diff reproduces its `after_sha256`.
- The binary seed `docs-operational-graph.sqlite` is excluded as unresolved, because the bundle format has text diffs only. Launch copies the seed directly.

### Step 11 — This repo: patch apply

- Baseline with the old OG: after a fresh v0 `build`, 205 docs, 217 authored edges and 784 derived edges. Authored by type: references 132, impl-to-lld 20, story-to-hld 19, story-to-product 16, impl-to-hld 15, impl-to-engineering-guide 13, impl-to-readme 2. Derived by type: keyword-match 771, mirrors-consistent 9, mirrors-gap 4. The fresh build added an `id` to the 19 docs of this story's design folder and `impl/`.
- Scope was the `claude` provider only. Each output was merged three-way from its last rendered canonical base, the permanent file and the new canonical file, all rendered with this repo's inferred values (for example `.claude/skills` and `/`). 21 outputs merged cleanly. The OG modules are byte-identical to canonical.
- Five conflicts were resolved by hand. The kept local text is recorded as a retained customization in `index.json`:
  - `04 AI Coding Tool Compatibility.md`: kept the local text.
  - `Lifecycles/00 Overview.md`: kept the local frontmatter, which `migrate` rewrites.
  - `Documentation/01 Principles.md`: the OKF frontmatter, `index.md` and Templates rules come from canonical. The paragraphs this repo had already dropped stay dropped.
  - `05 Documents Flow.md`: only the App README row comes from canonical.
  - `design/09-publish.md`: item 7 comes from canonical.
- `docs/.og/gitignore` was deployed as `docs/.og/.gitignore`. The tier sync now uses `TIER_NAMES`, and Graph Explorer has no AppReadme tier.
- Checks:
  - `diff -rq` shows only the allowed differences.
  - The `.gitignore` and `check-ignore` check exits 0.
  - `web-docs:build` passes. The live DB is now schema v1, with the backup ignored and 205 docs and 217 authored edges unchanged.
  - Derived edges went from 784 to 1406, because the new parser reads wrapped `tags` lists the old one saw as empty (see Step 3).
- The operation record is `9d142ad8`, with an `APPLIED.md` row. OG changed, so `reindex-graph` is next (Step 12).

### Step 12 — This repo: reindex-graph migration

- `migrate --check` reported `missingConfig`, so I wrote `docs/.og/og.config.json` as `{ "productDir": "docs/Harness" }`. Before the real run, I ran `migrate` on a throwaway worktree of `HEAD` to preview the dry run's 220 files. The developer confirmed ("yes migrate please").
- `migrate` result:
  - 220 files changed.
  - Docs 205 → 205 and authored edges 217 → 217, against the Step 11 baseline. The 2 `impl-to-readme` edges became `references` (132 → 134), with nothing merged or orphaned.
  - Derived edges 1406 → 1429.
  - 11 new `00 Overview.md` pages, plus the HLD root overview. New bundle-root `index.md` files for Stories and LLD.
  - Stray ids removed from `CLAUDE.md`, `README.md` and `apps/web-explorer/README.md`.
  - `docs/index.md` is identical to `main`.
- Writer review (`@docs-writer`):
  - Filled `description`/`tags` in the 31 listed docs, frontmatter only.
  - Tidied the Engineering Guide, Harness, Harness Explore, Quick Start, Distribution and HLD indexes, which had empty headings left over from the old prose.
  - The two `.harness/evolve/` candidate copies were flagged "OG id outside docs/ left in place" by design and left alone.
- The writer review found TD-3: `migrate` kept `#` comments from a code block as headings. It also found TD-4: overview bullet titles don't follow the title rule.
- Checks: `build` passes. `check` reports zero in every category. `migrate --check` reports `pending: false`. The graduation edges now point at the overview pages: HLD has 3, Engineering Guide 2, and the Harness overviews 5 `story-to-product` edges plus `references`.

## Tech Debt

| #    | Description                                                                                                                                                                                                                    | Type    | Tracker | Finding | Owner               | Next action                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ------- | ------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| TD-1 | Launch and patch-state references name `.harness/state/launch/answers.json`, but this repo keeps answers at `.harness/state/answers.json`. `migrate` reads both, so nothing breaks, but the docs and the state layout disagree | cleanup | —       | —       | Harness maintainers | Pick one path; update `01a-launch-plan.md`, `06-patch-state.md` and any writer, or move the file                        |
| TD-2 | Canonical `docs/.og/cli.test.mjs` (98 cases) runs only by hand; no Nx target or CI workflow runs it                                                                                                                            | cleanup | —       | —       | Harness maintainers | Add an Nx target (e.g. `implementation-harness:og-test`) and call it from `ci-harness.yml`                              |
| TD-3 | `migrate` keeps heading-like lines from index prose without tracking code fences (`cli.mjs:722`), so a `#` bash comment inside a fenced block survives as an empty heading in the new `index.md`                               | cleanup | —       | —       | Harness maintainers | Track fences in the index-strip filter, add a `cli.test.mjs` fixture with a fenced `#` comment, ship in a patch release |
| TD-4 | `migrate` writes overview bullets as "X Overview", while the doc's `title` is "X" and the Principles rule says bullets use the doc's title                                                                                     | cleanup | —       | —       | Harness maintainers | Decide tool vs rule; align `migrate` or the Principles wording                                                          |

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
