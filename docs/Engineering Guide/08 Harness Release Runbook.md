---
id: bbd79b2b
purpose: 'Developer/admin runbook for the harness release lane: ruleset and bypass actors, secrets and variables, the first 4.0.0 release, the per-channel smoke checklist and the GitHub App follow-up'
keywords:
  [
    release runbook,
    HARNESS_RELEASE_TOKEN,
    HARNESS_RELEASE_ENABLED,
    ruleset,
    bypass actor,
    smoke checklist,
    github app,
    harness release,
  ]
---

# Harness Release Runbook

One-time setup makes `release-harness.yml` able to push to the protected `main`; after that, releases are fully automatic. Do the steps in order — the enable flag comes last.

```mermaid
flowchart LR
    RS["1️⃣ Ruleset on main\nPR + checks + 2 bypass actors"]:::setup
    TK["2️⃣ Secret\nHARNESS_RELEASE_TOKEN (PAT)"]:::setup
    EN["3️⃣ Variable\nHARNESS_RELEASE_ENABLED=true\n(set LAST)"]:::setup
    REL["4️⃣ First release\nmerge cuts 4.0.0"]:::release
    SMOKE["5️⃣ Smoke every channel"]:::release
    APP["Later: org GitHub App\n(TD-2, then TD-3)"]:::debt

    RS --> TK --> EN --> REL --> SMOKE -.-> APP

    classDef setup fill:#DBEAFE,stroke:#2563EB,color:#1e3a8a
    classDef release fill:#DCFCE7,stroke:#15803D,color:#14532D
    classDef debt fill:#FEF3C7,stroke:#D97706,color:#78350f
```

## 1. Ruleset on `main`

Create one ruleset (Settings → Rules → Rulesets) targeting `main`:

- Require a pull request before merging.
- Block force pushes.
- Require status checks: `ci`, `version-gate`, `rename-gate` (job IDs from `ci.yml`).
- Bypass actors, both with mode **Always**:
  - **Repository admin** role — the interim actor behind the release PAT (TD-2); it also lets any admin push to `main` directly, which is the accepted trade-off until an org GitHub App exists (decided 2026-11-15).
  - **GitHub Actions** app — so the root release lane (`release.yml`) keeps pushing its `chore(release)` commit with `GITHUB_TOKEN` (RF-042, accepted 2026-11-15).

## 2. Secret: `HARNESS_RELEASE_TOKEN`

A fine-grained PAT of a repository admin, scoped to this repository only:

| Setting     | Value                                                   |
| ----------- | ------------------------------------------------------- |
| Permissions | Contents: read and write · Metadata: read               |
| Expiry      | 1 year at most — put the renewal date in a calendar now |
| Stored as   | Repository Actions secret `HARNESS_RELEASE_TOKEN`       |

The workflow reads it in exactly two steps (presence check and push); everything else runs with the default `GITHUB_TOKEN`. Leave the repository variable `HARNESS_RELEASE_BOT` **unset** until a GitHub App exists — it is the actor guard for the App's bot login, and setting it to anything else does nothing useful.

## 3. Enable the lane — last

Set the repository variable `HARNESS_RELEASE_ENABLED` to `true` only after the ruleset and the secret are in place. Until then the workflow is inert on every push.

## 4. First release: 4.0.0

The distribution PR must land so that a `feat(harness)!:` commit reaches `main`:

- a merge commit (keeps the rename commit `f1b9849`) or a rebase merge (keeps a rewritten copy with the same subject); or
- a squash merge with the PR title `feat(harness)!: rename the package to implementation-harness and keep its state in .harness/state`.

On a squash merge the PR title becomes the only commit on `main`, so it is the commit Nx scores. That holds for every squash-merged harness PR. The CI scope check (`check-commit-scope.mjs --range`, run by `ci.yml`) checks the PR's own commits, not the title, and the husky hook does not run on GitHub, so a wrong squash title goes unchecked.

With the breaking commit on `main`, the first run versions the harness from 3.5.0 to exactly 4.0.0, stamps the manifests, pushes `chore(harness-release): 4.0.0 [skip ci]` plus the tag, publishes npm, attaches the ZIP + `.sha256` and attests both artifacts. Two known windows exist until that run finishes (both accepted at plan sign-off, 2026-11-15):

- The marketplace manifests on `main` pin a tag that does not exist until the first release stamps it (RF-012) — marketplace installs work only after 4.0.0 is out.
- The committed 3.5.0 ZIPs are deleted, so no 3.5.0 ZIP is downloadable until 4.0.0 is released (RF-013); the files remain in git history.

A failed run is safe to re-run: it checks what is already published and finishes only the missing artifacts.

## 5. Per-channel smoke checklist

In a scratch consumer project (not this repo), after the release run goes green. The `npx` commands below are consumer-side, so the yarn-only rule for this repo does not apply to them:

| Channel     | Check                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| npm         | `.npmrc` scope + `read:packages` token, then `npx @dataart/artisyn-implementation-harness init` places the package and prints the launch command                         |
| ZIP         | Download `artisyn-implementation-harness-v4.0.0.zip` + `.sha256` from the tag's Release, verify the checksum, install (unzip or the bundled CLI `init`)                  |
| Claude      | `claude plugin marketplace add DataArt/artisyn-implementation-harness` → `claude plugin install artisyn@dataart` → `/artisyn:implementation-harness launch` responds     |
| Codex       | Install `artisyn` from the Codex marketplace — the manifest values (`policy.authentication: NONE`, `git-subdir` source) are unverified on a real host; confirm them here |
| Copilot CLI | Install via the Copilot marketplace flow — Copilot's reading of the Claude manifest is unverified on a real host; confirm it here                                        |
| skills.sh   | `npx skills add DataArt/artisyn-implementation-harness --skill implementation-harness` installs exactly that skill                                                       |
| gh skill    | `gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v4.0.0 --scope project` (pinned form only)                |

The marketplace agent E2E (`yarn nx run harness-bootstrap-e2e:agent-e2e`) is a guarded command — it spends real agent budget, so the developer starts it; it never runs in CI.

## Follow-up: GitHub App (TD-2, TD-3)

The PAT is interim — creating a GitHub App needs organisation permissions. When an org owner is available:

1. Create the release GitHub App at org level, install it on this repository, and add it as the ruleset bypass actor (then remove the Repository admin bypass).
2. Switch the workflow to a run-time token (`actions/create-github-app-token`), set `HARNESS_RELEASE_BOT` to the App's bot login, and delete the PAT.
3. Split the workflow into a version job (contents write) and a publish job (contents write for `gh release create/upload`, packages, `id-token`, `attestations`) — today one job holds all four permissions for every step (TD-3).
