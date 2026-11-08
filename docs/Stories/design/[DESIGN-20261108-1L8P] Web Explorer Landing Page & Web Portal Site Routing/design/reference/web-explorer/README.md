# Artisyn · Web Explorer

A **React + Vite single-page application** that introduces the Artisyn Implementation Harness through an interactive, _simulated_ lifecycle. Designed as a minimal, developer-focused public showcase inspired by the clean technical storytelling of [Trigger.dev](https://trigger.dev/) — not a copy of their assets or layout.

## Start here

```bash
# Node 24 recommended, Yarn 4 preferred to match the existing Artisyn monorepo
corepack enable
yarn install
yarn dev
```

Open the local address printed by Vite (usually `http://localhost:5173`). To produce a static deployment:

```bash
yarn typecheck
yarn build
# Publish dist/ to any static host
```

> This package is a self-contained starter. If your root Nx/Yarn repo already owns dependency installation, put this folder in `apps/web-explorer`, register it in root workspaces if needed, and run scripts through your repo's normal conventions. See [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

## Included

- Working SPA with hero, interactive `/design`/`/dev` steps, capabilities, operating model, and setup CTA.
- `docs/IMPLEMENTATION_BRIEF.md` — scope, interaction requirements, acceptance criteria, ready-to-use coding-agent instruction.
- `docs/DESIGN_SYSTEM.md` — dark UI, tokens, typography, microinteraction guidelines.
- `docs/TECH_STACK.md` — stack choices and monorepo/deployment guidance.
- `docs/CONTENT_AND_DEMO.md` — source-aligned content and explicit demonstration boundaries.
- `docs/SOURCES.md` — reference links and content provenance.
- `public/brand/artisyn-logo-original.png` — existing logo artwork preserved verbatim.
- `public/brand/artisyn-wordmark-light.png` — cropped light-background wordmark.
- `public/brand/artisyn-mark.svg` and PNG — lightweight dark-compatible symbol inspired by the original logo.
- `public/favicon.svg`, `.ico`, PNG, `apple-touch-icon.png`, and `social-preview.png`.

## Product positioning

**Headline:** AI engineering. Structured by design.

**Value:** Structured lifecycles, architecture awareness, reusable skills, and learning that carries across tasks.

**Audience:** engineering leads, solution architects, AI-assisted developers, contributors, and prospective adopters.

## Configure outbound links

Copy `.env.example` to `.env.local` and replace the repository URL or set an actual docs URL. The default `dataart/artisyn-implementation-harness` link reflects the intended repo naming provided for this package and **has not been confirmed as a publicly accessible GitHub repository**.

## Important boundaries

- **A demo, not runtime integration:** lifecycle steps are illustrative and client-side only. Nothing invokes Claude Code, executes code, reads a live knowledge base, or creates project artifacts.
- **Canonical product information:** the harness repository's `README.md` and `docs/Harness/` remain the source of truth. Confirm lifecycle step wording and gate behavior before publishing.
- **Branding:** the original generated Artisyn logo was reused; new small-format brand assets are derivatives, not an independently approved final visual identity.
- **Scope:** no authentication, backend, database, analytics, CMS, or complex graph editor.
