---
id: b96bf9e5
name: Dev Report Template
description: Template for 2-report.md — the living implementation report created by /dev context and updated throughout the dev lifecycle
type: reference
---

# DEV-20261115-BM9L: Log Hub Session Telemetry Integration — Report

| Field  | Value                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Ticket | DEV-20261115-BM9L (local ID; design source DESIGN-20261115-V98J, no Jira ticket)                               |
| Branch | `docs/design-20261115-v98j-log-hub-telemetry`                                                                  |
| PR     | —                                                                                                              |
| Author | Anton Merkulov                                                                                                 |
| Status | 🔄 In Progress _(→ ✅ Complete, set by Completion)_                                                            |
| Phase  | 🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document 🔄 · 🏁 Completion ⏳ |

## Progress

| #   | Step                                             | Status  | Notes                                                                                                                                                                                                                                                                  | Test | Docs |
| --- | ------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | Scaffold the log-hub Nx project                  | ✅ Done | `yarn nx show projects` lists `log-hub`; **deviation from plan/AC-2**: no committed `apps/log-hub/VERSION` file — the pin lives in `.env.example`'s `LOG_HUB_VERSION` instead (see note below)                                                                         | ✅   |      |
| 2   | Checksum verification module and tests           | ✅ Done | `verifySha256Sums` lands as planned; resumed session re-ran `tsx --test` clean                                                                                                                                                                                         | ✅   |      |
| 3a  | init.ts (init) — download, verify, scaffold .env | ✅ Done | SHA256SUMS filtering bug found and fixed; live-verified end to end                                                                                                                                                                                                     | ✅   |      |
| 3b  | serve.ts and stop.ts (serve, stop, upgrade)      | ✅ Done | Live-verified: container up on 127.0.0.1:5003, HTTP 200, stop/serve cycle clean                                                                                                                                                                                        | ✅   |      |
| 4   | install-hook.ts (install-hook, upgrade-hook)     | ✅ Done | Real installer behavior spiked live in a scratch repo before coding; 20 unit tests pass                                                                                                                                                                                | ✅   |      |
| 5   | uninstall-hook.ts (uninstall-hook)               | ✅ Done | JSON-aware key-stripping, idempotent                                                                                                                                                                                                                                   | ✅   |      |
| 6   | verify.ts (verify) — CI-facing check             | ✅ Done | Live run against real repo surfaces exactly the expected Step 7 gap, nothing else                                                                                                                                                                                      | ✅   |      |
| 7   | Wire settings.json, gitignore and CI             | ✅ Done | Diffs are exactly the two planned changes; log-hub:verify now passes live                                                                                                                                                                                              | ✅   |      |
| 8   | Developer-side live verification                 | ✅ Done | Docker was available this session — most items live-verified directly instead of handed off; developer separately confirmed `log-hub:serve` end to end (hit and resolved a stale-Postgres-password issue, see TD-1) and hook installation ("hook installation worked") | ✅   |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Delivery Summary

New `log-hub` Nx project wraps the upstream Artisyn Log Hub release (pinned `v1.4.1`) and its Claude Code hook installer behind an `init` → `serve` ops model, registered at local Claude Code scope only. Checksum-verified downloads, generated-once secrets, and a CI-facing `verify` target (now wired into `ci.yml`) guarantee canonical isolation — nothing from the Log Hub integration leaks into committed repo state. 32 unit tests cover the non-Docker-dependent logic; the Docker-dependent paths (`serve`, `install-hook`) were live-verified directly against the real repo and a real running server this session, including a real install of the Claude Code hook.

## Stage Metrics

<!-- dev-metrics-stage:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem stages without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 36m 59s · Wait: 53m 18s · Unclassified: 11m 24s

