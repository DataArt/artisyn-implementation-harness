# Context Gathering stage

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage exists
because what reaches planning is otherwise several steps removed from what the
originator meant — it captures the ticket's intent once, from tracker/Confluence,
any approved design, and the developer's own words, and persists it as `intent.md`
before any tracker/branch ceremony or plan-writing begins. Read-only except for the
final write in Step 5.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 0 — Idempotency check (direct stage invocation)

This check fires when this stage is entered directly (`/dev context {TICKET}`) —
the router's own resume check already handled the bare `/dev {TICKET}` case before
delegating here, so this only guards a deliberate re-run request.

- Glob for `docs/Stories/*{TICKET}*/impl/2-report.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`)
- If the file exists, read it and extract the `Phase` row from the header table

If stale state is found, present:

> "I found an existing intent/report for `{TICKET}`:
>
> - Intent: `docs/Stories/{folder}/impl/intent.md`
> - Report current phase: `{phase-row}`
>
> Start fresh (overwrite) or stop here and use `/dev plan {TICKET}` to resume? (**overwrite** / **stop**)"

**Stop and wait.**

- If **stop** — report the folder path and exit. Do not continue.
- If **overwrite** — continue normally from Step 1 below.

If no stale state is found — continue normally from Step 1.

## Step 1 — Parse the input

Detect the input shape:

- **Ticket only** — `{{PROJECT_KEY}}-42` — no additional text
- **Free-form only** — no ticket number present (e.g. `hey lets build CI pipelines. Thoughts: 1 2 3`)
- **Mixed** — ticket number followed by free-form text (e.g. `{{PROJECT_KEY}}-42 hey lets build CI pipelines. Thoughts: 1 2 3`)

A ticket number matches the pattern `{{PROJECT_KEY}}-\d+`. If none is found, use `{{PROJECT_KEY}}-000` as a placeholder.

Extract from the arguments:

- **ticket** — `{{PROJECT_KEY}}-\d+` if present, otherwise `{{PROJECT_KEY}}-000`
- **problem** — free-form description of what to build or fix (may be empty for ticket-only)
- **thoughts** — developer's initial implementation ideas (may be empty)
- **context** — any file paths, URLs, or doc references

## Step 2 — Fetch tracker context _(skip if free-form only)_

If a ticket number was found, invoke `@scrum-master`:

> "Fetch {TICKET}: return summary, description, acceptance criteria, linked {{PROJECT_KEY}} tickets, and any Confluence page URLs."

Then fetch each linked Confluence page directly and extract relevant content (requirements, specs, design notes). If the description references other `{{PROJECT_KEY}}-*` tickets, note any constraints or dependencies. This is a read: do not assign or transition the ticket here — that happens in the Ceremony stage.

**Merge with developer input (mixed case):**

- Developer's free-form problem and thoughts take precedence over tracker content if they conflict
- Use tracker/Confluence as background context and acceptance criteria; use developer input as the primary intent

**If `@scrum-master` reports a tracker error** (timeout, auth error, or ticket not found):

- Do not block — continue with developer input only
- Note `Tracker unavailable` in the context summary at Step 4
- Ask the developer to provide missing context manually:

  > "I couldn't fetch {{PROJECT_KEY}}-XX from the tracker. To continue, please paste:
  >
  > - **Summary** — one-line ticket title
  > - **Description** — what needs to be built
  > - **Acceptance criteria** — how to know it's done (if any)"

  **Stop and wait** for the developer to provide this before continuing to Step 3.

## Step 3 — Check for approved design (solution/ folder)

Check whether an approved design exists for this ticket:

- Glob for `docs/Stories/*{TICKET}*/solution/` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- If found, read all files in `solution/` in full: `Architecture.md`, `Design.md`, `Stack.md`, `Efforts.md`
- The `solution/` files are the primary spec — `Architecture.md` covers integration and NFRs, `Design.md` covers component detail

If a `solution/` folder is found, tell the developer:

> "Found approved design for `{TICKET}` — reading `solution/` as the source of truth for intent and planning."

Use the solution files as the primary spec input for Step 4. Developer free-form input and tracker ACs supplement; they do not override the solution.

If no `solution/` folder exists — continue normally, intent will be derived from the tracker and developer input alone.

## Step 4 — Stop and validate context

Present the combined context summary to the developer and ask:

> "Here's what I'm working from:
>
> - **Ticket**: `<summary or 'not provided'>`
> - **Confluence**: `<page titles or 'none found'>`
> - **Approved design**: `<found / not found>`
> - **Developer input**: `<problem + thoughts or 'none'>`
>
> Does this capture the right scope? Anything missing, incorrect, or out of scope before I write it down?"

**Stop and wait for confirmation.** If the developer corrects anything — update the context and re-summarise before continuing.

## Step 5 — Create the story folder and write intent.md

Confirm the folder structure:

- Glob for `docs/Stories/*{TICKET}*/` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- If a design folder already exists (e.g. `[{TICKET}] {name}/`): create `impl/` inside it.
- If none existed: create `docs/Stories/[{TICKET}] {name}/impl/`.

The folder name is **stable for the life of the ticket** — do not rename it later. Phase state is tracked in the `Phase` row of `2-report.md`, not in the folder name.

Write the confirmed summary as `impl/intent.md` using `.claude/skills/dev/templates/intent.md`
— a small, versioned proto-spec (problem, proposed outcome, affected users/systems,
constraints, open questions) that the Plan stage reads from, distinct from the
step-by-step `1-plan.md` written later. Write it once; only append to Open Questions
afterward, never rewrite the confirmed sections.

Create `impl/2-report.md` — the living implementation report — using the template at
`.claude/skills/dev/templates/report.md`. Replace the placeholder values:

- `{TICKET}` and `<Short Title>` — from the ticket / intent title
- Header table — fill in Ticket, Branch, and Author (run `git config user.name` to get the value); leave PR as `—`, Status as `🔄 In Progress`, Phase as `🎯 Context ✅ · 🚀 Ceremony ⏳ · 📋 Plan ⏳ · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳`
- Leave the Progress table empty — the Plan stage adds one row per plan step once the steps exist

## Step 6 — Report back

Tell the developer: "Intent saved to `docs/Stories/[{TICKET}] {name}/impl/intent.md`."
The router owns the phase-boundary confirmation before Ceremony starts — do not ask it here.

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Ceremony).
