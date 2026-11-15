---
purpose: 'Evaluate phase output for DESIGN-20261115-V98J Decision 1: requirements matrix, tradeoffs and recommendation for where the Log Hub server runs; recommends Hybrid with the Nx-wrapped local instance as default'
keywords: [evaluate, log hub, server topology, telemetry, recommendation, WAF, design phase]
---

# DESIGN-20261115-V98J: Log Hub Session Telemetry Integration — Evaluate: Server topology

Viability OQs D1-2, D1-3, D1-4, D1-11 and D2-6 were left open at the Research sign-off by the developer's choice; the affected options are marked conditional below rather than removed.

_Produced by the 🏗 Evaluate phase. This is the judgment artifact for Decision 1. Options come from `01 Research - Server topology.md`; criteria EC1–EC9 come from `00 Frame.md`; the sibling decision is `02 Evaluate - Repo integration footprint and canonical isolation.md`. The WAF assessment is repeated in `design/Report.md`._

## Requirements × Options Matrix

Rows = evaluation criteria from `design/00 Frame.md` plus the Research-derived constraints. Columns = options from `design/01 Research - Server topology.md`.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement                                       | A Developer-only local       | B Per-contributor local, hand-run                          | F Per-contributor local, Nx wrapper                                                                                            | C Hybrid (local default + optional shared) | D Shared internal VM (conditional: D1-2, D1-3, D1-4) | E Cloud-hosted public (conditional: D1-2, D1-4, D1-11) |
| ------------------------------------------------- | ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| EC1 sessions captured in Log Hub                  | ⚠️ developer's sessions only | ✅                                                         | ✅                                                                                                                             | ✅                                         | ✅                                                   | ✅                                                     |
| EC2 developer runs the server locally             | ✅ verbatim                  | ✅                                                         | ✅ `yarn nx run log-hub:serve`                                                                                                 | ✅ default path                            | ❌ no local server                                   | ❌ no local server                                     |
| EC3 join path for contributors                    | ❌ none                      | ✅ run your own                                            | ✅ one Nx command                                                                                                              | ✅ local or shared                         | ⚠️ DataArt network only; externals excluded          | ⚠️ allow-list / tenant gated                           |
| EC3 stay-out path                                 | ✅                           | ✅                                                         | ✅                                                                                                                             | ✅                                         | ✅                                                   | ✅                                                     |
| EC4 canonical harness untouched                   | ✅ no repo files             | ✅ no repo files                                           | ⚠️ Nx project is ordinary app code, not harness; optional `permissions.deny` edit touches `.claude/settings.json` (D1-17 → D2) | ⚠️ as local variant                        | ✅ docs only                                         | ✅ docs only                                           |
| EC5 no credential committed                       | ✅                           | ✅                                                         | ✅ `.local/.env` gitignored                                                                                                    | ✅                                         | ✅                                                   | ✅                                                     |
| EC6 zero-upload fresh clone + disclosure          | ✅                           | ✅ self-disclosure article                                 | ✅ self-disclosure article                                                                                                     | ✅ disclosure on shared path               | ⚠️ multi-person disclosure, employer duties          | ⚠️ multi-person + cross-border                         |
| EC7 reversible and verifiable                     | ✅                           | ⚠️ contributor-managed `$HOME` install, no repo-side check | ✅ `log-hub:stop`/uninstall in one place; pinned version reproducible                                                          | ⚠️ as local variant                        | ⚠️ operator-side                                     | ⚠️ operator-side                                       |
| EC8 tamper surface                                | ✅ no committed URL          | ✅ loopback in docs                                        | ⚠️ committed wrapper script downloads and runs upstream `install.sh` (reviewable; SHA256SUMS mitigates)                        | ⚠️ shared URL in docs later                | ⚠️ internal URL in docs                              | ❌ public URL in docs                                  |
| EC9 yarn/Nx convention + Engineering Guide        | ⚠️ `curl \| sh` into `$HOME` | ⚠️ `curl \| sh` into `$HOME`                               | ✅ `yarn nx run` convention                                                                                                    | ⚠️/✅ as local variant                     | ✅ hook only                                         | ✅ hook only                                           |
| No operator or payer required now                 | ✅                           | ✅                                                         | ✅                                                                                                                             | ✅ shared deferred                         | ❌ unresolved (D1-4)                                 | ❌ unresolved (D1-4, D1-11)                            |
| Works for external contributors (D1-1 assumption) | n/a                          | ✅                                                         | ✅                                                                                                                             | ✅                                         | ❌                                                   | ⚠️                                                     |
| Upstream stance                                   | shipped default              | shipped default                                            | shipped default, scripted                                                                                                      | both documented                            | reference setup                                      | supported, discouraged                                 |

