# Stage reference router

Routing, the idempotency check, stage tasks, and Completion live in
[SKILL.md](../SKILL.md). Each row below is loaded only when its stage runs.

| Stage             | Reference                                          | Produces                                                                              |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Context Gathering | [01-context-gathering.md](01-context-gathering.md) | `0-intent.md`, `2-report.md` (skeleton), the story folder itself                      |
| Ceremony          | [02-ceremony.md](02-ceremony.md)                   | Tracker transition to In Progress, feature branch confirmed                           |
| Plan              | [03-plan.md](03-plan.md)                           | `1-plan.md` (immutable); `2-report.md` Progress table populated                       |
| Implement         | [04-implement.md](04-implement.md)                 | Code commits, one plan step at a time; `2-report.md` Progress/Notes/Tech Debt/Efforts |
| Test              | [05-test.md](05-test.md)                           | Build/test/lint results, PR review, AC validation — all recorded in `2-report.md`     |
| Document          | [06-document.md](06-document.md)                   | Updated permanent docs, resolved deviations, archived story                           |

Shared protocols used across these stages live in [patterns/](../patterns/), and the
`0-intent.md`/`1-plan.md`/`2-report.md` scaffolds live in [templates/](../templates/) —
the installed bundle contains their companion scripts and schemas. INTENT is installation-only.
