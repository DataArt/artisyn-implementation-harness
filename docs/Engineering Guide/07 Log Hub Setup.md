---
id: b987ebb7
purpose: 'What Log Hub uploads, the consent it requires, and how to opt in to the local Log Hub server and Claude Code hook for session telemetry'
keywords: [log-hub, session telemetry, claude code hook, opt-in, data disclosure]
---

# Log Hub Setup

_Opt-in local session telemetry: read this before you run `log-hub:install-hook`._

---

## What Log Hub is

Log Hub is a local server plus a Claude Code hook that captures session telemetry. The server runs only on your own machine (Docker Compose, loopback `127.0.0.1:5003`); the hook registers at local Claude Code scope only. Nothing about Log Hub is committed to this repo.

## What it uploads

If you install the hook, it uploads **full unredacted transcripts, file contents, and command output** from your Claude Code sessions to your local Log Hub server. This is not a summary or a filtered log — it is the raw session content.

Doing nothing uploads nothing. Read this article in full before running `log-hub:install-hook`.

---

## 1. Prerequisites

| Tool                       | Install                                                    |
| -------------------------- | ---------------------------------------------------------- |
| Docker Engine + Compose v2 | Required only if you opt in — not required for `verify`/CI |

---

## 2. Run the server

```bash
yarn nx run log-hub:serve
```

Downloads the pinned release from `apps/log-hub/VERSION`, verifies its `SHA256SUMS`, and brings it up on loopback `127.0.0.1:5003` only.

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

## Secrets

Secrets live in two gitignored files:

- `.artisyn/config/log-hub.local.json` — the hook's `apiKey`/`serverUrl`
- `apps/log-hub/.local/.env` — the server's compose `.env`

Both paths are covered by `.claude/settings.json`'s `permissions.deny`: `Read(./apps/log-hub/.local/**)` and `Read(./.artisyn/**)`. A Claude Code session never captures either in its own transcript.

---

→ See `Target Architecture (HLD)/v1/Containers/Log Hub.md` for the container's architecture.
→ See `05 Getting Started.md` for daily NX commands.
