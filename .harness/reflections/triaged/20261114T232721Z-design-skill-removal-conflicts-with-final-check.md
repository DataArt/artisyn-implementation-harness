---
status: deferred
deferred: 2026-11-15T00:10:00Z
reason: the report does not name the file; candidates are the design INTENT conditional omissions (no-tracker, no-WAF) versus a verify expectation, but guessing which would produce an unverified change.
reconsider-when: the consumer names the file or shares the launch report; then cross-check that conditional against 01d-launch-graph-verify.md and the registry companion expectations.
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by a consumer: in one repository the final launch verification could not pass because the design skill's install rules say to remove a file and the final check requires that same file. The exact file was not named in the report. Candidate: the design INTENT's conditional omissions (for example the no-tracker branch removing tracker references, or the no-framework branch omitting `patterns/waf-review.md`) versus a verify checklist that still expects the companion.

## Impact

Launch cannot close cleanly for some answer combinations; the consumer must choose between a failing check and keeping a file the skill says to remove.

## Suggested direction (not committed)

Triage should enumerate the design INTENT's conditional removals and cross-check each against `01d-launch-graph-verify.md` and the registry companion expectations; make the verify step honour the same conditionals.
