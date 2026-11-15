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
current_stage: solution
completed_stages: [context-gathering, ceremony, frame, research, evaluate]
selected_artifacts: []
next_action: 'Solution — select artifacts, Architecture + Design per decision + Stack + Efforts'
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
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution 🔄 · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 28m 54s · Wait to date: 1h 56m 31s (closed 1h 56m 31s + current 0s) · Unclassified: 1s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait       | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------- | ---------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-15T09:39:34.811Z | 2026-11-15T09:42:56.295Z | 3m 21s      | 1s      | 3m 21s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-15T09:42:56.438Z | 2026-11-15T09:44:36.795Z | 1m 40s      | 1s      | 1m 39s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-15T09:44:36.952Z | 2026-11-15T09:52:49.692Z | 8m 13s      | 3m 41s  | 4m 32s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-15T09:52:49.844Z | 2026-11-15T11:56:19.784Z | 2h 3m 30s   | 19m 50s | 1h 43m 40s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (active)             | 2026-11-15T11:56:19.944Z | unavailable              | unavailable | 5m 22s  | 3m 19s     | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s      | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s      | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s      | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s      | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s      | 0s         | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_From Research OQ triage (2026-11-15). Classification confirmed at the Research sign-off; D1-2, D1-3, D1-4, D1-11 and D2-6 remain open and keep the affected options conditional into Evaluate. D1 = Server topology, D2 = Repo integration footprint and canonical isolation._

