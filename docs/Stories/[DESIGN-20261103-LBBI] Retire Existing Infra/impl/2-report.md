---
id: 6192e133
name: Dev Report
description: Implementation report for retiring existing AWS infra (Efforts.md item 5 of the GitHub Pages migration design)
type: reference
---

# DESIGN-20261103-LBBI: Retire Existing Infra — Report

| Field  | Value                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261103-LBBI                                                                                           |
| Branch | `docs/design-20261103-lbbi-github-pages-migration`                                                             |
| PR     | —                                                                                                              |
| Author | Anton Merkulov                                                                                                 |
| Status | 🔄 In Progress _(→ ✅ Complete, set by Completion)_                                                            |
| Phase  | 🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ · 🏁 Completion 🔄 |

## Progress

| #   | Step                                                          | Status  | Notes                                                               | Test | Docs |
| --- | ------------------------------------------------------------- | ------- | ------------------------------------------------------------------- | ---- | ---- |
| 1   | Tests: skipped                                                | ✅ Done | No test setup for this layer                                        | —    | —    |
| 2   | Auth: delete the Auth container                               | ✅ Done | `apps/lambda-auth/` + `scripts/ci/lambda-auth-build.sh` deleted     | ✅   | —    |
| 3   | Infra: delete the Infrastructure container                    | ✅ Done | `apps/infra/` deleted; `docUrl.ts`'s example path fixed             | ✅   | —    |
| 4   | Web: stub AWS-specific nx targets                             | ✅ Done | 5 targets stubbed; site-deploy.sh deleted; site-build.sh simplified | ✅   | —    |
| 5   | CI: strip AWS auth and env from ci.yml                        | ✅ Done | aws-auth step, AWS env vars, id-token permission removed            | ✅   | —    |
| 6   | CD: stub cd.yml, delete the now-unused auth action            | ✅ Done | aws-auth action deleted; cd.yml's AWS job content stubbed in place  | ✅   | —    |
| 7   | Harness governance: retire the @auth/@infra agent definitions | ✅ Done | Agent files deleted; CLAUDE.md's stale rows/lines fixed             | ✅   | —    |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 42m 44s · Wait: 13m 22s · Unclassified: 24m 10s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------- | ------------------------ | ------------------------ | ----------- | ------- | ------ | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| context    | 2026-11-03T15:41:31.394Z | 2026-11-03T15:49:21.854Z | 7m 50s      | 2m 17s  | 5m 33s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| ceremony   | 2026-11-03T15:49:21.897Z | 2026-11-03T15:52:37.129Z | 3m 15s      | 1m 23s  | 1m 52s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| plan       | 2026-11-03T15:52:37.190Z | 2026-11-03T16:10:04.535Z | 17m 27s     | 15m 41s | 1m 47s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| implement  | 2026-11-03T16:10:04.583Z | 2026-11-03T16:29:14.821Z | 19m 10s     | 16m 30s | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| test       | 2026-11-03T16:29:14.865Z | 2026-11-03T16:40:17.261Z | 11m 2s      | 6m 53s  | 4m 10s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| document   | 2026-11-03T16:40:17.311Z | unavailable              | unavailable | 0s      | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| completion | unavailable              | unavailable              | unavailable | 0s      | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —     |

Quality (recorded inventory): findings 8 · open 0 · PR findings 2 · critical 0 · debt 7 · tests written 0 · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 42m 44s · Wait: 13m 22s · Unclassified: 24m 10s

| Step                                                                   | Started (UTC)            | Completed (UTC)          | Elapsed | Work   | Wait | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------------------------------------------------------------------- | ------------------------ | ------------------------ | ------- | ------ | ---- | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| step-01: Tests: skipped                                                | 2026-11-03T16:10:49.072Z | 2026-11-03T16:10:57.936Z | 9s      | 9s     | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-02: Auth: delete the Auth container                               | 2026-11-03T16:11:06.375Z | 2026-11-03T16:12:03.874Z | 57s     | 57s    | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-03: Infra: delete the Infrastructure container                    | 2026-11-03T16:12:30.623Z | 2026-11-03T16:13:20.547Z | 50s     | 50s    | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-04: Web: stub AWS-specific nx targets                             | 2026-11-03T16:13:41.107Z | 2026-11-03T16:15:46.973Z | 2m 6s   | 2m 6s  | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-05: CI: strip AWS auth and env from ci.yml                        | 2026-11-03T16:16:24.242Z | 2026-11-03T16:17:48.595Z | 1m 24s  | 1m 24s | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-06: CD: stub cd.yml, delete the now-unused auth action            | 2026-11-03T16:18:06.844Z | 2026-11-03T16:18:57.733Z | 51s     | 51s    | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-07: Harness governance: retire the @auth/@infra agent definitions | 2026-11-03T16:19:19.890Z | 2026-11-03T16:21:29.347Z | 2m 9s   | 2m 9s  | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |

