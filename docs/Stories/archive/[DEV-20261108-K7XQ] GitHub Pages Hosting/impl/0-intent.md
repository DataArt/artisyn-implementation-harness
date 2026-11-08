---
id: intent
purpose: 'Captured intent for implementing GitHub Pages hosting of the VitePress docs site'
keywords: [github-pages, vitepress, base-path, cd-workflow]
---

# DEV-20261108-K7XQ: GitHub Pages Hosting — Intent

**Ticket**: DEV-20261108-K7XQ (local ID; no `ND-*` tracker ticket exists for this work)
**Date**: 2026-11-08
**Sources**: developer's message ("lets develop the github pages hosting of the vitepress site, we have design for this"); approved design `docs/Stories/design/approved/[DESIGN-20261103-LBBI] Migrate Static Site Hosting to GitHub Pages/solution/Architecture.md`; that design's `design/Report.md`; live repo state checked via `gh api repos/DataArt/artisyn-implementation-harness/pages` and `gh repo view`.

## Approved design is the spec

`solution/Architecture.md` for DESIGN-20261103-LBBI is the authoritative source of truth for this work. This intent does not restate its decisions; it scopes what's left to build and records current live state the design's authors could not have observed before this ticket.

## What is the problem?

The design's sequencing had six steps. Checking live state against them:

- **Step 1 (pre-publish review), Step 4 (AWS decommission), Step 5 (repo → public)** are already done: `apps/infra/` and `apps/lambda-auth/` are deleted (archived report `[DESIGN-20261103-LBBI] Retire Existing Infra`, Status ✅ Complete), and `gh repo view` confirms the repo is public (`DataArt/artisyn-implementation-harness`).
- **Step 2 (VitePress readiness)** is not done: `apps/docs-web/.vitepress/config.ts` has no `base` path set, the operational-graph WASM fetch is not base-aware, and no CSP meta tag exists.
- **Step 3 (GitHub Pages CI/CD cutover)** is not done: `.github/workflows/cd.yml`'s deploy job is a stub (`echo "CD deploy retired pending GitHub Pages cutover" && exit 0`) — there is no `configure-pages`/`upload-pages-artifact`/`deploy-pages` workflow yet.
- **Consequence, confirmed live**: GitHub Pages is already enabled in repo settings (`gh api .../pages` → `build_type: "workflow"`, `source: {branch: "main", path: "/"}`) but has never successfully deployed (`status: null`). The site is not live at `https://dataart.github.io/artisyn-implementation-harness/` yet — there is currently no working deploy path at all, AWS or GitHub Pages.

So this ticket is narrower than the full design: implement the remaining WBS items 2 and 3 (`solution/Efforts.md`), which together make the already-public, already-Pages-enabled repo actually serve the site.

## What does better look like?

- `apps/docs-web/.vitepress/config.ts` sets `base: '/artisyn-implementation-harness/'` (the actual repo name — confirmed via `gh repo view`, not the `artisyn-harness` remote shorthand).
- The operational-graph SQLite WASM fetch resolves correctly under that base path (base-relative, not an absolute `/docs-operational-graph.sqlite` path).
- A CSP `<meta http-equiv="Content-Security-Policy">` tag is added via VitePress `head` config, per Decision #6 in `solution/Architecture.md` (same directives as the retired CloudFront policy, minus `frame-ancestors`).
- `.github/workflows/cd.yml` gets a real `deploy-pages` job: `actions/configure-pages`, `actions/upload-pages-artifact` (pointed at `apps/docs-web/.vitepress/dist`), `actions/deploy-pages`, with `permissions: pages: write, id-token: write`, a `github-pages` environment, and a `concurrency: {group: "pages", cancel-in-progress: false}` group.
- `VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`, `VITE_GISCUS_REPO_ID`, `VITE_GISCUS_CATEGORY_ID` move to GitHub Actions repository variables (no secret store needed — confirmed non-secret in `apps/docs-web/.env.example`).
- A push to `main` builds and deploys the site, and `https://dataart.github.io/artisyn-implementation-harness/` serves it live with working nav, assets, Graph Explorer (WASM), and the CSP meta tag present — Sequencing step 6 of the design, finally reachable.

## Who and what is affected?

- **HLD container**: Web (`apps/docs-web/`) — confirmed against `docs/Target Architecture (HLD)/v1/Containers/Web.md`, whose baseline diagram already documents this target state (`configure-pages` → `upload-pages-artifact` → `deploy-pages` → GitHub Pages), consistent with the approved design.
- CI/CD: `.github/workflows/cd.yml`, and GitHub Actions repository variables (settings, not code).
- No other container is touched — Discuss (giscus) is confirmed hosting-agnostic by the design; Harness Bootstrap E2E is unaffected.
- Anyone visiting the docs site: currently nothing is live; after this, the public docs site becomes reachable for the first time since the AWS teardown.

## What is out of scope?

- Steps 1, 4, 5 of the design's sequencing (pre-publish review, AWS decommission, repo visibility) — already done, not re-verified or redone here beyond the live-state check above.
- WBS item 6 (post-migration cleanup: removing obsolete `apps/docs-web` nx targets and the SSM-loading half of `site-build.sh`) — the archived `Retire Existing Infra` report already stubbed the AWS-specific nx targets and deleted `site-deploy.sh`/simplified `site-build.sh` as part of item 5's work. Whether anything remains under item 6's scope is a Plan-stage check, not assumed done or pending here.
- NFR doc updates (NFR-9 retirement, etc.) beyond what Document stage finds still inaccurate — the HLD container list already reflects the post-migration state (Web, Discuss, Harness Bootstrap E2E only), so this is expected to be minor.
- Custom domain (Option C) — explicitly out of scope per the design's Considered Options.

## What are the constraints?

- `solution/Architecture.md`'s Decision Register (10 rows) is binding for items 2 and 3's scope; this ticket does not revisit the hosting-platform choice or the sequencing decision.
- Base path must be the actual repo name, `/artisyn-implementation-harness/` — confirmed live, not assumed from the `artisyn-harness` git remote shorthand (which is a renamed-repo redirect, not the canonical name).
- No AWS fallback exists if the new path has a problem post-deploy (design's Sequencing note) — not a reason to pause, since AWS is already gone regardless of this ticket; just means verification before calling this done matters more than usual.
- CI must stay green with zero AWS credential/role references (Decision #4) — already true per the archived infra-retirement work; this ticket must not reintroduce any.

## What is still open?

None. Live-state checks above resolved every question the design's authors flagged as needing confirmation at implementation time (repo name/base path, current Pages-enablement status, whether prior cleanup already covered item 6).
