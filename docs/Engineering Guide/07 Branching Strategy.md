---
id: 358e59f3
purpose: The trunk-based branching model, naming conventions, the harness release tag, the main ruleset, and how branches map to CI/CD and environments
keywords:
  [
    branching strategy,
    trunk-based,
    naming conventions,
    CI/CD,
    release lane,
    ruleset,
    squash merge,
    rollback,
  ]
---

# Branching Strategy

The branching workflow is **trunk-based**, aligned with this project's actual CI/CD automation
(`ci-web.yml` and `ci-harness.yml` on pull request, `deploy-web.yml` on every merge to `main`, deploying when the site is affected). There is one long-lived branch — `main` —
and all work happens on short-lived branches cut from it and merged straight back in. Every change
reaches `main`, and the deployed site, through a pull request.

## Flow

```mermaid
gitGraph
    commit id: "main"
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

| Branch Type        | Environment Target  | Notes                                                                                                                                        |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`             | `github-pages`      | `deploy-web.yml` runs on every merge, builds affected projects and deploys `apps/web-portal/dist` to GitHub Pages when the build produced it |
| `feat/*` / `fix/*` | `web` (checks only) | `ci-web.yml`'s `build-and-test` job runs in the `web` environment and deploys nothing; no preview site per branch                            |

There is no `develop`, `staging` or `production` branch. The target is three GitHub Actions
environments: `web`, which holds the site's build variables and which the ruleset requires as a
deployment on every PR; `github-pages`, the live site; and `release`, whose required reviewers
approve each harness publish. None maps to a branch. On 2026-11-17 a fourth, the old `dev`
environment, still existed; the ruleset's required deployment was switched from `dev` to `web`
that day, and `dev` is deleted after the merge (runbook step 1).

## Naming Conventions

- **Branches:** `<type>/short-description` (e.g. `feat/ND-123-oidc-role-split`), per
  [`01 Conventions.md`](./01%20Conventions.md)
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) —
  `<type>(<scope>): <what>`, per the same conventions doc
- **Tags:** one release lane, never created by hand. The repository itself is not
  versioned: there are no `vX.Y.Z` tags, and the root `CHANGELOG.md` is frozen history.
  - `artisyn-implementation-harness-vX.Y.Z` — the harness package version. The PR picks and stamps it: the developer runs `yarn harness:version` on the branch and commits `chore(harness-release): <version>`. Nx Release bumps on commits that touch `skills/implementation-harness/` (`useCommitScope: false`, so Nx matches by path, not scope); the scope gate makes those commits `harness`-scoped. On every merge, the harness release lane (`.github/workflows/deploy-harness.yml`) builds and attests the version. After a reviewer approves the `release` environment, it creates the tag through the API and publishes. It never pushes to `main` — see `08 Harness Release Runbook.md`.

## CI/CD by Branch

A PR to `main` runs `ci-web.yml` (build, test, `docs-gate` and the secret scan, on every PR) and
`ci-harness.yml` (the harness gates, only when the PR touches the harness) side by side. A merge to
`main` runs `ci-web.yml`'s `gitleaks` job (the full-history secret scan; no other `ci-web.yml` job
runs on push) and `deploy-web.yml` (the GitHub Pages deploy).
`deploy-web.yml` deploys only when Nx finds the site affected; otherwise it ends with a notice and
deploys nothing. A merge that
touches the harness also runs the harness release lane (`deploy-harness.yml`: build on merge,
publish after approval; the deploy does not wait for it). A hotfix is
a `fix/*` branch off `main` with the same PR gate. Workflows, jobs, required checks and how to run
each gate locally: [09 CI-CD](./09%20CI-CD.md).

## Branch Protection

`main` is protected by a repository **ruleset** (Settings → Rules → Rulesets), not a classic
branch protection rule. The ruleset is set up per `08 Harness Release Runbook.md`, step 1.
`.github/CODEOWNERS` is configured, but it stays advisory until the ruleset requires Code Owner
review.

| Branch | Ruleset restrictions                                                                                                                                                                                                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main` | Pull request with 1 approval, last-push approval and resolved conversations; **squash merge only**; linear history; no deletion or force-push; `web` deployment; required checks `build-and-test`, `docs-gate`, `version-gate`, `harness-package`, `harness-unit` with the branch up to date; no bypass actors |

Required status checks mirror job IDs the PR workflows actually produce (`build-and-test` and
`docs-gate` from `ci-web.yml`; `version-gate`, `harness-package` and `harness-unit` from
`ci-harness.yml`) — don't require a check the pipeline doesn't produce. D-17 named the first three;
the set was extended on 2026-11-17 with `harness-package` and `harness-unit`. The three
`ci-harness.yml` checks are skipped on a PR that does not touch the harness, and a skipped job
reports success. `harness-cli (<os>)` stays advisory, so one flaky macOS or Windows runner can't
block a merge; `gitleaks` and `changes` are advisory too. On 2026-11-17 the live ruleset's
required deployment was switched from `dev` to `web` at 20:33, but its required-check list was
still empty. With no required check, GitHub does not apply the "branch up to date" setting either.
`main` still ran the old `ci.yml`, which deploys to `dev`, so until this change merges every other
PR is blocked. Runbook step 1 adds all five checks.

The ruleset needs no bypass actors. No workflow pushes to `main`, and branch rulesets do not
cover the tag the harness lane creates. On 2026-11-16 the live ruleset still listed two bypass
actors, the GitHub Actions app and the user who owned the old release PAT; on 2026-11-17 one
remained, with bypass mode "always". Runbook step 1 says to remove all of them. A bypass push skips the
PR checks; the `gitleaks` push run on `main` detects a secret in it only after the fact, since the
public repository exposes it at once ([09 CI-CD](./09%20CI-CD.md)).

**Squash merges and the harness lane.** Every PR lands as one squash commit whose subject is the
PR title. The title does not decide the harness version: the PR's own commits do, and
`version-gate` checks that the branch is stamped with it. Still give a harness PR a
`harness`-scoped title (`feat(harness)!:` for a breaking change), so harness changes stand apart
in history and the changelog. See `08 Harness Release Runbook.md`, step 4.

## Rollback Strategy

Roll the site back by reverting on `main`. Open a PR that reverts the bad change and merge it.
The revert affects the site, so `deploy-web.yml` builds and deploys the reverted tree like any
other site merge. `deploy-web.yml` has no manual trigger and no deploy-by-ref input. Re-running an
earlier `Deploy web` run from the Actions tab rebuilds and redeploys that run's push. The next
site merge deploys over it.

Harness release tags are traceable points, not rollback switches. The harness lane has no
unpublish step: fix forward with a new version through `yarn harness:version`. Package rollback
per channel: [Versioning and Releases](../Harness/09%20Distribution/03%20Versioning%20and%20Releases.md#rollback).

## Related

- [`01 Conventions.md`](./01%20Conventions.md) — branch/commit naming format
- [`09 CI-CD.md`](./09%20CI-CD.md) — every workflow, its checks, and the release lane
