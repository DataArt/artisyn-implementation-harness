# Design Report — DESIGN-20261102-Q5MU: Deterministic Docs Knowledge Graph

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them._

| Field               | Value                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track               | Product                                                                                                                                                                                                                |
| Source docs         | `docs/Harness/`                                                                                                                                                                                                        |
| Dest docs           | `docs/Harness/07 Knowledge Graph`                                                                                                                                                                                      |
| Subfolder           | `07 Knowledge Graph` (new)                                                                                                                                                                                             |
| Architect agent     | `@product-architect`                                                                                                                                                                                                   |
| Implementation note | This repo is the harness's own canonical source, so implementation (skills, indexer, VitePress integration) most likely lands in this repo's own code — offer `/dev` here directly, not in a downstream platform repo. |

## State

```yaml
current_stage: evaluate
completed_stages: ['context-gathering', 'ceremony', 'frame', 'research']
selected_artifacts: []
next_action: 'Evaluate — one Evaluate doc per confirmed decision, via @product-architect'
context_fingerprint: ''
```

## Evidence

| Source                                                   | Read at stage                | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                                                                                     | Reference/version |
| -------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `docs/Harness/03 Lifecycles/05 Documents Flow.md`        | context-gathering            | Existing doc graduation pipeline (Stories → HLD/LLD/EG, track-routed Publish) that the graph must index and interoperate with, not replace.                                                                                                                                                                                                                                                                         | current           |
| `docs/Harness/06 Roadmap/01 Harness Roadmap.md` (§5.9)   | context-gathering            | Roadmap explicitly cautions: "Improve links, discovery instructions or indexing only where measured misses justify it; a separate memory service is not a prerequisite." Frame must establish the measured need, not just build indexing speculatively.                                                                                                                                                             | current           |
| `docs/Harness/03 Lifecycles/00 Overview.md`              | context-gathering            | Four named lifecycles (Dev, Design, Skill, Architecture) and their phases — graph touchpoints at "bootstrap (indexing), context gathering, documentation, publishing" must map onto concrete phases of these (e.g. `/dev context`, `/design` Context Gathering, `/dev document`, `/design publish`).                                                                                                                | current           |
| `docs/Harness/index.md`                                  | context-gathering            | States `docs/Harness/package/` is the bootstrap package, excluded from the VitePress build via `srcExclude`, "browse on GitHub or in a checkout." That folder does not exist in this checkout — a gap to flag for Frame (bootstrap-stage indexing has no package folder to hook into yet in this repo).                                                                                                             | current           |
| `docs/Engineering Guide/Lifecycles/05 Documents Flow.md` | research (Decision 2 rework) | A second, more detailed copy of "Documents Flow" exists at this Engineering Guide path (distinct from `docs/Harness/03 Lifecycles/05 Documents Flow.md` above) — named graduation edges (`/design publish (Product\|Project)`, `/dev document` × 4 variants) with exact source/destination tiers. The two copies differing is itself a live example of the implicit-relationship problem this design exists to fix. | current           |
| `docs/Engineering Guide/Documentation/02 Structure.md`   | research (Decision 2 rework) | Defines the authoritative three-tier model (HLD/LLD/Engineering Guide) plus Stories (transient) and Harness (explicitly "not a project-knowledge tier" — its own category). Mandates LLD container folder names mirror HLD container names exactly, a deterministic convention the graph can derive a relation from without authoring.                                                                              | current           |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261102-Q5MU                                                                                                                                                                |
| Branch | `docs/design-20261102-q5mu-deterministic-docs-knowledge-graph`                                                                                                                      |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate 🔄 · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 38m 38s · Wait to date: 13m 18s (closed 13m 18s + current 0s) · Unclassified: 2h 55m 37s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-02T08:52:17.886Z | 2026-11-02T08:52:58.605Z | 41s         | 6s      | 35s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-02T08:56:33.297Z | 2026-11-02T09:04:35.468Z | 8m 2s       | 8m 2s   | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-02T09:04:44.931Z | 2026-11-02T09:28:27.445Z | 23m 43s     | 21m 32s | 2m 10s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (active)             | 2026-11-02T09:28:41.207Z | unavailable              | unavailable | 8m 58s  | 10m 32s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_From Research OQ triage (2026-11-02)._

