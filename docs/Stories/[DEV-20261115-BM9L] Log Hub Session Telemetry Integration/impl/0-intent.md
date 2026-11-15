---
purpose: Implementation intent for DEV-20261115-BM9L — building the Log Hub container approved in DESIGN-20261115-V98J
keywords: [log-hub, intent, telemetry, implementation]
---

# DEV-20261115-BM9L — Log Hub Session Telemetry Integration (implementation)

**Ticket:** DEV-20261115-BM9L (local ID; no Jira ticket exists for this repo's own tooling work)
**Date:** 2026-11-15
**Sources:**

- Developer's message: "DESIGN-20261115-V98J ok lets implement this solution in one run"
- Approved design: `docs/Stories/design/approved/[DESIGN-20261115-V98J] Log Hub Session Telemetry Integration/solution/Architecture.md` — **this is the spec.** `Design.md`, `Stack.md` and `Efforts.md` in the same folder are its supporting detail.
- Published docs already updated at design Publish: `docs/Target Architecture (HLD)/v1/Containers/Log Hub.md`, `docs/Target Architecture (HLD)/v1/System Overview.md`, `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md` (NFR-11, NFR-12), `docs/Engineering Guide/07 Log Hub Setup.md`.

## What is the problem?

Nothing in this repo captures what happens inside Claude Code development sessions — prompts, tool calls, cost, permission denials, subagent activity. The design approved a solution; none of it is built yet.

## What does better look like?

A contributor can run `yarn nx run log-hub:serve` to bring up a pinned, checksum-verified local Artisyn Log Hub server, and `yarn nx run log-hub:install-hook` to register the Claude Code hook against it at local scope, without the committed `.claude/settings.json` ever changing. `yarn nx run log-hub:verify` runs in CI and proves that. Done means the nine WBS items in `solution/Efforts.md` are built, the two Reliability/Compatibility spikes (local-scope plugin registration; `install.sh` behaviour inside the repo tree) are run and their results recorded, and the CI `verify` job passes.

## Who and what is affected?

- New HLD container: Log Hub (`apps/log-hub/`), already documented in `Containers/Log Hub.md`.
- `.claude/settings.json` — gains two `permissions.deny` entries (`Read(./apps/log-hub/.local/**)`, `Read(./.artisyn/**)`). No other key changes.
- `.gitignore` — gains `apps/log-hub/.local/` and `.artisyn/`.
- `ci.yml` — gains the `log-hub:verify` job.
- No other container (Web Explorer, Web Docs, Web Portal, Discuss, Harness Bootstrap E2E) is touched.

## What is out of scope?

- Running or hosting a shared/cloud Log Hub instance (Architecture.md Decision 2 — local only, per developer).
- Changing Log Hub itself (the upstream `DataArt/artisyn-log-hub` repo).
- Codex/Copilot providers — the hook is a Claude Code plugin only.
- The committed-layout fallback (Architecture.md Decision 6) — not implemented in this ticket unless the local-scope spike (WBS #3) fails. If it fails, this ticket implements the fallback only after the gating open question (design `Report.md` Assumptions row D2-6 — is committing ~45 unsigned third-party scripts acceptable) is explicitly answered or confirmed moot; if that answer isn't available, the fallback branch is deferred to a follow-up rather than guessed at.

## What are the constraints?

- `solution/Architecture.md`'s Decision register (12 decisions) is the approved spec; `solution/Design.md` names the concrete components and scripts; `solution/Stack.md` names the technology choices; `solution/Efforts.md` has the WBS and sequencing.
- Repo conventions: `yarn` only, never `npm`/`npx` as a package manager (Decision 5/Design.md's `install-hook.mjs` uses a scoped internal fallback only, never exposed to contributors); Node 24 pinned; region never hardcoded (not applicable here, no cloud deploy in scope).
- Public repo — no secrets committed; NFR-11 and the new NFR-12 apply.
- Docker Engine + Compose v2 is a new, opt-in-only contributor prerequisite; must never become a CI dependency except via the Docker-free `verify` target.
- `log-hub` targets are excluded from `nx affected`/CI except `verify` (Decision 10).

## What is still open?

- **Spike WBS #3** (Reliability P1 from Evaluate/Solution WAF): does `claude plugin marketplace add ./.artisyn/marketplace --scope local` + `claude plugin install … --scope local` actually register a path marketplace and fire hooks on the Claude Code CLI version installed here (2.1.274 confirmed present)? This must run early in Implement; its result decides whether `install-hook.mjs` ships the primary layout as designed or needs the fallback (which itself is gated on D2-6, see Out of scope).
- **Spike WBS #7**: does `install.sh` behave correctly with `INSTALL_DIR` inside this git working tree, and is there a Docker Compose project-name collision risk with a hand-run `$HOME/artisyn-log-hub` install on port 5003?
- **Spike WBS #8**: does `yarn dlx <tarball-url>` resolve the hook installer tarball from a running local server? Needs a live server to test (circular with WBS #2 landing first).
- The developer said "implement this solution in one run" — read as: proceed through Plan → Implement → Test → Document → Completion continuously, stopping only at each phase's own sign-off and at guarded commands, not as a request to skip any required stop.
