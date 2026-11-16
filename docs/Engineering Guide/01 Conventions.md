---
id: 028f0622
purpose: Portable conventions for root context files, skill authoring, doc naming, and commit messages
keywords:
  [
    conventions,
    CLAUDE.md,
    skill authoring,
    file naming,
    commit messages,
    harness scope,
    commit-msg hook,
  ]
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

`<type>(<scope>): <what changed>` — types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `revert`. Scope is the app or layer. Message explains the _why_, not the _what_.

**Harness scope is enforced.** A commit that touches `skills/implementation-harness/**`, the legacy shim skill under `skills/`, `.claude-plugin/`, `.agents/plugins/` or `skills.sh.json` must use scope `harness` (the version commit uses `harness-release`). A failure names the files and the fix.

| Where                        | Checks                                    | Skips                             |
| ---------------------------- | ----------------------------------------- | --------------------------------- |
| `.husky/commit-msg` (local)  | Each commit message, against staged files | `Merge …` and `Revert …` subjects |
| CI (`ci.yml`, `rename-gate`) | Every commit in the PR range              | Merge commits only                |

CI does not skip reverts, so give a GitHub `Revert "…"` commit that touches harness files a scoped subject (`revert(harness): …`). Neither check sees a squash-merge PR title; on a squash merge the title is what lands on `main` — see `07 Branching Strategy.md`.

Scopes `harness` and `harness-release` produce no root `v*` release. The harness release lane bumps on commits that touch `skills/implementation-harness/` (Nx matches by path, `useCommitScope: false`), and this check makes those commits `harness`-scoped.

**Harness PRs carry their version.** Before merge, run `yarn harness:version` on the branch and commit the result as `chore(harness-release): <version>`. The `version-gate` check fails until the branch is stamped with the version its commits call for. See `08 Harness Release Runbook.md`, step 4.
