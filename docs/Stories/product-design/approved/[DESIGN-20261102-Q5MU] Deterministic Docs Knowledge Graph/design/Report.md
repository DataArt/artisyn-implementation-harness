---
id: 6a3f0e7a
---

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
current_stage: completion
completed_stages:
  [
    'context-gathering',
    'ceremony',
    'frame',
    'research',
    'evaluate',
    'solution',
    'review-gate',
    'address-feedback (skipped)',
    'publish',
  ]
selected_artifacts: ['architecture', 'design', 'stack', 'efforts']
next_action: 'Completion — archive, implementation ticket, tracker sync'
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
| Status | ✅ Complete                                                                                                                                                                         |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ✅ · 📤 Publish ✅ · 🏁 Completion ✅ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 4h 37m 8s · Wait to date: 1h 2m 22s (closed 1h 0m 32s + current 1m 49s) · Unclassified: 7m 55s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work      | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | --------- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-02T08:52:17.886Z | 2026-11-02T08:52:58.605Z | 41s         | 6s        | 35s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-02T08:56:33.297Z | 2026-11-02T09:04:35.468Z | 8m 2s       | 8m 2s     | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-02T09:04:44.931Z | 2026-11-02T09:28:27.445Z | 23m 43s     | 21m 32s   | 2m 10s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-02T09:28:41.207Z | 2026-11-02T12:48:55.785Z | 3h 20m 15s  | 3h 0m 41s | 19m 34s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (completed)          | 2026-11-02T12:49:44.883Z | 2026-11-02T13:13:15.819Z | 23m 31s     | 7m 56s    | 15m 35s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (completed)          | 2026-11-02T13:14:06.247Z | 2026-11-02T13:47:55.599Z | 33m 49s     | 14m 8s    | 19m 41s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| review-gate (completed)       | 2026-11-02T13:48:04.503Z | 2026-11-02T13:54:55.194Z | 6m 51s      | 4m 12s    | 1m 49s  | unavailable  | unavailable   | from_tracking_start | 2        | 0             |
| address-feedback (skipped)    | unavailable              | unavailable              | unavailable | 0s        | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (completed)           | 2026-11-02T13:55:57.645Z | 2026-11-02T14:36:15.845Z | 40m 18s     | 39m 10s   | 1m 8s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| completion (waiting)          | 2026-11-02T14:36:32.260Z | unavailable              | unavailable | 1m 22s    | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |

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

### WAF — Evaluate — 2026-11-02

_Six decisions, one closing WAF assessment each (recommended option only)._

#### Decision 1 — Graph storage format

_Recommended option: C — SQLite via `node:sqlite`._

| Pillar                 | Rating | Headline                                                                                    |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡     | Binary artifact opaque to PR diff; experimental-API risk scoped to one internal script      |
| Security               | 🟢     | Local file only, no network/credential surface                                              |
| Reliability            | 🟢     | Schema constraints (uniqueness/FK) give structural guarantees other options lack            |
| Performance Efficiency | 🟢     | More than sufficient at stated scope; query power unneeded but available                    |
| Cost Optimization      | 🟢     | Zero license cost, zero new npm dependency to audit                                         |
| Sustainability         | 🟡     | No dependency-maintenance burden, but binary format assumes a Node-based consumer toolchain |

**P1 items (resolve before implementation):**

- Pin/document the Node version floor (`>=24`) and add a CI check that fails loudly on `node:sqlite` behavior drift.

Full elaboration: `design/02 Evaluate - Graph storage format.md`

#### Decision 2 — Graph structure and topology

_Recommended option: 3 — tier-typed nodes + derived mirror edge._

| Pillar                 | Rating | Headline                                                                                                      |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Deterministic, re-derivable build; mirror edges need zero manual authoring                                    |
| Security               | 🟢     | No credentials/PII surface; mirror layer only reads file/folder names                                         |
| Reliability            | 🟡     | False-positive gap risk if name-matching lacks normalization rules                                            |
| Performance Efficiency | 🟢     | Doc-level granularity keeps cardinality low                                                                   |
| Cost Optimization      | 🟢     | No new always-on infra; selected over Option 4 partly on cost grounds                                         |
| Sustainability         | 🟡     | Mirror half is self-sustaining; authored half depends on Decision 5's edges being correctly emitted over time |

