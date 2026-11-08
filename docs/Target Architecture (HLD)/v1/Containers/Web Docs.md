---
id: 2f617a4e
purpose: Design intent for the Web Docs container — the VitePress static documentation site, served under the /docs/ subpath
keywords: [web-docs, vitepress, hld]
---

# Web Docs Container

VitePress static documentation site at `apps/web-docs`, served under GitHub Pages' `/<repo>/docs/` subpath.

## Baseline diagram

```mermaid
flowchart LR
    subgraph SOURCE ["  Source (apps/web-docs/)  "]
        CONFIG["⚙️ VitePress config\n.vitepress/config.ts"]:::config
        CONTENT["📝 Markdown content\ndocs/ (srcDir)"]:::content
        THEME["🎨 Theme & components\n.vitepress/theme/"]:::theme
    end

    BUILD["🔨 Vite build\nyarn nx run web-docs:build"]:::build

    DIST["📦 Static output\n.vitepress/dist/"]:::dist

    DIST_PORTAL["📥 input to Web Portal\n(apps/web-portal/dist/docs/)"]:::portal

    CONFIG --> BUILD
    CONTENT --> BUILD
    THEME --> BUILD
    BUILD --> DIST --> DIST_PORTAL

    classDef config  fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef content fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef theme   fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef build   fill:#D97706,stroke:#B45309,color:#fff
    classDef dist    fill:#065F46,stroke:#064e3b,color:#fff
    classDef portal  fill:#FAF5FF,stroke:#8E44AD,color:#0f172a
```

`apps/web-docs/.vitepress/dist/` is now an input to Web Portal's composition step (see `Containers/Web Portal.md`), not uploaded to GitHub Pages directly.

## Responsibilities

- Render Markdown content from `docs/` as a static site via VitePress
- VitePress configuration, sidebar navigation, and theme in `apps/web-docs/`
- Produce a static build consumed by Web Portal's composition step, which is what GitHub Actions actually uploads and deploys — no server-side runtime
- Hosts the theme integration point for the Discuss container's comments widget (see `Containers/Discuss.md`)

## Technology

| Component        | Choice                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| Site framework   | VitePress 1.x                                                                |
| Build tool       | Vite                                                                         |
| Content format   | Markdown                                                                     |
| Site title       | `DataArt ADLC Discovery` (tokenized in `config.ts`)                          |
| Site description | Evidence-led problem→solution framing, tokenized `DataArt` (see `config.ts`) |

## Navigation

Nav is 8 fixed items in `config.ts`, pointing into `Harness/` subsections plus a Security Scan entry; every other top-level `docs/` section is reached via the homepage. Sidebar per section is generated at build time by scanning the corresponding `docs/` subdirectory via the `scanSection` helper in `config.ts`. File numeric prefix (`00`, `01`, …) controls sidebar ordering. `index.md` and `README.md` files are excluded from sidebar items. `docs/index.md` uses the VitePress `layout: home` landing page; each top-level section maintains its own `index.md` as a mini-hero entry point.

## Boundary contracts

- Input: Markdown content under `docs/` (`srcDir`), VitePress config (`.vitepress/config.ts`), theme components (`.vitepress/theme/`), and `docs/.og/cli.mjs build` — runs before `vitepress build` to keep the operational graph database current
- Output: static HTML/CSS/JS in `apps/web-docs/.vitepress/dist/` — copied into `apps/web-portal/dist/docs/` by Web Portal's composition step, which is what `actions/upload-pages-artifact` and `actions/deploy-pages` actually publish. `docs-operational-graph.sqlite` is copied into `dist/` by `config.ts`'s `buildEnd` hook as an additional static output
- Runtime dependencies: `cytoscape` and `sql.js` render and live-query the operational graph on the Graph Explorer page; the WASM database fetch path is base-aware, resolved via `import.meta.env.BASE_URL`, so it resolves correctly under the `/<repo>/docs/` prefix
- Guarantee: `web-docs:build` fails the build on any dead internal link, since `ignoreDeadLinks` is not set in `config.ts` (NFR-5)
- Build-time config values (`VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`, giscus repo/category IDs) are resolved at build time from `.env.dev` locally or GitHub Actions repository variables in CI — never read at request time, since the served artifact has no server runtime

## Constraints

- Served as static output only — no server-side runtime at request time; all rendering and link-checking happen at build time, consistent with `System Overview.md`'s static-content design principle
- VitePress `base` is set to `/<repo>/docs/` — the site is served under Web Portal's `/docs/` subpath, not at the Pages project-site root. Existing bookmarked/indexed `/<repo>/...` doc URLs break on this change; accepted, no redirect or compat stub added
- Nav is 8 fixed items hardcoded in `config.ts`; sidebar per section is generated at build time from directory scans, not configurable at runtime
- Site title and description are tokenized in `config.ts`, not hardcoded per environment
- The site is public — no auth gate sits in front of any route
- One of three siblings in the Web layer: [Web Explorer](Web%20Explorer.md), Web Docs, [Web Portal](Web%20Portal.md) — each has its own container doc

## Key paths

| Path                             | Purpose                                                        |
| -------------------------------- | -------------------------------------------------------------- |
| `apps/web-docs/`                 | VitePress config and theme                                     |
| `docs/`                          | Markdown content (srcDir)                                      |
| `apps/web-docs/.vitepress/dist/` | Static build output (input to Web Portal's composition step)   |
| `docs/.og/cli.mjs`               | Operational graph build-time CLI, run before `vitepress build` |
