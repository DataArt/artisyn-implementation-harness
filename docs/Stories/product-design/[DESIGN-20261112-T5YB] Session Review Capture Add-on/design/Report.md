---
id: 1512b63f
purpose: Design-lifecycle run record (state, evidence, metrics, WAF, gate) for the Session Review Capture Add-on design
keywords: [design-report, session-review, harness-bootstrap, lifecycle-tracking]
---

# Design Report — DESIGN-20261112-T5YB: Session Review Capture Add-on

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them._

| Field               | Value                                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track               | Product                                                                                                                                                                                                                                |
| Source docs         | `docs/Harness/`                                                                                                                                                                                                                        |
| Dest docs           | `docs/Harness/09 Session Review`                                                                                                                                                                                                       |
| Stories root        | `docs/Stories/product-design/`                                                                                                                                                                                                         |
| Subfolder           | `09 Session Review` (new)                                                                                                                                                                                                              |
| Architect agent     | `@product-architect`                                                                                                                                                                                                                   |
| Implementation note | This repo is the harness's own canonical source, so implementation (canonical package, launch references and scripts, e2e coverage) lands in this repo's own code — offer `/dev` here directly, not in a downstream platform repo. |

Track and subfolder were not auto-approved: the request could be read as either track, and the subfolder is always the developer's choice. Both were asked once and confirmed by the developer on 2026-11-12 (answers: "Product", "New: 09 Session Review").

## State

```yaml
current_stage: review-gate
completed_stages: ['context-gathering', 'ceremony', 'frame', 'research', 'evaluate', 'solution']
selected_artifacts: ['architecture', 'design', 'stack', 'efforts']
next_action: 'Review Gate — open the draft MR for the harness author and record the gate'
context_fingerprint: ''
```

## Evidence

