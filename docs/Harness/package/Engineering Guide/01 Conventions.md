# Conventions

_Portable conventions that apply regardless of which AI tool is used._

---

## Root context file — AGENTS.md is canonical

AGENTS.md is the file all major AI tools read. It is the single authoritative root context for the project. Tool-specific files (CLAUDE.md, `.kiro/steering/project.md`, `.cursor/rules/project.mdc`) are either symlinks or thin pointers to it — they do not contain independent content.

**Never duplicate content between AGENTS.md and a tool-specific wrapper.** The wrapper points; AGENTS.md holds.

Structure of AGENTS.md: WHY (2–3 sentences) → WHAT (rules + pointers) → HOW (commands / agents). Length: 60–130 lines. → See `{{DOC_PRINCIPLES_ARTICLE}}` for length budgets per doc type.

Do not auto-generate the root context file from scratch — generate a scaffold and edit by hand. Auto-generated root context is generic; hand-edited root context is precise.

---

## Skill authoring

- **One concept per file** — if a skill covers two unrelated conventions, split it
- **Lead with the rule** — state the convention in the first sentence; put the reasoning after
- **Include Why and How to apply** — the context lets future readers apply judgment in edge cases rather than follow the rule blindly
- **No duplicates** — check existing skills before creating; update the existing file if the concept is already covered
- **Length**: convention skills under 40 lines; orchestrator skills under 60 lines

For skill file locations per tool → see `04 AI Workflow.md`.

---

## File naming inside `docs/`

Format: `NN Title Case.md` — two-digit prefix, space, Title Case, `.md`.

Pick the next available number within the folder. Update README references when adding or renaming.

Numbers 04–08 in `Engineering Guide/` are reserved for project-specific articles (Getting Started, Local Dev Setup, Deployment, etc.) added by the team over time.

---

## Commit messages

`<type>(<scope>): <what changed>` — types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Scope is the app or layer. Message explains the _why_, not the _what_.
