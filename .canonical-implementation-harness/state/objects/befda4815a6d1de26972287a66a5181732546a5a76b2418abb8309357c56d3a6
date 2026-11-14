# Ceremony stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics
unit is `--stage ceremony`. First action: `stage start --stage ceremony`.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`.
This stage is the official start of work: assign and transition the ticket via
`@scrum-master`, and get onto the right branch. It reads and writes no framing
content — that's Frame's job.

Two stops in this stage: the branch checkout in Step 2, which is the phase
sign-off, and the commit in Step 4. Step 1 is an intelligent checkpoint
(`patterns/approval-intelligent.md`).

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`.

## Step 1 — Tracker transition _(skip if no ticket number detected)_

Invoke `@scrum-master` to read the ticket's current assignee and status first —
never assume it's untouched.

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval conditions: unassigned (or already assigned to the authenticated
user); in a pre-work status (Backlog/To Do/Selected); and In Progress is the
confirmed, unambiguous next workflow transition.

All conditions met → auto-approve: invoke `@scrum-master`:

> "Start {TICKET}: assign to the authenticated user and transition to In Progress."

Announce what was done (ticket, prior status, new status), add a one-line note
in `design/Report.md` that ceremony auto-assigned the ticket, and continue to
Step 2 without asking first.

Any condition fails or is uncertain (already assigned elsewhere, already past In
Progress, or the next status isn't obvious) → this is a sign-off gate
(`patterns/approval-sign-off.md`): present to the developer:

> "{{PROJECT_KEY}}-XX is currently `{assignee}` / `{status}`. I'll assign it to you and
> move it to **In Progress**. Confirm? (**yes** / **skip**)"

Use existing tracker authorization if already given, otherwise ask once. **Stop
and wait for confirmation.** If confirmed, invoke `@scrum-master` with the same
start instruction above.

## Step 2 — Sign-off: the feature branch

Apply `patterns/phase-sign-off.md`. If you are already on the feature branch for
this ticket, say so; that is a fact from Git, not a decision, and the sign-off
is just "we're on `{branch}`, continuing". Otherwise the branch is where all the
work lands, so the developer confirms it. Checkout is their operation; never run
`git checkout`/`git switch` yourself. Propose the exact command:

> "Ticket is {assigned / transitioned / unchanged}. Please check out the feature
> branch for this work:
>
> ```bash
> git checkout -b docs/{ticket-lowercase}-{slug}
> ```
>
> or tell me a different name. Let me know once you're on it."

If the worktree has unrelated changes, say so in the same message instead of
proposing a switch that would conflict. Never discard or stash the developer's
changes. On the reply, check the branch with Git before continuing; if it is
not the one agreed, say so and wait again. Then record the acceptance check
(`--name "Ceremony sign-off"`, `--source developer`, evidence: the branch name
they confirmed); without it `stage complete` is refused. If you were already on
the branch, record it with `--source self` and the branch name; that is the one
sign-off the developer gave implicitly, by being there.

## Step 3 — Report

Set the `Branch` row to the actual branch and the `Phase` row to
`🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`.
Add a one-line note if the ticket was auto-assigned. Then metrics `report`.

## Step 4 — Commit

Nothing new beyond the report row. If Context Gathering's commit is still
pending, propose it again with this row included; otherwise propose
`docs({TICKET}): record branch and tracker state`.

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage ceremony`. Tell the developer which
branch you're on and continue to Frame for full-flow entry.

🔁 Re-read `{{provider:skills_root}}/design/SKILL.md` and resume the router from the next stage (Frame).
