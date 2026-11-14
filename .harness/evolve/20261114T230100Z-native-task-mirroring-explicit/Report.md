# Evolve candidate — native task mirroring as an explicit step in every stage

## Identity

- Candidate: `20261114T230100Z-native-task-mirroring-explicit`
- Requested outcome: the native task tracker is created and updated on every `/dev` entry and closed at Completion, without depending on a system reminder; `/design` Completion closes its task too.
- Scope: `.claude/skills/dev/SKILL.md` (Stage tasks wording), the seven dev stage references (first-action line), `dev/references/07-completion.md` and `design/references/10-completion.md` (final close).
- Non-goals: no change to `patterns/task-tracking.md` or the runtime procedure; no change to `/design` router (its Stage tasks section was already made explicit by candidate `20261102T140000Z-design-stage-tasks-first-action`).
- Source reflections:
  - `.harness/reflections/triaged/20261103T170853Z-dev-completion-native-task-not-closed.md`
  - `.harness/reflections/triaged/20261108T211206Z-dev-session-no-native-tasks-at-all.md`
- Evidence: DESIGN-20261103-LBBI: Completion finished with its native task still `in_progress`; the user asked why. DEV-20261108-K7XQ: no native task was ever created across all seven stages despite repeated system reminders. Verified now: `SKILL.md` line 123–124 says "A system reminder about native progress tools is the cue to do it now"; every stage reference's first action is only the metrics call; neither Completion reference closes its task.

## Action

**Update** (merge of two reflections, one underlying fragility): make the mirror calls explicit steps. Router: the cue sentence becomes a plain instruction with a hard rule (never finish a stage with its task open). Each stage reference: first actions are mark `in_progress`, then `stage start`. Both Completion references: mark `completed` and check `TaskList` before the closing message. Callers: every `/dev` and `/design` entry.

Canonical propagation: the matching `canonical/` templates are parametrised copies that differ from the installed files; carry this change with `/harness-bootstrap patch harvest` after adoption, not here.

Adoption order across this run's candidates (they share files; each ships a `candidate.patch` against the 2026-11-14 baseline that was verified to apply cleanly in sequence): plan-mode → task-mirroring → browser-fallback → og-dir-validation → first-commit. Adopt by applying the patch, not by copying whole files, once an earlier candidate has landed.

## Acceptance criteria

1. Each dev stage reference names marking the stage task `in_progress` as its first action, before `stage start`.
2. `SKILL.md` no longer ties task tracking to a system reminder.
3. Both Completion references mark the stage task `completed` and verify no open task remains, before the closing message (design: before either the approved or declined close).
4. `patterns/task-tracking.md` create/reuse/reconcile logic is untouched.

## Proposed file mapping

