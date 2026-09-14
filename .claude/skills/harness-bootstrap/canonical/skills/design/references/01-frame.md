# Frame stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics unit is
`--stage frame`. Follow its initialization/recovery, entry, wait, check, and exit
commands. When this reference is used only as a correction recipe within another
active stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`. Frame
frames the problem, frames the requirements (evaluation criteria for Evaluate),
and frames the boundaries before any research begins. Output: `design/00 Frame.md`.

It also owns the ticket's start-of-work ceremony (tracker transition + branch
checkout) — deliberately placed _after_ the tracker fetch and title resolution
below, because the branch slug is derived from the ticket's title/summary, which
isn't known until that point.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`.

## Step 1 — Find or create the design folder

The argument is a ticket number (e.g. `{{PROJECT_KEY}}-042`) or a direct folder path.

If no tracker ticket is supplied, generate a stable local ID before creating any
files: `DESIGN-YYYYMMDD-XXXX`, where `XXXX` is four uppercase alphanumeric characters.
Check the story folder for a collision; if it exists, generate a new suffix. Use this
ID everywhere a ticket is required, including the folder name, Report.md, stat.json,
branch suggestion, commit message, and later hand-off. It is a local design identifier,
not a claim that a tracker record exists.

- If a ticket number: glob for `docs/Stories/*{TICKET}*/**` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`). On a fresh start no files exist yet, so the glob will return nothing — proceed directly to creating the folder.
- If not found: ask the developer for a short title, then create the story folder:

  ```
  docs/Stories/[{TICKET}] {name}/
      design/
  ```

  (`solution/` is created later, by the Solution phase.)

  > "What is the short title for this design ticket? (e.g. 'Context Topology Mapping', 'Data Platform Integration Contract')"

  **Stop and wait.** Use the provided title as `{name}`.

- If `design/Report.md` exists, read it to restore session context and skip to
  Step 4 (ceremony has already run). If it does not exist, continue to Step 2.

---

## Step 2 — Fetch tracker context _(skip if free-form only)_

If a ticket number was found in Step 1, invoke `@scrum-master`:

> "Fetch {TICKET}: return summary, description, acceptance criteria, linked {{PROJECT_KEY}} tickets, and any Confluence page URLs."

Then fetch each linked Confluence page directly and extract relevant content
(requirements, specs, design notes). This is a read: do not assign or transition
the ticket here — that's Step 3.

Developer free-form input (from `$ARGUMENTS`) takes precedence over tracker content
if they conflict; use the tracker/Confluence as background context and the known
ECs source, and developer input as the primary intent. The fetched summary also
supplies `{name}` for the folder path above, if it wasn't already asked.

**If `@scrum-master` reports a tracker error** (timeout, auth error, or ticket not
found): do not block — continue with developer input only, and ask the developer to
paste the summary/description/ECs manually if nothing else is available.

---

## Step 3 — Ceremony: tracker transition and branch checkout

Now that the ticket's title/summary is known (from Step 1 or Step 2), do the
official start-of-work ceremony.

**Tracker transition** _(skip if no ticket number detected)_:

> "I'll assign {{PROJECT_KEY}}-XX to you and move it to **In Progress**. Confirm? (**yes** / **skip**)"

**Stop and wait for confirmation.** If confirmed, invoke `@scrum-master`:

> "Start {TICKET}: assign to the authenticated user and transition to In Progress."

**Feature branch check:**

> "You're currently on branch `{current-branch}`. Should I suggest a feature branch name first (e.g. `docs/{ticket-lowercase}-{slug}`, using the title/summary above)? (**yes** / **skip**)"

**Stop and wait for confirmation.** Do not write any files until the developer
confirms or skips.

`git checkout -b` is a guarded command — same class as `git commit` / `git push`.
Even after the developer says "yes," never run it yourself (including any prep like
resolving uncommitted changes). Present the exact command as an instruction for the
developer to run:

> "Run this yourself: `git checkout -b docs/{ticket-lowercase}-{slug}`"

Wait for the developer to confirm they've created the branch before proceeding.

Create `design/Report.md` now using `.claude/skills/design/templates/report.md`,
with `Phase` set to
`📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳`.

---

Initialize design metrics now that Report.md and its directory exist: `init` with
an explicit design `--dir` and the ticket/story identifier, then `stage start --stage frame`.
If stat.json already exists, recover/resume it rather than initializing new history.

## Step 4 — Resolve design context

{{DESIGN_CONTEXT_STEP}}

---

## Step 5 — Write 00 Frame.md

Using `.claude/skills/design/templates/frame.md`, write `design/00 Frame.md`. Pull context from the sources identified in Steps 2 and 4 — the tracker fetch supplies the Known ECs and background; the resolved design context supplies constraints and precedent.

**Problem** — one paragraph from the ticket description (or `$ARGUMENTS`): what is broken or missing, and why it matters now.

**Requirements** — two sub-sections:

- _Known_ — acceptance criteria and requirements stated in the ticket (verbatim, cleaned up)
- _Proposed_ — requirements the developer didn't think of. Look for gaps: missing edge cases, non-functional requirements (performance, security, GDPR), operational concerns (observability, rollback), and future-proofing constraints implied by the architecture or engagement context. Propose 2–4 additions. Label each `[proposed]` so the developer can accept or reject.

These requirements become the evaluation criteria rows in the Requirements × Options matrix during Evaluate.

**Boundaries**

- _In scope_ — what this design covers
- _Out of scope_ — what is explicitly excluded (derive from ticket; add obvious exclusions if missing)

**Constraints** — known deadlines, linked tickets, regulatory requirements, product or architectural constraints that directly bound this decision.

**Sizing** _(optional — include only when the ticket warrants capacity planning)_

- Expected users / MAU
- Request volume
- Data volume
- Relevant NFR targets (from the resolved design context or stakeholder requirements)

**Links**

- Ticket: `{{PROJECT_KEY}}-{number}`
- Related tickets: `<any linked {{PROJECT_KEY}} tickets if any>`
- Reference docs: `<any {{DESIGN_DOCS_ROOT}} docs referenced>`

Apply the docs-writer authoring pattern (`.claude/skills/design/patterns/docs-writer-authoring.md`): delegate the write of `design/00 Frame.md` to `@docs-writer` rather than writing it directly.

Apply the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`): say "File saved at `design/00 Frame.md`. Proposed requirements are marked `[proposed]` — review in your IDE, accept/reject/edit any of them, then confirm."

**Stop and wait.** Apply any edits the developer requests and re-save. Iterate until the developer confirms.

---

## Step 6 — Reiterate paths

If the developer raises a concern:

- Source data wrong (problem description, linked docs) → "Reiterate from Step 5 — re-draft the Problem and Boundaries sections."
- Problem framing wrong → "Reiterate from Step 5 — re-draft the Problem and Boundaries sections."
- Target subfolder or design context wrong → "Reiterate from Step 4 — re-resolve context and re-prime."

`design/00 Frame.md` is the single source of ticket context for all subsequent phases. It is not modified again unless the developer explicitly requests a correction.

---

## Step 7 — Do → Report → Commit

Apply the do→report→commit pattern (`.claude/skills/design/patterns/do-report-commit.md`):

**Report** — update `design/Report.md`:

- Phase tracker: `📋 Frame ✅ · 🔍 Research 🔄 · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Frame | Context: {subfolder}; {N} known requirements, {M} proposed requirements accepted |`

**Commit** — suggest:

> `docs({TICKET}): frame — <short title>`

**Stop and wait** for the developer to confirm the commit.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the router from the next stage.
