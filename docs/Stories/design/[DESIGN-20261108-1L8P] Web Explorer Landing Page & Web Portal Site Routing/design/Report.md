---
name: Design Report Template
description: Template for design/Report.md — the living design report, idempotency anchor, and WAF findings store
type: reference
---

# Design Report — DESIGN-20261108-1L8P: Web Explorer Landing Page & Web Portal Site Routing

## Context

| Field               | Value                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Track               | Project                                                                                               |
| Source docs         | `docs/Target Architecture (HLD)/`                                                                     |
| Dest docs           | `docs/Target Architecture (HLD)/v1/Containers/`                                                       |
| Subfolder           | `v1/Containers` (existing subfolder — Web.md, Discuss.md, Harness Bootstrap E2E.md already live here) |
| Architect agent     | `@architect`                                                                                          |
| Implementation note | Project design — this repo's own containers; `/dev` in this repo is the expected next step.           |

## State

```yaml
current_stage: research
completed_stages: [context-gathering, ceremony, frame]
selected_artifacts: []
next_action: 'research'
context_fingerprint: ''
```

## Evidence

| Source                                                                      | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Reference/version |
| --------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `docs/Target Architecture (HLD)/README.md`                                  | context-gathering | Active version is v1; design intent lives under `v1/`                                                                                                                                                                                                                                                                                                                                                                                                                                                        | v1                |
| `docs/Target Architecture (HLD)/v1/Containers/Web.md`                       | context-gathering | Web container = VitePress site at `apps/docs-web/`, built to `.vitepress/dist/`, served as a single GitHub Pages project site at `/<repo>/` (project-site base path); no server runtime at request time                                                                                                                                                                                                                                                                                                      | v1                |
| `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md` | context-gathering | NFR-5: static build only, no server-side runtime at request time. Infrastructure/Auth containers retired — no CDK, no AWS runtime, nothing to run a proxy process on. Site is public, no auth gate.                                                                                                                                                                                                                                                                                                          | v1                |
| `.github/workflows/cd.yml`                                                  | context-gathering | CD pipeline builds one Nx target, uploads one `upload-pages-artifact` path (`apps/docs-web/.vitepress/dist`), deploys via `actions/deploy-pages` — single static artifact per deploy today                                                                                                                                                                                                                                                                                                                   | n/a               |
| `apps/docs-web/project.json`                                                | context-gathering | Nx project name is `site`, root `apps/docs-web`; `deploy`/`env-push`/`env-pull`/`sm-*` targets already retired in favor of the GitHub Pages migration (`[DESIGN-20261103-LBBI]`)                                                                                                                                                                                                                                                                                                                             | n/a               |
| `design/reference/web-explorer/` (moved from repo root, 2026-11-08)         | context-gathering | Developer scaffolded a React 19 + Vite + Tailwind 4 + Framer Motion SPA named `web-explorer`, explicitly positioned as a Trigger.dev-style promo/demo site (not a runtime integration), with its own `docs/IMPLEMENTATION_BRIEF.md`, `DESIGN_SYSTEM.md`, `TECH_STACK.md` notes. Its own README suggests `apps/web-explorer` if adopted into the Nx/Yarn monorepo. Moved into `design/reference/` at the developer's request — reference-only input to this design, not the final app code or location as-is. | current           |
| Developer sign-off (context-gathering)                                      | context-gathering | **Decided:** "web-portal reverse proxy" is realized as build-time static composition, not a running server process — GH Pages stays static-only (NFR-5 holds unmodified). web-portal assembles one Pages artifact: web-explorer's build at the root, web-docs's build under a subpath (e.g. `/web-docs/`). No new infra, no server runtime introduced.                                                                                                                                                       | 2026-11-08        |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261108-1L8P                                                                                                                                                                |
| Branch | `docs/design-20261108-1l8p-web-explorer-landing-web-portal-routing`                                                                                                                 |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research 🔄 · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 49s · Wait to date: 1m 37s (closed 1m 37s + current 0s) · Unclassified: 8m 11s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ---- | ------ | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-08T22:29:08.649Z | 2026-11-08T22:30:50.995Z | 1m 42s      | 5s   | 1m 37s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-08T22:34:02.044Z | 2026-11-08T22:34:46.407Z | 44s         | 44s  | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (active)                | 2026-11-08T22:36:56.002Z | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
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

| Date       | Phase | Notes                                                                                                                      |
| ---------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-08 | Frame | 5 known requirements, 4 proposed requirements accepted; split into 2 decisions (Web Explorer, Web Portal site composition) |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
