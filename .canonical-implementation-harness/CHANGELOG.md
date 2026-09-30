# Changelog

All notable changes to the `harness-bootstrap` package. See `references/00-overview.md` for the full package description and versioning rules (patch/minor/major, same as `skill-authoring.md`'s "Bootstrap template versioning").

## 2.1.1

Fixes surfaced by the Codex greenfield e2e case after 2.1.0:

- Require every D.1–D.5 output (Engineering Guide, HLD/LLD, docs/README.md, root
  README.md, app READMEs), not only the two D.2 shared pattern docs, to be reserved in
  `derived_outputs` and re-validated progressively, so plan/receipt/operation record
  stay reconciled instead of failing Stage E verification.
- Clarify that a D-stage `derived_outputs` reservation always amends the original
  `<run_id>/plan.json` in place; a new linked run ID is reserved solely for splitting
  A/B/C materialization or a later block with unresolved inputs, never for D.1–D.5.
- Require native task subjects to use the exact recorded run ID (not a literal mode
  name) so run-scoped grader queries match, and tighten the Status cell to
  byte-for-byte Pending/In progress/Complete with skip rationale moved to Notes.
- Forbid delegating a launch, or any span of it, to a fire-and-forget background
  subagent; per-stage delegation must be dispatched and awaited synchronously. D.5
  now also requires linking the project's root README.md into `docs/`.

## 2.1.0

Adds provider-neutral partial launch checkpoints for externally blocked Stage E
verification, including durable output hashes and explicit local, independent-review,
and Mermaid gate evidence. The Codex launch configuration enables native
`tools.update_plan`, and the E2E graders accept the documented report and checkpoint
formats while continuing to reject incomplete adaptation, missing outputs, stale
hashes, and unverifiable gates. The canonical package is now the release source;
consumer projects receive only its packaged ZIP.

## 2.0.0

Breaking: replaces the Claude-only harness with a manifest-driven Claude/Codex adapter.
Drops Cursor/Kiro/Windsurf as install targets (documented portability targets only, per
`04 AI Coding Tool Compatibility.md`). Moves bootstrap operation state from project
`.harness/launch/` to package-local `state/launch/`. Retires the Claude Workflows-based
LLD/HLD fan-out in favor of layer/component agent dispatch. Per-template version bumps
for incompatible placeholder/workflow changes (Claude-only mechanics replaced by
`{{provider:*}}` tokens and installed runtime procedures): `dev` 2.21.1 -> 3.0.0,
`design` 3.4.1 -> 4.0.0, `war` 1.1.0 -> 2.0.0, `where-we-are` 0.4.0 -> 1.0.0,
`scrum-master` (agent) 1.0.0 -> 2.0.0.

- Add canonical manifest, settings and MCP inputs with Claude/Codex/both launch planning.
- Install provider runtime procedures for planning, tasks, delegation, questions, context and browser checks.
- Preserve explicit plan sign-offs with a planning-only fallback; make design compaction optional.
- Render Codex agents/config as TOML and preserve existing configuration for explicit reconciliation.
- Store launch records in bootstrap state/launch; verify final hashes before removing temporary INTENT copies.
- Exclude project launch state from release archives; preserve legacy state as migration input.
- Make shared Engineering Guide docs provider-neutral: `{{SKILL_PREFIX}}` and `{{ROOT_INSTRUCTIONS}}`
  placeholders resolved at D.1, skill companions referenced inside the installed bundle, and
  `05 MCP Setup.md` covering each provider's credential route.
- Rewrite `01 Dev Lifecycle.md` around intent, flow, per-stage invariants and patterns.
- Move Claude-in-Chrome setup into `adaptors/claude/browser.md` and drop the orphaned x-ray companion.
- Finalizer prunes directories left empty by removed temporary INTENT copies.
- Genericize the onboarding agent: components/tracker/wiki drive the checklist instead of a
  hardcoded web/BFF/Jira/Confluence assumption, and its "Key docs" list points at Engineering
  Guide files that actually exist in the package.
- Decompose `scripts/` into single-purpose functions plus a shared `scripts/lib/` (constants,
  path/hash safety, CLI parsing, fs walk, token resolution, manifest/agent/MCP rendering);
  `provider-adapter.mjs` stays the frozen public entry point, now a thin façade over `lib/`.
  Extended the frozen adapter-source set to cover `lib/manifest.mjs`, `lib/agent-format.mjs`
  and `lib/mcp-config.mjs` so a plan still can't be materialized against a changed renderer.
- Rename `check-materialize-launch.mjs`/`check-provider-launch.mjs` to
  `materialize-launch.test.mjs`/`provider-launch.test.mjs`, moved into `scripts/tests/` —
  they're `node:assert`-based regression tests, not launch-time checks; `check-mermaid.mjs`
  keeps its name and location, since it's a real launch-time rendering gate invoked with an
  actual project's `config.json`, not a test.
- `canonical/manifest.json` is now the sole source of truth for each provider's
  `agentFormat`/`invocationPrefix`: `lib/constants.mjs` no longer shadows those exact values
  per provider name, only the enum of formats the renderer implements (`SUPPORTED_AGENT_FORMATS`)
  and a shape check for the prefix (`INVOCATION_PREFIX_RE`). `PROVIDER_NAMES` stays, documented
  as the renderer's own support boundary, not provider data the manifest should be re-checked
  against.

## 1.3.0

Audit found while bootstrapping into another project: several canonical skills
hardcoded "NX monorepo" / `apps/` + `libs/` instead of using placeholders, so a
non-NX project (that launch was correctly reported as a Turborepo/pnpm monorepo
during Q&A) still got NX-specific wording baked into its deployed skills.

- **Q2** (`references/launch/02-launch-questions.md`) now explicitly captures the
  monorepo tool (NX/Turborepo/Lerna/pnpm workspaces/none) and the actual source
  directory layout, as the single authoritative source for two new shared
  placeholders instead of each skill inventing its own detection.
- **New placeholders**: `{{CODE_SCAN_TARGET}}` (a phrase describing where code
  lives, e.g. "the NX monorepo under `apps/` and `libs/`" vs "the codebase") and
  `{{BUILD_UNIT_LABEL}}` (the generic noun for one buildable unit — `NX project`,
  `package`, `module`, or the app's own name).
- **Fixed hardcoded canonical templates**: `where-we-are/TEMPLATE.md` (0.3.1 ->
  0.4.0) and `war/references/02-implementation.md` (war 1.0.0 -> 1.1.0) no longer
  assume an NX monorepo under `apps/`/`libs/`. `dev`'s plan/implement guidance
  (dev 2.20.0 -> 2.21.0) no longer says "NX project" as prose language, only as an
  example value for `{{BUILD_UNIT_LABEL}}`. `x-ray`, `agents/infra`,
  `agents/layer`, and `agents/onboarding` were already placeholder-based (NX only
  appeared as an "e.g." in their INTENT notes) — no change needed there.

## 1.2.0

Fix found bootstrapping the harness into another project: launch created HLD/LLD
docs but never linked them from each app's `README.md`, even though installed
Documentation/02 Structure.md's "App README scope" requires it. `/dev document`
keeps this in sync incrementally afterward, but a first launch has no prior
`/dev document` run to have seeded it.

- **D.4/D.5 (indexes)**: after creating/confirming HLD/LLD outputs, launch now also
  adds/updates an `## Architecture` section linking to the relevant HLD container
  and LLD component doc in every discovered app's `README.md` — not just
  `project:docs/README.md`. An app with no corresponding HLD container yet is a
  recorded skip.
- **Final audit**: added a checklist bullet catching any app README still missing
  those links, as a defense-in-depth check independent of the D.5 step above.

## 1.1.0

Fixes found while bootstrapping the harness into other projects.

- **Launch ignore setup**: a fresh bootstrap/patch into a target project now untracks
  any already-committed `.canonical-implementation-harness/` files before gitignoring
  the folder, so the ignore rule actually takes effect there. This repo's own
  canonical copy is exempt — it stays tracked as the source of truth.
- **Block C (root context/MCP)**: launch now merges `CLAUDE_CODE_ENABLE_TASKS` and
  `CLAUDE_CODE_ENABLE_TODO_TOOLS` into the target project's `.claude/settings.json`
  `env` block (Claude Code only) if not already present, since native Task tracking
  used throughout launch/patch depends on them.

## 1.0.0

First stable release. Installs the portable AI-dev harness (`launch`) and keeps it in
sync between this package and deployed projects (`patch harvest` / `patch prepare` /
`patch apply`).

- **Launch**: Q&A → JSON plan → deterministic materialization → INTENT adaptations →
  verify, tracked via native Claude Code Tasks with report/TodoWrite fallback.
  Installs skills, agents, root context/MCP wiring, and Engineering Guide docs
  (LLD/HLD generated via parallel workflows), then runs a satellite review and
  suggests a commit.
- **Patch harvest/prepare/apply**: three independent, fixed-direction operations
  built on portable bundle manifests, all reading/writing only `canonical/` (plus a
  few documented package-internal exceptions). Harvest generalizes permanent-file
  drift into canonical sources; prepare packages direct canonical edits with no
  personalization; apply personalizes canonical sources into permanent files, with
  conflict resolution against stored baselines.
- **`dev` and `design` lifecycles**: single `$ARGUMENTS`-routed skills, each with
  stage-scoped `references/`, deduplicated `patterns/`/`templates/`, native Task
  tracking, native Plan Mode for plan approval, and a tracker-agnostic router (no
  literal Jira wording — transitions delegated to `@scrum-master` by state name).
  `dev`: Context Gathering → Ceremony → Plan → Implement → Test → Document. `design`:
  Frame → Research/Evaluate → Solution (WAF review) → Review Gate → Address Feedback
  → Publish, with `solution/Architecture.md` as the end-to-end decision record.
- **`war`**: single skill, `design`/`implementation` Well-Architected audits against
  the active HLD version, with shared scope-resolution and present-then-save
  mechanics.
- **Sign-off gates**: explicit stop-and-wait human checkpoints at Context Gathering,
  Ceremony (branch checkout), Plan (drafted content and, separately, the persisted
  file), and Implement (per-step verification and commit) — self-run checks are
  never recorded as developer confirmation, and a delegated worker's `go` verdict
  never substitutes for the orchestrator's own gate.
- **Metrics**: `scripts/timing.mjs` tracks stage/step timing, author, and derived
  flags (retried/scope-changed/reopened/failed-check) in `stat.json`, rendered into
  `2-report.md`'s Stage/Step Metrics tables.
- **Delegation safety**: disjoint output paths per delegated worker, no
  worker-initiated sub-delegation, shared coordination files (`registry.md`,
  `answers.json`, manifests, reports) written only by the orchestrator.
