---
id: 8912decf
purpose: 'Design intent for the Harness Release Pipeline container: the PR stamps the harness version, and one automatic run on merge tags, publishes and attests it to its five channels'
keywords: [harness-release-pipeline, release, version-harness, version-gate, attestation]
---

# Harness Release Pipeline Container

The harness is versioned in the PR and published on merge. The PR stamps the version; after the squash merge, one automatic run tags that version and produces the npm package, the Release ZIP and the attestations, with no manual publish step and no push to `main`. It is the repository's only release lane. Like Implementation Harness E2E, this is CI tooling, with no presence in the deployed site.

## Baseline diagram

```mermaid
flowchart LR
    subgraph PR ["  Feature branch (developer)  "]
        HV["⚙️ yarn harness:version\nNx Release + stamp + changelog"]:::source
        VG["✅ version-gate\nversion-harness.mjs --check"]:::source
    end

    subgraph PIPE ["  release-harness.yml — on merge, GITHUB_TOKEN only  "]
        TAG["🏷️ Tag via API\nversion from package.json"]:::pipe
        BUILD["📦 Build tarball + ZIP + sha256"]:::pipe
        ATT["✅ Attest tarball + ZIP"]:::pipe
        PUB["🚀 Publish npm + GitHub Release"]:::pipe
    end

    subgraph CH ["  Channels  "]
        NPM["GitHub Packages npm\n(token-gated)"]:::channel
        REL["GitHub Release\nZIP · .sha256 · attestations"]:::channel
        MK["Marketplace · gh skill\nread the stamped tag"]:::channel
        SKS["skills.sh\ndefault branch, commit recorded"]:::channel
    end

    MAIN["📦 Protected main\nsquash merge"]:::source

    HV --> VG --> MAIN --> TAG --> BUILD --> ATT --> PUB
    PUB --> NPM
    PUB --> REL
    TAG -.->|"tag ref"| MK
    MAIN -.-> SKS

    classDef source fill:#DBEAFE,stroke:#1D4ED8,color:#172554
    classDef pipe fill:#FEF3C7,stroke:#B45309,color:#78350F
    classDef channel fill:#DCFCE7,stroke:#15803D,color:#14532D
    style PR fill:#EFF6FF,stroke:#1D4ED8
    style PIPE fill:#FFFBEB,stroke:#B45309
    style CH fill:#F0FDF4,stroke:#15803D
```

## Responsibilities

- On the feature branch: compute the version from the latest harness tag and the conventional commits after it (Nx Release; the repository itself is not versioned), stamp every shipped manifest, write the changelog entry (`yarn harness:version`)
- On every PR: fail `version-gate` unless the branch is stamped with the computed version and its changelog entry
- On every merge: create the tag `artisyn-implementation-harness-v<version>` through the API, then build, attest and publish the npm tarball and the Release ZIP + `.sha256`

## Boundary contracts

- Input: the harness `package.json` at the merged commit is the single version source; the PR's commits that touch `skills/implementation-harness/` (scope-gated to `harness`) decide it
- Output: the channels in `docs/Harness/09 Distribution/index.md` — npm (token-gated), Release ZIP + `.sha256` + attestation (anonymous), the tag the marketplace and `gh skill` pin; skills.sh installs from the default branch and records the resolved commit
- Guarantee: an existing tag means "finish what is missing" — a merge that did not change the harness or a re-run publishes nothing new; a failed attestation blocks publish
- Guarantee: integrity per channel — npm registry integrity; ZIP `.sha256`, checked by the install CLI on `update` and by hand on a first ZIP install; attestations verifiable with `gh attestation verify`

## Constraints

- Releases happen only through this pipeline; the manual ZIP flow and the root semantic-release lane are retired
- The `main` ruleset requires a PR, an up-to-date branch and the `ci`, `version-gate` and `rename-gate` checks, and has no bypass actors; two PRs claiming the same version cannot both merge without the second re-stamping
- The version commit is pushed by the developer: a commit pushed with `GITHUB_TOKEN` starts no workflows, and the ruleset requires approval of the last push
- No workflow commits or pushes to `main`; the pipeline runs only with `GITHUB_TOKEN` and needs no PAT, GitHub App or ruleset bypass (TD-5, 2026-11-16)
- Operation: `docs/Engineering Guide/08 Harness Release Runbook.md`. Implementation: `docs/System Architecture (LLD)/Harness Release Pipeline/00. Overview.md`
