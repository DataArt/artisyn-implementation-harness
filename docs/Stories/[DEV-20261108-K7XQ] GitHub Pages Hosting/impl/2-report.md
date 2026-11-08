---
id: fa3c14be
name: Dev Report Template
description: Template for 2-report.md — the living implementation report created by /dev context and updated throughout the dev lifecycle
type: reference
---

# DEV-20261108-K7XQ: GitHub Pages Hosting — Report

| Field  | Value                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Ticket | DEV-20261108-K7XQ                                                                                              |
| Branch | `feat/dev-20261108-k7xq-github-pages-hosting`                                                                  |
| PR     | —                                                                                                              |
| Author | Anton Merkulov                                                                                                 |
| Status | 🔄 In Progress                                                                                                 |
| Phase  | 🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test 🔄 · 📝 Document ⏳ · 🏁 Completion ⏳ |

## Progress

| #   | Step                                         | Status     | Notes                                                                                                                                                                                                                  | Test | Docs |
| --- | -------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | Tests: skipped (no test setup)               | ⏭️ Skipped |                                                                                                                                                                                                                        | —    | —    |
| 2   | Web: VitePress base path & base-aware assets | ✅ Done    | Build + typecheck + lint green; favicon hrefs and WASM fetch confirmed base-prefixed in `dist/`                                                                                                                        |      |      |
| 3   | Web: CSP meta tag                            | ✅ Done    | CSP tag confirmed byte-exact in built HTML; live browser check by developer confirms no console violations, Graph Explorer renders, giscus loads                                                                       |      |      |
| 4   | CI/CD: GitHub Pages deploy workflow          | ✅ Done    | `cd.yml` rewritten with real deploy-pages job; YAML valid; `site:build --configuration=ci` verified; repo variables confirmed set via `gh variable list`. Live deploy run is AC-6, deferred to Test stage (post-merge) |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 14m 38s · Wait: 22m 5s · Unclassified: 1m 48s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags           |
| ---------- | ------------------------ | ------------------------ | ----------- | ------ | ------ | ------------ | ------------- | ------------------- | -------- | ------------- | --------------- |
| context    | 2026-11-08T19:57:20.224Z | 2026-11-08T20:07:31.995Z | 10m 12s     | 35s    | 9m 36s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| ceremony   | 2026-11-08T20:07:38.060Z | 2026-11-08T20:09:14.772Z | 1m 37s      | 4s     | 1m 33s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| plan       | 2026-11-08T20:09:20.944Z | 2026-11-08T20:20:10.144Z | 10m 49s     | 5m 37s | 5m 13s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| implement  | 2026-11-08T20:20:16.346Z | unavailable              | unavailable | 8m 22s | 5m 43s | unavailable  | unavailable   | from_tracking_start | 1        | 1             | ⚠️ failed check |
| test       | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —               |
| document   | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —               |
| completion | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —               |

Quality (recorded inventory): findings 2 · open 0 · PR findings 0 · critical 0 · debt 0 · tests written unavailable · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 14m 38s · Wait: 22m 5s · Unclassified: 1m 48s

| Step                                                   | Started (UTC)            | Completed (UTC)          | Elapsed | Work   | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags           |
| ------------------------------------------------------ | ------------------------ | ------------------------ | ------- | ------ | ------ | ------------ | ------------- | ------------------- | -------- | ------------- | --------------- |
| step-1: Tests: skipped (no test setup)                 | 2026-11-08T20:20:30.717Z | 2026-11-08T20:20:39.468Z | 9s      | 9s     | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| step-2: Web: VitePress base path and base-aware assets | 2026-11-08T20:20:43.249Z | 2026-11-08T20:23:03.529Z | 2m 20s  | 2m 20s | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 1             | ⚠️ failed check |
| step-3: Web: CSP meta tag                              | 2026-11-08T20:23:20.806Z | 2026-11-08T20:32:11.076Z | 8m 50s  | 4m 43s | 4m 7s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| step-4: CI/CD: GitHub Pages deploy workflow            | 2026-11-08T20:32:50.196Z | 2026-11-08T20:35:22.200Z | 2m 32s  | 56s    | 1m 36s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |

<!-- dev-metrics-step:end -->

## Review Findings

