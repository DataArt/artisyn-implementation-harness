# Skill authoring — launch pattern

Apply when generating or updating canonical skill templates and when launch derives
provider-specific skill entrypoints and companions. This reference belongs to
bootstrap; do not install it as a standalone project skill.

## Entrypoints and provider paths

Use the provider selected in launch answers and the launch installation mapping.
For Claude, slash commands use `.claude/skills/{name}/SKILL.md`, with `name` and
`description` frontmatter. Register entrypoints in the provider-selected root
instruction file. Supporting references are loaded by their callers and do not need
individual root-context entries.

## Context and artifact contracts

Keep the entrypoint focused on discovery, routing and shared constraints. Put stage
procedures in references and reusable protocols in patterns. Load each at its point
of use through an explicit path. Each instruction has one authoritative owner.

Use independently editable companion templates for fixed output structure and
interfaces for adaptive semantic coverage. A small skill can keep companions flat;
use `templates/`, `interfaces/`, `references/` and `patterns/` when the contents justify
them. Avoid imposing a folder or document shape unrelated to the problem.

Declare deployed companions in the skill's INTENT inventory. Resolve provider paths
and project substitutions consistently across entrypoints and companions. Check links,
callers, metadata and conditional omissions against the actual generated layout.

## Canonical template versions

Canonical TEMPLATE.md files carry `metadata.version` using semantic versioning.
When a canonical template changes, use patch for wording corrections, minor for
compatible new behavior, and major for incompatible command, placeholder or workflow
changes. Harvest updates canonical sources; apply personalizes them for deployment.
Version metadata is a canonical tracking concern; follow the deployment contract
when producing the live provider entrypoint.
