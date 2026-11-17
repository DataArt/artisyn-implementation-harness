# Design Report — DESIGN-20261117-7931: OKF-Compatible Knowledge Base

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them. Two-track deployments: see `patterns/context-resolution.md`. Single-track deployments: these are fixed values, filled in once._

Developer intent (free-form, no tracker ticket): design an Open Knowledge Format (OKF) compatible knowledge base for the implementation harness. Guard the operational graph (OG) so it never writes into `index.md` files or docs outside `docs/`, and never adds them to the graph. Apply the rules to the harness package (`skills/implementation-harness/`) first, then carry them into this repo's docs with `/implementation-harness patch prepare` and `patch apply`.

## State

```yaml
current_stage: ceremony
completed_stages: [context-gathering]
selected_artifacts: []
next_action: 'Ceremony: first commit'
context_fingerprint: ''
```

Update this block whenever a phase starts, completes, or is invalidated. The
`selected_artifacts` values are interface names (`architecture`, `design`, `stack`,
`efforts`) and are the source of truth for downstream review, publish, and resume.

## Evidence

| Source                                                                                                            | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                 | Reference/version                                                                |
| ----------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Prior chat session `be90c192` (2026-11-15)                                                                        | context-gathering | OKF v0.2 is experimental. It needs only a `type` frontmatter key, uses untyped links, and reserves `index.md` (no frontmatter, except `okf_version` at the bundle root) and `log.md`. OG stays the query layer and OKF is a file convention, so there is no second graph. Agreed direction: add `type`, keep `index.md` out of the graph.       | OKF `SPEC.md` v0.2, read through a subagent summary. Research must re-verify it. |
| Prior chat session `be90c192`: edge check on `index.md`                                                           | context-gathering | Excluding `index.md` breaks 4 authored graduation edges: `story-to-hld` ×2 into the HLD index, `story-to-hld` ×1 into the Engineering Guide index (wrong type), and `impl-to-engineering-guide` ×1 into the Engineering Guide index. It also drops about 10 `references` edges. Open question: retarget these, drop them, or keep some indexes. | Graph snapshot 2026-11-15                                                        |
| `docs/.og/utils.mjs` (`readIgnoreList`, `listMarkdownFiles`)                                                      | context-gathering | `.ogignore` lives at `docs/.ogignore` and holds project-relative path prefixes only, with no globs or basename rules, so it cannot express "every `index.md`". No `.ogignore` exists in this repo today.                                                                                                                                        | Identical to canonical                                                           |
| `docs/.og/cli.mjs` (`index`, `reindex`)                                                                           | context-gathering | `reindex` scans only `docs/` and prunes rows not found there. `index --doc` has no path guard: it writes an `id:` into any file, including files outside `docs/`, ignored files and `index.md`.                                                                                                                                                 | Identical to canonical                                                           |
| `docs/.og/docs.mjs` (`DocsStore.assign`)                                                                          | context-gathering | `assign` is the single write path. It adds an `id:` when one is missing and derives the tier from the path, with `AppReadme` for `apps/*/README.md`.                                                                                                                                                                                            | Identical to canonical                                                           |
| `docs/.og/constants.mjs`                                                                                          | context-gathering | The tiers are HLD, LLD, EngineeringGuide, Product and Story, matched by `docs/…` prefix, plus `AppReadme` by pattern. The `impl-to-readme` edge type exists. Tier is a database column and is not written to frontmatter, which is the source for an OKF `type`.                                                                                | Identical to canonical                                                           |
| `docs/.og/docs-operational-graph.sqlite` (read-only query)                                                        | context-gathering | 184 docs, all under `docs/`, with 12 `index.md` rows. Both `impl-to-readme` edges point at `docs/README.md`. No `apps/*` rows exist, yet `apps/web-explorer/README.md` carries a stray `id: ffe6a029`. That is the leak: `index --doc` stamped it, and `reindex` later pruned the row.                                                          | Graph as of 2026-11-17 21:38                                                     |
| `docs/**/index.md` frontmatter (11 files)                                                                         | context-gathering | Every one has `id`, `purpose` and `keywords`. `docs/index.md` also carries the VitePress `layout: home` and `hero` keys, which conflicts with OKF's no-frontmatter `index.md`. `09 Distribution`, `05 Principles` and `02 Quick Start` index pages hold real content, not only navigation.                                                      | 2026-11-17                                                                       |
| `docs/Harness/07 Operational Graph/01 Ops Model.md`, `02 Storage and Build Model.md`, `03 Visualization Model.md` | context-gathering | They document the `AppReadme` tier and `apps/*/README.md` as graph nodes, plus the 6 graduation edge types including `impl-to-readme`. This contradicts `reindex` scanning only `docs/`.                                                                                                                                                        | —                                                                                |
| `docs/Engineering Guide/Documentation/01 Principles.md` § Operational graph frontmatter                           | context-gathering | Every written doc gets `purpose` and `keywords`. OG assigns `id`. A frontmatter `type` key would be added here.                                                                                                                                                                                                                                 | —                                                                                |
| `skills/implementation-harness/canonical/docs/.og/*`, `references/reindex-graph.md`, `references/patch/03–07`     | context-gathering | Canonical OG is byte-identical to this repo's `docs/.og/`. `reindex-graph.md` documents `docs/.ogignore`. The patch prepare and apply references are the delivery path from canonical to this repo. An earlier patch, `3.5.0-graph-cli-windows-and-ignore`, added `.ogignore`.                                                                  | Package 3.5.x                                                                    |

| Field               | Value                                                                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track               | Product                                                                                                                                                                                                                                                        |
| Source docs         | `docs/Harness/`                                                                                                                                                                                                                                                |
| Dest docs           | `docs/Harness/07 Operational Graph`                                                                                                                                                                                                                            |
| Subfolder           | `07 Operational Graph` (also touches `03 Lifecycles/05 Documents Flow.md` and the Engineering Guide's Documentation Principles)                                                                                                                                |
| Stories root        | `docs/Stories/product-design/`                                                                                                                                                                                                                                 |
| Architect agent     | `@product-architect`                                                                                                                                                                                                                                           |
| Implementation note | Most Product designs are implemented in the owning downstream platform repos. Here the target is this repo's own canonical package (`skills/implementation-harness/`), which is then patched into this repo, so `/dev` in this repo is the expected next step. |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261117-7931                                                                                                                                                                |
| Branch | `docs/design-20261117-7931-okf-knowledge-base`                                                                                                                                      |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

Task tracking: Claude `TaskCreate`/`TaskUpdate` (tasks #1–#10, prefixed `DESIGN-20261117-7931 ·`), mirrored in this report.

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 11s · Wait to date: 5m 50s (closed 5m 50s + current 0s) · Unclassified: 0s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ---- | ------ | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-17T21:07:28.950Z | 2026-11-17T21:11:52.035Z | 4m 23s      | 6s   | 4m 17s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (active)             | 2026-11-17T21:11:52.087Z | unavailable              | unavailable | 5s   | 1m 33s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
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
