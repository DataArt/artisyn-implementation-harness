---
id: 985055cb
name: Dev Plan
description: Implementation plan for GitHub Pages hosting of the VitePress docs site
type: reference
---

# DEV-20261108-K7XQ: GitHub Pages Hosting — Plan

| Field   | Value                                         |
| ------- | --------------------------------------------- |
| Ticket  | DEV-20261108-K7XQ                             |
| Intent  | [0-intent.md](0-intent.md)                    |
| Branch  | `feat/dev-20261108-k7xq-github-pages-hosting` |
| Created | 2026-11-08                                    |

## Solution

Implements WBS items 2 and 3 of the approved design (`solution/Architecture.md`,
DESIGN-20261103-LBBI): make the already-public, already-Pages-enabled repo actually
serve the site. Touches only the **Web** container (`apps/docs-web/`) and the CI/CD
workflow (`.github/workflows/cd.yml`) — no other HLD container changes. Reused as-is:
`scripts/ci/site-build.sh` (already AWS-free), the `site:build`/`site:lint`/`site:typecheck`
nx targets, and the existing `./.github/actions/setup` composite action.

```mermaid
flowchart LR
    PUSH(["git push to main"]):::trigger
    BUILD["cd.yml build\nvitepress build\nVITE_* from repo vars"]:::changed
    CFGP["configure-pages"]:::changed
    UPLOAD["upload-pages-artifact"]:::changed
    DEPLOY["deploy-pages\nenv: github-pages"]:::changed
    LIVE["🌍 Live on GitHub Pages\n/artisyn-implementation-harness/"]:::existing

    PUSH --> BUILD --> CFGP --> UPLOAD --> DEPLOY --> LIVE

    classDef trigger fill:#2C3E50,stroke:#1A252F,color:#fff
    classDef changed fill:#176B54,stroke:#104D3C,color:#fff
    classDef existing fill:#2C3E50,stroke:#1A252F,color:#fff
```

Planning decisions:

- Base path is the actual repo name, `/artisyn-implementation-harness/` (confirmed via `gh repo view`), not the `artisyn-harness` remote shorthand.
- CSP directive values are recovered from the deleted `apps/infra/lib/docs-stack.ts` (git history, `ResponseHeadersPolicy`), minus `frame-ancestors` (not meta-tag expressible) — the exact set Decision #6 of `solution/Architecture.md` calls for.
- `cd.yml`'s build step reuses the `ci` nx configuration (no `envFile`, since no `.env.prod` exists) and sets `VITE_*` directly as job env from GitHub Actions repository variables — Vite exposes any `process.env` var prefixed `VITE_` at build time with no `.env` file needed.
- Setting the repository variables themselves is a shared-state GitHub settings change — proposed as a command for the developer to run, not run by me (same bar as a guarded command).

## Acceptance Criteria

- [ ] `AC-1` — `apps/docs-web/.vitepress/config.ts` sets `base: '/artisyn-implementation-harness/'`
- [ ] `AC-2` — Built site's favicon links and the GraphExplorer WASM fetch resolve under the base path (no absolute `/favicon.png`, `/da-favicon.png`, or `/docs-operational-graph.sqlite` references left in `dist/`)
- [ ] `AC-3` — Rendered HTML `<head>` contains a CSP meta tag with the directive values from the former CloudFront policy, minus `frame-ancestors`
- [ ] `AC-4` — `.github/workflows/cd.yml` has a job running `actions/configure-pages`, `actions/upload-pages-artifact` (path `apps/docs-web/.vitepress/dist`), `actions/deploy-pages`, with `permissions: {contents: read, pages: write, id-token: write}`, `environment: github-pages`, and `concurrency: {group: "pages", cancel-in-progress: false}`
- [ ] `AC-5` — GitHub Actions repository variables `VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`, `VITE_GISCUS_REPO_ID`, `VITE_GISCUS_CATEGORY_ID` are set (`gh variable list`)
- [ ] `AC-6` — After merge to `main`, the `deploy-pages` run succeeds and `https://dataart.github.io/artisyn-implementation-harness/` serves the site live: nav/assets load, Graph Explorer (WASM) works, CSP meta tag present, no console CSP violations

## Steps

### Step 1 — Tests: skipped because no test setup for this layer

`apps/docs-web`'s `project.json` defines no `test` target — there is no existing test
framework for the Web container to extend. Verification for every step below is a
real build/CI-configuration run plus, where applicable, a live operational check
(Step 4), not an invented test harness for a static-site config change.

