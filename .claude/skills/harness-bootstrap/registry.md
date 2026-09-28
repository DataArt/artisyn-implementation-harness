# Tracked deployment registry

The package is authoritative. This project-local table maps canonical files to
permanent outputs; it is an allowlist, not a synchronization checkpoint.

- `patch harvest`: permanent → generalize → canonical.
- `patch prepare`: canonical (direct edits) → portable bundle. No personalization, no deployment.
- `patch apply`: canonical → personalize → permanent.
- `state/` holds baselines and outcomes; `patch/` holds immutable manifests with
  update diffs and full added files. See `references/patch/06-patch-state.md`.

Template paths are package-relative, rooted at `canonical/`; deployed paths are
project-relative. Add explicit
rows for installed companions, patterns, rule files, and workflows. A shared canonical
source may map to several outputs, each with its own baseline and substitutions.

`content` compares file content. `structure` checks required semantic categories
against the Interface article, preserving project prose and flexible headings. Its
Deployed Path can be a glob; inspect every matching file. Never harvest architecture
prose into canonical templates. New project registries start with local mappings,
not rows copied from the source project.

| Name                      | Type  | Compare   | Template Path                                                              | Deployed Path                                                    |
| ------------------------- | ----- | --------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| dev                       | skill | content   | `canonical/skills/dev/TEMPLATE.md`                                         | `.claude/skills/dev/SKILL.md`                                    |
| design                    | skill | content   | `canonical/skills/design/TEMPLATE.md`                                      | `.claude/skills/design/SKILL.md`                                 |
| war                       | skill | content   | `canonical/skills/war/TEMPLATE.md`                                         | `.claude/skills/war/SKILL.md`                                    |
| where-we-are              | skill | content   | `canonical/skills/where-we-are/TEMPLATE.md`                                | `.claude/skills/where-we-are/SKILL.md`                           |
| architect                 | agent | content   | `canonical/agents/architect/TEMPLATE.md`                                   | `.claude/agents/architect.md`                                    |
| docs-writer               | agent | content   | `canonical/agents/docs-writer/TEMPLATE.md`                                 | `.claude/agents/docs-writer.md`                                  |
| onboarding                | agent | content   | `canonical/agents/onboarding/TEMPLATE.md`                                  | `.claude/agents/onboarding.md`                                   |
| scrum-master              | agent | content   | `canonical/agents/scrum-master/TEMPLATE.md`                                | `.claude/agents/scrum-master.md`                                 |
| web                       | agent | content   | `canonical/agents/layer/TEMPLATE.md`                                       | `.claude/agents/web.md`                                          |
| infra                     | agent | content   | `canonical/agents/layer/TEMPLATE.md`                                       | `.claude/agents/infra.md`                                        |
| eg-conventions            | doc   | content   | `canonical/docs/Engineering Guide/01 Conventions.md`                       | `docs/Engineering Guide/01 Conventions.md`                       |
| eg-engineer-role          | doc   | content   | `canonical/docs/Engineering Guide/03 Engineer Role.md`                     | `docs/Engineering Guide/03 Engineer Role.md`                     |
| eg-ai-workflow            | doc   | content   | `canonical/docs/Engineering Guide/04 AI Workflow.md`                       | `docs/Engineering Guide/04 AI Workflow.md`                       |
| eg-mcp-setup              | doc   | content   | `canonical/docs/Engineering Guide/05 MCP Setup.md`                         | `docs/Engineering Guide/05 MCP Setup.md`                         |
| eg-doc-principles         | doc   | content   | `canonical/docs/Engineering Guide/Documentation/01 Principles.md`          | `docs/Engineering Guide/Documentation/01 Principles.md`          |
| eg-doc-structure          | doc   | content   | `canonical/docs/Engineering Guide/Documentation/02 Structure.md`           | `docs/Engineering Guide/Documentation/02 Structure.md`           |
| eg-hld-interface          | doc   | content   | `canonical/docs/Engineering Guide/Documentation/03 HLD Intent.md`          | `docs/Engineering Guide/Documentation/03 HLD Intent.md`          |
| eg-nfr-intent             | doc   | content   | `canonical/docs/Engineering Guide/Documentation/05 NFR Intent.md`          | `docs/Engineering Guide/Documentation/05 NFR Intent.md`          |
| eg-lld-interface          | doc   | content   | `canonical/docs/Engineering Guide/Documentation/04 LLD Intent.md`          | `docs/Engineering Guide/Documentation/04 LLD Intent.md`          |
| eg-lifecycles-overview    | doc   | content   | `canonical/docs/Engineering Guide/Lifecycles/00-overview.md`               | `docs/Engineering Guide/Lifecycles/00-overview.md`               |
| eg-dev-lifecycle          | doc   | content   | `canonical/docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md`          | `docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md`          |
| eg-design-lifecycle       | doc   | content   | `canonical/docs/Engineering Guide/Lifecycles/02 Design Lifecycle.md`       | `docs/Engineering Guide/Lifecycles/02 Design Lifecycle.md`       |
| eg-skill-lifecycle        | doc   | content   | `canonical/docs/Engineering Guide/Lifecycles/03 Evolve Lifecycle.md`       | `docs/Engineering Guide/Lifecycles/03 Evolve Lifecycle.md`       |
| eg-architecture-lifecycle | doc   | content   | `canonical/docs/Engineering Guide/Lifecycles/04 Architecture Lifecycle.md` | `docs/Engineering Guide/Lifecycles/04 Architecture Lifecycle.md` |
| eg-documents-flow         | doc   | content   | `canonical/docs/Engineering Guide/Lifecycles/05 Documents Flow.md`         | `docs/Engineering Guide/Lifecycles/05 Documents Flow.md`         |
| lld-component             | doc   | structure | `canonical/docs/Engineering Guide/Documentation/04 LLD Intent.md`          | `docs/System Architecture (LLD)/*/*.md`                          |
| lld-router                | doc   | structure | `canonical/docs/Engineering Guide/Documentation/04 LLD Intent.md`          | `docs/System Architecture (LLD)/README.md`                       |
| hld-container             | doc   | structure | `canonical/docs/Engineering Guide/Documentation/03 HLD Intent.md`          | `docs/Target Architecture (HLD)/*/Containers/*.md`               |
| hld-router                | doc   | structure | `canonical/docs/Engineering Guide/Documentation/03 HLD Intent.md`          | `docs/Target Architecture (HLD)/README.md`                       |
| hld-system-overview       | doc   | structure | `canonical/docs/Engineering Guide/Documentation/03 HLD Intent.md`          | `docs/Target Architecture (HLD)/*/System Overview.md`            |
| hld-system-sizing         | doc   | structure | `canonical/docs/Engineering Guide/Documentation/03 HLD Intent.md`          | `docs/Target Architecture (HLD)/*/System Sizing.md`              |
| nfr-pillar                | doc   | structure | `canonical/docs/Engineering Guide/Documentation/05 NFR Intent.md`          | `docs/Target Architecture (HLD)/*/Non-Functional Concerns/*.md`  |

