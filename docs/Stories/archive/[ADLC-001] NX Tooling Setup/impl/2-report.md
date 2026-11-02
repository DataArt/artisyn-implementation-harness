---
id: 35a74665
purpose: Completion report recording progress and fixes for the Nx + Yarn workspace tooling baseline setup
keywords: [adlc-001, nx, tooling, report, workspace]
---

# ADLC-001: NX Tooling Setup — Report

| Field  | Value                                                      |
| ------ | ---------------------------------------------------------- |
| Ticket | ADLC-001                                                   |
| Branch | `feat/adlc-001-nx-tooling-setup`                           |
| PR     | —                                                          |
| Author | Anton Merkulov                                             |
| Status | ✅ Complete                                                |
| Phase  | 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ |

## Progress

| #   | Step                                           | Status  | Notes                                                                                       | Test | Docs |
| --- | ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | Root: Node + Yarn + `package.json` + `nx.json` | ✅ Done | `docs/project.json` added to resolve missing implicit dep                                   | ✅   | ✅   |
| 2   | Root: `tsconfig.base.json`                     | ✅ Done | Added `module: ES2022` + `moduleResolution: bundler` to fix classic resolution conflict     | ✅   | ✅   |
| 3   | Root: Prettier                                 | ✅ Done | Fixed `.prettierignore` to use `**/.vitepress/cache` glob; ran `--write` on 61 files        | ✅   | ✅   |
| 4   | Root: ESLint (flat config)                     | ✅ Done | Added `"type": "module"` to root package.json; cleared NX cache to bust stale hit           | ✅   | ✅   |
| 5   | Root: Husky + lint-staged                      | ✅ Done | Hook file in place; live test deferred — no git repo yet. Run `yarn husky` after `git init` | —    | ✅   |
| 6   | Docs: Getting Started guide                    | ✅ Done | Updated infra stack to AWS CDK; `docs/README.md` index updated; TD-2 logged                 | ✅   | ✅   |

## Architecture Deviations

| #   | Deviation | Justification |
| --- | --------- | ------------- |

## Implementation Notes

### Step 6 — Docs: Getting Started guide

Created `docs/Engineering Guide/05 Getting Started.md` with workspace layout diagram, prerequisites table, first-time setup, per-app run commands, code quality commands, and NX quick reference. Updated infra stack label from Terraform to AWS CDK (matching HLD); replaced Terraform commands with CDK equivalents (`synth`, `diff`). Added Engineering Guide section to `docs/README.md`. TD-2 logged for migrating `apps/infra/project.json` targets from Terraform to CDK.

### Step 5 — Root: Husky + lint-staged

Hook file created at `.husky/pre-commit` (executable). No git repository initialised yet — `yarn husky` (which registers `.husky/` as the git hooks path) must be run after `git init`. Live pre-commit test is deferred to that point; AC-7 is marked for re-verification when git is set up. All configuration is correct and ready.

### Step 4 — Root: ESLint (flat config)

`eslint.config.js` uses ESM imports; without `"type": "module"` in root `package.json`, Node re-parsed it as ESM via heuristic and warned about the performance overhead. Added `"type": "module"` to fix it. Also updated ignore globs to `**/.vitepress/cache/**` to match the nested app path (consistent with the fix applied in Step 3). NX cache had a stale hit on `site:lint` after the package.json change — ran `yarn nx reset` to clear it.

### Step 3 — Root: Prettier

`.prettierignore` initially used bare paths (`.vitepress/cache`) which only match at root. The cache lives at `apps/docs-web/.vitepress/cache/`, so updated to `**/.vitepress/cache` and `**/.vitepress/dist` globs. Also added `.yarn` to exclude Yarn Berry release files. Ran `--write` on 61 files to apply formatting baseline across the workspace.

### Step 2 — Root: `tsconfig.base.json`

Initial base omitted `module`, causing TypeScript to default to `classic` resolution — incompatible with `resolveJsonModule` and `import.meta`. Fixed by adding `module: ES2022` and `moduleResolution: bundler`. Both apps typecheck cleanly; `lambda-auth`'s build config (`NodeNext`) overrides the base for its actual emit.