<!-- dev-metrics-step:end -->

## Review Findings

| ID     | Stage    | Origin          | Kind | Deviation type | Severity | Classification | Finding                                                                                                                                                                                                                                                                                                                                                                                           | Evidence                                                                       | Resolution | TD   | Decision                                                                                                                               |
| ------ | -------- | --------------- | ---- | -------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| RF-001 | plan     | plan-audit      | docs | —              | low      | introduced     | Step 7's `CLAUDE.md` verification grep was case-sensitive and missed 3 lowercase stale references (lines 15, 30, 38) that contradict the already-published HLD (no auth gate, no CDK infra)                                                                                                                                                                                                       | `1-plan.md` Step 7 as originally written; @architect plan audit                | fixed      | —    | Expanded Step 7's Changes to cover lines 15/30/38 and made the verification grep case-insensitive (`grep -ni`); AC-10 updated to match |
| RF-002 | plan     | plan-audit      | docs | —              | info     | introduced     | "Planning decisions" prose referenced "(Step 3)/(Step 4)" but the actual Steps list numbers them 4/5 after Step 1 (tests: skipped) was inserted                                                                                                                                                                                                                                                   | `1-plan.md` "Planning decisions" bullet 1 vs Steps 4-5                         | fixed      | —    | Corrected the labels to "(Step 4)/(Step 5)"                                                                                            |
| RF-003 | plan     | plan-audit      | docs | —              | low      | introduced     | RF-001's `grep -ni` fix was itself unsatisfiable: it matches the substring "auth" inside "author"/"authoring" in the untouched `@architect`/`@docs-writer` rows (CLAUDE.md:78-79), so Step 7's verification could never pass even after all described edits land                                                                                                                                  | `1-plan.md` Step 7 verification (2nd audit round); @architect round-2 re-audit | fixed      | —    | Switched to word-boundary `grep -nwi "auth\|infrastructure"`; AC-10 reworded to state the deliberate author/authoring exclusion        |
| RF-004 | test     | pr-review       | docs | —              | low      | pre-existing   | `apps/docs-web/.env.example` still declares `AWS_REGION`/`S3_BUCKET_NAME`/`CF_DISTRIBUTION_ID` under a comment claiming they're "loaded by NX via envFile" for `deploy` — no longer true now that `deploy` is a stub with no `envFile`/`configurations` block                                                                                                                                     | `@web` PR-review report, Step 3                                                | fixed      | TD-4 | Initially deferred as TD-4, then fixed at the developer's request during Document stage — stale vars/comment removed                   |
| RF-005 | test     | pr-review       | docs | —              | low      | pre-existing   | `.claude/agents/architect.md`, `web.md`, `onboarding.md`, and top-level `README.md` still reference the deleted `apps/infra`/`apps/lambda-auth` paths and the now-nonexistent `infra:synth` target — not covered by this ticket's plan (only `auth.md`/`infra.md`/`CLAUDE.md` were scoped)                                                                                                        | `@architect` PR-review audit, Step 3 (Gap 1)                                   | fixed      | TD-5 | Initially deferred as TD-5, then fixed at the developer's request during Document stage — all 4 files swept clean                      |
| RF-006 | document | doc-consistency | docs | —              | high     | introduced     | `docs/Engineering Guide/07 Branching Strategy.md` was marked "done" in the Documentation table but the `@docs-writer` delegation only fixed 2 specific links — it missed 4 sections (Environment Mapping, CI/CD by Branch, Branch Protection, Rollback Strategy) still describing `nx affected --target=deploy`, `CiReadRole`/`DeployRole` OIDC roles, and auto-deploy — all removed by Steps 5-6 | `@architect` doc-consistency review, round 1                                   | fixed      | —    | Rewrote all 4 sections to describe the actual no-op `cd.yml` stub and role-free `ci.yml`                                               |
| RF-007 | document | doc-consistency | docs | —              | medium   | introduced     | `docs/Engineering Guide/index.md`'s prose (line 13) still linked to the just-deleted `Infrastructure/00 Configuration & Secrets.md` and described the Infrastructure section as "deploy-related operational runbooks" — only the table rows were fixed in the original delegation, not this sentence                                                                                              | `@architect` doc-consistency review, round 1                                   | fixed      | —    | Reworded to point at the remaining `04 Giscus Setup.md` and describe the section accurately                                            |
| RF-008 | document | doc-consistency | docs | —              | low      | introduced     | `docs/Engineering Guide/Infrastructure/04 Giscus Setup.md` (out of this ticket's original 15-doc list) had a dangling reference to the deleted `03 CI-CD Pipeline.md` and a stale "push to SSM and redeploy" instruction, caused directly by Steps 4/6's deletions                                                                                                                                | `@architect` doc-consistency review, round 1                                   | fixed      | —    | Reworded Step 5 to instruct editing `.env.dev`/`.env.prod` directly; noted the stubbed state of `site:deploy`/`env-push`/`env-pull`    |

<!-- One row per underlying issue; see patterns/review-gate.md. Empty means no recorded findings, not proof of review. -->

## Implementation Notes

### Step 1 — Tests: skipped

Confirmed no test setup exists for the touched layers; skipped per plan.

### Step 2 — Auth: delete the Auth container

Deleted `apps/lambda-auth/` (git-tracked files via `git rm -r`, plus gitignored `dist/`/`node_modules/` via `rm -rf`) and `scripts/ci/lambda-auth-build.sh`. `yarn nx show projects` confirms `lambda-auth` is gone. The plan's grep-for-no-matches check on `lambda-auth-build.sh` turned up 3 non-functional mentions (this plan file, an unrelated archived story, and the LLD Auth overview already flagged for later Document-stage retirement) — no live consumer remains, so the step's intent is satisfied even though the literal grep isn't empty.

### Step 3 — Infra: delete the Infrastructure container

Deleted `apps/infra/` entirely (git-tracked files via `git rm -r`, no gitignored build output present). Fixed `docUrl.ts`'s doc comment, which used `apps/infra/README.md` as its illustrative example — swapped to `apps/harness-bootstrap-e2e/README.md`. `yarn nx show projects` confirms `infra` is gone. Remaining `git grep` hits for `apps/infra/README` are a frozen historical e2e test-run log, this plan file, and an archived unrelated story's report quoting the old comment — no live code references the deleted path.

### Step 4 — Web: stub AWS-specific nx targets

Stubbed `deploy`, `env-push`, `env-pull`, `sm-push`, `sm-pull` in `apps/docs-web/project.json` — each now runs `echo "{target} retired — see solution/Architecture.md ..." && exit 0`, with their AWS-specific `envFile`/`env`/`configurations` blocks dropped. Deleted `scripts/ci/site-deploy.sh` (no longer called). Simplified `scripts/ci/site-build.sh` to drop the SSM-loading `load_env` function entirely. Note: the plan's verification commands referenced the project as `docs-web:deploy`/`docs-web:build`, but the actual nx project name (per `project.json`'s own `"name"` field) is `site` — ran `yarn nx run site:deploy` (prints the stub message, exits 0) and `yarn nx run site:build` (succeeds, builds the full VitePress site in 13.69s) instead; both pass. Logged TD-1: `scripts/local/{env-push,env-pull,sm-push,sm-pull}.sh` and their `nx.json` `targetDefaults` entries are now fully orphaned (no project references them) — out of this step's literal scope, flagged for a follow-up.

