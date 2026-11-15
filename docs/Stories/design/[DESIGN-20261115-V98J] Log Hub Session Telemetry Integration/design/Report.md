---
name: Design Report Template
description: Template for design/Report.md — the living design report, idempotency anchor, and WAF findings store
type: reference
---

# Design Report — DESIGN-20261115-V98J: Log Hub Session Telemetry Integration

## Context

Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them.

**Request (developer's words):** integrate `artisyn-log-hub` (https://github.com/DataArt/artisyn-log-hub) into this repo to capture Claude Code session telemetry. The developer will probably run the server locally; open question is what other contributors do. Hard constraint: the setup must not impact the canonical harness (`.canonical-implementation-harness/`, bootstrapped into other projects).

**Track resolution:** Project — auto-approved. The request names "this repo" and treats the canonical harness as something to keep untouched, so it is this repo's own developer tooling, not cross-project product architecture under `docs/Harness/`.

## State

```yaml
current_stage: frame
completed_stages: [context-gathering, ceremony]
selected_artifacts: []
next_action: 'Frame — write design/00 Frame.md'
context_fingerprint: 'project/v1-containers/log-hub-hook-2.31.1'
```

Update this block whenever a phase starts, completes, or is invalidated. The
`selected_artifacts` values are interface names (`architecture`, `design`, `stack`,
`efforts`) and are the source of truth for downstream review, publish, and resume.

## Evidence

| Source                                                                                              | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                                                                                                                     | Reference/version              |
| --------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `CLAUDE.md`                                                                                         | context-gathering | Canonical harness lives in `.canonical-implementation-harness/`, released as versioned ZIP; guarded commands; `yarn` only, never `npx` as package manager (log-hub installer is an `npx` one-liner — convention tension to resolve)                                                                                                                                                                                                                 | HEAD 9abd705                   |
| `docs/Target Architecture (HLD)/v1/System Overview.md`                                              | context-gathering | Containers table; Harness Bootstrap E2E is precedent for a dev/CI-tooling container with no presence in the deployed site; principle "no runtime compute we operate" applies to the public site only                                                                                                                                                                                                                                                | v1                             |
| `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md`                         | context-gathering | NFR-11 (P1): no secrets committed, Gitleaks CI gate already modelled on `DataArt/artisyn-log-hub`'s pattern; NFR-10: platform must not capture tokens in its own logging                                                                                                                                                                                                                                                                            | v1                             |
| `docs/Engineering Guide/05 Getting Started.md`, `06 MCP Setup.md`                                   | context-gathering | Existing per-developer config pattern: credentials only in gitignored `.claude/settings.local.json` `env` block — log-hub's `log-hub.local.json` + API key fits the same pattern                                                                                                                                                                                                                                                                    | current                        |
| `.claude/settings.json`, `.gitignore`                                                               | context-gathering | Committed settings already carry a `hooks.PostToolUse` entry and permission deny list; `.claude/settings.local.json` is gitignored; no `.artisyn/` entries yet                                                                                                                                                                                                                                                                                      | HEAD                           |
| `.canonical-implementation-harness/canonical/{settings.json,manifest.json}`                         | context-gathering | Canonical settings is a provider-neutral `{claude.env, codex, copilot}` document rendered into `.claude/settings.json` at launch; manifest maps `settings` → `.claude/settings.json`. Patch harvest / launch treat that file as a derivation, so any log-hub keys landing in it are at risk of being harvested or clobbered — the central "don't impact canonical" risk                                                                             | 3.5.0                          |
| `.claude/skills/harness-bootstrap/references/launch/01b-launch-install.md`, `08-provider-launch.md` | context-gathering | Existing non-identical settings files become "reserved derivations" preserved until reconciled; "local settings are ignored" at graph verify                                                                                                                                                                                                                                                                                                        | 3.5.0                          |
| `docs/Harness/06 Roadmap/01 Harness Roadmap.md` §5.7                                                | context-gathering | Roadmap item: routine telemetry should not be copied manually between artifacts; design/dev `stat.json` metrics already exist — log-hub is complementary (session-level), not a replacement                                                                                                                                                                                                                                                         | current                        |
| log-hub `README.md`, `user-docs/install-server.md`                                                  | context-gathering | Server = Docker Compose + Postgres via `install.sh`, port 5003, starts in `AUTH_MODE=none` for single-dev local use; docker image runs against any Postgres for VM/cloud; retention default 30 days                                                                                                                                                                                                                                                 | main, 2026-11-15               |
| log-hub `user-docs/small-team-setup.md`, `authentication-modes.md` (via summary)                    | context-gathering | Shared server = one VM behind VPN, HTTPS via nginx, `AUTH_MODE` never `none` when shared; first sign-up becomes admin; each dev installs the hook per repo with their own API key                                                                                                                                                                                                                                                                   | main                           |
| log-hub `hook/INSTALL_HOOK.md` steps 5–9                                                            | context-gathering | Installer writes: `.artisyn/marketplace/` + `.artisyn/config/log-hub.json` (tracked), `.artisyn/config/log-hub.local.json` (gitignored via `.artisyn/config/.gitignore`), merges `enabledPlugins["log-hub-hooks@artisyn-<hash>"]` and `extraKnownMarketplaces["artisyn-<hash>"]` into **committed** `.claude/settings.json`; OTEL env keys go to `~/.claude/settings.json` + gitignored `.claude/settings.local.json`; uninstall surgically reverts | installer 1.0.75+, hook 2.31.1 |
| log-hub `hook/README.md` "What is collected" / "Trust model"                                        | context-gathering | Uploads full unredacted transcripts incl. file contents and command output (secrets included), CLAUDE.md/skills/agents/MCP config, git remote + user.name; without `apiKey`/`serverUrl` it records locally and uploads nothing; "anyone who can commit controls the hook" via tracked `log-hub.json`; server can trigger `claude -p` on the dev's account; employers must inform contributors                                                       | hook 2.31.1                    |
| log-hub `user-docs/data-collection.md`, `trust-model.md`                                            | context-gathering | No per-developer partial opt-out; opt-out = remove key or uninstall; operator owns retention/GDPR                                                                                                                                                                                                                                                                                                                                                   | main                           |
| `node docs/.og/cli.mjs search` (telemetry, logging, observability, hook, metrics)                   | context-gathering | Graph surfaced no existing telemetry/observability design in HLD; hits were Harness roadmap/feature comparison, NFR Intent, lifecycle docs                                                                                                                                                                                                                                                                                                          | graph current                  |

Record every required or relevant context source actually read. Add conflicts and
their resolution here; do not rely on conversation history for design provenance.

| Field               | Value                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Track               | Project                                                                                                                                  |
| Source docs         | `docs/Target Architecture (HLD)/`                                                                                                        |
| Dest docs           | `docs/Target Architecture (HLD)/v1/Containers/` (confirmed at Context Gathering sign-off)                                                |
| Subfolder           | `v1/Containers/` — a new dev-tooling container doc, same shape as `Harness Bootstrap E2E.md`; alternative: `v1/Non-Functional Concerns/` |
| Stories root        | `docs/Stories/design/`                                                                                                                   |
| Architect agent     | `@architect`                                                                                                                             |
| Implementation note | Project design — implemented in this repo; `/dev` here is the expected next step                                                         |
| Tracker             | None — local ID `DESIGN-20261115-V98J`; no Jira record exists                                                                            |
| Task tracking       | Claude Task tools (TaskCreate/TaskUpdate), one task per stage, subjects prefixed `DESIGN-20261115-V98J`                                  |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261115-V98J (local ID, no tracker record)                                                                                                                                  |
| Branch | `docs/design-20261115-v98j-log-hub-telemetry`                                                                                                                                       |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 1s · Wait to date: 4m 12s (closed 4m 12s + current 0s) · Unclassified: 1s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work | Wait   | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ---- | ------ | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-15T09:39:34.811Z | 2026-11-15T09:42:56.295Z | 3m 21s      | 1s   | 3m 21s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (active)             | 2026-11-15T09:42:56.438Z | unavailable              | unavailable | 0s   | 51s    | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (pending)               | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| research (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s   | 0s     | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

---

## Gate

- Approver: —
- Draft MR: —
- Approved: — _(a date once approved, or `declined`)_
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date | Phase | Notes |
| ---- | ----- | ----- |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
