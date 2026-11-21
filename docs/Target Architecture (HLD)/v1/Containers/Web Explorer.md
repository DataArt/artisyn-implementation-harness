---
id: 3a7c9e1d
type: Container
title: Web Explorer Container
description: 'Design intent for the Web Explorer container: the promotional multi-route app (landing page, Inside the Loop section and standalone pages such as Dogfood) built with React and Vite'
tags: [web-explorer, react, vite, tailwind, hld, inside-the-loop, dogfood, hashrouter]
generated: { by: process:okf-migration, at: 2026-11-09T02:09:56Z }
updated: { by: process:dev-document, at: 2026-11-21T22:00:00Z }
---

# Web Explorer Container

Promotional multi-route app at `apps/web-explorer`, owned by the Web layer alongside Web Docs and Web Portal. Routes sit under a client-side `HashRouter`: the landing page at `/`, an `/inside-the-loop` section (a hub page plus 10 routed detail pages), and standalone pages, among them `/dogfood`.

## Baseline diagram

```mermaid
flowchart LR
    subgraph SOURCE ["  Source (apps/web-explorer/)  "]
        SRC["⚛️ React 19 SPA source\nJSX components"]:::source
        STYLE["🎨 Tailwind CSS 4\n@tailwindcss/vite"]:::source
        MOTION["🎞️ Motion + Lucide React\nanimation & icons"]:::source
        SNAP["🕸️ Docs graph snapshot\ncommitted, refreshed by hand"]:::snapshot
    end

    BUILD["🔨 Vite build\nyarn nx run web-explorer:build"]:::build
    BUDGET["📏 bundle-size budget check"]:::budget

    DIST["📦 Static output\napps/web-explorer/dist/"]:::dist

    SRC --> BUILD
    STYLE --> BUILD
    MOTION --> BUILD
    SNAP -->|"Dogfood page"| BUILD
    BUILD --> BUDGET --> DIST

    classDef source fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef snapshot fill:#4B5563,stroke:#374151,color:#fff
    classDef build  fill:#D97706,stroke:#B45309,color:#fff
    classDef budget fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef dist   fill:#065F46,stroke:#064e3b,color:#fff
```

`apps/web-explorer/dist/` is consumed by Web Portal's composition step (see `Containers/Web Portal.md`), not uploaded to GitHub Pages directly.

## Responsibilities

- Render the promotional landing page and the `/inside-the-loop` section as JSX components — no raw HTML string injection and no `<script>` tags in the rendered output (NFR-7)
- Route all pages client-side under a single `HashRouter`: `/` for the landing page, `/inside-the-loop` for the hub page plus its 10 detail pages, and `/dogfood` for the Dogfood page, which is linked from the header nav
- Render the Dogfood page: how this repo runs the harness on itself, with a read-only view of this repo's operational graph
- Produce a static build at `apps/web-explorer/dist/` with no server runtime of its own
- Enforce a bundle-size budget against the landing page's own entry chunk — route-based code-splitting (`React.lazy()`) keeps every other route's chunk (including `/inside-the-loop` and `/dogfood`) out of that measurement regardless of its size

## Technology

| Component        | Choice                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| UI framework     | React `^19.3.1`                                                              |
| Build tool       | Vite, pinned to a major compatible with root TypeScript `^5.7.0` and Node 24 |
| Language         | TypeScript `^5.7.0`                                                          |
| Styling          | Tailwind CSS `^4.3.5` via `@tailwindcss/vite`                                |
| Animation        | Motion `^14.10.1`                                                            |
| Icons            | Lucide React `^1.70.0`, `simple-icons`                                       |
| Routing          | `react-router-dom` (`HashRouter`)                                            |
| Dependency graph | `@xyflow/react` — the `/inside-the-loop` hub page's dependency-graph map     |
| Chart data       | `d3-array`, `d3-scale`                                                       |

## Boundary contracts

- Input: React/JSX source, Tailwind config, root workspace `tsconfig.base.json`
- Input: a committed, hand-refreshed snapshot of the docs operational graph, read by the Dogfood page; no CI step regenerates it
- Output: deep links from the Dogfood page into the Web Docs site
- Output: static HTML/CSS/JS in `apps/web-explorer/dist/`, consumed as an input to Web Portal's `portal-assemble.ts` composition step
- Guarantee: content is rendered as JSX, not raw HTML — no `dangerouslySetInnerHTML` or raw `<script>` tags appear in the source (NFR-7)
- Guarantee: `web-explorer:build` fails if the bundle-size budget check against the landing page's entry chunk does not pass
- Guarantee: routing uses `HashRouter`, not `BrowserRouter` — this is a static artifact with no server to rewrite a deep link back to `index.html`; the hash-based approach needs zero GitHub Pages server configuration

## Constraints

- Served as static output only — no server-side runtime at request time, consistent with `System Overview.md`'s static-content design principle
- `vite.config.ts` sets `base` explicitly to the GitHub Pages project-site root — a literal path string, the same convention Web Docs's `.vitepress/config.ts` already uses for its own `base`
- Joins the root Yarn workspace (`workspaces: ["apps/*"]`) and the single root lockfile — no isolated `package-lock.json`
- One of three siblings in the Web layer: Web Explorer, [Web Docs](Web%20Docs.md), [Web Portal](Web%20Portal.md) — each has its own container doc

## Key paths

| Path                               | Purpose                                                  |
| ---------------------------------- | -------------------------------------------------------- |
| `apps/web-explorer/`               | React/Vite SPA source and config                         |
| `apps/web-explorer/dist/`          | Static build output (input to Web Portal composition)    |
| `apps/web-explorer/vite.config.ts` | Build config, sets `base` to the Pages project-site root |
