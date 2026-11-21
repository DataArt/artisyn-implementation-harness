---
id: b987ebb7
type: Guide
title: Log Hub Setup
description: What Log Hub uploads, the consent it requires, and how to run or target a Log Hub server (local init+serve, an already-running local server, or a remote server) before installing the Claude Code hook
tags: [log-hub, session telemetry, claude code hook, opt-in, data disclosure, LOG_HUB_SERVER_URL]
generated: { by: process:okf-migration, at: 2026-11-15T15:03:03Z }
updated: { by: process:okf-migration, at: 2026-11-16T21:31:28Z }
---

# Log Hub Setup

_Opt-in local session telemetry: read this before you run `log-hub:install-hook`._

---

## What Log Hub is

Log Hub is a local server plus a Claude Code hook that captures session telemetry. The server runs only on your own machine (Docker Compose, loopback `127.0.0.1:5003`); the hook registers at local Claude Code scope only. Nothing about Log Hub is committed to this repo.

## What it uploads

If you install the hook, it uploads the following from your Claude Code sessions to your local Log Hub server:

- **full unredacted transcripts, file contents, and command output** — this is not a summary or a filtered log, it is the raw session content
- **git metadata** (remote URL without credentials, `user.name`, branch) and project context
- **OpenTelemetry cost/usage records**

Doing nothing uploads nothing. Read this article in full before running `log-hub:install-hook`.

---

## 1. Prerequisites

| Tool                       | Install                                          |
| -------------------------- | ------------------------------------------------ |
| Docker Engine + Compose v2 | Required only if you opt in — not required in CI |

---

## 2. Run the server

Two steps, run once each, in order:

```bash
yarn nx run log-hub:init    # once: download the pinned release, verify its SHA256SUMS,
                             # scaffold apps/log-hub/.local/.env
yarn nx run log-hub:serve   # every time: docker compose pull + up -d, loopback 127.0.0.1:5003 only
```

The pinned release lives in `apps/log-hub/.env.example`'s `LOG_HUB_VERSION=` line — not a separate `VERSION` file. `init` reads it, downloads `install.sh`, `docker-compose.yml` and `SHA256SUMS`, verifies them, and scaffolds `.local/.env` from `.env.example` (filling only the lines left empty on purpose: `LOG_HUB_DATA_DIR`, `POSTGRES_PASSWORD`, `SESSION_SECRET`). `serve` only brings the already-scaffolded stack up — see `apps/log-hub/src/serve.ts`. Running `serve` before `init` aborts with a message naming `log-hub:init`, not a Docker or missing-file stack trace.

To move to a newer pinned release, bump `LOG_HUB_VERSION` in `.env.example` and run `yarn nx run log-hub:upgrade`.

---

## 3. Install the hook

```bash
yarn nx run log-hub:install-hook
```

Registers the hook plugin and marketplace at **local** Claude Code scope (`.claude/settings.local.json`) only. The committed `.claude/settings.json` is untouched — a fresh clone has no plugin, no hooks, no marketplace.

---

## 4. Defaults

The default config ships with post-turn `claude -p` analysis off. No Anthropic usage is spent by the server without your explicit opt-in.

---

## 5. Server already running

If a Log Hub server on this machine is already up — started by someone else, or by an earlier session of yours — skip `init` and `serve` entirely. Run the hook install directly:

```bash
yarn nx run log-hub:install-hook
```

This already works today, with no code change: `install-hook` only ever talks to whatever server is at the resolved URL (loopback `127.0.0.1:5003` by default), not to the process that started it.

---

## 6. Remote server

By default `install-hook`/`uninstall-hook` target loopback `http://127.0.0.1:5003`. To target a different server, set `LOG_HUB_SERVER_URL` before running either command — read by `resolveServerUrl()` in `apps/log-hub/src/install-hook.ts`:

```bash
LOG_HUB_SERVER_URL=http://log-hub.internal:5003 yarn nx run log-hub:install-hook
```

**WARNING:** Log Hub's Mode 1 (`AUTH_MODE=none`) has no authentication of its own. Pointing `LOG_HUB_SERVER_URL` at a non-loopback server has no built-in access control — the server must already restrict access by some other means (network policy, reverse proxy, VPN) before you point a hook at it. The disclosure prompt shown before every install/upgrade computes this per call and prints the same `WARNING` whenever the target isn't loopback (see `disclosureText()` in `install-hook.ts`) — this article states the same caveat, not a softer one.

---

## Secrets

Secrets live in two gitignored files:

- `.artisyn/config/log-hub.local.json` — the hook's `apiKey`/`serverUrl`
- `apps/log-hub/.local/.env` — the server's compose `.env`

Both paths are covered by `.claude/settings.json`'s `permissions.deny`: `Read(./apps/log-hub/.local/**)` and `Read(./.artisyn/**)`. A Claude Code session never captures either in its own transcript.

---

→ See `Target Architecture (HLD)/v1/Containers/Log Hub.md` for the container's architecture.
→ See `05 Getting Started.md` for daily NX commands.
