---
id: d14b49f6
---

# Design Report — DESIGN-20261115-CO1T: Harness Distribution and Release Channels

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them. Two-track deployment: see `patterns/context-resolution.md`._

| Field               | Value                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Track               | Product — confirmed by the developer (sign-off gate; input was ambiguous between product goal and this repo's release tooling)                                                             |
| Source docs         | `docs/Harness/`                                                                                                                                                                            |
| Dest docs           | `docs/Harness/09 Distribution/` (new section)                                                                                                                                              |
| Stories root        | `docs/Stories/product-design/`                                                                                                                                                             |
| Subfolder           | `09 Distribution` (new) — `06 Roadmap/01 Harness Roadmap.md` §1 and `02 Quick Start/index.md` updated to point at it                                                                       |
| Architect agent     | `@product-architect`                                                                                                                                                                       |
| Writer agent        | `@docs-writer`                                                                                                                                                                             |
| Implementation note | Implementation tickets target this repo's own release tooling (`scripts/release/`, `release.yml`, `.canonical-implementation-harness/`), so `/dev` in this repo is the expected next step. |
| Task tracking       | Native Claude `TaskCreate`/`TaskUpdate`, mirrored from this report                                                                                                                         |

### Developer input (primary intent)

Today only a ZIP is stored under `releases/harness-bootstrap/`; consumers copy and unzip by hand. Design:

1. Rename the package `harness-bootstrap` → `artisyn-implementation-harness` to match branding.
2. Distribution via GitHub Packages as an npm package (skill + simple CLI that extracts and places it in the provider folder, then tells the user to run bootstrap).
3. Distribution via marketplaces (Claude, Codex, Copilot).
4. skills.sh.
5. Install and update mechanisms, instructions, scripts, guidelines.
6. CI/CD pipelines to automate release and distribution (added by the developer mid-Context Gathering).

## State

```yaml
current_stage: publish
completed_stages:
  [context-gathering, ceremony, frame, research, evaluate, solution, review-gate, address-feedback]
selected_artifacts: [architecture, design, stack, efforts]
next_action: 'Publish: doc impact, @docs-writer updates to docs/Harness/09 Distribution + affected docs, @product-architect review'
context_fingerprint: ''
```

Update this block whenever a phase starts, completes, or is invalidated. The
`selected_artifacts` values are interface names (`architecture`, `design`, `stack`,
`efforts`) and are the source of truth for downstream review, publish, and resume.

## Evidence

| Source                                                                                                   | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                        | Reference/version |
| -------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `docs/Harness/06 Roadmap/01 Harness Roadmap.md` §1                                                       | context-gathering | Registry distribution is already a product goal: target `yarn add @artisyn-harness/bootstrap`, semver pinning, changelog, registry (internal npm / GitHub Packages / Artifactory). Open: which registry, monorepo structure, CLI vs library, migration path.                                                                                           | id 1ff56a70       |
| `docs/Harness/02 Quick Start/index.md`                                                                   | context-gathering | Install prerequisite: extract `.canonical-implementation-harness/` into the **project root** from the latest ZIP; invoke `/harness-bootstrap launch` (`$harness-bootstrap` in Codex). Update path is `patch apply` only.                                                                                                                               | id 32b4135e       |
| `.canonical-implementation-harness/README.md` § Shared package discovery                                 | context-gathering | Conflicts with Quick Start: says extract the ZIP into the provider **skills folder** (`.claude/skills/`, `.agents/skills/`, `.github/skills/`); the archive creates `harness-bootstrap/`; physical location recorded as `package:`. `state/` is excluded from releases and must survive toolkit updates. Package may be removed after verified launch. | —                 |
| `.canonical-implementation-harness/SKILL.md` frontmatter                                                 | context-gathering | Skill `name: harness-bootstrap`, `metadata.version: 3.3.0` — drifts from CHANGELOG 3.5.0; no single version source.                                                                                                                                                                                                                                    | 3.3.0 (stale)     |
| `.canonical-implementation-harness/CHANGELOG.md`                                                         | context-gathering | Package version source for the release script (`## X.Y.Z` heading); latest 3.5.0. Versioning rules live in `references/00-overview.md`.                                                                                                                                                                                                                | 3.5.0             |
| `scripts/release/release-harness-bootstrap.mjs`                                                          | context-gathering | Manual release: zips the package (minus `state/`) as `harness-bootstrap/` into `releases/harness-bootstrap/artisyn-harness-bootstrap-v{ver}.zip`, committed to git. Run via `yarn release:harness-bootstrap`.                                                                                                                                          | —                 |
| `release.config.js`, `.github/workflows/release.yml`                                                     | context-gathering | semantic-release on `main` versions the **root** repo package (`@artisyn-harness/root` 1.1.1, `npmPublish: false`) + GitHub Release; independent of the harness package version.                                                                                                                                                                       | root 1.1.1        |
| `releases/harness-bootstrap/`                                                                            | context-gathering | 13 committed ZIPs (v1.0.0 → v3.5.0) — binary history in git, the only distribution channel today.                                                                                                                                                                                                                                                      | —                 |
| `docs/Engineering Guide/04 AI Coding Tool Compatibility.md`                                              | context-gathering | Provider destination map (skills/agents/settings/MCP per host); lists Claude and Codex only, while the package also supports Copilot (`.github/skills/`). Other tools need a verified adapter.                                                                                                                                                         | id 48960fc2       |
| `docs/Target Architecture (HLD)/v1/Containers/Harness Bootstrap E2E.md`                                  | context-gathering | E2E tests exercise `.canonical-implementation-harness/` in place; any rename/packaging change must keep this container's fixtures and graders working.                                                                                                                                                                                                 | id ca3a865c       |
| Rename blast radius (`git grep harness-bootstrap`, excluding stories/state/patch history)                | context-gathering | ~84 tracked files, ~12.4k occurrences; plus symlinks `.claude/skills/harness-bootstrap`, `.agents/skills/harness-bootstrap`, `.github/skills/harness-bootstrap`, issue template, CLAUDE.md, release script names. Patch/state history references old name.                                                                                             | —                 |
| GitHub repo (developer correction; local `origin` still points at the old `DataArt/artisyn-harness` URL) | context-gathering | Repo is `github.com/DataArt/artisyn-implementation-harness` — already matches the target brand. GitHub Packages npm scope is the owner, so `@dataart/artisyn-implementation-harness`. Roadmap assumed `@artisyn-harness/bootstrap`. Every repo URL in docs, package metadata, marketplace manifests and CI must use the new name.                      | —                 |

## Solution specification session (2026-11-15)

Preliminary concern scan (interfaces/contract.md). Material concerns and how each is resolved:

| Concern                                                                       | Status         | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boundaries and ownership — source folder location and name                    | Material       | **Decided:** `.canonical-implementation-harness/` moves to `skills/artisyn-implementation-harness/` (real folder, name = skill name). In-repo discovery symlinks `.claude/skills/`, `.agents/skills/`, `.github/skills/` → `../../skills/artisyn-implementation-harness`. No `dist` branch, no duplicated tree. (Developer; supersedes the interim "keep canonical + rename symlinks" answer.)                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Interfaces and compatibility — marketplace reading on three hosts             | Material       | Spike (official docs, 2026-11-15): Claude and Copilot read `.claude-plugin/marketplace.json`; Codex reads it as legacy-compatible and wants `policy.installation`, `policy.authentication`, `category` per entry. Root `SKILL.md` plugins load on Claude only → plugin layout is `skills/<name>/SKILL.md`. No single remote source type spans all three: Claude `git-subdir`/`github`, Codex `git-subdir` (no `github`), Copilot `github` + `path` (no `git-subdir`). **Decided:** three manifests (`.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json`, Copilot entry) all pointing at `skills/artisyn-implementation-harness` at the release tag ref (WAF P1 pin). Only Claude has `${CLAUDE_PROJECT_DIR}`; the skill resolves the project root itself (`git rev-parse --show-toplevel` / cwd). |
| Operations and delivery — automatic release pushing to protected `main`       | Material       | **Decided:** ruleset on `main` (PRs + required CI); the release workflow's identity is a bypass actor for the release commit and tags. Same path as root semantic-release. (Developer.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Operations — Nx 23 release config keys                                        | Informational  | Verified in `node_modules/nx/schemas/nx-schema.json` (23.3.1): `release.projectsRelationship`, `release.releaseTag.pattern`, `specifierSource`, `conventionalCommits`, `versionActions`, `preVersionCommand`, `projectChangelogs` all present.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Data and state — `.harness/state/` layout, commit rule, this repo's own state | Material       | **Decided:** layout unchanged under `.harness/state/`; consumers commit `index.json`, `registry.md`, `launch/answers.json`, `patch/APPLIED.md` and ignore `objects/`, `launch/runs/`, `launch/reports/`; this repo moves its own tracked state to `.harness/state/` (otherwise it ships on git-ref installs). (Developer accepted the Evaluate defaults.)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Evolution — first version under the new name                                  | Material       | **Decided:** 4.0.0 (rename + state move are breaking).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Performance and capacity, Cost and licensing, Compliance                      | Not applicable | No runtime service; no paid channel or listing; public docs only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Security — tokens                                                             | Informational  | GitHub Packages consumer token is read-only `read:packages`, never committed; release uses `GITHUB_TOKEN` least privilege. Covered by Architecture + Design.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Selected artifacts: `architecture` (integrated, single), `design` (one per decision), `stack`, `efforts`. No extra artifact needed.

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261115-CO1T                                                                                                                                                                |
| Branch | `docs/design-20261115-co1t-harness-distribution`                                                                                                                                    |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ⏭️ · 💬 Address Feedback ⏭️ · 📤 Publish 🔄 · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 56m 23s · Wait to date: 1h 23m 28s (closed 1h 23m 28s + current 0s) · Unclassified: 18m 38s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-15T15:45:37.642Z | 2026-11-15T15:50:53.589Z | 5m 16s      | 16s     | 4m 59s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-15T15:50:53.738Z | 2026-11-15T15:54:48.530Z | 3m 55s      | 11s     | 3m 44s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-15T15:54:48.704Z | 2026-11-15T16:15:38.843Z | 20m 50s     | 2m 22s  | 18m 28s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-15T16:15:39.009Z | 2026-11-15T16:50:40.353Z | 35m 1s      | 23m 31s | 11m 30s | unavailable  | unavailable   | from_tracking_start | 2        | 0             |
| evaluate (completed)          | 2026-11-15T16:50:40.507Z | 2026-11-15T17:13:08.882Z | 22m 28s     | 17s     | 22m 11s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (completed)          | 2026-11-15T17:13:09.062Z | 2026-11-15T18:04:34.113Z | 51m 25s     | 29m 45s | 21m 40s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| review-gate (completed)       | 2026-11-15T18:04:34.271Z | 2026-11-15T18:04:34.765Z | 0s          | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| address-feedback (skipped)    | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (active)              | 2026-11-15T18:04:43.285Z | unavailable              | unavailable | 0s      | 55s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

_From Research OQ triage (2026-11-15) — classification confirmed by the developer at Research sign-off; (V) answers resolved at Evaluate Step 1b._

| #            | Open question                                                                                                                               | V/E                | Answer / status                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1-1         | EC1: literal `artisyn-implementation-harness` as skill/command, or branded short form acceptable?                                           | (V)                | **Superseded at Solution sign-off (developer, 2026-11-15):** skill/folder/command `implementation-harness`, plugin `artisyn`, marketplace `dataart` → `/artisyn:implementation-harness launch`; package/repo/tag/ZIP keep `artisyn-implementation-harness` |
| D2-1         | EC3: self-hosted marketplace, or official curated directories required?                                                                     | (V)                | **Answered:** own marketplace in this repo; official directories optional/later                                                                                                                                                                            |
| D2-2         | GitHub Packages primary or internal mirror; is public npmjs publishing allowed?                                                             | (V)                | **Answered:** no public npmjs; npm only on GitHub Packages (token); anonymous via marketplace, skills.sh, ZIP                                                                                                                                              |
| D2-3         | Is the `@dataart` scope available on npmjs.com?                                                                                             | (V)                | **Moot** (no npmjs). Registry shows zero `@dataart` packages                                                                                                                                                                                               |
| D3-1 (≡D2-4) | Can `state/` move out of the package to a project-level state root (in scope)?                                                              | (V)                | **Answered (developer, 2026-11-15):** yes — `state/` only moves to project `.harness/` (EC12); `package:patch/` and harvest edits stay in the package                                                                                                      |
| D3-3         | Is consumer-side `patch harvest`/`prepare` supported?                                                                                       | (V)                | **Answered:** no consumer-side harvest/prepare; consumer package may be read-only                                                                                                                                                                          |
| D3-6         | Do skills.sh / `gh skill update` wipe unknown files? (after EC12: local `package:patch/` bundles and `package:canonical/` edits, not state) | (V if D3-3 = yes)  | **Resolved (spike):** skills.sh wipes and recreates the folder; `gh skill update` overwrites per file, keeps extras. Harmless now                                                                                                                          |
| D3-13        | `package:` recorded as a path or as name + version + channel when the package lives outside the project (plugin cache)?                     | (V for install C1) | **Resolved by D3-3:** `package:` may be a user-level cache path; record path + name + version + channel                                                                                                                                                    |
| D4-Q1        | Harness CHANGELOG must stay curated prose, or commit-generated acceptable?                                                                  | (V)                | **Answered:** commit-generated CHANGELOG acceptable                                                                                                                                                                                                        |
| D4-Q2        | Human gate required before publish?                                                                                                         | (V)                | **Answered:** fully automatic publish on merge, no gate                                                                                                                                                                                                    |
| D3-2         | Package removable after launch, or kept?                                                                                                    | (E)                | Proposed after EC12: removable for non-harvesters (state + baselines in `.harness/`); open whether allowed with unsent local bundles                                                                                                                       |
| D3-10/11     | `.harness/` subfolder name; commit, ignore or split it in consumer projects                                                                 | (E)                | Open — settle before Solution; D3-11 may need a scope ruling                                                                                                                                                                                               |
| D4-Q6        | One or two SKILL.md version fields?                                                                                                         | (E)                | Proposed: keep only `metadata.version`                                                                                                                                                                                                                     |
| D4-Q3        | Root semantic-release stops counting harness commits — mechanism                                                                            | (E)                | EC7 says yes; mechanism in Evaluate                                                                                                                                                                                                                        |
| Other E      | D1-2..D1-9, D2-5..D2-10, D3-4/5/7/8/9, D4-Q4/5/7/8/9/10/11                                                                                  | (E)                | Deferred to Evaluate / implementation; see each `01 Research - *.md`                                                                                                                                                                                       |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-15

_Recommended options: D1 Identity — B Full brand name + time-boxed `harness-bootstrap` shim · D2 Channels — C Repo-as-marketplace + GitHub Packages npm + skills.sh/gh skill + Release ZIP · D3 Install and Update — B copy CLI primary, C1 plugin cache and D skills.sh/gh skill as native paths, one `.harness/state/` contract · D4 Release — D Nx Release independent, automatic on merge._

| Pillar                 | D1  | D2  | D3  | D4  | Headline                                                                                                                |
| ---------------------- | --- | --- | --- | --- | ----------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢  | 🟢  | 🟢  | 🟢  | One name, one source tree, one state contract, one automatic workflow                                                   |
| Security               | 🟢  | 🟡  | 🟢  | 🟡  | Marketplace must pin to the released tag; discovery restricted; automatic publish needs required CI + branch protection |
| Reliability            | 🟡  | 🟢  | 🟡  | 🟡  | Old snapshot refs and state migration must resolve; version stamps must stay consistent                                 |
| Performance Efficiency | 🟢  | 🟢  | 🟢  | 🟢  | No build step for git channels; Nx cache                                                                                |
| Cost Optimization      | 🟢  | 🟢  | 🟢  | 🟢  | No registry account or paid listings                                                                                    |
| Sustainability         | 🟢  | 🟢  | 🟢  | 🟢  | No committed binaries; no permanent aliases                                                                             |

**P1 items (resolve before implementation):**

- D1: read-time mapping for old `release:artisyn-harness-bootstrap-v*.zip` snapshot refs, with an E2E migration test.
- D2: marketplace plugin source pinned to the released tag/version, not main head.
- D2: `skills.sh.json` (and `gh skill` scope) restricts discovery to the harness skill folder.
- D3: idempotent, verified migration of `package:state/` and legacy `.harness/launch/` into `.harness/state/`, with E2E coverage from a 3.5.0 install.
- D4: automatic release runs only after required CI passes on a protected `main`.
- D4: CI version-consistency gate across `SKILL.md`, harness `package.json`, `plugin.json` and the marketplace entry on every PR.

Full elaboration: `design/02 Evaluate - Package Identity.md`, `02 Evaluate - Channels.md`, `02 Evaluate - Install and Update.md`, `02 Evaluate - Release Pipeline.md`

### Review — solution — 2026-11-15 [pillars: all]

_Target: `solution/Architecture.md` + four `solution/Design - *.md`. Last WAF pass before the review gate._

| Pillar                 | Rating | Headline                                                                                                                                                                                                                     |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | One release workflow, one state contract, `doctor` and CI gates (version, rename, `npm pack`, `claude plugin validate`); rollback via `npm deprecate` + marketplace `ref` revert                                             |
| Security               | 🟡     | Least-privilege `GITHUB_TOKEN`, attestations, read-only consumer token, no secrets in repo; amber because publish is fully automatic — bounded by required CI on a protected `main` with a single bypass actor (D-16, D-17)  |
| Reliability            | 🟢     | Idempotent re-runs (tag exists → no-op), checksum-verified swaps, migration keeps the source until verified, old snapshot refs resolve by read-time mapping; all six Evaluate P1s have an owning decision and a verification |
| Performance Efficiency | 🟢     | No build for git channels; CLI is stdlib-only Node; Nx cache                                                                                                                                                                 |
| Cost Optimization      | 🟢     | No registry account, no paid listing, no new service                                                                                                                                                                         |
| Sustainability         | 🟢     | No committed binaries; shim removed at 5.0.0; one package per project                                                                                                                                                        |

**Gaps (P2/P3, address in implementation):** P2 — Codex `policy.authentication` enum and Copilot plugin-kind handling verified on real hosts (Efforts ticket 7). P2 — version skew warning in `doctor` for multi-host plugin installs (ticket 5). P3 — official directory listings as a later follow-up.

**P1 items:** none.

---

## Architect review (2026-11-15)

`@product-architect` reviewed `solution/Architecture.md` (read-only). Result: structurally complete; 13 findings — 4 material, 9 mechanical. All applied in one pass (see table). Material items are presented at the Solution sign-off as named decisions.

| #   | Finding                                    | Type       | Resolution                                                                                                                                                             |
| --- | ------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Shim placement and coexistence unspecified | material   | D-03: shim at `skills/harness-bootstrap/`, carried by all 4.x artifacts; migrate replaces the old package with the shim after verified migration; one folder name only |
| 2   | `package:` cache path would be committed   | material   | D-10/D-13: committed `package.json` {name, version, channel}; ignored `package.local.json` {path}; re-resolved when missing                                            |
| 3   | Mapping target of old snapshot refs        | material   | D-04: label-only mapping; bytes from `objects/`; no network; missing base aborts                                                                                       |
| 4   | "Latest" GitHub Release collision          | material   | D-07: pin mandatory on git channels; docs lint; `/releases/latest` never used                                                                                          |
| 5   | Missing root-extract migration source      | mechanical | D-14 source added                                                                                                                                                      |
| 6   | Integrity claim inconsistent               | mechanical | D-09/D-11/F3: integrity per channel; attestations = maintainer check                                                                                                   |
| 7   | Release-commit retrigger loop              | mechanical | D-16: `[skip ci]` + actor guard                                                                                                                                        |
| 8   | First release reaching 4.0.0               | mechanical | D-15/16: package.json 3.5.0 + breaking rename commit                                                                                                                   |
| 9   | One or two marketplace entries             | mechanical | D-06: one `github` entry for Claude + Copilot; Codex file separate                                                                                                     |
| 10  | Marketplace rollback                       | mechanical | D-06: re-pin `ref` via patch release                                                                                                                                   |
| 11  | EC8 verification                           | mechanical | D-05: tokenless smoke tests                                                                                                                                            |
| 12  | Token hygiene                              | mechanical | D-08: scope mapping committable, token never in repo                                                                                                                   |
| 13  | `.releaserc` name                          | mechanical | `release.config.js`                                                                                                                                                    |

---

## Quality gate (2026-11-15)

| #   | Check                                                                                  | Result                                             | Evidence                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Every framed requirement and constraint maps to a decision                             | Pass                                               | `Architecture.md` § Requirement coverage (EC1–EC12 + constraints → D-xx)                                                                                                                                                                                  |
| 2   | Every material concern from the preliminary scan has an artifact or decision           | Pass                                               | Report § Solution specification session: 6 material concerns, each decided (D-02, D-06, D-12, D-13, D-15, D-17)                                                                                                                                           |
| 3   | Solution artifacts hold decisions and interfaces only                                  | Pass                                               | grep for proposed/TBD/open question/unverified across `solution/*.md`: 0 hits; options summary confined to `## Considered Options`                                                                                                                        |
| 4   | `Architecture.md` is the canonical E2E record; companions add no conflicting decisions | Pass (after fix)                                   | 18 decisions D-01…D-18, 4 flows F1–F4, P1 coverage table. One inconsistency found and fixed by the orchestrator (mechanical): D-06 and the responsibility table now state plugin root = repo root and the per-host sources used in `Design - Channels.md` |
| 5   | Every Mermaid diagram renders                                                          | Pass (parse)                                       | 12/12 diagrams parse with `mermaid.parse` (5 Architecture, 6 Design, 1 Efforts). `mmdc` render unavailable locally (`puppeteer` not installed) — limitation recorded; visual check deferred to the MR                                                     |
| 6   | Relative links resolve                                                                 | Pass                                               | No relative `.md` links in solution files; cross-references are by name                                                                                                                                                                                   |
| 7   | Architect review                                                                       | Pass — 13 findings applied, see § Architect review | —                                                                                                                                                                                                                                                         |

Inline-authoring note: two mechanical edits to `solution/Architecture.md` (D-06 alignment; requirement coverage table) were applied by the orchestrator, recorded here per the docs-writer authoring pattern's fallback rule.

---

## Publish doc impact (2026-11-15)

Doc-impact list by `@product-architect`; three judgment calls settled by the developer:

- **Sequencing:** publish `docs/Harness/09 Distribution/` (4 files, each marked "Applies from release 4.0.0"), Roadmap §1, and the host-only repo-URL fix in `01 Explore/02 Feature Comparison.md` and `03 Artisyn Capability Audit.md` now. Pages that tell readers what to run today switch in implementation ticket 11.
- **Inbound path:** downstream improvements come back as issues or PRs on `DataArt/artisyn-implementation-harness`; maintainers harvest in the source repo; projects receive them through the next release and `patch apply`.
- **Sidebar:** `@web` adds the `09 Distribution` entry in `apps/web-docs/.vitepress/config.ts` now.
- Settled without asking: `npx` stays in consumer commands (the yarn-only rule covers this repo's toolchain); Codex command variants written as plain facts; implementation detail stays out of `docs/Harness/`.

**Publish review (2026-11-15), pass 1:** `@product-architect` returned 6 mechanical corrections (token variable removed from `.npmrc` example; `gh skill` access = no token; pinning wording incl. skills.sh commit lock; release-cut wording; Roadmap status; diagram edge labels). Applied by `@docs-writer`.

**Implementation note for ticket 7 (from the review):** the skills.sh install command takes no tag; pinning happens through the commit recorded in `skills-lock.json`. Ticket 7 checks whether skills.sh accepts a tag ref and, if so, documents the pinned form.

**Deferred to implementation ticket 11 (must be in the ticket scope):**

| Doc                                                 | Change                                                                                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/Harness/index.md`                             | package line → `skills/implementation-harness/`, `/implementation-harness launch`, link 09, Sections table row                                                         |
| `docs/README.md`                                    | 09 Distribution link; package source path                                                                                                                              |
| `docs/Harness/02 Quick Start/index.md`              | install via any channel (link 09), both command forms, `.harness/state/`, remove consumer harvest/prepare bullets                                                      |
| `docs/Harness/04 Adoption/00 Adoption Path.md`      | Getting Started steps 1–2; Improve row (releases + `patch apply`, inbound via issues/PRs)                                                                              |
| `docs/Harness/04 Adoption/02 Discovery Phase.md`    | step 1 install + launch command                                                                                                                                        |
| `docs/Harness/07 Operational Graph/01 Ops Model.md` | `/implementation-harness launch                                                                                                                                        | reindex-graph`; shipping root path |
| `docs/Harness/00 The Story/03 Challenges.md`        | command name; cross-project sharing via releases + `patch apply`                                                                                                       |
| `docs/Harness/01 Explore/index.md`                  | package catalog path                                                                                                                                                   |
| `docs/Harness/06 Roadmap/01 Harness Roadmap.md` §4  | registry wording; sharing via releases; inbound via issues/PRs                                                                                                         |
| Package docs under `skills/implementation-harness/` | README, `00-overview`, `01a-launch-plan`, `08-provider-launch`, `05-patch-apply`, `06-patch-state`, `07-patch-prepare`, CHANGELOG, SKILL.md, root doc rename, new shim |
| Engineering Guide                                   | `04 AI Coding Tool Compatibility` (+Copilot, state root), `07 Branching Strategy` (tags, bypass, scope), `05 Getting Started` (path), ruleset article                  |
| HLD / LLD                                           | `Harness Bootstrap E2E` container + LLD 00–05 paths, release-pipeline container/section, `System Overview`, HLD index, Log Hub and Web Explorer LLD overviews          |
| Repo                                                | `CLAUDE.md`, root `README.md`, `.github/ISSUE_TEMPLATE/bug_report.yml`, docs lint rule (no `/releases/latest`, pinned `gh skill`)                                      |

## Gate

- Approver: developer (in-session approval; MR review waived)
- Draft MR: skipped — developer waived the review gate and feedback stages (2026-11-15)
- Approved: 2026-11-15
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase                   | Notes                                                                                                                                                                                                                                                                                                                           |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-15 | Frame                   | 7 known requirements (EC1–EC6, EC11 added by developer), 4 proposed accepted (EC7 reworded: harness version independent of repo semantic-release); 4 decisions confirmed                                                                                                                                                        |
| 2026-11-15 | Research (scope change) | Developer: move generated `state/` to project `.harness/` like evolve. Frame amended via Frame Step 1 recipe within the Research stage: EC12 added, EC9 + Boundaries + Constraints updated. D3 research re-delegated to @product-architect; D1/D2 delta notes requested. Metrics: `stage retry research --reason scope_change`. |
| 2026-11-15 | Research                | @product-architect returned 19 options across 4 decisions (D1 identity A–E, D2 channels A–D, D3 install/update A–E after EC12 rework, D4 release A–E); developer confirmed sets complete; 9 V-OQs (D3-1 answered by EC12, D3-13 added)                                                                                          |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket     | Summary                        | Tracker                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-15 | Evaluate                       | Recommended D1 B (full name + time-boxed shim), D2 C (repo-as-marketplace + GH Packages npm + skills.sh/gh skill + ZIP), D3 B CLI + C1/D native paths on one `.harness/state/` contract, D4 D (Nx Release independent, automatic); WAF all 🟢 except Security 🟡 (D2, D4) and Reliability 🟡 (D1, D3, D4); 6 P1 items accepted as design requirements |
| 2026-11-15 | Solution (sign-off correction) | Developer corrected the naming after seeing `plugin@marketplace` and `/plugin:skill` doubled: marketplace `dataart`, plugin `artisyn`, skill `implementation-harness`. EC1 amended in Frame; D1-1 superseded; all solution files updated by @docs-writer.                                                                                             |
| 2026-11-15 | Solution                       | 7 artifacts (Architecture, 4 × Design, Stack, Efforts); architect review 13 findings applied; WAF solution 5 🟢 + Security 🟡, 0 P1; quality gate 7/7; estimates left empty by developer                                                                                                                                                              |
| 2026-11-15 | Review Gate / Address Feedback | Skipped by the developer: in-session approval recorded, no draft MR                                                                                                                                                                                                                                                                                   |
