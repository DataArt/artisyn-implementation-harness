---
id: 30b06f20
purpose: "Intent for retiring the Infrastructure and Auth containers' code (WBS item 5 of the GitHub Pages migration design), code-only"
keywords: [github-pages, infra-retirement, auth-retirement, intent]
---

# DESIGN-20261103-LBBI: Retire Existing Infra — Intent

**Provenance:** ticket `DESIGN-20261103-LBBI` (local design ID, no Jira ticket). Date 2026-11-03. Source: an approved design — `docs/Stories/design/approved/[DESIGN-20261103-LBBI] Migrate Static Site Hosting to GitHub Pages/solution/Architecture.md` is the spec, with `solution/Efforts.md` item 5 as the specific slice in scope here. Developer asked, in this session, to implement "only step 5 now."

## Problem

The repo still carries the AWS CDK Infrastructure container (`apps/infra/`) and the Lambda@Edge Auth container (`apps/lambda-auth/`), plus AWS-specific steps in `.github/workflows/cd.yml` and `ci.yml` (OIDC role assumption, SSM-sourced env vars). The approved design retires both containers entirely as part of migrating hosting to GitHub Pages — there is no replacement auth gate, and no AWS infrastructure remains.

## What better looks like

`apps/infra/` and `apps/lambda-auth/` no longer exist in the repo. `cd.yml` and `ci.yml` have no AWS OIDC auth step, no AWS-sourced env vars (`AWS_REGION`, `SITE_SSM_ENV_PARAM`, `LAMBDA_AUTH_SSM_ENV_PARAM`, `CI_ROLE_ARN`), and no AWS deploy job. The workspace (`nx.json`, root `package.json` if it references these apps) no longer lists them as projects.

Pulled forward from `solution/Efforts.md` item 6, since it becomes dead code the moment `cd.yml`'s AWS deploy job is removed: `apps/docs-web/project.json`'s AWS-specific nx targets (`deploy`, `env-push`, `env-pull`, `sm-push`, `sm-pull`) are stubbed/removed, and `scripts/ci/site-deploy.sh` plus the SSM-loading half of `scripts/ci/site-build.sh` are removed. `apps/docs-web`'s `build`/`typecheck`/`lint`/`serve` targets are untouched.

**Explicitly deferred — not "better" yet, by design:** the actual live AWS resources (CloudFront distribution, S3 bucket, Lambda@Edge function, Secrets Manager secret, the three CDK stacks) are NOT torn down as part of this ticket. They keep running, serving the site exactly as today, until a later ticket completes `solution/Efforts.md` items 2–3 (VitePress readiness + GitHub Pages CI/CD cutover) and verifies the new deploy path works.

## Who and what is affected

- **Infrastructure container** (`apps/infra/`) — retired entirely (code deletion only, this ticket).
- **Auth container** (`apps/lambda-auth/`) — retired entirely (code deletion only, this ticket).
- **Web container** (`apps/docs-web/`) — not touched by this ticket; its own readiness work (base path, CSP, WASM fetch) is a separate WBS item (2), not in scope here.
- CI/CD workflows (`.github/workflows/cd.yml`, `ci.yml`) — AWS-specific steps removed; no replacement deploy mechanism is added by this ticket (that's item 3, separately).
- No end users are affected by this ticket alone: the live site is unaffected, since the actual AWS resources keep running untouched.

## Out of scope (this ticket)

- Running `cdk destroy` or any AWS resource deletion (S3 bucket, Secrets Manager secret, CloudFront distribution, Lambda@Edge function). These are explicitly deferred — see "What better looks like" above. When the time comes, these are guarded, developer-run commands, never run by the agent directly.
- `solution/Efforts.md` items 1 (content/secrets review), 2 (VitePress readiness), 3 (GitHub Pages CI/CD cutover), and 4 (public cutover) — each is its own separate dev ticket, run later. Item 6 is partially absorbed here (the nx-target/script cleanup only — see above); nothing else from item 6 is implied.
- Any change to `apps/docs-web/`'s build/typecheck/lint/serve targets, its VitePress config, or its source content.

## Constraints

- `solution/Architecture.md` and `solution/Efforts.md` (specifically item 5's description and Decision Register item 9) are the approved spec — this ticket implements only the code-deletion portion of item 5, not its AWS-teardown portion, per explicit developer direction this session (see Provenance).
- Must not touch the unrelated, already-committed CSP (`ResponseHeadersPolicy`) work that was in-flight on `apps/infra/lib/docs-stack.ts` at the start of the design session — that work has since landed in `main` as part of normal development; deleting `apps/infra/` deletes it along with everything else in that app, which is expected and fine (it's dead code once Infrastructure retires), not something to carve out specially.
- Region must never appear hardcoded (repo-wide convention) — not relevant to a deletion, but any remaining references in other files (docs, scripts) should not be touched by this ticket; that's Document stage or a separate ticket's job if found.

## Open questions

None — the sequencing conflict (item 5 depending on item 3) was raised and resolved with the developer this session: do the code-deletion portion of item 5 now, defer the AWS teardown commands to a later ticket once items 2–3 land.