**P1 items (resolve before implementation):**

- Resolve name-matching normalization rules and gap-ownership (OQ-2) before trusting `mirrors-gap` signals downstream.

Full elaboration: `design/02 Evaluate - Graph structure and topology.md`

#### Decision 3 — Representation / infra footprint

_Recommended option: B — build-time script, hybrid shape (agent + CI invokable)._

| Pillar                 | Rating | Headline                                                                                     |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Single artifact for both invocation paths; build failure is a visible standard CI signal     |
| Security               | 🟢     | No new standing surface, no new auth story                                                   |
| Reliability            | 🟡     | Freshness between builds bound to deploy cadence; agent-invoked leg's failure modes unscoped |
| Performance Efficiency | 🟡     | Doc-tree scan cost at build time unmeasured                                                  |
| Cost Optimization      | 🟢     | Zero incremental infra cost, rides existing CI/build compute                                 |
| Sustainability         | 🟢     | No standing infrastructure, no idle resource consumption                                     |

**P1 items (resolve before implementation):**

- Resolve whether build-cadence freshness alone is sufficient, or whether a lifecycle step needs same-session-fresh graph guarantees (OQ-1), before Solution finalizes invocation responsibilities.

Full elaboration: `design/02 Evaluate - Representation infra footprint.md`

#### Decision 4 — Visualization surface

_Recommended option: D — both surfaces, shared data source (IDE rendering mechanism explicitly unresolved)._

| Pillar                 | Rating | Headline                                                                                           |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡     | Two render paths can drift/fail independently; IDE-side freshness mechanism unresolved             |
| Security               | 🟢     | No new runtime surface; new JS library's supply-chain posture not yet vetted                       |
| Reliability            | 🟡     | Cross-editor fidelity (VS Code vs. JetBrains) unverified; rendering mechanism itself still open    |
| Performance Efficiency | 🟡     | Mermaid's scaling ceiling unverified against this doc tree's actual/projected size                 |
| Cost Optimization      | 🟢     | No new always-on infra; stays within existing static-site + CI footprint                           |
| Sustainability         | 🟡     | Right structural shape, but long-term maintainability hinges on the still-unresolved IDE mechanism |

**P1 items (resolve before implementation):**

- Resolve doc-tree node/edge count (OQ-2 in that file) before finalizing the IDE emitter's format — determines whether Mermaid is viable at scale.
- IDE-rendering-mechanism spike must include a cross-editor fidelity check as an explicit acceptance criterion.

Full elaboration: `design/02 Evaluate - Visualization surface.md`

#### Decision 5 — Harness lifecycle impact

_Recommended option: B (revised) — required read (Context Gathering/Research, unchanged) AND required write (Document/Publish), but tool-automated via the same zero-dep script from Decisions 3/6, not manually authored._

| Pillar                 | Rating | Headline                                                                                                                                                  |
| ---------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡     | Fallback behavior for missing/stale graph not yet specified                                                                                               |
| Security               | 🟢     | No new credential/access-control surface                                                                                                                  |
| Reliability            | 🟡     | Automating the write dissolves the original mandatory-write reliability risk, but the script's own failure/retry behavior is now the open question (OQ-5) |
| Performance Efficiency | 🟢     | Expected to be cheaper than today's full re-read/grep pattern                                                                                             |
| Cost Optimization      | 🟢     | No mandatory _manual_ tooling spend forced onto every ticket — the write is automated, not a new human task                                               |
| Sustainability         | 🟢     | Reuses existing phase prompts; Evolve touchpoint (OQ-2 in that file) still open                                                                           |

**P1 items (resolve before implementation):**

- Specify the exact fallback contract for Context/Research when the graph is absent or stale, before Solution is finalized.
- Define the automated script's failure/retry behavior during `/dev document`/`/design publish` (OQ-5) — without it, a required-but-automated write could still silently block phase completion in an edge case.

Full elaboration: `design/02 Evaluate - Harness lifecycle impact.md`

#### Decision 6 — Harness bootstrap impact

