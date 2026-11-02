# Document stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage document`. First action: `stage start --stage document`.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This stage
keeps the permanent docs true after the change: find out what the change means for
them, decide what is new, updated or retired, hand the writing to `@docs-writer`, and
close the findings and tech debt. Archiving, the PR and the tracker close-out are
Completion's job.

This stage knows **where** things live and **what** changed. **How** to write a doc
(diagram-first, certainty, length) is `@docs-writer`'s concern; do not restate it here.

Two stops in this stage: the sign-off in Step 6 (`patterns/phase-sign-off.md`) and
the commit in Step 8. Steps 2 to 5 are intelligent checkpoints
(`patterns/approval-intelligent.md`).

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Read

`$IMPL_DIR` comes from the router's entry check. If the `Phase` row does not show
Test ✅, say which stage is still open and stop.

Read, in this order:

- `1-plan.md` — the Solution section and the steps: what was built, where
- `2-report.md` — implementation notes, review findings, tech debt, `architecture-notes.md` if present
- `{{DOC_STRUCTURE_ARTICLE}}` — the tiers, what belongs in each, naming
- `docs/Target Architecture (HLD)/README.md` for the active version, and
  `docs/System Architecture (LLD)/README.md` for what LLD docs exist today

Set the `Phase` row to
`🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document 🔄 · 🏁 Completion ⏳`.

## Step 2 — Deviation audit

Does what was built match what the architecture says? Ask `@architect`, read-only:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Compare the implementation of `<ticket>` (plan: `<1-plan.md path>`, changed files: `<list>`) against that version's container docs and `Non-Functional Concerns/Requirements.md`. Report only evidence-backed deviations, one per line, each tagged `contradiction` (built differently from a settled decision), `extension` (built something the HLD does not describe) or `omission` (an HLD or NFR requirement the change should have met and did not), with severity by impact and the file/section as evidence. LLD being out of date is not a deviation. Do not write or edit any files."

Record every line as an RF row (`patterns/review-gate.md`: origin `hld-audit`, kind
`deviation`, its type, its severity), reusing the ID when an earlier review already
found it. With no findings, write one line of coverage in the report.

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approve when **all** of these hold:

- No row is `critical` or `high`
- Every `contradiction` already has an attributed decision on record (a plan
  deviation the developer accepted, or a Test-stage finding they resolved)
- Every `omission` is already fixed or already accepted on record
- Every `extension` needs nothing but a doc row in Step 3

Then say in one line what was audited and that nothing new needs a decision, and
continue.

Otherwise stop here, before planning the docs, because the answer decides what gets
written. Present each unresolved row with its options:

- **fix** — change the code; that step goes back through Implement and Test first
- **accept** — keep the deviation, with the rationale, recorded on the row
- **retarget** — the HLD decision itself changes; needs the developer's explicit say

`report`, `wait start --reason approval` naming the RF IDs, **Stop and wait**. Record
each decision in its row with attribution, then re-check the list above.

## Step 3 — Doc impact list

From the plan, the report, the audit and the structure article, list every doc or
section this change touches. One row each, with the tier from the structure article
and the action:

| Doc / section                                                         | Tier       | Action  | Why                                |
| --------------------------------------------------------------------- | ---------- | ------- | ---------------------------------- |
| `<app root>/README.md` → Env vars                                     | App README | updated | new `<VAR>` read at startup        |
| `System Architecture (LLD)/<container>/<NN Title>.md`                 | LLD        | new     | built flow, not described anywhere |
| `Target Architecture (HLD)/<active>/Containers/<Name>.md` → <section> | HLD        | updated | settled decision changed (RF-NNN)  |
| `Engineering Guide/<NN Title>.md`                                     | Eng Guide  | retired | replaced by the LLD page           |

`<app root>` is wherever this project keeps that app (a monorepo folder, the repo
root for a single app, a package); the structure article's "App README scope" says
what belongs there. Rules that decide the rows, all from the structure article and
the plan:

- A built flow, contract, schema or decision with no LLD home → **new** LLD section
- An existing doc that now says something false → **updated**, including HLD when a
  settled target decision changed and that change is authorised (an RF row says so)
- A doc or section that describes something the change removed → **retired**
- Approved-design impacts (`solution/` artifacts) are rows too; do not postpone them
- Nothing lands in two tiers; the structure article says which one owns it

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval conditions, all required:

- Every row has a tier the structure article names and a reason traceable to the
  plan, the report or an RF row
