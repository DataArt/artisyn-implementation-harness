# Stage reference router

Routing, the entry check (fresh vs. resume) and stage tasks live in [SKILL.md](../SKILL.md). Each
row below is loaded only when its stage runs.

| Stage             | Reference                                          | Produces                                                                         | Stops                              |
| ----------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| Context Gathering | [01-context-gathering.md](01-context-gathering.md) | Story folder, `2-report.md` skeleton, metrics, `0-intent.md`                     | Phase sign-off (intent)            |
| Ceremony          | [02-ceremony.md](02-ceremony.md)                   | Tracker transition to In Progress, feature branch                                | Phase sign-off (branch)            |
| Plan              | [03-plan.md](03-plan.md)                           | `1-plan.md` (immutable); `2-report.md` Progress table populated                  | Phase sign-off                     |
| Implement         | [04-implement.md](04-implement.md)                 | Code, one plan step at a time; `2-report.md` Progress/Notes/Tech Debt/Efforts    | Phase sign-off (+ step escalation) |
| Test              | [05-test.md](05-test.md)                           | Check results, PR review, AC validation — all recorded in `2-report.md`          | Phase sign-off                     |
| Document          | [06-document.md](06-document.md)                   | Updated permanent docs, resolved findings and debt                               | Phase sign-off                     |
| Completion        | [07-completion.md](07-completion.md)               | Archived story, final metrics, commit + PR text, tracker/TD offers, done message | One combined ask                   |

Shared protocols live in [patterns/](../patterns/); `patterns/phase-sign-off.md` is
the gate every stage ends with. The `0-intent.md` interface lives in
[interfaces/](../interfaces/) (questions to answer, shape free); the strict
`1-plan.md`/`2-report.md` templates live in [templates/](../templates/), with their
companion scripts and schemas. INTENT is installation-only.
