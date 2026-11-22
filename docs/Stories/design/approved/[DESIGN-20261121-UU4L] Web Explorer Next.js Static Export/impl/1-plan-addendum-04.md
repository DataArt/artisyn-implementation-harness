---
id: 11115477
type: Implementation Plan Addendum
title: 'DESIGN-20261121-UU4L: Plan addendum 04 — Lighthouse target'
description: Adds a web-explorer:lighthouse Nx target that runs Lighthouse SEO, agentic-browsing and performance on every route and fails on SEO or agent-readiness regressions
tags: [web-explorer, lighthouse, seo, agents, nx, implementation-plan, addendum]
generated: { by: process:dev-implement, at: 2026-11-22T21:40:00Z }
updated: { by: process:dev-implement, at: 2026-11-22T21:40:00Z }
---

# DESIGN-20261121-UU4L: Plan addendum 04 — Lighthouse target

| Field     | Value                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| Plan      | [1-plan.md](1-plan.md), addenda [01](1-plan-addendum-01.md), [02](1-plan-addendum-02.md), [03](1-plan-addendum-03.md) |
| Requested | Developer, 2026-11-22, during Step 27: "lets have lighthouse target in project"                                       |
| Finding   | RF-037 (extension)                                                                                                    |

## Change

A repeatable `web-explorer:lighthouse` Nx target replaces the ad-hoc Lighthouse commands of Steps 2, 24 and 26.

## Steps

### Step 31 — Web Explorer: `lighthouse` Nx target

Depends on Step 24. Runs after Step 27.

**Changes:**

- `lighthouse@13.4.1` as an exact-pinned `web-explorer` dev dependency. Its Node API and its `chrome-launcher` are used; there is no `yarn dlx`.
- `scripts/serve-preview.mjs` exports `createPreviewServer(root)`, and still listens on its own when run directly.
- `scripts/lighthouse.mjs`:
  1. copies `out/` to `.lighthouse/<base>/` and re-signs it with `post-export.mjs --resign --origin http://localhost:<port>`
  2. serves it in-process with the gzipping Pages emulation
  3. launches Playwright's Chromium (`--headless=new --enable-features=WebMCP`)
  4. runs Lighthouse (mobile, simulated throttling) with `performance`, `seo` and `agentic-browsing` on every route in `src/routes.ts`
  5. writes per-route JSON and `summary.json` to `lighthouse-report/`, and prints a table
  - Options: `--routes <comma list>`, `--min-performance <0–100>`.
- Assertions (exit 1 on any) come from a pure `evaluate(lhr, route)`, unit-tested on fixture reports:
  - SEO score 1 on indexable routes. On `noindex` routes, every SEO audit passes except `is-crawlable`.
  - No `agentic-browsing` audit scores 0. `webmcp-registered-tools` lists at least one tool.
  - Performance at or above `--min-performance`, only when that option is given.
- `project.json`: a `lighthouse` target (`dependsOn: build`, not cached).
- `.gitignore`: `apps/web-explorer/lighthouse-report/` and `apps/web-explorer/.lighthouse/`.

**Verification:**

> Run: `yarn nx run web-explorer:test`
> Expected: the `evaluate` cases pass, covering pass, SEO failure, an agentic failure, `noindex` and the performance threshold.
>
> Run: `yarn nx run web-explorer:lighthouse`
> Expected: exit 0. The table covers 17 routes; `summary.json` and 17 JSON reports are written.
>
> Run: the target with `--min-performance 100`
> Expected: exit 1, naming the routes below the threshold.

## Acceptance Criteria changes

New:

- [ ] `AC-32` — `yarn nx run web-explorer:lighthouse` runs Lighthouse on every registry route against a locally re-signed, gzip-served copy of the export with WebMCP enabled. It exits 0 on the current site and exits 1 on an SEO or agent-readiness regression, or below `--min-performance` when given. It writes its reports to the gitignored `lighthouse-report/`.