### Step 2 — Web: VitePress base path and base-aware assets

**Changes:**

- `apps/docs-web/.vitepress/config.ts` — add `const base = '/artisyn-implementation-harness/';` near the top; set `base` in `defineConfig({...})`; change the `favicon.png` `link` href and the inline SVG's `da-favicon.png` `href` in `socialLinks` to interpolate `${base}` instead of a hardcoded leading `/`.
- `apps/docs-web/.vitepress/theme/GraphExplorer/script.ts` — change `fetch('/docs-operational-graph.sqlite')` (line 172) to `fetch(\`${import.meta.env.BASE_URL}docs-operational-graph.sqlite\`)`. `docUrl.ts`already uses VitePress's`withBase()` and nav/sidebar route keys are auto-prefixed by VitePress — neither needs a change.

**Verification:**

> Run: `yarn nx run site:build`
> Expected: build succeeds; `apps/docs-web/.vitepress/dist/index.html` contains `href="/artisyn-implementation-harness/favicon.png"`, not `href="/favicon.png"`
>
> Run: `grep -r "docs-operational-graph.sqlite" apps/docs-web/.vitepress/dist/assets/*.js | grep -v artisyn-implementation-harness`
> Expected: no output — no remaining absolute (non-base-prefixed) reference to the WASM fetch target in the built JS

### Step 3 — Web: CSP meta tag

**Changes:**

- `apps/docs-web/.vitepress/config.ts` — add a `['meta', { 'http-equiv': 'Content-Security-Policy', content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://giscus.app; style-src 'self' 'unsafe-inline' https://giscus.app; img-src 'self' data: https://giscus.app https://avatars.githubusercontent.com; font-src 'self' data:; connect-src 'self' https://giscus.app; frame-src https://giscus.app; object-src 'none'; base-uri 'self'" }]` entry to `head`.

**Verification:**

> Run: `yarn nx run site:build && yarn nx run site:preview &` then `curl -s http://localhost:4173/artisyn-implementation-harness/ | grep -o '<meta http-equiv="Content-Security-Policy"[^>]*>'`
> Expected: the meta tag is present with the exact directive string above
>
> Open the built preview's homepage, a doc page with the giscus widget, and the Graph Explorer page (`/Harness/07 Operational Graph/04 Graph Explorer`) in a browser; confirm the console shows no CSP violation errors (Graph Explorer specifically exercises `wasm-unsafe-eval` and the sqlite fetch)

### Step 4 — CI/CD: GitHub Pages deploy workflow

**Changes:**

- `.github/workflows/cd.yml` — replace the stub `deploy` job's single step with: `yarn nx run site:build --configuration=ci` (env: `VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`, `VITE_GISCUS_REPO_ID`, `VITE_GISCUS_CATEGORY_ID` from `${{ vars.* }}`), then `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4` (`path: apps/docs-web/.vitepress/dist`), `actions/deploy-pages@v4`. Job-level `permissions: {contents: read, pages: write, id-token: write}` (job-level `permissions` replaces, not merges with, the workflow-level block — `contents: read` is required here too, for `actions/checkout`), `environment: github-pages`, `concurrency: {group: "pages", cancel-in-progress: false}`.
- Developer action (not run by me — shared repo-settings mutation): set the four GitHub Actions repository variables from `apps/docs-web/.env.dev`'s values:
  ```bash
  gh variable set VITE_GITHUB_ORG --body "DataArt"
  gh variable set VITE_GITHUB_REPO --body "artisyn-implementation-harness"
  gh variable set VITE_GISCUS_REPO_ID --body "R_kgDOT7pBZw"
  gh variable set VITE_GISCUS_CATEGORY_ID --body "DIC_kwDOT7pBZ84DDmbz"
  ```

**Verification:**

> Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/cd.yml'))"` (or equivalent) — confirms valid YAML before pushing
>
> Run: `gh variable list` — confirms all four variables are set
>
> **Live, post-merge** (cd.yml only triggers on push to `main`, so this cannot be checked pre-merge): after this branch merges, watch the `deploy-pages` Actions run to completion (`gh run watch` or the Actions tab), then `curl -sI https://dataart.github.io/artisyn-implementation-harness/` and confirm `200 OK`. This is this step's required live operational verification (AC-6); it runs in the Test stage, not here.