_Recommended option: B+ (revised) — bootstrap script runs proactively at `launch` (not deferred to first later use), assigning a deterministic, collision-safe frontmatter ID to any doc missing one and building the initial graph in the same pass; runs silently, no confirmation prompt._

| Pillar                 | Rating | Headline                                                                                                                                  |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Self-contained, deterministically regenerable; now runs proactively at launch rather than silently on first later use                     |
| Security               | 🟡     | Shipping an executable script is a (small) new execution surface; no stated review/provenance step                                        |
| Reliability            | 🟢     | Additive-only, idempotent ID assignment (skips docs that already have one) addresses the original Option D collision/retry risks directly |
| Performance Efficiency | 🟢     | Lightest-footprint mechanism among all four options considered                                                                            |
| Cost Optimization      | 🟢     | Zero marginal/ongoing cost; reused across every bootstrapped project                                                                      |
| Sustainability         | 🟡     | Long-term script ownership/versioning across bootstrap-package releases unresolved                                                        |

**P1 items (resolve before implementation):**

- Confirm who owns script versioning across bootstrap-package releases before Publish finalizes this decision — the one gap that could undercut its sustainability claim.
- Specify the exact deterministic ID generation scheme that guarantees no collisions (OQ-5) — the collision-safety claim this revision rests on is otherwise unverified.

Full elaboration: `design/02 Evaluate - Harness bootstrap impact.md`

### Review — solution — 2026-11-02 [pillars: all]