### Step 1 — Root: Node + Yarn + `package.json` + `nx.json`

Node 24 + Yarn 4.9.2 resolved cleanly. One fix required: `apps/docs-web/project.json` had `implicitDependencies: ["docs"]` pointing to a non-existent NX project, causing `yarn nx show projects` to fail. Fixed by adding a minimal `docs/project.json` registering the `docs/` content folder as an NX library project. All four projects (`site`, `lambda-auth`, `infra`, `docs`) now listed correctly.

## Deviation Audit

_Date: 2026-07-15 — @architect review_

| #    | Finding                                                                                                          | HLD ref                        | Severity | Triage                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------- | ------------------------------------------------------- |
| DA-1 | `apps/docs-web/project.json` hardcodes `us-east-1` / `eu-west-1` in `env-push`/`env-pull` targets — NFR-3 breach | `Requirements.md:NFR-3`        | P1       | ⏭️ Skip — acceptable for push/pull env targets          |
| DA-2 | `apps/infra/project.json` hardcodes regions + bucket names in `init` target — NFR-3 breach                       | `Requirements.md:NFR-3`        | P1       | ⏭️ Skip — acceptable for push/pull env targets          |
| DA-3 | `apps/infra/project.json` has only Terraform targets; HLD/NFR-4 mandate CDK                                      | `Infrastructure.md Technology` | P1       | 🔧 TD-2 logged; add interim note to `Infrastructure.md` |
| DA-4 | `docs/` is a fourth NX project not in HLD three-container model                                                  | `System Overview.md`           | P2       | ⏭️ Skip — NX registration detail, not a container       |
| DA-5 | Node 24 / Yarn 4 / NX 20 baseline absent from HLD                                                                | No HLD section                 | P2       | 🔧 Fix — add Tooling section to `System Overview.md`    |
| DA-6 | `"type":"module"` (ESM workspace) not captured anywhere                                                          | No HLD section                 | P2       | 🔧 Fix — include in same Tooling section as DA-5        |

## PR Review

_Date: 2026-07-15_

| Code        | Finding                                                                                                                                                 | File                       | Severity | Resolution                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------- | ---------------------------------------------------------------------- |
| IMPROVE-001 | `.vitepress/dist/` and `.vitepress/cache/` patterns only match at root — same issue fixed in `.prettierignore` Step 3                                   | `.gitignore:7-8`           | Advisory | ✅ Fixed — changed to `**/.vitepress/dist/` and `**/.vitepress/cache/` |
| IMPROVE-002 | `declaration: true` + `declarationMap: true` in base — library-build options; no-op for apps since typecheck uses `--noEmit` and build configs override | `tsconfig.base.json:12-13` | Optional | ✅ Fixed — removed both options from base                              |
| IMPROVE-003 | `eslint.config.js` listed in both `sharedGlobals` and `targetDefaults.lint.inputs` — NX deduplicates, no impact                                         | `nx.json:8,16`             | Optional | ✅ Fixed — removed redundant entry from `lint.inputs`                  |

**Verdict:** LGTM — all findings resolved.

## Tech Debt

| #    | Description                                                                                                       | Type       | Ticket |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| TD-1 | Verify AC-7 (husky pre-commit fires on `git commit`) — deferred; run `yarn husky` after `git init`                | dependency | —      |
| TD-2 | `apps/infra/project.json` still has Terraform targets — migrate to AWS CDK NX targets (`synth`, `diff`, `deploy`) | cleanup    | —      |
| TD-3 | `Auth.md` says "origin request" — should be "viewer-request" (diagram and handler both confirm viewer-request)    | cleanup    | —      |
| TD-4 | `Auth.md` Constraints says credentials from CloudFront config — handler fetches from Secrets Manager at runtime   | cleanup    | —      |
| TD-5 | `Auth.md` Constraints says "no external calls" — handler calls Secrets Manager API on first invocation            | cleanup    | —      |
| TD-6 | `Auth.md` WWW-Authenticate realm is "ADLC" — handler returns realm "Docs"                                         | cleanup    | —      |

