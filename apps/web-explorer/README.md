---
id: ffe6a029
---

# web-explorer

React 19 + Vite SPA — a promotional landing page introducing the Artisyn Implementation Harness through an interactive, simulated `/design`/`/dev` lifecycle walkthrough. Served at the GitHub Pages project-site root, composed alongside Web Docs by Web Portal.

## Targets

| Target      | Command                              | Output                     |
| ----------- | ------------------------------------ | -------------------------- |
| `build`     | `yarn nx run web-explorer:build`     | `apps/web-explorer/dist/`  |
| `typecheck` | `yarn nx run web-explorer:typecheck` | TypeScript check (no emit) |
| `lint`      | `yarn nx run web-explorer:lint`      | ESLint on `src/`           |

## Run locally

```bash
yarn install
cd apps/web-explorer && ../../node_modules/.bin/vite   # → http://localhost:5173
```

## Config

`.env.example` — copy to `.env.local` to set `VITE_REPO_URL`/`VITE_DOCS_URL` for the outbound links; both have working fallbacks if unset.

## Links

→ `docs/Target Architecture (HLD)/v1/Containers/Web Explorer.md` — HLD for this container
→ `docs/System Architecture (LLD)/Web Explorer/00. Overview.md` — LLD: design system, content/demo boundaries, brand-asset provenance
