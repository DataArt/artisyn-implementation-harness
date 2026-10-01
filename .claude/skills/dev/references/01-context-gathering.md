# Context Gathering stage

Apply `.claude/skills/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage context`. Metrics start in Step 2b below, not at the end of the stage.

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage
captures what the ticket actually means, once: from the tracker, any approved design,
and the developer's own words. It writes that down as `0-intent.md` before any branch
or plan work starts. Read-only apart from the story folder, the report skeleton and
the intent file.

Two stops in this stage: the sign-off in Step 5 on the written intent, and the commit in Step 7. The sign-off
(`patterns/phase-sign-off.md`). It covers both the gathered context and the intent
written from it; gaps and conflicts are asked there, as open questions in the file,
not earlier. Everything planned later derives from that file.

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Parse the input

Detect the input shape:

- **Ticket only** — `ND-42`
- **Free-form only** — no ticket number (e.g. `hey lets build CI pipelines. Thoughts: 1 2 3`)
- **Mixed** — ticket number followed by free-form text

A ticket number matches `ND-\d+`. If none is found, reuse an existing
matching `DEV-YYYYMMDD-XXXX` story ID when there is one; otherwise generate a
collision-checked `DEV-YYYYMMDD-XXXX` local ID before creating files.

Extract:

- **ticket** — `ND-\d+` if present, otherwise the local ID
- **problem** — what to build or fix (may be empty for ticket-only)
- **thoughts** — the developer's initial ideas (may be empty)
- **context** — file paths, URLs, doc references

## Step 2 — Fetch tracker context _(skip if free-form only)_

Invoke `@scrum-master`:

> "Fetch {TICKET}: return summary, description, acceptance criteria, linked ND tickets, and any Confluence page URLs."

Then fetch each linked Confluence page and pull out the relevant content
(requirements, specs, design notes). Note constraints from other `ND-*`
tickets the description references. This is a read only: do not assign or
transition the ticket here, that is Ceremony's job.

**Merging with developer input (mixed case):** the developer's problem and thoughts
win over tracker content if they conflict. Tracker/Confluence is background and
acceptance criteria; developer input is the primary intent.

**If `@scrum-master` reports a tracker error** (timeout, auth, not found): do not
block. Continue with developer input only, note `Tracker unavailable` in the intent's
sources, and ask for the missing pieces:

> "I couldn't fetch ND-XX from the tracker. To continue, please paste:
>
> - **Summary** — one-line ticket title
> - **Description** — what needs to be built
> - **Acceptance criteria** — how to know it's done (if any)"

