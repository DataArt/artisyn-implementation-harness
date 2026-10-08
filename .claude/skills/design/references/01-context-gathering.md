# Context Gathering stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics
unit is `--stage context-gathering`. Metrics start in Step 4 below, once the
folder and Report.md exist — not at the top of the stage.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`.
This stage gathers what the ticket means and identifies which track (Product
or Project — see `.claude/skills/design/SKILL.md`'s router callout)
and subfolder this design belongs to — once, read-only — before Ceremony does
any mutation and before
Frame writes anything. The resolved track decides the Stories root the story
folder is created under. It creates the story folder and `design/Report.md`,
but writes no framing content; that is Frame's job.

Two stops in this stage: the sign-off in Step 5 on the gathered context, and
the commit in Step 7.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`.

## Step 1 — Resolve the ticket or local ID

The argument is a ticket number (e.g. `ND-042`), free-form input, or a
direct folder path.

If `$DESIGN_DIR` already came from the router's Resume Detection (a resume, not a
fresh start) and `design/Report.md` already exists, the folder, context, and
Report.md are all already resolved — skip straight to Step 5 (Sign-off).

Otherwise (fresh start): if no tracker ticket is supplied, generate a stable local
ID before creating any files: `DESIGN-YYYYMMDD-XXXX`, where `XXXX` is four
uppercase alphanumeric characters. Check the story folder for a collision; if it
exists, generate a new suffix. Use this ID everywhere a ticket is required,
including the folder name, Report.md, stat.json, branch suggestion, commit
message, and later hand-off. It is a local design identifier, not a claim that a
tracker record exists.

---

## Step 2 — Fetch tracker context _(skip if free-form only)_

If a ticket number was found, invoke `@scrum-master`:

> "Fetch {TICKET}: return summary, description, acceptance criteria, linked ND tickets, and any Confluence page URLs."

Then fetch each linked Confluence page directly and extract relevant content
(requirements, specs, design notes). This is a read: do not assign or transition
the ticket here — that's Ceremony's job.

Developer free-form input (from `$ARGUMENTS`) takes precedence over tracker
content if they conflict; use the tracker/Confluence as background context and the
known ECs source, and developer input as the primary intent. The fetched summary
also supplies `{name}` for the folder created in Step 4.

**If `@scrum-master` reports a tracker error** (timeout, auth error, or ticket not
found): do not block — continue with developer input only, and ask the developer
to paste the summary/description/ECs manually if nothing else is available.

---

## Step 3 — Resolve design context and read sources

Apply `.claude/skills/design/patterns/context-resolution.md` — resolve which track this is (Product or Project), then which subfolder within it, and write the resolved Track, Source docs, Dest docs, Stories root, Subfolder, Architect agent, and Implementation note into the `## Context` section of `design/Report.md` (created in this same step, at the resolved Stories root). The pattern also reads the resolved Source docs path and records into Evidence — see its own final paragraph.

This identifies, among other fields, the **Stories root** — `{stories root}`
— which decides where Step 4 creates the story folder — and the **Architect
agent** — `{resolved architect agent}` — that Research, Solution, and Publish
delegate to. Identifying Product vs. Project is this stage's responsibility;
no later stage re-asks, re-derives, or hardcodes any of these values — every
stage reference and pattern reads them from `design/Report.md`'s `## Context`
section, resolved here and nowhere else, regardless of deployment mode.

This step also does the lifecycle's one context-reading pass, as part of
Apply `.claude/skills/design/patterns/context-resolution.md` — resolve which track this is (Product or Project), then which subfolder within it, and write the resolved Track, Source docs, Dest docs, Stories root, Subfolder, Architect agent, and Implementation note into the `## Context` section of `design/Report.md` (created in this same step, at the resolved Stories root). The pattern also reads the resolved Source docs path and records into Evidence — see its own final paragraph. above. Frame, Research, and every later phase read
what was found here from `design/Report.md`'s `## Evidence` table (populated
in Step 4) instead of re-reading the source docs themselves — and it's how
session continuity recaps context after a new session picks the ticket back
up, instead of relying on conversation history that session no longer has.

---

## Step 4 — Create the story folder and Report.md

The title is known now if a ticket number was found (the tracker summary). For
free-form input with no ticket, propose a short title yourself — summarize
the developer's own words, do not ask them to write it. Use it as `{name}`;
it is confirmed, not blocked on, at Step 5's sign-off — if they want a
different title, that is a one-line rework there, not a stop here.

Create the story folder under the Stories root resolved in Step 3:

```
{stories root}[{TICKET}] {name}/
    design/
```

(`solution/` is created later, by the Solution phase.) This is `$DESIGN_DIR`
(`{stories root}[{TICKET}] {name}/design/`) for every subsequent stage
and metrics command.

Create `design/Report.md` now using `.claude/skills/design/templates/report.md`,
with `Phase` set to
`🎯 Context Gathering 🔄 · 🚀 Ceremony ⏳ · 📋 Frame ⏳ · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`.

Fill in the `## Evidence` table with every source actually read in Step 3 —
one row each: `Source` (file/doc path), `Read at stage` = `context-gathering`,
`Relevant decision or constraint` (what it told you, one line), `Reference/version`
(if applicable). An empty table is only correct when Step 3 genuinely found
nothing relevant, not when the read was skipped.

Initialize design metrics now that Report.md and its directory exist: `init` with
an explicit design `--dir` and the ticket/story identifier, then
`stage start --stage context-gathering`. If `stat.json` already exists,
recover/resume it rather than initializing new history.

---

## Step 5 — Sign-off

Apply `patterns/phase-sign-off.md`. Present, in one message, the findings
gathered across Steps 1–4: the resolved/proposed title, the ticket summary,
the resolved track/subfolder/architect agent, the folder path, and how many
sources Step 3 read into the Evidence table.

> "Context gathered for `{TICKET}` at `design/Report.md`: {one-line ticket summary}.
> Title: {name}. Track: {Product/Project}, subfolder: {resolved subfolder}.
> {N} context sources read into Evidence. Good to go, or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting context-gathering sign-off"`.
**Stop and wait.** On approval, record the acceptance check
(`--name "Context Gathering sign-off"`, `--source developer`); without it
`stage complete` is refused.

Rework — apply the named path, present again:

- Title wrong → rename `{name}` and the folder (git mv if already created), re-save.
- Wrong track, subfolder, or Evidence sources → "Reiterate from Step 3 — re-resolve context and re-read."
- Tracker summary wrong or incomplete → "Reiterate from Step 2 — re-fetch or ask the developer to paste the missing pieces."

## Step 6 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony 🔄 · 📋 Frame ⏳ · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`

Then metrics `report`.

## Step 7 — Commit

The story folder is new. Propose:

> `docs({TICKET}): gather context for <short title>`

covering `{stories root}[{TICKET}] {name}/design/` (Report.md, stat.json).

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage context-gathering`.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the router from the next stage (Ceremony).
