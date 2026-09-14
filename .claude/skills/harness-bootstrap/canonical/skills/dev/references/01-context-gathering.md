# Context Gathering stage

Apply `.claude/skills/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage context`.

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage exists
because what reaches planning is otherwise several steps removed from what the
originator meant — it captures the ticket's intent once, from tracker/Confluence,
any approved design, and the developer's own words, and persists it as `0-intent.md`
before any tracker/branch ceremony or plan-writing begins. Read-only except for the
final write in Step 5.

Apply `patterns/approvals.md`: follow dependencies, continue routine authorized work,
and pause only for a concrete unresolved decision, required human verification, or a
fixed sign-off gate (`patterns/approvals.md`).

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
> - Intent: `docs/Stories/{folder}/impl/0-intent.md`
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

A ticket number matches the pattern `{{PROJECT_KEY}}-\d+`. If none is found, reuse
an existing matching `DEV-YYYYMMDD-XXXX` story ID when available; otherwise
generate a collision-checked `DEV-YYYYMMDD-XXXX` local ID before creating files.

Extract from the arguments:

- **ticket** — `{{PROJECT_KEY}}-\d+` if present, otherwise the reused/generated local ID
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

## Step 3 — Check for approved design

Check whether an approved design exists for this ticket:

- Glob for `docs/Stories/*{TICKET}*/solution/Architecture.md` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- If found, read the story's `design/Report.md` and use its `selected_artifacts` paths as the
  solution specification. Read only those approved files; do not assume a fixed
  Architecture/Design/Stack/Efforts set.
- The selected solution artifacts are the primary spec. Use each artifact's
  interface role and the Evidence table in `Report.md` to determine coverage.

If an approved `Architecture.md` is found, tell the developer:

> "Found approved design for `{TICKET}` — reading `solution/Architecture.md` and the selected solution artifacts as the source of truth for intent and planning."

Use the solution files as the primary spec input for Step 4. Developer free-form input and tracker ACs supplement; they do not override the solution.

If no approved `solution/Architecture.md` exists — continue normally, intent will be derived from the tracker and developer input alone.

## Step 3.5 — Verify uncertain platform/framework conventions

If the intent depends on a specific external platform, service, or framework
convention — required file/folder structure, config keys, manifest fields, API
shape — that carries mid-to-high uncertainty (a specific product feature, a less
common integration, anything not solidly known rather than a well-established,
widely-used convention), fetch the current official documentation before proposing
that structure: `WebFetch` the vendor's doc page if the URL is known (including one
the developer just shared), or `WebSearch` to find it first. Skip this for
low-uncertainty conventions (a standard `package.json`, common language idioms) —
this is not a mandate to fetch docs for everything, only where getting it wrong is
plausible enough to be worth the check.

Cite what was consulted (the URL) in the context summary presented in Step 4, so the
developer can see what the recommendation is actually based on.

## Step 3.6 — Identify the HLD container(s) in scope

Read `docs/Target Architecture (HLD)/README.md` to find the active version and its
container index, then identify which container(s) this ticket's scope falls under.
This is a lightweight identification pass, not the deep constraints/NFR/data-flow
read — that full read happens in `references/03-plan.md` Step 1. The goal here is
only to catch an obvious container-boundary mismatch (e.g. scope that actually
belongs to a different container, or spans containers unexpectedly) while it's still
cheap to correct, before Plan invests in a detailed design.

Include the identified container(s) in the Step 4 sign-off summary. If the scope
doesn't cleanly map to one container, or seems to cross a container boundary, flag
that explicitly as part of the summary rather than silently picking one.

## Step 4 — Sign-off on context

This is a sign-off gate (`patterns/approvals.md`): present the combined context
summary to the developer and ask:

> "Here's what I'm working from:
>
> - **Ticket**: `<summary or 'not provided'>`
> - **Confluence**: `<page titles or 'none found'>`
> - **Approved design**: `<found / not found>`
> - **HLD container(s)**: `<container name(s), or a flagged boundary concern>`
> - **Developer input**: `<problem + thoughts or 'none'>`
>
> Does this capture the right scope? Anything missing, incorrect, or out of scope before I write it down?"

**Stop and wait for the developer's sign-off.** If the developer corrects anything —
update the context and re-summarise, then ask again before continuing. If the user
requests a change to approved design, surface that decision explicitly before
dependent implementation.

## Step 5 — Create the story folder and write 0-intent.md

Confirm the folder structure:

- Glob for `docs/Stories/*{TICKET}*/` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- If a design folder already exists (e.g. `[{TICKET}] {name}/`): create `impl/` inside it.
- If none existed: create `docs/Stories/[{TICKET}] {name}/impl/`.

The folder name is **stable for the life of the ticket** — do not rename it later. Phase state is tracked in the `Phase` row of `2-report.md`, not in the folder name.

Write the confirmed summary as `impl/0-intent.md` using `.claude/skills/dev/templates/intent.md`
— a small, versioned proto-spec (problem, proposed outcome, affected users/systems,
constraints, open questions) that the Plan stage reads from, distinct from the
step-by-step `1-plan.md` written later. Write it once; only append to Open Questions
afterward, never rewrite the confirmed sections.

Create `impl/2-report.md` — the living implementation report — using the template at
`.claude/skills/dev/templates/report.md`. Replace the placeholder values:

- `{TICKET}` and `<Short Title>` — from the ticket / intent title
- Header table — fill in Ticket, Branch, and Author (run `git config user.name` to get the value); leave PR as `—`, Status as `🔄 In Progress`, Phase as `🎯 Context ✅ · 🚀 Ceremony ⏳ · 📋 Plan ⏳ · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳`
- Leave the Progress table empty — the Plan stage adds one row per plan step once the steps exist

Initialize metrics per `patterns/metrics.md`, reusing the same `git config user.name`
value for `--author` rather than running it twice.

## Step 6 — Report back

Tell the developer: "Intent saved to `docs/Stories/[{TICKET}] {name}/impl/0-intent.md`."
Continue to Ceremony for a full-flow request; stop after this stage for direct entry.

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Ceremony).
