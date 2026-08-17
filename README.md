# Contributing

_Local development, repository structure, and onboarding for anyone working in this repo._

## Repository structure

| Path                              | Purpose                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| `docs/Harness/`                   | The harness itself — portable package, plus its own guide             |
| `docs/Target Architecture (HLD)/` | Architecture design for this platform                                 |
| `docs/Engineering Guide/`         | Conventions, AI workflow, and development guide                       |
| `apps/docs-web/`                  | VitePress documentation site                                          |
| `apps/lambda-auth/`               | Lambda@Edge basic auth handler                                        |
| `apps/infra/`                     | AWS CDK infrastructure                                                |
| `raw-artifacts/`                  | Sourcewe documents and reference materials                            |
| `.claude/`                        | Engineering harness — skills, agents, templates                       |
| `scripts/`                        | Deterministic automation — bootstrap, CI, local env/secrets push-pull |

## Local setup

```bash
nvm use              # picks up .nvmrc → Node 24
corepack enable      # activates Yarn 4 via packageManager field
yarn install         # installs all workspace deps
```

Copy the env file, fill in your credentials, then launch Claude Code with MCP servers active:

```bash
cp .env.example .env
# edit .env
source .env && claude
```

→ See `docs/Engineering Guide/05 Getting Started.md` for the full command reference (running apps, code quality, NX commands) and `docs/Engineering Guide/06 MCP Setup.md` for the full credentials guide — or run `@onboarding` inside Claude Code for a guided walkthrough.

## Docs structure

`docs/` follows a three-tier model — architecture decisions (`Target Architecture (HLD)/`), stable conventions (`Engineering Guide/`), and archived work records (`Stories/archive/`) — plus `Harness/`, the harness's own self-description. Each tier has a different update cadence and ownership.

→ See `docs/Engineering Guide/02 Doc Structure.md` for the full tier breakdown and placement guide, and `docs/Engineering Guide/07 Documentation Principles.md` for how to write within each tier.

## Onboarding

New to this repo? Run `@onboarding` inside Claude Code for a conversational, read-only walkthrough — it won't run commands, just orients you.

Once oriented:

→ `docs/Engineering Guide/01 Conventions.md` — commit format, branch naming, and portable conventions
→ `docs/Engineering Guide/03 Engineer Role.md` — the engineer/AI division of labour
→ `docs/Engineering Guide/04 AI Coding Tool Compatibility.md` — how harness concepts map to Claude Code's slash commands and agents

## Primary commands

| Command                    | When to use                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `/design ADLC-XXX <topic>` | Start a new design session (target architecture, recommendations) |
| `/dev ADLC-XXX <task>`     | Implement a ticket (site changes, auth, infra)                    |
| `/where-we-are`            | Delivery gap report                                               |
