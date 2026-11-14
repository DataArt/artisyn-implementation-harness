# Evolve candidate — commit and branch format from Q7 in dev and design

## Identity

- Candidate: `20261115T000500Z-commit-branch-format-substitution`
- Requested outcome: launch renders every proposed commit message and branch name in the project's own convention (captured by Q7) instead of the shipped Conventional-Commits and `feat/` defaults.
- Scope: `canonical/skills/dev/INTENT.md` and `canonical/skills/design/INTENT.md` (substitution rows and verify items).
- Non-goals: no literal `{{COMMIT_FORMAT}}` tokens inserted into the templates (launch personalises by following INTENT rules, as it already does for other rendering rules); no change to the Conventions article template, which already renders Q7.
- Source reflections:
  - `.harness/reflections/triaged/20261114T232722Z-commit-and-branch-format-not-configurable.md`
- Evidence: Q7 captures commit and branch format, but neither INTENT mentions Q7, and the references hardcode `docs({ticket-lowercase}): …` and `feat/{ticket-or-local-id}-{slug}`; consumers with another style hand-edited every proposal.

## Action

**Update** both INTENT files: two substitution rows describing `{{COMMIT_FORMAT}}` and `{{BRANCH_FORMAT}}` as rendering rules sourced from Q7 (with shipped defaults), and a verify-checklist item requiring the rendered skill and the Conventions article to agree. Callers: `/harness-bootstrap launch` Block B (reads INTENT), `patch apply` personalisation.

Canonical files touched here are edited in place; they must travel to consumers through `/harness-bootstrap patch prepare` (direct canonical edits) after adoption. Adoption order within this run: image filenames → entrypoint guards → og-ignore → plan amend → commit/branch format → Jira states; the two CLI candidates share `cli.mjs` and were verified to compose in that order (`candidate.patch` each).

## Acceptance criteria

1. Both INTENT substitution tables name Q7 as the source for commit and branch rendering with explicit defaults.
2. Both verify checklists require every proposed commit and branch in the rendered skill to follow Q7.
3. No template text changed; canonical defaults unchanged for projects that use Conventional Commits.

## Proposed file mapping

| Source (candidate)                                                              | Destination                                                           | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/canonical/skills/design/INTENT.md` | `.canonical-implementation-harness/canonical/skills/design/INTENT.md` | `432993b3bdd9614846e7b3bb941b73a72f46e0e8ba3f809bf64f48ad629a78e4` | `9d5ddb702d6a673d00c853b53011ab36989b305709525216d476de713d55ef6e` | update    |
| `candidate/.canonical-implementation-harness/canonical/skills/dev/INTENT.md`    | `.canonical-implementation-harness/canonical/skills/dev/INTENT.md`    | `3b5dd2c09bc2a3f9dc7348a5d4b28462902b8387f2d8a74ef397dca5e9f45c3b` | `87d3c62b5f56cdc6ebdcd1f8497cf773c1b516d2d8261fa6006fd3706c7a1c49` | update    |

`candidate.patch` is the authoritative diff. Rollback: `git checkout --` each destination.

## Change summary

- dev INTENT: two rows before `{{PROJECT_KEY}}`, one checklist item before "One stop per phase".
- design INTENT: two rows before `{{PROJECT_KEY}}`, one checklist item at the top of the verify list.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                               |
| -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above (external consumer feedback, relayed 2026-11-15)                                                                                                                       |
| Triage   | completed | This report; Triage · 2026-11-15 · tracker: Claude native tasks, run ID `EVOLVE-20261115`                                                                                                       |
| Validate | completed | `Validation.md`, 2026-11-15: **Pass                                                                                                                                                             |
| Adopt    | completed | 2026-11-15: Patch applied; INTENT tables intact. Installed hashes: `INTENT.md` `9d5ddb702d6a673d`, `INTENT.md` `87d3c62b5f56cdc6`. Uncommitted; canonical files need `patch prepare` to travel. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch prepare` for the canonical files.

## Unresolved decisions

1. A literal-token approach (`{{COMMIT_FORMAT}}` in every reference) would be more mechanical but touches ~20 strings across both skills; deferred until the rule-based rendering proves insufficient in a real launch.

## Candidate acceptance record

Accepted by the developer on 2026-11-15, their words: "adopt all six".