| Source | Read at stage | Relevant decision or constraint | Reference/version |
| ------ | ------------- | ------------------------------- | ----------------- |
| Developer-supplied framing (`session-review-design-framing.md`, session scratchpad) | context-gathering | The ticket content for this local design: problem, EC1–EC13 (all agreed with the developer), three decisions, boundaries and constraints. Frame carries it into `design/00 Frame.md`. | agreed 2026-11-12 |
| `docs/Harness/03 Lifecycles/03 Evolve Lifecycle.md` | context-gathering | Reflect is a manual capture; observations live in the provider's reflections directory and capture never triggers Triage on its own. Session reviews must not create reflections automatically; feeding them to `/evolve triage` is a separate follow-up. | current |
| `docs/Harness/06 Roadmap/01 Harness Roadmap.md` (§4, §5.7) | context-gathering | §4: the improvement loop depends on the team noting friction by hand; cross-project sharing goes through `patch harvest` / `patch apply`. §5.7: extend evidence capture only where a real gap exists, and never copy telemetry manually between artifacts. | current |
| `docs/Harness/02 Quick Start/index.md` | context-gathering | Says launch asks "only what it can't determine from context" and installs skills, agents and guide docs. A question that is always asked (EC2) and a new kind of installed content are exceptions this page has to reflect at Publish. | current |
| `docs/Harness/04 Adoption/00 Adoption Path.md` | context-gathering | Getting Started names "Q1–Q11". A new question key changes that text (doc impact for Publish). | current |
| `docs/Harness/index.md` | context-gathering | The package lives outside `docs/`. The Sections table lists subfolders 00–08, so a new `09 Session Review` needs a row. | current |
| `docs/Harness/08 Security Scan/index.md` | context-gathering | The `harness-bootstrap` package is scanned by the DataArt InfoSec skill/plugin scanner per version (PASS at 3.2.0). Vendored hook scripts and a headless `claude -p` dispatch enter that scan's scope. | current |
| `.canonical-implementation-harness/README.md` | context-gathering | Launch treatments are Copy, Specialize and Derive; launch should be deterministic; harvest/apply rely on recorded baselines; the package is disposable after a verified launch. | read 2026-11-12, pre-design discussion |
| `.canonical-implementation-harness/references/launch/02-launch-questions.md` | context-gathering | Questions Q1–Q11; Q6 selects providers. Keys are stable: add new keys, never renumber. Questions are resolved from evidence first and asked only when missing. | read 2026-11-12, pre-design discussion |
| `.canonical-implementation-harness/references/launch/08-provider-launch.md`, `scripts/plan-provider-launch.mjs` | context-gathering | The planner installs a skill only when it has `TEMPLATE.md` and `INTENT.md`, and only under the provider's skills root. `INTENT.md` is never materialized. Existing non-identical settings become reserved derivations. | read 2026-11-12, pre-design discussion |
| `.canonical-implementation-harness/references/launch/01b-launch-install.md` (Block C) | context-gathering | Settings reconciliation preserves existing hooks, permissions, servers and unrelated keys; the materializer never overwrites an existing config. | read 2026-11-12, pre-design discussion |
| `.canonical-implementation-harness/canonical/manifest.json`, `canonical/settings.json` | context-gathering | The manifest maps skills, agents, instructions, settings and MCP per provider; nothing describes files outside those roots. Canonical Claude settings carry only `env`; no hooks exist in canonical today. | schemaVersion 1 |
| Session Review kit `claude-drop-in/INSTALL.md`, `settings.hooks.json` | context-gathering | Five scripts go directly in `.claude/`, the skill in `.claude/skills/session-review/`, plus SessionStart and SessionEnd hooks (`timeout: 15` required), an `env` block, `.gitattributes` and `.gitignore` lines. Needs Git Bash on Windows and a recent CLI (tested on 2.1.303). Lists the post-install checks. | kit 2.2.5 |
| Session Review kit `claude-drop-in/session-review-lib.js` | context-gathering | The taxonomy path `.claude/skills/session-review/references/user-mistake-taxonomy.md` is hard-coded. `CLAUDE_SESSION_REVIEW=1` is the recursion guard and the only switch that stops a dispatch. | kit 2.2.5 |
| Session Review kit `claude-drop-in/skills/session-review/SKILL.md` | context-gathering | The review vocabulary (UM/AG/RP codes, enums) is closed and the dashboard depends on it, so the skill must stay byte-identical. | kit 2.2.5 |
| Session Review kit `docs/ONBOARDING.md`, `README.md` | context-gathering | The dashboard runs from a kit clone against a per-team instance folder, outside any code repo. Defines when a repo "has the drop-in": `.claude/session-review.js` exists and `.claude/settings.json` registers both hooks; `.claude/.session-review.version` names the release. | kit 2.2.5 |
| Session Review kit `CHANGELOG.md` (2.2.5 entry), `tools/deploy-kit.js` | context-gathering | 2.2.5 left the drop-in's code unchanged and only raised its version file. The kit's own `deploy` command copies the same nine files into repos, so it is a second update channel. | kit 2.2.5 |
| `package.json` (`lint-staged`), `.prettierignore` | context-gathering | Pre-commit runs prettier on `*.md` and eslint on `*.js`. `.prettierignore` records that reformatting deployed harness files causes phantom drift in `patch apply`. | current |
| `apps/harness-bootstrap-e2e/src/agent-runners/run-claude-skill.ts` (flags only) | context-gathering | Live agent e2e spawns real `claude` runs in fixture workspaces; hooks installed there would dispatch reviews. | current |
| `docs/.og/cli.mjs` (graph lookup attempt) | context-gathering | The graph search printed nothing and exited 0 on this Windows checkout: the entry guard compares `import.meta.url` with `file://${process.argv[1]}`, which never matches a Windows path. Fell back to reading `docs/Harness/` directly, as the stage requires. | current |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261112-T5YB (local design ID — no tracker ticket)                                                                                                                          |
| Branch | `docs/design-20261112-t5yb-session-review-capture-add-on`                                                                                                                                                               |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->
Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 1h 9m 0s · Wait to date: 2h 6m 53s (closed 2h 6m 53s + current 0s) · Unclassified: 17m 24s

