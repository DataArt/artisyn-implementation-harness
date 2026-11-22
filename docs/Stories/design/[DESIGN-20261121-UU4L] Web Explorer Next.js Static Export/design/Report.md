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
current_stage: evaluate
completed_stages: [context-gathering, ceremony, frame, research]
selected_artifacts: []
next_action: 'Evaluate commit, then Solution'
context_fingerprint: 'a1f1997'
```

Update this block whenever a phase starts, completes, or is invalidated. The
`selected_artifacts` values are interface names (`architecture`, `design`, `stack`,
`efforts`) and are the source of truth for downstream review, publish, and resume.

## Evidence

| Source                                                                                                                                                                                                            | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Reference/version                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `docs/Target Architecture (HLD)/v1/Containers/Web Explorer.md`                                                                                                                                                    | context-gathering | Commits to `HashRouter` (guarantee: "no server to rewrite a deep link"), React 19 + Vite + Tailwind 4, static `dist/` consumed by Web Portal, entry-chunk bundle budget, NFR-7 (no raw HTML / `<script>` in source). All of these change or need re-stating under SSG                                                                                                                                                                                                                                                                                                                    | updated 2026-11-21                             |
| `docs/System Architecture (LLD)/Web Explorer/00. Overview.md`                                                                                                                                                     | context-gathering | Routes: `/` eager; `/inside-the-loop/*` (hub + 10 pages), `/docs-flow`, `/get-started`, `/dogfood`, `/comic` lazy. `/get-started` keeps state in the hash query (`useSearchParams`) for shareable URLs. `/comic` is deliberately unlinked from nav. Brand assets not yet brand-approved for public use                                                                                                                                                                                                                                                                                   | updated 2026-11-21                             |
| `docs/Target Architecture (HLD)/v1/Containers/Web Portal.md`                                                                                                                                                      | context-gathering | Copies `apps/web-explorer/dist/` to the artifact root and asserts `dist/index.html` exists. A Next.js export writes to `out/` and emits one HTML file per route, so the input path and assertions change                                                                                                                                                                                                                                                                                                                                                                                 | updated 2026-11-16                             |
| `docs/Target Architecture (HLD)/v1/System Overview.md`                                                                                                                                                            | context-gathering | Design principle: "Content is static — no server-side rendering, no database, no runtime compute we operate". Build-time SSG fits the intent (no request-time compute) but the wording must be clarified so it is not read as banning build-time rendering                                                                                                                                                                                                                                                                                                                               | —                                              |
| `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md`                                                                                                                                       | context-gathering | NFR-7 (raw HTML/`<script>` must not execute), NFR-11 (no committed secrets); key constraint: the site is public, no access gate. No existing NFR for SEO, CSP, or page performance — candidates for new NFRs                                                                                                                                                                                                                                                                                                                                                                             | 44 lines                                       |
| `apps/web-explorer/index.html`                                                                                                                                                                                    | context-gathering | Single shared `<title>`, description, keywords, Open Graph tags, and a `<meta http-equiv="Content-Security-Policy">` with `script-src 'self'`. `og:image` is a root-relative path missing the `/artisyn-implementation-harness/` base and has no absolute URL — social previews are likely broken today. No Twitter card, canonical, sitemap or robots                                                                                                                                                                                                                                   | —                                              |
| `apps/web-explorer/src/main.tsx`, `vite.config.ts`, `package.json`, `project.json`                                                                                                                                | context-gathering | `HashRouter` with `React.lazy()` per route; `base` `/artisyn-implementation-harness/`; `__HARNESS_VERSION__` build-time define from `skills/implementation-harness/package.json`; Vite 8, `@vitejs/plugin-react`, `@tailwindcss/vite`; Nx `build` runs `scripts/ci/web-explorer-build.sh`                                                                                                                                                                                                                                                                                                | —                                              |
| `apps/web-explorer/src/**` (code scan)                                                                                                                                                                            | context-gathering | ~9.9k lines across ~80 files. Browser-API use (`window`/`document`/`localStorage`/`navigator`) in 7 files (`Landing`, `Modal`, `SectionLink`, `TerminalScenarios`, `HeroPreview`, `Comic`, `GetStarted`) — each needs client-only handling under pre-rendering. Router hooks (`useLocation`, `useNavigate`, `useSearchParams`) in 4 files. No `dangerouslySetInnerHTML`                                                                                                                                                                                                                  | —                                              |
| `scripts/ci/web-explorer-build.sh`, `scripts/ci/check-bundle-budget.mjs`                                                                                                                                          | context-gathering | Budget is 600 KB raw JS+CSS of the entry chunks referenced by `index.html`, matched by `src=/href=` regex. Under Next.js, per-route HTML references framework + page chunks, so the budget's measurement point must be redefined                                                                                                                                                                                                                                                                                                                                                         | —                                              |
| `scripts/ci/portal-assemble.ts`, `apps/web-portal/project.json`                                                                                                                                                   | context-gathering | Copies `apps/web-explorer/dist` verbatim; `dependsOn: web-explorer:build`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                                              |
| `.github/workflows/deploy-web.yml`                                                                                                                                                                                | context-gathering | `nx affected --target=build`, then `upload-pages-artifact` of `apps/web-portal/dist`. GitHub Pages serves static files only — it cannot set response headers (CSP, HSTS, `X-Frame-Options`, `frame-ancestors`), so header policy is limited to `<meta>` equivalents                                                                                                                                                                                                                                                                                                                      | —                                              |
| `apps/web-docs/.vitepress/config.ts`                                                                                                                                                                              | context-gathering | Web Docs also sets its CSP through a `<meta http-equiv>` in `head` — an existing precedent for meta-based policy on this host                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —                                              |
| `docs/Stories/design/approved/[DESIGN-20261108-1L8P] Web Explorer Landing Page & Web Portal Site Routing/`                                                                                                        | context-gathering | The prior approved design that chose Vite + `HashRouter` + Web Portal composition; this design supersedes its routing decision                                                                                                                                                                                                                                                                                                                                                                                                                                                           | approved                                       |
| Evaluate spike — Next.js 16.4.6 App Router static export (scratchpad, minimal: client island, `useSearchParams` in Suspense, `[slug]` with `generateStaticParams`, `basePath` + `trailingSlash` + `metadataBase`) | evaluate          | **Verified:** every page has 3 inline executable scripts with Turbopack (TURBOPACK bootstrap, `__next_f` init, one per-page RSC payload; 4.2–5.3 KB total), 2 with webpack. Hashes change on every build (build ID embedded), so a strict CSP must be generated after each export. Landing first-load JS for a near-empty app is 578,715 B raw / 178,456 B gzip (Turbopack) and 570,732 / 176,563 (webpack). Canonical, `og:image` and `twitter:image` come out absolute with the base path via `metadataBase`. Root `404.html` plus `_next/`, and `.txt` RSC payload files, are emitted | next 16.4.6, 2026-11-22                        |
| Evaluate spike — Next.js 16.4.6 Pages Router static export (same config)                                                                                                                                          | evaluate          | **Verified:** Turbopack: 1 inline executable script (TURBOPACK bootstrap) + `__NEXT_DATA__` JSON data block; landing 373,617 B raw / 117,776 B gzip. Webpack: **0** inline executable scripts (only the JSON data block), so `script-src 'self'` holds; landing 478,244 B raw / 153,310 B gzip                                                                                                                                                                                                                                                                                           | next 16.4.6, 2026-11-22                        |
| Current Vite build (`apps/web-explorer/dist`)                                                                                                                                                                     | evaluate          | **Verified:** landing entry is `index-*.js` 436,099 B raw / 138,751 B gzip + `index-*.css` 36,401 B raw / 8,690 B gzip (472,500 B raw total vs the 614,400 B budget)                                                                                                                                                                                                                                                                                                                                                                                                                     | build of 2026-11-21                            |
| GitHub Pages limits (docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits; linked "About large files on GitHub")                                                                        | evaluate          | Developer asked to respect these as an NFR (EC11, 2026-11-22). Published site ≤ 1 GB (hard); deployment timeout 10 min (hard); bandwidth 100 GB/month (soft); 10 builds/hour (soft, not for custom Actions workflows); rate limiting via HTTP 429 (no threshold given); repo ≤ 1 GB recommended, files > 100 MiB blocked; not for commercial/SaaS hosting or sensitive transactions. **Verified today:** `apps/web-portal/dist` 86 MB (Web Explorer 19 MB, Web Docs 66 MB, 462 files); last 3 `deploy-web.yml` runs ~70–75 s end to end; spike export 1.3 MB                             | fetched 2026-11-22, no last-updated date shown |

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
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution 🔄 · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 9m 11s · Wait to date: 1h 5m 42s (closed 1h 5m 42s + current 0s) · Unclassified: 9h 31m 10s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work   | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------ | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-21T22:24:32.842Z | 2026-11-21T22:35:44.039Z | 11m 11s     | 0s     | 11m 11s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-21T22:35:49.459Z | 2026-11-21T22:37:26.297Z | 1m 37s      | 0s     | 1m 36s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-21T22:37:26.358Z | 2026-11-21T22:54:17.691Z | 16m 51s     | 2m 50s | 14m 1s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-21T22:54:17.749Z | 2026-11-22T08:48:54.205Z | 9h 54m 36s  | 0s     | 23m 33s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (active)             | 2026-11-22T08:48:54.262Z | unavailable              | unavailable | 6m 20s | 15m 21s | unavailable  | unavailable   | from_tracking_start | 2        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s     | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

_From Research OQ triage (2026-11-22). Tiers confirmed at the Research sign-off (2026-11-22); the developer corrected none. **Developer direction for D1: Option B** at Research sign-off, **revised to Option C at the Evaluate sign-off (2026-11-22)**: best-practice Next.js, Server Components rendered at build time by default, `'use client'` only where interactivity needs it. D1 = Rendering, Routing and Page Metadata; D2 = Security Header Delivery._

| #        | Open question                                                                                                                                   | V/E | Answer / status                                                                                                                                                                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 OQ-1  | Does `actions/deploy-pages` skip Jekyll so `_next/` is served without `.nojekyll`?                                                              | (E) | Open — add `.nojekyll` either way; verify in implementation                                                                                                                                                                                                                                   |
| D1 OQ-2  | Does `next/og` `opengraph-image.tsx` prerender under `output: 'export'`, with what file name, and with `basePath`/`metadataBase` in `og:image`? | (E) | Open — spike in Evaluate; only affects social-image variant (3)                                                                                                                                                                                                                               |
| D1 OQ-3  | Exported root `404.html` also serves `/docs/*` misses — acceptable?                                                                             | (E) | Open — developer                                                                                                                                                                                                                                                                              |
| D1 OQ-4  | `/get-started` paints defaults, then corrects from the query after hydration — acceptable for CLS/accessibility?                                | (E) | Open — developer                                                                                                                                                                                                                                                                              |
| D1 OQ-5  | Real landing first-load JS per option; how the budget is redefined                                                                              | (E) | Spike measured (Evidence): App Router baseline 579 KB raw / 178 KB gzip. Developer kept the App Router (B, then C) and asked to respect GitHub Pages limits (2026-11-22). Evaluate redefines the budget as ≤ 300 KB gzip JS+CSS on `/` (provisional; confirmed by the first real measurement) |
| D1 OQ-6  | Exact inline-script list per option from a real build                                                                                           | (E) | Resolved by spike: 3 inline executable scripts per page (Turbopack), 2 (webpack); hashes change every build                                                                                                                                                                                   |
| D1 OQ-7  | Pinned Next version/builder; Tailwind 4 PostCSS; `__HARNESS_VERSION__`; Node 24                                                                 | (E) | Open — implementation                                                                                                                                                                                                                                                                         |
| D1 OQ-8  | Are `metadata.icons` and plain `<img src>` prefixed with `basePath`?                                                                            | (E) | Open — implementation                                                                                                                                                                                                                                                                         |
| D1 OQ-9  | Option A only: is `StaticRouter`/`BrowserRouter` hydration under a Next catch-all stable?                                                       | (V) | Moot — developer selected Option B (2026-11-22); Option A not pursued, no spike needed                                                                                                                                                                                                        |
| D1 OQ-10 | Nx output `dist` vs `out`                                                                                                                       | (E) | Open — implementation                                                                                                                                                                                                                                                                         |
| D2 OQ-1  | Is a custom domain available and wanted?                                                                                                        | (V) | **Resolved (developer, 2026-11-22): no custom domain is available.** Option D is not viable and leaves the matrix                                                                                                                                                                             |
| D2 OQ-2  | EC3 policy floor: strictly stronger than Web Docs' `'unsafe-inline'`, or same-origin parity? New NFR for the accepted level?                    | (V) | **Resolved (developer, 2026-11-22, Evaluate sign-off): strict policy — Option C1** (per-page hashed meta CSP + hardening). Options A and B dropped; record the level in the new CSP NFR at Publish                                                                                            |
| D2 OQ-3  | Clickjacking: accepted risk for a read-only promo site, or a requirement?                                                                       | (V) | Accepted as proposed (no correction at sign-off): clickjacking is an accepted risk for a read-only public promo site, as LBBI accepted for docs. Record in the new CSP NFR                                                                                                                    |
| D2 OQ-4  | Which inline scripts the D1 router emits, how many per page, stable across builds?                                                              | (E) | Resolved by spike: 2–3 per page, ~5 KB, not stable across builds — hashes must be computed after each export                                                                                                                                                                                  |
| D2 OQ-5  | Trusted Types compatible with Next.js, React 19 and app code?                                                                                   | (E) | Open — implementation spike                                                                                                                                                                                                                                                                   |
| D2 OQ-6  | Build-time network access to Google Fonts for `next/font`, or vendor font files?                                                                | (E) | Open — developer                                                                                                                                                                                                                                                                              |
| D2 OQ-7  | Playwright in CI for the browser CSP check, plus an HTML parser dependency?                                                                     | (E) | Open — developer                                                                                                                                                                                                                                                                              |
| D2 OQ-8  | Remove dead `scripts/ci/lambda-edge-deploy.sh` here or separately?                                                                              | (E) | Open — developer                                                                                                                                                                                                                                                                              |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-22 — Decision 1 (Rendering, Routing and Page Metadata)

_Recommended option: Option C — App Router built around Server Components, client components only where needed (revised from Option B at the Evaluate sign-off, 2026-11-22; verified scan: 35 of 56 TSX files stay server-only, ~21 become client components or are split)._

| Pillar                 | Rating | Headline                                                                                                                                                            |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Idiomatic App Router; Nx project and targets unchanged; CI checks meta, budget and CSP on `out/`; P2 boundary lint rule                                             |
| Security               | 🟡     | NFR-7 holds; larger serialised RSC inline payload, still 2–3 scripts per page, covered by Decision 2's hash CSP                                                     |
| Reliability            | 🟢     | Static files only; root `404.html` now also serves `/docs/` misses                                                                                                  |
| Performance Efficiency | 🟢     | Pre-rendered HTML; static sections ship no component JS, so most headroom under the 300 KB gzip budget; 2 reduced-motion reads fixed inside their client components |
| Cost Optimization      | 🟢     | Free hosting, no new services                                                                                                                                       |
| Sustainability         | 🟢     | Least client JS per visit of the App Router options; 86 MB of the 1 GB Pages limit                                                                                  |

**P1 items (resolve before implementation):**

- Define and enforce the gzip budget on `/` (≤ 300 KB JS+CSS, provisional) in CI
- Adopt Decision 2's hash-based CSP with a CI coverage gate

Full elaboration: `design/02 Evaluate - Rendering, Routing and Page Metadata.md`

### WAF — Evaluate — 2026-11-22 — Decision 2 (Security Header Delivery)

_Recommended option: Option C1 — per-page meta CSP with build-time SHA-256 hashes and path-scoped sources, plus meta-deliverable hardening (no Trusted Types yet). Conditional fallback: Option B if the developer accepts parity with Web Docs._

| Pillar                 | Rating | Headline                                                                                                        |
| ---------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡     | Policy generated from real output; a post-export step to maintain across Next upgrades                          |
| Security               | 🟡     | Strongest script policy on a static host; no header-only protections; Web Docs' weaker policy shares the origin |
| Reliability            | 🟡     | Hashes recomputed every build; a missed hash would silently break a page without the CI gate                    |
| Performance Efficiency | 🟢     | ~0.5 KB of meta per page; self-hosted fonts help LCP/CLS                                                        |
| Cost Optimization      | 🟢     | No new services; one HTML-parser dev dependency                                                                 |
| Sustainability         | 🟢     | No extra runtime work                                                                                           |

**P1 items (resolve before implementation):**

- CI hash-coverage gate fails the build on any uncovered inline script
- Policy floor (D2 OQ-2) confirmed by the developer

Full elaboration: `design/02 Evaluate - Security Header Delivery.md`

---

## Gate

- Approver: —
- Draft MR: —
- Approved: — _(a date once approved, or `declined`)_
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase    | Notes                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-21 | Frame    | 6 known requirements, 4 proposed requirements accepted; 2 decisions confirmed (SEO/metadata merged into Decision 1)                                                                                                                                                                                                                                                                                           |
| 2026-11-22 | Research | @architect returned 4 options per decision. D1: A catch-all + React Router, B App Router shell per route, C App Router Server Components, D Pages Router. D2: A meta CSP unsafe-inline, B meta hardening, C per-page hashed meta CSP, D edge layer. Developer confirmed the sets; D2 Option D ruled out (no custom domain); developer direction D1 = Option B                                                 |
| 2026-11-22 | Evaluate | Recommended D1 Option C (App Router, Server Components by default, client islands; revised from B at sign-off) and D2 Option C1 (per-page hashed meta CSP + hardening; strict floor confirmed). Spike on Next.js 16.4.6 measured inline scripts and baselines; EC11 GitHub Pages limits added. WAF D1: 🟢🟡🟢🟢🟢🟢; D2: 🟡🟡🟡🟢🟢🟢; 2 P1 items (gzip budget on `/` enforced in CI; CSP hash-coverage gate) |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