| Pillar                 | Rating | Headline                                                                                                                                   |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟡     | Fully automated (CI + agent invocation), no standing service; no observability/metrics defined yet for automated-write failures            |
| Security               | 🟢     | No credentials, no network surface, additive-only frontmatter mutation, parameterized SQL throughout                                       |
| Reliability            | 🟡     | Idempotent, non-blocking failure design is sound; exact fallback/retry mechanisms remain Efforts.md spikes (tracked, not silently dropped) |
| Performance Efficiency | 🟡     | Doc-tree sizing (Efforts #7) still pending — needed before committing to Mermaid/graph-rendering-library choices at scale                  |
| Cost Optimization      | 🟢     | Zero new always-on infra; `node:sqlite` is a Node built-in, `sql.js` is open-source, no license cost                                       |
| Sustainability         | 🟢     | Derived mirror edge and automated ID assignment both eliminate ongoing manual-maintenance burden                                           |

**P1 items:**

- none — all identified gaps (ID-generation scheme, doc-tree sizing, IDE-rendering mechanism, staleness threshold, CI cost, script-versioning ownership) are already correctly deferred to named spike/chore tickets in `solution/Efforts.md`, not silently assumed or left unaddressed.

### Design quality gate — 2026-11-02

| Check                                                                                                | Result                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every framed EC/constraint mapped to a decision or explicit N/A                                      | ✅ Pass — all 6 decision rows in `solution/Architecture.md`'s register trace to Frame's ECs                                                                                                                                                                         |
| Every material concern from the Step 1b preliminary scan has an artifact/owning requirement/decision | ✅ Pass — no material concern was unresolved; scan found nothing blocking                                                                                                                                                                                           |
| Solution artifacts contain decisions/interfaces only, no rationale/rejected options/placeholders     | ✅ Pass — one placeholder ("ownership TBD") was caught by the architect review and resolved before this check                                                                                                                                                       |
| `solution/Architecture.md` is the canonical E2E record; Design/Stack/Efforts don't conflict          | ✅ Pass — verified via decision-coverage check (Step 6); no supporting artifact introduces an unrecorded material decision                                                                                                                                          |
| Every Mermaid diagram renders correctly                                                              | ⚠️ No Mermaid CLI available in this repo (`mmdc` not found) — ran a syntax-oriented inspection instead: all fences balanced, no reserved-keyword classDef names (the `graph`-keyword bug found earlier in `design/` was checked for and not present in `solution/`) |
| All relative links in selected artifacts resolve                                                     | ✅ Pass — every `solution/*.md` cross-reference and `design/02 Evaluate - *.md` reference checked against the filesystem; only non-resolving hit is an intentional `{Decision}` template placeholder in Architecture.md's Considered Options appendix               |

Overall: pass, with the Mermaid-CLI limitation recorded as a known gap (no CLI in this environment), not a failure.

---

## Gate

- Approver: Anton Merkulov
- Draft MR: https://github.com/DataArt/artisyn-harness/pull/9
- Approved: 2026-11-02
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-02 | Context Gathering | Task tracking: native Claude Task tools (TaskCreate/TaskUpdate), tasks #1–#10, one per lifecycle stage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-11-02 | Ceremony          | No tracker ticket (local design ID) — Step 1 tracker transition skipped. Branch checked out and confirmed by developer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-11-02 | Frame             | 5 known requirements, 4 proposed requirements accepted. 6 independent decisions confirmed: storage, structure/topology, infra footprint, visualization, lifecycle impact, bootstrap impact.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-11-02 | Research          | @product-architect returned 27 options across 6 decisions (5/4/5/4/5/4); 35 OQs triaged (16 V-tier resolved, 19 E-tier deferred); developer confirmed set complete after reworking Decision 2's topology to ground it in the real tier model (`Documentation/02 Structure.md`, `Lifecycles/05 Documents Flow.md`) and adding SQLite sub-options to Decision 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-11-02 | Evaluate          | Recommended: D1 SQLite/`node:sqlite`, D2 Option 3 (tier-typed + mirror edge), D3 Option B (hybrid agent+CI script), D4 Option D (both surfaces, IDE mechanism open), D5 Option B revised (required read+automated write), D6 Option B+ revised (proactive launch-time index + collision-safe ID auto-assignment). WAF: all 6 green-to-amber, no red; 9 P1 items. Developer-driven revisions merged automated-write/ID-autoassignment into D5/D6 after reviewing why C/D were originally disqualified.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-11-02 | Solution          | Selected artifacts written: `Architecture.md` (6-decision integrated record), 6× `Design - {Decision}.md`, `Stack.md`, `Efforts.md`. Architect review: 2 iterations, 3 mechanical findings auto-applied, clean on re-review. WAF (solution target): 🟡🟢🟡🟡🟢🟢, 0 P1. Quality gate: pass (Mermaid CLI unavailable, syntax inspection used). Developer requests: added `title`/`purpose` columns + frontmatter format spec to storage schema; genericized `docs/Harness/` → `docs/Product/` placeholder in illustrative examples (kept real citations/this design's own Publish destination unchanged); simplified `Efforts.md` from a 14-item WBS to a single implementable ticket with 11 ordered build steps, estimated at 3h, ending in a `/harness-bootstrap launch` validation run.                                                                                                                                                                |
| 2026-11-02 | Publish           | Updated `docs/Harness/07 Knowledge Graph/` (new section: `index.md`, `01 Ops Model.md`, `02 Storage and Build Model.md`, `03 Visualization Model.md`) + `docs/Harness/index.md` Sections row + VitePress nav (auto-scanned, no edit needed). All 6 decisions represented across the 3 content pages. Skipped `06 Roadmap/01 Harness Roadmap.md` cross-reference per developer call. Architect review: 4 rounds (CI-label fix; CloudFront/S3/Web-container/VitePress leaks; ungrounded "Graph type" framing trimmed to developer-confirmed facts; final clean pass), clean OK each time after corrections. Developer additions during Publish: `keywords` schema field, prose→table conversions, from/to-vs-parent_id and string-ID-vs-integer clarifications, worked example section — added to both the solution doc and the published doc, re-reviewed clean. Fixed one real Mermaid bug (invalid `classDef`/`class` inside a `sequenceDiagram` block). |
| 2026-11-02 | Completion        | Implementation ticket not published to Jira — developer chose `/dev` directly in this repo, consistent with the Implementation note. Archived to `docs/Stories/product-design/approved/[DESIGN-20261102-Q5MU] Deterministic Docs Knowledge Graph`; no relative links needed fixing (no `../` references in any moved file). No tracker sync — this design was never tied to a real Jira ticket (local `DESIGN-` ID). Observed work: 4h 35m 47s.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

Not published to a tracker — developer chose to implement directly via `/dev` in this repo, consistent with this design's Implementation note (this repo is the harness's own canonical source). Single combined implementation unit: `solution/Efforts.md` (11 ordered build steps, ending in a `/harness-bootstrap launch` validation run, estimated at 3h).

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
