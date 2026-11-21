---
type: Design Report
title: 'Design Report — DESIGN-20261121-UU4L: Web Explorer Next.js Static Export'
description: Living design report for migrating Web Explorer from a Vite SPA (HashRouter) to a Next.js static export (SSG) on GitHub Pages, covering SEO, per-page social meta, front-end security headers, performance and refactoring
tags: [web-explorer, nextjs, ssg, seo, csp, github-pages, design-report]
generated: { by: process:design-context, at: 2026-11-21T23:30:00Z }
updated: { by: process:design-context, at: 2026-11-21T23:30:00Z }
---

# Design Report — DESIGN-20261121-UU4L: Web Explorer Next.js Static Export

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them. Two-track deployments: see `patterns/context-resolution.md`._

| Field               | Value                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track               | Project — Web Explorer, Web Portal and the NFRs are this repo's own containers and docs                                                                                           |
| Source docs         | `docs/Target Architecture (HLD)/`                                                                                                                                                 |
| Dest docs           | `docs/Target Architecture (HLD)/v1/Containers/` (primary: `Web Explorer.md`; also touches `Web Portal.md`, `v1/System Overview.md`, `v1/Non-Functional Concerns/Requirements.md`) |
| Stories root        | `docs/Stories/design/`                                                                                                                                                            |
| Subfolder           | `v1/Containers/`                                                                                                                                                                  |
| Architect agent     | `@architect`                                                                                                                                                                      |
| Writer agent        | `@docs-writer`                                                                                                                                                                    |
| Implementation note | Project design covering this repo's own containers — `/dev` in this repo is the expected next step                                                                                |
| Progress tracker    | Claude Task tools (`TaskCreate`/`TaskUpdate`), one task per stage; this Report is authoritative                                                                                   |

### Developer intent (free-form input, 2026-11-21)

Migrate `web-explorer` from Vite to Next.js, switching the SPA to SSG to improve SEO. Consider front-end security headers (CSP and others), SEO and social meta (plus title) for each static page, the refactoring the migration needs, and performance. Hosting stays on GitHub Pages.

## State

```yaml
current_stage: frame
completed_stages: [context-gathering, ceremony]
selected_artifacts: []
next_action: 'Frame commit, then Research (2 decisions)'
context_fingerprint: 'a1f1997'
```

Update this block whenever a phase starts, completes, or is invalidated. The
`selected_artifacts` values are interface names (`architecture`, `design`, `stack`,
`efforts`) and are the source of truth for downstream review, publish, and resume.

## Evidence

