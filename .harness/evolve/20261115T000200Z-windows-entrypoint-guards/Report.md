# Evolve candidate — Windows-safe script entrypoint guards

## Identity

- Candidate: `20261115T000200Z-windows-entrypoint-guards`
- Requested outcome: the graph CLI and the diagram checker run on Windows when invoked as scripts, instead of exiting 0 silently.
- Scope: `docs/.og/cli.mjs`, its canonical copy, and `.canonical-implementation-harness/scripts/check-mermaid.mjs`.
- Non-goals: other scripts: `plan-provider-launch.mjs` already uses the correct pattern; `materialize-launch.mjs` and `finalize-launch.mjs` have no guard (always run); `timing.mjs`/`design-metrics.mjs` call `main()` unconditionally; historical fixture copies under `apps/harness-bootstrap-e2e/runs/` are not touched.
- Source reflections:
  - `.harness/reflections/triaged/20261114T232717Z-windows-node-entrypoint-detection-silent-noop.md`
- Evidence: `cli.mjs` line 356 compares `import.meta.url` with `` `file://${process.argv[1]}` ``; on Windows the URL is `file:///C:/…` and argv is `C:\\…`, never equal, so `runCli()` never runs. `check-mermaid.mjs` line 183 compares against `new URL(import.meta.url).pathname`, which on Windows is `/C:/…` and never equals `path.resolve(argv[1])`. Consumers reported exactly that symptom for both tools.

## Action

**Update** three files: guard becomes `process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)`, the pattern `plan-provider-launch.mjs` already uses. `check-mermaid.mjs` gains the `fileURLToPath` import. Callers: every skill step that shells out to the graph CLI, the launch diagram check.

Canonical files touched here are edited in place; they must travel to consumers through `/harness-bootstrap patch prepare` (direct canonical edits) after adoption. Adoption order within this run: image filenames → entrypoint guards → og-ignore → plan amend → commit/branch format → Jira states; the two CLI candidates share `cli.mjs` and were verified to compose in that order (`candidate.patch` each).

## Acceptance criteria

1. On macOS/Linux the CLI and checker behave exactly as before (tests and a live `search --dir .` pass).
2. The guard uses only `path.resolve` and `fileURLToPath`, so it is true on Windows for `node docs\\.og\\cli.mjs …`.
3. Both `cli.mjs` copies stay identical.

## Proposed file mapping

| Source (candidate)                                                       | Destination                                                    | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/canonical/docs/.og/cli.mjs` | `.canonical-implementation-harness/canonical/docs/.og/cli.mjs` | `3cfbdf45297dd4cde505a70e78608c165c316e5e7f2f5add3efec0046ead3c6f` | `10864655b5fe8a1710edace264ae4ce1211e2b94cb05bbab0989b9859fe73282` | update    |
| `candidate/.canonical-implementation-harness/scripts/check-mermaid.mjs`  | `.canonical-implementation-harness/scripts/check-mermaid.mjs`  | `da0a70c050e608aeda7931518588aaf027443ca7dcac491bbc0e4d627afccef4` | `9d4eb9754677c1612b322d3d659541cf1f39688b4d575e8e0406903fd6c4743d` | update    |
| `candidate/docs/.og/cli.mjs`                                             | `docs/.og/cli.mjs`                                             | `3cfbdf45297dd4cde505a70e78608c165c316e5e7f2f5add3efec0046ead3c6f` | `10864655b5fe8a1710edace264ae4ce1211e2b94cb05bbab0989b9859fe73282` | update    |

`candidate.patch` is the authoritative diff. Rollback: `git checkout --` each destination.

## Change summary

- `cli.mjs` ×2: one-line guard change.
- `check-mermaid.mjs`: guard line changed, import added.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                              |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above (external consumer feedback, relayed 2026-11-15)                                                                                                                                                                                                                                                                                                                      |
| Triage   | completed | This report; Triage · 2026-11-15 · tracker: Claude native tasks, run ID `EVOLVE-20261115`                                                                                                                                                                                                                                                                                                      |
| Validate | completed | `Validation.md`, 2026-11-15: **Pass                                                                                                                                                                                                                                                                                                                                                            |
| Adopt    | completed | 2026-11-15: Patch applied. In place: `check-mermaid.mjs` with no args exits 1 with usage; graph CLI `search --dir .` returns 13 hits; both `cli.mjs` copies identical (composed with the ignore candidate). Installed hashes: `cli.mjs` `5c89dbff514b09cb`, `check-mermaid.mjs` `9d4eb9754677c161`, `cli.mjs` `5c89dbff514b09cb`. Uncommitted; canonical files need `patch prepare` to travel. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch prepare` for the canonical files.

## Unresolved decisions

1. No Windows machine or CI runner is available to execute the fixed guard; acceptance rests on the pattern being the documented Node idiom and on the sibling script that already uses it. A Windows CI job is a separate improvement.

## Candidate acceptance record

Accepted by the developer on 2026-11-15, their words: "adopt all six".