<!--
Content rows' Deployed Path repeats the Template Path's suffix after the `canonical/docs/`
prefix (root differs: package `canonical/` vs. project root) since Engineering Guide docs
are deployed as near-verbatim copies (light Q5/Q11 substitution only), unlike skills/agents
whose deployed form is much more heavily parametrized.

docs-readme (docs/README.md) isn't tracked here — it's a thin index governed by
01-launch.md Block D.5's own inline instructions, not a container/component doc with an
Interface article of its own.

Structure rows' Template Path points at the relevant Interface article as a whole (the
required-categories contract), not a specific heading anchor within it — several rows
legitimately share the same Interface article (e.g. hld-container, hld-router,
hld-system-overview, hld-system-sizing, and nfr-pillar all point at 03 HLD Intent.md).
-->

| evolve | skill | content | `canonical/skills/evolve/TEMPLATE.md` | `.claude/skills/evolve/SKILL.md` |

## Provider adapter inventory

Provider destinations above are historical examples. Resolve installed paths through
`canonical/manifest.json` for each selected provider, including skill roots, agent
extensions and root instructions. Register temporary INTENT copies as installation
aids only, never as permanent runtime dependencies.

| Source                             | Role                       | Permanent mapping                                   |
| ---------------------------------- | -------------------------- | --------------------------------------------------- |
| canonical/manifest.json            | Adapter contract           | Consumed by planner/materializer                    |
| canonical/settings.json            | Native settings            | Selected provider settings destination              |
| canonical/mcp.json                 | Shared server declarations | Selected provider MCP destination                   |
| canonical/adoptors/<provider>/*.md | Runtime procedures         | Selected skill runtime/ and agent runtime directory |

The design solution interface uses `interfaces/contract.md`; it is a permanent runtime
contract, distinct from installation-only INTENT.md. Provider helper scripts are
package tooling and travel as canonical-only support changes. Exclude state/ from bundles.
