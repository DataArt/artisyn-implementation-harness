---
id: 3a7c9e1d
type: Container
title: Web Explorer Container
description: 'Design intent for the Web Explorer container: the promotional multi-route site, a Next.js App Router static export with one pre-rendered page per route'
tags:
  [web-explorer, react, nextjs, static-export, tailwind, csp, seo, hld, inside-the-loop, dogfood]
generated: { by: process:okf-migration, at: 2026-11-09T02:09:56Z }
updated: { by: process:design-publish, at: 2026-11-22T10:15:00Z }
---

# Web Explorer Container

Promotional multi-route site at `apps/web-explorer`, owned by the Web layer alongside Web Docs and Web Portal. It is a Next.js 16.4.x App Router app exported to static files at build time. Every route is its own `<route>/index.html` at a trailing-slash path URL: `/`, `/inside-the-loop/` (a hub page plus 10 detail pages), `/get-started/`, `/docs-flow/`, `/dogfood/` and `/comic/`.

## Baseline diagram

```mermaid
flowchart LR
    subgraph SOURCE ["  Source (apps/web-explorer/)  "]
        SRC["⚛️ src/app\nServer Components + client islands"]:::source
        REG["🗂️ Route registry\nsrc/routes.ts"]:::source
        STYLE["🎨 Tailwind CSS 4\n@tailwindcss/postcss"]:::source
        FONTS["🔤 Vendored fonts\nInter + DM Sans woff2"]:::source
        SNAP["🕸️ Docs graph snapshot\ncommitted, refreshed by hand"]:::snapshot
    end

    subgraph BUILD_BOX ["  yarn nx run web-explorer:build  "]
        NEXT["🔨 next build\nTurbopack, output: 'export'\ntelemetry off"]:::build
        POST["✍️ Post-export step\nscripts/post-export.mjs\nCSP meta per page\nJSON-LD + legacy redirect tag on /"]:::build
        CHECK["🛡️ scripts/check-site.mjs\nhash coverage +\nmetadata completeness"]:::budget
        BUDGET["📏 scripts/check-bundle-budget.mjs\ngzip ≤ 300 KB on /"]:::budget
    end

    OUT["📦 Static output\napps/web-explorer/out/\none index.html per route\n404.html, sitemap.xml, _next/"]:::dist

    SRC --> NEXT
    REG -->|"metadata, sitemap, nav"| NEXT
    STYLE --> NEXT
    FONTS --> NEXT
    SNAP -->|"Dogfood page"| NEXT
    NEXT -->|"writes"| OUT
    POST -.->|"1 · rewrites in place"| OUT
    CHECK -.->|"2 · reads"| OUT
    BUDGET -.->|"3 · reads"| OUT

    classDef source   fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef snapshot fill:#4B5563,stroke:#374151,color:#fff
    classDef build    fill:#D97706,stroke:#B45309,color:#fff
    classDef budget   fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef dist     fill:#065F46,stroke:#064e3b,color:#fff

    style SOURCE fill:#EFF6FF,stroke:#4A90D9,color:#0f172a
    style BUILD_BOX fill:#F8FAFC,stroke:#CBD5E1,color:#0f172a
```

`apps/web-explorer/out/` is consumed by Web Portal's composition step (see [Web Portal](Web%20Portal.md)), not uploaded to GitHub Pages directly. Any gate failure stops `web-explorer:build`, so nothing is assembled or deployed.

## Responsibilities

- Render every page at build time with Server Components. A component is `'use client'` only when it uses state, effects, event handlers, browser APIs or `motion`.
- Route with App Router file routes. In-page anchors are plain `/#<id>` links. React Router is not used.
- Redirect legacy `#/<path>?<query>` links to their path URL with the query kept. The external `legacy-hash-redirect.js` does this, loaded on `/` only.
- Generate per-page metadata from the route registry, plus `sitemap.xml` and schema.org JSON-LD on `/` only. `/comic/` is `noindex` and absent from the sitemap (NFR-18).
- Export the root `404.html` from `app/not-found.tsx`, with links to Home and Docs.
- Give every exported page its own hashed meta Content Security Policy (NFR-16).
- Render the Dogfood page: how this repo runs the harness on itself, with a read-only view of this repo's operational graph.
- Enforce a gzip budget on the JavaScript and CSS the landing page `/` loads first (NFR-19).

## Technology

