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
current_stage: ceremony
completed_stages: ['context-gathering']
selected_artifacts: []
next_action: 'Ceremony — tracker transition and branch checkout'
context_fingerprint: ''
```

## Evidence

| Source                                                 | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                         | Reference/version |
| ------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `docs/Harness/03 Lifecycles/05 Documents Flow.md`      | context-gathering | Existing doc graduation pipeline (Stories → HLD/LLD/EG, track-routed Publish) that the graph must index and interoperate with, not replace.                                                                                                                                                             | current           |
| `docs/Harness/06 Roadmap/01 Harness Roadmap.md` (§5.9) | context-gathering | Roadmap explicitly cautions: "Improve links, discovery instructions or indexing only where measured misses justify it; a separate memory service is not a prerequisite." Frame must establish the measured need, not just build indexing speculatively.                                                 | current           |
| `docs/Harness/03 Lifecycles/00 Overview.md`            | context-gathering | Four named lifecycles (Dev, Design, Skill, Architecture) and their phases — graph touchpoints at "bootstrap (indexing), context gathering, documentation, publishing" must map onto concrete phases of these (e.g. `/dev context`, `/design` Context Gathering, `/dev document`, `/design publish`).    | current           |
| `docs/Harness/index.md`                                | context-gathering | States `docs/Harness/package/` is the bootstrap package, excluded from the VitePress build via `srcExclude`, "browse on GitHub or in a checkout." That folder does not exist in this checkout — a gap to flag for Frame (bootstrap-stage indexing has no package folder to hook into yet in this repo). | current           |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261102-Q5MU                                                                                                                                                                |
| Branch | — _(set by Ceremony, e.g. `docs/design-20261102-q5mu-slug`)_                                                                                                                        |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony 🔄 · 📋 Frame ⏳ · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 6s · Wait to date: 35s (closed 35s + current 0s) · Unclassified: 10s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work | Wait | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ---- | ---- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-02T08:52:17.886Z | 2026-11-02T08:52:58.605Z | 41s         | 6s   | 35s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| frame (pending)               | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| research (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s   | 0s   | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

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

| Date       | Phase             | Notes                                                                                                   |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| 2026-11-02 | Context Gathering | Task tracking: native Claude Task tools (TaskCreate/TaskUpdate), tasks #1–#10, one per lifecycle stage. |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