| #     | Open question                                                                                                                   | V/E | Answer / status                                                                                                                                                                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1-1  | Who are the current and expected contributors; any outside DataArt's network or employment?                                     | (V) | Proposed: public repo, assume external contributors are possible → D (VPN-gated) cannot be the only join path. Developer to confirm.                                                                                                                                                            |
| D1-2  | Is cross-developer visibility (team sharing, analytics, budgets) wanted, or per-person self-review?                             | (V) | Open — developer answer decides whether D/E stay in the matrix at all.                                                                                                                                                                                                                          |
| D1-3  | Does DataArt already run a Log Hub instance this repo's DataArt contributors could join?                                        | (V) | Open — if yes, D collapses to "join existing"; D marked conditional until answered.                                                                                                                                                                                                             |
| D1-4  | For any shared option: who operates and who pays?                                                                               | (V) | Open — D/E marked conditional on a named operator.                                                                                                                                                                                                                                              |
| D1-5  | Disclosure, legal basis, data residency for storing contributors' transcripts (incl. externals) on a shared server.             | (E) | Condition on executing D/E, not on their existence; feeds Evaluate's risk column and the disclosure article.                                                                                                                                                                                    |
| D1-6  | Enable post-turn `claude -p` analysis at all? Spends each developer's budget; model name in tracked `log-hub.json` unvalidated. | (E) | Evaluate decides; default proposal: off in tracked config.                                                                                                                                                                                                                                      |
| D1-7  | Retention: 30-day default acceptable; who sets it per option?                                                                   | (E) | Evaluate / operator.                                                                                                                                                                                                                                                                            |
| D1-8  | May a shared server URL appear in a committed file (Engineering Guide)?                                                         | (E) | Evaluate; same as D2-7.                                                                                                                                                                                                                                                                         |
| D1-9  | Does the developer need the server from more than one of their own machines?                                                    | (V) | Proposed: no, single machine → loopback A/B/F viable. Developer to confirm.                                                                                                                                                                                                                     |
| D1-10 | Is Docker Engine + Compose v2 acceptable as an opt-in contributor prerequisite?                                                 | (V) | Proposed: yes, documented as opt-in only, never required by CI. Developer to confirm.                                                                                                                                                                                                           |
| D1-11 | For E: which provider account; does the AWS MCP in `.mcp.json` imply one?                                                       | (V) | Open — E marked conditional.                                                                                                                                                                                                                                                                    |
| D1-12 | For D/E: SMTP relay and certificate availability?                                                                               | (E) | Operator, implementation.                                                                                                                                                                                                                                                                       |
| D1-13 | For F: pin release version or track `latest`; who bumps; hook/server compatibility?                                             | (E) | Evaluate.                                                                                                                                                                                                                                                                                       |
| D1-14 | For F: install dir and Postgres bind mount inside the project or outside the repo?                                              | (E) | Evaluate.                                                                                                                                                                                                                                                                                       |
| D1-15 | For F: verify `SHA256SUMS` before running `install.sh`?                                                                         | (E) | Evaluate / implementation.                                                                                                                                                                                                                                                                      |
| D1-16 | For F: Windows support path?                                                                                                    | (E) | Developer; implementation.                                                                                                                                                                                                                                                                      |
| D1-17 | For F: does a `permissions.deny` entry in `.claude/settings.json` for the server `.env` conflict with EC4?                      | (E) | Resolved by D2's chosen footprint; carry into Evaluate D2.                                                                                                                                                                                                                                      |
| D1-18 | For F: project name and location; exclusion from `nx affected`/CI.                                                              | (E) | Evaluate; naming at Solution.                                                                                                                                                                                                                                                                   |
| D1-19 | For F: `install.sh` inside a git working tree; Compose project-name collision on port 5003.                                     | (E) | Implementation spike; Efforts.md.                                                                                                                                                                                                                                                               |
| D2-1  | Does `patch harvest` ever propose `.claude/settings.json` keys beyond what canonical declares?                                  | (E) | Decides written rule (A) vs mechanical gate (D); does not remove an option. Dry-run harvest proposed as spike.                                                                                                                                                                                  |
| D2-2  | Does the E2E assert exact settings content?                                                                                     | (E) | Verified: only BOOT-005, launch only. Feeds EC7 check design.                                                                                                                                                                                                                                   |
| D2-3  | Does `claude plugin install --scope local` + path marketplace register and load correctly?                                      | (V) | Partly verified 2026-11-15: installed CLI 2.1.274 exposes `--scope user\|project\|local` on both `plugin install` and `plugin marketplace add`. Path-marketplace behaviour under local scope still untested → B, C and C-style D conditional; scratch-clone test before Evaluate matrix closes. |
| D2-4  | Does `yarn dlx <tarball-url>` work with Yarn 4.9.2?                                                                             | (E) | EC9 resolution path; test once a server is up.                                                                                                                                                                                                                                                  |
| D2-5  | Marketplace hash per origin: does a committed key from upstream origin work for fork contributors?                              | (E) | Fork correctness for A/C; test.                                                                                                                                                                                                                                                                 |
| D2-6  | Is committing ~45 unsigned third-party JS files into a public repo acceptable?                                                  | (V) | Open — developer decision; gates A, C and committed-policy D.                                                                                                                                                                                                                                   |
| D2-7  | Should the public repo expose the team's server URL at all?                                                                     | (E) | Same as D1-8; Evaluate.                                                                                                                                                                                                                                                                         |
| D2-8  | Does hook `upgrade` re-add the project-scope key when absent (B/C)?                                                             | (E) | Friction cost for B/C; test.                                                                                                                                                                                                                                                                    |
| D2-9  | Does `uninstall` leave `enabledPlugins` in `settings.local.json` behind under local scope?                                      | (E) | EC7 for B/C; test.                                                                                                                                                                                                                                                                              |
| D2-10 | Does the agent-e2e fixture run pick up a project-scope plugin and upload fixture sessions under A?                              | (E) | Checked 2026-11-15: `apps/harness-bootstrap-e2e/src/utils/fixture.ts` copies fixtures to the OS tmpdir or to `runs/` inside this repo tree; retained runs sit under the repo's project settings and would see a project-scope plugin. Mitigation is an Evaluate input for A.                    |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-15 — Server topology

_Recommended option: Option C — Hybrid, with Option F (Nx-wrapped per-contributor local instance) as the local default._