| Stage | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| context-gathering (completed) | 2026-11-12T01:15:17.594Z | 2026-11-12T01:28:36.708Z | 13m 19s | 33s | 12m 46s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| ceremony (completed) | 2026-11-12T01:28:36.828Z | 2026-11-12T01:29:02.512Z | 26s | 26s | 0s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| frame (completed) | 2026-11-12T01:29:02.634Z | 2026-11-12T01:42:20.609Z | 13m 18s | 4m 4s | 9m 14s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| research (completed) | 2026-11-12T01:42:20.722Z | 2026-11-12T02:29:11.869Z | 46m 51s | 25m 53s | 20m 59s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| evaluate (completed) | 2026-11-12T02:29:11.979Z | 2026-11-12T03:11:31.797Z | 42m 20s | 6m 46s | 35m 34s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| solution (completed) | 2026-11-12T03:11:31.886Z | 2026-11-12T04:38:01.829Z | 1h 26m 30s | 30m 42s | 38m 25s | unavailable | unavailable | from_tracking_start | 1 | 2 |
| review-gate (waiting) | 2026-11-12T04:38:01.927Z | unavailable | unavailable | 38s | 9m 54s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| address-feedback (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| publish (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| completion (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
<!-- design-metrics:end -->

## Assumptions

_From Research OQ triage (2026-11-12). Confirmed by the developer at the Research sign-off; rows marked open are carried to Evaluate. Full wording and context are in the three `design/01 Research - *.md` files._

| # | Decision | Open question | V/E | Answer / status |
| --- | --- | --- | --- | --- |
| OQ1-1 | 1 Packaging and sync | What is "byte-identical" (EC5) measured against — the members of the published zip or the kit commit's blobs — and does the 2.2.5 zip hold LF files and exactly the 11 files? | (E) | Resolved 2026-11-12 (developer, kit owner): EC5 means the unmodified kit content, and comparison ignores line-ending differences. The orchestrator's check of the 2.2.5 zip stands: exactly 11 LF-only files, identical to the kit working tree. |
| OQ1-2 | 1 Packaging and sync | Where is the zip's sha256 durably published? `kit-release.js` only prints it; Options B, D and E pin to it. | (E) | Open — carried to Evaluate |
| OQ1-3 | 1 Packaging and sync | Will the file map and the `.gitattributes`/`.gitignore` lines stay only in `deploy-kit.js` and `INSTALL.md` prose, so that every option holds a harness transcription and needs a change detector on refresh? | (E) | Open — carried to Evaluate |
| OQ1-4 | 1 Packaging and sync | Should a drop-in refresh be deliverable to already-launched projects through `patch prepare/apply`, or only through a new package ZIP? | (V) | Resolved 2026-11-12 (developer): a drop-in refresh must be able to travel in a patch bundle, like everything else in the package. Option E (5) is no longer viable, because it excludes its folder from patching; Option D (4) can travel only as a whole new file per version, never as a diff. To be confirmed by the harness author at the Review Gate. |
| OQ1-5 | 1 Packaging and sync | Does Claude Code discover a `SKILL.md` nested inside the installed package (in a consumer repo, `.claude/skills/harness-bootstrap/**/skills/session-review/SKILL.md`), so that an un-installed or duplicate `session-review` skill would appear? | (E) | Open — to test; affects Options A, B, C and E |
| OQ1-6 | 1 Packaging and sync | How does the InfoSec scanner treat each location (vendored hook scripts under `canonical/`, a top-level `vendor/` tree, a nested zip), and do `SKILL.md`'s `Capabilities`, `External Connections` and the Origin classification change? | (E) | Open — carried to Evaluate |
| OQ1-7 | 1 Packaging and sync | Are the new manifest block and plan-entry flag additive under `schemaVersion: 1` / `schema_version: 1`, or is a bump needed? | (E) | Open — carried to Evaluate |
| OQ1-8 | 1 Packaging and sync | Where does the refresh tooling live, and may it use the network or a subprocess? Repo-level `scripts/` is not shipped; package `scripts/` is shipped and scanned. | (E) | Open — carried to Evaluate |
| OQ1-9 | 1 Packaging and sync | On what platform is the release ZIP built? A Windows build without a `.gitattributes` rule would ship CRLF copies. | (E) | Open — carried to Evaluate |
| OQ1-10 | 1 Packaging and sync | Is the version string treated as opaque in whatever lock or provenance record is chosen? Past drop-in zips are named `1.4`, `2026-10-01`, `2026-10-20`, `2.2.4` and `2.2.5`. | (E) | Open — carried to Evaluate |
| OQ2-1 | 2 Launch flow | Does "always asked" (EC2) mean every launch run, or once per repo with the `confirmed` answer reused from `answers.json` on resume and later runs? | (E) | Accepted as proposed (no objection at the Research sign-off, 2026-11-12): asked in every new launch run; a resumed run reuses the answer already confirmed in that run. |
| OQ2-2 | 2 Launch flow | In a headless launch with no Q12 answer, does task 3 block, or is the add-on skipped as unanswered? | (E) | Accepted as proposed (2026-11-12): it blocks, because EC2 requires an explicit answer; e2e supplies one in the prompt. |
| OQ2-3 | 2 Launch flow | Is a repo "older" when only the version file differs, and is sameness judged by bytes or with line endings normalised, as the kit's deploy does? | (E) | Partly resolved 2026-11-12 (developer, kit owner): sameness is judged on the unmodified kit content with line endings normalised. Whether a repo is "older" when only the version file differs stays open — carried to Evaluate with OQ3-5. |
| OQ2-4 | 2 Launch flow | May a package script write a key-level merge into an existing `.claude/settings.json`, or must existing settings stay an orchestrator-reconciled derivation as Block C and BOOT-005 say? | (V) | Resolved 2026-11-12 (developer): yes — a harness script adds the hook and env keys to an existing `.claude/settings.json` ("go with the script"). Option C (3) stays admissible. The settings merge is to be performed by a script, which Options A (1) and D (4) as described do not do, and Option B (2) does only for a new settings file. The Block C / BOOT-005 rule must be restated as a scoped key-level merge — to be confirmed by the harness author at the Review Gate. |
| OQ2-5 | 2 Launch flow | May package scripts spawn `git` (`check-ignore`, `check-attr`, `ls-files`), given the single-subprocess capability declared in `SKILL.md` and the per-version scan? If not, the git checks are agent-run in every option. | (E) | Open — carried to Evaluate |
| OQ2-6 | 2 Launch flow | Since the nearest settings file wins, does a nested settings file the harness creates carry only the session-review block, or the harness's canonical `env` as well? Are such files harness-installed outputs? | (E) | Open — carried to Evaluate |
| OQ2-7 | 2 Launch flow | For an existing `SessionStart`, is the sweep added as a new group or inside an existing group's `hooks` array? Is an existing registration recognised by script filename, including the older `$CLAUDE_PROJECT_DIR` form? Does an upgrade rewrite an old command or add a missing `timeout`? | (E) | Open — carried to Evaluate |
| OQ2-8 | 2 Launch flow | After reporting a partial install, may launch offer a repair on an explicit yes in the same run, or is it strictly report-only? How are the unnamed sub-states classified? | (E) | Open — EC13 forbids a silent repair; whether an offered repair is allowed is not settled |
| OQ2-9 | 2 Launch flow | For an upgrade "as a set" (EC4), who deletes files a newer kit removed, and are backups taken? The materializer never deletes. | (E) | Open — carried to Evaluate |
| OQ2-10 | 2 Launch flow | Is the timeout check `=== 15` (EC9 wording) or `>= 15` (kit verifier)? Is `eol=lf` part of EC9? Does a failed or unrunnable check block `verified`, or is it recorded as pending? | (E) | Accepted as proposed (2026-11-12): `>= 15`, as the kit's own verifier does. Whether `eol=lf` is part of EC9 and whether a failed check blocks `verified` stay open — carried to Evaluate. |
| OQ2-11 | 2 Launch flow | Does "all five detection cases" in EC12 include the two partial states? Is the runner env guard wanted alongside the prompt answer? Must live fixtures be their own git repo? | (E) | Accepted as proposed (2026-11-12): the five cases are absent, same, newer, unversioned and older; the two partial states (EC13) are covered as well, seven in total. The runner env guard and whether live fixtures must be their own git repo stay open — carried to Evaluate. |
| OQ2-12 | 2 Launch flow | Will the vendored copy sit under `canonical/` (needed by Option A's unchanged materializer) and outside `canonical/skills` (which `fullSelection` enumerates)? | (V) | Narrowed 2026-11-12: Decision 1's OQ1-4 was resolved in favour of content that can travel in a patch bundle, which keeps the vendored copy under `canonical/` (Decision 1 Options A–C). Option A here remains conditional on Decision 1 choosing a location outside `canonical/skills`. |
| OQ2-13 | 2 Launch flow | For EC10, which formatter and hook tools are in the signal list, and may launch edit ignore files without confirmation? | (E) | Open — carried to Evaluate |
| OQ3-1 | 3 Ownership after launch | Must `patch apply` carry the EC3 upgrade offer, or is it enough that launch offers it when run against a repo with an older install? | (V) | Resolved 2026-11-12 (developer): offered at launch and at `patch apply`. Option C (3) is no longer viable. |
| OQ3-2 | 3 Ownership after launch | Is invoking `patch apply` itself the "explicit yes" of EC3, or is a separate confirmation for the add-on required? | (E) | Accepted as proposed (2026-11-12): a separate confirmation for the add-on. |
| OQ3-3 | 3 Ownership after launch | Must the upgrade be offerable from a clone or machine other than the one that ran launch, or after the package was removed? | (V) | Resolved 2026-11-12 (developer): yes — the offer is made from what is found in the repo, regardless of who installed the drop-in, from any clone. See "Effect of the resolutions" in the Decision 3 research file. |
| OQ3-4 | 3 Ownership after launch | Does the `06-patch-state.md` rule "for exact matches, initialize verified baselines" apply to drop-in files? | (E) | Answered through the EC11 reading: no baseline is ever initialised for a drop-in file the harness did not install; the exact-match rule in `06-patch-state.md` needs an exclusion. |
| OQ3-5 | 3 Ownership after launch | When installed and bundled differ only in `.session-review.version`, is the outcome silence, a report, or an offer to update the version file? | (E) | Open — carried to Evaluate |
| OQ3-6 | 3 Ownership after launch | `deploy` has no version comparison, so an instance on an older kit downgrades a harness-upgraded repo. Accepted and documented, or will the kit add a guard? | (E) | Open — carried to Evaluate as a documented limitation unless the kit owner says otherwise |
| OQ3-7 | 3 Ownership after launch | Which bytes does EC5 bind: the bytes written at install, or the working-tree bytes afterwards? Is LF-normalised comparison acceptable beside the contract's "exact local baseline bytes"? May the harness pin the three skill files and the version file to LF? | (V) | Resolved 2026-11-12 (developer, kit owner): EC5 means the unmodified kit content; comparison ignores line-ending differences. Pinning the skill files and the version file to LF is no longer blocking. |
| OQ3-8 | 3 Ownership after launch | Can a kit release change `settings.hooks.json` (hook command, timeout, `env` keys)? If so, is merging those part of "the set" in an EC4 upgrade? | (E) | Open — carried to Evaluate |
| OQ3-9 | 3 Ownership after launch | Is "the set" defined by the bundled release's file list, and what happens to a file a newer release drops? | (E) | Open — carried to Evaluate |
| OQ3-10 | 3 Ownership after launch | Does the harness ever remove the drop-in? | (E) | Accepted as proposed (2026-11-12): never. |
| OQ3-11 | 3 Ownership after launch | Does after-launch classification have to be a script? | (E) | Open — carried to Evaluate |
| OQ3-12 | 3 Ownership after launch | How is a locally edited drop-in file treated on an accepted upgrade: refuse, or overwrite with a backup as the kit does? | (E) | Superseded by OQ3-13. |
| OQ3-13 | 3 Ownership after launch | Under stateless detection an edited older install looks the same as a pristine one. What must the offer do before overwriting: warn and list the differing files, take a backup as the kit does, or check git for uncommitted changes on the nine paths? | (E) | Open — carried to Evaluate |
| OQ3-14 | 3 Ownership after launch | Is a declined offer remembered? If so, where, given that `package:state/launch/answers.json` is local to one machine? Or is it re-asked on every launch and `patch apply`? | (E) | Open — carried to Evaluate |
| OQ3-15 | 3 Ownership after launch | What is the version comparison rule (two-part `1.4` against three-part `2.2.5`), and how is a malformed version file classified? | (E) | Open — carried to Evaluate |
| OQ3-16 | 3 Ownership after launch | When the bundled release has a file the older install lacks, is that "older" (offer) or "partial" (EC13 report)? May an accepted upgrade also add missing hook entries, or is that a repair EC13 forbids? | (E) | Open — carried to Evaluate |
| OQ3-17 | 3 Ownership after launch | Does detection run on every `patch apply`, including one limited to a named scope or to a supplied bundle that does not touch the drop-in? | (E) | Open — carried to Evaluate |
| OQ3-18 | 3 Ownership after launch | Does detection run when Claude is not among the installed providers but a hand-installed drop-in exists in `.claude/`? EC8 says nothing changes for Codex-only or Copilot-only launches; OQ3-3 says who installed does not matter. | (E) | Open — carried to Evaluate |
| OQ3-19 | 3 Ownership after launch | Will the kit publish per-release digests or file lists? Without them the limits listed under Option F stand; Option D's table is the only mechanism identified that removes the first three. | (E) | Open — carried to Evaluate |
| OQ3-20 | 3 Ownership after launch | How is the add-on result recorded when there is no mapping: the `deployment` value in the operation record and in a portable bundle that carries a refreshed vendored copy? | (E) | Open — carried to Evaluate |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-12

_Three decisions, one recommended option each. Full elaboration is in the three `design/02 Evaluate - *.md` files._

**Decision 1, Packaging and sync — recommended option: B (2), manifest-declared add-on with a hash lock and a refresh script.**

| Pillar | Rating | Headline |
| --- | --- | --- |
| Operational Excellence | 🟢 | Scripted refresh with a check in the unit suite; the file list lives in the manifest |
| Security | 🟡 | The lock makes in-harness edits fail a check, but vendored hook scripts and a headless dispatch enter the package's scan scope |
| Reliability | 🟢 | The copy does not depend on file content; the release ZIP needs an LF pin for the payload |
| Performance Efficiency | 🟢 | Nine small files |
| Cost Optimization | 🟡 | Highest build cost of the options; one-time and reusable |
| Sustainability | 🟢 | About 110 KB of text |

**Decision 2, Launch flow — recommended option: C (3), standalone idempotent installer script.**

| Pillar | Rating | Headline |
| --- | --- | --- |
| Operational Excellence | 🟢 | Idempotent, dry-run diff before any write, own receipt, verify step |
| Security | 🟡 | A package script registers hooks in settings and changes an existing harness rule; consent is enforced at the script boundary |
| Reliability | 🟡 | Deterministic and refuses on a changed state; JSON rewrite, dropped files and the Git Bash and CLI prerequisites need rules |
| Performance Efficiency | 🟢 | One script run |
| Cost Optimization | 🟡 | No agent tokens for the install; a yes commits the team to one headless review run per session, on `opus` by default |
| Sustainability | 🟢 | Fewest agent turns per install |

**Decision 3, Ownership after launch — recommended option: F (6), stateless detection with no ownership record.**

| Pillar | Rating | Headline |
| --- | --- | --- |
| Operational Excellence | 🟢 | Nothing to maintain; one routine at launch and at `patch apply` |
| Security | 🟢 | No baseline bytes of hook scripts, no removal path, no write except the explicit offer |
| Reliability | 🟡 | No state to go stale and works from any clone; cannot see an edit on an older install, and version ordering is undefined |
| Performance Efficiency | 🟢 | Comparison of nine small files |
| Cost Optimization | 🟢 | Smallest state-contract change of the six options |
| Sustainability | 🟢 | No stored state |

**P1 items (resolve before implementation):**

- Decision 2: the harness author confirms, at the Review Gate, that a package script may add named keys to an existing `.claude/settings.json` (restating the Block C / BOOT-005 rule).

### Concern scan — Solution — 2026-11-12

_Preliminary concern scan from `interfaces/contract.md`, with where each material concern is addressed._

| Concern | Class | How it is addressed |
| --- | --- | --- |
| Boundaries and ownership | Material | A new kind of package content and a second writer beside the kit's `deploy`: the responsibility table in [`Architecture.md`](../solution/Architecture.md), D13, D19 |
| User and business behaviour | Material | The install question and the offers: D2, D14, [`Design - Launch Flow.md`](<../solution/Design - Launch Flow.md>) |
| Data and state | Material | No new stored state by design; one history entry: D13, D26 |
| Interfaces and compatibility | Material | The manifest block, the script contract, the settings merge and the patch-contract rules: the three Design files |
| Security and privacy | Material | A script registers hooks, and vendored code ships in the package: D8, D23, D29. Reviews are committed and the kit's deterministic secret scrub is open; that is kit-side and is stated to the developer in the `Q12` text (D24) |
| Reliability and recovery | Material | Refusal, digest binding, interrupted writes and verification gating: D7, D12, D16 |
| Performance and capacity | Not applicable | Nine small files; no runtime path in the harness |
| Operations and delivery | Material | The refresh procedure, the release check and e2e: [`Design - Packaging and Sync.md`](<../solution/Design - Packaging and Sync.md>), [`Efforts.md`](../solution/Efforts.md) |
| Cost and licensing | Material | One headless review per session on the chosen model; the copy ships under the harness licence: D4, D24 |
| Compliance and policy | Informational | This public repository answers no (D22) |
| Evolution and migration | Material | Kit releases, upgrade as a set, existing harness projects and coexistence with `deploy`: D15, D16, D19 |

### Review — solution — 2026-11-12 [pillars: all]

_WAF assessment of [`solution/Architecture.md`](../solution/Architecture.md) and the three Design files, by the orchestrator._

| Pillar | Rating | Headline |
| --- | --- | --- |
| Operational Excellence | 🟢 | One script with a dry-run diff and a verify step; the refresh check runs in the unit suite and before release |
| Security | 🟡 | Lock check, fixed targets, path guards and per-write consent bound by a digest; vendored hook code still runs in every session after a yes, and the package scan is pending |
| Reliability | 🟡 | Total classification, digest binding and version-last writes; two facts about Claude Code are unverified and are spikes |
| Performance Efficiency | 🟢 | Nine small files |
| Cost Optimization | 🟡 | A yes commits the team to one headless review per session, on `opus` by default; the question says so |
| Sustainability | 🟢 | No stored state; no agent tokens for the install itself |

**P1 items:**

- The harness author confirms the restated rule for existing settings files (D8) by approving this design at the Review Gate. That approval also covers the other changes to harness rules the design makes: the `git` subprocess (D7), the `addon` deployment value (D6), and the patch grader accepting an `addon` result (D28).

**P2 items:**

- InfoSec re-scan before the release that ships the add-on (D23).
- Run the two spikes before the slices that depend on them ([`Efforts.md`](../solution/Efforts.md), slices 1 and 2).
- An integration test that the settings merge preserves a file's formatting.

### Design quality gate — 2026-11-12

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Every framed requirement and constraint maps to a decision | Pass | EC1 → D1, D2, D7. EC2 → D2. EC3 → D14, D16, D18. EC4 → D16. EC5 → D5. EC6 → D3, D4. EC7 → D20. EC8 → D1, D28. EC9 → D12. EC10 → D10. EC11 → D13, D27. EC12 → D21. EC13 → D14. Constraints: Claude-only D1; fixed paths in [`Stack.md`](../solution/Stack.md); closed vocabulary D5; stable question keys D2; settings preserved D8; formatter drift D3, D10; public repository D22; pinned release and version-only releases D4, D14; security scan D23; Quick Start and Adoption Path in the Publish list. The kit's open secret scrub is kit-side and not applicable to this design; it is surfaced in the `Q12` text (D24) |
| 2 | Every material concern is addressed | Pass | The concern scan above |
| 3 | Decisions, not rationale or placeholders | Pass, with notes | A search found no rationale, rejected option or open question. Two intended exceptions: the Considered Options paragraph the stage asks for; hash values shown as placeholders in two JSON examples, because the refresh script and the add-on script write them. The estimate table was removed from [`Efforts.md`](../solution/Efforts.md) at the developer's decision at sign-off, because `/dev` will implement the slices. D11's nested write is stated as implemented after spike 2 |
| 4 | [`Architecture.md`](../solution/Architecture.md) is the canonical record | Pass, with a limit | 30 decisions; every D-number cited in the five supporting files exists in the register; the orchestrator and `@docs-writer` cross-read the files for contradictions. Limit: `@product-architect` reviewed [`Architecture.md`](../solution/Architecture.md) twice (17 gaps, then 16 resolved with 8 new points). The revisions made after the second pass, and the five supporting files, were not independently re-reviewed, because the two-pass limit was reached |
| 5 | Mermaid diagrams render | Not run | No Mermaid CLI is available in this checkout. Syntax-oriented inspection instead: 10 diagrams across six files; fences balanced; a valid diagram type on each; every class used is defined |
| 6 | Relative links resolve | Pass | 27 relative links checked across the six files; none broken |
| 7 | Result recorded | Pass | This block |

**Result:** pass, with two recorded limits (checks 4 and 5). The developer accepted both at the Solution sign-off on 2026-11-12.

---

## Gate

- Approver: antonioMerkulov (harness author; owner of all paths in `.github/CODEOWNERS`)
- Draft MR: https://github.com/DataArt/artisyn-implementation-harness/pull/18
- Approved: pending
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date       | Phase             | Notes                                                                                                   |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| 2026-11-12 | Context Gathering | Task tracking: native Claude Task tools (TaskCreate/TaskUpdate), tasks #1–#10, one per lifecycle stage. |
| 2026-11-12 | Context Gathering | Signed off by the developer ("good to go"). On the developer's instruction the design branch `docs/design-20261112-t5yb-session-review-capture-add-on` was created off `main` before this stage's commit, so the commit does not land on `fix/windows-invalid-image-filenames`. The orchestrator ran the switch because the developer asked for it directly. |
| 2026-11-12 | Context Gathering | Commit policy for this design: the developer said "run the adds/commits yourself for the rest of this design". The orchestrator runs each stage's `git add`/`git commit` and verifies it in Git; content sign-offs are unchanged, and `git push` stays the developer's. |
| 2026-11-12 | Ceremony          | No tracker ticket (local design ID) — Step 1 tracker transition skipped. Already on the design branch, created off `main` during Context Gathering on the developer's instruction; confirmed with Git. |
| 2026-11-12 | Frame             | 8 known requirements, 5 proposed requirements accepted. Three decisions; the breakdown was confirmed by the developer on the identical table during framing ("leave decisions as is") and not re-asked. One rework before sign-off: the developer found the Problem paragraph and diagram centred on evolve reflections, so both were re-drafted around the operator and usage side; `/evolve` is now one closing sentence. The Mermaid diagram was checked by the developer in their preview, not rendered by the orchestrator. |
| 2026-11-12 | Research          | `@product-architect` returned 15 options across the three decisions: Packaging and Sync 5 (reference-driven canonical payload; manifest add-on with hash lock; existing roots with copy treatment; pinned archive; `vendor/` root), Launch Flow 4 (agent recipe plus probe; plan-native add-on; standalone installer script; kit-owned recipe with harness gates), Ownership After Launch 6 (existing patch baseline; separate unit record; install-once hand-off; release recognition; committed stamp; stateless detection). 43 open questions triaged (6 viability, 37 evaluation-input). The developer resolved the viability questions at sign-off: a refresh must be able to travel in a patch bundle (Packaging E out); the upgrade is offered at launch and at `patch apply`, from what is found in the repo, regardless of who installed it (Ownership C out; a sixth, stateless option was added on that basis); a harness script performs the settings merge ("go with the script"); EC5 means the unmodified kit content with line endings normalised. Two of these change existing harness rules and are flagged for the harness author at the Review Gate. The docs graph CLI printed nothing on this Windows checkout again; the architect read sources directly. The orchestrator opened the 2.2.5 drop-in zip to answer one question (11 LF-only files, identical to the kit tree). No diagram was rendered. Developer confirmed the set and said to proceed to Evaluate. |
| 2026-11-12 | Evaluate          | Step 1b auto-approved: no viability question was open (OQ1-4, OQ2-4, OQ3-1, OQ3-3 and OQ3-7 resolved at the Research sign-off; OQ2-12 resolved by Decision 1's recommended location). Recommended Packaging B (manifest-declared add-on with a hash lock and a refresh script), Launch Flow C (standalone idempotent installer script), Ownership F (stateless detection, no ownership record). WAF: 12 green, 6 amber, no red across the three recommended options; 1 P1 item — the harness author confirms at the Review Gate that a package script may add named keys to an existing `.claude/settings.json`. The three recommendations are interdependent: with the script performing the copy, Packaging B reduces to the manifest declaration, the lock and the refresh script; the research did not describe that combination, so Solution must specify it and the architect review must check it. During sign-off the developer (kit owner) confirmed that teams do not edit the kit's files, only its settings, which confirms Ownership F's first assumption. The matrices are the orchestrator's judgment from the research; no independent review yet. Developer approved ("go"). |
| 2026-11-12 | Solution          | Artifact selection: `architecture` (the package gains a new content kind and a second writer into the target repo), `design` (one file per decision), `stack` (pinned kit release, runtime and subprocess constraints), `efforts` (implementation slices and two spikes). None omitted. Step 1b concern scan found two material points that existing evidence could not settle, both kit behaviour; asked once and answered by the developer (kit owner): (1) when only the version number differs, the harness reports it and offers to update that one file ("Report and offer"); (2) when the kit is already installed and nothing may be done (same, newer, no version file), the install question is not asked; the state is reported and the question recorded as not applicable ("Skip and report"). The remaining open questions from Evaluate are settled in the solution as design decisions: kit-behaviour ones from the kit's own documents and the developer's earlier answers, harness-rule ones as proposals for the harness author at the Review Gate. Two items stay unverified and become spikes in Efforts: whether Claude Code discovers a `SKILL.md` nested in the installed package, and how settings in a subfolder's `.claude/` scope hooks and `env`. |
| 2026-11-12 | Solution          | Selected artifacts written: `Architecture.md` (30 decisions, nine detection classes, three flows), three Design files, `Stack.md`, `Efforts.md` (ten slices, two of them spikes). `@product-architect` reviewed `Architecture.md` twice. Pass 1: 17 gaps (9 structural), all where the add-on met plan → materialize → finalize and the patch contract; the main correction was taking the add-on out of the launch plan. Pass 2: 16 resolved, 8 new points; two needed the developer, who answered (existing harness projects get the kit on explicit request at `patch apply`, with a one-line note otherwise; an install without a version file whose files all equal the payload is offered completion, a deliberate narrowing of EC3). The two-pass limit was reached, so the revisions after pass 2 and the five supporting files were cross-read by the orchestrator and `@docs-writer` only. WAF review (solution): 3 green, 3 amber, no red; 1 P1, resolved by approval at the Review Gate (the restated settings rule D8, with D6, D7 and D28). Quality gate: pass with two recorded limits — no independent review after pass 2, and no Mermaid CLI in this checkout (10 diagrams inspected for syntax, 27 links checked, none broken). The developer accepted both limits at sign-off and chose to drop the estimate table, because `/dev` will implement the slices. Developer approved ("good to go"). |
| 2026-11-12 | Review Gate       | Prerequisites verified: Frame, three Research files, three Evaluate files, `Architecture.md`, three Design files, `Stack.md`, `Efforts.md`. No draft MR existed. The developer named the approver: antonioMerkulov. MR title and body suggested; the developer opens the draft MR and pushes the branch (`git push` is guarded). |
| 2026-11-12 | Review Gate       | The developer pushed the branch and opened the MR: https://github.com/DataArt/artisyn-implementation-harness/pull/18. Gate recorded as pending. The orchestrator could not read the MR's state (the `gh` CLI is not installed on this machine), so its draft status and reviewer request are as the developer set them, unverified. Next: `/design address-feedback DESIGN-20261112-T5YB` once the approver approves or comments. |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
