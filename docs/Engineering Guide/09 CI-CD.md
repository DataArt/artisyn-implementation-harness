---
id: 6d1a1114
purpose: "The single home for this repo's CI/CD: every GitHub Actions workflow, its jobs, permissions and credentials, required vs advisory checks, how to reproduce each gate locally, and the two release lanes"
keywords:
  [
    CI/CD,
    GitHub Actions,
    ci.yml,
    cd.yml,
    gitleaks,
    release.yml,
    release-harness.yml,
    required checks,
    GitHub Pages,
    husky,
    release lanes,
  ]
---

# CI/CD

Pull requests to `main` run the checks; a merge to `main` deploys the site to GitHub Pages and runs both release lanes. Five workflows in `.github/workflows/` do all of it. Nothing deploys or publishes from a branch.

```mermaid
flowchart LR
    subgraph TRIG ["  Triggers  "]
        PR(["Pull request to main\nopened · synchronize · reopened"]):::trigger
        PUSH(["Push to main\n(squash merge)"]):::trigger
    end

    subgraph WF ["  Workflows  "]
        CI["ci.yml\nci · version-gate · rename-gate\nharness-package · harness-cli"]:::gate
        GL["gitleaks.yml\nscan"]:::advisory
        CD["cd.yml\ndeploy"]:::deploy
        REL["release.yml\nsemantic-release"]:::release
        RH["release-harness.yml\nNx Release version, tag + publish"]:::release
    end

    subgraph OUT ["  Outputs  "]
        CHK["Status checks on the PR"]:::gate
        PAGES["GitHub Pages site\napps/web-portal/dist"]:::deploy
        VTAG["v* tag · GitHub Release\nCHANGELOG.md commit"]:::release
        HTAG["artisyn-implementation-harness-v* tag\nnpm on GitHub Packages · ZIP + sha256\nbuild attestations"]:::release
    end

    PR --> CI --> CHK
    PR --> GL --> CHK
    PUSH --> GL
    PUSH --> CD --> PAGES
    PUSH --> REL --> VTAG
    PUSH -->|"if HARNESS_RELEASE_ENABLED"| RH --> HTAG

    classDef trigger fill:#EDE9FE,stroke:#7C3AED,color:#4c1d95
    classDef gate fill:#FEF3C7,stroke:#D97706,color:#78350f
    classDef advisory fill:#F1F5F9,stroke:#94A3B8,color:#334155
    classDef deploy fill:#DCFCE7,stroke:#15803D,color:#14532D
    classDef release fill:#DBEAFE,stroke:#2563EB,color:#1e3a8a
    style TRIG fill:#F5F3FF,stroke:#7C3AED
    style WF fill:#FFFBEB,stroke:#D97706
    style OUT fill:#F0FDF4,stroke:#15803D
```

Every job that installs dependencies uses the composite action `.github/actions/setup`: Node 24, `corepack enable`, a Yarn cache keyed on `yarn.lock`, then `yarn install --immutable`.

## Workflows

### `ci.yml` — pull request checks

`ci.yml` runs on every pull request to `main` (`opened`, `synchronize`, `reopened`). Workflow permission is `contents: read`. It reads no secrets and no repository variables. Every job checks out full history (`fetch-depth: 0`) except `harness-cli`.

