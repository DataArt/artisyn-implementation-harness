# Ceremony stage

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage is the
official start of work on the ticket: assign and transition it via `@scrum-master`,
then get onto the right branch. It does no reading or writing of intent/plan content
— that's Context Gathering's and Plan's job respectively.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 1 — Tracker setup _(skip if no ticket number detected)_

If a ticket number was found in Context Gathering, present to the developer:

> "I'll assign {{PROJECT_KEY}}-XX to you and move it to **In Progress**. Confirm? (**yes** / **skip**)"

**Stop and wait for confirmation.**

If confirmed:

Invoke `@scrum-master`:

> "Start {TICKET}: assign to the authenticated user and transition to In Progress."

Once `@scrum-master` confirms, continue immediately to Step 2.

## Step 2 — Feature branch checkout

Before any planning or implementation work, confirm the developer is on the correct feature branch:

> "Are you on the feature branch for this ticket? If not:
>
> ```bash
> git checkout -b feat/{ticket-lowercase}-{slug}
> ```
>
> (skip if already on it)"

**Stop and wait for confirmation.** Do not proceed until the developer confirms they are on the branch.

## Step 3 — Advance phase and report back

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan 🔄 · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳
```

Tell the developer the ticket is assigned/transitioned and the branch is confirmed.
The router owns the phase-boundary confirmation before Plan starts — do not ask it here.

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Plan).
