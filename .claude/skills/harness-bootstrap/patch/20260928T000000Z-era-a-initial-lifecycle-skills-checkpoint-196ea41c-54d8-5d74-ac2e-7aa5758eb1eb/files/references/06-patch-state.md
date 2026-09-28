# Patch manifests and local state

Harvest, prepare, and apply all use this contract. Canonical payload paths are
relative to `.claude/skills/harness-bootstrap/canonical/` — the package's single
canonical root, holding `agents/`, `docs/`, and `skills/` — with one documented
exception: `canonical-only` entries (the package's own entrypoints, references,
changelog, and report template) are package-internal support files outside
`canonical/`, addressed by their normal package-root-relative path instead (see
"Mappings" below). Permanent paths are relative to the project root.
Launch ignores the toolkit folder in Git. Durable project bookkeeping stays outside it.

Path aliases in the patch recipes: `package-patch/` = canonical package
`.claude/skills/harness-bootstrap/patch/`; `project-patch/` = project `.harness/patch/`,
`state/` = project `.harness/state/`, `registry.md` = project `.harness/registry.md`,
and local reports = project `.harness/launch/reports/`. New writes always use these
locations. Portable package changes are written to `package-patch/`; project execution
bundles and apply/harvest receipts are written to `project-patch/`. Package-local
state/registry/reports are read-only migration fallbacks; preserve them and copy
needed records without merging conflicting IDs.
The package's templates and portable support files are authoritative. Project
Answers, mappings, operation histories, and deployment baselines belong to this repo.

## Portable bundle

Store each portable bundle at `package-patch/<UTC timestamp>-<slug>-<uuid>/`. Use a full UUID as its
identity; timestamps, slugs, and numeric IDs alone can collide between projects.
A bundle contains `manifest.json`, `diffs/` for updates, and `files/` for additions.
**Updated files carry unified diffs only, never full before/after files in the patch
folder.** Diffs describe canonical, generalized content, never personalized output.

Manifest schema version 2:

```json
{
  "schema_version": 2,
  "id": "<uuid>",
  "created_at": "<UTC ISO timestamp>",
  "origin": "<non-secret project identifier>",
  "operation": "harvest",
  "summary": "Why this reusable change is needed",
  "package_version": "2.0.0",
  "requires": [],
  "resolves": [],
  "changes": [
    {
      "operation": "update",
      "path": "canonical/skills/dev/TEMPLATE.md",
      "old_path": null,
      "before_sha256": "<SHA-256 of canonical base bytes>",
      "after_sha256": "<SHA-256 of canonical result bytes>",
      "payload": "diffs/canonical/skills/dev/TEMPLATE.md.patch",
      "payload_sha256": "<SHA-256 of diff bytes>",
      "deployment": "mapped",
      "mapping": {
        "kind": "skill",
        "intent": "canonical/skills/dev/INTENT.md",
        "output_rule": ".claude/skills/dev/SKILL.md",
        "compare": "content"
      }
    }
  ]
}
```

`operation` at bundle level is `harvest`, `prepare`, `apply`, or `launch`. Per-file operations:

| Operation | Payload                                                                             | Hashes                             |
| --------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| add       | Complete canonical file at `files/<path>`                                           | Before null, after required        |
| update    | Unified diff at `diffs/<path>.patch`                                                | Before and after required          |
| rename    | No payload for a pure move; unified diff for content changes, using old/new headers | Both required; `old_path` required |
| copy      | Unified diff if content changes, otherwise no payload; source retained              | Both required; `old_path` required |
| delete    | No payload                                                                          | Before required, after null        |

Use repo-independent package-relative diff headers (`a/<old path>`, `b/<path>`).
Validate payload SHA-256 before parsing and result SHA-256 after applying. Unsupported
binary updates cannot be represented by this text-diff format: report them unresolved,
never silently replace them with full-file update payloads.

Mappings describe portable output rules and INTENT references. Resolve layer names,
conditionals, and project-dependent paths locally; never copy another project's
concrete mapping table wholesale. Include companion/INTENT changes as separate
entries. Package entrypoints, references, changelog, and report templates may use
`deployment: "canonical-only"` with `mapping: null`.

Exclude `patch/**`, `state/**`, populated reports, and local `registry.md` from payloads.
`reports/report.template.md` is portable. Project root context and structure-only doc
edits are local deployment actions recorded in state, not canonical patch payloads.
Never bundle credentials, populated Answers, or source-project rendered baselines.

## Applying diff payloads

1. If the destination canonical hash equals `after_sha256`, the change is already present.
2. If it equals `before_sha256`, apply the diff in memory/staging and verify the result hash.
3. If it differs, look for the exact base in this repo's stored canonical snapshots.
   Reconstruct incoming content by applying the diff to that base; then three-way merge
   base, local canonical, and incoming. Record an explicit resolution as a new linked
   local bundle when the resolved result differs from the incoming result.
