---
name: skill-promote
metadata:
  version: 0.4.0
description: Graduate a draft skill to active status (/skill-promote). Moves from .claude/skills/drafts/ to .claude/skills/, registers in CLAUDE.md.
---

The developer has run /skill-promote to graduate a draft skill to published status.

Target draft (optional — if specified, promote this one directly):
$ARGUMENTS

## Step 1 — List available drafts

Read `.claude/skills/drafts/`. List all `.md` files (skip `.gitkeep`).

If `$ARGUMENTS` names a specific draft, focus on that one. Otherwise, show the full list and ask the developer which one to promote before proceeding.

## Step 2 — Read the draft

Read the selected draft file in full. Determine its type:

- **Agent** — has YAML frontmatter with `name:`, `description:`, `tools:` fields, or has a `<!-- DRAFT: promote to .claude/agents/ -->` comment → destination: `.claude/agents/{name}.md`
- **Rule skill** — plain markdown reference doc → destination: `.claude/skills/{name}.md`

Derive `{name}` from the frontmatter `name:` field (for agents) or from the filename (for rules).

## Step 3 — Final review

Before moving, check:

- Does a file already exist at the destination? If yes, warn the developer and ask whether to overwrite or merge.
- Does the content look complete (not placeholder text, not a stub)?

If either check fails, report and stop.

## Step 4 — Move the file

Use `mv` (not `cp`) to preserve git history:

```bash
mv .claude/skills/drafts/{name}.md {destination}/{name}.md
```

Present this as a command for the developer to run — do not run it yourself.

## Step 5 — Register in CLAUDE.md

Open `CLAUDE.md` and add an entry:

- **Agent** → add to the `## Agents` table: one row with agent name, layer scope, and tools
- **Rule skill** → add to the `## Skills` table: one row with skill name and one-line description

## Step 5b — Lifecycle doc sync

Check whether the promoted skill is a lifecycle phase skill and flag the corresponding doc if so:

| Skill prefix                                                                                                                                                           | Lifecycle doc                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `dev-plan`, `dev-implement`, `dev-test`, `dev-document`, `dev`                                                                                                         | `docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md`    |
| `design-frame`, `design-research`, `design-elaborate`, `design-solution`, `design-review-gate`, `design-address-feedback`, `design-publish`, `design-review`, `design` | `docs/Engineering Guide/Lifecycles/02 Design Lifecycle.md` |
| `skill-reflect`, `skill-triage`, `skill-promote`, `skill-new`                                                                                                          | `docs/Engineering Guide/Lifecycles/03 Skill Lifecycle.md`  |

If the promoted skill matches, tell the developer:

> "This skill is part of the {Lifecycle} lifecycle. Review `<lifecycle doc>` — check if the phase description, invariants, or satellite skills table need updating."

## Step 6 — Report

Tell the developer:

- Where the file now lives
- What was added to CLAUDE.md
- Remind them to commit the change so the whole team inherits the skill:
  ```
  git add .claude/ CLAUDE.md && git commit -m "skill: promote {name}"
  ```

**Harness bootstrap sync** — glob for `docs/Harness/package/` in the repo. If it exists, tell the developer:

> "Run `/skill-harvest {name}` to sync the promoted skill back to the bootstrap template."
