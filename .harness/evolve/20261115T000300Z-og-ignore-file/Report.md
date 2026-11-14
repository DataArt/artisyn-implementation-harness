# Evolve candidate — operational graph: `docs/.ogignore`

## Identity

- Candidate: `20261115T000300Z-og-ignore-file`
- Requested outcome: the graph never indexes or edits docs under `docs/` that other tooling owns: a `docs/.ogignore` file lists project-relative path prefixes to leave alone.
- Scope: `docs/.og/utils.mjs` and `cli.mjs` (both copies), the canonical `cli.test.mjs`, and `references/reindex-graph.md` Step 1.
- Non-goals: no launch question added (the guide sentence tells the orchestrator to ask); no stripping of `id:` lines already written to a now-ignored file (the file is left untouched; the owner reverts if needed).
- Source reflections:
  - `.harness/reflections/triaged/20261114T232719Z-og-assigns-ids-to-externally-owned-docs.md`
- Evidence: `reindex()` calls `listMarkdownFiles(dir/docs)` and `assign()` for every result; `assign()` is the one write path and adds `id:` to any doc lacking one. There is no exclusion beyond `docs/.og`. A consumer's externally owned doc under `docs/` was modified and their pipeline check failed.

## Action

**Update**: `readIgnoreList(docsRoot)` reads `docs/.ogignore` (one prefix per line, `#` comments); `listMarkdownFiles(root, ignore)` skips matching files and directories; `reindex()` passes the list; a previously indexed ignored doc is pruned on the next build. New test covers index → ignore → prune → no rewrite. Guide sentence in `reindex-graph.md` Step 1. Callers: `build`, `reindex`, launch Step 13, dev/design graph steps (unchanged API).

Canonical files touched here are edited in place; they must travel to consumers through `/harness-bootstrap patch prepare` (direct canonical edits) after adoption. Adoption order within this run: image filenames → entrypoint guards → og-ignore → plan amend → commit/branch format → Jira states; the two CLI candidates share `cli.mjs` and were verified to compose in that order (`candidate.patch` each).

## Acceptance criteria

1. A path listed in `docs/.ogignore` is never indexed and its file bytes never change across `build`.
2. A doc indexed before being listed is pruned on the next `reindex`.
3. With no `.ogignore` behaviour is unchanged (existing 30 tests pass).
4. Both copies of `utils.mjs` and `cli.mjs` stay identical.
5. `reindex-graph.md` documents the file and tells launch to ask about externally owned paths.

## Proposed file mapping

| Source (candidate)                                                            | Destination                                                         | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/canonical/docs/.og/cli.mjs`      | `.canonical-implementation-harness/canonical/docs/.og/cli.mjs`      | `3cfbdf45297dd4cde505a70e78608c165c316e5e7f2f5add3efec0046ead3c6f` | `eb0ecd2628c3088a62d0b08f83116bdb42819a7c2d76b92b7f596bd78de6a4ce` | update    |
| `candidate/.canonical-implementation-harness/canonical/docs/.og/cli.test.mjs` | `.canonical-implementation-harness/canonical/docs/.og/cli.test.mjs` | `48b583678277483d35453f2d3ec3a4baa09146e32ef34366821be9ca9a756f97` | `ca05fc237026584f7e5837d854fbd5dfed7ce932f5cb19915a3bbec8f96d0f6f` | update    |
| `candidate/.canonical-implementation-harness/canonical/docs/.og/utils.mjs`    | `.canonical-implementation-harness/canonical/docs/.og/utils.mjs`    | `eafe2ff668a3fb27c856d235ab30f8615a003a369e703fd3f92f9e843dfeaad6` | `ecc165fea9916f2045f061c93150b35f102022d08ec5591703fed1d5910fef56` | update    |
| `candidate/.canonical-implementation-harness/references/reindex-graph.md`     | `.canonical-implementation-harness/references/reindex-graph.md`     | `a3627a3d5fb45f85c7bd0e13568ee769b3a336f21bef1bcab71868babe5097a7` | `91178dcb9fd5414504819e5f9b8f1c418dc25772033d388edef227295cb9990b` | update    |
| `candidate/docs/.og/cli.mjs`                                                  | `docs/.og/cli.mjs`                                                  | `3cfbdf45297dd4cde505a70e78608c165c316e5e7f2f5add3efec0046ead3c6f` | `eb0ecd2628c3088a62d0b08f83116bdb42819a7c2d76b92b7f596bd78de6a4ce` | update    |
| `candidate/docs/.og/utils.mjs`                                                | `docs/.og/utils.mjs`                                                | `eafe2ff668a3fb27c856d235ab30f8615a003a369e703fd3f92f9e843dfeaad6` | `ecc165fea9916f2045f061c93150b35f102022d08ec5591703fed1d5910fef56` | update    |

`candidate.patch` is the authoritative diff. Rollback: `git checkout --` each destination.

## Change summary

- `utils.mjs`: new `readIgnoreList`, `listMarkdownFiles(root, ignore = [])` with project-relative prefix matching; the dead `docs/.og` relative check corrected to `.og`.
- `cli.mjs`: import and two-line change in `reindex()`.
- `cli.test.mjs`: one new test.
- `reindex-graph.md`: one paragraph under Step 1.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above (external consumer feedback, relayed 2026-11-15)                                                                                                                                                                                                                                                                                                                                                                                       |
| Triage   | completed | This report; Triage · 2026-11-15 · tracker: Claude native tasks, run ID `EVOLVE-20261115`                                                                                                                                                                                                                                                                                                                                                                       |
| Validate | completed | `Validation.md`, 2026-11-15: **Pass                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Adopt    | completed | 2026-11-15: Patch applied after the guard candidate. In place: `node --test` on the canonical `cli.test.mjs` 31/31; read-only list unchanged; `--dir docs` still rejected. Installed hashes: `cli.mjs` `5c89dbff514b09cb`, `cli.test.mjs` `ca05fc237026584f`, `utils.mjs` `ecc165fea9916f20`, `reindex-graph.md` `91178dcb9fd54145`, `cli.mjs` `5c89dbff514b09cb`, `utils.mjs` `ecc165fea9916f20`. Uncommitted; canonical files need `patch prepare` to travel. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch prepare` for the canonical files.

## Unresolved decisions

1. Whether `index --doc <ignored path>` should refuse explicitly. Draft leaves explicit single-doc indexing allowed (an explicit request is intent).

## Candidate acceptance record

Accepted by the developer on 2026-11-15, their words: "adopt all six".