## Tradeoffs

WAF pillars plus Integration Complexity and Vendor Lock-in.

| Dimension              | A Developer-only local    | B Per-contributor local, hand-run                       | F Per-contributor local, Nx wrapper                                                  | C Hybrid (local default + optional shared)         | D Shared internal VM (conditional: D1-2, D1-3, D1-4)                           | E Cloud-hosted public (conditional: D1-2, D1-4, D1-11)                 |
| ---------------------- | ------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Operational Excellence | ✅ nothing to operate     | ⚠️ per-contributor drift, no repo knowledge of versions | ✅ one command each; pinned, reviewed upgrades                                       | ⚠️ two paths to document                           | ⚠️ VM, TLS, backups, admin role                                                | ⚠️ cloud ops + SMTP + proxy rate limits                                |
| Security               | ✅ loopback only          | ✅ loopback only                                        | ⚠️ loopback; `.env` in repo tree; remote script execution unless SHA256SUMS verified | ⚠️ inherits shared target's exposure               | ⚠️ multi-person transcripts readable by operator; no at-rest encryption by app | ❌ internet-exposed; no app ingestion rate limit; upstream discourages |
| Reliability            | ⚠️ one laptop, no backup  | ⚠️ same per machine                                     | ⚠️ same; data dir must survive `git clean`                                           | ⚠️ as local; local data does not merge into shared | ✅ central backup/retention                                                    | ✅ managed Postgres backups                                            |
| Performance Efficiency | ✅ local                  | ✅ local                                                | ✅ local                                                                             | ✅                                                 | ✅ LAN                                                                         | ⚠️ WAN, egress                                                         |
| Cost Optimization      | ✅ zero                   | ✅ zero                                                 | ✅ zero cash; wrapper maintenance                                                    | ✅ zero until shared exists                        | ⚠️ VM + operator time                                                          | ❌ recurring compute, DB, egress, cert, SMTP                           |
| Sustainability         | ✅ runs only when started | ✅                                                      | ✅ `log-hub:stop`                                                                    | ✅                                                 | ⚠️ always-on VM                                                                | ⚠️ always-on cloud                                                     |
| Integration Complexity | ✅ none                   | ✅ docs only                                            | ⚠️ new Nx project + HLD doc + CI exclusion                                           | ⚠️ as local + docs for shared                      | ⚠️ infra outside repo                                                          | ❌ infra + accounts + legal                                            |
| Vendor Lock-in         | ✅ none                   | ✅ none                                                 | ✅ upstream script interface only (`VERSION`, `INSTALL_DIR`)                         | ✅                                                 | ⚠️ DataArt network                                                             | ⚠️ cloud account                                                       |

## Recommendation

**Recommended option: Option C — Hybrid, with Option F (Nx-wrapped per-contributor local instance) as the local default.**

C with F is the only combination that meets EC2 today, gives every contributor including externals a join path (EC3) through the repo's own `yarn nx run` convention (EC9), needs no operator or payer now, and defers the shared-instance question until the open viability answers exist (D1-2 visibility wanted, D1-3 existing DataArt instance, D1-4 operator, D1-11 account). The shared target is added later by editing only the gitignored `log-hub.local.json`, so the repo integration (Decision 2) does not reopen.

Settled details carried from the Research OQs:

| OQ    | Decision                                                                                                                                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1-13 | Release version pinned in the repo, bumped by a reviewed commit, `SHA256SUMS` verified by the wrapper. The hook installer is downloaded from the running server itself, so hook and server versions always match without a separate compatibility check. |
| D1-14 | Compose file and `.env` under the project's gitignored `.local/`; the Postgres data directory outside the repo tree via `LOG_HUB_DATA_DIR`, so `git clean -fdx` cannot delete telemetry history.                                                         |
| D1-6  | Post-turn `claude -p` analysis off by default in the wrapper's hook-install defaults.                                                                                                                                                                    |
| D1-16 | Windows: WSL or Docker Desktop with `sh`; an `install.ps1` branch is a Solution detail.                                                                                                                                                                  |