- No HLD row changes a target decision without an RF row authorising it
- No row is a judgment the developer has not made (what to retire from the
  Engineering Guide, whether a decision is settled)

All met → write the list into `## Documentation` in `2-report.md` and continue.
Otherwise present the uncertain rows with the options, `report`, `wait start
--reason user_input` naming them, **Stop and wait**, record the answers, re-check.

## Step 4 — Write

Delegate the whole list to `@docs-writer` in one call: the table from Step 3, the
source material for each row (plan Solution, implementation notes, architecture
notes, RF decisions), and the settled outcomes to record. It applies the doc
principles; you do not repeat them. Retired docs: it removes them and fixes
references, including the docs-site navigation if the project has one.

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`) on what comes back. Auto-approval conditions:

- Every row in the list has a returned line, and the action matches (new / updated /
  retired)
- Nothing was skipped or flagged for clarification

All met → mark each row done in `## Documentation` and continue. Otherwise answer
the flags from the sources you have, or ask the developer the precise question
(`report`, `wait start --reason user_input`, **Stop and wait**), then re-delegate the
affected rows.

For each row marked done (new or updated — this doc just graduated), call
`node docs/.og/cli.mjs index --dir . --doc <source-path> --edge <type> --to
<destination-path>` automatically — edge direction is source-first, matching the
edge-type names (`impl-to-hld` etc.): `<source-path>` is this ticket's `1-plan.md`
or `2-report.md`, whichever is the source of the change; `<destination-path>` is
the HLD/LLD/Engineering Guide/README doc that just graduated (the row marked done
above); `<type>` is the matching graduation edge
(`impl-to-hld`/`impl-to-lld`/`impl-to-engineering-guide`/`impl-to-readme`). `--to`'s
target must already be indexed (it errors otherwise); if the destination doc is
new, index it with a plain `index --doc <destination-path>` call first, then this
one. Non-blocking: on failure, report it in one line and continue — never stop
the stage for this.

## Step 5 — Consistency review and closure

Ask `@architect`, read-only, to check the written docs against each other, the HLD
and the code: contradictions, stale references, broken links, a diagram that no
longer matches the flow. Record findings (origin `doc-consistency`), fix routine ones
through `@docs-writer`, review again. At most three rounds; if something is still
open after the third, it is a decision for the developer below, not a fourth round.

Then close the ledgers. Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval conditions:

- The last consistency round returned no findings
- Every RF row is `fixed`, `accepted`, `tech-debt` or `doc-updated`, with evidence;
  no `critical`/`high` accepted or deferred without an attributed decision already
  on record
- Every TD row has an owner and a next action, and none waives a required AC
- `quality validate --dir "$IMPL_DIR"` passes after `report`

All met → note in `2-report.md` that closure ran clean and continue. Otherwise
present the open decisions (risk acceptance, deferral, target change, a consistency
finding that survived three rounds), `report`, `wait start --reason approval` naming
them, **Stop and wait**, record each decision in its row with attribution, re-check.

## Step 6 — Sign-off (rework if any)

Apply `patterns/phase-sign-off.md`. Present the `## Documentation` table as written
(doc, tier, action, done), the consistency verdict, and the closed ledgers.

> "Docs are current: {N} new, {M} updated, {K} retired. Findings and tech debt
> closed. Good to move to Completion (archive, PR)?"

`report`, then `wait start --reason approval --detail "Awaiting document sign-off"`.
**Stop and wait.** No reply, no next step. On approval, record the acceptance check
(`--name "Document sign-off"`, `--source developer`, their words as evidence); without
it `stage complete` is refused.

Rework: adjust the list, re-delegate the affected rows, repeat Step 5, present again.

## Step 7 — Report

Fill the Docs column per progress row (`✅` / `—`), confirm `## Documentation` is
current, set the `Phase` row to
`🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ · 🏁 Completion 🔄`,
then metrics `report`.

## Step 8 — Commit

`docs({scope}): <what the docs now describe>` for the permanent docs and
`docs({ticket-lowercase}): close findings and tech debt` for the report, or one
commit if small.

Manual-operation sign-off (`patterns/approval-sign-off.md`): `wait start --reason
user_input --detail "Awaiting commit"`, **Stop and wait.** On the reply, check
`git log`/`git status`; if something is missing, say what and wait again. Then
`stage complete --stage document`. For direct-stage entry, stop here and tell the
developer to run `{{provider:invoke:dev}} complete {TICKET}`.

🔁 Re-read `{{provider:skills_root}}/dev/SKILL.md` and resume the router from the next stage (Completion).
