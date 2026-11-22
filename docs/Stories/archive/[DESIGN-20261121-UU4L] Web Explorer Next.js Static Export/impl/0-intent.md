---
id: 7a94f2a9
type: Dev Intent
title: 'DESIGN-20261121-UU4L: Web Explorer Next.js Static Export — Intent'
description: What the implementation of the approved Web Explorer Next.js static-export design must achieve, for whom, within which limits, and what is still open
tags: [web-explorer, web-portal, nextjs, ssg, csp, seo, dev-intent]
generated: { by: process:dev-context, at: 2026-11-22T11:16:00Z }
updated: { by: process:dev-context, at: 2026-11-22T11:16:00Z }
---

# DESIGN-20261121-UU4L: Web Explorer Next.js Static Export — Intent

## Provenance

- **Ticket:** DESIGN-20261121-UU4L, a local design ID. There is no tracker ticket; the design's Completion recorded "Not published (developer decision, 2026-11-22)".
- **Date:** 2026-11-22
- **Spec:** the approved design is the spec. The developer self-approved it on 2026-11-22 (solution commit `4344e59`).
  - [solution/Architecture.md](../../../design/approved/[DESIGN-20261121-UU4L]%20Web%20Explorer%20Next.js%20Static%20Export/solution/Architecture.md): boundary delta, flows, decision register D1–D23
  - [Design - Rendering, Routing and Page Metadata](../../../design/approved/[DESIGN-20261121-UU4L]%20Web%20Explorer%20Next.js%20Static%20Export/solution/Design%20-%20Rendering,%20Routing%20and%20Page%20Metadata.md)
  - [Design - Security Header Delivery](../../../design/approved/[DESIGN-20261121-UU4L]%20Web%20Explorer%20Next.js%20Static%20Export/solution/Design%20-%20Security%20Header%20Delivery.md)
  - [Stack.md](../../../design/approved/[DESIGN-20261121-UU4L]%20Web%20Explorer%20Next.js%20Static%20Export/solution/Stack.md), [Efforts.md](../../../design/approved/[DESIGN-20261121-UU4L]%20Web%20Explorer%20Next.js%20Static%20Export/solution/Efforts.md) (8 delivery units)
  - [design/Report.md](../../../design/approved/[DESIGN-20261121-UU4L]%20Web%20Explorer%20Next.js%20Static%20Export/design/Report.md): developer answers 1–8, WAF P2/P3 items
- **Developer's words (design input, 2026-11-21):** "Migrate `web-explorer` from Vite to Next.js, switching the SPA to SSG to improve SEO. Consider front-end security headers (CSP and others), SEO and social meta (plus title) for each static page, the refactoring the migration needs, and performance. Hosting stays on GitHub Pages."
- **Developer's message for this run:** `/dev DESIGN-20261121-UU4L`, with no extra text.

## Problem

Web Explorer is the harness's public front door. Today it is a Vite single-page app: all 16 routes render in the browser under a `HashRouter`, from one `index.html` with an empty body. So:

- crawlers index one URL with no content
- every page shares one title and one set of social tags
- `og:image` is a broken relative path
- there is no canonical URL and no sitemap

The HLD and NFRs already describe the Next.js static export (design Publish, 2026-11-22). The code in `apps/web-explorer/` is still the Vite app, so docs and code disagree until this lands.

## What better looks like

A visitor, crawler or link-unfurl bot gets a real pre-rendered page at a real path URL, for example `/artisyn-implementation-harness/get-started/`. Each page has:

- its own title and description
- an absolute canonical URL
- Open Graph and Twitter tags with a working image
- a strict per-page CSP

Old `#/...` links still land on the right page. The site is still served by GitHub Pages, composed by Web Portal with Web Docs under `/docs/`, and deployed by `deploy-web.yml`. The build refuses to ship when:

- a page lacks its metadata
- an inline script is not covered by its page's CSP
- the landing page goes over its gzip budget

## Who and what is affected

- **Users:** visitors and people sharing links to the site; search engines and social unfurl bots.
- **Developers:** anyone running `web-explorer` locally. The `dev`, `preview` and `build` targets change underneath, and `e2e` is new.
- **HLD containers:**
  - **Web Explorer**, the main change.
  - **Web Portal**, whose input path and assertions change.
  - The web CI workflows (`ci-web.yml`, `deploy-web.yml`) change as the design lists. They are not a container of their own.
- **Unchanged:** Web Docs and Discuss.

## Out of scope

From the design's Frame boundaries and solution:

- Web Docs itself, apart from staying compatible.
- Copy changes, visual redesign, analytics, i18n, and brand approval of the logos.
- Moving off GitHub Pages, or adding any request-time server code.
- The Google Search Console registration. It is an operational step for the repo owner (Efforts).
- Trusted Types (D2 OQ-5) and the other P3 backlog items.
- Accessibility (axe-core) checks. They join the `e2e` target through NFR-A18's own work.

## Constraints

- **The approved solution files are the spec.** Any departure from the decision register (D1–D23) is raised with the developer, not decided silently.
- **Switch-over:** the live site never runs a half-migrated app. Units 1–7 land on one integration branch, `feat/web-explorer-nextjs`, which merges to `main` once. Reverting that one merge restores the Vite site (D18).
- **NFRs:**
  - NFR-7: no raw `<script>` and no `dangerouslySetInnerHTML` in source.
  - NFR-11: no committed secrets.
  - NFR-16 to NFR-19 as published: CSP level, GitHub Pages limits, crawlable per-page HTML, landing gzip budget.
  - The site is public, with no access gate.
- **Hosting:** the site stays within GitHub Pages limits (EC11).
- **Tooling:**
  - React 19 and Tailwind 4 stay.
  - Node 24.
  - `yarn` only.
  - Nx project and target names stay the same.
  - Never hardcode a region.
- **Guarded commands:** `git push`, and therefore opening the draft PR, is the developer's.
- **Lighthouse baseline:** the "before" Lighthouse run (unit 7 evidence) must be taken on the current Vite build, before the switch-over replaces it.
- **Questions the design left for implementation:** these are settled while building and recorded in the report.
  - D1 OQ-7: the exact Next version and Tailwind PostCSS setup.
  - D1 OQ-8: whether `basePath` prefixes icons and `<img>` sources.
  - D2 OQ-5: Trusted Types, deferred.

## Open questions

1. **Scope of this story.** The design splits the work into 8 units, each sized as "one focused dev session". Units 1–7 go on one integration branch; unit 8, removing `lambda-edge-deploy.sh`, is a separate small PR to `main`. Which of these should this `/dev` run cover?
   - **(a) Proposed:** units 1–7 in this story, one plan step per unit, all on `feat/web-explorer-nextjs`. Unit 8 becomes its own small story. This matches the design's single switch-over. The cost is a large Implement phase with many commits.
   - **(b)** Unit 1 only, the scaffold, build wiring, landing page and draft PR. Units 2–7 become later `/dev` runs on the same branch.
   - **(c)** All 8 units here, with unit 8 on its own branch.
2. **Where the integration branch starts.** The design branch `docs/design-20261121-uu4l-web-explorer-nextjs-static-export` is 7 commits ahead of `main` and not merged. `feat/web-explorer-nextjs` does not exist yet.
   - **Proposed:** you push the design branch and merge it first, and Ceremony branches from the updated `main`.
   - **Alternative:** branch from the design branch's tip now. The draft PR to `main` then also carries the design commits until they merge.

### Answers (developer, Context sign-off, 2026-11-22)

1. **All 8 units** are in this story. Unit 8 does not get a separate PR.
2. **Stay on the current branch**, `docs/design-20261121-uu4l-web-explorer-nextjs-static-export`. No `feat/web-explorer-nextjs` branch is created. This departs from D18 and Efforts only in the branch name, and in unit 8 riding along. The single-merge, single-revert switch-over still holds: this branch merges to `main` once, carrying the design docs and the migration together.

### Addendum (developer, plan sign-off, 2026-11-22)

3. **Agent readiness joins the scope.** The developer's words: "i think we may need to include agentic browsing... https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring together with SEO metatags per page". So the site should be readable and usable by AI agents as well as crawlers: an accessibility tree agents can navigate, a machine-readable summary (`llms.txt`), and per-page SEO tags that pass Lighthouse's SEO and Agentic Browsing categories. Nothing at the `dataart.github.io` origin root (root `llms.txt`, `/.well-known/` manifests) is reachable from this repo; that limit is the same as `robots.txt` in the design.
4. **WebMCP content tools join the scope** (developer, 2026-11-22): "lets think of sth like this https://web-mcp.net/nextjs-sdk and probably content exposure or search articles tool". AI agents in the browser should be able to search the site's content and read a page through WebMCP tools, without a server, since the site stays a static export on GitHub Pages.
5. **Web Docs articles are searchable, and install commands are a tool** (developer, 2026-11-22): "1) yes 2) yes". The WebMCP search covers the Web Docs articles as well as the site pages, and agents can get the `/get-started` install commands for a channel and provider. This narrows the original out-of-scope line "Web Docs itself": Web Docs now publishes a generated search index, and nothing else in it changes.
