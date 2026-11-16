---
id: bbd79b2b
purpose: 'Developer/admin runbook for the harness release lane: ruleset checks, the release environment with required reviewers, the baseline tag, the per-PR yarn harness:version step, the automatic build on merge, the approval that starts publish, the publish-npmjs stub and its npmjs.com setup, the first 4.0.0 release and the per-channel smoke checklist'
keywords:
  [
    release runbook,
    harness:version,
    version-harness.mjs,
    ruleset,
    release environment,
    required reviewers,
    approval,
    immutable releases,
    baseline tag,
    smoke checklist,
    harness release,
    changelog,
    release notes,
  ]
---

# Harness Release Runbook

The harness is versioned in the PR, built on merge and published after a reviewer approves. The developer stamps the version on the feature branch. After the squash merge, `release-harness.yml` builds and attests that version automatically. The `release` job then waits in the `release` environment; once a reviewer approves, it creates the tag, and `publish-github-packages` and `publish-github` publish to every channel at once. It is the repository's only release lane. No workflow commits or pushes to `main`, so releases need no PAT, no GitHub App and no ruleset bypass (TD-5, agreed 2026-11-16).

```mermaid
flowchart TB
    subgraph SETUP ["  One-time setup  "]
        RS["1️⃣ Ruleset on main\nadd the 3 required checks\nremove the bypass actors"]:::setup
        ENV["2️⃣ Environment release\nrequired reviewers"]:::setup
        BT["3️⃣ Push the baseline tag\nartisyn-implementation-harness-v3.5.0"]:::setup
    end

    subgraph PR ["  Every harness PR  "]
        HV["4️⃣ yarn harness:version\ncommit chore(harness-release): v"]:::pr
        VG["version-gate\nversion-harness.mjs --check"]:::pr
    end

    subgraph MERGE ["  On merge to main  "]
        BUILD["5️⃣ build job (automatic)\ntarball · ZIP + sha256 · attest\nartifact harness-release"]:::release
        APPROVE{{"6️⃣ Reviewer approves\nthe release deployment"}}:::gate
        TAG["release job\ntag via API"]:::release
        NPM["publish-github-packages job\nGitHub Packages"]:::release
        GHR["publish-github job\nGitHub Release"]:::release
        STUB["publish-npmjs job (stub)\npublishes nothing"]:::stub
        SMOKE["8️⃣ Smoke every channel"]:::release
    end

    RS --> ENV --> BT --> HV --> VG -->|"squash merge"| BUILD --> APPROVE --> TAG
    TAG --> NPM --> SMOKE
    TAG --> GHR --> SMOKE
    TAG --> STUB

    classDef setup fill:#DBEAFE,stroke:#2563EB,color:#1e3a8a
    classDef pr fill:#FEF3C7,stroke:#D97706,color:#78350f
    classDef gate fill:#FCE7F3,stroke:#BE185D,color:#831843
    classDef release fill:#DCFCE7,stroke:#15803D,color:#14532D
    classDef stub fill:#F1F5F9,stroke:#94A3B8,color:#334155
    style SETUP fill:#EFF6FF,stroke:#2563EB
    style PR fill:#FFFBEB,stroke:#D97706
    style MERGE fill:#F0FDF4,stroke:#15803D
```

## 1. Ruleset on `main`

One ruleset (Settings → Rules → Rulesets) targets the default branch. It already exists; check it against this list and add what is missing:

| Rule                 | Setting                                                                                     | State on 2026-11-16 |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| Pull request         | 1 approval, approval of the last push, conversations resolved; merge method **squash only** | set                 |
| Linear history       | required                                                                                    | set                 |
| Deletion, force push | blocked                                                                                     | set                 |
| Deployment           | environment `dev` (the `ci` job deploys to it)                                              | set                 |
| Status checks        | `ci`, `version-gate`, `docs-gate` (job IDs from `ci.yml`); branch must be up to date        | **empty — add**     |
| Bypass actors        | none                                                                                        | **remove all**      |

The ruleset needs no bypass actors. No workflow pushes to `main`, and branch rulesets do not cover tags, packages or releases, so `GITHUB_TOKEN` can create the tag through the API, publish and create the Release.

On 2026-11-16 the live ruleset listed two bypass actors: the GitHub Actions app and the user who owned the old release PAT. Remove both.

The release needs no secret. The old flow used a `HARNESS_RELEASE_TOKEN` secret and a `HARNESS_RELEASE_BOT` variable; nothing reads them now. Delete the secret if it was created; leave the variable unset.

## 2. The `release` environment

The `release` job runs in the environment `release`; its required reviewers are the approval gate. Create it before PR #20 merges. If it does not exist, GitHub creates it on first use with no protection, and the release runs without approval.

| Setting (Settings → Environments → `release`) | Value                                          |
| --------------------------------------------- | ---------------------------------------------- |
| Required reviewers                            | The maintainers who may release the harness    |
| Prevent self-review                           | Optional: the person who merged cannot approve |
| Deployment branches and tags                  | Optional: selected branches, `main` only       |