| #   | Decision           | Open question                                                                      | V/E | Answer / status                                                                                                                                            |
| --- | ------------------ | ---------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Storage format     | Does "deterministic" require byte-stable regeneration or just logical equivalence? | (E) | Deferred to Evaluate                                                                                                                                       |
| 2   | Storage format     | Is SQL-style query capability actually needed by any known consumer?               | (V) | No known consumer needs it — weakens Option C (SQLite) without disqualifying it                                                                            |
| 3   | Storage format     | Will the artifact be committed to git or produced fresh by CI?                     | (E) | Deferred to Evaluate (interacts with infra-footprint decision)                                                                                             |
| 4   | Storage format     | At what scale does a persisted index stop being optional?                          | (V) | The measured gap is Frame's own qualitative re-derivation-cost problem statement, not doc-tree volume — Option A (no index) disqualified, fails EC2        |
| 5   | Storage format     | Must the format avoid new runtime dependencies?                                    | (V) | Yes — avoid new deps unless proven necessary; disfavors SQLite unless justified (see sub-options note: `better-sqlite3`/`node:sqlite` reduce this concern) |
| 6   | Structure/topology | Are mutual/cyclic doc references valid?                                            | (V) | Cycles not disallowed — Option D's strict-DAG not required                                                                                                 |
| 7   | Structure/topology | Is section-level identity needed on day one?                                       | (V) | No — doc-level suffices; EC1 scopes IDs to "doc page"; section-level deferred                                                                              |
| 8   | Structure/topology | Should the relation vocabulary be fixed/closed or extensible?                      | (E) | Deferred to Evaluate                                                                                                                                       |
| 9   | Structure/topology | Does HLD version supersession need to be a first-class graph edge?                 | (V) | No — folder/router-based versioning already covers it; left out of the graph entirely                                                                      |
| 10  | Structure/topology | Should the vocabulary include an EG-referenced-by-Lifecycle relation specifically? | (E) | Deferred to Evaluate                                                                                                                                       |
| 11  | Structure/topology | Should Stories' design/solution/impl subfolders be attributes or sub-nodes?        | (V) | Attributes only — Stories are transient/archived, not a permanent reference tier                                                                           |
| 12  | Structure/topology | Should `publish-product`/`publish-project` be one parameterized edge or two?       | (E) | Deferred to Evaluate (affects storage-format schema)                                                                                                       |
| 13  | Structure/topology | Does mirror-edge name-matching need normalization rules?                           | (E) | Deferred to Evaluate                                                                                                                                       |
| 14  | Structure/topology | Should Product-tier node granularity match HLD/LLD's answer or differ?             | (E) | Deferred to Evaluate                                                                                                                                       |
| 15  | Structure/topology | Does `apps/*/README.md` need its own first-class node type?                        | (E) | Deferred to Evaluate                                                                                                                                       |
| 16  | Infra footprint    | Does any use case need live/interactive queries?                                   | (V) | No — Options D (scheduled Lambda) and E (running service) disqualified, no measured gap                                                                    |
| 17  | Infra footprint    | What measured gap justifies standing infra over build-time?                        | (V) | None established — confirms disqualifying D and E                                                                                                          |
| 18  | Infra footprint    | Is there a staleness tolerance ruling out manual/git-hook options?                 | (E) | Deferred to Evaluate                                                                                                                                       |
| 19  | Infra footprint    | Does bootstrap have a hook-distribution mechanism for the git-hook option?         | (V) | No established mechanism — Option C (git-hook) weakened/conditional, not disqualified                                                                      |
| 20  | Infra footprint    | Is CI build-time cost a concern at current/projected scale?                        | (E) | Deferred to Evaluate                                                                                                                                       |
| 21  | Visualization      | Are EC3 (IDE) and EC4 (VitePress) both hard requirements?                          | (V) | Yes, both literal and separate — Option A (plain-table-only) disqualified                                                                                  |
| 22  | Visualization      | What's the actual/projected doc-tree node count?                                   | (E) | Deferred to Evaluate                                                                                                                                       |
| 23  | Visualization      | Does adding a JS graph-rendering library need its own evaluation?                  | (E) | Deferred to Evaluate                                                                                                                                       |
| 24  | Visualization      | Where would a VitePress graph page live in nav?                                    | (E) | Deferred to Evaluate                                                                                                                                       |
| 25  | Visualization      | Should the IDE-side artifact be committed or generated-on-demand?                  | (E) | Deferred to Evaluate                                                                                                                                       |
| 26  | Lifecycle impact   | Does EC5 require mandatory writes or is read+optional-write sufficient?            | (V) | Optional/best-effort writes suffice — Option C (mandatory writes) disqualified, conflicts with Roadmap §5.9                                                |
| 27  | Lifecycle impact   | What's the required fallback when the graph is unavailable?                        | (E) | Deferred to Evaluate                                                                                                                                       |
| 28  | Lifecycle impact   | Does Evolve need its own graph touchpoint?                                         | (E) | Deferred to Evaluate                                                                                                                                       |
| 29  | Lifecycle impact   | Where would a new dedicated step/CI gate sit relative to existing invariants?      | (E) | Deferred to Evaluate                                                                                                                                       |
| 30  | Lifecycle impact   | Does graph interaction differ Product vs. Project track?                           | (E) | Deferred to Evaluate                                                                                                                                       |
| 31  | Bootstrap impact   | Does the bootstrap package ship doc templates at all?                              | (V) | Unknown — package doesn't exist in this checkout; Option C marked **conditional**, not disqualified                                                        |
| 32  | Bootstrap impact   | Is there a reliable early trigger for deferred indexing?                           | (V) | Yes — Context Gathering's required graph read (per lifecycle-impact resolution) provides it                                                                |
| 33  | Bootstrap impact   | Does "minimal infra" rule out a bootstrap-time scan/mutation step?                 | (V) | Independently disqualified by Frame's incremental-adoption constraint (Option D = mass-migration)                                                          |
| 34  | Bootstrap impact   | Should this decision sequence after storage-format/infra-footprint?                | (E) | Deferred to Evaluate                                                                                                                                       |
| 35  | Bootstrap impact   | Is bootstrapping into an already-documented codebase in-scope?                     | (V) | Yes, in-scope — but Option D's heavy backfill approach to it is already disqualified; left to Options A/B's deferred path                                  |

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

| Date       | Phase             | Notes                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-02 | Context Gathering | Task tracking: native Claude Task tools (TaskCreate/TaskUpdate), tasks #1–#10, one per lifecycle stage.                                                                                                                                                                                                                                                        |
| 2026-11-02 | Ceremony          | No tracker ticket (local design ID) — Step 1 tracker transition skipped. Branch checked out and confirmed by developer.                                                                                                                                                                                                                                        |
| 2026-11-02 | Frame             | 5 known requirements, 4 proposed requirements accepted. 6 independent decisions confirmed: storage, structure/topology, infra footprint, visualization, lifecycle impact, bootstrap impact.                                                                                                                                                                    |
| 2026-11-02 | Research          | @product-architect returned 27 options across 6 decisions (5/4/5/4/5/4); 35 OQs triaged (16 V-tier resolved, 19 E-tier deferred); developer confirmed set complete after reworking Decision 2's topology to ground it in the real tier model (`Documentation/02 Structure.md`, `Lifecycles/05 Documents Flow.md`) and adding SQLite sub-options to Decision 1. |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
