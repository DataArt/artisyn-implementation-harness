# Validation plan — dev Implement and Test: browser-check fallback

Candidate: `20261114T230200Z-dev-browser-check-fallback`. Hashes: see `Report.md`. Status: **executed 2026-11-14.** Method per row; walkthroughs are labelled as such and are not runtime tests.

## Scenario table

| #   | Category         | Input / context                                                            | Expected behavior                                                                                                                                                  | Method                          | Actual outcome                                                                                                                                              | Evidence               | Result |
| --- | ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------ |
| 1   | Positive         | Implement step with a console/CSP check; Chrome tools report not connected | Assistant states what is missing, gives the connect steps from runtime/browser.md, waits once, then hands the precise action to the developer if still unavailable | Walkthrough                     | Failure branch now says: apply runtime/browser.md; not-connected → its walkthrough once, say what is missing, then hand over; record with developer's words | 04-implement l.108–113 | pass   |
| 2   | Positive         | Test AC needing a page load; tools connected                               | AC verified by the assistant as before                                                                                                                             | Walkthrough                     | Auto-approval condition unchanged for connected tools                                                                                                       | 05-test l.101–104      | pass   |
| 3   | Negative trigger | Step with only command-line verification                                   | No browser procedure invoked                                                                                                                                       | Walkthrough                     | Sentence is scoped to 'a verification item that needs a live browser'                                                                                       | 04-implement l.108     | pass   |
| 4   | Regression       | `/x-ray` Step 4b                                                           | Untouched                                                                                                                                                          | diff scope                      | x-ray not in candidate                                                                                                                                      | ls candidate/          | pass   |
| 5   | Structural       | Referenced path `.claude/skills/dev/runtime/browser.md`                    | Exists; section title "When the tools are not exposed" present                                                                                                     | ls, grep (pre-checked: present) | File exists; section heading at line 10                                                                                                                     | ls, grep               | pass   |

## Tool/runtime limitations

Walkthrough only; cannot simulate a disconnected extension on demand.

## Verdict

**Pass.** 5 of 5 scenarios pass. Next action: `/evolve adopt 20261114T230200Z-dev-browser-check-fallback` once accepted.
