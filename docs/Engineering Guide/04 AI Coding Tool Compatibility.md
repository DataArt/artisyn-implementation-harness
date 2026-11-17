---
id: 48960fc2
purpose: How harness skills, agents, and settings map to each supported AI coding tool's native files, and which install channel serves each host
keywords:
  [
    Claude,
    Codex,
    Copilot,
    implementation-harness,
    skills,
    agents,
    tool compatibility,
    install channels,
  ]
---

# AI Coding Tool Compatibility

The `implementation-harness` package installs a project-specific harness for Claude, Codex,
Copilot CLI, or any combination. Its canonical manifest maps the same source skills and role
definitions to native files. Installed files are editable project artifacts; harvest/apply
reconciles later changes. There is no intermediate project `.harness/skills` source or
continuous generator.

| Artifact     | Claude                           | Codex                            | Copilot CLI                      |
| ------------ | -------------------------------- | -------------------------------- | -------------------------------- |
| Provider dir | `.claude/`                       | `.agents/`                       | `.github/`                       |
| Instructions | CLAUDE.md                        | AGENTS.md                        | .github/copilot-instructions.md  |
| Skills       | `.claude/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` | `.github/skills/<name>/SKILL.md` |
| Agents       | `.claude/agents/<name>.md`       | `.codex/agents/<name>.toml`      | `.github/agents/<name>.agent.md` |
| Settings     | .claude/settings.json            | .codex/config.toml               | .github/copilot/settings.json    |
| MCP          | .mcp.json                        | MCP tables in .codex/config.toml | .mcp.json                        |
| Invocation   | `/implementation-harness …`      | `$implementation-harness …`      | `/implementation-harness …`      |

Each host installs through its own channel — plugin marketplace for Claude Code, Codex and
Copilot CLI, or a direct install (npm CLI, ZIP, skills.sh, `gh skill`) into the provider's
skills folder. See `docs/Harness/09 Distribution/01 Install.md` for the per-channel commands.
The Copilot column comes from the canonical manifest
(`skills/implementation-harness/canonical/manifest.json`, provider `copilot`). The manifest
paths and the Copilot reading of the marketplace manifest follow the official host
documentation.

Shared documentation is written once for every selected provider. Where a doc shows a
command, it uses a leading skill-invocation prefix — `/` in Claude, `$` in Codex — and
where it needs the root instruction file it names the one this install produced. Skill
companions (patterns, references, runtime procedures) are always referenced by their
path _inside_ the installed skill bundle, so the table above is the only place a
provider-specific root path appears.

Both-provider installs derive shared project facts once and render provider-specific paths
and invocation syntax. Native agent models and permissions are not interchangeable.
Role instructions do not create enforced tool allowlists. Existing provider configuration
is reconciled rather than overwritten, and local credentials remain local.

## Workflow contract and runtime procedures

Skills carry selected runtime procedures for planning, tracking, interaction, delegation,
context recovery, browser inspection, and credential setup. The procedures inspect actual
session capabilities; installing a skill does not enable every native feature.

- Tasks: workflow reports own durable progress; native tracking mirrors them when available.
- Planning: explicit proposal and persisted-plan sign-offs survive either native Plan mode
  or the documented planning-only fallback. Respect host write restrictions.
- Delegation: preserve role scope and independent review. If nested delegation is unavailable,
  the orchestrator dispatches the reviewer. Self-review is never labelled independent review.
- Context: persist a checkpoint and re-read artifacts on resume. Compaction is optional.
- Browser: check navigation, console, network and DOM capabilities separately. Record missing
  verification rather than claiming a screenshot proves an unavailable check.

Installation state lives in the project at `.harness/state/launch/` — one state root for all providers, never inside the package.
Story/design reports remain the cross-provider workflow state. Package updates never touch
`.harness/state/`. Other coding tools require a separately
implemented and verified adapter; this package does not claim support for them.
