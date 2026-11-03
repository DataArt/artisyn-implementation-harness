---
id: eb18aac0
purpose: Completion report recording progress and fixes for the Terraform-to-CDK infra migration and secrets management wiring
keywords: [adlc-003, cdk, secrets-management, report, infra]
---

# ADLC-003: CDK Infrastructure & Secrets Management — Report

| Field  | Value                                                      |
| ------ | ---------------------------------------------------------- |
| Ticket | ADLC-003                                                   |
| Branch | `feat/adlc-003-cdk-infra`                                  |
| PR     | —                                                          |
| Author | Anton Merkulov                                             |
| Status | ✅ Complete                                                |
| Phase  | 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ |

## Progress

| #   | Step                                         | Status  | Notes                                                                                                                                                                                                | Test | Docs |
| --- | -------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | Infra: Remove Terraform                      | ✅ Done | All TF files, modules/, scripts/bootstrap-tfstate.sh removed; stale dotfiles left for Step 2 rewrite                                                                                                 | —    | —    |
| 2   | Infra: Scaffold CDK app + env files + deploy | ✅ Done | aws-cdk-lib@2.261.0 / aws-cdk@2.1131.0; DocsStack needs env.region for crossRegionReferences; lib/conventions.ts owns all names + tags; stacks decomposed into private factory methods               | ✅   | ✅   |
| 3   | NX: Wire targetDefaults + populate env files | ✅ Done | SM_REGION removed — consolidated to AWS_REGION (handler + build.ts updated); all /rnmkr/ SSM paths updated to /clnsn/; CF_DISTRIBUTION_ID=E1VVCKJ1H44FJY; all 4 push targets verified                | ✅   | ✅   |
| 4   | Deploy code to provisioned resources         | ✅ Done | 3 issues found: (1) build outfile `lambda-handler.js` → `index.js` (handler mismatch); (2) missing `defaultRootObject` on CF distribution; (3) favicon 403 → SVG favicon + CF 403→404 error response | ✅   | ✅   |
| 5   | Scripts: Fix cross-platform sed              | ✅ Done | `sed -i ''` (macOS-only) → mktemp+mv in env-pull.sh and sm-pull.sh                                                                                                                                   | ✅   | —    |
| 6   | Docs: Update doc 07 + HLD infra container    | ✅ Done | Doc 07 diagram replaced, TF refs removed, /rnmkr/ → /clnsn/; HLD Infra + Auth updated; 08 Local Provisioning Runbook.md created                                                                      | —    | ✅   |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Architecture Deviations

| #   | Deviation | Justification |
| --- | --------- | ------------- |

<!--
Populated by /dev-plan Step 7b if any justified deviations were approved.
Leave empty if no deviations — do not remove the section.
Each deviation must be addressed in the Document phase: Target Architecture updated or a tech debt ticket created.
-->

## Implementation Notes

### Step 4 — Deploy code to provisioned resources

Three issues discovered during deploy validation:

**Issue 1 — Lambda `Cannot find module 'index'` (503)**
`build.ts` had `outfile: 'dist/lambda-handler.js'` but the CDK handler was `index.handler` — Node runtime looks for `index.js`. Fixed: changed outfile to `dist/index.js` and updated the zip command in `project.json` accordingly.

**Issue 2 — CloudFront 403 AccessDenied on `/`**
Bucket had content and OAC was correct, but `defaultRootObject` was not set on the distribution. CloudFront requested the key `/` from S3, which doesn't exist → S3 returned 403. Fixed: added `defaultRootObject: 'index.html'` to DocsStack.
Side-effect: CDK deploy reverted CloudFront Lambda association to placeholder v1 (expected — any DocsStack deploy does this). Re-ran `lambda-auth:deploy:dev` to restore v2.

**Issue 3 — Cross-stack export conflict on EdgeStack update**
Changing the inline placeholder from `cf.response` → `cf.request` in a prior session created a new Lambda version hash → new CFn export name. The stack rolled back (UPDATE_ROLLBACK_COMPLETE) but `edge-stack.ts` still had `cf.request`. CDK then tried to delete the old export `...6B3B4FFD...` still imported by DocsStack. Fixed: reverted inline placeholder to `cf.response` to match the deployed hash. This is stable as long as the placeholder string is not changed — real code ships via `lambda-auth:deploy`.

