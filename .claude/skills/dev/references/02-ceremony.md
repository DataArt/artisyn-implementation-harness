# Ceremony stage

Apply `.claude/skills/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage ceremony`. First action: `stage start --stage ceremony`.

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage is
the official start of work: assign and transition the ticket via `@scrum-master`,
and get onto the right branch. It reads and writes no intent or plan content.

Two stops in this stage: the branch checkout in Step 2, which is the phase sign-off, and
the commit in Step 4.
Step 1 is an intelligent checkpoint (`patterns/approval-intelligent.md`).

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Tracker setup _(skip if no ticket number detected)_

Ask `@scrum-master` for the ticket's current assignee and status first. Never assume
it is untouched.

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval conditions:

- Unassigned, or already assigned to the authenticated user
- In a pre-work status (Backlog / To Do / Selected)
- In Progress is the obvious next transition

All met → invoke `@scrum-master`:

> "Start {TICKET}: assign to the authenticated user and transition to In Progress."

Announce what was done (ticket, prior status, new status), add a one-line note in
`2-report.md` that ceremony auto-assigned the ticket, and continue.

Any condition fails or is uncertain (assigned to someone else, already past In
Progress, next status not obvious) → ask once:

> "ND-XX is currently `{assignee}` / `{status}`. I'll assign it to you and
> move it to **In Progress**. Confirm? (**yes** / **skip**)"

Before stopping: `report`, then `wait start --reason approval --detail "Tracker
transition"`. **Stop and wait.** On the reply, `resume --activity planning` and act
on the answer.

## Step 2 — Sign-off: the feature branch

Apply `patterns/phase-sign-off.md`. If you are already on the feature branch
for this ticket, say so; that is a fact from Git, not a decision, and the sign-off is
just "we're on `{branch}`, continuing". Otherwise the branch is where all the work
lands, so the developer confirms it. Checkout is their operation; never run
`git checkout`/`git switch` yourself. Propose the exact command:

> "Ticket is {assigned / transitioned / unchanged}. Please check out the feature
> branch for this work:
>
> ```bash
> git checkout -b feat/{ticket-or-local-id}-{slug}
> ```
>
> or tell me a different name. Let me know once you're on it."

If the worktree has unrelated changes, say so in the same message instead of
proposing a switch that would conflict. Never discard or stash the developer's
changes. On the reply, check the branch with Git before continuing; if it is not the
one agreed, say so and wait again. Then record the acceptance check (`--name
"Ceremony sign-off"`, `--source developer`, evidence: the branch name they confirmed);
without it `stage complete` is refused. If you were already on the branch, record it
with `--source self` and the branch name; that is the one sign-off the developer gave
implicitly, by being there.

## Step 3 — Report

Set the Branch row in `2-report.md` to the
actual branch and the `Phase` row to
`🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan 🔄 · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳`.
Add a one-line note if the ticket was auto-assigned. Then metrics `report`.

## Step 4 — Commit

Nothing new beyond the report rows. If Context's commit is still pending, propose it
again with these rows included; otherwise propose
`docs({ticket-lowercase}): record branch and tracker state`.

This is a manual-operation sign-off (`patterns/approval-sign-off.md`): the developer
runs the commit, you wait. `wait start --reason user_input --detail "Awaiting commit"`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists and the
worktree holds nothing from this phase. If not, say what is missing and wait again.
Then `stage complete --stage ceremony`. Tell the developer which branch you're on and continue to Plan for full-flow entry.

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Plan).