4. If the exact base is unavailable, do not use fuzzy patching as proof of correctness.
   Ask for the prerequisite canonical version/bundles or resolve the shown hunks with
   the developer. Record any explicit manual resolution in a new local bundle.

These bundles need no shared git history, but **update diffs require the expected
canonical base or explicit reconciliation**. Dependencies in `requires` name bundle
UUIDs. Never pretend a diff-only bundle is a full standalone snapshot.
Reject absolute paths, traversal, escaping symlinks, mismatched diff headers, duplicate
or contradictory target operations, missing payloads, and unsupported schemas before
writes. Do not execute commands embedded in manifests or payloads.

For case-only renames on a case-insensitive filesystem, use a distinct temporary
filename and journal the move. Apply the verified content diff in staging, then move
to the final spelling; do not treat the existing source spelling as an unrelated
destination collision. Preserve the source until the result is verified.

## Local bookkeeping

- `registry.md`: deployment allowlist/mappings. Register each installed companion,
  pattern, rule, and workflow as well as entrypoints; multiple outputs may share a source.
- `package-patch/REGISTRY.md`: portable bundles created in the canonical package. Columns: Bundle UUID, Folder, Date,
  Operation, Summary. Operation is `harvest`, `prepare`, `apply` (a current-source apply's self-packaged bundle), or `launch`. Incoming applications never overwrite this history.
- `project-patch/APPLIED.md`: local application attempts. Columns: Bundle UUID, Date, Status,
  Operation record, Summary. Valid statuses: pending, applied, partial, failed.
- `state/operations/<uuid>.json`: mutable local execution record with bundle UUID,
  mode, status, per-file canonical/permanent pre/post hashes, decisions, verification,
  and skipped/unresolved outcomes. Resume from it; portable bundles remain immutable.
- `state/index.json`: schema_version 2, per-canonical-path `recorded_sha256` and
  snapshot reference; per-mapping canonical base, rendered base, actual deployed hash,
  retained customization, and optional harvest receipt (observed permanent hash,
  promoted canonical hash, excluded local changes). Explicit null denotes known absence;
  missing entry denotes unknown history. Keep these meanings distinct.
- `state/objects/<sha256>`: exact local baseline bytes, keyed by SHA-256. Full files
  here are local synchronization baselines, not portable patch payloads. Keep prior
  objects needed for merge/resume; never copy this directory into sibling projects.

Store both clean rendered baseline and actual deployed result/customization when they
differ. Harvest updates its receipt and recorded canonical checkpoint, never the last
deployment baseline. Thus repeating harvest is a no-op for identical observed content,
while apply still sees whether a canonical update needs deployment. A later permanent
edit is compared to the harvested observation to isolate new edits; reconcile it against
the current canonical source so already harvested changes are not promoted twice.

Write the portable bundle and pending operation before managed writes. Update per-file
results after verification. Write state atomically via a temporary file and rename;
check observed pre-write hashes again if another edit occurred meanwhile. A partial
operation retains old baselines for unsuccessful files. Declining required work is a
partial outcome, not success. A no-op needs no new bundle; its report may record checks.

## First launch and existing projects

Persist Q&A in project `.harness/launch/answers.json` with value, source, and status
per question. Plans and materialization receipts live in `.harness/launch/runs/<run_id>/`.
Dated reports live in `.harness/launch/reports/`. Do not ignore this project state or
copy secret values into it. Revalidate historical answers before using them as plan knowns.

Launch records an initial `launch` manifest before deployment with add entries for
selected canonical sources, then records exact canonical/rendered/output baselines for
verified outputs. Include selected canonical-only package support files in the baseline.
This is the seed for future updates; never infer it from the most recent git HEAD.

For existing projects without state, inventory current mappings, untracked additions,
and canonical sources. Compare personalized current templates with permanent files.
For exact matches, initialize verified baselines. For differences, mark history unknown
and show the diff; do not classify which side changed by guessing. Harvest explicitly
selected improvements or apply explicitly reviewed canonical output. Record current
canonical content as the first observed checkpoint, with unknown prior history; do not
fabricate an update diff against an assumed historical version. A first apply can record
an initialization manifest with no canonical changes plus its local deployment actions.
Once observed, subsequent direct canonical edits are diffed against stored bytes.

Legacy diff-only deployed-path bundles are not schema 2 canonical patches. Preserve
history; request regeneration from canonical changes or explicitly migrate with known
bases. Never read today's template as a substitute for missing legacy payload content.

When copying the package into another project, exclude local state, populated reports,
registry rows, and prepared/applied histories. Copy selected bundle folders when needed.
Preserve the destination's local state when refreshing its canonical package files.
