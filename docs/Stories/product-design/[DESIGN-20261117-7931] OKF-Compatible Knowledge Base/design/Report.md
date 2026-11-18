# Design Report — DESIGN-20261117-7931: OKF-Compatible Knowledge Base

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them. Two-track deployments: see `patterns/context-resolution.md`. Single-track deployments: these are fixed values, filled in once._

Developer intent (free-form, no tracker ticket): design an Open Knowledge Format (OKF) compatible knowledge base for the implementation harness. Guard the operational graph (OG) so it never writes into `index.md` files or docs outside `docs/`, and never adds them to the graph. Apply the rules to the harness package (`skills/implementation-harness/`) first, then carry them into this repo's docs with `/implementation-harness patch prepare` and `patch apply`.

## State

```yaml
current_stage: publish
completed_stages:
  [context-gathering, ceremony, frame, research, evaluate, solution, review-gate, address-feedback]
selected_artifacts: [architecture, design, stack, efforts]
next_action: 'Publish: update docs/Harness and terminology'
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

| Field  | Value                                                                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261117-7931                                                                                                                                                                          |
| Branch | `docs/design-20261117-7931-okf-knowledge-base`                                                                                                                                                |
| Status | 🔄 In Progress                                                                                                                                                                                |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ⏭️ (skipped) · 📤 Publish ⏳ · 🏁 Completion ⏳ |

Task tracking: Claude `TaskCreate`/`TaskUpdate` (tasks #1–#10, prefixed `DESIGN-20261117-7931 ·`), mirrored in this report.

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 11h 42m 25s · Wait to date: 2h 35m 15s (closed 2h 35m 15s + current 0s) · Unclassified: 36s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work        | Wait       | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ----------- | ---------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-17T21:07:28.950Z | 2026-11-17T21:11:52.035Z | 4m 23s      | 6s          | 4m 17s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-17T21:11:52.087Z | 2026-11-17T21:15:15.472Z | 3m 23s      | 5s          | 3m 18s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-17T21:15:15.525Z | 2026-11-17T21:28:15.597Z | 13m 0s      | 3m 23s      | 9m 37s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-17T21:28:15.648Z | 2026-11-17T22:26:35.425Z | 58m 20s     | 16m 40s     | 41m 39s    | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (completed)          | 2026-11-17T22:26:35.469Z | 2026-11-17T22:42:34.790Z | 15m 59s     | 4m 49s      | 11m 10s    | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (completed)          | 2026-11-17T22:42:34.850Z | 2026-11-18T11:25:03.321Z | 12h 42m 28s | 11h 17m 16s | 1h 25m 13s | unavailable  | unavailable   | from_tracking_start | 1        | 1             |
| review-gate (completed)       | 2026-11-18T11:25:09.114Z | 2026-11-18T11:25:44.943Z | 36s         | 6s          | 0s         | unavailable  | unavailable   | from_tracking_start | 2        | 0             |
| address-feedback (skipped)    | unavailable              | unavailable              | unavailable | 0s          | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s          | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s          | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

_From Research OQ triage (2026-11-17). Viability rows and developer decisions; Evaluation-input rows stay in each `01 Research - *.md` Open Questions table._

| #   | Open question                                                                                      | V/E | Answer / status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Must the source tree conform in place (vs a generated export)?                                     | (V) | Resolved (developer): yes, in place. A pure export is out.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2   | May the additive-only schema Compatibility rule be amended?                                        | (V) | Resolved (developer): yes, the DB structure is subject to change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 3   | May `patch apply` rewrite consumer frontmatter?                                                    | (V) | Resolved (developer): yes, through an explicit migration instruction (restructure frontmatter, migrate DB, reindex), never silently.                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4   | May OG write frontmatter keys other than `id`?                                                     | (V) | Resolved (developer): yes, e.g. stamp `type`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 5   | Are `docs/Stories/` inside an OKF bundle?                                                          | (V) | Resolved (developer): inside; every Story `.md` carries `type`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 6   | Should `reindex`/`build` exit non-zero on scope violations?                                        | (V) | Resolved (developer): no. They report in JSON and exit 0; only `index` fails loudly.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 7   | Target frontmatter format (D1)                                                                     | (V) | Resolved (developer): OKF names: `type`, `title`, `description` (ex `purpose`), `tags` (ex `keywords`), plus `generated: {by, at}` (creation) and `updated: {by, at}` (last meaningful update, harness extension). No `timestamp`. `id` stays as OG extra key.                                                                                                                                                                                                                                                                                   |
| 8   | Bring OKF `generated` into scope?                                                                  | (V) | Resolved (developer): yes; Frame boundary amended. Other trust fields stay out.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 9   | Who writes time values; `by` actor values                                                          | (V) | Proposed and accepted: writers write `updated`; OG never stamps time; migration seeds from git dates. `by` uses process/producer actors only, never `human:<id>` (public site).                                                                                                                                                                                                                                                                                                                                                                  |
| 10  | `type` vocabulary and ownership                                                                    | (V) | Proposed and accepted: descriptive per-kind values with a per-bundle fallback; templates carry it for Stories; OG stamps once from a canonical path map, then the author owns it. Exact list fixed in Evaluate.                                                                                                                                                                                                                                                                                                                                  |
| 11  | Require `description`/`tags` beyond OKF?                                                           | (V) | Proposed and accepted: yes, keep today's Principles rule.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 12  | Scope of "knowledge base" / bundle roots                                                           | (V) | Resolved (developer): developer proposed five tier bundles (HLD, LLD, Stories, Engineering Guide, Product) as candidate Option 6.                                                                                                                                                                                                                                                                                                                                                                                                                |
| 13  | Product tier folder name in canonical OG                                                           | (V) | Resolved (developer): set per project at harness launch; OG reads it from launch configuration. Recorded as a fix.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 14  | EC2/EC3 "never": every caller, no project override?                                                | (V) | Proposed and accepted: every caller of the OG module; no override for `index.md`. Scope guard Option A needs `assign` guarded; Option C needs `index.md` hardcoded.                                                                                                                                                                                                                                                                                                                                                                              |
| 15  | Untiered docs under `docs/` stay in the graph?                                                     | (V) | Proposed and accepted: yes. Scope guard Option D needs an explicit extra-path list.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 16  | Can migration run before the first guarded build prunes?                                           | (V) | Verified: not today. Options without a prune safety net cannot meet EC7 in consuming projects.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 17  | Migration cases                                                                                    | (V) | Resolved (developer): greenfield (nothing), older harness (migrate), already migrated (no-op); idempotent.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 18  | How the patch migration runs (given `05-patch-apply.md` §2) and which signal detects project state | (V) | Resolved (developer confirmed at Evaluate sign-off, 2026-11-17): the DB schema migrates inside OG on open via `PRAGMA user_version` (edges preserved). A deterministic `cli.mjs migrate` rewrites frontmatter, detected by OG-era keys (`purpose`/`keywords`) in scope. `reindex-graph` runs `migrate` when pending, before `build`. OG reads old and new key names until migrated, so CI builds never lose data. Greenfield starts at v1; migrated projects no-op. Product folder: the launch Q10c answer is written to a small OG config file. |
| 19  | VitePress rewrites vs `srcExclude`; file-relative links under rewrites                             | (V) | Partly verified (VitePress 1.6.4 supports parameterized rewrites). Evaluate Step 1b: bundle options 1, 3, 5 stay conditional on a rewrites spike. Option 6 does not use rewrites.                                                                                                                                                                                                                                                                                                                                                                |
| 20  | Node 24 `node:sqlite` ALTER support; `path.matchesGlob`                                            | (V) | Verified: SQLite 3.53.3 supports RENAME/DROP COLUMN; `path.matchesGlob` matches `**/index.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

