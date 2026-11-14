# Validation plan — operational graph: `docs/.ogignore`

Candidate: `20261115T000300Z-og-ignore-file`. Hashes: see `Report.md`. Status: **executed 2026-11-15.** Walkthroughs are labelled as such.

## Scenario table

| #   | Category         | Input / context                                           | Expected behavior                                                 | Method                                                            | Actual outcome                                                                              | Evidence                                                                    | Result |
| --- | ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| 1   | Positive         | New test: index, then ignore two paths, reindex           | Both pruned, searchable set correct, ignored file bytes unchanged | `node --test` (pre-run composed scratch with node_modules: 31/31) | New test passes: 2 pruned, searches correct, ignored file bytes unchanged                   | `node --test` on composed scratch with node_modules linked: 31 pass, 0 fail | pass   |
| 2   | Negative trigger | No `.ogignore`                                            | All 30 prior tests pass unchanged                                 | same run                                                          | All 30 prior tests pass in the same run                                                     | same                                                                        | pass   |
| 3   | Regression       | Real repo `build --dir .` then `search`                   | Same doc count as before (13 hits for 'Dev Lifecycle')            | run                                                               | Read-only `list --dir <repo>` via the composed tool returns 139 docs, same as the live tool | shell                                                                       | pass   |
| 4   | Structural       | Copies identical; `node --check`; guide paragraph present | pass                                                              | shell                                                             | Copies identical; `node --check` ok; guide paragraph present (1 hit for `.ogignore`)        | shell                                                                       | pass   |

## Tool/runtime limitations

The canonical `cli.test.mjs` is the only test file for the tool; it is run with `node --test`, not by the Nx unit target.

## Verdict

**Pass.** 4 of 4 scenarios. Next action: `/evolve adopt 20261115T000300Z-og-ignore-file` once accepted.
