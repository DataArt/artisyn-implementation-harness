---
id: bc2b50bf
purpose: Completion report recording progress and fixes for the GitHub Actions CI/CD pipeline with AWS OIDC
keywords: [adlc-004, ci-cd, oidc, report, github-actions]
---

# ADLC-004: CI/CD — GitHub Actions with AWS OIDC — Report

| Field  | Value                                                      |
| ------ | ---------------------------------------------------------- |
| Ticket | ADLC-004                                                   |
| Branch | `feat/adlc-004-ci-cd`                                      |
| PR     | —                                                          |
| Author | Anton Merkulov                                             |
| Status | ✅ Complete                                                |
| Phase  | 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ |

## Progress

| #   | Step                                          | Status  | Notes                                                                                                                                                                            | Test | Docs |
| --- | --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | Infra: `CiStack`                              | ✅ Done | Deployed. Role ARN set as `IAM_ROLE_ARN` GitHub variable.                                                                                                                        | ✅   | ✅   |
| 2   | Cross-cutting: `env-export.sh` + NX ci config | ✅ Done | Used `jq` instead of Python; `${GITHUB_ENV:-/dev/null}` for local safety.                                                                                                        | ✅   | ✅   |
| 3   | GitHub Actions: CI workflow                   | ✅ Done | Green after fixing Yarn caching, esbuild vuln, `--configuration=ci`, OIDC immutable sub claim, `srcExclude` for Stories.                                                         | ✅   | ✅   |
| 4   | GitHub Actions: CD workflow                   | ✅ Done | Self-sufficient build/deploy scripts; composite actions; `infra:provision` rename; IAM versioned-ARN fixes.                                                                      | ✅   | ✅   |
| 5   | Docs: Engineering Guide update                | ✅ Done | New `Infrastructure/` subfolder; `03 CI-CD Pipeline.md` with OIDC flow, diagram, vars table; `07` renamed to `07 Documentation Principles`; all stale refs updated; build green. | —    | —    |

## Architecture Deviations

| #   | Deviation | Justification |
| --- | --------- | ------------- |

## Implementation Notes

### Step 1 — Infra: `CiStack`

Decomposed into private methods (`createOidcProvider`, `createDeployRole`, `buildS3Policy`, `buildCloudFrontPolicy`, `buildLambdaPolicy`, `buildSsmPolicy`) matching the `DocsStack` pattern. Synth and deploy passed first attempt. Role ARN set as `IAM_ROLE_ARN` GitHub Actions variable.

### Step 2 — Cross-cutting: `env-export.sh` + NX ci config

Replaced Python JSON parsing with `jq` (already used in `lambda-edge-deploy.sh`). Used `${GITHUB_ENV:-/dev/null}` to handle unbound variable under `set -u` in local environments. Added `"ci": {}` configuration to `site` and `lambda-auth` deploy targets.

### Step 4 — GitHub Actions: CD workflow

Significant refactor from the original plan: instead of conditional per-app deploy steps in the workflow, each app got a self-sufficient deploy script (`site-deploy.sh`, updated `lambda-edge-deploy.sh`) and a self-sufficient build script (`lambda-auth-build.sh`). Each script fetches its own SSM env in CI via a `load_env()` function. Setup steps were extracted into composite actions (`.github/actions/setup`, `.github/actions/aws-auth`). `infra:deploy` renamed to `infra:provision` to exclude it from `nx affected --target=deploy`.

IAM permission gaps discovered iteratively during first CD run:

- `lambda:AddPermission` and `lambda:RemovePermission` require versioned ARN (`function:name:*`), not function ARN
- `lambda:GetFunction` also called on versioned ARN by CloudFront
- `lambda:EnableReplication*` required by CloudFront when associating Lambda@Edge

All three gaps fixed in `ci-stack.ts` `buildLambdaPolicy` by splitting into two statements: function-level and version-level (`function:name:*`).

### Step 3 — GitHub Actions: CI workflow

Multiple rounds of debugging before green:

1. **Yarn caching**: `actions/setup-node@v4` with `cache: yarn` tried `yarn config get cacheFolder` before corepack was enabled, hitting Yarn 1.x on the runner. Fixed by removing `cache: yarn`, adding explicit `corepack enable` step, and manual `actions/cache@v4` targeting `.yarn/cache`. Upgraded to `actions/setup-node@v6.5.0`.
2. **esbuild moderate vulnerability**: `yarn npm audit --all --severity moderate` caught GHSA-67mh-4wv8-2f99. Fixed by bumping esbuild to `^0.25.0` in `apps/lambda-auth/package.json`.
3. **lambda-auth:build env file lookup**: `defaultConfiguration: "dev"` caused `.env.dev` lookup in CI. Fixed by adding `"ci": {}` to build configurations and hardcoding `--configuration=ci` in the workflow.
4. **OIDC trust policy — immutable subject claims**: Repos created after June 1, 2026 use numeric IDs in the sub claim (`repo:[[GITHUB_ORG]]@[[GITHUB_ORG_ID]]/[[GITHUB_REPO]]@[[GITHUB_REPO_ID]]:*`). Trust policy had `repo:[[GITHUB_ORG]]/[[GITHUB_REPO]]:*`. Fixed in `ci-stack.ts`; trust policy patched directly in IAM console (no local AWS creds for redeploy).
5. **GitHub environment `dev` required**: `vars.*` only resolves when the job has `environment: dev` set. Added to job config.
6. **`env-export.sh` before build**: `build.ts` inlines `SM_SECRET_NAME` + `AWS_REGION` via esbuild `define` — OIDC auth and SSM env export must run before the build target.
7. **VitePress SSR crash on plan file**: `docs/Stories/.../1-plan.md` contains `${{ github.base_ref }}` which Vue SSR interprets as template interpolation. Fixed by adding `srcExclude: ['Stories/**']` to `apps/docs-web/.vitepress/config.ts`.

### Step 5 — Docs: Engineering Guide update

Created a dedicated `Engineering Guide/Infrastructure/` subfolder and consolidated all infra-related docs into it:

- `00 Configuration & Secrets.md` (was `07`)
- `01 Local Provisioning Runbook.md` (was `08`)
- `02 Deploy Lifecycle.md` (was `10`)
- `03 CI-CD Pipeline.md` (new) — full CI/CD reference: OIDC flow, CI/CD workflow steps, SSM env-fetch pattern, GitHub variables table, guarded operations

Remaining root docs renumbered: `09 Documentation Principles.md` → `07`. All cross-references (01 Conventions, 02 Doc Structure, 04 AI Workflow, HLD Auth.md, README.md) updated. Fixed two additional issues: `infra:deploy` → `infra:provision` in the principle diagram and Deploy Lifecycle doc; `${{ github.base_ref }}` in CI-CD Pipeline rewritten as prose to avoid Vue SSR template interpolation crash. Build green throughout.

## Deviation Audit

_Date: 2026-07-16_

| #       | Gap                                                                                                                        | Doc                                                                               | Priority        | Action                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| DEV-001 | `infra:deploy` used throughout — target was renamed to `infra:provision`; running the documented command would fail        | `Engineering Guide/Infrastructure/01 Local Provisioning Runbook.md`               | P1 — blocking   | Replace all 5 occurrences: flowchart node, Step 2 command, Step 2 note, Step 6 cross-ref, subsequent-deploys table |
| DEV-002 | `CiStack` (OIDC provider + IAM deploy role) is a fourth CDK stack with no representation in the HLD                        | `Target Architecture (HLD)/v1/Containers/Infrastructure.md`, `System Overview.md` | P2 — should fix | Add `CiStack` to HLD Responsibilities; update baseline diagram; update Containers table in System Overview         |
| DEV-003 | Infra SSM path shown as `/clnsn/dev/infra/env` — actual path is `/clnsn/dev/docs/infra/env`                                | `Engineering Guide/Infrastructure/00 Configuration & Secrets.md`                  | P2 — should fix | Correct the App ownership block                                                                                    |
| DEV-004 | `scripts/ci/env-export.sh` is dead code — no workflow or deploy script calls it; inline `load_env()` is the actual pattern | —                                                                                 | P3 — hygiene    | Delete file or add doc note                                                                                        |

## PR Review

_Date: 2026-07-16_

| Code        | Finding                                                                                                           | File                                   | Severity | Resolution                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001     | SSM policy grants `/clnsn/{env}/*` — covers all workloads, not just `docs`                                        | `apps/infra/lib/ci-stack.ts:133`       | Must fix | Change ARN to `/clnsn/${environment}/${workload}/*` — `workload` is already a CiStack prop                                      |
| SEC-002     | CloudFront policy targets all distributions (`distribution/*`)                                                    | `apps/infra/lib/ci-stack.ts:93`        | Advisory | Distribution ID unavailable at CiStack deploy time without cross-stack coupling — add inline justification comment              |
| BUG-001     | `get-distribution-config` called twice; ETag and DistributionConfig can diverge between calls                     | `scripts/ci/lambda-edge-deploy.sh:59`  | Advisory | Fetch once into a temp file, extract both ETag and config with `jq` from the same file                                          |
| IMPROVE-001 | `aws-auth` runs before audit/lint/typecheck — AWS credentials present during pure-local steps                     | `.github/workflows/ci.yml:26`          | Advisory | Move `aws-auth` step to immediately before Build (the only step that needs AWS)                                                 |
| IMPROVE-002 | No guard that `AWS_REGION=us-east-1` after `load_env` in Lambda deploy                                            | `scripts/ci/lambda-edge-deploy.sh:111` | Advisory | Add check after `load_env`: `[[ "$AWS_REGION" == "us-east-1" ]] \|\| { echo "ERROR: Lambda@Edge requires us-east-1"; exit 1; }` |
| IMPROVE-003 | `create-invalidation` issued without waiting — CD reports success while edge caches may still serve stale content | `scripts/ci/site-deploy.sh:24`         | Advisory | Capture invalidation ID and add `aws cloudfront wait invalidation-completed`                                                    |
| DESIGN-001  | Comment says env vars "injected from `.env.dev`" — only true locally; CI path is SSM via build script             | `apps/lambda-auth/src/handler.ts:5`    | Optional | Update comment to reflect both local (envFile) and CI (SSM) paths                                                               |