### Step 5 — CI: strip AWS auth and env from `ci.yml`

Removed the `./.github/actions/aws-auth` step and its `with:` block, the `AWS_REGION`/`SITE_SSM_ENV_PARAM`/`LAMBDA_AUTH_SSM_ENV_PARAM` env vars, and the top-level `permissions: id-token: write` (kept `contents: read`). `environment: dev` left untouched — not AWS-specific, may still gate other protections. YAML parses clean; `yarn nx affected --target=build --uncommitted` (CI's own build step, run against the actual uncommitted changes rather than the plan's `HEAD~1`/`HEAD` which wouldn't see uncommitted work) succeeds for `site`.

### Step 6 — CD: stub `cd.yml`, delete the now-unused auth action

Stubbed `cd.yml`'s AWS job content in place (kept the file and the `deploy` job's name/trigger/`environment: dev` as the skeleton for a later GitHub Pages deploy job): removed `permissions: id-token: write`, the `env:` block's 3 AWS vars, and the `aws-auth` step; replaced `Deploy affected`'s AWS command with an `echo ... && exit 0` stub. Deleted `.github/actions/aws-auth/` entirely (no reuse value for GitHub Pages deploy). Caught myself initially also dropping `environment: dev` from `cd.yml`, which wasn't in the plan's Changes list — restored it before verifying, to stay within scope discipline. YAML parses clean; grep confirms no AWS reference remains; the stub's exact shell command runs clean standalone.