Also recommended: enable immutable releases (Settings → General → Releases). The `publish-github` job creates the Release as a draft, uploads the ZIP and `.sha256`, and only then publishes it, so the assets are in place before the Release becomes immutable.

## 3. Baseline tag

Nx computes each version from the latest `artisyn-implementation-harness-v*` tag reachable from HEAD. The baseline tag `artisyn-implementation-harness-v3.5.0` sits on `c8d82c9`, the tip of `main` before PR #20. Push it once, before `version-gate` can pass on PR #20 (`git push` is a guarded command; the developer runs it):

```bash
git push origin artisyn-implementation-harness-v3.5.0
```

The release workflow has no enable switch: it runs on every push to `main`. Finish steps 1 to 3 before the first harness PR merges.

## 4. Every harness PR: `yarn harness:version`

Before you open or merge a PR that changes the harness, stamp its version on the feature branch:

```bash
yarn harness:version
git commit -am "chore(harness-release): <version>"
```

Then push like any other commit. `scripts/release/version-harness.mjs` does the work:

| Step    | What it does                                                                                                                      |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Compute | Latest harness tag reachable from HEAD + the conventional commits after it (Nx Release). A re-run gives the same version          |
| Stamp   | `skills/implementation-harness/package.json`, then every manifest through `stamp-harness-version.mjs`                             |
| Log     | Writes or replaces the changelog entry; drops entries for unreleased versions left by earlier runs. Entries link the PR's commits |
| No bump | When the commits call for no release, it changes nothing and says so                                                              |

The developer commits the version, not CI. A commit pushed with `GITHUB_TOKEN` starts no workflows, so the PR head would have no checks. The ruleset also requires approval of the last push.

`version-gate` in `ci.yml` runs `node scripts/release/version-harness.mjs --check` (full history, `fetch-depth: 0`). It fails when:

- the branch is not stamped with the computed version;
- the changelog has no entry for that version;
- the changelog has an entry for a version this branch does not release.

**Two PRs, one version.** The ruleset requires the branch to be up to date. When two PRs claim the same version, the first merges and, once approved, gets the tag; the second must update from `main` and re-run `yarn harness:version`. The tag exists only after approval, so while a release waits, `version-gate` fails every PR that changes the harness: `main` carries a version that is not released yet. Approve the waiting release, then re-run the check and `yarn harness:version`. PRs that don't touch the harness are not blocked. As a backstop, the `build` and `release` jobs stop when the version's tag already exists and the commit changes the harness after it.

**Squash title.** The version comes from the PR's own commits, which husky and the CI scope check (`check-commit-scope.mjs --range`) both check. The squash title no longer decides the version. Still give it a `harness`-scoped Conventional Commit subject, so harness changes stand apart in history and the changelog.

**The changelog entry.** `scripts/release/changelog-renderer.mjs` writes it in the format semantic-release used (the root `CHANGELOG.md` has old examples):

```markdown
## [4.1.0](https://github.com/DataArt/artisyn-implementation-harness/compare/artisyn-implementation-harness-v4.0.0...artisyn-implementation-harness-v4.1.0) (2026-11-20)

### Features

- **harness:** <subject> ([abc1234](https://github.com/DataArt/artisyn-implementation-harness/commit/<hash>))
```

Sections come in this order: `⚠ BREAKING CHANGES`, `Features`, `Bug Fixes`, `Performance Improvements`, `Reverts`. Bullets are sorted by scope, then subject. Commits of hidden types (refactor, docs, chore, ci, test, …) are left out. Re-running `yarn harness:version` replaces the entry of the same version.

Changelog entries link to the PR's commit hashes. After the squash merge those commits stay reachable on GitHub through the PR.

## 5. On merge: the build job

On every push to `main`, the `build` job reads the version from `skills/implementation-harness/package.json` at the pushed commit and decides what to do:

| State                                                                                 | Action                                                                                                                                      |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Tag exists and the commit changes `skills/implementation-harness` after it            | Fails: a PR merged a version that is already released                                                                                       |
| GitHub Packages has the version and a non-draft Release carries the ZIP and `.sha256` | Prints "fully published" and ends green; the later jobs are skipped, no approval is asked                                                   |
| Anything is missing                                                                   | Builds the tarball, the ZIP and its `.sha256`, attests both, keeps them as artifact `harness-release`; the `release` job waits for approval |
| The changelog has no entry for the version                                            | Fails: `release-notes.md` is extracted from that entry                                                                                      |

A merge that does not change the harness carries a released version, so it ends in the second row. A failed attestation fails the build, and nothing is published.

## 6. Approve the publish

Approve the `release` deployment to publish. Open the run in Actions, choose **Review deployments**, select `release` and approve. One approval starts four jobs:

