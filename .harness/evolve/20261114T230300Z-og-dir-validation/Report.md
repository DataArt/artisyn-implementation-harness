# Evolve candidate — operational graph: validate --dir and stop creating stray databases

## Identity

- Candidate: `20261114T230300Z-og-dir-validation`
- Requested outcome: the graph CLI refuses any `--dir` that is not the project root containing `docs/.og/`, read-only commands fail loudly when the graph is not built instead of returning `[]` from a fresh empty file, the design Research step passes `--dir .`, and the two stray databases leave the repo.
- Scope: `docs/.og/cli.mjs`, its identical canonical copy `.canonical-implementation-harness/canonical/docs/.og/cli.mjs`, `.claude/skills/design/references/04-research.md`; explicit removals of `docs/.og/docs/.og/docs-operational-graph.sqlite` and `docs/docs/.og/docs-operational-graph.sqlite` (both tracked).
- Non-goals: no schema or edge changes; no change to `reindex-graph.md` (it already says `--dir <project root>`); no registry row for `docs/.og` (none exists today; see decisions).
- Source reflections:
  - `.harness/reflections/triaged/20261108T211208Z-og-nested-docs-folder-bug.md`
  - `.harness/reflections/triaged/20261108T225457Z-og-nested-sqlite-reported-again.md` (evidence for the same bug, not a second instance)
- Evidence: Root cause traced this session. `cli.mjs` requires `--dir` but `design/references/04-research.md` Step 2 omits it, so each design session improvises a value. `openStore()` then does `mkdir -p` and creates an empty database at `<dir>/docs/.og/…`: `--dir docs/.og` produced the tracked `docs/.og/docs/.og/…sqlite` (commit 09b6bf9, removed in 6ecec5a, recreated in 1cc03fc by DESIGN-20261103-LBBI's research step), and `--dir docs` produced the tracked `docs/docs/.og/…sqlite` (DESIGN-20261108-1L8P, whose own reflection recorded `--dir docs` returning `[]`). Live test of the fix in the scratchpad: `--dir docs/.og` and `--dir docs` are rejected with no file created; `--dir .` before build fails with "Graph not built"; build then search works; an absolute root works. The VitePress Graph Explorer reads the sqlite directly and never calls `openStore`, so it is unaffected.

## Action

**Update** `cli.mjs` (both copies, identical today): `openStore(dir, {create})` resolves `dir`, requires `path.join(root,'docs','.og')` to equal the tool's own folder, and for `query`, `search`, `list` refuses when the database is absent. **Update** `04-research.md` to invoke with `--dir .` from the project root. **Retire** the two stray tracked databases (`git rm`). Callers: `/dev` context/plan/document graph calls (all already pass `--dir .`), `/design` research and publish, `reindex-graph.md`, the web-docs build (direct sqlite read, unaffected).

Canonical propagation: the matching `canonical/` templates are parametrised copies that differ from the installed files; carry this change with `/harness-bootstrap patch harvest` after adoption, not here.

Adoption order across this run's candidates (they share files; each ships a `candidate.patch` against the 2026-11-14 baseline that was verified to apply cleanly in sequence): plan-mode → task-mirroring → browser-fallback → og-dir-validation → first-commit. Adopt by applying the patch, not by copying whole files, once an earlier candidate has landed.

## Acceptance criteria

1. `search`, `query`, `list` with `--dir docs` or `--dir docs/.og` exit non-zero with a message naming the expected root, and create no file.
2. `search` with the correct `--dir` but no database exits non-zero with a "not built" message and creates no file.
3. `build`, `reindex`, `index`, `unedge` with `--dir .` from the project root behave as before.
4. `04-research.md` names `--dir .` and running from the project root.
5. After adoption neither stray sqlite path exists and `git ls-files docs | grep sqlite` lists only `docs/.og/docs-operational-graph.sqlite`.
6. Both `cli.mjs` copies stay byte-identical.

## Proposed file mapping

| Source (candidate)                                                       | Destination                                                    | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/canonical/docs/.og/cli.mjs` | `.canonical-implementation-harness/canonical/docs/.og/cli.mjs` | `2badf4eff930460f21f411e52e65f40d7ecfa4a0e2f1f005c282be39bf24aed2` | `ccf65aa1e0198ce48d828af5457bf34d4ed8063924ca9a0500a31c2fb7c64797` | update    |
| `candidate/.claude/skills/design/references/04-research.md`              | `.claude/skills/design/references/04-research.md`              | `d5dd0f525e0ab9361d9edb25158be3da50e70c5cf66bd5673c6c6dbaa18d779f` | `9c7697803b0c3b22d3fb3299bc3cc2ad4a6bcc8425bc4bde5e5ac6bd2707f036` | update    |
| `candidate/docs/.og/cli.mjs`                                             | `docs/.og/cli.mjs`                                             | `2badf4eff930460f21f411e52e65f40d7ecfa4a0e2f1f005c282be39bf24aed2` | `ccf65aa1e0198ce48d828af5457bf34d4ed8063924ca9a0500a31c2fb7c64797` | update    |

`candidate.patch` is the authoritative diff. No removals unless listed in the change summary. Rollback: `git checkout --` each destination.

## Change summary

- `cli.mjs`: import `fileURLToPath`; `TOOL_DIR` constant; `openStore` gains the root check and a `create` option with a not-built guard; `query`, `search`, `list` pass `{ create: false }`. Same diff in the canonical copy.
- `04-research.md`: the invocation line now reads `node docs/.og/cli.mjs search --dir . --term <text>` (or `query --dir . --related-to <doc>`), "from the project root".
- Removals at adopt: `git rm docs/.og/docs/.og/docs-operational-graph.sqlite docs/docs/.og/docs-operational-graph.sqlite` and the emptied folders.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Triage   | completed | This report; Triage · 2026-11-14 · tracker: Claude native tasks, run ID `EVOLVE-20261114-2`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Validate | completed | `Validation.md`, 2026-11-14: **Pass (live scratch test of the CLI already recorded in the evidence above)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Adopt    | completed | 2026-11-14: `candidate.patch` applied in the recorded order; every installed file is byte-identical to the composed scratch result that Validate exercised (0 diffs). Installed hashes: `.canonical-implementation-harness/canonical/docs/.og/cli.mjs` `ccf65aa1e0198ce4`, `.claude/skills/design/references/04-research.md` `9c7697803b0c3b22`, `docs/.og/cli.mjs` `ccf65aa1e0198ce4`. Removed `docs/.og/docs/.og/docs-operational-graph.sqlite` and `docs/docs/.og/docs-operational-graph.sqlite` via `git rm`; live check on the repo: `--dir docs` rejected, `search --dir .` returns results. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch harvest` for the canonical templates.

## Unresolved decisions

1. `docs/.og/` has no row in `.canonical-implementation-harness/registry.md`, so `patch harvest` cannot carry a future divergence between the two copies; the draft edits both copies directly. Consider adding a `content` row for `cli.mjs` at adoption.
2. The canonical `04-research.md` template has the same `--dir`-less invocation; carry it via harvest.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt all five and commit".
