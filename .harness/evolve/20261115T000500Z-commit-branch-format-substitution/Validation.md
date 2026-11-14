# Validation plan — commit and branch format from Q7 in dev and design

Candidate: `20261115T000500Z-commit-branch-format-substitution`. Hashes: see `Report.md`. Status: **executed 2026-11-15.** Walkthroughs are labelled as such.

## Scenario table

| #   | Category         | Input / context                                                                      | Expected behavior                                                      | Method                                | Actual outcome                                                                                                                                                                          | Evidence               | Result             |
| --- | ---------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------ |
| 1   | Positive         | Launch walkthrough with Q7 = `<TICKET> <summary>` / `feature/<ticket>-<desc>`        | Rendered dev Ceremony proposes `feature/…` and `<TICKET> …` commits    | Walkthrough of Block B against INTENT | INTENT rows name Q7 as source and say every proposed commit/branch is rewritten to the project format; the verify item requires the rendered skill and the Conventions article to agree | read candidate INTENTs | pass (walkthrough) |
| 2   | Negative trigger | Q7 = Conventional Commits                                                            | Rendering identical to today                                           | Walkthrough                           | Rows state the shipped defaults (Conventional Commits, `<type>/<ticket>-<slug>`), so a Q7 matching them renders unchanged                                                               | read                   | pass (walkthrough) |
| 3   | Structural       | INTENT tables still parse (column count), rows reference Q7, checklist items present | pass                                                                   | grep/awk                              | Substitution tables keep 5 fields per row (10 and 17 rows); `Q7` appears 3 times in each file; checklist items present                                                                  | awk/grep               | pass               |
| 4   | Regression       | Deterministic launch tests that read INTENT placeholders                             | Unaffected (rows are documentation, no new literal token in templates) | unit suite in developer env           | No literal token added to any template; placeholder-scanning tests see no new names                                                                                                     | diff scope             | pass               |

## Tool/runtime limitations

No live launch executed.

## Verdict

**Pass.** 4 of 4 scenarios (two by walkthrough). Next action: `/evolve adopt 20261115T000500Z-commit-branch-format-substitution` once accepted.
