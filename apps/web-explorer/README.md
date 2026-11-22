# web-explorer

Promotional site for the Artisyn Implementation Harness: a Next.js 16 App Router app exported to static HTML, one pre-rendered page per route (landing, Inside the loop, Get started, Docs flow, Dogfood, For AI agents, Migration case, comic). Served at the GitHub Pages project-site root and composed with Web Docs by Web Portal. Browser agents get WebMCP tools; see `/agents/`.

## Run locally

```bash
yarn install
yarn nx run web-explorer:dev        # next dev → http://localhost:3000/artisyn-implementation-harness/
yarn nx run web-explorer:preview    # build, re-sign a copy, serve → http://localhost:4173/artisyn-implementation-harness/
```

`dev` has no CSP and no post-export step. `preview` serves the production build with GitHub Pages rules; Web Docs is not part of it, so local `/docs/` paths answer 404 and the docs search tool reports `docsAvailable: false`.

## Targets

| Target             | Command                                     | Does                                                                               |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `build`            | `yarn nx run web-explorer:build`            | `next build` → post-export step → site gate → bundle budget; writes `out/`         |
| `test`             | `yarn nx run web-explorer:test`             | `node --test` on the build scripts and agent tools                                 |
| `e2e`              | `yarn nx run web-explorer:e2e`              | Playwright (Chromium) on `out/` with GitHub Pages emulation                        |
| `lighthouse`       | `yarn nx run web-explorer:lighthouse`       | Lighthouse SEO and agent readiness on every route; reports in `lighthouse-report/` |
| `install-browsers` | `yarn nx run web-explorer:install-browsers` | `playwright install chromium` (run by `e2e` and `lighthouse`)                      |
| `typecheck`        | `yarn nx run web-explorer:typecheck`        | `next typegen && tsc --noEmit`                                                     |
| `lint`             | `yarn nx run web-explorer:lint`             | ESLint on `src`, `scripts`, `e2e`                                                  |

## Config

Copy `.env.example` to `.env.local` to change the outbound links. All variables are optional and are build inputs.

| Variable                               | Effect                                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_REPO_URL`                 | Source repository link (falls back to the public repo)     |
| `NEXT_PUBLIC_DOCS_URL`                 | Documentation link (falls back to the published docs)      |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Adds the Search Console meta to every page                 |
| `WEBMCP_ORIGIN_TRIAL_TOKEN`            | Adds the WebMCP origin-trial meta (production origin only) |

## Update the WCAG baseline

After fixing an accessibility violation, shrink `e2e/wcag-baseline.json` and commit it:

```bash
cd apps/web-explorer && WCAG_BASELINE=update yarn playwright test agent-accessibility
```

## Refresh the Dogfood graph snapshot

```bash
node docs/.og/cli.mjs build --dir .                 # from the repo root
node apps/web-explorer/scripts/export-dogfood-graph.mjs
```

Commit the updated `src/views/dogfood/graph.json`.

## Links

→ `docs/Target Architecture (HLD)/v1/Containers/Web Explorer.md` — HLD for this container
→ `docs/System Architecture (LLD)/Web Explorer/00. Overview.md` — LLD: components and rendering model, with links to 01 Build and Gates, 02 Agent Interface, 03 Pages and Design System, 04 Test Targets
