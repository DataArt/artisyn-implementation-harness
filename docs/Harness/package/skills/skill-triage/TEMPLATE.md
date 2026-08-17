---
name: skill-triage
metadata:
  version: 0.4.0
description: Cluster pending reflections into draft skills (/skill-triage). Reads .claude/reflections/, generates .claude/skills/drafts/. Run /skill-promote after.
---

The developer has run /skill-triage. Analyze all pending reflections and generate draft skills.

## Step 1 — Read pending reflections

List all files in `.claude/reflections/`. Read every file that has `status: pending-triage` in its frontmatter. If there are none, report that and stop.

For each file, extract: `ticket`, `task`, `went_well`, `went_wrong`, `insight`, `skill_candidate`, `skill_hint`.

If a reflection has a `ticket` field, enrich it with context before clustering:

1. Glob `docs/Stories/**/` for a folder matching the ticket number (e.g. `{{PROJECT_KEY}}-11`). If found, read:
   - `impl/1-plan.md` — what was planned
   - `impl/2-report.md` — what was actually done, test results, deviations
   - Any other `.md` files in the folder (notes, review, etc.)
2. Only fetch the Jira issue (via MCP `mcp-atlassian`) if the story files don't provide enough context to understand the insight — e.g. the reflection mentions a constraint or decision that isn't explained in the local docs.

## Step 2 — Cluster by theme

Group reflections that share:

- The same type of friction (e.g., "always forgetting to update X after Y")
- The same domain (e.g., NX config, NestJS patterns, React data fetching)
- Complementary insights that together form a clear convention

A cluster qualifies for skill generation if it has:

- 2+ reflections sharing a theme, **or**
- 1 reflection with `skill_candidate: yes`

For reflections that don't qualify as a cluster, check before sending to archive:

- **Feedback memory candidate** — does the insight express a personal preference, a correction to Claude's behaviour, or a one-time lesson that should persist across sessions? If yes, suggest saving to `.claude/memory/` as `type: feedback` instead of archiving.
- **One-off** — unique to context, won't recur, not a preference → archive.

## Step 3 — Scope the cluster

Before deciding an action, determine the **scope** of the pattern:

- **Agent-specific** — the insight only ever applies inside one agent (e.g. a backend convention that only the BFF agent uses, a React pattern that only the web agent uses). Clues: the reflection mentions a specific agent by name, a specific layer, or a framework that only one agent touches.
- **Cross-cutting** — the pattern applies to the whole project or multiple agents (e.g. git hygiene, env config, dependency rules).
- **Dev-flow** — the insight touches a dev-lifecycle skill (`dev-plan`, `dev-implement`, `dev-test`, `dev-document`, `dev`). **Always consider the full flow**, not the skill in isolation: does the insight belong in a different stage, should a stage absorb another, or should a standalone command be retired? Never recommend updating a dev-flow skill without first asking whether the change better belongs in an adjacent stage.

**Pattern extraction check (run for every dev-flow or cross-cutting cluster):**

Ask: does this cluster describe a **multi-step protocol** that already appears (or should appear) in 3 or more workflow skills? If yes — recommend a `pattern-{name}.md` file instead of point-fixing each skill individually. See `.claude/skills/skill-authoring.md` §Patterns for the authoring rules. Key points:

- Pattern files live alongside the skills that use them (e.g. `.claude/skills/dev/` for dev-flow patterns)
- Not registered in `AGENTS.md` — loaded on-demand via explicit path references in workflow skills
- Workflow skills own the trigger condition and any local overrides; the pattern file owns the rule text

## Step 4 — Decide action per cluster

For each cluster, **present the options to the developer** and recommend one — do not silently pick one and write a file.

### For agent-specific patterns

| Option                 | When to suggest                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **Improve agent body** | Static rule or convention → add a section to `.claude/agents/{name}.md`                                  |
| **Agent memory entry** | Discovered/learned knowledge that should persist across sessions → add to `.claude/agent-memory/{name}/` |
| **Both**               | Rule is new _and_ the agent needs to remember a specific instance of it                                  |

### For cross-cutting patterns

| Decision                      | Condition                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **New skill**                 | Pattern is clear, not covered by existing `.claude/skills/*.md`                                                        |
| **Update existing skill**     | Pattern is partially covered — note the gap, don't auto-edit                                                           |
| **Archive existing skill**    | An existing skill is now redundant (e.g. fully absorbed by an agent body, or obsolete) — suggest removing or moving it |
| **Merge into adjacent stage** | A dev-flow skill's content belongs inside another stage — retire the standalone skill and update the receiving stage   |
| **Feedback memory**           | Personal preference or one-time correction → suggest saving to `.claude/memory/`                                       |
| **One-off**                   | Not repeatable, unique to context — no action                                                                          |

**Existing skill audit (always run, not just when reflections suggest it):**