**Issue 4 — favicon.ico 403**
S3 returns 403 (not 404) for missing objects on private buckets. Browser requests `favicon.ico` which doesn't exist. Fixed two ways: (a) added `apps/docs-web/public/favicon.svg` + VitePress `head` config so browsers no longer request `favicon.ico`; (b) added CloudFront `errorResponses` to remap 403 → 404 with `/404.html` for any other missing files.

**Operational note**: any `cdk deploy` touching DocsStack resets CloudFront Lambda association to the CDK placeholder. Always follow with `lambda-auth:deploy:dev`.

### Step 3 — NX: Wire targetDefaults + populate env files

SM_REGION consolidated into AWS_REGION throughout (handler.ts, build.ts, all env files). All SSM parameter paths updated from `/rnmkr/` to `/clnsn/` in lambda-auth and docs-web project.json files. `nx.json` targetDefaults wired for all 4 secrets targets. CF_DISTRIBUTION_ID (E1VVCKJ1H44FJY) populated by developer from `infra:output:dev`. All 4 push targets ran successfully.

### Step 2 — Infra: Scaffold CDK app + env files + deploy to AWS

aws-cdk-lib and aws-cdk CLI use different version schemes (2.261.0 vs 2.1131.0). DocsStack requires explicit `env.region` for `crossRegionReferences` to work — sourced via `AWS_REGION` in `.env.dev`. `--all` flag not recognised by CLI 2.1131.0; replaced with `'**'` stack glob. Three improvements added during verification: `lib/conventions.ts` centralises all resource names and default tags (analogous to TF locals); both stacks decomposed into private factory methods; `apps/infra/**` removed from root ESLint ignore.

### Step 1 — Infra: Remove Terraform

Went as planned. Deleted 7 `.tf` files, `.terraform.lock.hcl`, `modules/` (6 subdirs), and `scripts/bootstrap-tfstate.sh`. Stale TF-format dotfiles (`.env.dev`, `.env.example`, `.secrets.*`, `.gitignore`) intentionally kept — rewritten in Step 2.

## Tech Debt

| #    | Description                                                                                                                                                                                         | Type         | Ticket |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| TD-1 | `grant_invoke` not idempotent — aborts if permission statement already exists on re-run                                                                                                             | `cleanup`    | —      |
| TD-2 | `jq` in deploy script replaces entire `LambdaFunctionAssociations`; adding a second CF behavior silently loses auth                                                                                 | `security`   | —      |
| TD-3 | Lambda log group has no explicit CDK removal policy (infra constraint: all stateful resources need one)                                                                                             | `cleanup`    | —      |
| TD-4 | `cachedHash` module-level with no TTL — secret rotation takes effect only after Lambda cold-start                                                                                                   | `security`   | —      |
| TD-5 | Version cleanup capped at 100 (`--max-items 100`) in deploy script                                                                                                                                  | `cleanup`    | —      |
| TD-6 | `output` target hardcodes `DocsStack` stack name — breaks if stack names are env-qualified                                                                                                          | `cleanup`    | —      |
| TD-7 | Any change to `createFunction` props in EdgeStack changes the version hash → CFn export conflict. Root fix: remove `edgeLambdas` from CDK and let the deploy script own the CF association entirely | `dependency` | —      |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Ticket: fill in internal ticket number (e.g. ADLC-XX), otherwise —
Rows are added here by /dev-implement (Step 3b) as debt is discovered.
-->

## Test Results

_Date: 2026-07-15_

| Project       | Build | Typecheck | Lint |
| ------------- | ----- | --------- | ---- |
| `infra`       | ✅    | ✅        | ✅   |
| `lambda-auth` | ✅    | ✅        | ✅   |
| `site`        | ✅    | —         | —    |

### Notes

AC-7 (shellcheck) skipped — `shellcheck` not installed locally; scripts pass functional verification. All 10 remaining AC items pass.

