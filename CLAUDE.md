# Artisyn Harness

## Why

This repo is the canonical source of the Artisyn Harness — an AI-first engineering lifecycle system (skills, agents, and conventions) that runs this platform's own development and can be bootstrapped into other projects via `docs/Harness/package/`. The harness tracks design work, engineering decisions, and skill patterns from design through publication.

## What

### Conventions

See `docs/Engineering Guide/01 Conventions.md`.

**Critical — violating either of these is a hard stop:**

- **Guarded commands** — never run directly; present as instructions for the developer: `cdk deploy`, `yarn nx run infra:provision`, `git push`
- **Region** — must never appear hardcoded in source or documentation anywhere; it is deployment configuration only

Commit format: `<type>(<scope>): <what>` (Conventional Commits). Branch format: `<type>/short-description`. Package manager: `yarn` — never `npm` or `npx`.

### Architecture

| Container      | Role                                       | Stack                |
| -------------- | ------------------------------------------ | -------------------- |
| Web            | VitePress documentation site               | VitePress 1.x · Vite |
| Auth           | Lambda@Edge basic auth password protection | Node.js · TypeScript |
| Infrastructure | CDN, static origin, edge auth wiring       | AWS CDK · TypeScript |
| Discuss        | Client-side comments widget (giscus, GitHub Discussions-backed); no infra of its own | giscus.app · GitHub Discussions |

Data flow: Browser → CloudFront (Lambda@Edge auth gate) → S3 (VitePress static build). Discuss integrates client-side with giscus.app/GitHub Discussions.

See `docs/Target Architecture (HLD)/README.md` for the active version's full design.

### NFRs

See `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md`.

Key constraint: basic auth password protection on all routes.

### Skills

| Skill                 | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `/dev`                | Dev lifecycle orchestrator — Plan → Implement → Test → Document        |
| `/design`             | Design lifecycle orchestrator — Frame → Research → Evaluate → Solution → Review Gate → Address Feedback → Publish |
| `/evolve`             | Evolve lifecycle orchestrator — Reflect → Triage → Draft → Validate → Adopt |
| `/war`                | Architecture lifecycle router (`design` / `implementation` / version)  |
| `/where-we-are`       | Delivery gap report: Designed vs Implemented vs Documented             |
| `/x-ray`               | Full-strength, project-aware code review — heavier reviewer pass, typically run by whoever approves the MR |
| `/patch`              | Cross-project patch router (`prepare` / `apply`)                       |

## How

### Slash commands

Orchestrators: `/dev` · `/design` · `/evolve` · `/war` · `/where-we-are`

Dev phases: `/dev plan` → `/dev implement` → `/dev test` → `/dev document`

Design phases: `/design frame` → `/design research` → `/design evaluate` → `/design solution` (WAF gate: `patterns/waf-review.md`) → `/design review-gate` → (`/design address-feedback`) → `/design publish`

Design scope is **two-track**, chosen per session: project-scoped (this repo's own `docs/Target Architecture (HLD)/`) or product-context-scoped (the shared cross-project layer at `docs/Harness/`, reused since this repo also bootstraps the harness into other projects).

Evolve phases: `/evolve reflect` → `/evolve triage` → `/evolve draft` → `/evolve validate` → `/evolve adopt`

Architecture: `/where-we-are` · `/war design` · `/war implementation`

Patch: `/patch prepare` · `/patch apply`

### Agents

| Agent          | Layer                                      | Tools                               |
| -------------- | ------------------------------------------ | ----------------------------------- |
| `@onboarding`  | All (read-only guide)                      | Read, Glob, Grep                    |
| `@web`         | Web (`apps/docs-web/`, `docs/`)            | Read, Edit, Write, Glob, Grep       |
| `@auth`        | Auth (`apps/lambda-auth/`)                 | Read, Edit, Write, Glob, Grep       |
| `@infra`       | Infrastructure (`apps/infra/`)             | Read, Edit, Write, Glob, Grep       |
| `@architect`   | All (reviewer + doc author)                | Read, Glob, Grep, Bash, Write, Edit |
| `@docs-writer` | `docs/` (content authoring)                | Read, Edit, Write, Glob, Grep       |
| `@product-architect` | `docs/Harness/` (product-track governance, read-only) | Read, Glob, Grep |
| `@scrum-master` | Jira only (issue reads/writes/transitions) | Read, `mcp__atlassian__*` |

### Issue tracker

Jira, project `ND`, at `https://support.dataart.com`. All tracker reads/writes go through `@scrum-master` — skills never call Jira MCP tools directly. Story folders live in `docs/Stories/`.

### MCP

Configured in `project:.mcp.json` (variable references only, no literal credentials): `aws-mcp` (AWS account access), `atlassian` (Confluence/Jira lookups), `github` (repo operations). Enable per-session in `.claude/settings.local.json`; set credential env vars locally per `docs/Engineering Guide/06 MCP Setup.md`, then restart the session.