### Step 7 — Harness governance: retire the `@auth`/`@infra` agent definitions

Deleted `.claude/agents/auth.md` and `.claude/agents/infra.md`. Fixed `CLAUDE.md`: dropped the `Auth`/`Infrastructure` container rows and reworded the Web row/data-flow sentence to describe GitHub Pages (mirroring the already-published `System Overview.md`); dropped `yarn nx run infra:provision` from the guarded-commands example (kept `cdk deploy`/`git push` per plan); reworded the NFR "key constraint" line to state there's no access gate. Dropped the `@auth`/`@infra` rows from the Agents table. One rework mid-step: my first wording of the "no auth gate" sentence still contained the word "auth," which `grep -nwi` correctly flagged against itself — reworded to "no access gate" to actually satisfy AC-10, not just its intent. Found two items beyond this step's scope while reading context, logged as TD-2 (stale "engagement" framing in `System Overview.md`, not a CLAUDE.md file) and TD-3 (a real sequencing problem: deleting `apps/infra/` now means the later AWS-teardown ticket can't use `cdk destroy` — it'll need `aws cloudformation delete-stack` instead).

### Document stage

Step 2's deviation audit reused the Test-stage `@architect` PR-review audit rather than re-running an identical check (go verdict, 12/12 checks). Step 3's doc-impact list grew to 15 docs (6 retired, 9 updated) once the ripple effect of retiring 4 whole Engineering Guide docs was traced through their cross-references (`index.md`, `07 Branching Strategy.md`, `06 MCP Setup.md`, `docs/README.md`) plus the HLD's own citation of one of them. Delegated the full list to `@docs-writer` in one call; it couldn't perform the 6 deletions itself (no Bash/delete tool in its toolset) — I did those directly. The consistency review (Step 5) found that `@docs-writer`'s delegation had marked `07 Branching Strategy.md` and `index.md` "done" without actually fixing everything stale in them (RF-006, RF-007), plus one directly-caused dangling reference outside the original 15-doc list (`04 Giscus Setup.md`, RF-008) — fixed all three directly myself rather than re-delegating, for efficiency; a second review round confirmed all three clean with no new contradictions. Two more pre-existing, unrelated staleness items surfaced during review (TD-6, TD-7) and were initially deferred, same as TD-5. `quality validate` passed clean after closing the ledgers.