| Job               | Runner                    | What it checks                                                                                                                                                                                                                                       |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci`              | ubuntu, environment `dev` | `yarn npm audit --all --severity moderate`; `nx affected` lint, typecheck, test and build (`--configuration=ci`) against `origin/<base>`; `yarn nx run log-hub:verify` (Log Hub canonical isolation)                                                 |
| `version-gate`    | ubuntu                    | `stamp-harness-version.mjs --check` (every manifest carries the `package.json` version); `version-harness.mjs --check` (the branch is stamped with the version its commits call for, with a matching changelog entry)                                |
| `rename-gate`     | ubuntu                    | `check-rename.mjs` (retired package name and full-name misuse); `check-docs.mjs` (install instructions pinned, no `/releases/latest` links); `check-commit-scope.mjs --range origin/<base>..HEAD` (commits touching the harness use scope `harness`) |
| `harness-package` | ubuntu                    | `pack-shim.mjs` then `ci/check-pack.mjs` (package contents match the allowlist); `validate-plugin.mjs` with a pinned `@anthropic-ai/claude-code` via `yarn dlx`; `nx release version --dry-run` for the harness project                              |
| `harness-cli`     | ubuntu, macOS, Windows    | Vitest specs for the install CLI, the migrator and the state root (`vitest.unit.config.ts`). On Windows a first step runs `git config --system core.longpaths true`, because patch bundle paths exceed 260 characters                                |

The `dev` environment on the `ci` job exists for the ruleset's "deployment to `dev`" rule. The job deploys nothing.

### `gitleaks.yml` — secret scan

`gitleaks.yml` scans the full git history on every pull request to `main` and every push to `main`. One job, `scan`, with `contents: read`. It downloads the MIT gitleaks binary at a pinned version (`GITLEAKS_VERSION`), verifies its `GITLEAKS_SHA256` with `sha256sum -c`, then runs `gitleaks git --config .gitleaks.toml --redact --log-opts="--all"`. The official gitleaks action is not used: it needs a license key for organization repos. No secrets.

### `cd.yml` — GitHub Pages deploy

`cd.yml` builds the site and deploys it to GitHub Pages on every push to `main`. One job, `deploy`, in the `github-pages` environment, with `contents: read`, `pages: write` and `id-token: write`. Concurrency group `pages` queues deploys and never cancels one in progress.

| Step            | What it does                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Build site      | `yarn nx affected --target=build --configuration=ci --base=HEAD~1 --head=HEAD`, with four repository variables |
| Configure Pages | `actions/configure-pages@v5`                                                                                   |
| Upload artifact | `actions/upload-pages-artifact@v4`, path `apps/web-portal/dist` (the composed Web Explorer + Web Docs tree)    |
| Deploy          | `actions/deploy-pages@v4`                                                                                      |

The build reads repository variables `VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`, `VITE_GISCUS_REPO_ID` and `VITE_GISCUS_CATEGORY_ID`. Vite inlines them at build time; the `ci` build configuration loads no `.env` file. See [Giscus Setup](./Infrastructure/04%20Giscus%20Setup.md) for their values.

The build covers only projects affected by the merged commit (`--base=HEAD~1`). `apps/web-portal/dist` exists only when `web-portal` was affected; `web-portal` is affected whenever Web Explorer or Web Docs changes. How the tree is assembled: [Web Portal LLD](../System%20Architecture%20%28LLD%29/Web%20Portal/00.%20Overview.md).

### `release.yml` — root `v*` release lane

`release.yml` runs `yarn semantic-release` on every push to `main`. Permissions: `contents`, `issues` and `pull-requests` write. Credential: `GITHUB_TOKEN`; git author and committer are `github-actions[bot]`. `release.config.js` analyses Conventional Commits, writes `CHANGELOG.md`, bumps the root `package.json` (no npm publish), commits both as `chore(release): <version> [skip ci]` through `@semantic-release/git`, and creates the `v*` tag and GitHub Release. Commits with scope `harness` or `harness-release` produce no root release.

### `release-harness.yml` — harness release lane

`release-harness.yml` tags and publishes the harness version that `main` carries, on every push to `main`. The PR already chose that version: the developer runs `yarn harness:version` on the branch, and `version-gate` checks it. The workflow never commits or pushes to `main`.

| Item        | Value                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gate        | Job runs only when repository variable `HARNESS_RELEASE_ENABLED` is `'true'`                                                                               |
| Permissions | `contents`, `packages`, `id-token`, `attestations` write; concurrency group `release-harness`, no cancel                                                   |
| Credentials | `GITHUB_TOKEN` only (as `GITHUB_PACKAGES_TOKEN` and `GH_TOKEN`); checkout with `persist-credentials: false`                                                |
| Tag         | Reads the version from `skills/implementation-harness/package.json`; creates `artisyn-implementation-harness-v<version>` on `GITHUB_SHA` through `gh api`  |
| Publish     | Builds the tarball, the ZIP and its `.sha256`; attests the tarball and the ZIP; `yarn npm publish --tolerate-republish`; `gh release create` + `upload`    |
| Re-run      | When the tag exists and the package and ZIP assets are published, it stops. When something is missing, it rebuilds from the tag and finishes it            |
| Failure     | When the tag exists but the merged commit changes `skills/implementation-harness` after it, the run fails: a PR merged a version that was already released |

Fix that failure with a new branch that runs `yarn harness:version` and merges the stamp. Step-by-step operation: [08 Harness Release Runbook](./08%20Harness%20Release%20Runbook.md). Internals: [Harness Release Pipeline LLD](../System%20Architecture%20%28LLD%29/Harness%20Release%20Pipeline/00.%20Overview.md).

## Required and advisory checks

The target required checks on `main` are `ci`, `version-gate` and `rename-gate`. They are the job IDs `ci.yml` produces. Everything else reports on the PR but does not block the merge.

| Check                                    | Status   |
| ---------------------------------------- | -------- |
| `ci`                                     | required |
| `version-gate`                           | required |
| `rename-gate`                            | required |
| `harness-package`                        | advisory |
| `harness-cli (<os>)` — three matrix runs | advisory |
| gitleaks `scan`                          | advisory |

On 2026-11-16 the live ruleset on `main` had an empty required-check list. [Runbook](./08%20Harness%20Release%20Runbook.md) step 1 says to add the three checks. The same ruleset already enforces squash-only merges, linear history, a branch up to date with `main`, and a successful deployment to `dev`. Full ruleset: [07 Branching Strategy](./07%20Branching%20Strategy.md#branch-protection).

## Local vs CI

Husky runs two hooks on every commit; everything else runs only in CI unless you run it yourself. `yarn install` installs the hooks (`postinstall: husky`).

| Hook         | What it runs                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | `yarn lint-staged`: `eslint --fix` + `prettier --write` on staged `ts/tsx/js/mjs`; `prettier --write` on `json/md/yaml/yml`              |
| `commit-msg` | `node scripts/check-commit-scope.mjs --message-file "$1"`: a commit touching harness paths must use scope `harness` or `harness-release` |

Reproduce each CI gate locally from the repo root with Node 24. The package manager is `yarn`; never use `npm` or `npx` in this repo.

| Gate              | Local command                                                                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci`              | `yarn npm audit --all --severity moderate` · `yarn nx affected --target=lint --base=origin/main --head=HEAD` (same for `typecheck`, `test`, and `build --configuration=ci`) · `yarn nx run log-hub:verify`                                                     |
| `version-gate`    | `git fetch --tags` · `node scripts/release/stamp-harness-version.mjs --check` · `node scripts/release/version-harness.mjs --check`                                                                                                                             |
| `rename-gate`     | `node scripts/check-rename.mjs` · `node scripts/check-docs.mjs` · `node scripts/check-commit-scope.mjs --range origin/main..HEAD`                                                                                                                              |
| `harness-package` | `node scripts/pack-shim.mjs` · `node scripts/ci/check-pack.mjs` · `CLAUDE_CMD="yarn dlx --quiet -p @anthropic-ai/claude-code@2.1.311 claude" node scripts/validate-plugin.mjs` · `yarn nx release version --projects=artisyn-implementation-harness --dry-run` |
| `harness-cli`     | `yarn workspace @artisyn-harness/implementation-harness-e2e vitest run --config vitest.unit.config.ts src/tests/unit/cli src/tests/unit/legacy src/tests/unit/state-root.spec.ts`                                                                              |
| gitleaks          | A local gitleaks binary: `gitleaks git --config .gitleaks.toml --redact --log-opts="--all" .`                                                                                                                                                                  |

