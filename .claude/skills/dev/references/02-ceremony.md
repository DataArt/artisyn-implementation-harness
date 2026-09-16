# Ceremony stage

Apply `.claude/skills/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage ceremony`.

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage is the
official start of work on the ticket: assign and transition it via `@scrum-master`,
then get onto the right branch. It does no reading or writing of intent/plan content
— that's Context Gathering's and Plan's job respectively.

Apply `patterns/approval-sign-off.md`: follow dependencies, continue routine authorized work,
and pause only for a concrete unresolved decision, required human verification, or a
fixed sign-off gate (`patterns/approval-sign-off.md`).

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 1 — Tracker setup _(skip if no ticket number detected)_

If a ticket number was found in Context Gathering, invoke `@scrum-master` to read the
ticket's current assignee and status first — never assume it's untouched.

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval conditions: unassigned (or already assigned to the authenticated
user); in a pre-work status (Backlog/To Do/Selected); and In Progress is the
confirmed, unambiguous next workflow transition.

All conditions met → auto-approve: invoke `@scrum-master`:

> "Start {TICKET}: assign to the authenticated user and transition to In Progress."

then announce what was done (ticket, prior status, new status), record a one-line
note in `2-report.md` (e.g. its Notes/Efforts area) that ceremony auto-assigned the
ticket, and continue to Step 2 without asking first.

Any condition fails or is uncertain (already assigned elsewhere, already past In
Progress, or the next status isn't obvious) → this is a sign-off gate
(`patterns/approval-sign-off.md`): present to the developer:

> "ND-XX is currently `{assignee}` / `{status}`. I'll assign it to you and move it to
> **In Progress**. Confirm? (**yes** / **skip**)"

Use existing tracker authorization if already given, otherwise ask once. If
confirmed, invoke `@scrum-master` with the same start instruction above. Once
`@scrum-master` confirms (either path), continue to Step 2.

## Step 2 — Feature branch checkout

Inspect the current branch and worktree. If already on the correct feature branch,
continue without asking — that's a fact available from Git, not a decision. Otherwise,
branch checkout is a manual operation: never run `git checkout`/`git switch` yourself.
This is a sign-off gate (`patterns/approval-sign-off.md`) — present the exact command for the
developer to run:

> "Please check out the feature branch for this work:
>
> ```bash
> git checkout -b feat/{ticket-or-local-id}-{slug}
> ```
>
> (or tell me a different name if this one's wrong)
>
> Let me know once you're on it."

**Stop and wait for the developer's sign-off** that they've run it. Preserve unrelated
changes; if switching would conflict, surface that instead of proposing the command.

## Step 3 — Advance phase and report back

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan 🔄 · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳
```

Tell the developer the ticket is assigned/transitioned and the branch is confirmed.
Continue to Plan for full-flow entry.

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Plan).