## PR Review

_Date: 2026-07-15_

| Code    | Finding                                                                                     | File                       | Severity | Resolution                                        |
| ------- | ------------------------------------------------------------------------------------------- | -------------------------- | -------- | ------------------------------------------------- |
| NFR-001 | `'us-east-1'` literal in EdgeStack instantiation                                            | `bin/app.ts:17`            | Must fix | Introduced `LAMBDA_REGION` env var; added guard   |
| NFR-002 | `ENV_REGION` hardcoded in all project.json env blocks                                       | 3 project.json files       | Must fix | Removed; scripts now use `$AWS_REGION` from shell |
| NFR-003 | `--region us-east-1` in bootstrap target                                                    | `infra/project.json:63`    | Must fix | Changed to `$LAMBDA_REGION`                       |
| BUG-001 | Missing `LOCATION_SHORT` guard — empty string produces malformed resource names             | `bin/app.ts:10`            | Must fix | Added startup guard                               |
| BUG-002 | Stale `SM_REGION` in handler comment                                                        | `handler.ts:5`             | Advisory | Fixed                                             |
| BUG-003 | Malformed Basic auth (no colon) silently used as password                                   | `handler.ts:35`            | Advisory | Fixed — returns 401                               |
| BUG-004 | `void esbuild.build()` swallows build errors                                                | `build.ts:9`               | Advisory | Fixed — `.catch(process.exit)`                    |
| BUG-005 | Deploy script header has stale `rnmkr-*` example name                                       | `lambda-edge-deploy.sh:5`  | Advisory | Fixed                                             |
| BUG-006 | `memorySize` unset — Lambda@Edge ceiling is 128 MB; CDK default matches but is undocumented | `edge-stack.ts:60`         | Advisory | Fixed — explicit `memorySize: 128`                |
| TD-001  | `grant_invoke` not idempotent on re-run                                                     | `lambda-edge-deploy.sh:44` | Optional | Tracked as TD-1                                   |
| TD-002  | `jq` replaces all CF Lambda associations — risky if multiple behaviors exist                | `lambda-edge-deploy.sh:64` | Optional | Tracked as TD-2                                   |
| TD-003  | Lambda log group has no explicit CDK removal policy                                         | `edge-stack.ts`            | Optional | Tracked as TD-3                                   |
| TD-004  | `cachedHash` no TTL — rotation lag                                                          | `handler.ts:7`             | Optional | Tracked as TD-4                                   |

**Verdict:** LGTM after fixes. All NFR-3 violations resolved. No must-fix items remain.

## Deviation Audit

_Date: 2026-07-15_

| #    | Finding                                                                      | Doc                               | Priority | Resolution                                                                 |
| ---- | ---------------------------------------------------------------------------- | --------------------------------- | -------- | -------------------------------------------------------------------------- |
| DA-1 | Two-stack CDK decomposition not reflected — diagram shows single `CDK Stack` | `Infrastructure.md` — diagram     | P1       | Fixed — diagram now shows EdgeStack + DocsStack with cross-stack ref arrow |
| DA-2 | Two-phase deploy model absent — CDK placeholder + `lambda-auth:deploy`       | `Auth.md` — Technology/Deploy     | P1       | Fixed — Auth.md updated; new `EG/10 Deploy Lifecycle.md` created           |
| DA-3 | `defaultRootObject` + 403→404 `errorResponses` not in Responsibilities       | `Infrastructure.md`               | P1       | Fixed — added to Responsibilities                                          |
| DA-4 | SM secret CDK placeholder pattern not documented                             | `Infrastructure.md`               | P1       | Fixed — added to Responsibilities                                          |
| DA-5 | Resource naming convention (`clnsn-{env}-{wl}-…`) absent                     | `Infrastructure.md`               | P1       | Fixed — new Naming conventions table added                                 |
| DA-6 | 128 MB memory ceiling not in Auth constraints                                | `Auth.md` — Constraints           | P2       | Fixed — added to Constraints                                               |
| DA-7 | Edge-region log destination absent from Auth doc                             | `Auth.md` — Constraints           | P2       | Fixed — added to Constraints                                               |
| DA-8 | System Overview CDK node still shows single stack                            | `System Overview.md` — diagram    | P2       | Fixed — split into EdgeStack / DocsStack nodes; stale TF note removed      |
| DA-9 | `crossRegionReferences: true` constraint not documented                      | `Infrastructure.md` — Constraints | P3       | Skipped — implementation detail visible in code                            |