**Verdict:** Needs changes — SEC-001 must be fixed before merge; advisory items recommended before shipping to prod.

## Test Results

_Date: 2026-07-16_

| Project       | Build | Tests | Typecheck | Lint |
| ------------- | ----- | ----- | --------- | ---- |
| `infra`       | ✅    | —     | ✅        | ✅   |
| `lambda-auth` | ✅    | —     | ✅        | ✅   |
| `site`        | ✅    | —     | —         | —    |

### Notes

- No unit tests exist for this ticket's deliverables (CDK stacks, bash scripts, GitHub Actions workflows) — integration tests were the verification: live CI and CD runs on GitHub Actions
- All 10 acceptance criteria passed; AC-3 trust-policy sub claim updated to numeric org/repo IDs (`repo:[[GITHUB_ORG]]@[[GITHUB_ORG_ID]]/[[GITHUB_REPO]]@[[GITHUB_REPO_ID]]:*`) as required for repos created post June 2026
- PR review fixes committed: SEC-001 (SSM scope tightened to `/{env}/{workload}/*`), BUG-001 (CF single-fetch), IMPROVE-002 (AWS_REGION guard), IMPROVE-003 (CF invalidation wait), DESIGN-001 (handler.ts comment)

## Documentation

_Date: 2026-07-16_

| Item                                                                     | Action                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `docs/Target Architecture (HLD)/v1/Containers/Infrastructure.md`         | Updated — added CiStack subgraph to diagram, Responsibilities, naming conventions table (`{wl}` pattern)      |
| `docs/Target Architecture (HLD)/v1/System Overview.md`                   | Updated — Containers table and system diagram include CiStack and GitHub Actions node                         |
| `docs/Engineering Guide/Infrastructure/03 CI-CD Pipeline.md`             | Created — full CI/CD reference: OIDC flow, CI/CD steps, SSM env-fetch pattern, GitHub vars table, guarded ops |
| `docs/Engineering Guide/Infrastructure/00 Configuration & Secrets.md`    | Updated — SSM path corrected to `/clnsn/dev/docs/infra/env`; CI/CD section replaced with pointer to `03`      |
| `docs/Engineering Guide/Infrastructure/01 Local Provisioning Runbook.md` | Updated — all 5 `infra:deploy` occurrences replaced with `infra:provision`                                    |
| `docs/Engineering Guide/Infrastructure/02 Deploy Lifecycle.md`           | Updated — `infra:deploy` → `infra:provision` in diagram and guarded command block                             |
| `scripts/ci/env-export.sh`                                               | Deleted — dead code, no callers; `load_env()` inline pattern is the actual mechanism                          |

### Notes

- DEV-001 (stale `infra:deploy`): fixed across three Engineering Guide docs
- DEV-002 (CiStack absent from HLD): fixed in Infrastructure.md and System Overview
- DEV-003 (wrong SSM path): fixed in `00 Configuration & Secrets.md`
- DEV-004 (`env-export.sh` dead code): file deleted
- SAT-001 (naming table inconsistency `{wl}` vs hardcoded `docs`): fixed in Infrastructure.md naming conventions table
- SAT-002 (`aws-auth` step omitted from CI step table): added as Step 0 in `03 CI-CD Pipeline.md`
- IMPROVE-001 advisory (move `aws-auth` before Build in CI workflow) intentionally skipped per developer instruction

## Tech Debt

| #   | Description | Type | Ticket |
| --- | ----------- | ---- | ------ |

## Efforts Spent

| Date       | Phase     | Human time | AI tokens | Notes                                                                      |
| ---------- | --------- | ---------- | --------- | -------------------------------------------------------------------------- |
| 2026-07-16 | Plan      |            |           |                                                                            |
| 2026-07-16 | Implement |            |           | Step 1 — CiStack                                                           |
| 2026-07-16 | Implement |            |           | Step 2 — env-export.sh + NX ci config                                      |
| 2026-07-16 | Implement |            |           | Step 3 — CI workflow (.github/workflows/ci.yml)                            |
| 2026-07-16 | Implement |            |           | Step 4 — CD workflow + composite actions + IAM fixes                       |
| 2026-07-16 | Implement |            |           | Step 5 — Engineering Guide: Infrastructure/ subfolder + CI-CD Pipeline doc |
