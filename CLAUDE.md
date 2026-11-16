---
id: 2d5d10cf
---

# Artisyn Implementation Harness

## Why

This repo is the canonical source of the Artisyn Implementation Harness — an AI-first engineering lifecycle system (skills, agents, and conventions) that runs this platform's own development and ships into other projects as the `implementation-harness` skill package (source `skills/implementation-harness/`, released automatically to five channels — npm on GitHub Packages, Release ZIP, plugin marketplace, skills.sh, `gh skill` — and installed with `/implementation-harness launch`; see `docs/Harness/09 Distribution/`). The harness tracks design work, engineering decisions, and skill patterns from design through publication.

## What

### Conventions

See `docs/Engineering Guide/01 Conventions.md`.

**Critical — violating either of these is a hard stop:**

- **Guarded commands** — never run directly; present as instructions for the developer: `cdk deploy`, `git push`, `yarn nx run implementation-harness-e2e:agent-e2e` (spends real agent budget — the developer starts it)
- **Region** — must never appear hardcoded in source or documentation anywhere; it is deployment configuration only

Commit format: `<type>(<scope>): <what>` (Conventional Commits). Branch format: `<type>/short-description`. Package manager: `yarn` — never `npm` or `npx`.

### Architecture

| Container      | Role                                       | Stack                |
| -------------- | ------------------------------------------ | -------------------- |
| Web Docs       | VitePress documentation site, served under the `/docs/` subpath, built and deployed to GitHub Pages via GitHub Actions | VitePress 1.x · Vite |
| Web Explorer   | Promotional single-page app, served at the GitHub Pages project-site root | React 19 · Vite · react-router-dom |
| Web Portal     | Composition-only Nx project, no application source — assembles Web Explorer's and Web Docs's independently-built static outputs into one deployable artifact tree for GitHub Pages | Nx composition script only |
| Discuss        | Client-side comments widget (giscus, GitHub Discussions-backed); no infra of its own | giscus.app · GitHub Discussions |
| Harness Bootstrap E2E | Test harness validating the `implementation-harness` skill package and the release tooling — deterministic unit/integration + live agent E2E | Vitest · Nx · TypeScript |
| Log Hub | Opt-in dev tooling: local Log Hub server (Docker Compose) plus a local-scope Claude Code hook capturing session telemetry; no presence in the deployed site | Docker Compose · TypeScript via `tsx` · Nx |
| Harness Release Pipeline | CI tooling: each PR stamps the harness version (`yarn harness:version`); on push to `main`, `release-harness.yml` tags, publishes and attests it to the five channels | GitHub Actions · Nx Release |

Data flow: Browser → GitHub Pages (static build, deployed by GitHub Actions) — root → Web Explorer, `/docs/` → Web Docs, both composed by Web Portal. Discuss integrates client-side with giscus.app/GitHub Discussions.

See `docs/Target Architecture (HLD)/README.md` for the active version's full design.

### NFRs

See `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md`.

Key constraint: the site is public — no access gate sits in front of any route.

### Skills

| Skill                 | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `/dev`                | Dev lifecycle orchestrator — Context → Ceremony → Plan → Implement → Test → Document → Completion |
| `/design`             | Design lifecycle orchestrator — Frame → Research → Evaluate → Solution → Review Gate → Address Feedback → Publish |
| `/evolve`             | Evolve lifecycle orchestrator — Reflect → Triage → Draft → Validate → Adopt |
| `/war`                | Architecture lifecycle router (`design` / `implementation` / version)  |
| `/where-we-are`       | Delivery gap report: Designed vs Implemented vs Documented             |
| `/x-ray`               | Full-strength, project-aware code review — heavier reviewer pass, typically run by whoever approves the MR |
| `/implementation-harness` | Harness install and cross-project patch router (`launch` / `patch harvest` / `patch prepare` / `patch apply` / `reindex-graph`) |

## How

### Slash commands

Orchestrators: `/dev` · `/design` · `/evolve` · `/war` · `/where-we-are`

Dev phases: `/dev context` → `/dev ceremony` → `/dev plan` → `/dev implement` → `/dev test` → `/dev document` → `/dev complete`

Design phases: `/design frame` → `/design research` → `/design evaluate` → `/design solution` (WAF gate: `patterns/waf-review.md`) → `/design review-gate` → (`/design address-feedback`) → `/design publish`

Design scope is **two-track**, chosen per session: project-scoped (this repo's own `docs/Target Architecture (HLD)/`) or product-context-scoped (the shared cross-project layer at `docs/Harness/`, reused since this repo also bootstraps the harness into other projects).

Evolve phases: `/evolve reflect` → `/evolve triage` → `/evolve draft` → `/evolve validate` → `/evolve adopt`

Architecture: `/where-we-are` · `/war design` · `/war implementation`

Implementation harness: `/implementation-harness launch` · `/implementation-harness patch harvest` · `/implementation-harness patch prepare` · `/implementation-harness patch apply` · `/implementation-harness reindex-graph`

### Work outside a ticket

Code often lands in plain chat with no lifecycle run active (no `/dev` story, no `/design` or `/evolve` session): a component, a fix, a refactor. The code is verified as usual, but nothing updates the permanent docs. So once a logical change is done (not after every edit), spawn `@docs-writer` without asking and have it align the docs with the diff: the container's LLD doc, the app README and any Engineering Guide article that names the changed behaviour. Give it the changed files and the reasoning from the session; it applies the doc principles and terminology itself. Then run `node docs/.og/cli.mjs index --dir . --doc <path>` for each doc it wrote; on failure report one line and continue. The developer reviews the doc changes in the same git diff as the code. Typo, formatting and comment edits need none of this. Never start `/dev document` for this; it needs a story that passed Test.

### Agents

| Agent          | Layer                                      | Tools                               |
| -------------- | ------------------------------------------ | ----------------------------------- |
| `@onboarding`  | All (read-only guide)                      | Read, Glob, Grep                    |
| `@web`         | Web Docs (`apps/web-docs/`, `docs/`)       | Read, Edit, Write, Glob, Grep       |
| `@architect`   | All (reviewer + doc author)                | Read, Glob, Grep, Bash, Write, Edit |
| `@docs-writer` | `docs/` (content authoring)                | Read, Edit, Write, Glob, Grep       |
| `@product-architect` | `docs/Harness/` (product-track governance, read-only) | Read, Glob, Grep |
| `@scrum-master` | Jira only (issue reads/writes/transitions) | Read, `mcp__atlassian__*` |

### Issue tracker

Jira, project `ND`, at `https://support.dataart.com`. All tracker reads/writes go through `@scrum-master` — skills never call Jira MCP tools directly. Story folders live in `docs/Stories/`.

### MCP

Configured in `project:.mcp.json` (variable references only, no literal credentials): `aws-mcp` (AWS account access), `atlassian` (Confluence/Jira lookups), `github` (repo operations). Enable per-session in `.claude/settings.local.json`; set credential env vars locally per `docs/Engineering Guide/06 MCP Setup.md`, then restart the session.
