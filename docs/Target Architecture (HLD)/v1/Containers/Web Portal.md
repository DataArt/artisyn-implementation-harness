---
id: 6b2f1e4a
purpose: Design intent for the Web Portal container — the composition-only Nx project that assembles Web Explorer and Web Docs into one deployable artifact tree
keywords: [web-portal, nx composition, github-pages, hld]
---

# Web Portal Container

Composition-only Nx project at `apps/web-portal`, with no application source of its own. Its sole responsibility: assemble Web Explorer's and Web Docs's independently-built static outputs into one deployable artifact tree.

## Baseline diagram

```mermaid
flowchart TD
    subgraph EXPLORER ["apps/web-explorer"]
        EXP_BUILD["web-explorer:build"]:::build
        EXP_DIST["dist/"]:::dist
    end

    subgraph DOCS ["apps/web-docs"]
        DOCS_BUILD["web-docs:build"]:::build
        DOCS_DIST[".vitepress/dist/"]:::dist
    end

    subgraph PORTAL ["apps/web-portal (no source)"]
        ASSEMBLE["portal-assemble.ts\ncopies + asserts\n(scripts/ci/portal-assemble.ts, via tsx)"]:::assemble
        PORTAL_DIST["dist/\n(index.html + docs/index.html)"]:::dist
    end

    EXP_BUILD --> EXP_DIST --> ASSEMBLE
    DOCS_BUILD --> DOCS_DIST --> ASSEMBLE
    ASSEMBLE --> PORTAL_DIST --> UPLOAD["upload-pages-artifact\napps/web-portal/dist"]:::ci --> DEPLOY["deploy-pages"]:::ci --> PAGES["GitHub Pages\n/<repo>/ → Web Explorer\n/<repo>/docs/ → Web Docs"]:::pages

    classDef build    fill:#D97706,stroke:#B45309,color:#fff
    classDef dist      fill:#065F46,stroke:#064e3b,color:#fff
    classDef assemble  fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef ci        fill:#F1F5F9,stroke:#CBD5E1,color:#1E293B
    classDef pages     fill:#CFFAFE,stroke:#67E8F9,color:#0E7490

    style EXPLORER fill:#EFF6FF,stroke:#4A90D9,color:#0f172a
    style DOCS fill:#EEF2FF,stroke:#1D4ED8,color:#0f172a
    style PORTAL fill:#FAF5FF,stroke:#8E44AD,color:#0f172a
```

## Responsibilities

- Declare the project-graph dependency on Web Explorer and Web Docs so `nx affected` marks it affected whenever either changes
- Copy Web Explorer's `dist/` and Web Docs's `.vitepress/dist/` into one artifact tree at `apps/web-portal/dist/`
- Assert both `dist/index.html` and `dist/docs/index.html` exist before the build target succeeds — fail loudly rather than ship a partial deploy
- Introduce no application source and no server runtime — build-time composition only

## Technology

| Component          | Choice                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| Project type       | Nx `"application"`, empty `sourceRoot`                                 |
| Composition script | `scripts/ci/portal-assemble.ts`, run via `nx:run-commands` using `tsx` |
| Language           | TypeScript                                                             |

## Boundary contracts

- Input: `apps/web-explorer/dist/**` and Web Docs's `.vitepress/dist/**` (both produced by their own independent `build` targets)
- Output: `apps/web-portal/dist/` — `apps/web-explorer/dist/**` copied to its root, Web Docs's output copied under `dist/docs/`
- Guarantee: `build` target declares `outputs: ["{projectRoot}/dist"]`
- Guarantee: the assemble script throws a descriptive error — failing the Nx target and CI — if `dist/index.html` or `dist/docs/index.html` is missing after the copy; there is no partial-deploy failure mode
- `project.json` declares `implicitDependencies: ["web-explorer", "web-docs"]` (the project-graph edge `nx affected` needs) and the `build` target declares `dependsOn: ["web-explorer:build", "web-docs:build"]` (task ordering only, a separate concern from the graph edge) — the same `implicitDependencies` pattern `apps/web-docs/project.json` already used before this container existed
- Output feeds `.github/workflows/cd.yml`'s `actions/upload-pages-artifact`, whose `path` is `apps/web-portal/dist`; `nx affected --target=build` is unchanged as a command but now also builds `web-portal` via the project graph

## Constraints

- No server runtime introduced — build-time composition only, consistent with `System Overview.md`'s static-content design principle
- No staging environment exists for this pipeline; the CI-level file-existence assertion is the sole mitigation against a partial deploy
- GitHub Pages serves Web Explorer at `/<repo>/` and Web Docs at `/<repo>/docs/` from this one composed artifact tree
- One of three siblings in the Web layer: [Web Explorer](Web%20Explorer.md), [Web Docs](Web%20Docs.md), Web Portal — each has its own container doc

## Key paths

| Path                            | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `apps/web-portal/`              | Nx project definition, no application source                     |
| `apps/web-portal/project.json`  | `implicitDependencies`, `build` target `dependsOn` and `outputs` |
| `scripts/ci/portal-assemble.ts` | Copies both static builds, asserts both `index.html` files exist |
| `apps/web-portal/dist/`         | Composed static output — the GitHub Pages deploy artifact source |
