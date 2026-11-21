---
id: '35005925'
type: Solution Stack
title: 'DESIGN-20261115-V98J: Log Hub Session Telemetry Integration — Stack'
description: Confirmed technology choices for the log-hub container, with compatibility notes
tags: [log-hub, stack, nx, docker, claude-code-plugin, yarn-dlx]
generated: { by: process:okf-migration, at: 2026-11-15T15:03:03Z }
updated: { by: process:okf-migration, at: 2026-11-15T15:03:03Z }
---

# DESIGN-20261115-V98J: Log Hub Session Telemetry Integration — Stack

_Confirmed technology choices for the `log-hub` container defined in `Architecture.md`. Rationale and rejected alternatives are in `design/02 Evaluate - Server topology.md` and `design/02 Evaluate - Repo integration footprint and canonical isolation.md`._

- **Nx `nx:run-commands`** — executor for all `log-hub` targets; no new Nx plugin. Version: whatever this workspace already pins (NX 23.x per `System Overview.md`).
- **Node.js scripts (`.mjs`)** — implementation language for the wrapper, consistent with `.canonical-implementation-harness/scripts/*.mjs`. Requires Node 24 (already pinned, `.nvmrc`).
- **Docker Engine + Compose v2** — new contributor prerequisite, opt-in only; required to run `log-hub:serve`/`stop`/`upgrade`, not required for `verify` or CI.
- **Artisyn Log Hub server** (`DataArt/artisyn-log-hub`) — pinned release version in `apps/log-hub/VERSION`; Docker Compose + bundled Postgres; `AUTH_MODE=none`, port 5003.
- **Artisyn Log Hub hook plugin** — version matches whatever the pinned server's `/static/artisyn-hooks-installer.tgz` serves (hook 2.31.1 as of this design); Claude Code plugin, installed at `--scope local`.
- **`yarn dlx`** (Yarn 4.9.2, already pinned) — preferred invocation for fetching the hook installer tarball; falls back to a scoped `npx` call inside `install-hook.mjs` only if `yarn dlx` cannot resolve the tarball URL (spike, `Efforts.md`), never exposed as a contributor-facing command.
