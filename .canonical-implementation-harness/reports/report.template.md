---
name: Bootstrap Report Template
description: Blank structure for a fresh /harness-bootstrap run — copy to a new dated file at package:state/launch/reports/YYYY-MM-DD-HHMMSS-<mode>.md, per SKILL.md progress instructions and keep it updated for the duration of that run: Q&A answers plus per-stage/block status. Never overwrite this template itself, and never edit a prior run's dated file.
type: reference
---

# Harness Bootstrap — Report

| Field           | Value                                                          |
| --------------- | -------------------------------------------------------------- |
| Mode            | launch / patch-harvest / patch-prepare / patch-apply           |
| Package version | _(`metadata.version` from `SKILL.md` at the time of this run)_ |
| Status          | ⏳ Not started                                                 |
| Started         | _(ISO 8601 timestamp, set at Step 1)_                          |
| Ended           | _(ISO 8601 timestamp, set once Status becomes ✅ Complete)_    |

## Progress

**launch mode:** at run start, create one row per stage of the
[Launch task table](../references/launch/01-launch.md#launch-task-table) — that table is
the single source for stage names, order, and completion evidence. Statuses:
⏳ Pending / 🔄 In progress / ✅ Complete.

| #   | Stage | Status | Notes |
| --- | ----- | ------ | ----- |

## Launch checkpoints

- Execution host:
- Physical package path:
- Tracker: _(native tasks / native checklist / report)_
- Run ID / native Task IDs:
- JSON plan and materialization receipt:
- Manifest / local operation record:
- Canonical exceptions and decisions:
- Mermaid check manifest / pinned renderer / diagram count / failures / visual review:

| Known | Question | Value | Evidence source | Status |
| ----- | -------- | ----- | --------------- | ------ |

| Worker destination | Input hashes | Output hash | Coverage/evidence check | Status |
| ------------------ | ------------ | ----------- | ----------------------- | ------ |

Record per-output failures and invalidations in the operation record. Keep verified
independent results on resume. Final hashes are recorded after INTENT adaptation and cleanup.

**patch-harvest mode** — use these rows instead:

| #   | Step                      | Status     | Notes |
| --- | ------------------------- | ---------- | ----- |
| 1   | Inspect permanent changes | ⏳ Pending |       |
| 2   | Generalize and review     | ⏳ Pending |       |
| 3   | Record, write, and verify | ⏳ Pending |       |

**patch-prepare mode** — use these rows instead:

| #   | Step                          | Status     | Notes |
| --- | ----------------------------- | ---------- | ----- |
| 1   | Detect direct canonical edits | ⏳ Pending |       |
| 2   | Build the bundle              | ⏳ Pending |       |
| 3   | Verify and record             | ⏳ Pending |       |

**patch-apply mode** — use these rows instead:

| #   | Step                               | Status     | Notes |
| --- | ---------------------------------- | ---------- | ----- |
| 1   | Select canonical input and inspect | ⏳ Pending |       |
| 2   | Personalize and apply              | ⏳ Pending |       |
| 3   | Verify and record                  | ⏳ Pending |       |

## Patch outcome

- Scope:
- Providers: _(apply: deployed to; harvest: observed from; prepare: none)_
- Manifest UUID/path:
- Local operation record:
- Conflicts and decisions:
- Verification:
- Skipped or unresolved:

<!-- Keep per-file bookkeeping in state/operations, not duplicated here. Mirror native
Task status if available; otherwise this report is the durable progress tracker. -->

## Stats

| Field                     | Value                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Existing harness detected | none / partial / full _(from Stage 1d)_                                             |
| Satellite review verdict  | _(Block E — go, or iteration count up to 3)_                                        |
| LLD deviations found      | _(sum of deviations found across layer/component documentation reviews, if launch)_ |

### Efforts Spent

| Date | Stage/Block | Human time | AI tokens | Notes |
| ---- | ----------- | ---------- | --------- | ----- |

<!--
Same convention as dev/report-template.md's "Efforts Spent" table. One row per
working session, not per stage — a single sitting that covers several stages
is one row.
-->

## Answers

One row per applicable key from the
[question checklist](../references/launch/02-launch-questions.md); copy the checklist's
wording into Question at resolution time. Mark inapplicable branches explicitly.

| Key | Question | Answer |
| --- | -------- | ------ |
