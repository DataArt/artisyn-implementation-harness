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
current_stage: frame
completed_stages: ['context-gathering', 'ceremony']
selected_artifacts: []
next_action: 'Frame — write design/00 Frame.md, then sign-off'
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
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->
Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 33s · Wait to date: 12m 46s (closed 12m 46s + current 0s) · Unclassified: 25s

| Stage | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| context-gathering (completed) | 2026-11-12T01:15:17.594Z | 2026-11-12T01:28:36.708Z | 13m 19s | 33s | 12m 46s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| ceremony (active) | 2026-11-12T01:28:36.828Z | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 1 | 0 |
| frame (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| research (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| evaluate (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| solution (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| review-gate (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| address-feedback (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| publish (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
| completion (pending) | unavailable | unavailable | unavailable | 0s | 0s | unavailable | unavailable | from_tracking_start | 0 | 0 |
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

| Date       | Phase             | Notes                                                                                                   |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| 2026-11-12 | Context Gathering | Task tracking: native Claude Task tools (TaskCreate/TaskUpdate), tasks #1–#10, one per lifecycle stage. |
| 2026-11-12 | Context Gathering | Signed off by the developer ("good to go"). On the developer's instruction the design branch `docs/design-20261112-t5yb-session-review-capture-add-on` was created off `main` before this stage's commit, so the commit does not land on `fix/windows-invalid-image-filenames`. The orchestrator ran the switch because the developer asked for it directly. |
| 2026-11-12 | Context Gathering | Commit policy for this design: the developer said "run the adds/commits yourself for the rest of this design". The orchestrator runs each stage's `git add`/`git commit` and verifies it in Git; content sign-offs are unchanged, and `git push` stays the developer's. |
| 2026-11-12 | Ceremony          | No tracker ticket (local design ID) — Step 1 tracker transition skipped. Already on the design branch, created off `main` during Context Gathering on the developer's instruction; confirmed with Git. |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