**Acceptable tradeoffs:** a new Nx project and HLD container doc for dev tooling (Integration Complexity ⚠️); Docker as a documented opt-in-only prerequisite (D1-10); the wrapper is a committed script that runs upstream code, accepted because it is PR-reviewed and verifies release checksums; one-laptop reliability is accepted because the data is self-review telemetry, not a system of record.

**Disqualifying factors:**

- A fails EC3: no join path.
- B meets the ECs but offers no reproducibility and lives outside the `yarn nx run` convention (EC9 ⚠️), with no repo-side way to know which version a contributor runs. F dominates it at the cost of one small project.
- D alone fails EC2 and excludes external contributors. It stays available as C's shared target if D1-2/3/4 resolve.
- E alone fails EC2, is discouraged by upstream, carries recurring cost and an internet exposure with no app-level ingestion rate limit. It stays only as a conditional shared target if a provider account and operator (D1-11, D1-4) are named.

**Falsifiable assumptions:**

1. D1-9: the developer needs the server from one machine only. If not, loopback Mode 1 fails and a shared target must be chosen now.
2. D1-10: Docker is acceptable as an opt-in prerequisite. If not, B/F fall away and only D/E remain.
3. D1-19: `install.sh` works with `INSTALL_DIR` inside a git working tree. If not, the wrapper falls back to a `$HOME`-style `INSTALL_DIR` while keeping the Nx targets.
4. D1-1: external contributors are possible. If every contributor is a DataArt employee on VPN, D becomes a stronger shared default.

**Open questions to resolve before implementation:**

| #            | Question                                                                                      | Owner                             | Impact if unresolved                                                       |
| ------------ | --------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| D1-2         | Cross-developer visibility wanted?                                                            | Developer                         | Decides whether a shared target is ever stood up; local default unaffected |
| D1-3         | Existing DataArt Log Hub instance to join?                                                    | Developer → Log Hub maintainers   | Would replace standing up D                                                |
| D1-4 / D1-11 | Operator, payer, account for a shared target                                                  | Developer, DataArt IT             | Shared target stays undocumented until answered                            |
| D1-19        | `install.sh` with `INSTALL_DIR` inside the repo tree; Compose project-name collision on :5003 | Implementation spike (Efforts.md) | Wrapper layout may change                                                  |
| D1-16        | Windows path                                                                                  | Developer                         | Document as WSL-only or add `install.ps1` branch                           |
| D1-17        | `permissions.deny` for `.local/.env` in `.claude/settings.json`                               | Decision 2                        | NFR-10 exposure of the server `.env` in transcripts                        |

## WAF Assessment (recommended option)

Option C with F as the local default.

| Pillar                 | Rating | Headline                                                                                                                                                                                                                                                                                         |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟡     | One-command lifecycle and pinned upgrades; no signal when the local server is stopped and uploads queue. P2: add `log-hub:status` target and document queue behaviour.                                                                                                                           |
| Security               | 🟡     | Loopback-only Mode 1, API key and `.env` gitignored. P1: wrapper must verify `SHA256SUMS` before running `install.sh` (otherwise a committed `curl \| sh`). P2: `permissions.deny` rule for `.local/**` so a session never uploads the server `.env` (NFR-10); resolved jointly with Decision 2. |
| Reliability            | 🟡     | Single laptop, no backup; forward-only migrations. P2: data dir outside the repo tree via `LOG_HUB_DATA_DIR`; P3: document export/import before pin bumps.                                                                                                                                       |
| Performance Efficiency | 🟢     | Local, single user; no concern.                                                                                                                                                                                                                                                                  |
| Cost Optimization      | 🟢     | Zero cash cost; wrapper maintenance is the only spend.                                                                                                                                                                                                                                           |
| Sustainability         | 🟢     | Container runs only when started; `log-hub:stop` documented. P3: remind in Guide to stop when not in use.                                                                                                                                                                                        |

**P1 items (resolve before implementation):**

1. Wrapper verifies release `SHA256SUMS` before executing `install.sh`.