---

## Solution Concern Scan

_Solution Step 1b, 2026-11-17. Auto-approved: every concern resolves from confirmed decisions (Evaluate sign-off, Assumptions 1–20)._

| Concern                      | Rating         | Evidence / where addressed                                                                                                                  |
| ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Boundaries and ownership     | Material       | OG write scope, launch, reindex-graph, patch apply, docs flow change responsibilities. `solution/Architecture.md`.                          |
| User and business behavior   | Informational  | Writers (`@docs-writer`, lifecycle steps) follow a new frontmatter and `index.md` rule. `Design - Target Frontmatter Format.md`.            |
| Data and state               | Material       | Schema v1, frontmatter rewrite of every doc, index-page id move. `Design - Graph Schema and Migration.md`, `Design - OKF Bundle Layout.md`. |
| Interfaces and compatibility | Material       | CLI renames, new `migrate`/`check`, `og.config.json`, frontmatter contract, retired edge type. Design files.                                |
| Security and privacy         | Informational  | Path guard at the sink; no `human:<id>` on a public site (NFR: no access gate). Architecture decisions.                                     |
| Reliability and recovery     | Material       | Idempotent migration, prune safety, read-compat window, clean-worktree precondition, newer-DB error. Architecture + Design.                 |
| Performance and capacity     | Not applicable | ~190 small markdown files; frontmatter-only parsing.                                                                                        |
| Operations and delivery      | Material       | Canonical-first delivery, patch → reindex-graph trigger, launch config. `solution/Efforts.md`.                                              |
| Cost and licensing           | Not applicable | No new dependency or service.                                                                                                               |
| Compliance and policy        | Informational  | Public site; actor rule covers it.                                                                                                          |
| Evolution and migration      | Material       | Three project states, `okf_version` pin, read-compat window removal at next major. Design + Efforts.                                        |