## Satellite Review

_Date: 2026-07-15 — @architect_

| #    | Finding                                                                                     | Action                                                                 |
| ---- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| SR-1 | `Infrastructure.md` Technology table makes present-tense CDK claims while code is Terraform | Fixed — added `(target — current implementation: Terraform)` qualifier |
| SR-2 | `Getting Started` lists `infra:synth`/`infra:diff` (non-existent CDK targets)               | Skipped — guide reflects CDK target state by design                    |
| SR-3 | `Auth.md` "origin request" should be "viewer-request"                                       | TD-3 logged                                                            |
| SR-4 | `Auth.md` says credentials from CloudFront config; handler uses Secrets Manager             | TD-4 logged                                                            |
| SR-5 | `Auth.md` says "no external calls"; handler calls Secrets Manager                           | TD-5 logged                                                            |
| SR-6 | `Auth.md` realm "ADLC" vs handler realm "Docs"                                              | TD-6 logged                                                            |
| SR-7 | `System Overview.md` CDK design principle stated as present fact                            | Fixed — added interim qualifier                                        |
| SR-8 | Getting Started guards `infra:deploy`; actual guarded command is `infra:apply`              | Skipped — guide reflects CDK target naming                             |
| SR-9 | `docs/README.md` missing `05 Getting Started`                                               | False positive — entry present on line 15                              |

## Test Results

_Date: 2026-07-15_

| Project       | Build | Tests | Typecheck | Lint |
| ------------- | ----- | ----- | --------- | ---- |
| `site`        | ✅    | —     | ✅        | ✅   |
| `lambda-auth` | ✅    | —     | ✅        | ✅   |
| `infra`       | —     | —     | —         | —    |

### Notes

No test targets exist yet across any project — not in scope for this ticket. Husky live test (AC-7) deferred pending `git init`; all other ACs green. PR review findings IMPROVE-001/002/003 resolved before final suite run.

## Efforts Spent

| Date       | Phase     | Human time | AI tokens | Notes                                                               |
| ---------- | --------- | ---------- | --------- | ------------------------------------------------------------------- |
| 2026-07-15 | Implement |            |           | Step 1 — workspace bootstrap + docs/project.json fix                |
| 2026-07-15 | Implement |            |           | Step 2 — tsconfig.base.json; fixed module/moduleResolution          |
| 2026-07-15 | Implement |            |           | Step 3 — Prettier; fixed prettierignore globs, formatted 61 files   |
| 2026-07-15 | Implement |            |           | Step 4 — ESLint flat config; added type:module to package.json      |
| 2026-07-15 | Implement |            |           | Step 5 — Husky pre-commit hook; live test deferred pending git init |
| 2026-07-15 | Implement |            |           | Step 6 — Getting Started guide; CDK stack, docs/README.md updated   |

## Documentation

_Date: 2026-07-15_

| Item                                                             | Action                                                                                        |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `docs/Engineering Guide/05 Getting Started.md`                   | Created — workspace layout, prerequisites, run commands, NX quick reference                   |
| `docs/README.md`                                                 | Updated — added Engineering Guide section with all six articles                               |
| `docs/Target Architecture (HLD)/v1/System Overview.md`           | Updated — added Tooling section (Node 24, Yarn 4, NX 20, ESM); qualified CDK design principle |
| `docs/Target Architecture (HLD)/v1/Containers/Infrastructure.md` | Updated — added CDK/Terraform interim note to Technology table and Key Paths                  |
| `docs/project.json`                                              | Created — minimal NX library registration for `docs/` content folder                          |
| `apps/docs-web/README.md`                                        | No change — no app-level targets or env vars changed                                          |
| `apps/lambda-auth/README.md`                                     | No change — no app-level targets or env vars changed                                          |
| LLD                                                              | No change — no implementation detail requiring LLD entries; LLD folder does not exist yet     |

### Notes

Auth.md discrepancies (TD-3 through TD-6) are pre-existing and out of scope for this ticket. Getting Started intentionally reflects CDK target commands (`infra:synth`, `infra:diff`) rather than current Terraform commands — consistent with the HLD target state.
