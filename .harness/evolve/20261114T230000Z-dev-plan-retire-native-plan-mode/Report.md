# Evolve candidate — dev Plan: retire native plan mode

## Identity

- Candidate: `20261114T230000Z-dev-plan-retire-native-plan-mode`
- Requested outcome: the dev Plan stage no longer refers to the host's native planning mode, so nobody expects `EnterPlanMode` to run and the Step 5 sign-off is understood as the only gate.
- Scope: `.claude/skills/dev/references/03-plan.md` only.
- Non-goals: no change to `/design` (its references never mention native planning); `dev/runtime/planning.md` stays on disk, now unreferenced from dev (it is an adaptor file the package installs per skill; retire it at the canonical adaptor level, not here).
- Source reflections:
  - `.harness/reflections/triaged/20261102T163500Z-retire-native-plan-mode-from-dev.md`
- Evidence: DESIGN-20261102-Q5MU: the Plan stage completed without native plan mode; the user asked why, accepted the reasoning (the stage writes files and delegates, which a read-only mode blocks), and said to retire native plan mode from the dev flow. Verified now: line 144 of `03-plan.md` still carries the conditional clause, and line 128 still says to apply `runtime/planning.md`, which tells the assistant to use `EnterPlanMode` when exposed.

## Action

**Update** one owner, `03-plan.md`: drop the `runtime/planning.md` pointer at Step 3 and replace the conditional native-mode clause with a plain statement that native planning mode is not used, with the reason. Callers: `/dev plan` and the full chain.

Canonical propagation: the matching `canonical/` templates are parametrised copies that differ from the installed files; carry this change with `/harness-bootstrap patch harvest` after adoption, not here.

Adoption order across this run's candidates (they share files; each ships a `candidate.patch` against the 2026-11-14 baseline that was verified to apply cleanly in sequence): plan-mode → task-mirroring → browser-fallback → og-dir-validation → first-commit. Adopt by applying the patch, not by copying whole files, once an earlier candidate has landed.

## Acceptance criteria

1. `03-plan.md` contains no instruction to apply or enter native planning mode.
2. The Step 5 sign-off is named as the only gate of the stage.
3. No other dev reference or pattern still points at `runtime/planning.md`.
4. Every other instruction in Step 3 (draft order, intent check, interaction procedure, write-confirm) is unchanged.

## Proposed file mapping

| Source (candidate)                                   | Destination                                | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ---------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.claude/skills/dev/references/03-plan.md` | `.claude/skills/dev/references/03-plan.md` | `3283c8affc00df61ecdf79a16fbca9e9f2f2dd1a520f87aa87a2509df1bf167c` | `de64dc08237085aaaedc1c65ae6e3247ee626a48535541c3e523c335cf984730` | update    |

`candidate.patch` is the authoritative diff. No removals unless listed in the change summary. Rollback: `git checkout --` each destination.

## Change summary

- Step 3 opening line: `Apply runtime/planning.md.` removed.
- Lines 144–146 replaced by a five-line paragraph: the stage does not use native planning mode; why (single read-only gate vs. a stage that writes files and delegates, inside a seven-stage lifecycle); Step 5 is the only gate; do not enter or claim it.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                      |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reflect  | completed | Source reflections above                                                                                                                                                                                                                               |
| Triage   | completed | This report; Triage · 2026-11-14 · tracker: Claude native tasks, run ID `EVOLVE-20261114-2`                                                                                                                                                            |
| Validate | completed | `Validation.md`, 2026-11-14: **Pass                                                                                                                                                                                                                    |
| Adopt    | completed | 2026-11-14: `candidate.patch` applied in the recorded order; every installed file is byte-identical to the composed scratch result that Validate exercised (0 diffs). Installed hashes: `.claude/skills/dev/references/03-plan.md` `6479508402f0ee55`. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch harvest` for the canonical templates.

## Unresolved decisions

1. Whether to delete `.claude/skills/dev/runtime/planning.md` now. Draft keeps it: the package adaptor re-installs it on `patch apply`, so the retirement belongs in `canonical/adaptors/claude/planning.md` or the manifest's per-skill runtime list. Decide at harvest.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt all five and commit".
