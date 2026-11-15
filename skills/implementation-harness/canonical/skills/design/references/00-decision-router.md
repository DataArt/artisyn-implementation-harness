# Decision router

Shared loop mechanics for a stage running against two or more confirmed
decisions (`design/00 Frame.md`'s `## Decisions` section, confirmed at
Frame's dedicated decisions sign-off — Step 2). `patterns/multi-decision-split.md`
owns which artifacts split per decision and which stay single; this file owns
how a stage actually runs the loop without multiplying its stops.

## The rule

A stage with N confirmed decisions still closes with exactly one
Sign-off → Report → Commit — never one per decision, and never ambiguous
about which steps repeat. Only the content-producing steps loop; the closing
steps run once, after every decision's content is drafted, presenting all N
together in that one sign-off.

## Per-stage loop boundary

| Stage    | Loops (once per decision)                                                                                                                                                                       | Closes once, not looped               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Research | Steps 2, 2b, 3 (delegate → OQ triage → save) — produces `design/01 Research - {Decision}.md` each                                                                                               | Steps 4–6 (Sign-off, Report, Commit)  |
| Evaluate | Steps 1b–6 (resolve viability OQs → matrix → recommendation → closing WAF → save) — reads the matching `design/01 Research - {Decision}.md`, produces `design/02 Evaluate - {Decision}.md` each | Steps 7–9 (Sign-off, Report, Commit)  |
| Solution | Step 3 only (`solution/Design - {Decision}.md`) — `Architecture.md`, `Stack.md`, `Efforts.md` stay single files regardless of decision count                                                    | Steps 8–10 (Sign-off, Report, Commit) |

A stage with at most one decision ignores this file entirely: no looping, no
`{Decision}` suffix, proceed exactly as the steps read.

## Tracking each decision as a task

Apply `{{provider:skills_root}}/design/patterns/task-tracking.md` with the
confirmed decisions as the unit list: one task per decision, in the order
Frame listed them, as children of the stage-level task the router already
created for Research/Evaluate/Solution — the same shape `dev`'s Implement
stage uses for its plan steps. Mark each decision's task `in_progress` when
its loop iteration starts and `completed` only once that iteration's file is
actually written (not on a self-report). This is native-tool metadata for the
developer to watch progress by (a Claude task, a Codex todo, or whatever the
host provides) — `design/Report.md` stays the durable record regardless of
which native tool is present or absent.

## The closing sign-off, with N decisions

Present every decision's result together, named explicitly — not "see the
files," the actual per-decision summary (options count, recommendation, P1s,
whatever that stage's sign-off already shows for one decision, repeated once
per decision in the same message). One `wait start`, one acceptance check,
one commit covering every decision's files from that stage.

## Why a separate file

`patterns/multi-decision-split.md` is a content/file-split policy — which
artifacts become per-decision files. This is a control-flow rule — where the
loop starts and stops within a stage's own step sequence, so a stage with
multiple decisions never turns into multiple approval gates. Keeping it
separate means each stage reference states one line pointing here, instead
of restating — and inconsistently scoping, as "loop this phase" vs. "loop
this step" demonstrated — the same rule three times.
