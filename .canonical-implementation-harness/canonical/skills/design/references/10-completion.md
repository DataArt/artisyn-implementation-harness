# Completion stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics
unit is `--stage completion`. First action, at Step 1: `stage start --stage completion`.
Follow the pattern's wait, check, and exit commands for everything after. When
this reference is used only as a correction recipe within another active
stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`.
Completion is the final stage. It runs once Publish has recorded its sign-off
(the normal **approved** path), or directly after Address Feedback records a
**decline** — Publish is skipped entirely in that case, since there are no
permanent docs to update. It also runs alone via
`{{provider:invoke:design}} complete {TICKET}` — for a design whose docs
landed but was never archived. It ends the design lifecycle: report
finalized, story archived (to `approved/` or `declined/`), tracker synced, and
— for an approved design — PR text handed over.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`. When this stage is complete, the design lifecycle is closed — no router handoff needed.

## Step 1 — Check the design is ready and read the gate outcome

`$DESIGN_DIR` comes from the router's Resume Detection — already pointing at
the `approved/`/`declined/` path if the story was archived. If it is already
archived, treat that as already complete and report the archived path,
nothing further to do.

Read `design/Report.md`'s `## Gate` section. Set `{outcome}` for the rest of
this stage from its `Approved:` field:

- A date → **approved**. The Publish phase row must be `✅`; if not, tell the
  developer which phase to complete first and stop.
- `declined` (recorded by Address Feedback, Step 3) → **declined**. Publish is
  skipped entirely for a declined design — do not require its phase row.
- `pending` or unset → tell the developer the gate isn't resolved yet and stop.

---

## Step 2 — Publish implementation tickets _(approved only)_

Skip this step entirely when `{outcome}` is **declined** — go straight to Step 3.

{{DESIGN_HANDOFF_NOTE}}

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval condition: `solution/Efforts.md`'s WBS is unambiguous — every row
is a clear, outcome-sized ticket with no open question about scope or owner.

Condition met → publish without asking: delegate to `@scrum-master` with the
approved WBS from `solution/Efforts.md` — summaries, types, layer, and
dependency links. Report the created ticket keys in one line.

Condition fails (a WBS row is ambiguous, or the developer's repo topology
means tickets are built downstream, not here) → this is a sign-off gate
(`patterns/approval-sign-off.md`):

> "Publish the {N} implementation tickets from `solution/Efforts.md` to the tracker? (**yes** / **no**)"

**Stop and wait.** If **no**, record in `design/Report.md` that implementation
tickets were not published.

---

## Step 3 — Archive

Run the archive directly (do not present as a user instruction), to
`approved/` or `declined/` depending on `{outcome}`:

```bash
git mv "{{DESIGN_STORIES_ROOT}}[{TICKET}] {name}" "{{DESIGN_STORIES_ROOT}}{approved|declined}/[{TICKET}] {name}"
```

Moving into the subfolder adds one directory level — any relative Markdown
link inside the moved `design/*.md` or `solution/*.md` files that points back
up to `{{DESIGN_DOCS_ROOT}}` (or any other ancestor path) now needs one more
`../` than before. Grep the archived folder for relative links one level
short of the new depth (e.g. `grep -rn '\.\./\.\./\.\./[A-Z]' "{{DESIGN_STORIES_ROOT}}{approved|declined}/[{TICKET}] {name}"`)
and add the missing `../` to each match. Do this before reporting the step
complete — don't rely on a later docs build to catch it.

Report to the developer: "Design folder archived to `{{DESIGN_STORIES_ROOT}}{approved|declined}/[{TICKET}] {name}`. Checked and fixed relative links broken by the move."

---

## Step 4 — Tracker sync

Derive the worklog effort from the design metrics: total observed work time in
`design/stat.json` (via the `report` output), rounded to a sensible worklog
unit. Delegate to `@scrum-master`: log the worklog with that effort, then:

- **Approved** → transition `{TICKET}` to Done, or ask which status only if
  the ticket's workflow offers alternatives.
- **Declined** → transition `{TICKET}` to the workflow's rejected/won't-do
  status, or ask which status if none is obvious. Do not mark it Done.

Report the outcome in one line, naming the logged effort, the transition, and
its source.

---

## Step 5 — Sign-off

Apply `patterns/phase-sign-off.md`. Present, in one message: the outcome,
tickets published (or skipped — always skipped if declined), the archived
path, and the tracker sync outcome.

> "Design {outcome}. Story archived to `{{DESIGN_STORIES_ROOT}}{approved|declined}/[{TICKET}] {name}`;
> implementation tickets: {created keys / skipped}; {TICKET} synced ({worklog}, {new status}).
> Good to go, or anything to fix before I hand over the commit{ and PR, if approved}?"

`report`, then `wait start --reason approval --detail "Awaiting completion sign-off"`.
**Stop and wait.** On approval, record the acceptance check
(`--name "Completion sign-off"`, `--source developer`); without it
`stage complete` is refused.

## Step 6 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ✅ · 📤 Publish ✅ · 🏁 Completion ✅`
- Set Status to `✅ Complete`.

Then metrics `report`, `stage complete --stage completion`, `complete`.

## Step 7 — Commit and PR

Propose the commit:

> `docs({TICKET}): complete, archive design folder ({outcome}), sync tracker`

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit
exists and the worktree holds nothing from this phase. If not, say what is
missing and wait again.

**Approved** — once confirmed, hand over the PR text (do not open it
yourself — that is a guarded command the developer runs):

> "Suggested PR title: `Design: {TICKET} — <short title>`
>
> Suggested PR body:
>
> ## Design: {TICKET} — <short title>
>
> Recommended option: <option name>. See `{{DESIGN_STORIES_ROOT}}approved/[{TICKET}] {name}/design/` and `solution/`.
>
> ### Summary
>
> - {1–2 lines from the solution}
> - Implementation tickets: {created keys / skipped}"

End the session with a congrats message: "{TICKET} is designed and archived — nice work."

**Declined** — no PR to hand over; the permanent docs were never updated.
End the session with a neutral close: "{TICKET} was declined at review and
archived to `{{DESIGN_STORIES_ROOT}}declined/[{TICKET}] {name}`. Decline reason:
{`design/Report.md`'s `## Gate` → `Decline reason:` field}."