1. Read every file in `.claude/skills/*.md`.
2. Read every file in `.claude/agents/*.md`.
3. Read every file in `.claude/memory/` and `.claude/agent-memory/` (any subdirectory).
4. For each skill, ask: is its content fully covered by an agent body, a memory entry, or agent memory? If yes → candidate for archiving.
5. Also flag any skill that looks redundant given the reflection content.

Include all findings in the Step 7 report even if no reflections mentioned the skill.

**STOP — present the full options table to the developer and wait for explicit confirmation on each cluster before proceeding to Step 5.**

## Step 5 — Write draft skills

**Only proceed after the developer has confirmed the action for each cluster in Step 4.**

### Skill authoring principles

Apply these to every draft — the same engineering discipline used for production code:

| Principle | What it means for skills                                                                                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SoC**   | One skill = one concern. If a draft covers two unrelated conventions, split it into two files.                                                                                            |
| **DRY**   | Before writing, check that the rule isn't already stated in another skill, agent body, or AGENTS.md. If it is, update the existing file rather than duplicating. Reference, don't repeat. |
| **KISS**  | State the rule in the minimum words needed. No examples unless the rule is ambiguous. No scaffolding for hypothetical future cases.                                                       |

For each **New skill** decision, write a draft to `.claude/skills/drafts/{kebab-name}.md`.

**Rule/reference skill** (a convention, constraint, or checklist — Claude reads before doing work):

```markdown
# {Title}

<One-paragraph description: what this enforces, why it matters, when it applies.>

## Rules

1. ...
2. ...

## Why

<Short rationale — what went wrong before this rule existed.>

## Examples

<Concrete right/wrong examples if useful.>
```

**Agent skill** (a repeatable multi-step task — use when the pattern involves many files or structured steps):

Follow the frontmatter and body format in `.claude/agents/`. Add a comment at the top: `<!-- DRAFT: promote to .claude/agents/ when ready -->`.

**STOP — show the developer what was written (file paths + summary of content) and wait for confirmation before marking reflections as triaged.**

## Step 6 — Mark reflections as triaged

Update **every** processed reflection file's frontmatter in place, then move it out of the main folder using `git mv` (never Write + delete — that loses git history):

1. Edit the frontmatter in place:
   - `status: pending-triage` → `status: triaged`
   - Add `triaged_to: {draft-filename}` if a draft was created
2. Run `git mv` to move the file:

   ```bash
   # Actioned reflections → triaged/
   git mv .claude/reflections/{filename}.md .claude/reflections/triaged/{filename}.md

   # One-off / no-action → archive/
   git mv .claude/reflections/{filename}.md .claude/reflections/archive/{filename}.md
   ```

This keeps `.claude/reflections/` containing only `pending-triage` files — the queue is always clean. Git history for each reflection is preserved across the move.

## Step 7 — Save report and summarise

Save the completed triage report to:

```
.claude/reflections/triage-reports/YYYY-MM-DD-triage-report.md
```

Use `.claude/skills/skill-triage/triage-summary.template.md` as the file structure. Fill in every section with the actual decisions and outcomes from this session — including the full cluster table, confirmed actions, skill audit findings, no-action items, and drafts created.

Then tell the developer:

```
Triage complete. Report saved to .claude/reflections/triage-reports/YYYY-MM-DD-triage-report.md

Reflections processed: N
Drafts created: N (list filenames)
Skill audit findings: N (summary)

Next: run /skill-promote once a draft has been validated for ~1 week.
```

**Lifecycle doc sync** — for every skill created or updated in this session, check if it is a lifecycle phase skill and flag the corresponding lifecycle doc for review:

| Skill prefix                                                                                                                                                           | Lifecycle doc                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `dev-plan`, `dev-implement`, `dev-test`, `dev-document`, `dev`                                                                                                         | `docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md`    |
| `design-frame`, `design-research`, `design-elaborate`, `design-solution`, `design-review-gate`, `design-address-feedback`, `design-publish`, `design-review`, `design` | `docs/Engineering Guide/Lifecycles/02 Design Lifecycle.md` |
| `skill-reflect`, `skill-triage`, `skill-promote`, `skill-new`                                                                                                          | `docs/Engineering Guide/Lifecycles/03 Skill Lifecycle.md`  |

If any match, tell the developer:

> "The following lifecycle docs may need updating to reflect the skill changes:
> <list docs + which skill changed them>
> Review and update if the phase description, invariants, or satellite skills table are affected."

**Harness bootstrap sync** — glob for `docs/Harness/package/` at the repo root. If it exists, list every skill and agent that was created or updated during this session (from Steps 5 and 6) and tell the developer:

> "Bootstrap is present. Run `/skill-harvest {name}` for each modified skill or agent to keep the bootstrap templates in sync:
>
> {list filenames}
>
> Skip any that were not changed in this session."