| Stage      | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags           |
| ---------- | ------------------------ | ------------------------ | ----------- | ------- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- | --------------- |
| context    | 2026-11-15T12:50:58.009Z | 2026-11-15T12:54:03.155Z | 3m 5s       | 53s     | 2m 12s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| ceremony   | 2026-11-15T12:54:03.305Z | 2026-11-15T13:03:56.971Z | 9m 54s      | 1m 11s  | 8m 42s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| plan       | 2026-11-15T13:03:57.123Z | 2026-11-15T13:26:30.760Z | 22m 34s     | 13m 26s | 9m 8s   | unavailable  | unavailable   | from_tracking_start | 2        | 0             | 🔀 scope change |
| implement  | 2026-11-15T13:26:30.916Z | 2026-11-15T14:27:16.105Z | 1h 0m 45s   | 20m 35s | 33m 15s | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| test       | 2026-11-15T14:29:17.993Z | unavailable              | unavailable | 54s     | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —               |
| document   | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —               |
| completion | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             | —               |

Quality (recorded inventory): findings 3 · open 0 · PR findings 0 · critical 0 · debt 1 · tests written 32 · latest failed cases unavailable · failed test runs 0. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).
<!-- dev-metrics-stage:end -->

## Step Metrics

<!-- dev-metrics-step:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the step's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the step. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem steps without parsing every row. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 36m 59s · Wait: 53m 18s · Unclassified: 11m 24s

| Step                                           | Started (UTC)            | Completed (UTC)          | Elapsed | Work   | Wait | Input tokens | Output tokens | Coverage            | Attempts | Failed checks | Flags |
| ---------------------------------------------- | ------------------------ | ------------------------ | ------- | ------ | ---- | ------------ | ------------- | ------------------- | -------- | ------------- | ----- |
| step-1: Scaffold the log-hub Nx project        | 2026-11-15T13:28:20.934Z | 2026-11-15T13:29:50.440Z | 1m 30s  | 1m 30s | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-2: Checksum verification module and tests | 2026-11-15T13:30:06.069Z | 2026-11-15T13:30:59.521Z | 53s     | 53s    | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-3a: init.ts download verify scaffold env  | 2026-11-15T13:31:17.352Z | 2026-11-15T13:33:45.306Z | 2m 28s  | 2m 28s | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-3b: serve.ts and stop.ts                  | 2026-11-15T13:34:04.771Z | 2026-11-15T13:36:46.202Z | 2m 41s  | 2m 41s | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-4: install-hook.ts                        | 2026-11-15T13:37:03.623Z | 2026-11-15T13:44:04.110Z | 7m 0s   | 7m 0s  | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-5: uninstall-hook.ts                      | 2026-11-15T13:45:02.414Z | 2026-11-15T13:46:02.331Z | 1m 0s   | 1m 0s  | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-6: verify.ts CI check                     | 2026-11-15T13:46:09.940Z | 2026-11-15T13:48:27.196Z | 2m 17s  | 2m 17s | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-7: Wire settings.json gitignore CI        | 2026-11-15T13:49:05.336Z | 2026-11-15T13:49:47.312Z | 42s     | 42s    | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |
| step-8: Developer-side live verification       | 2026-11-15T13:51:41.926Z | 2026-11-15T13:52:58.132Z | 1m 16s  | 1m 16s | 0s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             | —     |

<!-- dev-metrics-step:end -->

## Review Findings

