# Launch blocks A–C and D.1 — install in dependency order

Before generating skill entrypoints and companions, apply [Skill authoring](../patterns/skill-authoring.md). This is a bootstrap authoring pattern, not a deployed standalone skill.

Stage sequence and tracking live in [01-launch.md](01-launch.md); planning and
materialization in [01a-launch-plan.md](01a-launch-plan.md).

## Block A — Skills

Use `package:canonical/skills/<name>/TEMPLATE.md` plus its INTENT and companion inventory.
Install required referenced writing/review helpers even when outside these lifecycles.

| Selection                         | Skills            |
| --------------------------------- | ----------------- |
| Always                            | dev               |
| Design enabled                    | design            |
| Skill enabled                     | evolve            |
| Architecture enabled and Q11≠None | war, where-we-are |

When the Skill lifecycle is enabled, deploy `evolve` and its companion inventory.
During authorized deployment, replace the generated `skill-lifecycle`, `skill-reflect`,
`skill-triage`, `skill-new`, and `skill-promote` entry points after updating their
callers to `/evolve` stages. Preserve user reflections, drafts and unrelated content;
review customized legacy commands before removal. Keep the legacy configuration key
`Skill` compatible while displaying the lifecycle as Evolve.

`skill-harvest` is retired; bootstrap's `patch harvest/apply` replaces it. Follow
`package:registry.md` for canonical inventory, including flat/shared references.

| Q6          | Project skill destination                         | Project agent destination                                      |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------- |
| Claude Code | `.claude/skills/<name>/SKILL.md`                  | `.claude/agents/<name>.md`                                     |
| Codex CLI   | `skills/<name>/SKILL.md`                          | `<layer-dir>/AGENTS.md`; map cross-cutting guidance explicitly |
| Cursor      | `.cursor/rules/<name>.mdc`; set globs/alwaysApply | `.cursor/rules/agent-<name>.mdc`, alwaysApply:false            |
| Kiro        | `.kiro/steering/<name>.md`                        | `.kiro/hooks/<name>.md`                                        |
| Windsurf    | Unique fragments → reserved `.windsurfrules`      | Same final assembly                                            |

Resolve all cross-file references for the selected tool; preserve companion names.

For an existing installation, reconcile retired helpers within the authorized
deployment scope:

- `writing-docs` and `story-folder-glob` have no replacement command. Documentation
  guidance belongs to `docs-writer`; story lookup rules remain in Dev and Design.
- The old flat `claude-in-chrome-setup.md` is now an X-ray companion at
  `x-ray/references/claude-in-chrome-setup.md`; deploy it when X-ray is selected.
- `worker-satellite-review.md` is replaced by `dev/patterns/satellite-review.md`.
  Verify that companion is installed before updating Infrastructure's caller.
- The old deployed `skill-authoring.md` is now bootstrap-only guidance at
  `patterns/skill-authoring.md`. Remove legacy callers as part of the
  corresponding lifecycle migration; do not leave references to a removed file.

Inspect local modifications and remaining callers before retiring installed copies.
Update project mappings and root discovery entries for the actual deployment;
preserve historical reports and patch bundles.
Summarize actual outputs/checks at A's boundary; carry pending dependencies forward.

## Block B — Agents

Propose names/scope from Q2/Q3 and resolve additions/renames with the developer.
Use `package:canonical/agents/layer/TEMPLATE.md` and `layer/INTENT.md` once per detected
implementation layer. Select a confirmed profile (web, backend/BFF, data, worker,
library, CLI, infrastructure, or another evidence-backed profile) and inject only
its applicable rules. Do not install separate BFF, Web or DB templates; generated
filenames may still be `bff.md`, `web.md`, or `db.md` when those are actual layer names.
Use `infra/` only for the separate provisioning specialist when its safety semantics
need that role; `architect/` for review even with one container;
`docs-writer/` and `onboarding/` for launch; `scrum-master/` only with applicable tracker;
`product-architect/` additionally for Product-context/Two-track Design.
Layer agents retain Role, Layer scope, What to enforce, Satellite review, What never
to do. Preserve required shared behavior in every specialist.
Register installed skills/agents/companions in `project:.harness/registry.md` using the canonical
schema, and record canonical/rendered bytes and hashes per Patch State.

## Block C — Provider instruction file and MCP

Select exactly one authoritative project instruction file from confirmed Q6:

| Provider    | Instruction destination                                                        |
| ----------- | ------------------------------------------------------------------------------ |
| Claude Code | `project:CLAUDE.md`                                                            |
| Codex CLI   | `project:AGENTS.md`                                                            |
| Cursor      | `project:.cursor/rules/project.mdc` with alwaysApply:true                      |
| Kiro        | `project:.kiro/steering/project.md` with root scope                            |
| Windsurf    | Confirm the provider-supported project instruction path in Q6                  |
| Multiple    | Resolve one primary provider and instruction destination in Q6 before planning |

