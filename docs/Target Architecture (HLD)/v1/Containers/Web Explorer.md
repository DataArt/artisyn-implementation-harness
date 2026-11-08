---
id: 3a7c9e1d
purpose: Design intent for the Web Explorer container — the promotional single-page app built with React and Vite
keywords: [web-explorer, react, vite, tailwind, hld]
---

# Web Explorer Container

Promotional single-page app at `apps/web-explorer`, owned by the Web layer alongside Web Docs and Web Portal.

## Baseline diagram

```mermaid
flowchart LR
    subgraph SOURCE ["  Source (apps/web-explorer/)  "]
        SRC["⚛️ React 19 SPA source\nJSX components"]:::source
        STYLE["🎨 Tailwind CSS 4\n@tailwindcss/vite"]:::source
        MOTION["🎞️ Motion + Lucide React\nanimation & icons"]:::source
    end

    BUILD["🔨 Vite build\nyarn nx run web-explorer:build"]:::build
    BUDGET["📏 bundle-size budget check"]:::budget

    DIST["📦 Static output\napps/web-explorer/dist/"]:::dist

    SRC --> BUILD
    STYLE --> BUILD
    MOTION --> BUILD
    BUILD --> BUDGET --> DIST

    classDef source fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef build  fill:#D97706,stroke:#B45309,color:#fff
    classDef budget fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef dist   fill:#065F46,stroke:#064e3b,color:#fff
```

`apps/web-explorer/dist/` is consumed by Web Portal's composition step (see `Containers/Web Portal.md`), not uploaded to GitHub Pages directly.

## Responsibilities

- Render the promotional landing page as JSX components — no raw HTML string injection and no `<script>` tags in the rendered output (NFR-7)
- Produce a static build at `apps/web-explorer/dist/` with no server runtime of its own
- Enforce a bundle-size budget as part of its own `build` target, failing CI if exceeded

## Technology

| Component    | Choice                                                                       |
| ------------ | ---------------------------------------------------------------------------- |
| UI framework | React `^19.3.1`                                                              |
| Build tool   | Vite, pinned to a major compatible with root TypeScript `^5.7.0` and Node 24 |
| Language     | TypeScript `^5.7.0`                                                          |
| Styling      | Tailwind CSS `^4.3.5` via `@tailwindcss/vite`                                |
| Animation    | Motion `^14.10.1`                                                            |
| Icons        | Lucide React `^1.70.0`                                                       |

## Boundary contracts

- Input: React/JSX source, Tailwind config, root workspace `tsconfig.base.json`
- Output: static HTML/CSS/JS in `apps/web-explorer/dist/`, consumed as an input to Web Portal's `portal-assemble.ts` composition step
- Guarantee: content is rendered as JSX, not raw HTML — no `dangerouslySetInnerHTML` or raw `<script>` tags appear in the source (NFR-7)
- Guarantee: `web-explorer:build` fails if the bundle-size budget check does not pass

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
