---
id: f5b3e164
purpose: 'Implementation-level detail for the Web Portal composition mechanism and the config changes it requires in Web Explorer and Web Docs'
keywords: [web-portal, portal-assemble, nx project.json, vite config, vitepress config, cd.yml]
---

# DESIGN-20261108-1L8P — Solution Design

Every decision below already appears in `solution/Architecture.md`'s decision register; this document only adds the implementation shape.

## `apps/web-portal/project.json` shape

```json
{
  "name": "web-portal",
  "projectType": "application",
  "root": "apps/web-portal",
  "sourceRoot": "",
  "implicitDependencies": ["web-explorer", "web-docs"],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "dependsOn": ["web-explorer:build", "web-docs:build"],
      "cache": true,
      "outputs": ["{projectRoot}/dist"],
      "options": {
        "command": "tsx scripts/ci/portal-assemble.ts"
      }
    }
  }
}
```

`implicitDependencies` creates the project-graph edge `nx affected` walks — this repo's own existing pattern (`apps/docs-web/project.json` already declares `"implicitDependencies": ["docs"]`). The target-level `dependsOn` is a separate, task-graph-only ordering: it makes `web-explorer:build`/`web-docs:build` run before `web-portal:build` once that target is invoked, but does not by itself mark `web-portal` affected — both are required together. `tsx` matches this repo's existing pattern for root-level TypeScript automation (`scripts/bootstrap/bootstrap-client.mts`), rather than `node` against a compiled script.

## `scripts/ci/portal-assemble.ts` behavior

```mermaid
flowchart TD
    START["nx run web-portal:build"]:::trigger
    SRC1["apps/web-explorer/dist"]:::source
    SRC2["Web Docs dist\n(apps/docs-web/.vitepress/dist in PR 1,\napps/web-docs/.vitepress/dist after PR 2)"]:::source
    COPY1["fs.cpSync → apps/web-portal/dist/"]:::copy
    COPY2["fs.cpSync → apps/web-portal/dist/docs/"]:::copy
    ASSERT["fs.existsSync both\ndist/index.html + dist/docs/index.html"]:::assert
    OK["target succeeds"]:::ok
    FAIL["throw Error → target exits non-zero"]:::fail

    START --> SRC1 --> COPY1 --> ASSERT
    START --> SRC2 --> COPY2 --> ASSERT
    ASSERT -->|both exist| OK
    ASSERT -->|either missing| FAIL

    classDef trigger fill:#D97706,stroke:#B45309,color:#fff
    classDef source fill:#065F46,stroke:#064e3b,color:#fff
    classDef copy fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef assert fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef ok fill:#16A34A,stroke:#15803D,color:#fff
    classDef fail fill:#DC2626,stroke:#991B1B,color:#fff
```

The script reads two fixed source paths — `apps/web-explorer/dist`, and Web Docs's dist path (`apps/docs-web/.vitepress/dist` in PR 1, `apps/web-docs/.vitepress/dist` after PR 2's rename). It copies the first into `apps/web-portal/dist/` and the second into `apps/web-portal/dist/docs/`, using `fs.cpSync(src, dest, { recursive: true })`. It then asserts both `dist/index.html` and `dist/docs/index.html` exist via `fs.existsSync`, throwing a descriptive `Error` — not just logging — if either is missing. This is what makes the Nx build target fail loudly rather than silently uploading an incomplete artifact.

## CI run: full sequence including the failure branch

```mermaid
flowchart TD
    AFFECTED["nx affected --target=build"]:::trigger
    EXP["web-explorer:build"]:::build
    DOCS["web-docs:build"]:::build
    PORTAL["web-portal:build\n(dependsOn both)"]:::portal
    ASSEMBLE["portal-assemble.ts runs + asserts"]:::assemble
    UPLOAD["upload-pages-artifact\npath: apps/web-portal/dist"]:::ci
    DEPLOY["deploy-pages"]:::ci
    EXPFAIL["web-explorer:build fails"]:::fail
    DOCSFAIL["web-docs:build fails"]:::fail
    ASSERTFAIL["assertion throws"]:::fail
    NEVERRUN["web-portal:build never runs"]:::fail
    PIPEFAIL["nx affected --target=build fails\nupload/deploy never run"]:::fail

    AFFECTED --> EXP
    AFFECTED --> DOCS
    EXP --> PORTAL
    DOCS --> PORTAL
    PORTAL --> ASSEMBLE --> UPLOAD --> DEPLOY

    EXP -.->|on failure| EXPFAIL --> NEVERRUN --> PIPEFAIL
    DOCS -.->|on failure| DOCSFAIL --> NEVERRUN
    ASSEMBLE -.->|on failure| ASSERTFAIL --> PIPEFAIL

    classDef trigger fill:#D97706,stroke:#B45309,color:#fff
    classDef build fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef portal fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef assemble fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef ci fill:#F1F5F9,stroke:#CBD5E1,color:#1E293B
    classDef fail fill:#DC2626,stroke:#991B1B,color:#fff
```

## Failure/recovery

If either source build (`web-explorer` or `web-docs`) fails, Nx's `dependsOn` means `web-portal:build` never runs — the assemble script never executes against a partial or missing source tree. If the assemble script's own assertion fails, the Nx target exits non-zero, `nx affected --target=build` fails in `cd.yml`, and `upload-pages-artifact`/`deploy-pages` never run — production is never updated with a broken artifact.

## Configuration changes

| File                                                                                           | Change                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web-explorer/vite.config.ts`                                                             | Add `base: '/<repo>/'` — the literal value is tokenized the same way Web Docs's `config.ts` already tokenizes its base path; no hardcoded repo name.                                                                                                                                                                             |
| `apps/docs-web/.vitepress/config.ts` (renamed to `apps/web-docs/.vitepress/config.ts` in PR 2) | Change `base` from `/<repo>/` to `/<repo>/docs/`.                                                                                                                                                                                                                                                                                |
| `.github/workflows/cd.yml`                                                                     | `Build site` step keeps `yarn nx affected --target=build --configuration=ci --base=HEAD~1 --head=HEAD` unchanged — Nx's project graph correctly includes `web-portal` once its `implicitDependencies` is declared. `Upload artifact` step's `path` input changes from `apps/docs-web/.vitepress/dist` to `apps/web-portal/dist`. |

## Data and schema

No schema, event, or data changes. This solution introduces no persistent data or API surface.

## Accessibility and content

Web Explorer's existing scaffold already implements reduced-motion support, keyboard focus, and semantic headings per its own `IMPLEMENTATION_BRIEF.md`. Carried over unchanged, not re-specified here.
