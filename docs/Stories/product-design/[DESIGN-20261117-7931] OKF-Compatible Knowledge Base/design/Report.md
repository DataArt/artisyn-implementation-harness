# Design Report — DESIGN-20261117-7931: OKF-Compatible Knowledge Base

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them. Two-track deployments: see `patterns/context-resolution.md`. Single-track deployments: these are fixed values, filled in once._

Developer intent (free-form, no tracker ticket): design an Open Knowledge Format (OKF) compatible knowledge base for the implementation harness. Guard the operational graph (OG) so it never writes into `index.md` files or docs outside `docs/`, and never adds them to the graph. Apply the rules to the harness package (`skills/implementation-harness/`) first, then carry them into this repo's docs with `/implementation-harness patch prepare` and `patch apply`.

## State

```yaml
current_stage: evaluate
completed_stages: [context-gathering, ceremony, frame, research]
selected_artifacts: []
next_action: 'Research commit, then Evaluate (4 decisions; resolve Assumptions #18-19 at Step 1b)'
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
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate 🔄 · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

Task tracking: Claude `TaskCreate`/`TaskUpdate` (tasks #1–#10, prefixed `DESIGN-20261117-7931 ·`), mirrored in this report.

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 20m 15s · Wait to date: 56m 40s (closed 56m 40s + current 0s) · Unclassified: 0s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-17T21:07:28.950Z | 2026-11-17T21:11:52.035Z | 4m 23s      | 6s      | 4m 17s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-17T21:11:52.087Z | 2026-11-17T21:15:15.472Z | 3m 23s      | 5s      | 3m 18s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-17T21:15:15.525Z | 2026-11-17T21:28:15.597Z | 13m 0s      | 3m 23s  | 9m 37s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (active)             | 2026-11-17T21:28:15.648Z | unavailable              | unavailable | 16m 40s | 39m 28s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

_From Research OQ triage (2026-11-17). Viability rows and developer decisions; Evaluation-input rows stay in each `01 Research - *.md` Open Questions table._

| #   | Open question                                                                                      | V/E | Answer / status                                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Must the source tree conform in place (vs a generated export)?                                     | (V) | Resolved (developer): yes, in place. A pure export is out.                                                                                                                                                                                                     |
| 2   | May the additive-only schema Compatibility rule be amended?                                        | (V) | Resolved (developer): yes, the DB structure is subject to change.                                                                                                                                                                                              |
| 3   | May `patch apply` rewrite consumer frontmatter?                                                    | (V) | Resolved (developer): yes, through an explicit migration instruction (restructure frontmatter, migrate DB, reindex), never silently.                                                                                                                           |
| 4   | May OG write frontmatter keys other than `id`?                                                     | (V) | Resolved (developer): yes, e.g. stamp `type`.                                                                                                                                                                                                                  |
| 5   | Are `docs/Stories/` inside an OKF bundle?                                                          | (V) | Resolved (developer): inside; every Story `.md` carries `type`.                                                                                                                                                                                                |
| 6   | Should `reindex`/`build` exit non-zero on scope violations?                                        | (V) | Resolved (developer): no. They report in JSON and exit 0; only `index` fails loudly.                                                                                                                                                                           |
| 7   | Target frontmatter format (D1)                                                                     | (V) | Resolved (developer): OKF names: `type`, `title`, `description` (ex `purpose`), `tags` (ex `keywords`), plus `generated: {by, at}` (creation) and `updated: {by, at}` (last meaningful update, harness extension). No `timestamp`. `id` stays as OG extra key. |
| 8   | Bring OKF `generated` into scope?                                                                  | (V) | Resolved (developer): yes; Frame boundary amended. Other trust fields stay out.                                                                                                                                                                                |
| 9   | Who writes time values; `by` actor values                                                          | (V) | Proposed and accepted: writers write `updated`; OG never stamps time; migration seeds from git dates. `by` uses process/producer actors only, never `human:<id>` (public site).                                                                                |
| 10  | `type` vocabulary and ownership                                                                    | (V) | Proposed and accepted: descriptive per-kind values with a per-bundle fallback; templates carry it for Stories; OG stamps once from a canonical path map, then the author owns it. Exact list fixed in Evaluate.                                                |
| 11  | Require `description`/`tags` beyond OKF?                                                           | (V) | Proposed and accepted: yes, keep today's Principles rule.                                                                                                                                                                                                      |
| 12  | Scope of "knowledge base" / bundle roots                                                           | (V) | Resolved (developer): developer proposed five tier bundles (HLD, LLD, Stories, Engineering Guide, Product) as candidate Option 6.                                                                                                                              |
| 13  | Product tier folder name in canonical OG                                                           | (V) | Resolved (developer): set per project at harness launch; OG reads it from launch configuration. Recorded as a fix.                                                                                                                                             |
| 14  | EC2/EC3 "never": every caller, no project override?                                                | (V) | Proposed and accepted: every caller of the OG module; no override for `index.md`. Scope guard Option A needs `assign` guarded; Option C needs `index.md` hardcoded.                                                                                            |
| 15  | Untiered docs under `docs/` stay in the graph?                                                     | (V) | Proposed and accepted: yes. Scope guard Option D needs an explicit extra-path list.                                                                                                                                                                            |
| 16  | Can migration run before the first guarded build prunes?                                           | (V) | Verified: not today. Options without a prune safety net cannot meet EC7 in consuming projects.                                                                                                                                                                 |
| 17  | Migration cases                                                                                    | (V) | Resolved (developer): greenfield (nothing), older harness (migrate), already migrated (no-op); idempotent.                                                                                                                                                     |
| 18  | How the patch migration runs (given `05-patch-apply.md` §2) and which signal detects project state | (V) | Open: resolve at Evaluate Step 1b. All options conditional on it.                                                                                                                                                                                              |
| 19  | VitePress rewrites vs `srcExclude`; file-relative links under rewrites                             | (V) | Partly verified (VitePress 1.6.4 supports parameterized rewrites). Bundle options 1, 3, 5 conditional on a spike in Evaluate.                                                                                                                                  |
| 20  | Node 24 `node:sqlite` ALTER support; `path.matchesGlob`                                            | (V) | Verified: SQLite 3.53.3 supports RENAME/DROP COLUMN; `path.matchesGlob` matches `**/index.md`.                                                                                                                                                                 |

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

| Date       | Phase    | Notes                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-17 | Frame    | 6 known requirements, 4 proposed requirements accepted (EC7–EC10); 3 decisions confirmed: Frontmatter and graph schema, OKF bundle layout, OG scope guard                                                                                                                                                                                                                             |
| 2026-11-17 | Research | @product-architect returned options for 4 decisions: D1 Target frontmatter format (A–D, B+ developer direction), D2 Graph schema and migration (5, re-scoped after split), D3 OKF bundle layout (6 incl. developer Option 6 five tier bundles), D4 OG scope guard (A–D). Decision split reworked from 3 to 4 at sign-off; OKF v0.2 spec re-verified; developer confirmed set complete |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