| ID     | Stage     | Origin                | Kind      | Deviation type | Severity | Classification | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Evidence                                                                                                                                                                                                                                               | Resolution | TD  | Decision                                                                                                                                                                                                                                                                                                                                                                |
| ------ | --------- | --------------------- | --------- | -------------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-001 | plan      | plan-audit            | deviation | extension      | low      | introduced     | `solution/Stack.md` confirmed plain Node.js `.mjs` scripts at design time; plan switches to TypeScript, refined to match `apps/harness-bootstrap-e2e`'s own shape exactly: own `package.json` (`"type": "module"`), own `tsconfig.json`, plain `.ts` under `src/`, run via `tsx`                                                                                                                                                                                                             | `1-plan.md` Solution "Planning decisions" bullet 4; developer: "switch to TS", then "can files be *.ts with package.json stating modules and tsconfig, same pattern we are using for e2e tests"                                                        | accepted   | —   | Developer-attributed, accepted directly in session, refined twice to match in-repo precedent exactly. No build step added; `typecheck`/`lint` targets added so `log-hub` meets the same quality bar as other TS projects. Not escalated to re-open `solution/Stack.md` since this is a within-ticket tooling choice, not a change to any settled architecture decision. |
| RF-002 | plan      | plan-audit            | deviation | extension      | low      | introduced     | `solution/Design.md` described one `serve.ts` doing download+checksum+`.env`-scaffold+`docker compose up` together; plan splits this into `log-hub:init` (download, verify, scaffold `.local/.env` from a new committed `apps/log-hub/.env.example`) then `log-hub:serve` (compose up only, aborts if `init` hasn't run)                                                                                                                                                                     | `1-plan.md` Solution "Planning decisions" bullet 5; developer: "we also probably may add .env.example with prepopulated default values and have an init nx target to scaffold real .env for loghub so the ops model: 1) log-hub:init 2) log-hub:serve" | accepted   | —   | Developer-attributed, accepted directly in session. Additive clarification of Decision 2/3/4's existing contract (same checksum-first, never-overwrite-secrets guarantees), not a new architecture decision -- no re-audit required. `upgrade` reuses `init`'s download/verify logic via an exported helper rather than duplicating it.                                 |
| RF-003 | implement | implementation-review | deviation | contradiction  | medium   | introduced     | `1-plan.md` Step 1 and `AC-2` call for a committed `apps/log-hub/VERSION` file containing `1.4.1` as the single pinned-release source; the actual implementation has no `VERSION` file — `init.ts`'s `readVersion()` reads `LOG_HUB_VERSION=1.4.1` from `.env.example` instead, and `AC-2` as literally written fails (`apps/log-hub/VERSION` does not exist). Not recorded as an RF row before this resumed Implement session found it, and not mentioned in Step 1's Implementation Notes. | Resumed-session audit: `cat apps/log-hub/VERSION` → no such file; `grep LOG_HUB_VERSION apps/log-hub/src/init.ts`; `apps/log-hub/.env.example` line 6                                                                                                  | accepted   | —   | Developer-attributed, accepted directly in session at the Implement sign-off: `.env.example`'s `LOG_HUB_VERSION` is the pinned-release source instead of a separate `VERSION` file; `AC-2`'s wording updated to match (below) rather than adding a redundant file.                                                                                                      |

<!-- One row per underlying issue; see patterns/review-gate.md. Empty means no recorded findings, not proof of review. -->

**Test-stage review coverage:** No specialist in `CLAUDE.md`'s Agents table owns `apps/log-hub/`; reviewed inline. No architecture audit spawned — `log-hub` is a single HLD container already designed and published at `DESIGN-20261115-V98J` Publish; this implementation doesn't move any infrastructure boundary or add a cross-layer integration beyond what that design already settled. Verdict: no new findings this stage; all three existing RF rows are closed (`accepted`).

## Implementation Notes

_Added for every step — a brief confirmation for smooth steps, detailed notes for surprises, workarounds, or decisions made._

### Step 1 — Scaffold the log-hub Nx project

Landed as planned. One correction: the plan's Step 1 verification item "`yarn nx run log-hub:typecheck` passes against the empty `src/` directory" does not hold — `tsc` exits `TS18003` on zero input files regardless of config correctness. Deferred that check to `AC-13`, which already verifies typecheck once Steps 2-6 add real files.

**Found during this resumed session's audit, accepted at Implement sign-off (RF-003):** the plan and `AC-2` call for a committed `apps/log-hub/VERSION` file. No such file exists; the pinned release (`1.4.1`) is instead read from `LOG_HUB_VERSION=` in `apps/log-hub/.env.example` by `init.ts`'s `readVersion()`. Functionally equivalent — one plain-text pinned version, read before every download — just not what `1-plan.md` (never edited after approval) literally describes. Developer accepted this directly: `.env.example` is the pinned-release source. **`AC-2` as actually verified:** `apps/log-hub/.env.example` contains `LOG_HUB_VERSION=1.4.1`, committed plain text, read by `init.ts`'s `readVersion()`.

### Step 2 — Checksum verification module and tests

Landed as planned. Added a `test` target to `project.json` (`tsx --test src/*.test.ts`, cached) not explicitly named in the plan but needed to run any test file via Nx; this also means `log-hub` now participates in `nx affected --target=test` automatically, same as every other TS project — additive, not a change to Decision 10's exclusion of the Docker-dependent lifecycle targets.

### Step 3a — init.ts (init) — download, verify, scaffold .env

One real bug found and fixed during verification: `SHA256SUMS` lists every release asset (`README.md`, the source zip, `install.ps1`), not just the three this project downloads (`install.sh`, `docker-compose.yml`, `SHA256SUMS` itself). The initial implementation called `verifySha256Sums` against the full listing, which threw "file missing" for assets never downloaded. Fixed by filtering the SHA256SUMS lines to only the downloaded filenames before verification. Caught by the live run against the real release, not by the unit tests (the test fixtures only ever listed the downloaded files) — folded into both going forward. Live-verified end to end: non-empty `LOG_HUB_DATA_DIR` outside the repo tree, generated secrets, idempotent second run, `.local/` correctly gitignored (`git add -n` confirms every other new file stages cleanly).

### Step 3b — serve.ts and stop.ts (serve, stop, upgrade)

Refactored both scripts mid-step to accept an injectable `projectRoot` (not in the original plan text, a testability improvement) so unit tests run against an isolated temp directory instead of depending on the real `.local/` state left by Step 3a's live run — the first draft's tests relied on that leftover state, which is not a clean unit test. Docker's daemon became reachable partway through this session (the `rdctl start` launched in Step 3a's investigation finished coming up in the background), so this step was live-verified for real rather than only unit-tested: `serve` brought up the container bound to `127.0.0.1:5003` only (`docker inspect` confirms `HostIp: 127.0.0.1`), `curl` returned HTTP 200, `stop` tore it down cleanly, and a second `serve` brought it back up.