| Job                       | What it does                                                                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release`                 | Creates `artisyn-implementation-harness-v<version>` on the merged commit through the API. Stops if another run released this version from a different commit while it waited                              |
| `publish-github-packages` | After `release`: `yarn workspace @dataart/artisyn-implementation-harness npm publish --tolerate-republish` to GitHub Packages                                                                             |
| `publish-github`          | After `release`: downloads the `harness-release` artifact, creates a draft Release with the version's changelog entry as its notes (`release-notes.md`), uploads the ZIP and `.sha256`, then publishes it |
| `publish-npmjs` (stub)    | After `release`: publishes nothing; prints a notice that npmjs.com publishing is not set up                                                                                                               |

The three publish jobs run in parallel. The tag appears only now, so npm on GitHub Packages, the Release ZIP, the marketplace, `gh skill` and skills.sh pins all open at the same moment.

Until approval, the marketplace manifests on `main` pin a tag that does not exist yet. Marketplace and `gh skill` installs of the new version fail in that window (accepted 2026-11-16). The site deploy (`cd.yml`) does not wait for the approval.

**Re-run.** A failed or rejected run is safe to re-run; it finishes only what is missing. An existing tag stays, GitHub Packages skips a version that is already there, and an already-published Release keeps its assets. When only one publish job fails, use **Re-run failed jobs**: it re-runs that job alone, without a new approval.

**npmjs.com (future).** `publish-npmjs` is not a channel. The harness still ships through five channels, and npm installs come from GitHub Packages. To make the job publish:

1. The `@dataart` scope exists on npmjs.com, owned by DataArt.
2. This repository and `release-harness.yml` are a trusted publisher of the package on npmjs.com. No token is stored: the job gets `id-token: write` and publishes with provenance.
3. The job publishes to `https://registry.npmjs.org`, overriding the package's `publishConfig` registry (GitHub Packages) for that job only.

Then update the distribution docs and the smoke checklist (step 8).

## 7. First release: 4.0.0

PR #20 is already stamped 4.0.0 (commit `c7f326b`). With steps 1 to 3 done, squash-merge it with a `harness`-scoped subject, for example:

`feat(harness)!: ship implementation-harness through five channels and keep its state in .harness/state`

The build job builds and attests 4.0.0. Approve the `release` deployment (step 6); the `release` job tags `artisyn-implementation-harness-v4.0.0` and the publish jobs publish. Two known windows exist until it finishes (accepted at plan sign-off, 2026-11-15):

- The marketplace manifests on `main` pin a tag that does not exist until the `release` job creates it (RF-012). Marketplace installs work once 4.0.0 is tagged.
- The committed 3.5.0 ZIPs are deleted, so no 3.5.0 ZIP is downloadable until 4.0.0 is released (RF-013); the files remain in git history.

## 8. Per-channel smoke checklist

In a scratch consumer project (not this repo), after `publish-github-packages` and `publish-github` go green. The `npx` commands below are consumer-side, so the yarn-only rule for this repo does not apply to them:

| Channel               | Check                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| npm (GitHub Packages) | `.npmrc` scope + `read:packages` token, then `npx @dataart/artisyn-implementation-harness init` places the package and prints the launch command                         |
| ZIP                   | Download `artisyn-implementation-harness-v4.0.0.zip` + `.sha256` from the tag's Release, verify the checksum, install (unzip or the bundled CLI `init`)                  |
| Claude                | `claude plugin marketplace add DataArt/artisyn-implementation-harness` → `claude plugin install artisyn@dataart` → `/artisyn:implementation-harness launch` responds     |
| Codex                 | Install `artisyn` from the Codex marketplace — the manifest values (`policy.authentication: NONE`, `git-subdir` source) are unverified on a real host; confirm them here |
| Copilot CLI           | Install via the Copilot marketplace flow — Copilot's reading of the Claude manifest is unverified on a real host; confirm it here                                        |
| skills.sh             | `npx skills add DataArt/artisyn-implementation-harness --skill implementation-harness` installs exactly that skill                                                       |
| gh skill              | `gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v4.0.0 --scope project` (pinned form only)                |

The marketplace agent E2E (`yarn nx run implementation-harness-e2e:agent-e2e`) is a guarded command — it spends real agent budget, so the developer starts it; it never runs in CI.

## Decision record

Versioning in the PR replaces the release commit that design decisions D-15, D-16 and D-17 put on `main` (TD-5, 2026-11-16). It also resolves TD-2 and TD-3: with no push to `main`, the PAT and the planned GitHub App have no purpose.

The root semantic-release lane is retired (2026-11-16): `release.yml`, `release.config.js` and the semantic-release packages are deleted. With it gone, TD-5 is fully done and the GitHub Actions bypass that RF-042 asked for is no longer needed.

The release splits into an automatic build job and an approved `release` job behind the `release` environment, followed by two publish jobs (agreed with the developer 2026-11-16). This replaces the fully automatic publish of design answer D4-Q2: the site deploy and the package release stay separate, and a reviewer decides when a built version reaches the channels.
