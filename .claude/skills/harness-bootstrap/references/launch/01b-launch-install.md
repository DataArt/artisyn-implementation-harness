# Launch blocks A–C and D.1 — install in dependency order

Before generating skill entrypoints and companions, apply [Skill authoring](../../patterns/skill-authoring.md). This is a bootstrap authoring pattern, not a deployed standalone skill.

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

Read destinations and runtime procedures from `canonical/manifest.json`.
Claude installs `.claude/skills/<name>/SKILL.md` and `.claude/agents/<name>.md`;
Codex installs `.agents/skills/<name>/SKILL.md` and `.codex/agents/<name>.toml`.
Rename skill TEMPLATE.md, preserve companion names, install the selected provider's
runtime procedures, apply INTENT to permanent content, and verify before removing
temporary INTENT copies. Canonical INTENTs remain in the package.

For an existing installation, reconcile retired helpers within the authorized
deployment scope:

- `writing-docs` and `story-folder-glob` have no replacement command. Documentation
  guidance belongs to `docs-writer`; story lookup rules remain in Dev and Design.
- X-ray uses the selected runtime/browser.md procedure; browser checks are capability-specific and optional.
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

Generate one root instruction file for each selected provider: CLAUDE.md for Claude,
AGENTS.md for Codex, both for both. Derive shared project facts once and render
provider paths/invocations consistently. Reconcile existing guidance; preserve
unselected provider files and unrelated local configuration.

Structure root instructions as Why / What / How within the installed Documentation
Principles budget: purpose, conventions, guarded commands, stack, HLD/NFR pointers,
selected lifecycle scope, installed skills/roles, tracker and integration setup.

`canonical/settings.json` is the native settings source for Claude and Codex.
`canonical/mcp.json` holds the selected shared server declarations (empty by default).
The adapter renders Claude settings and MCP separately and assembles both into
Codex config.toml. Existing non-identical configuration is a reserved derivation: the
materializer does not overwrite it. Reconcile exact changes while preserving existing
hooks, permissions, servers and unrelated keys; validate the final syntax.

Credentials remain environment references. Explain selected runtime/credentials.md
in onboarding and the MCP guide. Do not collect credentials in answers, plans or
reports, copy local credential values, or grant provider trust on behalf of a user.
Record unavailable integrations and required human setup honestly.

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

### Provider placeholders in shared docs

Shared docs are generated once for all selected providers, so they carry no literal
provider paths. Resolve these placeholders during D.1 and verify none survive:

| Placeholder             | Resolve to                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `{{SKILL_PREFIX}}`      | The invocation prefix from the manifest (`/` Claude, `$` Codex). For a both-provider install use the |
|                         | primary provider's prefix and keep the notation note that explains the other.                        |
| `{{ROOT_INSTRUCTIONS}}` | The generated root instruction filename(s) — `CLAUDE.md`, `AGENTS.md`, or both.                      |

Do not reintroduce a provider skill/agent root into a shared doc. Reference skill
companions by their path inside the installed bundle (`patterns/…`, `runtime/…`), and
leave the provider→path mapping to `04 AI Coding Tool Compatibility.md`, which is the
one doc that legitimately names both providers' paths. `05 MCP Setup.md` documents
each selected provider's credential route; remove the sections for providers that were
not selected.

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