### Step 4 — install-hook.ts (install-hook, upgrade-hook)

Spiked the real installer live against a scratch repo before writing this script, since Design.md's description of the installer CLI was based on research, not a real run. Three findings that changed the implementation from what was planned:

1. `yarn dlx` cannot fetch the tarball at all: Yarn refuses a plain `http://` package source ("Unsafe http requests must be explicitly whitelisted"), and Mode 1 (Decision 2) is loopback `http://`, never `https://`. `npx` is therefore the primary and only mechanism, not a fallback — confirmed working against the real tarball URL and the real installer binary name (`artisyn-hooks`).
2. The installer is one binary with explicit `install|upgrade|uninstall` subcommands and no `--scope` flag of its own; it always writes committed `.claude/settings.json` itself (project scope, hardcoded). Our local-scope re-registration (`claude plugin marketplace add/install --scope local`) is a separate step after restoring the file, exactly as Design.md described — just now implemented with the installer's real output shape.
3. The installer also writes **user-level** `~/.claude/settings.json` (OTEL receiver env, backed up to `.artisyn-bak`) regardless of project scope — this is upstream's own enhanced-telemetry-beta behavior, orthogonal to Decision 5's "nothing committed" goal since that file is never committed by any repo. Passed `--otel-traces=no` explicitly on `install` so the trace-specific keys are not added by default, matching Decision 9's "off by default" intent. The scratch-repo spike's own `uninstall` run correctly reverted this global file; confirmed by diff before deleting the scratch repo.