Reserve only this destination in the JSON plan. Claude-only launch creates CLAUDE.md
with the actual guidance; it does not create AGENTS.md or a link-only CLAUDE.md wrapper.
Codex-only launch creates AGENTS.md and no CLAUDE.md. Multiple-provider selection
must not silently generate both: record the primary provider, selected path, and any
secondary-provider discovery limitation before freezing the plan. An additional
instruction file requires an explicit change to the requested single-file scope.

Reconcile useful existing guidance into the selected authority. Existing files from
other providers are adoption inputs, not permission to delete them; include proposed
retirement in the cleanup inventory and resolve conflicting guidance explicitly.
Do not claim a single-authority migration complete with unresolved competing guidance.
Structure the file as Why / What / How within the root-context budget from installed
Documentation/01 Principles.md: purpose, critical conventions and guarded commands,
containers/stack, HLD/NFR pointers, selected design track, actual skills/commands/
agents, tracker and MCP. Point to docs for full guidance. Update generated links to
the selected instruction path. Task C verifies that the plan and generated outputs
contain one provider-selected authority and no unsolicited root wrapper. This rule
concerns project-wide instructions; scoped layer agent files remain part of Block B
where required by the selected provider.

Preserve existing settings/hooks; reconcile Claude permissions with Q7 and include
applicable lifecycle hooks rather than replacing config wholesale. Propose plausible
tracker/repo/cloud/stack MCP servers from evidence and install only selected servers.
Use `project:.mcp.json` with `${ENV_VAR}` references, never literal credentials. Add
placeholder env keys to `project:.claude/settings.local.json`, ensure project gitignore
covers it, and document keys/setup in the installed MCP guide. Preserve existing keys.
For Claude Code PAT authentication, the developer edits the PAT value locally in
settings.local.json's env block; bootstrap merges placeholders only. Do not generate
an MCP .env file, source command or application-env dependency. Shared .mcp.json
contains variable references only. The installed MCP guide and onboarding instructions
must describe this same route, including restarting the session after editing settings.
Never collect PAT values in Q&A or copy them into tracked run/patch records. This is
Claude-specific; other selected providers use their supported credential configuration.
Verify JSON, server selection, the selected instruction file, and permissions; record unavailable integrations.

## D.1 — Engineering Guide

Copy/adapt from `package:canonical/docs/Engineering Guide/` to `project:docs/Engineering Guide/`,
preserving these relative paths and recording each installed doc in the registry:

| Relative source and destination           | Condition                                        |
| ----------------------------------------- | ------------------------------------------------ |
| `01 Conventions.md`                       | Always                                           |
| `03 Engineer Role.md`                     | Always                                           |
| `04 AI Coding Tool Compatibility.md`      | Always                                           |
| `05 MCP Setup.md`                         | A selected integration needs setup documentation |
| `Documentation/01 Principles.md`          | Always                                           |
| `Documentation/02 Structure.md`           | Always                                           |
| `Documentation/03 HLD Intent.md`          | Always                                           |
| `Documentation/04 LLD Intent.md`          | Always                                           |
| `Documentation/05 NFR Intent.md`          | Selected NFR scope                               |
| `Lifecycles/00 Overview.md`               | Always                                           |
| `Lifecycles/01 Dev Lifecycle.md`          | Always                                           |
| `Lifecycles/02 Design Lifecycle.md`       | Design enabled                                   |
| `Lifecycles/03 Evolve Lifecycle.md`       | Skill enabled                                    |
| `Lifecycles/04 Architecture Lifecycle.md` | Architecture enabled                             |
| `Lifecycles/05 Documents Flow.md`         | Always                                           |

All documentation writers read installed Documentation/01 Principles.md and the
applicable intent before drafting; validate against both immediately after writing.
Formatting rules live in Principles, not copied into each worker instruction.
For 01 Conventions.md, derive project coding rules from representative source across
actual layers, build/compiler/formatter configuration and documented team decisions.
Capture naming, organization, dependency boundaries, data/state handling, errors,
configuration and checks only where applicable. Each convention states scope, rule,
representative source and whether it is enforced or an observed recurring pattern.
Do not promote a one-off example to a universal rule. Replace portable harness filler
with captured code conventions; put tool compatibility and skill-authoring elsewhere.
Verify commands and provider-generator claims in the compatibility guide against the
actual project before publishing them; canonical example commands are not evidence.

Resolve project/WAF/MCP placeholders and active lifecycle references in installed copies.
Design Lifecycle and Documents Flow ship as Two-track: preserve that structure for
Two-track; otherwise remove context-resolution steps/pattern rows and the unused
Product/Project publication branch, simplify remaining labels, and preserve the HLD
node and `/dev document` edges. Resolve design-agent/root/product-folder substitutions
consistently with Q10b and `design/INTENT.md`'s design-lifecycle-scope conditional. Record these rules as planned adaptations.
