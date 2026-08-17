# Discuss Container

Client-side comments widget (giscus, GitHub Discussions-backed) embedded on VitePress documentation pages. No infrastructure or compute of our own — giscus and GitHub host and operate everything behind this integration.

## Baseline diagram

```mermaid
flowchart LR
    subgraph BROWSER ["🖥️ Reader's Browser"]
        ROUTE["🧭 VitePress router\n(route.path)"]:::route
        PAGE["📄 Layout.vue\n(#doc-after slot)"]:::page
        WIDGET["💬 GiscusComments.vue\n(script inject/teardown)"]:::widget
    end

    subgraph GITHUB ["🐙 GitHub (GITHUB_ORG/GITHUB_REPO — private)"]
        DISCUSSIONS["🗨️ Discussions\n(ADLC Comments category)"]:::discussions
        APP["🔌 giscus GitHub App"]:::app
    end

    GISCUS["☁️ giscus.app\n(client.js + backend)"]:::giscus

    ROUTE -->|"watch(route.path)"| WIDGET
    PAGE --> WIDGET
    WIDGET -->|"inject <script data-term=decoded-pathname>"| GISCUS
    GISCUS -->|"reads via App install (any visitor)\nwrites gated by viewer's own repo permission"| APP
    APP --> DISCUSSIONS

    classDef route fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef page fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef widget fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef giscus fill:#D97706,stroke:#B45309,color:#fff
    classDef app fill:#0E7490,stroke:#0c4a6e,color:#fff
    classDef discussions fill:#065F46,stroke:#064e3b,color:#fff
```

## Responsibilities

- Embed a client-side comments widget on VitePress `doc`-layout pages, mapped one discussion per page
- Keep the widget in sync with VitePress's client-side (SPA) navigation
- No server, database, or compute operated by this platform — giscus and GitHub own the runtime and storage

## Technology

| Component         | Choice                                                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Widget            | giscus — client-side script embed (`giscus.app/client.js`), no npm dependency                                                                                                          |
| Data store        | GitHub Discussions on the repo configured via `GITHUB_ORG`/`GITHUB_REPO` (private repo)                                                                                                |
| Access control    | Asymmetric: posting requires GitHub repository permission (verified); reading does not — gated only by the site's basic-auth gate, same population as the rest of the site (see NFR-6) |
| Theme integration | `apps/docs-web/.vitepress/theme/` (Web container) — no dedicated NX app                                                                                                                |

## Key paths

| Path                                                     | Purpose                                          |
| -------------------------------------------------------- | ------------------------------------------------ |
| `apps/docs-web/.vitepress/theme/GiscusComments.vue`      | Owns the giscus script inject/teardown lifecycle |
| `apps/docs-web/.vitepress/theme/Layout.vue`              | Injects the widget into the `#doc-after` slot    |
| `docs/System Architecture (LLD)/Discuss/00. Overview.md` | Implementation detail                            |
