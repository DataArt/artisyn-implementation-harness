---
id: 99394f45
purpose: First-time workspace setup and the daily NX commands used to run and check this monorepo
keywords: [getting started, nx, yarn, workspace setup, local dev commands]
---

# Getting Started

_First-time setup and daily commands for the ADLC Discovery Tool monorepo._

---

## Workspace layout

```mermaid
flowchart TB
    classDef app fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef content fill:#7BC67E,stroke:#4A8C4D,color:#fff

    root["@artisyn-harness/root\n(workspace root)"]

    root --> site["web-docs\napps/web-docs"]
    root --> explorer["web-explorer\napps/web-explorer"]
    root --> portal["web-portal\napps/web-portal"]
    root --> docs["docs\ndocs/"]

    class site app
    class explorer app
    class portal app
    class docs content
```

| NX project     | Path                | Stack               | Purpose                                                                    |
| -------------- | ------------------- | ------------------- | -------------------------------------------------------------------------- |
| `web-docs`     | `apps/web-docs`     | VitePress           | Documentation site, served under `/docs/`                                  |
| `web-explorer` | `apps/web-explorer` | React 19 · Vite     | Promotional landing page + Inside the Loop section, served at the root     |
| `web-portal`   | `apps/web-portal`   | Nx composition only | No source — assembles `web-explorer` + `web-docs` into one deployable tree |
| `docs`         | `docs/`             | Markdown            | Content library (implicit dep of `web-docs`)                               |

---

## Prerequisites

| Tool       | Version | Install           |
| ---------- | ------- | ----------------- |
| Node.js    | `>=24`  | `nvm install 24`  |
| Yarn       | `4.x`   | `corepack enable` |
| GitHub CLI | any     | `brew install gh` |

Authenticate `gh` once installed: `gh auth login`.

---

## First-time setup

```bash
nvm use              # picks up .nvmrc → Node 24
corepack enable      # activates Yarn 4 via packageManager field
yarn install         # installs all workspace deps
```

---

## Run apps

```bash
# Docs site — live reload dev server
yarn nx run web-docs:serve

# Docs site — production build
yarn nx run web-docs:build

# Landing page — live reload dev server
yarn nx run web-explorer:serve

# Landing page — production build
yarn nx run web-explorer:build

# Composed deploy artifact (both apps, root + /docs/) — what CI actually deploys
yarn nx run web-portal:build
```

---

## Code quality

```bash
yarn format             # format all files with Prettier
yarn format:check       # check formatting without writing
yarn lint               # ESLint across the workspace

yarn nx run web-docs:typecheck       # TypeScript check — docs site
```

---

## Claude Code (AI assistant)

This project uses Claude Code with MCP servers for AWS, GitHub, and Atlassian access. Credentials live in `.claude/settings.local.json`'s `env` block (gitignored, per-developer) — fill them in once, then just launch:

```bash
claude
```

Claude Code loads `.claude/settings.local.json` on session start and resolves `.mcp.json`'s `${VAR}` references from it — no `.env` file or shell `source` step needed.

See `06 MCP Setup.md` for the full credentials guide.

---

## Common NX commands

| Command                                              | What it does                               |
| ---------------------------------------------------- | ------------------------------------------ |
| `yarn nx show projects`                              | List all registered projects               |
| `yarn nx graph`                                      | Open interactive dependency graph          |
| `yarn nx run <project>:<target>`                     | Run a target for one project               |
| `yarn nx run <project>:<target> --configuration=dev` | Run with environment config                |
| `yarn nx affected --target=<target>`                 | Run target on projects affected by changes |
| `yarn nx reset`                                      | Clear the local NX computation cache       |

---

→ See `01 Conventions.md` for commit format and branch naming.
→ See `03 Engineer Role.md` for the AI-assisted dev workflow.
→ See `04 AI Coding Tool Compatibility.md` for slash commands and agent roles.
→ See `06 MCP Setup.md` to connect Claude Code to AWS, GitHub, and Atlassian.