| Source (candidate)                                                | Destination                                             | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ----------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.claude/skills/design/references/10-completion.md`     | `.claude/skills/design/references/10-completion.md`     | `91daca4b2110f9700a74133af7cd3b611925566ae23a554f48838ab2dae81237` | `641cb1ee9a40d89122a57c060f870afc9e1367b877ae817d2f29d3fd73d9f35a` | update    |
| `candidate/.claude/skills/dev/SKILL.md`                           | `.claude/skills/dev/SKILL.md`                           | `aaeb40fba1c633563ff648dc6f7214417acbf12d1a894f9c0311fd6f9f4183a5` | `bf5ee74e902107d863dee00a8410020b68a20fd8bfba251549193fd204ca1fc3` | update    |
| `candidate/.claude/skills/dev/references/01-context-gathering.md` | `.claude/skills/dev/references/01-context-gathering.md` | `15dc97cde540ac68c12c12d8e9e751b413128ff164e2e6fd732d97896bf0d57e` | `5f66b0bbea7b7f3ecc7efae3f6ad641832df205a5a3c4fd340d0d65ab12dd6c9` | update    |
| `candidate/.claude/skills/dev/references/02-ceremony.md`          | `.claude/skills/dev/references/02-ceremony.md`          | `3da7f3ee083b7617fb0b731135ae2a6605fbc04ce4491e8dd14e67c639a1b1aa` | `2ea463a4eeda2b810e58b413c2b9596ea18bb72ef47d7d921f86ea52cb0173e1` | update    |
| `candidate/.claude/skills/dev/references/03-plan.md`              | `.claude/skills/dev/references/03-plan.md`              | `3283c8affc00df61ecdf79a16fbca9e9f2f2dd1a520f87aa87a2509df1bf167c` | `6969a17414a8799b83c4f5193d01949de15035e72905c6f4c3dccc172b627be1` | update    |
| `candidate/.claude/skills/dev/references/04-implement.md`         | `.claude/skills/dev/references/04-implement.md`         | `f0989c5da7087c857127b953d7a3f81c507c10117e3120703c6fc767163e243e` | `5abeaac19217ee63b8ee2abc05887fd5699ee55824f57b3051ca33958faadfef` | update    |
| `candidate/.claude/skills/dev/references/05-test.md`              | `.claude/skills/dev/references/05-test.md`              | `55f39e4936dfbfb0ec99507acec22b468ae0dfb310c12faeca8b4928cdb50a4f` | `2c430380a5ea482c3ee410e5e7e4989f2993bc8cd1921c122c8bc42e9b49e469` | update    |
| `candidate/.claude/skills/dev/references/06-document.md`          | `.claude/skills/dev/references/06-document.md`          | `350449323f830db36be76628c915bf0d5f0d1bdb97bb6c8eb3dc409bb7306b0e` | `a2bbe94c072d722aba48058d3262bb5a2205ec4440b483f4cc8e6371762b1e44` | update    |
| `candidate/.claude/skills/dev/references/07-completion.md`        | `.claude/skills/dev/references/07-completion.md`        | `0077a8cf2e517921db93f6775eca1868c1a1be6db58810cd368b05939920eb11` | `4b79fe69fe7c42e454afd65287c242be659edbfd7b7c2b2815d5dc8546269106` | update    |

`candidate.patch` is the authoritative diff. No removals unless listed in the change summary. Rollback: `git checkout --` each destination.

## Change summary

Revised once during Validate: `01-context-gathering.md` now marks the task `in_progress` before the metrics init block, not after `stage start`.

- `SKILL.md` Stage tasks: two sentences replaced by three; see patch.
- `02`–`07` references: `First action:` → `First actions: mark this stage's native task in_progress (patterns/task-tracking.md), then stage start …`.
- `01-context-gathering.md`: one sentence after the metrics init block.
- `07-completion.md`: three-line paragraph before "Then the closing message".
- design `10-completion.md`: three-line paragraph before the **Approved** branch, covering both closes.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Triage   | completed | This report; Triage · 2026-11-14 · tracker: Claude native tasks, run ID `EVOLVE-20261114-2`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Validate | completed | `Validation.md`, 2026-11-14: **Pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Adopt    | completed | 2026-11-14: `candidate.patch` applied in the recorded order; every installed file is byte-identical to the composed scratch result that Validate exercised (0 diffs). Installed hashes: `.claude/skills/design/references/10-completion.md` `641cb1ee9a40d891`, `.claude/skills/dev/SKILL.md` `cb7a4d58aa333b12`, `.claude/skills/dev/references/01-context-gathering.md` `a811497fbdfb0d77`, `.claude/skills/dev/references/02-ceremony.md` `4f243ebd80f177c6`, `.claude/skills/dev/references/03-plan.md` `6479508402f0ee55`, `.claude/skills/dev/references/04-implement.md` `30c674f0fa75c735`, `.claude/skills/dev/references/05-test.md` `316bb944c55b5f24`, `.claude/skills/dev/references/06-document.md` `a2bbe94c072d722a`, `.claude/skills/dev/references/07-completion.md` `4b79fe69fe7c42e4`. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch harvest` for the canonical templates.

## Post-adoption correction (2026-11-15)

Found during `/harness-bootstrap patch harvest`: the installed `07-completion.md` lacked the `First actions` line. Cause: the triage staging script copied the baseline file a second time for the closing-paragraph edit, overwriting the first edit; Validate scenario 5 checked stage ids but not the presence of `First actions` in all six references. Fixed directly in the live file; installed hash now `04e3bf906663c5c56d4344c8191e147d13e37fe48c27ebbf5cdc639ff5c865b9`. The candidate folder keeps the defective copy for history.

## Unresolved decisions

None blocking. Judgment call: the close step says to check `TaskList`, which costs one call; kept because the second reflection shows the tracker can be silently absent.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt all five and commit".
