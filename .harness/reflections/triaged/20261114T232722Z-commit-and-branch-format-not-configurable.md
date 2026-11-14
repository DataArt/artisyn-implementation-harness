---
status: triaged
triaged: 2026-11-15T00:10:00Z
candidate: .harness/evolve/20261115T000500Z-commit-branch-format-substitution/
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by consumers: their team uses a different commit and branch style, and the harness has no setting for it, so they changed the generated commands by hand every time. The tool writes `<type>(<scope>): …` commits and `feat/<ticket>-<slug>` branches; their style is `<TICKET> <summary>` commits and `feature/<ticket>-<short-desc>` branches.

Verified here: `canonical/skills/dev/references/02-ceremony.md` hardcodes `feat/{ticket-or-local-id}-{slug}` and `docs({ticket-lowercase}): …`; the design references hardcode `docs/{ticket}-{slug}` and `docs({TICKET}): …`. Launch question Q7 records the project's commit and branch format, but the templates do not consume it.

## Impact

Every proposed commit and branch in both lifecycles is wrong for teams with another convention, on every stage of every ticket.

## Suggested direction (not committed)

Introduce `{{COMMIT_FORMAT}}` and `{{BRANCH_FORMAT}}` (or a small rendering rule) fed from Q7, and route every proposed commit message and branch name in dev and design through them. The Conventions article should state the format once and the skills should point at it.