Selected interfaces: `architecture` (OG, launch, reindex-graph, patch and docs-flow responsibilities change), `design` (four per-decision files: format, schema and migration, bundle layout, scope guard), `stack` (OKF 0.2 pin, `node:sqlite` version constraint, no-dependency parser), `efforts` (canonical-first delivery, migration, rollback). None omitted.

## Solution Quality Gate

_2026-11-18. Result: pass, with one recorded limitation._

| Check                                                                           | Result                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framed requirements EC1–EC10 mapped to decisions and verification               | Pass — `solution/Architecture.md` decision register and Verification rows. Efforts item 9 is a developer-requested addition outside the ECs.                                                                                                             |
| Material concerns addressed                                                     | Pass — every material row in the concern scan maps to a selected artifact.                                                                                                                                                                               |
| No rationale, rejected options or placeholders in solution files                | Pass — rationale stays in `design/02 Evaluate - *.md`; the only options summary is Architecture's Considered Options appendix.                                                                                                                           |
| Architecture.md is the E2E record; supporting files add no conflicting decision | Pass — confirmed by the second `@product-architect` pass plus the N1–N6 and wording fixes.                                                                                                                                                               |
| Mermaid diagrams render                                                         | Limitation — `mmdc` is installed but `puppeteer` is missing, and `mermaid.parse` needs a DOM (`jsdom` absent). Fallback: structural syntax check on all 16 diagrams (block balance, defined classes, no `;` and no bare `<word>` in labels): 0 problems. |
| Relative links resolve                                                          | Pass — every link outside code fences resolves; fenced example `index.md` links are relative to their example bundle.                                                                                                                                    |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-17 — Decision 1: Target frontmatter format

_Recommended option: B+ (generated + updated)._

| Pillar                 | Rating | Headline                                                                                                                                 |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Clear key meanings; writers own `updated`; deterministic migration seeds values from git.                                                |
| Security               | 🟢     | No personal identities in public frontmatter; `by` limited to process/producer actors.                                                   |
| Reliability            | 🟡     | Hand-written YAML subset parser is new code on a critical path (P2: validate against every current doc before migration rewrites files). |
| Performance Efficiency | 🟢     | Frontmatter-only parsing; no runtime cost.                                                                                               |
| Cost Optimization      | 🟢     | No dependencies, no new services.                                                                                                        |
| Sustainability         | 🟢     | No time churn on reindex.                                                                                                                |

**P1 items (resolve before implementation):**

- None.

**P2/P3:** P2: parser validated against the full doc corpus (golden round-trip test). P3: map `updated` to an OKF key if one is standardised.

Full elaboration: `design/02 Evaluate - Target Frontmatter Format.md`

### WAF — Evaluate — 2026-11-17 — Decision 2: Graph schema and migration

_Recommended option: Option 2 with 4r's column set and 3r's read-compat window._

| Pillar                 | Rating | Headline                                                                                                                                              |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Self-detecting, idempotent migration; one trigger point (`reindex-graph`); counts diff printed.                                                       |
| Security               | 🟢     | Local file and SQLite only; no new access paths.                                                                                                      |
| Reliability            | 🟡     | Rewriting every doc's frontmatter in one pass is a large change (P2: `--dry-run` summary and a clean-worktree precondition so `git` is the rollback). |
| Performance Efficiency | 🟢     | In-place ALTER; reindex cost unchanged.                                                                                                               |
| Cost Optimization      | 🟢     | No new tooling.                                                                                                                                       |
| Sustainability         | 🟢     | No duplicated stores.                                                                                                                                 |

**P1 items (resolve before implementation):**

- None.

**P2/P3:** P2: dry-run + clean-worktree precondition. P3: drop the read-compat window at the next major release.

Full elaboration: `design/02 Evaluate - Graph Schema and Migration.md`

### WAF — Evaluate — 2026-11-17 — Decision 3: OKF bundle layout

_Recommended option: Option 6, five tier bundles._

| Pillar                 | Rating | Headline                                                                                                       |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡     | Five `okf_version` pins and writer-maintained indexes (P2: `og check` reports drift on every `reindex-graph`). |
| Security               | 🟢     | Public docs only; no new exposure.                                                                             |
| Reliability            | 🟢     | No VitePress rewrites; home untouched; edges survive via id move.                                              |
| Performance Efficiency | 🟢     | No runtime cost.                                                                                               |
| Cost Optimization      | 🟢     | No generator, no export artifact.                                                                              |
| Sustainability         | 🟢     | Single source tree, no duplicate bundle.                                                                       |

