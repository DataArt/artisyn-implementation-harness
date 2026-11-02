---
id: 2f617a4e
---

# Web Container

VitePress static documentation site.

## Baseline diagram

```mermaid
flowchart LR
    subgraph SOURCE ["  Source (apps/docs-web/)  "]
        CONFIG["⚙️ VitePress config\n.vitepress/config.ts"]:::config
        CONTENT["📝 Markdown content\ndocs/ (srcDir)"]:::content
        THEME["🎨 Theme & components\n.vitepress/theme/"]:::theme
    end

    BUILD["🔨 Vite build\nyarn nx run site:build"]:::build

    DIST["📦 Static output\n.vitepress/dist/"]:::dist

    S3(["🪣 S3 Bucket\n(via site:deploy)"]):::s3

    CONFIG --> BUILD
    CONTENT --> BUILD
    THEME --> BUILD
    BUILD --> DIST
    DIST -->|"uploaded by site:deploy\n(aws s3 sync)"| S3

    classDef config  fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef content fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef theme   fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef build   fill:#D97706,stroke:#B45309,color:#fff
    classDef dist    fill:#065F46,stroke:#064e3b,color:#fff
    classDef s3      fill:#0E7490,stroke:#0c4a6e,color:#fff
```

## Responsibilities

- Render Markdown content from `docs/` as a static site via VitePress
- VitePress configuration, sidebar navigation, and theme in `apps/docs-web/`
- Served at the CloudFront distribution origin — no server-side runtime
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

Nav is five fixed items in `config.ts`, one per top-level `docs/` section. Sidebar per section is generated at build time by scanning the corresponding `docs/` subdirectory via the `scanSection` helper in `config.ts`. File numeric prefix (`00`, `01`, …) controls sidebar ordering. `index.md` and `README.md` files are excluded from sidebar items. `docs/index.md` uses the VitePress `layout: home` landing page; each top-level section maintains its own `index.md` as a mini-hero entry point.

## Boundary contracts

- Input: Markdown content under `docs/` (`srcDir`), VitePress config (`.vitepress/config.ts`), theme components (`.vitepress/theme/`)
- Output: static HTML/CSS/JS in `apps/docs-web/.vitepress/dist/`, uploaded to the S3 origin by `site:deploy` (`aws s3 sync`) — the container's runtime output is build-time only, no server process
- Guarantee: `nx run site:build` fails the build on any dead internal link, since `ignoreDeadLinks` is not set in `config.ts` (NFR-5)
- Runtime environment values (`VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`) are resolved at build time from `.env.dev` locally or SSM in CI — never read at request time, since the served artifact has no server runtime

## Constraints

- Served as static output only — no server-side runtime at request time; all rendering and link-checking happen at build time (NFR-5)
- Nav is five fixed items hardcoded in `config.ts`; sidebar per section is generated at build time from directory scans, not configurable at runtime
- Site title and description are tokenized in `config.ts`, not hardcoded per environment
- All requests to this container pass through the Auth container's basic-auth gate before reaching any content (NFR-1)

## Key paths

| Path                             | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `apps/docs-web/`                 | VitePress config and theme             |
| `docs/`                          | Markdown content (srcDir)              |
| `apps/docs-web/.vitepress/dist/` | Static build output (S3 upload target) |
