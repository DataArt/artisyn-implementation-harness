# AI Workflow

_How the harness concepts map to each AI tool's primitives._

> ⚠️ Tool capabilities change rapidly. Verify against current tool docs before relying on this table. Last reviewed: 2026-05.

---

## Concept map

| Harness concept             | What it does                                                       |
| --------------------------- | ------------------------------------------------------------------ |
| **Root context file**       | Loaded on every session; project instructions, rules, pointers     |
| **Skills / Slash commands** | Encode repeatable conventions; invoked explicitly by the developer |
| **Agents**                  | Specialised subagents with scoped tool access for specific tasks   |
| **Memory**                  | Persistent cross-session context about the project and team        |
| **Lifecycles**              | Multi-phase workflows with human confirmation gates                |

---

## Cross-tool comparison

| Feature                     |         Claude Code         |        Codex CLI         |             Cursor             |         Kiro          |       Windsurf        |
| --------------------------- | :-------------------------: | :----------------------: | :----------------------------: | :-------------------: | :-------------------: |
| **Root context file**       |          CLAUDE.md          |        AGENTS.md         |     `.cursor/rules/*.mdc`      | `.kiro/steering/*.md` |   `.windsurfrules`    |
| **Slash commands / Skills** | `.claude/skills/*/SKILL.md` |   `skills/*/SKILL.md`    | `.cursor/rules/*.mdc` (static) | `.kiro/steering/*.md` | flat `.windsurfrules` |
| **Agents**                  |    `.claude/agents/*.md`    |            —             |      Agent mode (session)      |    `.kiro/hooks/`     |           —           |
| **Persistent memory**       |      `.claude/memory/`      |            —             |               —                |    steering files     |   Cascade Memories    |
| **Confirmation gates**      |          ✅ native          |            ❌            |               ❌               |  ✅ (task approval)   |          ❌           |
| **Event hooks**             |    ✅ (`settings.json`)     |            ❌            |               ❌               |          ✅           |          ❌           |
| **Template files**          |    ✅ (companion `.md`)     |            ❌            |               ❌               |          ❌           |          ❌           |
| **Directory-scoped rules**  |  ✅ (`CLAUDE.md` cascade)   | ✅ (`AGENTS.md` cascade) |       ✅ (glob patterns)       |          ❌           |          ❌           |

---

## AGENTS.md — the canonical root

**AGENTS.md is the cross-tool root context file.** Use it as the single source of truth; tool-specific files point to it rather than duplicating it.

| Tool        | How to wire AGENTS.md                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Claude Code | `CLAUDE.md` → one-liner: `→ See AGENTS.md for project instructions.`      |
| Codex CLI   | Read natively from repo root; no wrapper needed                           |
| Cursor      | `.cursor/rules/project.mdc` with `alwaysApply: true` → `→ See AGENTS.md`  |
| Kiro        | `.kiro/steering/project.md` → mirror AGENTS.md WHAT section               |
| Windsurf    | First line of `.windsurfrules` → `See AGENTS.md for project conventions.` |

---

## Tool-specific notes

**Kiro** — the closest harness-native tool. Specs map to the Dev lifecycle: `requirements.md` ≈ `1-plan.md`, `tasks.md` ≈ the Progress table. Hooks fire on file save and test failure (similar to Claude Code's PostToolUse hooks). Steering files are always-loaded — use them for project conventions.

**Codex CLI** — `AGENTS.md` files cascade up the directory tree. This enables per-layer rules: `apps/serving/bff/AGENTS.md` for BFF-specific conventions, without touching the root.

**Cursor** — rule files use YAML frontmatter (`description`, `globs`, `alwaysApply`). Slash commands are now supported. Confirmation gates are not native — lifecycle phases must be enforced by prompt discipline ("tell me to continue before I proceed").

**Claude Code** — the reference implementation. All harness concepts have direct primitives. Hooks in `settings.json` automate nudges (e.g. fire a reflection prompt when a commit is detected).

**Windsurf** — `.windsurf/rules/` directory is supported alongside the flat `.windsurfrules`. No native agents or confirmation gates.

---

## Portability floor

The following work regardless of tool — they are file-system conventions, not tool-dependent:

- The `docs/` four-tier structure (HLD / LLD / Engineering Guide / Stories)
- The certainty principle
- The `Documentation Principles` article
- `AGENTS.md` as root context
- Skill files in `docs/Harness/package/skills/` (SKILL.md format is now cross-tool standard)
