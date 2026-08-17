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

## Key paths

| Path                             | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `apps/docs-web/`                 | VitePress config and theme             |
| `docs/`                          | Markdown content (srcDir)              |
| `apps/docs-web/.vitepress/dist/` | Static build output (S3 upload target) |