`version-harness.mjs --check` needs the harness tags locally; it computes the version from the latest `artisyn-implementation-harness-v*` tag reachable from HEAD.

## Two release lanes

Both release lanes run on every push to `main` and never touch each other's tags. Commit scope decides which lane a commit counts for.

| Aspect           | Root `v*` lane                                         | Harness lane                                                                         |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Workflow         | `release.yml`                                          | `release-harness.yml`                                                                |
| Tool             | semantic-release (`release.config.js`)                 | Nx Release (`nx.json` `release` block) via `version-harness.mjs`                     |
| Version decided  | On `main`, at merge time                               | In the PR, by `yarn harness:version`; checked by `version-gate`                      |
| Commits counted  | All except scopes `harness`, `harness-release`         | Commits touching `skills/implementation-harness/` (by path, `useCommitScope: false`) |
| Tag              | `vX.Y.Z`                                               | `artisyn-implementation-harness-vX.Y.Z`                                              |
| Outputs          | GitHub Release, `CHANGELOG.md` + `package.json` commit | npm on GitHub Packages, ZIP + `.sha256`, build attestations, GitHub Release          |
| Writes to `main` | Yes: `chore(release)` commit                           | No: tag created through the API                                                      |
| Enable switch    | None                                                   | `HARNESS_RELEASE_ENABLED`                                                            |

The root lane has an open point (TD-5). `@semantic-release/git` pushes the `chore(release)` commit to `main` with `GITHUB_TOKEN`. The ruleset blocks that push unless the GitHub Actions app is a bypass actor. Runbook step 1 lists the bypass as missing on 2026-11-16. The harness lane needs no bypass: branch rulesets do not cover tags, packages or releases.

## Guarded commands

CI never runs a guarded command; the developer starts each one.

- `yarn nx run implementation-harness-e2e:agent-e2e` spends real agent budget. It never runs in CI.
- `git push`, including the runbook's baseline tag push.

A region is deployment configuration only. Never hardcode one in a workflow, script or doc.

## Related

- [07 Branching Strategy](./07%20Branching%20Strategy.md) — branch flow, naming, the `main` ruleset, rollback
- [08 Harness Release Runbook](./08%20Harness%20Release%20Runbook.md) — one-time setup, per-PR versioning, smoke checks
- [Harness Release Pipeline LLD](../System%20Architecture%20%28LLD%29/Harness%20Release%20Pipeline/00.%20Overview.md) — harness lane internals and gate scripts
- [Web Portal LLD](../System%20Architecture%20%28LLD%29/Web%20Portal/00.%20Overview.md) — the composed Pages artifact
- [Web Docs LLD](../System%20Architecture%20%28LLD%29/Web%20Docs/00.%20Overview.md) — the VitePress build
- [Giscus Setup](./Infrastructure/04%20Giscus%20Setup.md) — the `VITE_` values
- [01 Conventions](./01%20Conventions.md) — commit and branch format
