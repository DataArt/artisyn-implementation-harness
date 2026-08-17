---
name: skill-lifecycle
metadata:
  version: 0.3.1
description: Skill lifecycle reference (reflect → triage → new → promote → harvest). Not invoked directly — loaded on demand.
---

# Skill Lifecycle

The skill lifecycle turns observed friction into encoded conventions. Read before creating, promoting, or archiving skills.

## Flow

```
/skill-reflect  →  /skill-triage  →  /skill-new (optional)  →  /skill-promote
```

1. **Reflect** — capture a brain-dump after any ticket. Even one sentence works. Output: `.claude/reflections/{date}-{slug}.md` with `status: pending-triage`.
2. **Triage** — when 2+ reflections are pending, cluster them, scope each pattern, present options, write drafts. Output: `.claude/skills/drafts/{name}.md` + triage report.
3. **New** — create a draft directly when you know a pattern without needing a reflection cycle. Output: `.claude/skills/drafts/{name}.md`.
4. **Promote** — after ~1 week of validation, graduate a draft to active. Output: `.claude/skills/{name}.md` or `.claude/agents/{name}.md`, registered in `AGENTS.md`.

## Folder structure

```
.claude/
  reflections/
    {date}-{slug}.md          # pending-triage
    triaged/
      {date}-{slug}.md        # triaged reflections
    archive/
      {date}-{slug}.md        # one-off, no action
    triage-reports/
      {date}-triage-report.md
  skills/
    {name}/
      SKILL.md                # active slash command
    drafts/
      {name}.md               # draft — not yet active
  agents/
    {name}.md                 # active agent
```

## Rules

1. **Reflect early, triage later.** Don't wait to accumulate 5+ reflections — 2 is enough to triage. One strong `skill_candidate: yes` reflection also triggers triage.
2. **Draft before promoting.** Every new skill goes through `.claude/skills/drafts/` first. Use it for at least a week before promoting.
3. **One concern per skill.** If a draft covers two unrelated rules, split it. If a rule is already in another skill, update that skill instead of duplicating.
4. **Archive, don't delete.** Move reflections to `triaged/` or `archive/` using `git mv` — never delete. History is valuable for understanding why a skill was or wasn't created.
5. **Register on promote.** Every promoted skill or agent must appear in `AGENTS.md` before others can discover and use it.

## Why

Without this lifecycle, conventions discovered in one session die with that session. The reflect → triage → promote pipeline ensures patterns accumulate in discoverable, editable files rather than decaying in conversation history.
