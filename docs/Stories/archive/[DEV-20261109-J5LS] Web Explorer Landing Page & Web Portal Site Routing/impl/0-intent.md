---
id: b172c78a
purpose: 'Intent for DEV-20261109-J5LS: implement the approved Web Explorer / Web Portal / Web Docs design'
keywords: [intent, web-explorer, web-portal, web-docs]
---

# DEV-20261109-J5LS — Intent

**Sources:** developer's message ("ok, lets now implement all in one dev session") — free-form, no tracker ticket; approved design `docs/Stories/design/approved/[DESIGN-20261108-1L8P] Web Explorer Landing Page & Web Portal Site Routing/solution/Architecture.md` (the spec — see below).

## Problem

The harness has no public-facing promotional experience. The approved design (`DESIGN-20261108-1L8P`) settled this: add a promotional single-page app (Web Explorer) and a build-time composition mechanism (Web Portal) so GitHub Pages serves both it and the renamed docs site (Web Docs) from one deploy. None of that is implemented yet — the design produced only documentation and solution artifacts; no code, config, or CI changes exist.

## What better looks like

`apps/web-explorer` exists in the monorepo, builds, and is served at the GitHub Pages root. `apps/web-docs` (renamed from `apps/docs-web`) is served under `/docs/`. `apps/web-portal` assembles both builds into one artifact and the existing CD pipeline deploys it. Done means: the two sequenced PRs from `solution/Architecture.md` decision 7 are both implemented (or one combined change, if the developer decides to collapse them — see Open questions), the build passes, and the site serves both apps from their stated paths.

## Who and what is affected

- **HLD containers:** Web Explorer (new), Web Portal (new), Web Docs (renamed from Web) — all three documented in `docs/Target Architecture (HLD)/v1/Containers/`.
- **Apps:** `apps/docs-web` → `apps/web-docs` (rename), new `apps/web-explorer`, new `apps/web-portal` (no application source).
- **CI/CD:** `.github/workflows/cd.yml`.
- **Consumers:** anyone visiting the GitHub Pages site — existing bookmarked/indexed `/<repo>/...` doc URLs break once Web Docs moves to `/docs/` (already accepted at design time, no redirect added).

## Out of scope

Per the approved design's own Boundaries: no backend/server runtime, no authentication/analytics/CMS/graph editor in Web Explorer, no real Claude Code integration in Web Explorer (stays a simulated, client-side demo), no change to the Discuss (giscus) container.

## Constraints

The approved design (`solution/Architecture.md`) is the spec — its 7-decision register is binding, not a suggestion. Key ones carried into planning: Web Explorer's TypeScript/Vite ranges must be pinned down to root-compatible majors, not a root-wide TS bump (decision 2, with a stated fallback if that breaks); `apps/web-portal` must declare `implicitDependencies: ["web-explorer", "web-docs"]` alongside the task-ordering `dependsOn` (decision 5, corrected after architect review); NFR-5 (VitePress dead-link check) and NFR-7 (no raw HTML execution) must not regress; this repo's CD pipeline has no staging environment, so changes ship straight to production on the next push to `main`.

## Open questions

- **Exact Vite major for Web Explorer.** `solution/Architecture.md` decision 2 leaves this as an implementation-time spike (tracked as OQ-1 in the design's Evaluate phase) rather than a pinned number. Plan will need to resolve it.

## Resolved during sign-off

- **Single PR, not the design's two-PR sequencing.** The approved design (decision 7) sequences this as two independently revertible PRs specifically to reduce blast radius given there's no staging environment. The developer explicitly chose to collapse this into one PR/commit instead ("implement all in one dev session"). This is a deliberate deviation from the design's rollout-risk mitigation, made with full knowledge of the tradeoff (one deploy now carries both the composition mechanism and the `docs-web`→`web-docs` rename together) — accepted, not re-litigated in Plan.