**Stop and wait** for that before Step 2b. Record `wait start --reason user_input`
only if metrics already exist (they won't on a fresh ticket; that is fine).

## Step 2b — Create the story folder, report skeleton and start metrics

Do this now, before the heavy reading. The story name is known at this point: the
ticket summary, or a short slug of the free-form problem.

- Glob for `docs/Stories/*{TICKET}*/` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`)
- If a design folder already exists (e.g. `[{TICKET}] {name}/`), create `impl/` inside it
- Otherwise create `docs/Stories/[{TICKET}] {name}/impl/`

The folder name is **stable for the life of the ticket**. Never rename it. Phase
state lives in the `Phase` row of `2-report.md`, not in the folder name. Use only
ASCII characters in the name: no emoji, no em dash. Some scanners cannot index such
folders.

Create `impl/2-report.md` from `.claude/skills/dev/templates/report.md`:

- `{TICKET}` and `<Short Title>` — from the ticket / intent title
- Header table — fill Ticket and Author (`git config user.name`); Branch is `—` until
  Ceremony sets it; PR `—`; Status `🔄 In Progress`; Phase
  `🎯 Context 🔄 · 🚀 Ceremony ⏳ · 📋 Plan ⏳ · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳`
- Leave the Progress table empty; Plan fills it

Then initialise metrics and start the stage, reusing the same `git config user.name`
value:

```sh
node .claude/skills/dev/scripts/timing.mjs init --dir "$IMPL_DIR" --ticket "$TICKET" --author "$AUTHOR"
node .claude/skills/dev/scripts/timing.mjs stage start --dir "$IMPL_DIR" --stage context
```

Everything from here on is recorded as Context work.

## Step 3 — Check for approved design

- Glob for `docs/Stories/*{TICKET}*/solution/Architecture.md` (use `*{TICKET}*` wildcard)
- If found, read the story's `design/Report.md` and the paths in its
  `selected_artifacts`. Those approved files are the spec. Do not assume a fixed
  Architecture/Design/Stack/Efforts set.

If found, tell the developer:

> "Found approved design for `{TICKET}` — reading `solution/Architecture.md` and the selected solution artifacts as the source of truth for intent and planning."

The solution files are the primary spec for the intent. Developer input and tracker ACs
supplement; they do not override the solution. If nothing is found, continue; intent
comes from the tracker and the developer alone.

## Step 3.5 — Verify uncertain platform/framework conventions

If the intent depends on a specific external platform, service or framework
convention (required file layout, config keys, manifest fields, API shape) and you
are not sure about it, fetch the official docs first: `WebFetch` the vendor page if
the URL is known, or `WebSearch` to find it. Skip this for things you know well
(a standard `package.json`, common language idioms). This is for cases where getting
it wrong is plausible, not a mandate to fetch docs for everything.

Cite what you consulted (the URL) in the intent's sources.

## Step 3.6 — Identify the HLD container(s) in scope

Read `docs/Target Architecture (HLD)/README.md` to find the active version and its
container index, then name the container(s) this ticket falls under. This is a
quick identification, not the deep read; that happens in Plan Step 1. The point is
to catch an obvious boundary mismatch (scope that belongs to a different container,
or spans containers unexpectedly) while it is still cheap to fix.

Include the container(s) in the intent. If the scope does not map cleanly,
say so rather than silently picking one.

## Step 4 — Write 0-intent.md

Write `impl/0-intent.md` following `.claude/skills/dev/interfaces/intent.md`.
That file is an interface, not a template: it lists the questions the intent must
answer (problem, what better looks like, who is affected, out of scope, constraints,
open questions) and leaves the shape to you. Write in the originator's own words,
link every source, keep it short. No steps, no acceptance criteria, no solution;
those belong to the plan.

Write it even when the context is incomplete. Anything you could not settle goes in
as an open question, with what you found so far: a missing description or
acceptance criteria, a conflict between the developer's words and the tracker, a
boundary concern from Step 3.6, a design change the developer hinted at. The
developer answers those in the sign-off, against the written file, not against a
chat summary.

## Step 5 — Sign-off

Apply `patterns/phase-sign-off.md`. The developer confirms the written
intent, not a chat summary (`patterns/write-confirm.md`). Present:

> "Intent written to `docs/Stories/[{TICKET}] {name}/impl/0-intent.md`. In short:
>
> - **Problem**: `<one line>`
> - **Better looks like**: `<one line>`
> - **Affected**: `<users / apps / container(s)>`
> - **Out of scope**: `<one line or 'nothing stated'>`
> - **Constraints**: `<one line or 'none'>`
> - **Open questions**: `<list or 'none'>`
> - **Sources**: `<ticket, pages, design, your message>`
>
> Is this the right intent? Anything missing, wrong, or out of scope before I
> plan against it? {If there are open questions: "I need your answer on the open
> questions above before Plan."}"

`report`, then `wait start --reason approval --detail "Awaiting context sign-off"`.
**Stop and wait.** No reply, no next step. On approval, record the acceptance check
(`--name "Context sign-off"`, `--source developer`, their words as evidence); without
it `stage complete` is refused.

Rework: update `0-intent.md` with the answers and present again. Once approved, the
intent is confirmed; only the open questions may be appended later.

## Step 6 — Report

Set the `Phase` row to
`🎯 Context ✅ · 🚀 Ceremony 🔄 · 📋 Plan ⏳ · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳`,
then metrics `report`.

## Step 7 — Commit

The story folder is new. Propose:

```
docs({ticket-lowercase}): capture intent for {short-name}
```

covering `docs/Stories/[{TICKET}] {name}/impl/` (intent, report skeleton, stat.json).

This is a manual-operation sign-off (`patterns/approval-sign-off.md`): the developer
runs the commit, you wait. `wait start --reason user_input --detail "Awaiting commit"`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists and the
worktree holds nothing from this phase. If not, say what is missing and wait again.
Then `stage complete --stage context`. Continue to Ceremony for a full-flow request; stop here for direct entry.

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Ceremony).
