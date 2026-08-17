# Skill Authoring Conventions

Rules for writing and structuring Claude Code skills in this project. Read before creating a new skill, slash command, or template file.

## Rules

### Slash command location

1. Slash commands live at `.claude/skills/<name>/SKILL.md` — **not** `.claude/commands/<name>.md`. The directory form is preferred: it supports supporting files alongside `SKILL.md`, frontmatter to control invocation mode, and auto-loading by Claude when relevant.
2. When creating a new slash command, run `mkdir -p .claude/skills/<name>` then create `SKILL.md` inside it.
3. Register every new skill in the relevant section of `CLAUDE.md`.

### Template files

4. Any skill that instructs Claude to create a structured `.md` file (reflection, report, plan, review, etc.) must have a companion `<name>.template.md` in the same skill folder. Do not inline the file structure as a fenced code block inside `SKILL.md`.
5. `SKILL.md` references the template file by name; the template file is independently editable without touching the skill instructions.
6. Example: `skill-reflect/reflection.template.md`, `skill-new/rule-skill.template.md`, `skill-triage/triage-summary.template.md`.

### DRY — one source per concept

7. Each concept or convention lives in exactly one file. Everywhere else gets a one-sentence introduction and a `→ see <file>` reference — never duplicate instructions across files.
8. If a `SKILL.md` partially repeats content from a dedicated skill file, replace the repeated block with: `_<one sentence intro>. → See `.claude/skills/<name>.md`._`
9. This prevents drift: when the authoritative file is updated, references do not become stale.

### Patterns — shared multi-step protocols

10. When the same multi-step protocol appears in 3 or more workflow skills, extract it into a `pattern-<name>.md` file. Co-locate it with the skills that use them (e.g. `.claude/skills/dev/pattern-review-gate.md` for dev-flow patterns). Do **not** register pattern files in `CLAUDE.md` — they are loaded on-demand via explicit references, not at session start.
11. Each workflow skill that uses a pattern must include an explicit path reference at the point of use: `"Apply the X pattern — read `.claude/skills/dev/pattern-X.md`."` This is what triggers Claude to read it mid-execution. A name-only reference is not enough.
12. Pattern files define the rule text once. Workflow skills own only the trigger condition (when to apply) and any local overrides (e.g. section name, tri-choice options). Never repeat the rule body in the workflow skill.
13. When a pattern evolves, update the pattern file only. Workflow skills need to change only if their trigger condition or override changes — not because the rule text changed.

### Bootstrap template versioning

14. Every `docs/Harness/package/skills/{name}/TEMPLATE.md` carries a semver in its frontmatter:
    ```yaml
    name: { name }
    metadata:
      version: 0.3.1
    description: ...
    ```
15. Bump this version on every `/skill-harvest` write to that `TEMPLATE.md` — never leave it unchanged:
    - **patch** (`X.Y.Z+1`) — wording, clarification, typo fixes; no behavior change
    - **minor** (`X.Y+1.0`) — new steps, new sections, new optional behavior; backward compatible with existing deployments
    - **major** (`X+1.0.0`) — renamed/removed frontmatter keys or `{{}}` placeholders, restructured steps that change what a deployed skill does
16. This field is bootstrap-only. Do not add `metadata`/`version` to the live `.claude/skills/{name}/SKILL.md` files — those are the deployed source of truth for a specific project, not the generic, re-deployable template.

## Why

Inlined templates inside `SKILL.md` made templates hard to edit independently and grew SKILL.md files unnecessarily. Duplicated instructions across CLAUDE.md and skill files led to drift where one copy was updated and the other wasn't.

## Examples

**Wrong** — template inlined in SKILL.md:

````markdown
Write the reflection file with this structure:

```markdown
---
date: ...
task: ...
---

## What happened
```
````

**Correct** — template in companion file:

```
# In SKILL.md:
Write the reflection file using the structure in `reflection.template.md`.

# In reflection.template.md:
---
date: ...
task: ...
---
## What happened
```

**Wrong** — concept repeated in CLAUDE.md and a skill file:

```
# In CLAUDE.md
File naming: NN Title Case.md format, two-digit prefix...

# In documentation.md
File naming inside docs/: NN Title Case.md format, two-digit prefix...
```

**Correct** — one source:

```
# In documentation.md (authoritative)
File naming inside docs/: NN Title Case.md format...

# In CLAUDE.md
→ See .claude/skills/documentation.md for file naming conventions.
```
