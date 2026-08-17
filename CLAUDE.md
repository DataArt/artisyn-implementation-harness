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

Data flow: Browser → CloudFront (Lambda@Edge auth gate) → S3 (VitePress static build).

See `docs/Target Architecture (HLD)/README.md` for the active version's full design.

### NFRs

See `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md`.

Key constraint: basic auth password protection on all routes.

### Skills

| Skill                 | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `/dev`                | Dev lifecycle orchestrator — Plan → Implement → Test → Document        |
| `/design`             | Design lifecycle orchestrator — Frame → Research → Elaborate → Solution → Review → Address Feedback → Publish |
| `/design-review-gate` | Opens the draft MR and records the approval gate; session pauses for out-of-band human approval |
| `/design-address-feedback` | Only if the approver raises concerns — reiterates into the traced-to phase, then waits for re-approval |
| `/skill-reflect`      | Brain-dump observations after completing a ticket                      |
| `/skill-triage`       | Cluster reflections into patterns worth capturing                      |
| `/skill-new`          | Draft a new skill or rule from a triage cluster                        |
| `/skill-promote`      | Merge a drafted skill into the active skill set                        |
| `/skill-harvest`      | Batch-extract patterns from a session transcript                       |
| `/war`                | Architecture lifecycle router (`design` / `impl` / version)            |
| `/where-we-are`       | Delivery gap report: Designed vs Implemented vs Documented             |
| `/war-design`         | Assess target architecture against AWS Well-Architected Framework      |
| `/war-implementation` | Audit running code against AWS WAF pillars                             |
| `/patch`              | Cross-project patch router (`prepare` / `apply`)                       |

## How

### Slash commands

Orchestrators: `/dev` · `/design` · `/war` · `/where-we-are`

Dev phases: `/dev-plan` → `/dev-implement` → `/dev-test` → `/dev-document`

Design phases: `/design-frame` → `/design-research` → `/design-elaborate` → `/design-solution` (WAF gate: `/design-review`) → `/design-review-gate` → (`/design-address-feedback`) → `/design-publish`

Skill phases: `/skill-reflect` → `/skill-triage` → `/skill-new` → `/skill-promote`

Architecture: `/where-we-are` · `/war design` · `/war impl`

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

### Issue tracker

No external tracker. Internal ticket prefix: `ADLC` (e.g. `ADLC-001`). Story folders live in `docs/Stories/`.
