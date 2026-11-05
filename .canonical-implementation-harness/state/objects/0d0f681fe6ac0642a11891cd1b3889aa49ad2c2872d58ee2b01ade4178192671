# Patch Apply

Canonical → personalization → permanent. Read `06-patch-state.md` first.
Canonical source paths are relative to `canonical/` inside the package — the main
folder patch operations read from or write into for portable content, aside from a
narrow set of `canonical-only` package-internal files (see `06-patch-state.md`).
Bookkeeping aliases `registry.md`, `project-patch/`, and `state/` refer to the
bootstrap package state directory defined in the state contract.
Use `package:state/launch/answers.json` and local reports for project knowns.

## 1 — Select canonical input and inspect

Without a bundle argument, use the current canonical package, limited by any named
scope. Discover new skills, agents, companions, patterns, and guide docs under `canonical/`
from package sources/INTENT, then
extend local mappings for applicable outputs.
Use launch's Q&A/conditionals for applicability; do not deploy archived components.
Detect changed and deleted canonical paths against stored snapshots, including
untracked files. If an unapplied `07-patch-prepare.md` bundle already covers the
requested scope, use it as-is instead of repackaging. Otherwise package unrecorded
direct canonical edits as part of this operation, following `07-patch-prepare.md`'s
Steps 1–2 inline. An unchanged canonical source may still need deployment after
harvest or local drift.

With a bundle argument, read that bundle's manifest and all declared payloads.
Validate identity, schema, hashes, paths, dependencies, and required mappings before
writes. Resolve ambiguous short IDs using the full UUID. Do not depend on the source
repo, its git history, or its current templates. Reconstruct and reconcile each incoming canonical change against the destination's current canonical file using the diff/base procedure in the shared contract. Already equal
is a no-op; differing local edits require a three-way merge or an explicit decision.
A conflicting merge produces a new local resolution bundle linked to the incoming
UUID; never edit the incoming payload or substitute newer local content silently.

Check local operation history and actual file hashes together. A previous applied
row does not excuse new drift; offer harvest/preservation/replacement as appropriate.
Process explicitly selected bundles in dependency order, completing one before the
next. Unmet prerequisites must be supplied or explicitly reconciled before writes.

Resolve this run's provider scope before inspecting any permanent file: take the
installed providers from `canonical/manifest.json`'s destinations and the recorded
answers, confirm each one is actually installed, and limit the run to the providers the
request names. Do not infer the scope from the execution host, and do not treat one
installed provider as the whole scope when another is also installed. Inspect, diff and
record each selected provider's outputs separately — a shared canonical source has one
rendered result per provider, with its own baseline and its own local edits.

Read local Answers (newest populated report, then legacy answers files) and INTENT
substitution tables. Infer clear project values from existing context; ask only for
missing or ambiguous values needed by affected outputs. Do not import source-project
answers. Show the canonical and permanent diffs before writing.

## 2 — Personalize and apply

Render the selected canonical content using this project's substitutions and
conditionals. Compare base rendered output, current permanent content, and incoming
rendered output. Include stored local customizations in the comparison:

- Unchanged permanent file: deploy the new rendered output.
- Identical desired output: skip the write and verify.
- Local edits: preserve nonconflicting customizations; resolve overlapping changes
  by harvest, explicitly retained customization, or authorized replacement. Do not
  silently overwrite modifications to existing template text.
- Missing baseline: use the conservative migration procedure in the shared contract.

Deploy provider by provider, completing and verifying one provider's outputs before
starting the next, so a failure leaves a known boundary rather than a half-written pair.
Resolve each provider's output path through the manifest; never write a rendered result
for one provider to another's destination.

Resolve rename pairs before writes. Compare both the current old and new paths;
write and verify the destination before removing the old path. Copies retain their
source. Confirm unrequested deletions and preserve repurposed files. Shared templates
can affect several outputs; record a separate result for each local mapping.

For `structure` rows, inspect required categories semantically, not exact heading
names. Preserve all project LLD/HLD/NFR prose. Record any agreed missing-category
scaffolding as a local deployment action, never as portable source content.
Root AGENTS.md/CLAUDE.md remain project-maintained: record scoped catalog edits for
new/renamed/retired commands without regenerating the whole file.

Freeze the bundle and pending local operation record before writes. For incoming
patches, write/verify the reconciled canonical state first, then deploy its outputs.
For current-source apply, use the verified result reconstructed from the frozen diff/add payload, not changing live templates.
Install/update required companions with the affected components.
Do not automatically run a newly imported recipe in the middle of this operation;
finish with the contract loaded at its start, and use updated instructions next run.

## 3 — Verify and record

Verify every affected INTENT checklist, references, substitutions/conditionals,
retained customizations, rename destinations, and intended deletions. Distinguish
unresolved deployment placeholders from intentional runtime/template syntax in
companion files. Run only checks available and relevant in this project.

Record canonical and permanent before/after hashes and per-file outcomes locally.
Store new canonical/rendered deployment baselines only for successful outputs;
record retained customizations separately. A harvest receipt matching the newly
deployed content can be retired. Advance canonical checkpoints only for verified
canonical writes. Never mark skipped unresolved items as successfully deployed.

Mark the operation `applied` only after all required canonical writes, deployment,
and verification succeed for **every** provider in the resolved scope. A run that
finished one provider and not another is `partial`, with the unfinished provider's
outputs resumable; record the covered providers rather than implying full coverage.
Otherwise retain `partial` or `failed` and resumable per-file results. Purely package-internal changes can complete with zero permanent
outputs when the manifest explicitly marks them canonical-only.

Report applied/skipped/unresolved items, manifest path, and verification results.
Suggest a Conventional Commit without staging or committing. An already matching
input is a verified no-op; do not manufacture a new change bundle for it.