| ID     | Stage     | Origin                | Kind   | Deviation type | Severity | Classification | Finding                                                                                                                                                                                                                                                                                                                      | Evidence                                                                                                                   | Resolution | TD  | Decision                                                                                                       |
| ------ | --------- | --------------------- | ------ | -------------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | --- | -------------------------------------------------------------------------------------------------------------- |
| RF-001 | plan      | plan-audit            | design | —              | low      | advisory       | Plan Step 4's job-level `permissions` block specified only `pages: write, id-token: write`; job-level `permissions` replaces (not merges with) the workflow-level block, so `actions/checkout` would run with `contents: none`                                                                                               | @architect audit of 1-plan.md Step 4 / AC-4 vs GitHub's documented Pages-deploy permission set                             | fixed      | —   | Auto-applied, no scope change — added `contents: read` to Step 4's `permissions` block and AC-4 in `1-plan.md` |
| RF-002 | implement | implementation-review | bug    | —              | medium   | pre-existing   | `GiscusComments.vue`'s `GISCUS_CATEGORY` was hardcoded `'ADLC Comments'`, not matching the repo's actual Discussions category name `'Web Comments'` (same `data-category-id` though) — pre-existing, unrelated to this ticket's changes, surfaced only because this ticket's live CSP verification required loading the page | `gh api graphql` listing of repo Discussion categories vs `GiscusComments.vue`; developer live-confirmed working after fix | fixed      | —   | Fixed inline, blocking Step 3's live verification — changed `GISCUS_CATEGORY` to `'Web Comments'`              |

<!-- One row per underlying issue; see patterns/review-gate.md. Empty means no recorded findings, not proof of review. -->

## Implementation Notes

### Step 2 — Web: VitePress base path & base-aware assets

Set `base` in `config.ts`, interpolated the favicon `link` href and the inline social-link SVG's `da-favicon.png` href, and switched `GraphExplorer/script.ts`'s WASM-db fetch from a hardcoded absolute path to `import.meta.env.BASE_URL`. That last change failed `site:typecheck` (`Property 'env' does not exist on type 'ImportMeta'`) — root cause: `apps/docs-web/tsconfig.json`'s `types` array was `["node"]` only, excluding Vite's ambient `ImportMeta.env` types. Fixed by adding `vite/client` to `types`; re-ran typecheck, passed. Not in the original plan step's file list, but required for the plan's own change to typecheck — small, mechanical, no scope change.

### Step 3 — Web: CSP meta tag

Added the CSP meta tag to `config.ts` `head`; byte-exact match confirmed in built HTML on both the homepage and the Graph Explorer page. Live browser verification surfaced two real, pre-existing issues unrelated to the CSP change itself:

- **Graph Explorer initially appeared blank** in the developer's first check. Static checks (sqlite present in `dist/`, served correctly at the base-prefixed path, CSP permissive enough, fetch code correct) found nothing wrong. After the giscus fix below and a rebuild, the developer confirmed it renders correctly — root cause never conclusively isolated (possibly transient, or resolved by the same rebuild/restart that picked up the giscus fix), but resolved per live confirmation.
- **Giscus widget appeared disabled.** Diagnosed via `gh api graphql`: the repo's actual Discussions category is named "Web Comments" (id `DIC_kwDOT7pBZ84DDmbz`), but `GiscusComments.vue` hardcoded `data-category` as `'ADLC Comments'` — a name/id mismatch, pre-existing, not introduced by this ticket. Fixed `GISCUS_CATEGORY` to `'Web Comments'`. Rebuilt and restarted the local preview; developer confirmed giscus now loads correctly (the two 404s + "Discussion not found" console messages seen afterward are giscus's normal first-load behavior for a page with no comments yet, not an error).

### Step 4 — CI/CD: GitHub Pages deploy workflow

Rewrote `cd.yml`'s `deploy` job: build step (`yarn nx run site:build --configuration=ci`, `VITE_*` from `${{ vars.* }}`), `configure-pages`, `upload-pages-artifact` (`apps/docs-web/.vitepress/dist`), `deploy-pages`. Job-level `permissions: {contents, pages, id-token}` per RF-001's fix, `environment: github-pages`, top-level `concurrency: {group: "pages", cancel-in-progress: false}`. Verified YAML validity (`js-yaml`) and that the exact build command succeeds with repo-var-style env. Developer set the four repository variables (`gh variable set`); confirmed via `gh variable list`. The live `deploy-pages` run itself (AC-6) can only be exercised after this branch merges to `main` — deferred to Test stage, as the plan specified.

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