## Documentation

_Date: 2026-07-16_

| Item                                                             | Action  |
| ---------------------------------------------------------------- | ------- |
| `docs/Engineering Guide/07 Configuration & Secrets.md`           | Updated |
| `docs/Engineering Guide/08 Local Provisioning Runbook.md`        | Created |
| `docs/Engineering Guide/10 Deploy Lifecycle.md`                  | Created |
| `docs/Target Architecture (HLD)/v1/Containers/Infrastructure.md` | Updated |
| `docs/Target Architecture (HLD)/v1/Containers/Auth.md`           | Updated |
| `docs/Target Architecture (HLD)/v1/System Overview.md`           | Updated |
| `docs/README.md`                                                 | Updated |

### Notes

EG 07 and HLD containers updated during Step 6 (Implement phase). Deviation audit (Document phase) surfaced 8 additional HLD gaps (DA-1 through DA-8); all fixed. DA-9 (`crossRegionReferences` constraint) skipped — implementation detail visible in code. New EG 10 Deploy Lifecycle created to document the two-phase CDK placeholder + `lambda-auth:deploy` coupling (DA-2 finding).

## Satellite Review

_Date: 2026-07-16_

| Code | Finding                                                                                  | File                     | Resolution                                    |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------- |
| SR-1 | "origin request" should be "viewer-request" (distinct Lambda@Edge event type)            | `Auth.md:29`             | Fixed                                         |
| SR-2 | Diagram edge "uploaded by CDK" — CDK provisions bucket, not uploads content              | `Web.md:25`              | Fixed                                         |
| SR-3 | NX project named `site`, folder is `apps/docs-web/`                                      | `07 Config & Secrets.md` | Skip — intentional; NX name and folder differ |
| SR-4 | `AuthSecretName` appears only in 08 Runbook — unverifiable from docs alone               | `08 Runbook:68`          | Skip — accurate CDK output key                |
| SR-5 | Placeholder passthrough behaviour only in EG 10, not in container docs                   | `10 Deploy Lifecycle.md` | Skip — correct home                           |
| SR-6 | 07 diagram labels script name not NX target on lambda-auth deploy node                   | `07 Config & Secrets.md` | Skip — contextually clear                     |
| SR-7 | 07 hardcodes `docs` as workload in SM path                                               | `07 Config & Secrets.md` | Skip — `docs` is the canonical workload value |
| SR-8 | 08 Runbook Step 2 omits OAC from CDK deploy description                                  | `08 Runbook:49`          | Fixed                                         |
| SR-9 | NFR-2 says "at deploy time" — actual mechanism is runtime `GetSecretValue` at cold-start | `Requirements.md:6`      | Fixed                                         |

## Efforts Spent

| Date       | Phase     | Human time | AI tokens | Notes                                                       |
| ---------- | --------- | ---------- | --------- | ----------------------------------------------------------- |
| 2026-07-15 | Implement |            |           | Step 1 — Remove Terraform                                   |
| 2026-07-15 | Implement |            |           | Step 2 — Scaffold CDK app                                   |
| 2026-07-15 | Implement |            |           | Step 3 — Wire NX targets + populate env files               |
| 2026-07-15 | Implement |            |           | Step 4 — Deploy code to provisioned resources               |
| 2026-07-15 | Implement |            |           | Step 5 — Fix cross-platform sed in pull scripts             |
| 2026-07-15 | Implement |            |           | Step 6 — Update docs (07, HLD Infra, HLD Auth, new runbook) |
| 2026-07-16 | Document  |            |           | Deviation audit + HLD updates + EG 10 Deploy Lifecycle      |
