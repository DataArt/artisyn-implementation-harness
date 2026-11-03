---
id: be290d53
name: Dev Plan
description: Implementation plan for retiring the Auth and Infrastructure containers' code (Efforts.md item 5, code-only slice)
type: reference
---

# DESIGN-20261103-LBBI: Retire Existing Infra — Plan

| Field   | Value                                              |
| ------- | -------------------------------------------------- |
| Ticket  | DESIGN-20261103-LBBI                               |
| Intent  | [0-intent.md](0-intent.md)                         |
| Branch  | `docs/design-20261103-lbbi-github-pages-migration` |
| Created | 2026-11-03                                         |

## Solution

Delete the Auth container (`apps/lambda-auth/`) and the Infrastructure container (`apps/infra/`) entirely, strip every AWS-specific step from `.github/workflows/ci.yml`, stub `.github/workflows/cd.yml`'s AWS job content in place (kept as a skeleton for Efforts item 3 — a later ticket — to build the real GitHub Pages deploy job into) and delete `.github/actions/aws-auth/` (no reuse value — GitHub Pages deploy uses GitHub's own OIDC, not AWS), and stub the now-dead AWS-specific nx targets in `apps/docs-web/project.json` (pulled forward from Efforts item 6, since they become dead code the moment `cd.yml`'s AWS deploy step is stubbed) — kept present by name, replaced with a no-op, rather than deleted outright. Also retires the two agent definitions (`@auth`, `@infra`) and the `CLAUDE.md` rows that exist solely to govern the containers being deleted — found while reading architecture context in this stage, not in the original intent; called out at sign-off. Touches the Auth and Infrastructure HLD containers (already retired in the published HLD — this ticket catches up the code and harness-governance files to match) and the Web container's CI/CD surface only (no change to its content, build, or VitePress config). Reuses nothing new; this is pure deletion/simplification.

No diagram — this step removes wiring, it doesn't change what's wired to what going forward (the replacement GitHub Pages wiring is a later ticket's diagram).

Planning decisions:

- Order matters for a clean intermediate state: `apps/docs-web`'s AWS-specific nx targets/scripts are removed (Step 4) _before_ `ci.yml`'s AWS env vars are stripped (Step 5), because `scripts/ci/site-build.sh`'s SSM-loading `load_env` function would otherwise fail on unset `SITE_SSM_ENV_PARAM` once `ci.yml` stops providing it.
- `cd.yml` is stubbed in place rather than deleted — the developer wants to reuse this file as the skeleton for item 3's GitHub Pages deploy job later, rather than recreating it from scratch. `.github/actions/aws-auth/` is still deleted outright, since it has no reuse value for a GitHub-Pages-native deploy (no AWS OIDC role to assume).
- The `VITE_GITHUB_ORG`/`VITE_GITHUB_REPO`/`VITE_GISCUS_*` build-time vars (currently SSM-sourced) are **not** wired to GitHub Actions repository variables in this ticket — that's explicitly Efforts item 3's job, which requires repo-settings configuration outside this ticket's scope. Accepted consequence: CI builds will render giscus with empty config until item 3 lands; the build itself still succeeds (VitePress doesn't fail on empty env vars).

## Acceptance Criteria

- [ ] `AC-1` — `apps/infra/` does not exist in the repo (`git status`/`ls` confirms; `yarn nx show projects` no longer lists `infra`)
- [ ] `AC-2` — `apps/lambda-auth/` does not exist in the repo (same checks, project `lambda-auth`)
- [ ] `AC-3` — `scripts/ci/lambda-auth-build.sh` does not exist (only consumer was `apps/lambda-auth`'s own build target)
- [ ] `AC-4` — `.github/actions/aws-auth/` does not exist; `.github/workflows/cd.yml` still exists but contains no AWS reference (`aws-auth`, `AWS_REGION`, `SSM_ENV_PARAM`, `id-token`) and is valid YAML
- [ ] `AC-5` — `.github/workflows/ci.yml` contains no AWS OIDC auth step and no `AWS_REGION`/`SITE_SSM_ENV_PARAM`/`LAMBDA_AUTH_SSM_ENV_PARAM`/`CI_ROLE_ARN` references, and is still valid YAML
- [ ] `AC-6` — `apps/docs-web/project.json`'s `deploy`, `env-push`, `env-pull`, `sm-push`, and `sm-pull` targets still exist by name but are stubbed (no AWS call, no reference to `scripts/ci/site-deploy.sh` or SSM); `build`/`typecheck`/`lint`/`serve` targets are unchanged
- [ ] `AC-7` — `scripts/ci/site-deploy.sh` does not exist; `scripts/ci/site-build.sh` has no SSM-loading `load_env` function and no AWS calls of any kind
- [ ] `AC-8` — `yarn nx run-many --target=lint,typecheck --projects=docs-web,harness-bootstrap-e2e` (the two remaining non-deleted apps) passes, proving the workspace still resolves correctly with `infra`/`lambda-auth` gone
- [ ] `AC-9` — no live AWS resource (CloudFront, S3, Lambda@Edge, Secrets Manager, CDK stacks) is modified or deleted by this ticket — confirmed by inspection: no `cdk destroy`, `aws s3`, or `aws secretsmanager` command is run
- [ ] `AC-10` — `.claude/agents/auth.md` and `.claude/agents/infra.md` do not exist; `CLAUDE.md` contains no word-boundary, case-insensitive match for "auth" or "infrastructure" anywhere in the file (deliberately excludes "author"/"authoring" substrings in the `@architect`/`@docs-writer` rows, which are unrelated and untouched)

## Steps

### Step 1 — Tests: skipped

No test setup exists for `apps/infra`, `apps/lambda-auth`, or the CI/CD workflow layer (confirmed: no `*.spec.ts`/`*.test.ts` in either app, no `test` nx target defined for either). This is a deletion and configuration-removal ticket; each step below is proven by a live operational check instead (nx workspace graph resolution, YAML parse, grep for dangling references), not a test suite.

### Step 2 — Auth: delete the Auth container

**Changes:**

- `apps/lambda-auth/` — delete entirely (`src/`, `project.json`, `package.json`, `build.ts`, `tsconfig*.json`, `README.md`, `.env.*`, `.gitignore`, `.secrets.*`)
- `scripts/ci/lambda-auth-build.sh` — delete (its only consumer was `apps/lambda-auth`'s own `build` nx target, just deleted)

**Verification:**

> Run: `yarn nx show projects`
> Expected: `lambda-auth` is not in the list
>
> Run: `git grep -l "lambda-auth-build.sh"` (from repo root)
> Expected: no matches

### Step 3 — Infra: delete the Infrastructure container

**Changes:**

- `apps/infra/` — delete entirely (`bin/`, `lib/`, `cdk.out/`, `cdk.json`, `project.json`, `package.json`, `tsconfig.json`, `README.md`, `.env.*`, `.gitignore`, `.secrets.example`)
- `apps/docs-web/.vitepress/theme/GraphExplorer/docUrl.ts` — its doc comment uses `apps/infra/README.md` as the illustrative example of an `AppReadme`-tier doc outside `docs/`; swap the example path to a still-existing app (e.g. `apps/harness-bootstrap-e2e/README.md`), no code logic change

**Verification:**

> Run: `yarn nx show projects`
> Expected: `infra` is not in the list
>
> Run: `git grep -n "apps/infra/README"` (from repo root)
> Expected: no matches

### Step 4 — Web: stub AWS-specific nx targets

**Changes:**

- `apps/docs-web/project.json` — keep the `deploy`, `env-push`, `env-pull`, `sm-push`, `sm-pull` target entries present (names unchanged, for anything that might still invoke them by name), but replace each one's `command`/`configurations` with a no-op stub: `echo "{target} retired — see solution/Architecture.md in docs/Stories/design/approved/[DESIGN-20261103-LBBI] Migrate Static Site Hosting to GitHub Pages/solution/" && exit 0`; drop their `envFile`/`env` configuration blocks (AWS-specific, no longer needed by a stub). Leave `typecheck`, `lint`, `serve`, `build`, `preview` untouched.
- `scripts/ci/site-deploy.sh` — delete (no stubbed target calls it anymore)
- `scripts/ci/site-build.sh` — remove the `load_env` function and its `GITHUB_ACTIONS` conditional call; the `build` target itself stays real (not stubbed) — only its AWS/SSM sub-behavior is removed. The script becomes just `node docs/.og/cli.mjs build --dir "$(pwd)"` → `node scripts/ci/check-tier-sync.mjs` → `(cd apps/docs-web && ../../node_modules/.bin/vitepress build)`, no AWS/SSM code path left

**Verification:**

> Run: `cat apps/docs-web/project.json | grep -A2 '"\(deploy\|env-push\|env-pull\|sm-push\|sm-pull\)"'`
> Expected: each target's `command` is the `echo ... && exit 0` stub, no `aws`/`site-deploy.sh`/SSM reference remains in any of the five
>
> Run: `yarn nx run docs-web:deploy`
> Expected: prints the retirement message and exits 0 (live operational check — the stub target actually runs clean, not just grep-confirmed)
>
> Run: `bash -n scripts/ci/site-build.sh` (bash syntax check) and `grep -n "aws ssm\|load_env" scripts/ci/site-build.sh`
> Expected: syntax check passes with no output (success); grep returns no matches
>
> Run: `yarn nx run docs-web:build`
> Expected: build succeeds locally (no `GITHUB_ACTIONS` env set, so this exercises the same code path CI will use post-cleanup) — confirms the simplified script still produces a working build

### Step 5 — CI: strip AWS auth and env from `ci.yml`

**Changes:**

- `.github/workflows/ci.yml` — remove the `uses: ./.github/actions/aws-auth` step and its `with:` block; remove `AWS_REGION`, `SITE_SSM_ENV_PARAM`, `LAMBDA_AUTH_SSM_ENV_PARAM` from the job's `env:` block; remove the top-level `permissions: id-token: write` (no longer needed without OIDC token exchange — `contents: read` stays). Lint/typecheck/test/build steps themselves are unchanged.

**Verification:**

> Run: `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/ci.yml','utf8')); console.log('valid')"`
> Expected: prints `valid` (confirms the edited YAML still parses)
>
> Run: `grep -n "aws-auth\|AWS_REGION\|SSM_ENV_PARAM\|CI_ROLE_ARN" .github/workflows/ci.yml`
> Expected: no matches
>
> Run: `yarn nx affected --target=build --base=HEAD~1 --head=HEAD` locally (simulates what CI will run)
> Expected: succeeds for `docs-web` (and any other affected project), confirming the workflow's remaining steps still work end to end without AWS

### Step 6 — CD: stub `cd.yml`, delete the now-unused auth action

**Changes:**

- `.github/workflows/cd.yml` — keep the file (reused as the skeleton for the GitHub Pages deploy workflow in Efforts item 3, a later ticket), but strip the AWS-specific job content: remove the top-level `permissions: id-token: write` (keep `contents: read`), remove the `env:` block's `AWS_REGION`/`SITE_SSM_ENV_PARAM`/`LAMBDA_AUTH_SSM_ENV_PARAM`, remove the `./.github/actions/aws-auth` step, and replace the `Deploy affected` step's `run: yarn nx affected --target=deploy ...` with a no-op placeholder: `run: echo "CD deploy retired pending GitHub Pages cutover — see solution/Architecture.md" && exit 0`. The `deploy` job keeps its name and trigger (`push: branches: [main]`), since item 3 builds its real steps into this same job.
- `.github/actions/aws-auth/` — delete entirely (GitHub Pages deploy uses GitHub's own OIDC to the Pages API, not AWS — this action has no reuse value, unlike `cd.yml` itself; its only consumers, `cd.yml` and `ci.yml`, no longer reference it after this step and Step 5)

**Verification:**

> Run: `ls .github/actions/aws-auth` 2>&1
> Expected: `No such file or directory`
>
> Run: `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/cd.yml','utf8')); console.log('valid')"`
> Expected: prints `valid`
>
> Run: `grep -n "aws-auth\|AWS_REGION\|SSM_ENV_PARAM\|id-token" .github/workflows/cd.yml`
> Expected: no matches
>
> Run: `bash -c 'echo "CD deploy retired pending GitHub Pages cutover — see solution/Architecture.md" && exit 0'` (the exact `run:` line written into the stub step)
> Expected: prints the message, exits 0 — confirms the stub step's shell command itself is valid and runs clean, not just grep-confirmed

### Step 7 — Harness governance: retire the `@auth`/`@infra` agent definitions

**Changes:**

- `.claude/agents/auth.md` — delete (entirely scoped to `apps/lambda-auth/`, now gone)
- `.claude/agents/infra.md` — delete (entirely scoped to `apps/infra/`, now gone)
- `CLAUDE.md` — remove the `Auth` and `Infrastructure` rows from the Architecture/Containers table; remove the `@auth` and `@infra` rows from the Agents table; fix line 15's guarded-command example (`yarn nx run infra:provision` — drop it, keep `cdk deploy`/`git push`); fix line 30's "Data flow" sentence (drop "Lambda@Edge auth gate" — the flow is now `Browser → CloudFront → S3`, or whatever the post-migration flow is at the time this runs); fix line 38's "Key constraint: basic auth password protection on all routes" (drop or replace — there is no auth gate anymore)

**Verification:**

> Run: `ls .claude/agents/ | grep -E "^(auth|infra)\.md$"`
> Expected: no matches
>
> Run: `grep -nwi "auth\|infrastructure" CLAUDE.md`
> Expected: no matches (`-w` word-boundary avoids false positives on "author"/"authoring" in the `@architect`/`@docs-writer` rows; case-insensitive catches lowercase mentions like "basic auth" or "infra:provision" that a table-only check would miss)
