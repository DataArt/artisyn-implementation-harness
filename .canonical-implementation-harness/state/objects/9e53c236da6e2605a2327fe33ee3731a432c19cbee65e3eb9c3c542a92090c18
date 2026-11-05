# Patch manifests and local state

Harvest, prepare, and apply all use this contract. Canonical payload paths are
relative to `package:canonical/` — the package's single
canonical root, holding `agents/`, `docs/`, `skills/`, `adaptors/`, and adapter/configuration JSON — with one documented
exception: `canonical-only` entries (the package's own entrypoints, references,
changelog, and report template) are package-internal support files outside
`canonical/`, addressed by their normal package-root-relative path instead (see
"Mappings" below). Permanent paths are relative to the project root.
Consumer ignore rules cover the disposable toolkit and its local history. All local
bookkeeping, patch baselines, bundles, and operation receipts live under the installed
bootstrap package's `state/`; the legacy project `.harness/` directory is not a write
target.

Path aliases in the patch recipes: `package-patch/` = canonical package
`package:patch/`; `project-patch/` = `package:state/patch/`;
`state/` = the bootstrap package's `package:state/`;
`registry.md` = `package:state/registry.md`; and local reports =
`package:state/launch/reports/`. New bootstrap writes always use the package state
directory. Existing `.harness/` records are read-only migration inputs only; copy needed
records into package state with provenance, without merging conflicting IDs. Portable
package changes are written to `package-patch/`; project execution bundles and
apply/harvest receipts are written to `project-patch/`.
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

- `registry.md`: deployment allowlist/mappings at `package:state/registry.md`. Register each installed companion,
  pattern, rule, and workflow as well as entrypoints; multiple outputs may share a source.
- `package-patch/REGISTRY.md`: portable bundles created in the canonical package. Columns: Bundle UUID, Folder, Date,
  Operation, Summary. Operation is `harvest`, `prepare`, `apply` (a current-source apply's self-packaged bundle), or `launch`. Incoming applications never overwrite this history.
- `project-patch/APPLIED.md`: local application attempts. Columns: Bundle UUID, Date,
  Providers, Status, Operation record, Summary. Valid statuses: pending, applied, partial,
  failed. Providers lists the installed providers the attempt actually deployed to, so the
  same bundle applied to one provider now and another later stays two distinguishable rows
  instead of one row that silently claims both.
- `state/operations/<uuid>.json`: mutable local execution record with bundle UUID,
  mode, `providers`, status, per-file canonical/permanent pre/post hashes, decisions,
  verification, and skipped/unresolved outcomes. `providers` is the resolved provider
  scope: the deployment targets for `apply`, the provider whose installed tree was
  observed for `harvest`, the selected providers for `launch`, and `[]` for `prepare`,
  which touches no permanent file. Each mapped per-file result names its `provider`, or
  `"shared"` when the output is one every selected provider reads rather than one
  provider's own file; a `canonical-only` result uses `null`. Resume from it; portable
  bundles stay immutable.
- `state/index.json`: schema_version 2, per-canonical-path `recorded_sha256` and
  snapshot reference; per-mapping canonical base, rendered base, actual deployed hash,
  retained customization, and optional harvest receipt (observed permanent hash,
  promoted canonical hash, excluded local changes). A mapping entry is one permanent
  output keyed by its path and carrying its `provider`; one canonical source installed
  for two providers has two independent entries with their own baselines, and neither is
  evidence about the other. Explicit null denotes known absence; missing entry denotes
  unknown history. Keep these meanings distinct.
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

## Compacting bundle history

Portable bundles are immutable and append-only in the normal case — an incoming
apply/harvest never rewrites a prior bundle. A deliberate compaction (developer
explicitly asks to reduce bundle count) is the one exception, and it replaces
bundles rather than editing them in place:

1. Never fabricate a "before" state to make old update/rename diffs replay cleanly.
   If any prior bundle's stored payload hash no longer matches what it claims to
   produce, treat that payload as untrustworthy rather than propagating it forward.
2. Re-derive each compacted bundle's entries as fresh `add` operations from current,
   disk-verified content (`before_sha256: null`, `after_sha256` computed from the
   real file). This keeps every hash in the result real and reproducible, even when
   the bundles being replaced already were not.
3. Give the new bundle a `supersedes` array of the UUIDs it replaces, and keep each
   replaced bundle's original summary somewhere recoverable (the new manifest or
   `REGISTRY.md`) for provenance — compaction shrinks bundle count, it does not erase
   what happened.