**P1 items (resolve before implementation):**

- None.

**P2/P3:** P2: `og check` conformance report. P3: `log.md`.

Full elaboration: `design/02 Evaluate - OKF Bundle Layout.md`

### WAF — Evaluate — 2026-11-17 — Decision 4: OG scope guard

_Recommended option: Option B, one scope predicate at the single write path._

| Pillar                 | Rating | Headline                                                                                                     |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟢     | One rule, one place; violations visible in JSON output.                                                      |
| Security               | 🟢     | Path allow-by-root check at the sink (OWASP path traversal pattern); OG can no longer write outside `docs/`. |
| Reliability            | 🟢     | No silent loss of authored edges; loud `index`.                                                              |
| Performance Efficiency | 🟢     | Cheap string checks.                                                                                         |
| Cost Optimization      | 🟢     | Small code change.                                                                                           |
| Sustainability         | 🟢     | Removes dead tier and pattern.                                                                               |

**P1 items (resolve before implementation):**

- None.

**P2/P3:** P2: none. P3: consider `og check` integration in CI.

Full elaboration: `design/02 Evaluate - OG Scope Guard.md`

### WAF — Solution — 2026-11-18

_Target: `solution/Architecture.md` + four `solution/Design - *.md` files. Two `@product-architect` review passes: pass 1 found 20 findings (Reliability 🔴, 4 P1); the developer agreed all resolutions; pass 2 confirmed all 20 resolved and raised N1–N6; N1 decided by the developer (migrate writes navigation bullets), N2–N6 applied; `docs/index.md` kept untouched by developer decision._

| Pillar                 | Rating | Headline                                                                                                                                                                                                            |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | One trigger (`reindex-graph`) with dry-run confirmation, stop on refusal, decline path, Product folder asked before the dry-run, `check` report every run.                                                          |
| Security               | 🟢     | Path guard at the single write sink; config-independent reserved-name rule; `productDir` validated; no personal identities in public frontmatter.                                                                   |
| Reliability            | 🟢     | `.md`-only clean check, v0 backup before on-open migration, line-level strip fallback, `type` stamped only by `index --doc`/`migrate`, edge merge counted, prune keeps rows while ids remain, idempotent `migrate`. |
| Performance Efficiency | 🟢     | Frontmatter-only parsing; one-time migration cost acceptable.                                                                                                                                                       |
| Cost Optimization      | 🟢     | No new dependency or service.                                                                                                                                                                                       |
| Sustainability         | 🟢     | Prettier-tolerant parser and `check`; no time churn.                                                                                                                                                                |

**P1 items (resolve before implementation):**

- None.

**P2/P3:** P3 — `docs/index.md` keeps `purpose`/`keywords`; after the read-compat window ends (the following major) OG no longer reads its description unless a writer renames those keys.

---

## Gate

- Approver: Anton Merkulov (sole approver)
- Draft MR: — (skipped by developer: sole approver, approved in chat)
- Approved: 2026-11-18
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase    | Notes                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-17 | Frame    | 6 known requirements, 4 proposed requirements accepted (EC7–EC10); 3 decisions confirmed: Frontmatter and graph schema, OKF bundle layout, OG scope guard                                                                                                                                                                                                                             |
| 2026-11-17 | Research | @product-architect returned options for 4 decisions: D1 Target frontmatter format (A–D, B+ developer direction), D2 Graph schema and migration (5, re-scoped after split), D3 OKF bundle layout (6 incl. developer Option 6 five tier bundles), D4 OG scope guard (A–D). Decision split reworked from 3 to 4 at sign-off; OKF v0.2 spec re-verified; developer confirmed set complete |
| 2026-11-17 | Evaluate | Recommended D1 B+ (generated + updated), D2 Option 2 with tier/type columns and read-compat window, D3 Option 6 five tier bundles, D4 Option B scope predicate at assign; WAF: D1 Reliability 🟡, D2 Reliability 🟡, D3 OpEx 🟡, rest 🟢; 0 P1 items; Assumption #18 confirmed by developer                                                                                           |
| 2026-11-18 | Solution | Selected artifacts written: Architecture, Design x4, Stack, Efforts (WBS 1–9). @product-architect: 2 passes, 20 + 6 findings resolved (N1 and D-home decided by developer). WAF: pass, all 🟢, 0 P1, 1 P3. Quality gate: pass (Mermaid checked structurally, no renderer). Estimates skipped by developer                                                                             |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
