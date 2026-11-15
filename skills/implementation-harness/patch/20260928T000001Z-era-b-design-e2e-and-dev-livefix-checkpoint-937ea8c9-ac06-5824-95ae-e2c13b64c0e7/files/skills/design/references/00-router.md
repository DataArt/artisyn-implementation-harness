# Stage reference router

Resume detection, the Phase tracker, stage tasks, and Completion live in
[SKILL.md](../SKILL.md). Each row below is loaded only when its stage runs.

| Stage            | Reference                                        | Produces                                                                                                             |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Frame            | [01-frame.md](01-frame.md)                       | Tracker transition + branch confirmed (ceremony, once title/slug is known); `design/00 Frame.md`, `design/Report.md` |
| Research         | [02-research.md](02-research.md)                 | `design/01 Research.md` (or per-decision variants), Assumptions recorded                                             |
| Evaluate         | [03-evaluate.md](03-evaluate.md)                 | `design/02 Evaluate.md`, closing WAF block in `design/Report.md`                                                     |
| Solution         | [04-solution.md](04-solution.md)                 | Selected solution artifacts recorded in `design/Report.md`; WAF review via `patterns/waf-review.md`                  |
| Review Gate      | [05-review-gate.md](05-review-gate.md)           | Draft MR opened, `design/Report.md` Gate recorded, approval outcome                                                  |
| Address Feedback | [06-address-feedback.md](06-address-feedback.md) | Reiteration applied, re-approval recorded — only runs if concerns were raised                                        |
| Publish          | [07-publish.md](07-publish.md)                   | Permanent docs updated, story archived, tracker synced                                                               |

Frame owns the ticket's start-of-work ceremony (tracker transition + branch
checkout) internally, positioned after the tracker fetch/title resolution it also
does — the branch slug isn't known any earlier. There is no separate Ceremony stage.

Shared protocols used across these stages live in [patterns/](../patterns/). Lifecycle
templates live in [templates/](../templates/); solution artifacts use the adaptive
contracts in [interfaces/](../interfaces/).
