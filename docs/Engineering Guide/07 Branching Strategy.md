---
id: 358e59f3
purpose: The trunk-based branching model, naming conventions, the two release lanes, the main ruleset, and how branches map to CI/CD and environments
keywords:
  [
    branching strategy,
    trunk-based,
    naming conventions,
    CI/CD,
    release lanes,
    ruleset,
    squash merge,
    rollback,
  ]
---

# Branching Strategy

The branching workflow is **trunk-based**, aligned with this project's actual CI/CD automation
(`ci.yml` on pull request, `cd.yml` on merge to `main`). There is one long-lived branch — `main` —
and all work happens on short-lived branches cut from it and merged straight back in. Nothing
reaches the deployed site without passing through the PR's required CI checks first.

## Flow

```mermaid
gitGraph
    commit id: "v1.5.0" tag: "v1.5.0"
    branch feat/ND-123-short-desc
    commit id: "feature work"
    checkout main
    merge feat/ND-123-short-desc id: "ND-123 squash-merged"
    branch fix/ND-456-short-desc
    commit id: "urgent fix"
    checkout main
    merge fix/ND-456-short-desc id: "ND-456 squash-merged"
```

Each merge commit needs its own custom `id` — Mermaid's `gitGraph` rejects a duplicate commit id
across the whole diagram, so reusing a generic label like `"PR squash-merged"` for every merge fails
to render; scope the id to the actual branch or ticket.

## Environment Mapping

| Branch Type        | Environment Target | Notes                                                                                                                                                                                                                  |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`             | `dev`              | `cd.yml` runs on every merge, but its deploy step is currently a retirement stub (no-op) — the AWS deploy mechanism was removed with the Infrastructure container, and no replacement (GitHub Pages) deploy exists yet |
| `feat/*` / `fix/*` | None (PR only)     | Validated by `ci.yml`; no preview environment is provisioned per branch                                                                                                                                                |

There is no separate `develop`/`staging`/`production` branch or environment today — one GitHub
Actions environment (`dev`) backs the whole pipeline, though it currently deploys nothing. A Dev →
Staging → Prod promotion chain is a reasonable future addition, not a default.

## Naming Conventions

- **Branches:** `<type>/short-description` (e.g. `feat/ND-123-oidc-role-split`), per
  [`01 Conventions.md`](./01%20Conventions.md)
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) —
  `<type>(<scope>): <what>`, per the same conventions doc
- **Tags:** two independent lanes, both automatic, never created by hand:
  - `vX.Y.Z` — the repository's own version, created by `semantic-release` on merge to `main` (`.github/workflows/release.yml`). Commits with scope `harness` or `harness-release` produce no `v*` release (`release.config.js` releaseRules).
  - `artisyn-implementation-harness-vX.Y.Z` — the harness package version. The PR picks and stamps it: the developer runs `yarn harness:version` on the branch and commits `chore(harness-release): <version>`. Nx Release bumps on commits that touch `skills/implementation-harness/` (`useCommitScope: false`, so Nx matches by path, not scope); the scope gate makes those commits `harness`-scoped. On merge, the harness release lane (`.github/workflows/release-harness.yml`) creates the tag through the API and publishes; it never pushes to `main`. Inert until the repository variable `HARNESS_RELEASE_ENABLED` is `true` — see `08 Harness Release Runbook.md`.

## CI/CD by Branch

| Trigger               | Runs                                                                                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat/*` / `fix/*` PR | `ci.yml` — audit, lint, typecheck, test, build for affected projects. No AWS role assumption — the AWS OIDC auth step was removed with the Infrastructure container                                        |
| `main` merge          | `cd.yml` — runs, but its deploy step is currently a retirement stub (no-op); no deploy mechanism exists until the GitHub Pages cutover lands                                                               |
| `main` merge          | `release.yml` — `semantic-release` computes the next version from Conventional Commits, tags, and publishes a GitHub release and `CHANGELOG.md` entry (scopes `harness`/`harness-release` excluded)        |
| `main` merge          | `release-harness.yml` — the harness package lane: tags the version the PR stamped (`artisyn-implementation-harness-v*`), publishes npm + ZIP + attestations; off until `HARNESS_RELEASE_ENABLED` is `true` |
| Hotfixes              | No separate branch type — a `fix/*` branch off `main`, same PR gate                                                                                                                                        |

See `.github/workflows/ci.yml` and `.github/workflows/cd.yml` for the current workflow definitions.

## Branch Protection

`main` is protected by a repository **ruleset** (Settings → Rules → Rulesets), not a classic
branch protection rule. The ruleset is set up per `08 Harness Release Runbook.md`, step 1.
`.github/CODEOWNERS` is configured, but it stays advisory until the ruleset requires Code Owner
review.

| Branch | Ruleset restrictions                                                                                                                                                                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main` | Pull request with 1 approval, last-push approval and resolved conversations; **squash merge only**; linear history; no deletion or force-push; `dev` deployment; required checks `ci`, `version-gate`, `rename-gate` with the branch up to date; bypass actor: GitHub Actions app |

Required status checks mirror job IDs `ci.yml` actually produces — don't require a check the
pipeline doesn't produce. The `harness-package` and `harness-cli` jobs run on every PR but are
advisory, not required. On 2026-11-16 the live ruleset had no required checks and no GitHub
Actions bypass yet; runbook step 1 lists what to add.

The harness lane needs no bypass: it never pushes to `main`, and branch rulesets do not cover the
tag it creates. The **GitHub Actions** app bypass is for the root lane only: `release.yml` pushes
its `chore(release)` commit with `GITHUB_TOKEN`, which cannot cross the ruleset without it (the
open part of TD-5). The live ruleset still lists the user who owned the old release PAT as a
bypass actor; releases no longer need it.

**Squash merges and the harness lane.** Every PR lands as one squash commit whose subject is the
PR title. The title does not decide the harness version: the PR's own commits do, and
`version-gate` checks that the branch is stamped with it. Still give a harness PR a
`harness`-scoped title (`feat(harness)!:` for a breaking change), so the root `v*` lane ignores
it. See `08 Harness Release Runbook.md`, step 4.

## Rollback Strategy

`semantic-release` still tags every merge to `main` with `vX.Y.Z`, giving each release a traceable
point in history and a generated `CHANGELOG.md` entry. `cd.yml` currently has no deploy to roll
back — its deploy step is a retirement stub pending the GitHub Pages cutover. A rollback strategy
for the actual deploy mechanism is undefined until that cutover lands.

## Related

- [`01 Conventions.md`](./01%20Conventions.md) — branch/commit naming format
- `.github/workflows/ci.yml` / `.github/workflows/cd.yml` — the CI/CD workflow implementation
  this doc describes
