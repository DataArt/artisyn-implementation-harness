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
current_stage: solution
completed_stages: [context-gathering, ceremony, frame, research, evaluate]
selected_artifacts: []
next_action: 'solution'
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
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution 🔄 · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 14m 40s · Wait to date: 1m 37s (closed 1m 37s + current 0s) · Unclassified: 16m 28s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------ | ------ | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-08T22:29:08.649Z | 2026-11-08T22:30:50.995Z | 1m 42s      | 5s     | 1m 37s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-08T22:34:02.044Z | 2026-11-08T22:34:46.407Z | 44s         | 44s    | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-08T22:36:56.002Z | 2026-11-08T22:39:45.991Z | 2m 50s      | 2m 50s | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-08T22:41:35.254Z | 2026-11-08T22:52:35.555Z | 11m 0s      | 11m 0s | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (active)             | 2026-11-08T22:56:43.158Z | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s     | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

_From Research OQ triage (2026-11-08)._

| #    | Decision     | Open question                                                                       | V/E | Answer / status                                                                                                                                            |
| ---- | ------------ | ----------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OQ-1 | Web Explorer | Root TS `^6.0`/Vite `^8` bump to match scaffold, or pin scaffold to root TS `^5.7`? | (V) | Conditional — Option B (adopt scaffold as-is) stays viable pending reconciliation confirmed in Evaluate/Solution.                                          |
| OQ-2 | Web Explorer | CI budget fit (install/build time, bundle size) unmeasured                          | (E) | Deferred — feeds Evaluate's cost dimension.                                                                                                                |
| OQ-3 | Web Explorer | Eslint/Prettier conformance effort for scaffold's source                            | (E) | Deferred — rework-cost detail.                                                                                                                             |
| OQ-4 | Web Explorer | Keep/trim/rewrite simulated `/design`/`/dev` walkthrough content?                   | (E) | Deferred to Solution content drafting.                                                                                                                     |
| OQ-5 | Web Explorer | Scaffold's `vite.config.ts` has no explicit `base` set                              | (E) | Confirmed fixable with a one-line config change — not a blocker.                                                                                           |
| OQ-6 | Web Explorer | Isolated-lockfile audit coverage gap (Option D)                                     | (V) | Resolved — Option D disqualified; breaks NFR-11's root-lockfile-scoped audit gate and the single-lockfile convention.                                      |
| OQ-7 | Web Explorer | Brand-asset approval finality                                                       | (E) | Deferred — publish-readiness item, not a Research blocker.                                                                                                 |
| OQ-1 | Web Portal   | Does VitePress support a nested (two-segment) subpath `base` cleanly?               | (V) | Resolved — yes, standard Vite `base` passthrough, any depth. Does not disqualify Options B/C/D.                                                            |
| OQ-2 | Web Portal   | Does `configure-pages` auto-detection still work against a merged artifact root?    | (E) | Worst case needs an explicit Pages settings override — config detail, not a blocker.                                                                       |
| OQ-3 | Web Portal   | Is breaking existing bookmarked/indexed doc URLs (base path move) acceptable?       | (V) | **Developer confirmed (2026-11-08): accept the breakage** — Pages deploy is ~5 days old, minimal indexing/bookmarks yet. No redirect/compat stub required. |
| OQ-4 | Web Portal   | How deep should CI verification of the composed artifact go?                        | (E) | Deferred to Evaluate/Solution scope decision.                                                                                                              |
| OQ-5 | Web Portal   | Does Frame's EC2+EC5 bundling forbid Option E's split-PR sequencing?                | (V) | Resolved — no, bundling is decision-tracking only; Option E's sequencing stays viable on top of whichever topology wins.                                   |
| OQ-6 | Web Portal   | Exact subpath string for web-docs (`/docs/`, `/web-docs/`, etc.)                    | (E) | Deferred to Solution.                                                                                                                                      |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-08 (Decision 1: Web Explorer)

_Recommended option: B — adopt the existing scaffold as-is at `apps/web-explorer`, with OQ-1 resolved by pinning the scaffold's TS/Vite ranges down to root-compatible majors._

| Pillar                 | Rating   | Headline                                                                            |
| ---------------------- | -------- | ----------------------------------------------------------------------------------- |
| Operational Excellence | 🟡 Amber | New app to operate; mirror `apps/docs-web/project.json`'s target shape on adoption. |
| Security               | 🟢 Green | Static, no backend; React/JSX avoids NFR-7's raw-HTML risk.                         |
| Reliability            | 🟢 Green | Static site, no runtime dependency; build failure fails CI before prod.             |
| Performance Efficiency | 🟡 Amber | React 19 + Motion + Tailwind 4 heavier than strictly needed for one promo page.     |
| Cost Optimization      | 🟢 Green | Static hosting on GitHub Pages — zero marginal cost.                                |
| Sustainability         | 🟢 Green | Build-time only, no added runtime compute.                                          |

**P1 items (resolve before implementation):** none.

Full elaboration: `design/02 Evaluate.md`

### WAF — Evaluate — 2026-11-08 (Decision 2: Web Portal Site Composition)

_Recommended option: C — first-class typed `apps/web-portal` Nx project, sequenced per Option E (composition first, mechanical rename as a follow-up PR)._

| Pillar                 | Rating   | Headline                                                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟢 Green | Typed assemble script with explicit asserts; idiomatic Nx target; sequencing reduces blast radius.     |
| Security               | 🟢 Green | No new secrets/auth surface; NFR-5/NFR-7 scope unchanged.                                              |
| Reliability            | 🟡 Amber | No staging environment — first composed deploy validated only by CI assertions, not a live smoke test. |
| Performance Efficiency | 🟢 Green | Merge step adds negligible build time; Nx caching limits unnecessary rebuilds.                         |
| Cost Optimization      | 🟢 Green | No new infrastructure — still GitHub Pages.                                                            |
| Sustainability         | 🟢 Green | No added runtime compute, build-time composition only.                                                 |

**P1 items (resolve before implementation):** none.

Full elaboration: `design/02 Evaluate.md`

---

## Gate

- Approver: —
- Draft MR: —
- Approved: — _(a date once approved, or `declined`)_
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase    | Notes                                                                                                                                                                                                                                                                                                 |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-08 | Frame    | 5 known requirements, 4 proposed requirements accepted; split into 2 decisions (Web Explorer, Web Portal site composition)                                                                                                                                                                            |
| 2026-11-08 | Research | @architect returned 4 options for Web Explorer (no SPA, adopt scaffold, rebuild, isolated sub-workspace) and 5 options for Web Portal site composition (no composition, Nx assemble, typed Nx project, public/ passthrough, rename-sequencing variant); developer confirmed both option sets complete |
| 2026-11-08 | Evaluate | Recommended Option B (Web Explorer: adopt scaffold, pin TS/Vite down) and Option C+E (Web Portal: typed web-portal Nx project, sequenced rename); WAF: 2 pillars Amber (perf/OE on Decision 1, reliability on Decision 2), rest Green; 0 P1 items                                                     |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