Developer then asked to fix all deferred tech debt rather than leave it deferred. Resolved TD-1 (deleted the 4 orphaned `scripts/local/*.sh` files and their `nx.json` `targetDefaults` entries; confirmed `apps/docs-web`'s own stub override still works standalone), TD-2 (reworded `System Overview.md`'s Purpose line), TD-4 (cleaned stale AWS vars from `.env.example`/`.env.dev`), TD-5 (swept all 4 remaining agent/README files: `architect.md`'s layer-mapping table and dead cross-layer import checks, `web.md`'s role description and guarded-command list, `onboarding.md`'s component list/table, root `README.md`'s repository-structure table), and TD-6 (corrected `Web.md`'s nav-item-count claim from "five" to "8" in both occurrences, matching the LLD and the code). TD-3 stays as recorded — it's knowledge for a future ticket's plan, not a current code change, so there's nothing to fix now. TD-7 turned out to be a misdiagnosis on closer read: the `@infra` reference in `docs/Harness/04 Adoption/03 Development Phase.md` is generic harness-adoption documentation illustrating a _different_ example project's stack (React/NestJS/ECS/RDS), not a claim about this repo's own containers — closed as not-applicable rather than fixed. Re-ran `yarn nx run-many --target=build,typecheck,lint --all` after all fixes — still green.

## Tech Debt

| #    | Description                                                                                                                                                                                                                                                                                                                 | Type       | Tracker | Finding | Owner     | Next action                                                                                                                                                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TD-1 | `scripts/local/{env-push,env-pull,sm-push,sm-pull}.sh` and their `nx.json` `targetDefaults` entries become fully orphaned once `apps/docs-web`'s matching targets are stubbed in Step 4 — no project references them anymore                                                                                                | cleanup    | —       | —       | Developer | **Resolved** — scripts deleted, `nx.json` `targetDefaults` entries removed; `yarn nx run site:env-push` confirmed still working via `apps/docs-web/project.json`'s own stub override                                                      |
| TD-2 | `docs/Target Architecture (HLD)/v1/System Overview.md`'s Purpose line still says "the DataArt × DataArt engagement" — same mischaracterization flagged and fixed in `design/00 Frame.md` during the design phase, but this HLD doc wasn't in scope for that fix or for this ticket's Step 7 (CLAUDE.md only)                | cleanup    | —       | —       | Developer | **Resolved** — reworded to "open-sourced via GitHub Pages"                                                                                                                                                                                |
| TD-3 | `solution/Architecture.md`'s Decommission section says the later teardown ticket should run `cdk destroy` against `DocsStack`/`EdgeStack`/`CiStack` — but Steps 2-3 of this ticket delete `apps/infra/` (the CDK app) entirely, so the CDK CLI will have no app/`cdk.json` to run against by the time that teardown happens | dependency | —       | —       | Developer | **Not fixable now** — this is knowledge for a future ticket, not a current code change; carried forward as-is: use `aws cloudformation delete-stack --stack-name <name>` instead of `cdk destroy` when that ticket's plan is written      |
| TD-4 | `apps/docs-web/.env.example` still declares `AWS_REGION`/`S3_BUCKET_NAME`/`CF_DISTRIBUTION_ID` under a stale "loaded by NX via envFile" comment for the now-stubbed `deploy` target; `build`/`serve` still load `.env.dev`/`.env.prod` via `envFile`, so these vars linger as dead config there too                         | cleanup    | —       | RF-004  | Developer | **Resolved** — stale vars/comment removed from `.env.example` and `.env.dev`                                                                                                                                                              |
| TD-5 | `.claude/agents/architect.md`, `web.md`, `onboarding.md`, and top-level `README.md` still reference the deleted `apps/infra`/`apps/lambda-auth` paths and the now-nonexistent `infra:synth` nx target                                                                                                                       | cleanup    | —       | RF-005  | Developer | **Resolved** — all 4 files swept: layer-mapping tables fixed, dead cross-layer import checks removed, onboarding checklist/table fixed, repo-structure table fixed; `yarn nx run-many --target=build,typecheck,lint --all` still passes   |
| TD-6 | `docs/Target Architecture (HLD)/v1/Containers/Web.md` (lines 67-69, 83) describes nav as "five fixed items, one per top-level `docs/` section" — pre-existing drift (not caused by this ticket), actual code/LLD show 8 Harness-subsection + Security Scan entries                                                          | cleanup    | —       | —       | Developer | **Resolved** — both occurrences corrected to "8 fixed items", matching the LLD and the code                                                                                                                                               |
| TD-7 | `docs/Harness/04 Adoption/03 Development Phase.md:74` still lists `@infra` as an active agent mapped to `apps/infra/` — `.claude/agents/infra.md` no longer exists                                                                                                                                                          | cleanup    | —       | —       | Developer | **Not applicable** — on closer read this is generic harness-adoption documentation for a _different_ example project (React/NestJS/ECS/RDS stack), not a claim about this repo's own containers; no fix needed, closing as a misdiagnosis |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Tracker: fill in once a task is created (e.g. ND-XX), otherwise —
Rows are added here by the Implement stage (references/04-implement.md, tech debt while working on a step) as debt is discovered.
-->

## Test Results

| Project               | Build | Tests | Typecheck | Lint | Written | Passed | Failed | Skipped | Evidence                                                            |
| --------------------- | ----- | ----- | --------- | ---- | ------- | ------ | ------ | ------- | ------------------------------------------------------------------- |
| site                  | ✅    | —     | ✅        | ✅   | 0       | —      | —      | —       | `yarn nx run-many --target=build,typecheck,lint --all`              |
| harness-bootstrap-e2e | —     | ✅    | ✅        | ✅   | 0       | 143    | 0      | 0       | `yarn nx run harness-bootstrap-e2e:test` (unit 138 + integration 5) |

<!-- One row per non-overlapping project/suite scope, updated to its latest run.
Written = new test cases in this change, not files/assertions. Passed/Failed/Skipped
= latest runner case counts. Use unavailable when unknown, never infer counts from
exit status. Explicit 0 requires evidence; — is not measured. Evidence links runner
output and the diff supporting Written. Historical failed runs remain in stat.checks.
-->

## Documentation

| Doc / section                                                               | Tier        | Action  | Why                                                                                                                                                                              | Done |
| --------------------------------------------------------------------------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `docs/System Architecture (LLD)/Auth/00. Overview.md`                       | LLD         | retired | Auth container deleted (Step 2); no code left to describe                                                                                                                        | ✅   |
| `docs/System Architecture (LLD)/Infrastructure/00. Overview.md`             | LLD         | retired | Infrastructure container deleted (Step 3); no code left to describe                                                                                                              | ✅   |
| `docs/System Architecture (LLD)/README.md`                                  | LLD         | updated | drop Auth/Infrastructure rows — LLD must mirror HLD's container list exactly                                                                                                     | ✅   |
| `docs/System Architecture (LLD)/Web/00. Overview.md` → Integration patterns | LLD         | updated | deploy description is stale (SSM env load removed Step 4; deploy is now a stub pending the GitHub Pages cutover)                                                                 | ✅   |
| `docs/System Architecture (LLD)/Discuss/00. Overview.md` → Key decisions    | LLD         | updated | stale basic-auth-gated-reading claim (NFR-6 already retired in HLD); dangling references to deleted `apps/infra/lib/docs-stack.ts`/`apps/lambda-auth/src/handler.ts`             | ✅   |
| `docs/Engineering Guide/05 Getting Started.md`                              | Eng Guide   | updated | drop `lambda-auth`/`infra` from the workspace diagram, apps table, and command cheat sheet                                                                                       | ✅   |
| `docs/Engineering Guide/Infrastructure/00 Configuration & Secrets.md`       | Eng Guide   | retired | describes AWS SSM/Secrets Manager config flow for containers that no longer exist                                                                                                | ✅   |
| `docs/Engineering Guide/Infrastructure/01 Local Provisioning Runbook.md`    | Eng Guide   | retired | CDK bootstrap/provisioning runbook; no CDK app remains to provision                                                                                                              | ✅   |
| `docs/Engineering Guide/Infrastructure/02 Deploy Lifecycle.md`              | Eng Guide   | retired | describes the two-phase CDK+lambda-auth deploy sequence, now gone; no replacement procedure exists yet (GitHub Pages cutover is a later ticket)                                  | ✅   |
| `docs/Engineering Guide/Infrastructure/03 CI-CD Pipeline.md`                | Eng Guide   | retired | documents AWS OIDC auth in `ci.yml`/`cd.yml`, removed Steps 5-6                                                                                                                  | ✅   |
| `docs/Engineering Guide/index.md`                                           | Eng Guide   | updated | remove the 4 table rows pointing at the retired `Infrastructure/*` docs                                                                                                          | ✅   |
| `docs/Engineering Guide/07 Branching Strategy.md`                           | Eng Guide   | updated | fix 2 links to the retired `03 CI-CD Pipeline.md`                                                                                                                                | ✅   |
| `docs/Engineering Guide/06 MCP Setup.md`                                    | Eng Guide   | updated | fix 1 cross-reference to the retired `Infrastructure/00 Configuration & Secrets.md`                                                                                              | ✅   |
| `docs/README.md`                                                            | Root README | updated | fix the "Deploy Lifecycle" link description ("two-phase CDK + lambda-auth deploy sequence")                                                                                      | ✅   |
| `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md` | HLD         | updated | fix 2 citations pointing at the retired `03 CI-CD Pipeline.md` (NFR-5 Verification, Flows section) — mechanical citation fix, no target decision changes                         | ✅   |
| `docs/Engineering Guide/Infrastructure/04 Giscus Setup.md` → Step 5         | Eng Guide   | updated | consistency-review finding (RF-008): dangling reference to deleted `03 CI-CD Pipeline.md` and stale "push to SSM/redeploy" instruction, caused directly by Steps 4/6's deletions | ✅   |

<!-- Written by the Document stage (references/06-document.md Step 3) before any doc
is touched; Done is ticked as @docs-writer returns each row. Tier is one from
Documentation/02 Structure.md. Action: new · updated · retired. Why points at the
plan Solution, an implementation note or an RF row. Empty means no doc impact was
identified, not that docs were skipped; say so in a line below the table. -->

## Efforts Spent

| Date | Phase | Human time | AI tokens | Notes |
| ---- | ----- | ---------- | --------- | ----- |
