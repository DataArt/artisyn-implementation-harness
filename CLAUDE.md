# Artisyn Implementation Harness

## Why

This repo is the canonical source of the Artisyn Implementation Harness — an AI-first engineering lifecycle system (skills, agents, and conventions) that runs this platform's own development and can be bootstrapped into other projects via `.canonical-implementation-harness/` (released as a versioned ZIP under `releases/harness-bootstrap/`, installed with `/harness-bootstrap launch`). The harness tracks design work, engineering decisions, and skill patterns from design through publication.

## What

### Conventions

See `docs/Engineering Guide/01 Conventions.md`.

**Critical — violating either of these is a hard stop:**

- **Guarded commands** — never run directly; present as instructions for the developer: `cdk deploy`, `git push`, `yarn nx run harness-bootstrap-e2e:agent-e2e` (spends real agent budget — the developer starts it)
- **Region** — must never appear hardcoded in source or documentation anywhere; it is deployment configuration only

Commit format: `<type>(<scope>): <what>` (Conventional Commits). Branch format: `<type>/short-description`. Package manager: `yarn` — never `npm` or `npx`.

### Architecture

| Container      | Role                                       | Stack                |
| -------------- | ------------------------------------------ | -------------------- |
| Web Docs       | VitePress documentation site, served under the `/docs/` subpath, built and deployed to GitHub Pages via GitHub Actions | VitePress 1.x · Vite |
| Web Explorer   | Promotional single-page app, served at the GitHub Pages project-site root | React 19 · Vite · react-router-dom |
| Web Portal     | Composition-only Nx project, no application source — assembles Web Explorer's and Web Docs's independently-built static outputs into one deployable artifact tree for GitHub Pages | Nx composition script only |
| Discuss        | Client-side comments widget (giscus, GitHub Discussions-backed); no infra of its own | giscus.app · GitHub Discussions |
| Harness Bootstrap E2E | Test harness validating the `harness-bootstrap` skill — deterministic unit/integration + live agent E2E | Vitest · Nx · TypeScript |

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
| `/harness-bootstrap`  | Harness install and cross-project patch router (`launch` / `patch harvest` / `patch prepare` / `patch apply`) |

## How

### Slash commands

Orchestrators: `/dev` · `/design` · `/evolve` · `/war` · `/where-we-are`

Dev phases: `/dev context` → `/dev ceremony` → `/dev plan` → `/dev implement` → `/dev test` → `/dev document` → `/dev complete`

Design phases: `/design frame` → `/design research` → `/design evaluate` → `/design solution` (WAF gate: `patterns/waf-review.md`) → `/design review-gate` → (`/design address-feedback`) → `/design publish`

Design scope is **two-track**, chosen per session: project-scoped (this repo's own `docs/Target Architecture (HLD)/`) or product-context-scoped (the shared cross-project layer at `docs/Harness/`, reused since this repo also bootstraps the harness into other projects).

Evolve phases: `/evolve reflect` → `/evolve triage` → `/evolve draft` → `/evolve validate` → `/evolve adopt`

Architecture: `/where-we-are` · `/war design` · `/war implementation`

Harness bootstrap: `/harness-bootstrap launch` · `/harness-bootstrap patch harvest` · `/harness-bootstrap patch prepare` · `/harness-bootstrap patch apply`

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
