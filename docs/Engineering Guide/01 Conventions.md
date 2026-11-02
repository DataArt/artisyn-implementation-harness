---
id: 028f0622
purpose: Portable conventions for root context files, skill authoring, doc naming, and commit messages
keywords: [conventions, CLAUDE.md, skill authoring, file naming, commit messages]
---

# Conventions

_Portable conventions that apply regardless of which AI tool is used._

---

## Root context file — CLAUDE.md is canonical

This project is Claude-Code-only. CLAUDE.md is the single authoritative root context file, loaded on every session — project instructions, rules, pointers. There is no separate AGENTS.md or tool-specific wrapper; CLAUDE.md holds the real content directly.

**If this harness is ever extended to another AI tool**, that tool's root file should point to CLAUDE.md rather than duplicating its content — don't maintain the same rules in two places.

Structure of CLAUDE.md: WHY (2–3 sentences) → WHAT (rules + pointers) → HOW (commands / agents). Length: 60–130 lines. → See `Documentation/01 Principles.md` for length budgets per doc type.

Do not auto-generate the root context file from scratch — generate a scaffold and edit by hand. Auto-generated root context is generic; hand-edited root context is precise.

---

## Skill authoring

- **One concept per file** — if a skill covers two unrelated conventions, split it
- **Lead with the rule** — state the convention in the first sentence; put the reasoning after
- **Include Why and How to apply** — the context lets future readers apply judgment in edge cases rather than follow the rule blindly
- **No duplicates** — check existing skills before creating; update the existing file if the concept is already covered
- **Length**: convention skills under 40 lines; orchestrator skills under 60 lines

For skill file locations per tool → see `04 AI Coding Tool Compatibility.md`.

---

## File naming inside `docs/`

Format: `NN Title Case.md` — two-digit prefix, space, Title Case, `.md`.

Pick the next available number within the folder. Update README references when adding or renaming.

Numbers 04–08 in `Engineering Guide/` are reserved for project-specific articles (Getting Started, Local Dev Setup, Deployment, etc.) added by the team over time.

---

## Commit messages

`<type>(<scope>): <what changed>` — types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Scope is the app or layer. Message explains the _why_, not the _what_.