| Component                | Choice                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| Framework                | Next.js `~16.4.6` — App Router, `output: 'export'`, Turbopack             |
| UI library               | React `^19.3.1`                                                           |
| Language                 | TypeScript `^5.7.0`                                                       |
| Routing                  | App Router file routes, `next/link`, `next/navigation`                    |
| Styling                  | Tailwind CSS `^4.3.5` via `@tailwindcss/postcss`                          |
| Fonts                    | Inter + DM Sans `woff2`, vendored, loaded with `next/font/local`          |
| Animation                | Motion `^14.10.1`                                                         |
| Icons                    | Lucide React `^1.70.0`, `simple-icons`                                    |
| Dependency graph         | `@xyflow/react` — the `/inside-the-loop/` hub page's dependency-graph map |
| Chart data               | `d3-array`, `d3-scale`                                                    |
| Build-time HTML handling | `parse5` — post-export step and `check-site.mjs`                          |
| Browser checks           | `@playwright/test`, Chromium only — `web-explorer:e2e`                    |

## Boundary contracts

| Kind      | Contract                                                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input     | App source under `src/`, the route registry, Tailwind config, vendored fonts, root `tsconfig.base.json`                                                               |
| Input     | A committed, hand-refreshed snapshot of the docs operational graph, read by the Dogfood page; no CI step regenerates it                                               |
| Input     | The harness version from `skills/implementation-harness/package.json`, inlined at build time                                                                          |
| Input     | Build variables `NEXT_PUBLIC_REPO_URL`, `NEXT_PUBLIC_DOCS_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`; each is a `build` input, so a change invalidates the Nx cache |
| Output    | `apps/web-explorer/out/`: one `index.html` per route, `404.html`, `sitemap.xml`, `.nojekyll`, `_next/`; consumed by Web Portal's `portal-assemble.ts`                 |
| Output    | Deep links from the Dogfood page and the 404 page into the Web Docs site                                                                                              |
| Guarantee | Source contains no raw `<script>` and no `dangerouslySetInnerHTML` (NFR-7); the output's only scripts are those Next.js emits and those the post-export step injects  |
| Guarantee | Routes export as `<route>/index.html`, which GitHub Pages serves with no rewrites                                                                                     |
| Guarantee | `web-explorer:build` fails on the hash-coverage, metadata-completeness or gzip-budget gate (NFR-16, NFR-18, NFR-19)                                                   |
| Guarantee | `web-explorer:e2e` fails the PR on a CSP violation, hydration error, broken legacy redirect, broken 404 or broken client navigation                                   |
| Guarantee | Builds send no telemetry: `next build` runs with `NEXT_TELEMETRY_DISABLED=1`                                                                                          |

## Constraints

- Static output only: no rewrites, response headers, middleware or server actions, consistent with `System Overview.md`'s static-content design principle
- The base path is a literal in `src/site.ts`, the same convention Web Docs's `.vitepress/config.ts` uses for its own `base`
- GitHub Pages limits apply (NFR-17)
- `preview` and `e2e` never modify `out/`
- Joins the root Yarn workspace (`workspaces: ["apps/*"]`) and the single root lockfile — no isolated `package-lock.json`
- One of three siblings in the Web layer: Web Explorer, [Web Docs](Web%20Docs.md), [Web Portal](Web%20Portal.md) — each has its own container doc

## Key paths

| Path                                                | Purpose                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/web-explorer/`                                | Next.js app source and config                                      |
| `apps/web-explorer/next.config.ts`                  | Static export, base path, trailing slash, harness version          |
| `apps/web-explorer/src/app/`                        | App Router file routes, layouts and `not-found.tsx`                |
| `apps/web-explorer/src/routes.ts`                   | Route registry: path, title, description, social image, index flag |
| `apps/web-explorer/src/site.ts`                     | Base path and site origin literals                                 |
| `apps/web-explorer/scripts/post-export.mjs`         | Post-export step; `--resign` mode for `preview`                    |
| `apps/web-explorer/scripts/check-site.mjs`          | Hash-coverage and metadata-completeness gates                      |
| `apps/web-explorer/scripts/check-bundle-budget.mjs` | Gzip budget gate on `/`                                            |
| `apps/web-explorer/public/legacy-hash-redirect.js`  | Legacy `#/` link redirect, loaded on `/` only                      |
| `apps/web-explorer/out/`                            | Static build output (input to Web Portal composition)              |
