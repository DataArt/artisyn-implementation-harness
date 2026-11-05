# Patch Harvest

Permanent → generalization → canonical. Read `06-patch-state.md` first.
Canonical source paths are relative to `canonical/` inside the package — the main
folder patch operations read from or write into for portable content, aside from a
narrow set of `canonical-only` package-internal files (see `06-patch-state.md`).
Bookkeeping aliases `registry.md`, `project-patch/`, and `state/` refer to the
installed package's `state/` locations defined in the state contract. Use
`package:state/launch/answers.json` and local reports for project knowns.

## 1 — Inspect permanent changes

Resolve the requested scope using `registry.md`, including companions and shared
patterns. For a named unregistered file, inspect it and propose a mapping before
capturing; discovery must include untracked files. Do not sweep unrelated files
into the patch. For new or removed files, record add/delete explicitly; a missing
permanent file alone is not evidence that its shared template should be retired.

For a provider-specific file, record which provider's copy was observed and compare
it against that provider's baseline and harvest receipt. When several providers carry
separate copies of the same canonical source, harvest from one deliberately; other
copies have their own edits and are not assumed identical.

For one physical file shared by providers, such as Claude/Copilot's `.mcp.json`,
follow the shared-output contract in `06-patch-state.md`: inspect it once against
its single baseline, record `provider: "shared"` and its affected `providers`, and
store one harvest receipt. Generalize shared declarations rather than one provider's
native rendering details. Do not manufacture separate observations for the same file.

Compare each permanent file with its stored rendered deployment baseline. Use the
harvest receipt to exclude edits already promoted, but do not advance deployment
baselines. With no baseline, follow the migration rules in `06-patch-state.md`.
Git diffs may help explain changes, but HEAD is not the synchronization checkpoint.

Read the current canonical source and its recorded base as well. If both sides
changed, reconcile their changes; never regenerate a whole template from a stale
permanent file. A structure-only doc row is an interface check: never harvest its
project prose. An intended interface improvement targets the canonical Interface
article explicitly.

## 2 — Generalize and review

For each selected improvement:

- Use `INTENT.md` substitutions and the local report's Answers to reverse project
  values into `{{PLACEHOLDER}}` slots. Generalize project keys, transition IDs,
  service/build names, cloud framework/pillars, and organization URLs where relevant.
  Replace semantic occurrences, not every matching string or number. Quoted messages
  also need generalization if they contain project-specific values.
- Preserve existing placeholders, conditionals, and unrelated canonical edits.
  Update `INTENT.md` when substitution or verification rules change. Include changed
  companions/patterns in the same patch. Verify all affected consumers of a shared
  template; a change from one layer agent must not hard-code that layer for others.
- Separate reusable behavior from project-only customizations. Resolve ambiguous
  generalization and conflicting edits with the developer using a concrete diff.
- Bump changed template versions and the package version according to
  `../../patterns/skill-authoring.md`; update the package changelog.

Show the canonical before/after diff, affected mappings, and any local-only content
excluded. Proceed with clean requested changes; ask for unresolved choices or
unrequested retirements. Do not write personalized values into portable payloads.

## 3 — Record, write, and verify

Before mutating canonical files, write an immutable bundle using the shared schema:
canonical update diffs and full added files, mappings, dependencies, and rationale.
Include any selected direct canonical edits that are needed by the harvest, with
their recorded base; leave unrelated edits out. Register the operation as pending.

Apply the reconciled canonical writes, validate placeholders against INTENT,
relative references, companion coverage, and affected Verify checklists. Compare
written hashes with the planned payloads. Record per-file results and mark harvested
only when all selected writes and checks succeed; otherwise keep partial/failed.

Store a harvest receipt with the observed permanent hash, promoted canonical hash,
and excluded local-only changes for each physical output. A provider-specific
observation belongs to that provider; a shared observation names all affected providers
and uses the shared receipt. The promoted canonical result remains provider-neutral.
Deploying it to separate provider copies is a later `apply`; harvesting a shared file
does not claim that any separate output was deployed. Update canonical checkpoints for
successfully recorded files. Do not rewrite permanent files or claim they were
deployed. If there is no new change, report a no-op without making another bundle.

Report the bundle and harvested changes. The next operation, when wanted, is
`patch apply` here or in a sibling project with the copied bundle. Copying to another
project is outside this command's scope unless separately requested.

Harvest always produces its own bundle from the permanent-file improvement it
promotes — never delegate that packaging step to `07-patch-prepare.md`. Prepare
exists for the opposite starting point: canonical sources edited directly, with no
permanent file to generalize from.
