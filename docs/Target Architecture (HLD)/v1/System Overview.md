---
id: 77376e1f
purpose: Purpose, containers, and data flow for the ADLC Discovery Tool platform
keywords: [system-overview, containers, data-flow, hld, log-hub]
---

# System Overview

## Purpose

ADLC Discovery Tool is a static documentation site delivering an AI-first SDLC adoption programme. The site hosts discovery materials, workshop outputs, and design decisions, and is open-sourced via GitHub Pages.

## Containers

| Container             | Responsibility                                                                                                                                                               | Stack                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Web Explorer          | Promotional single-page app                                                                                                                                                  | React 19 · Vite · Tailwind 4 · Motion                                                           |
| Web Docs              | Static documentation site rendered from Markdown via VitePress                                                                                                               | VitePress 1.x · Vite                                                                            |
| Web Portal            | Build-time composition of Web Explorer's and Web Docs's static builds into one deployable artifact tree — no application source, no runtime of its own                       | Nx (`nx:run-commands`) · TypeScript                                                             |
| Discuss               | Client-side comments widget on doc pages, backed by GitHub Discussions — no infra of our own                                                                                 | giscus (external)                                                                               |
| Harness Bootstrap E2E | Test harness validating the `harness-bootstrap` skill — deterministic unit/integration coverage plus live agent E2E runs                                                     | Vitest · Nx · TypeScript                                                                        |
| Log Hub               | Dev tooling: opt-in, repo-managed local Log Hub server (Docker Compose) plus a local-scope Claude Code hook that uploads session telemetry; no presence in the deployed site | Docker Compose · TypeScript scripts run via `tsx` · Nx (`nx:run-commands`) · Claude Code plugin |

Harness Bootstrap E2E is dev/CI tooling, not a runtime participant in the browser-facing request flow below — it tests the `harness-bootstrap` skill against disposable fixture workspaces and has no presence in the deployed site. Its deterministic layers run inside `ci.yml`; its agent E2E layer runs only from a developer's own environment. See `Containers/Harness Bootstrap E2E.md`.

Log Hub is dev tooling, not a runtime participant in the browser-facing request flow below — it runs only on a contributor's own machine, is opt-in, and never runs in CI runtime or the GitHub Pages build. It is not registered in `apps/web-portal`'s composed deploy tree. See `Containers/Log Hub.md`.

## System diagram

```mermaid
flowchart LR
    Dev(["👤 Developer"]):::client
    Browser(["🌐 Browser"]):::client

    GH["📦 GitHub Repo\nmain branch"]:::repo

    subgraph CI_BOX ["  GitHub Actions  "]
        EXP_BUILD["⚙️ web-explorer:build"]:::ci
        DOCS_BUILD["⚙️ web-docs:build"]:::ci
        PORTAL_BUILD["⚙️ web-portal:build\n(assemble + assert)"]:::ci
        CFGP["🛠️ configure-pages"]:::ci
        UPLOAD["📤 upload-pages-artifact\napps/web-portal/dist"]:::ci
        DEPLOY["🚀 deploy-pages"]:::ci
    end

    PAGES["🌍 GitHub Pages\n/<repo>/ → Web Explorer\n/<repo>/docs/ → Web Docs"]:::pages

    Dev -->|"git push"| GH
    GH -->|"triggers"| EXP_BUILD
    GH -->|"triggers"| DOCS_BUILD
    EXP_BUILD --> PORTAL_BUILD
    DOCS_BUILD --> PORTAL_BUILD
    PORTAL_BUILD --> CFGP --> UPLOAD --> DEPLOY
    DEPLOY --> PAGES
    Browser -->|"HTTPS"| PAGES

    classDef client fill:#DBEAFE,stroke:#93C5FD,color:#1E3A8A
    classDef repo   fill:#F1F5F9,stroke:#CBD5E1,color:#1E293B,font-weight:bold
    classDef ci     fill:#F1F5F9,stroke:#CBD5E1,color:#1E293B
    classDef pages  fill:#CFFAFE,stroke:#67E8F9,color:#0E7490

    style CI_BOX fill:#F8FAFC,stroke:#CBD5E1,color:#1E293B
```

_Comments runtime flow (giscus/GitHub Discussions) is shown in `Containers/Discuss.md`._
_Dev-tooling session telemetry flow (Log Hub server + local-scope hook) is shown in `Containers/Log Hub.md`._

## Design principles

- Region is deployment configuration — never hardcoded in source or documentation
- Content is static — no server-side rendering, no database, no runtime compute we operate (excludes third-party client-side widgets that call external services directly from the browser, e.g. giscus; also excludes opt-in, contributor-machine-only dev tooling with no deployed-site presence, e.g. Harness Bootstrap E2E, Log Hub)
- Carve-out: `docs/.og/docs-operational-graph.sqlite` is a build-time-produced, read-only SQLite file queried in-browser via `sql.js` (WASM) — a first-party query engine over first-party static data, not server-side compute we operate

## Tooling

Binding workspace decisions that apply across all containers.

| Tool        | Version        | Pinned by                                 |
| ----------- | -------------- | ----------------------------------------- |
| Node.js     | 24             | `.nvmrc`                                  |
| Yarn        | 4.x            | `packageManager` in root `package.json`   |
| NX          | 23.x           | root `package.json` devDependencies       |
| Module mode | ESM            | `"type": "module"` in root `package.json` |
| ESLint      | v9 flat config | `eslint.config.js` at workspace root      |

TypeScript base: `tsconfig.base.json` — `module: ES2022`, `moduleResolution: bundler`. Each container extends this base and overrides for its own emit target.
