# Completion stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage completion`. First action: `stage start --stage completion`.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This is the
last stage. It makes "done" unambiguous: archive the story, finalise metrics, hand
the developer the commit and the PR text, offer the tracker and tech-debt actions,
and say clearly that the ticket is finished.

Run it directly with `{{provider:invoke:dev}} complete {TICKET}` for any story that
reached Document but was never archived.

One stop in this stage: the combined ask in Step 4. Everything else is routine.

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Check the story is ready

`$IMPL_DIR` comes from the router's entry check.

- If it is already under `docs/Stories/archive/`, say so and continue from Step 3
  with the archived path; nothing is moved twice
- Read `2-report.md`. The `Phase` row must show Document ✅. If not, tell the
  developer which stage is still open and stop; do not archive unfinished work

Run `report`, then `quality validate --dir "$IMPL_DIR"`. If it fails, the story is
not closable: report what it rejected and stop. The fix belongs in Document.

Update the `Phase` row:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ · 🏁 Completion 🔄
```

## Step 2 — Archive

Move the whole story folder, keeping every artifact including `impl/stat.json`:

```sh
git mv "docs/Stories/[{TICKET}] {name}" "docs/Stories/archive/[{TICKET}] {name}"
```

Use a plain move if the folder is untracked. Never overwrite an existing archive
destination; if one exists, stop and ask. Keep the folder name exactly as it was:
ASCII only, no status marker, no emoji, no em dash. Done is recorded in the report's
Status row, not in the folder name.

Moving adds one directory level. Fix every relative Markdown link inside the moved
files that points back up to `docs/`. Check them, do not assume.

From here on, use the archived path for every metrics command.

## Step 3 — Update the report

In `2-report.md`:

- Status → `✅ Complete`
- Phase → `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ · 🏁 Completion ✅`
- Add a `## Completion` section: date, archive path, and a placeholder for the PR
  title and the external actions (filled in Steps 4 and 5)

Then metrics `report`.

## Step 4 — Sign-off: the external actions

The one stop in this stage. One combined ask, once. Prepare everything first so the
answer is a yes/no:

- **Tracker:** ask `@scrum-master` what the next status after In Progress is (In
  Review, Done, whatever this project uses) and name it. Skip for local DEV IDs.
- **Tech debt tickets:** for each `## Tech Debt` row without a Tracker key, show
  the prepared title, description, owner, linked RF IDs and next action.
- **Worklog**, only if the project requires one: ask for the human time; never
  estimate it.

> "Story archived. Want me to:
>
> 1. Move {TICKET} to **{next status}**
> 2. Create tracker tickets for: TD-1 `{title}`, TD-2 `{title}`
>
> (**all** / numbers / **none**)"

`report`, then `wait start --reason approval --detail "Awaiting completion sign-off"`.
**Stop and wait.** On the reply, `resume --activity documentation`, record the
acceptance check (`--name "Completion sign-off"`, `--source developer`, their answer
as evidence; "none" is a valid answer), and do only what was approved, through
`@scrum-master`. Record returned keys in the TD rows and the `## Completion`
section. If a creation fails, keep the local row and say so; never invent a key.

## Step 5 — Finalise metrics

```sh
node {{provider:skills_root}}/dev/scripts/timing.mjs stage complete --dir "$IMPL_DIR" --stage completion
node {{provider:skills_root}}/dev/scripts/timing.mjs complete --dir "$IMPL_DIR"
node {{provider:skills_root}}/dev/scripts/timing.mjs report --dir "$IMPL_DIR"
```

`complete` fails if any stage or step is still open. That is the point: fix the
cause, do not work around it. For a direct-stage run on a story with partial
coverage, `complete` still records the end; that is correct.

## Step 6 — Commit, PR text, and say it is done

Nothing waits after this; the lifecycle is over. Hand the developer everything in
one message. The archive commit:

```
docs({ticket-lowercase}): archive {TICKET} and close the story
```

The PR title, Conventional Commit form, scoped to the main change:

```
{type}({scope}): {what the ticket delivered}
```

The PR body, from the report and the real evidence, not from the plan's intentions:

```markdown
## What

<2–4 lines: what changed and why, for a reviewer who has not read the ticket>

## Verification

- <check> — <result, with the report reference>
- <manual item the developer confirmed>

## Notes for reviewers

- <divergence from plan, accepted deviation, or known debt — one line each>

Story: `docs/Stories/archive/[{TICKET}] {name}/impl/2-report.md`
Closes {TICKET}
```

Pushing and opening the PR are the developer's (`git push` is guarded). When they
share the PR link, put it in the report's PR row; it can ride along in a small
follow-up commit.

Then the closing message. This is the signal the team asked for; do not bury it.

> "🏁 **{TICKET} is complete.**
>
> - Archived: `docs/Stories/archive/[{TICKET}] {name}/`
> - Tracker: {moved to X / skipped}
> - Tech debt tickets: {keys / none}
> - Elapsed {Xh Ym} · work {Xh Ym} · wait {Xh Ym} (from `stat.json`)
>
> Remaining on your side: commit, push, open the PR with the text above.
> If anything surprised you this ticket, `{{provider:invoke:evolve}} reflect <one sentence>` captures it."

Direct-stage entry ends here. For a full-flow request this is also the end; there is
no further stage.
