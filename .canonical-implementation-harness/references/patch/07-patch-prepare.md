# Patch Prepare

Canonical (direct edits) → portable bundle. Read `06-patch-state.md` first.
Canonical source paths are relative to `canonical/` inside the package — the main
folder this operation reads from or writes into for portable content, aside from a
narrow set of `canonical-only` package-internal files (see `06-patch-state.md`);
bookkeeping aliases `registry.md`, `project-patch/`, and `state/` refer to the
bootstrap package state directory defined in the state contract.

Prepare exists for one situation: canonical sources inside this package were edited
directly — not generalized from a permanent project file by `harvest` — and need to
travel as a portable bundle before any project's permanent files are touched. It is
the packaging half of `apply`'s Step 1, run standalone, with no personalization and
no deployment. Nothing under `docs/`, `.claude/skills/`, `.claude/agents/`, or any
other permanent project path is read or written by this operation.

Prepare is therefore provider-neutral: it resolves no provider scope, reads no installed
output, and records `providers: []` in its operation record. Which providers eventually
receive the bundle is `apply`'s decision, made per project.

> ⚠️ **Not the old two-way prepare/apply pair.** An earlier design of this package
> had `prepare` classify drift in either direction and hand `apply` a decided plan;
> that added an unresolvable "conflict" case and a cross-command handoff for no real
> benefit — see `CHANGELOG.md`'s design-decision note on the 2.0.0 collapse. This
> `prepare` is unidirectional and self-contained: canonical → bundle, nothing else.
> It does not decide anything `apply` later has to honor beyond the bundle's content.

## 1 — Detect direct canonical edits

Compare every canonical path in `state/index.json`'s mappings, plus any discovered
but unmapped canonical file (skills, agents, patterns, companions and guide docs, all
under `canonical/`), against its recorded
`canonical_sha256`. Include untracked new canonical files. A path whose current bytes already equal a `requires`-eligible bundle's
`after_sha256` (already captured by an earlier bundle, checkpoint merely stale) is a
checkpoint-only advance, not new content — record it in state but do not re-diff it.

For each remaining changed path, locate its base:

- If current recorded `canonical_sha256` bytes are still reachable (from
  `state/objects/` or this package's own git history), diff against them directly.
- If the recorded checkpoint predates a bundle already produced by this package
  (harvest or a prior prepare) that changed the same path, diff against that
  bundle's `after_sha256` bytes instead, and add that bundle's UUID to `requires`.
- If no reachable base exists, follow the missing-baseline procedure in
  `06-patch-state.md` — do not fabricate a diff against guessed content.

## 2 — Build the bundle

Write bundle-level `operation: "prepare"`. Per-file entries follow the same schema
as harvest/apply (`add`/`update`/`rename`/`copy`/`delete`, diff-only updates, full
content only for adds). Set `deployment: "mapped"` with the file's registry mapping
when one exists; `"canonical-only"` with `mapping: null` for package-internal files
(entrypoints, references, changelog, report templates) that never deploy.

Do not generalize, substitute, or otherwise rewrite the content while bundling —
that already happened (or didn't need to) before the canonical edit was made. Prepare
packages what is already there; it is not a second harvest pass. Bump changed
template versions and the package version per `../../patterns/skill-authoring.md`'s
versioning rule if this hasn't already been done on the canonical files themselves;
update `CHANGELOG.md`.

## 3 — Verify and record

Validate every payload SHA-256 before writing, then reconstruct each diff against
its recorded base and confirm the result hash matches `after_sha256`. A file that
fails reconstruction is unresolved — report it and exclude it from the bundle rather
than shipping an unverifiable payload.

Store the bundle immutably under `package-patch/<UTC timestamp>-<slug>-<uuid>/`.
Advance `state/index.json` canonical checkpoints only for verified entries (including
checkpoint-only advances from Step 1). Append a `package-patch/REGISTRY.md` row.
Write a local operation record under `state/operations/<uuid>.json` with per-file
before/after hashes and verification results, mirroring the harvest/apply shape.

Report the bundle path, UUID, files packaged, checkpoint-only advances, and any
unresolved paths. The next operation, when wanted, is `patch apply` — here or in a
sibling project with the copied bundle folder. Prepare never deploys; leave that to
`apply` even when run in the same session immediately afterward.
