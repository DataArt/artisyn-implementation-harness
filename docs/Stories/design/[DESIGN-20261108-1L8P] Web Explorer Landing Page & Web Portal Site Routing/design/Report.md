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
current_stage: completion
completed_stages:
  [context-gathering, ceremony, frame, research, evaluate, solution, review-gate, publish]
selected_artifacts: [architecture, design, stack, efforts]
next_action: 'completion'
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

| Field  | Value                                                                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261108-1L8P                                                                                                                                                                          |
| Branch | `docs/design-20261108-1l8p-web-explorer-landing-web-portal-routing`                                                                                                                           |
| Status | 🔄 In Progress                                                                                                                                                                                |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ⏭️ (skipped) · 📤 Publish ✅ · 🏁 Completion 🔄 |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 31m 45s · Wait to date: 1m 37s (closed 1m 37s + current 0s) · Unclassified: 25m 31s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------- | ------ | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-08T22:29:08.649Z | 2026-11-08T22:30:50.995Z | 1m 42s      | 5s      | 1m 37s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-08T22:34:02.044Z | 2026-11-08T22:34:46.407Z | 44s         | 44s     | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-08T22:36:56.002Z | 2026-11-08T22:39:45.991Z | 2m 50s      | 2m 50s  | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-08T22:41:35.254Z | 2026-11-08T22:52:35.555Z | 11m 0s      | 11m 0s  | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (completed)          | 2026-11-08T22:56:43.158Z | 2026-11-08T23:01:53.233Z | 5m 10s      | 5m 10s  | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (completed)          | 2026-11-08T23:03:39.138Z | 2026-11-08T23:14:07.089Z | 10m 28s     | 10m 28s | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| review-gate (completed)       | 2026-11-08T23:14:51.430Z | 2026-11-08T23:16:18.501Z | 1m 27s      | 1m 27s  | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| address-feedback (skipped)    | unavailable              | unavailable              | unavailable | 0s      | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (active)              | 2026-11-08T23:17:35.079Z | unavailable              | unavailable | 0s      | 0s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s      | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

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

### Review — solution — 2026-11-09 [pillars: all]

_Assessed: `solution/Architecture.md` + `solution/Design.md`, the integrated chosen approach (post-architect-review correction)._

| Pillar                 | Rating   | Headline                                                                                                                                                                                       |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡 Amber | One new Nx project + typed assemble script to operate; mitigated by mirroring existing conventions and fail-fast asserts.                                                                      |
| Security               | 🟢 Green | No new secrets/auth surface; NFR-5/7 unchanged for Web Docs; NFR-7 risk not reintroduced by Web Explorer's JSX-rendered content; NFR-11 audit coverage preserved via the single root lockfile. |
| Reliability            | 🟡 Amber | No staging environment; mitigated by the CI-level file-existence assertion (now correctly wired via `implicitDependencies`, per architect review) and the PR1/PR2 rollout sequencing.          |
| Performance Efficiency | 🟡 Amber | Web Explorer's bundle (React 19 + Motion + Tailwind 4) heavier than strictly needed for one promo page; mitigated by a bundle-size budget check added to its build target.                     |
| Cost Optimization      | 🟢 Green | No new infrastructure — still GitHub Pages, zero marginal cost.                                                                                                                                |
| Sustainability         | 🟢 Green | Build-time only composition, no added runtime compute.                                                                                                                                         |

**P1 items:** none. One material gap was found and fixed during this review — see Decision Coverage below.

**Decision Coverage / Architect Review:** `@architect` reviewed `solution/Architecture.md` and found that `dependsOn` alone (as originally drafted in Decision 5) does not create the project-graph edge `nx affected` needs — only `implicitDependencies` does, per this repo's own existing `apps/docs-web/project.json` pattern. This was a mechanical finding (no scope change to the chosen approach) and was auto-applied: `solution/Architecture.md` Decision 5 and `solution/Design.md`'s `project.json` shape were both corrected to declare `implicitDependencies: ["web-explorer", "web-docs"]` alongside the task-ordering `dependsOn`. `solution/Efforts.md` ticket 5 updated to match.

**Quality gate (`patterns/design-quality-gate.md`):** PASS, with 2 minor gaps found and closed during this review — (a) NFR-7 applicability to Web Explorer specifically, and (b) a verification obligation for the Performance Amber bundle-size concern, were both narrative-only (WAF/Evaluate) and not yet decisions in `solution/Architecture.md`'s register; both now have an explicit decision + verification obligation (Decision 1). Mermaid rendering: this repo's `@mermaid-js/mermaid-cli` is missing its `puppeteer` dependency, so the 5 diagrams across `Architecture.md`, `Design.md`, and `Efforts.md` were checked via syntax-oriented inspection instead (balanced subgraphs, `classDef` definitions matching every referenced class, well-formed arrows) — no issues found. No markdown hyperlinks (`[text](path)`) are used for cross-file references in these artifacts (only inline-code path mentions), so there was no relative-link resolution to check.

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

- Approver: developer (self-approved)
- Draft MR: — (skipped at developer's explicit request — self-approved, no MR opened)
- Approved: 2026-11-09
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-08 | Frame                          | 5 known requirements, 4 proposed requirements accepted; split into 2 decisions (Web Explorer, Web Portal site composition)                                                                                                                                                                                                                                                                            |
| 2026-11-08 | Research                       | @architect returned 4 options for Web Explorer (no SPA, adopt scaffold, rebuild, isolated sub-workspace) and 5 options for Web Portal site composition (no composition, Nx assemble, typed Nx project, public/ passthrough, rename-sequencing variant); developer confirmed both option sets complete                                                                                                 |
| 2026-11-08 | Evaluate                       | Recommended Option B (Web Explorer: adopt scaffold, pin TS/Vite down) and Option C+E (Web Portal: typed web-portal Nx project, sequenced rename); WAF: 2 pillars Amber (perf/OE on Decision 1, reliability on Decision 2), rest Green; 0 P1 items                                                                                                                                                     |
| 2026-11-09 | Solution                       | Selected artifacts written (Architecture, Design, Stack, Efforts); architect review found and auto-fixed 1 mechanical gap (`implicitDependencies` needed alongside `dependsOn`); WAF review: pass, 0 P1s (3 pillars Amber, mitigated); quality gate: pass, 2 minor coverage gaps closed; WBS collapsed to 5 layer-level units at developer's request; estimate column explicitly skipped by developer |
| 2026-11-09 | Review Gate / Address Feedback | Developer self-approved, explicitly requested skipping the draft-MR step and Address Feedback entirely; no concerns raised                                                                                                                                                                                                                                                                            |
| 2026-11-09 | Publish                        | MR approved by developer (self); docs updated: `Web Explorer.md` (new), `Web Portal.md` (new), `Web.md` renamed to `Web Docs.md`, `Discuss.md`, `System Overview.md`, `index.md`; architect review found 2 issues (unsupported base-path tokenization claim, NFR-5 miscitation across 3 docs), both fixed and re-reviewed OK; operational graph reindexed with `story-to-hld` edges                   |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
