---
name: skill-reflect
metadata:
  version: 0.3.1
description: >
  Post-task debrief (/skill-reflect or "reflect on this", "capture what I learned").
  Also trigger when /dev-document ends with the reflection prompt.
  Structures the brain-dump into .claude/reflections/ for later /skill-triage.
---

The developer has just run /reflect after completing a task. Here is their free-form reflection:

---

## $ARGUMENTS

Parse this and save a structured reflection file.

## Step 1 — Extract fields

- **author** — run `git config user.name` to get the current git user; use that value
- **ticket** — issue tracker ticket number (e.g. `{{PROJECT_KEY}}-11`); omit the field if not applicable
- **task** — one-sentence summary of what was being done
- **went_well** — what worked smoothly (write "Nothing noted." if not mentioned)
- **went_wrong** — friction points, failures, things harder than expected
- **insight** — the key learning or emerging pattern
- **skill_candidate** — `yes` if the insight is a repeatable convention worth encoding as a skill; `no` otherwise
- **skill_hint** — if candidate: one-line description of what the skill would enforce or prevent

## Step 2 — Generate filename

Format: `.claude/reflections/YYYY-MM-DD-HHMM-{slug}.md`

Use today's actual date and time. Slug = 3–5 words from the task, kebab-cased (e.g. `nx-app-scaffold-flow`).

## Step 3 — Write the file

Use `.claude/skills/skill-reflect/reflection.template.md` as the file structure exactly.

Omit the `skill_hint` line entirely if `skill_candidate` is `no`.

## Step 4 — Report back

Tell the developer:

- The filename saved
- Whether a skill candidate was flagged and briefly why
- Count how many files in `.claude/reflections/` currently have `status: pending-triage`. If 2 or more, remind them to run `/skill-triage` to cluster patterns and generate draft skills.