4. Only fold bundles whose replaced files still exist on disk under their final path.
   A path that a later `delete` (or an untracked rename) removed has nothing to
   checkpoint; drop it rather than guessing where it went.
5. Record the compaction itself in `REGISTRY.md` (or `APPLIED.md` for a project-side
   compaction) with a note on why it was needed and what it changed.

## First launch and existing projects

Persist Q&A in `package:state/launch/answers.json` with value, source, and status
per question. Plans and materialization receipts live in `package:state/launch/runs/<run_id>/`.
Dated reports live in `package:state/launch/reports/`. Preserve local launch history across updates when needed for later operations; never
copy secret values into it. Revalidate historical answers before using them as plan knowns.

Launch records an initial `launch` manifest before deployment with add entries for
selected canonical sources and its selected `providers`, then records exact
canonical/rendered/output baselines for verified outputs, one entry per provider. Include selected canonical-only package support files in the baseline.
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

## Provider-aware package updates

`canonical/manifest.json`, `canonical/settings.json`, `canonical/mcp.json` and
`canonical/adaptors/` are deployable adapter inputs. Package them with canonical
changes; scripts/provider-adapter.mjs, plan-provider-launch.mjs and finalize-launch.mjs
are package tooling. Never include `state/` in portable bundles or overwrite it on
package update. Resolve output mappings through the manifest for every selected
provider; do not reuse a Claude output path for Codex. Harvest project-specific
changes independently of generated provider mechanics.

Legacy bundles retain their original bytes and hashes. After validating a bundle,
map a legacy canonical `adoptors/` path to `adaptors/` when resolving its destination;
never rewrite its manifest or payload. Reconcile hash conflicts before applying.

### Provider scope of an operation

A project can have more than one provider installed at once, so every operation that
reads or writes permanent files is provider-scoped and recorded that way. Resolve the
scope from the recorded answers and what the manifest shows is actually installed —
never from the execution host, and never from one provider's presence alone.

| Operation | Provider scope                                                         |
| --------- | ---------------------------------------------------------------------- |
| `launch`  | The providers selected for installation                                |
| `apply`   | The installed providers this run deploys to — empty if nothing deploys |
| `harvest` | The single provider whose installed file was observed and generalized  |
| `prepare` | None (`[]`) — canonical only, no permanent file read or written        |

Provider-specific outputs — installed skills and their companions, role definitions,
native settings and MCP configuration, and the root instruction file — name their own
provider. A shared project output that every selected provider reads, such as an
Engineering Guide article or an architecture doc, is `"shared"`: it deploys once no
matter how many providers are installed, and a second provider's apply must not expect
to deploy its own copy. Reserve `null` for an entry with no permanent output at all.

An `apply` whose every change is `canonical-only` deploys no permanent file, so its scope
is legitimately empty — that is a complete operation, not an unscoped one. Any mapped
result, however, requires a non-empty scope containing its provider.

Canonical writes stay provider-neutral: one canonical result serves every provider, and
a portable bundle never records a provider. Scope lives in local state, not in payloads.

Deployment, verification and completion are per provider. An operation that finished one
provider's outputs and not another's is `partial` with the unfinished provider resumable,
never `applied`. The same bundle applied to a second provider later is a new operation
record and a new `APPLIED.md` row; the earlier row keeps its own provider list. A
per-provider baseline, harvest receipt or retained customization is evidence about that
provider's output only — never read one provider's state as the other's.

A record without `providers`, or a mapping entry without `provider`, predates this
contract: treat its scope as unknown and re-resolve it from the installed outputs rather
than assuming every provider was covered.