| Pillar                 | Rating | Headline                                                                                                                                                                                                                                                                                         |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟡     | One-command lifecycle and pinned upgrades; no signal when the local server is stopped and uploads queue. P2: add `log-hub:status` target and document queue behaviour.                                                                                                                           |
| Security               | 🟡     | Loopback-only Mode 1, API key and `.env` gitignored. P1: wrapper must verify `SHA256SUMS` before running `install.sh` (otherwise a committed `curl \| sh`). P2: `permissions.deny` rule for `.local/**` so a session never uploads the server `.env` (NFR-10); resolved jointly with Decision 2. |
| Reliability            | 🟡     | Single laptop, no backup; forward-only migrations. P2: data dir outside the repo tree via `LOG_HUB_DATA_DIR`; P3: document export/import before pin bumps.                                                                                                                                       |
| Performance Efficiency | 🟢     | Local, single user; no concern.                                                                                                                                                                                                                                                                  |
| Cost Optimization      | 🟢     | Zero cash cost; wrapper maintenance is the only spend.                                                                                                                                                                                                                                           |
| Sustainability         | 🟢     | Container runs only when started; `log-hub:stop` documented. P3: remind in Guide to stop when not in use.                                                                                                                                                                                        |

**P1 items (resolve before implementation):**

- Wrapper verifies release `SHA256SUMS` before executing `install.sh`.

Full elaboration: `design/02 Evaluate - Server topology.md`

### WAF — Evaluate — 2026-11-15 — Repo integration footprint and canonical isolation

_Recommended option: Option D — repo-owned Nx wrapper with CI verify, using Option B's layout (gitignore `.artisyn/`, plugin registered in local scope, nothing Log-Hub-related committed except the wrapper and docs)._

| Pillar                 | Rating | Headline                                                                                                                                                                                                                                                                  |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Install, upgrade, uninstall and verify are one command each; CI runs `verify`. P2: pin the installer behaviours the wrapper relies on in a test (spike D2-3/8/9) so upstream changes fail loudly.                                                                         |
| Security               | 🟢     | Nothing third-party committed; API key and plugin registration per checkout; `verify` greps tracked config. P2: installer tarball is unsigned — document that it is fetched from the contributor's own loopback server, and record the tarball sha256 in the wrapper log. |
| Reliability            | 🟡     | Depends on local-scope path-marketplace behaviour (D2-3). P1: run the scratch-clone spike before implementation and record the fallback (A layout) decision if it fails.                                                                                                  |
| Performance Efficiency | 🟢     | Hooks run only where opted in.                                                                                                                                                                                                                                            |
| Cost Optimization      | 🟢     | Small wrapper shared with Decision 1's project; one CI script.                                                                                                                                                                                                            |
| Sustainability         | 🟢     | Fresh clones run nothing; no wasted local recording.                                                                                                                                                                                                                      |

**P1 items (resolve before implementation):**

- Spike D2-3/8/9 in a scratch clone before implementation; if local-scope registration fails, switch to the A layout with `verify` allowing exactly the two keys plus a written harvest exclusion rule.

Full elaboration: `design/02 Evaluate - Repo integration footprint and canonical isolation.md`

---

## Gate

- Approver: —
- Draft MR: —
- Approved: — _(a date once approved, or `declined`)_
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase    | Notes                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-15 | Frame    | 4 known requirements, 5 proposed requirements accepted; 2 decisions confirmed (Server topology; Repo integration footprint and canonical isolation)                                                                                                                                                                                                                                |
| 2026-11-15 | Research | @architect returned 6 options for Server topology (A developer-only local, B per-contributor local, F Nx-wrapped local, C hybrid, D shared internal VM, E cloud-hosted) and 5 for Repo footprint (A commit all, B gitignore + local scope, C commit marketplace + local scope, D Nx wrapper + CI verify, E personal only); developer confirmed set complete; 29 OQs triaged 9V/20E |
| 2026-11-15 | Evaluate | Recommended C hybrid with F (Nx-wrapped local) as default for Server topology, and D wrapper with B layout for Repo footprint; WAF: 11 🟢 / 4 🟡 / 0 🔴; 2 P1 items (SHA256SUMS verify; local-scope spike)                                                                                                                                                                         |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
