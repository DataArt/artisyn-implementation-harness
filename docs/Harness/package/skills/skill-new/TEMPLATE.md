---
name: skill-new
metadata:
  version: 0.3.1
description: >
  Create a draft skill directly from a description (/skill-new or "create a skill for X",
  "encode this convention as a skill"). Bypasses /skill-reflect → /skill-triage.
  Saves to .claude/skills/drafts/ for later /skill-promote.
---

The developer wants to create a new draft skill directly (without going through /skill-reflect → /skill-triage). Their description:

---

## $ARGUMENTS

## Step 1 — Determine type

Decide whether this should be:

- **Rule/reference skill** — a convention, constraint, or checklist that Claude reads before doing work. Use when the pattern is about _how to do something_ (e.g., "always add Swagger decorators", "use mv not cp").
- **Agent skill** — an autonomous task runner for a well-defined, multi-step, recurring task (e.g., "fix all lint errors in a project", "scaffold a new NX app").

Choose based on the description. If ambiguous, default to rule.

## Step 2 — Check for duplication

Read `.claude/skills/*.md` file names and their first paragraph. If a very similar skill already exists, tell the developer and stop — suggest updating the existing skill instead.

## Step 3 — Read conventions

- For agent skill: read an existing file in `.claude/agents/` to match the exact frontmatter and body format.
- For rule skill: read 2 existing skills in `.claude/skills/` to match tone and structure.

## Step 4 — Write the draft

Save to `.claude/skills/drafts/{kebab-name}.md`. The draft should be publish-ready.

**Rule skill format:** read `.claude/skills/skill-new/rule-skill.template.md` and use it as the file structure.

**Agent skill:** use the frontmatter + body format from existing `.claude/agents/` files. Add a comment at the top: `<!-- DRAFT: promote to .claude/agents/ when ready -->`.

## Step 5 — Report back

Tell the developer:

- The filename saved and its type (rule vs agent)
- The trigger condition — when Claude will use this skill
- Remind them: test it for a week, then run `/skill-promote` to publish it