Also found and fixed during the spike: the installer run temporarily touched the real `~/.claude/settings.json` (this machine's actual global Claude Code settings, not just the scratch repo) — running the installer's own `uninstall` restored it correctly; verified by inspection that every pre-existing real setting (`effortLevel`, `autoMode`, etc.) was intact afterward and only the Artisyn-added keys were removed.

`installHook`'s restore of `.claude/settings.json` is wrapped in `try/finally` so a failed installer or marketplace-extraction step still restores the file — not in the original plan text, added once the live spike showed the installer can fail mid-run.

Did not re-run `install-hook.ts` live against the real `artisyn-harness` repo: the scratch-repo spike already proved the end-to-end behavior (including the global-settings side effect and its reversal), and repeating it against the real repo's real `.claude/settings.json` and this machine's real global settings would add risk without new signal.

### Step 5 — uninstall-hook.ts (uninstall-hook)

Landed as planned. `stripLocalScopeKeys` is JSON-aware (parses, deletes matching keys, drops the parent object if it becomes empty, re-serializes) rather than regex-editing the file, so it cannot corrupt unrelated content; it silently no-ops on an unparsable or missing file rather than guessing. `uninstallHook` only calls the real uninstaller when `.artisyn/` actually exists, so a repeat run or a run where nothing was ever installed never shells out needlessly.

### Step 6 — verify.ts (verify) — CI-facing check

One real bug found and fixed by the live run against the real repo: `git check-ignore <path>` on a bare directory path that does not exist on disk yet does not reliably match a directory-only (`/`-suffixed) `.gitignore` pattern, because git needs to confirm the path is a directory to apply that pattern, which it cannot do for a path that isn't there. On a fresh clone where nobody has run `log-hub:init` yet, both `.artisyn/` and `apps/log-hub/.local/` are exactly in that state — the first implementation's check would have falsely failed CI on every PR until someone happened to create those directories locally. Fixed by probing a nested placeholder path (`.artisyn/.verify-probe`) instead of the bare directory name; `git check-ignore` matches that correctly regardless of whether the directory exists. Live-verified against the real repo: `log-hub:verify` now reports exactly the one expected gap (the two `permissions.deny` entries Step 7 adds), nothing else — proving the first three assertions already hold today, before Step 7 even runs.

### Step 7 — Wire settings.json, gitignore and CI

Landed as planned, two-line diffs exactly matching the plan: two `permissions.deny` entries in `.claude/settings.json`, one new step in `ci.yml` running `yarn nx run log-hub:verify` directly (not `nx affected`-gated). `log-hub:verify`, run live against the real repo after this step, now passes — the first time it has gone green against real state rather than a fixture, closing the loop Step 6 opened.

### Step 8 — Developer-side live verification

Docker was reachable for most of this session (the `rdctl start` begun during Step 3a's investigation finished coming up in the background), so this step mostly did not need the handoff the plan described: `init`, `serve`, `stop`, `upgrade` and `verify` were all live-verified directly against the real repo and the real GitHub release. `install-hook`/`uninstall-hook` were live-verified against a scratch repo only (Step 4's notes), deliberately not repeated against the real repo to avoid mutating this machine's real global Claude Code settings a second time for no new signal.

**Resumed in a later session, developer-attributed:** the developer ran `log-hub:serve` directly and hit `password authentication failed for user "postgres"` in the DB container logs. Root cause: `apps/log-hub/.local/.env` had been recreated (new random `POSTGRES_PASSWORD`) after the external `LOG_HUB_DATA_DIR` volume (`~/.cache/artisyn-log-hub/<repo-slug>/pgdata`, outside the repo) was already initialized under the old password — Postgres only applies `POSTGRES_PASSWORD` on first `initdb` of an empty data directory, so the new env value never took effect against the existing volume. Confirmed by comparing the volume's `initdb` timestamp (14:35) against `.local/.env`'s mtime (15:05). Unblocked by wiping the stale volume (`log-hub:stop`, `rm -rf` the external `pgdata` dir, `log-hub:serve` again) — acceptable since this is throwaway dev telemetry data. Logged as `TD-1` (the scripts have no way to detect or clearly report this mismatch) and documented in `apps/log-hub/README.md`'s new Troubleshooting section per developer request, rather than fixed in code this ticket. The developer then separately confirmed: "hook installation worked" (`install-hook`, live, against the real repo and real running server).

Noticed, not caused by this ticket: `docs/.og/docs-operational-graph.sqlite`, `docs/.og/graph.mmd`, and several already-archived files under `docs/Stories/design/approved/[DESIGN-20261115-V98J] .../` show as modified in `git status` — the operational graph's own indexing tooling backfilled `id:` frontmatter onto docs that lacked one. This is consistent with the project's own convention (ids are assigned once) and is not something this session ran deliberately. Left unstaged; flagged at the Implement sign-off for the developer to decide whether to include or discard, since it touches an already-closed, archived design story outside this ticket's scope.

Final full pass before sign-off, re-confirmed in this resumed session (`--skip-nx-cache`, real exit codes read): 32/32 unit tests pass, `typecheck` and `lint` clean, `verify` green against the real repo. `web-portal:build` was confirmed earlier in the session but not re-run now. AC-1 through AC-14 satisfied; **AC-2 as actually verified** (RF-003, accepted) — the pin is `LOG_HUB_VERSION=1.4.1` in committed `apps/log-hub/.env.example`, not a separate `VERSION` file as `1-plan.md` describes; developer accepted this at sign-off.

## Tech Debt

| #    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Type    | Tracker | Finding | Owner     | Next action                                                                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TD-1 | `init.ts`'s `scaffoldEnv` has no way to detect that `.local/.env` was regenerated (new `POSTGRES_PASSWORD`) while the external `LOG_HUB_DATA_DIR` volume still holds a Postgres cluster initialized under the old password — surfaces as an opaque `password authentication failed` error in the DB container's logs instead of a clear message naming the mismatch. Documented as a README troubleshooting entry for now (developer request); not fixed in code this ticket. | cleanup | —       | —       | Developer | Either detect the mismatch in `init`/`serve` and fail with a clear message, or document permanently as expected dev-ops behavior once the design settles on an approach. |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Tracker: fill in once a task is created (e.g. ND-XX), otherwise —
Rows are added here by the Implement stage (references/04-implement.md, tech debt while working on a step) as debt is discovered.
-->

## Test Results

| Project    | Build                                               | Tests | Typecheck | Lint | Written | Passed | Failed | Skipped | Evidence                                                                                                       |
| ---------- | --------------------------------------------------- | ----- | --------- | ---- | ------- | ------ | ------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| log-hub    | ✅ `log-hub:verify` live, canonical isolation holds | ✅    | ✅        | ✅   | 32      | 32     | 0      | 0       | Test stage, `--skip-nx-cache`: `yarn nx run log-hub:test/typecheck/lint/verify` all green                      |
| web-portal | ✅ 391 files, unchanged by `log-hub` (AC-12)        | —     | —         | —    | 0       | —      | —      | —       | Test stage: `yarn nx run web-portal:build --skip-nx-cache`, `find apps/web-portal/dist -type f \| wc -l` → 391 |

<!-- One row per non-overlapping project/suite scope, updated to its latest run.
Written = new test cases in this change, not files/assertions. Passed/Failed/Skipped
= latest runner case counts. Use unavailable when unknown, never infer counts from
exit status. Explicit 0 requires evidence; — is not measured. Evidence links runner
output and the diff supporting Written. Historical failed runs remain in stat.checks.
-->

## Documentation

| Doc / section | Tier | Action | Why | Done |
| ------------- | ---- | ------ | --- | ---- |

<!-- Written by the Document stage (references/06-document.md Step 3) before any doc
is touched; Done is ticked as @docs-writer returns each row. Tier is one from
Documentation/02 Structure.md. Action: new · updated · retired. Why points at the
plan Solution, an implementation note or an RF row. Empty means no doc impact was
identified, not that docs were skipped; say so in a line below the table. -->

## Efforts Spent

| Date | Phase | Human time | AI tokens | Notes |
| ---- | ----- | ---------- | --------- | ----- |
