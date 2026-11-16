---
id: 8912decf
purpose: 'Design intent for the Harness Release Pipeline container: the PR stamps the harness version, an automatic build on merge attests it, and after a reviewer approves the release environment a release job tags it and two parallel publish jobs open all five channels at once'
keywords:
  [
    harness-release-pipeline,
    release,
    version-harness,
    version-gate,
    attestation,
    release environment,
    approval gate,
  ]
---

# Harness Release Pipeline Container

The harness is versioned in the PR, built on merge and published after a reviewer approves. The PR stamps the version. After the squash merge, an automatic build produces and attests the npm tarball and the Release ZIP. A `release` job then waits in the `release` environment; on approval it creates the tag, and two parallel publish jobs publish, so every channel opens at the same moment. It is the repository's only release lane, and it never pushes to `main`. Like Implementation Harness E2E, this is CI tooling, with no presence in the deployed site.

## Baseline diagram

```mermaid
flowchart LR
    subgraph PR ["  Feature branch (developer)  "]
        HV["⚙️ yarn harness:version\nNx Release + stamp + changelog"]:::source
        VG["✅ version-gate\nversion-harness.mjs --check"]:::source
    end

    subgraph PIPE ["  release-harness.yml — GITHUB_TOKEN only  "]
        BUILD["📦 build (automatic)\ntarball + ZIP + sha256\nattest · run artifact"]:::pipe
        GATE{{"🔒 release (approval)\ntag via API"}}:::gate
        PUB["🚀 publish-github-packages · publish-github\nparallel, each re-runnable"]:::pipe
    end

    subgraph CH ["  Channels  "]
        NPM["GitHub Packages npm\n(token-gated)"]:::channel
        REL["GitHub Release\nZIP · .sha256 · attestations"]:::channel
        MK["Marketplace · gh skill\nread the stamped tag"]:::channel
        SKS["skills.sh\ndefault branch, commit recorded"]:::channel
    end

    MAIN["📦 Protected main\nsquash merge"]:::source

    HV --> VG --> MAIN --> BUILD --> GATE --> PUB
    PUB --> NPM
    PUB --> REL
    PUB -.->|"tag ref"| MK
    MAIN -.-> SKS

    classDef source fill:#DBEAFE,stroke:#1D4ED8,color:#172554
    classDef pipe fill:#FEF3C7,stroke:#B45309,color:#78350F
    classDef gate fill:#FCE7F3,stroke:#BE185D,color:#831843
    classDef channel fill:#DCFCE7,stroke:#15803D,color:#14532D
    style PR fill:#EFF6FF,stroke:#1D4ED8
    style PIPE fill:#FFFBEB,stroke:#B45309
    style CH fill:#F0FDF4,stroke:#15803D
```

## Responsibilities

- On the feature branch: compute the version from the latest harness tag and the conventional commits after it (Nx Release; the repository itself is not versioned), stamp every shipped manifest, write the changelog entry (`yarn harness:version`); on every PR, `version-gate` checks the stamp and blocks harness PRs while a release waits for approval
- On every merge (`build`): when the version is not fully published, build and attest the npm tarball and the Release ZIP + `.sha256` and keep them as a run artifact
- After approval: `release` creates the tag `artisyn-implementation-harness-v<version>` through the API; then, in parallel, `publish-github-packages` publishes to GitHub Packages and `publish-github` publishes the GitHub Release with the ZIP and `.sha256`

## Boundary contracts

- Input: the harness `package.json` at the merged commit is the single version source; the PR's commits that touch `skills/implementation-harness/` (scope-gated to `harness`) decide it
- Output: the channels in `docs/Harness/09 Distribution/index.md` — npm (token-gated), Release ZIP + `.sha256` + attestation (anonymous), the tag the marketplace and `gh skill` pin; skills.sh installs from the default branch and records the resolved commit
- Guarantee: a fully published version publishes nothing and asks no approval; a re-run finishes only what is missing; a failed attestation blocks publish
- Guarantee: the tag is created only after approval, so all channels open at once; the Release is published from a draft after its assets are attached, so it is complete when GitHub immutable releases freeze it
- Guarantee: integrity per channel — npm registry integrity; ZIP `.sha256`, checked by the install CLI on `update` and by hand on a first ZIP install; attestations verifiable with `gh attestation verify`

## Constraints

- Releases happen only through this pipeline; the manual ZIP flow and the root semantic-release lane are retired
- Publish requires approval from a required reviewer of the `release` environment; the site deploy (`cd.yml`) is separate and does not wait for it
- Between merge and approval, the marketplace manifests on `main` pin a tag that does not exist yet, so marketplace and `gh skill` installs of the new version fail in that window (accepted 2026-11-16)
- The `main` ruleset requires a PR, an up-to-date branch and the `ci`, `version-gate` and `docs-gate` checks, and has no bypass actors
- The developer pushes the version commit (a `GITHUB_TOKEN` push starts no workflows); no workflow commits or pushes to `main`; the pipeline runs only with `GITHUB_TOKEN`, scoped per job, and needs no PAT, GitHub App or ruleset bypass (TD-5, 2026-11-16)
- Operation: `docs/Engineering Guide/08 Harness Release Runbook.md`. Implementation: `docs/System Architecture (LLD)/Harness Release Pipeline/00. Overview.md`
