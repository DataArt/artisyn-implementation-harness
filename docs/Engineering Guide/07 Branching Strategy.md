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

| Branch Type        | Environment Target  | Notes                                                                                |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------ |
| `main`             | `dev` (auto-deploy) | Every merge triggers `cd.yml`; `nx affected --target=deploy` ships only what changed |
| `feat/*` / `fix/*` | None (PR only)      | Validated by `ci.yml`; no preview environment is provisioned per branch              |

There is no separate `develop`/`staging`/`production` branch or environment today — one GitHub
Actions environment (`dev`) backs the whole pipeline. A Dev → Staging → Prod promotion chain is a
reasonable future addition, not a default.

## Naming Conventions

- **Branches:** `<type>/short-description` (e.g. `feat/ND-123-oidc-role-split`), per
  [`01 Conventions.md`](./01%20Conventions.md)
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) —
  `<type>(<scope>): <what>`, per the same conventions doc
- **Tags:** none created today — see [Rollback Strategy](#rollback-strategy)

## CI/CD by Branch

| Trigger               | Runs                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `feat/*` / `fix/*` PR | `ci.yml` — audit, lint, typecheck, build for affected projects, using the SSM-read-only `CiReadRole` |
| `main` merge          | `cd.yml` — `nx affected --target=deploy`, using the write-scoped `DeployRole`                        |
| Hotfixes              | No separate branch type — a `fix/*` branch off `main`, same PR gate, same deploy path                |

See [`Infrastructure/03 CI-CD Pipeline.md`](./Infrastructure/03%20CI-CD%20Pipeline.md) for the full
workflow and the `CiReadRole`/`DeployRole` OIDC trust split.

## Branch Protection

`main` branch protection and a `.github/CODEOWNERS` file are not yet configured in this repository.
This matters beyond general hygiene: the `CiReadRole`/`DeployRole` OIDC split only prevents an
unreviewed PR from reaching deploy-grade credentials — it assumes someone actually reviews the PR
before merge. Until branch protection enforces that, the split's guarantee is weaker than it looks.

Recommended, once configured:

| Branch | Restrictions                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------- |
| `main` | Direct pushes disabled; at least one Code Owner approval required; squash merge only; no force-push |

Required status checks should mirror what `ci.yml` actually runs (audit, lint, typecheck, build) —
don't require a check the pipeline doesn't produce.

## Rollback Strategy

No release tagging or artifact-pinned rollback exists today. A bad deploy is rolled back by
reverting the offending commit on `main` and letting `cd.yml` redeploy the reverted state — there is
no mechanism to redeploy a previously built artifact without going through CI/CD again.

## Related

- [`01 Conventions.md`](./01%20Conventions.md) — branch/commit naming format
- [`Infrastructure/03 CI-CD Pipeline.md`](./Infrastructure/03%20CI-CD%20Pipeline.md) — the CI/CD
  workflow implementation this doc describes
