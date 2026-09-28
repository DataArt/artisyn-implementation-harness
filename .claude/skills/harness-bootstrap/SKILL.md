---
name: harness-bootstrap
metadata:
  version: 2.0.0
description: >
  Install the portable AI-dev harness, harvest project skill improvements into its
  canonical templates, package direct canonical edits into a portable bundle, or
  apply canonical updates to an existing project.
  Use /harness-bootstrap launch or /harness-bootstrap patch harvest|prepare|apply.
---

# Harness bootstrap

[Process guide and diagrams](README.md)

The user request accompanying invocation selects the operation. This folder is the authoritative, portable
harness source. Installed skills, agents, and guide docs are personalized copies.

## Route

Parse command words, not substrings in file paths or bundle names:

- `launch` (or no arguments): follow [Launch](references/launch/01-launch.md), including provider selection and launch-state setup.
- `patch harvest [scope]`: read [Patch Harvest](references/patch/04-patch-harvest.md).
- `patch prepare [scope]`: read [Patch Prepare](references/patch/07-patch-prepare.md).
- `patch apply [scope | bundle path]`: read [Patch Apply](references/patch/05-patch-apply.md).
- `patch` alone: read [Patch router](references/patch/03-patch.md) and ask for the direction.
- Compatibility: `update` means `patch apply`. Explain the replacement once; execute the same recipe.
- Conflicting or unknown operations: ask which operation was intended before writing.

## Shared contract

Read [Patch State](references/patch/06-patch-state.md) for harvest/prepare/apply and when
recording a launch baseline. All three patch operations create manifest records;
packaging and tracking are part of the operation, not additional modes.

Harvest generalizes selected permanent edits into canonical sources, bundling the
result. Prepare packages canonical sources already edited directly — no permanent
file involved — into a bundle, with no personalization and no deployment. Apply
personalizes canonical sources (current, or from a supplied bundle) into permanent
files; with no bundle argument and no prior unapplied `prepare` bundle for the
requested scope, it packages direct canonical edits itself before deploying them.
With a supplied bundle, apply reconciles its frozen canonical payload into this
package first.

Canonical authority does not authorize discarding unharvested local edits.
Use stored baselines to identify conflicts and resolve them before overwriting.
Preserve project substitutions and explicitly retained local customizations.

Launch follows **Q&A → JSON → mjs script → INTENT → verify** in the single launch guide.

## Progress and continuity

**Initialize task tracking before context inspection or Q&A**, immediately after
provider selection and storage setup and report initialization. Create/resume one task per row of the
[Launch task table](references/launch/01-launch.md#launch-task-table); the table owns stage
names, dependencies, and completion evidence. Use the session's exposed native
progress tracker when permitted; otherwise track in the report. Claude Task tools
may support dependencies; a checklist may not, so enforce ordering explicitly.
Record the selected mechanism once. Updating progress does not enter Plan mode.
Reports persist progress across sessions and accompany available native tracking.

For patch operations, create `package:state/launch/reports/<timestamp>-<mode>.md` from
the package report template. Load `package:state/launch/answers.json` and the latest local
report; legacy package reports are a migration fallback. Use the mode's
three progress rows, recording scope, manifest ID, decisions, and per-file outcomes.
Mirror these rows with the tracker selected above; preserve their order in a
progress checklist or report when native Tasks are unavailable. On resume, read the report, selected recipe, and manifest/state first.
Verify current hashes before continuing; never replay completed writes blindly.

Proceed within the user's requested scope. Ask only for missing values, ambiguous
scope/direction, or concrete conflicts and deletions not already authorized.
Show the proposed diff before writes; existing authorization covers clean changes.
Report actual outcomes and suggest a Conventional Commit. Follow the project's
guarded-command rules; do not push, deploy, or commit merely because patching ran.

## Delegation safety

If any stage's work is delegated to subagents rather than performed directly, each
dispatched worker owns a disjoint set of target paths — never two workers materializing
into the same output directory or shared companion file. No delegated worker may itself
invoke the Agent tool to spawn further workers; give it the concrete file list and
recipe instead of asking it to plan and fan out its own sub-delegation. This applies
whether the worker is a fresh agent or a fork (forks inherit the ability to call every
tool the parent has, including Agent, and must be explicitly told not to use it here).
Shared coordination files — the run report, `answers.json`, `registry.md`, plan/manifest
JSON — are written only by the orchestrator, never by a delegated worker, to avoid
concurrent-edit races. Before trusting a delegated worker's completion claim, verify
its actual file writes (`git status`/`git diff`, real hashes) rather than its self-report,
and check for unexpected additional running agents before continuing to the next stage.
Uncontrolled nested delegation has previously raced on shared state and destroyed
project config; these rules prevent that failure mode.
