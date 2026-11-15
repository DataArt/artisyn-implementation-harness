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
current_stage: ceremony
completed_stages: [context-gathering]
selected_artifacts: []
next_action: 'Ceremony: branch checkout and first commit'
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

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261115-CO1T                                                                                                                                                                |
| Branch | `docs/design-20261115-co1t-harness-distribution`                                                                                                                                    |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 22s · Wait to date: 7m 23s (closed 7m 23s + current 0s) · Unclassified: 6s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ---- | ------ | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-15T15:45:37.642Z | 2026-11-15T15:50:53.589Z | 5m 16s      | 16s  | 4m 59s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (active)             | 2026-11-15T15:50:53.738Z | unavailable              | unavailable | 5s   | 2m 23s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (pending)               | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| research (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

---

## Gate

- Approver: —
- Draft MR: —
- Approved: — _(a date once approved, or `declined`)_
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date | Phase | Notes |
| ---- | ----- | ----- |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