| Source                                                                                                     | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                                         | Reference/version  |
| ---------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `docs/Target Architecture (HLD)/v1/Containers/Web Explorer.md`                                             | context-gathering | Commits to `HashRouter` (guarantee: "no server to rewrite a deep link"), React 19 + Vite + Tailwind 4, static `dist/` consumed by Web Portal, entry-chunk bundle budget, NFR-7 (no raw HTML / `<script>` in source). All of these change or need re-stating under SSG                                                                                                   | updated 2026-11-21 |
| `docs/System Architecture (LLD)/Web Explorer/00. Overview.md`                                              | context-gathering | Routes: `/` eager; `/inside-the-loop/*` (hub + 10 pages), `/docs-flow`, `/get-started`, `/dogfood`, `/comic` lazy. `/get-started` keeps state in the hash query (`useSearchParams`) for shareable URLs. `/comic` is deliberately unlinked from nav. Brand assets not yet brand-approved for public use                                                                  | updated 2026-11-21 |
| `docs/Target Architecture (HLD)/v1/Containers/Web Portal.md`                                               | context-gathering | Copies `apps/web-explorer/dist/` to the artifact root and asserts `dist/index.html` exists. A Next.js export writes to `out/` and emits one HTML file per route, so the input path and assertions change                                                                                                                                                                | updated 2026-11-16 |
| `docs/Target Architecture (HLD)/v1/System Overview.md`                                                     | context-gathering | Design principle: "Content is static — no server-side rendering, no database, no runtime compute we operate". Build-time SSG fits the intent (no request-time compute) but the wording must be clarified so it is not read as banning build-time rendering                                                                                                              | —                  |
| `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md`                                | context-gathering | NFR-7 (raw HTML/`<script>` must not execute), NFR-11 (no committed secrets); key constraint: the site is public, no access gate. No existing NFR for SEO, CSP, or page performance — candidates for new NFRs                                                                                                                                                            | 44 lines           |
| `apps/web-explorer/index.html`                                                                             | context-gathering | Single shared `<title>`, description, keywords, Open Graph tags, and a `<meta http-equiv="Content-Security-Policy">` with `script-src 'self'`. `og:image` is a root-relative path missing the `/artisyn-implementation-harness/` base and has no absolute URL — social previews are likely broken today. No Twitter card, canonical, sitemap or robots                  | —                  |
| `apps/web-explorer/src/main.tsx`, `vite.config.ts`, `package.json`, `project.json`                         | context-gathering | `HashRouter` with `React.lazy()` per route; `base` `/artisyn-implementation-harness/`; `__HARNESS_VERSION__` build-time define from `skills/implementation-harness/package.json`; Vite 8, `@vitejs/plugin-react`, `@tailwindcss/vite`; Nx `build` runs `scripts/ci/web-explorer-build.sh`                                                                               | —                  |
| `apps/web-explorer/src/**` (code scan)                                                                     | context-gathering | ~9.9k lines across ~80 files. Browser-API use (`window`/`document`/`localStorage`/`navigator`) in 7 files (`Landing`, `Modal`, `SectionLink`, `TerminalScenarios`, `HeroPreview`, `Comic`, `GetStarted`) — each needs client-only handling under pre-rendering. Router hooks (`useLocation`, `useNavigate`, `useSearchParams`) in 4 files. No `dangerouslySetInnerHTML` | —                  |
| `scripts/ci/web-explorer-build.sh`, `scripts/ci/check-bundle-budget.mjs`                                   | context-gathering | Budget is 600 KB raw JS+CSS of the entry chunks referenced by `index.html`, matched by `src=/href=` regex. Under Next.js, per-route HTML references framework + page chunks, so the budget's measurement point must be redefined                                                                                                                                        | —                  |
| `scripts/ci/portal-assemble.ts`, `apps/web-portal/project.json`                                            | context-gathering | Copies `apps/web-explorer/dist` verbatim; `dependsOn: web-explorer:build`                                                                                                                                                                                                                                                                                               | —                  |
| `.github/workflows/deploy-web.yml`                                                                         | context-gathering | `nx affected --target=build`, then `upload-pages-artifact` of `apps/web-portal/dist`. GitHub Pages serves static files only — it cannot set response headers (CSP, HSTS, `X-Frame-Options`, `frame-ancestors`), so header policy is limited to `<meta>` equivalents                                                                                                     | —                  |
| `apps/web-docs/.vitepress/config.ts`                                                                       | context-gathering | Web Docs also sets its CSP through a `<meta http-equiv>` in `head` — an existing precedent for meta-based policy on this host                                                                                                                                                                                                                                           | —                  |
| `docs/Stories/design/approved/[DESIGN-20261108-1L8P] Web Explorer Landing Page & Web Portal Site Routing/` | context-gathering | The prior approved design that chose Vite + `HashRouter` + Web Portal composition; this design supersedes its routing decision                                                                                                                                                                                                                                          | approved           |

Record every required or relevant context source actually read. Add conflicts and
their resolution here; do not rely on conversation history for design provenance.

### Early conflicts to carry into Frame

- **HashRouter vs SEO.** Crawlers treat every hash route as the same URL, so only `/` is indexable today. SSG needs real paths (one HTML file per route, e.g. `get-started/index.html`), which GitHub Pages serves without rewrites.
- **Strict CSP vs Next.js inline scripts.** The App Router's static export inlines bootstrap/RSC payload scripts. The current `script-src 'self'` would block them, so the policy needs build-time hashes or a different rendering mode.
- **No HTTP headers on GitHub Pages.** `frame-ancestors`, HSTS, `X-Content-Type-Options` and similar cannot be set; only what a `<meta>` tag supports.
- **"No server-side rendering" principle.** Needs rewording to distinguish build-time rendering (allowed) from request-time compute (still forbidden).
- **Shareable `/get-started` URLs** live in the hash query today; moving to path routes changes their shape and needs backward compatibility for existing links.

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261121-UU4L                                                                                                                                                                |
| Branch | `docs/design-20261121-uu4l-web-explorer-nextjs-static-export`                                                                                                                       |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research 🔄 · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 2m 50s · Wait to date: 25m 43s (closed 25m 43s + current 0s) · Unclassified: 6s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------ | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-21T22:24:32.842Z | 2026-11-21T22:35:44.039Z | 11m 11s     | 0s     | 11m 11s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-21T22:35:49.459Z | 2026-11-21T22:37:26.297Z | 1m 37s      | 0s     | 1m 36s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (active)                | 2026-11-21T22:37:26.358Z | unavailable              | unavailable | 2m 50s | 12m 56s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (pending)            | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

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

| Date       | Phase | Notes                                                                                                               |
| ---------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| 2026-11-21 | Frame | 6 known requirements, 4 proposed requirements accepted; 2 decisions confirmed (SEO/metadata merged into Decision 1) |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
