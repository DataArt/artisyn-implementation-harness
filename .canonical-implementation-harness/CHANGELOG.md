# Changelog

All notable changes to the `harness-bootstrap` package. See `references/00-overview.md` for the full package description and versioning rules (patch/minor/major, same as `skill-authoring.md`'s "Bootstrap template versioning").

## 3.1.0

Design skill 6.1.0: harvested from a direct canonical edit, itself adopted from
an `/evolve` candidate triaged out of a reflection — the task tracker was being
created only after a developer noticed it was missing and asked for it, well
after Context Gathering had already reached sign-off.

- **Tracker creation moved into Resume Detection itself.** At Step 1 for a
  fresh start (no `Report.md` to read yet), or right after Step 2's artifact
  table for a resume (so initial stage statuses reflect what the table already
  shows, instead of marking everything freshly pending) — in both cases ahead
  of Step 3's confirmation prompt and before any phase work. The old
  instruction deferred this to "once Resume Detection... apply Stage tasks
  below," which ran after the confirmation prompt and made the gap easy to
  miss on a fresh start.
- Compatible, additive change — no command, placeholder, or workflow-step
  change; `patterns/task-tracking.md`'s own create-vs-reuse logic is untouched.

## 3.0.0

Design skill 6.0.0: the same gate-density pass the dev skill got in 2.3.0, applied
to `/design`. Prompted by the suspicion — confirmed by counting — that design had
the same "too many approval gates" problem dev had before its own pass, just worse:
30 explicit stops plus 6 more inter-phase "ready to continue?" asks across a full
run, against dev's pre-3.1.0 high of roughly 3 per phase.

- **Approval gates collapsed.** Every stage now ends Sign-off → Report → Commit,
  two real stops, with everything else folded into intelligent checkpoints
  (`patterns/approval-intelligent.md`) or carried into the one sign-off.
  Solution went from 9 stops to 2 (drafts review + estimates fold into the same
  sign-off; the architect review auto-triggers on a boundary/contract change
  instead of asking permission first). Evaluate went from 6 to 2. Research from
  4 to 2. The per-phase "Announce → Compact → Resume" handoff is gone — phases
  now chain straight through on a confirmed commit, same as dev.
- **`patterns/compact-between-phases.md` retired.** Its proactive-compaction job
  was redundant with `session-continuity.md`'s reactive one; the latter is
  shrunk to match dev's — fresh-vs-resume is decided once, at the router's
  Resume Detection, and the pattern only covers losing context mid-stage.
- **New `patterns/phase-sign-off.md`**, mirroring dev's: one sign-off per
  phase, everything the developer needs to decide in one message.
  `approval-sign-off.md` now says sign-offs are used sparingly and names this
  as the normal place for one.
- **Completion is a new stage 8** (`/design complete {TICKET}`), split out of
  what Publish used to do alone: publish implementation tickets, archive,
  sync the tracker, hand over the commit and PR text. Publish now ends once
  the permanent docs are updated and reviewed.
- **Address Feedback can decline, not only request rework.** A third outcome
  alongside "re-approved" / "still concerns": the approver rejects the design
  outright. Declined designs skip Publish entirely (no permanent docs to
  update) and go straight to Completion, which archives to `declined/`
  instead of `approved/`, syncs the tracker to a rejected status instead of
  Done, and skips the PR handover.
- **Frame now surfaces multi-decision bundling as a question, not a silent
  split.** A new Decisions section in `00 Frame.md` is drafted whenever the
  Problem implies two or more independent decisions, and confirmed with the
  developer at the Frame sign-off — not re-detected reactively once Research
  is already underway.
- **Story folder restructured, with a Product/Project split.** Design-lifecycle
  artifacts move under `{{DESIGN_STORIES_ROOT}}` — `docs/Stories/design/` for a
  Project design, `docs/Stories/product-design/` for a Product design — active
  at `{{DESIGN_STORIES_ROOT}}[{TICKET}] {name}/`, archived to
  `{{DESIGN_STORIES_ROOT}}approved/...` or `{{DESIGN_STORIES_ROOT}}declined/...`
  — separating them from the `dev` skill's `docs/Stories/[{TICKET}] {name}/impl/`,
  which is unaffected. **Breaking for any design mid-flight at the old path** —
  hence the major bump. `dev`'s cross-reference to an approved design's
  `solution/Architecture.md` globs both roots now.
- **Context Gathering and Ceremony split into two stages**, mirroring `dev`'s
  own split: Context Gathering only reads and resolves (ticket, tracker, and
  now also the Product/Project track and its Stories root/architect agent) and
  creates the story folder + `design/Report.md`; Ceremony is the only stage
  that mutates the tracker or checks out a branch. Frame then writes the
  framing content using what Context Gathering resolved. The pipeline is now
  10 stages, not 9.
- **`{{DESIGN_ARCHITECT_AGENT}}`, `{{DESIGN_DOCS_ROOT}}`, and
  `{{DESIGN_STORIES_ROOT}}` are always runtime tokens**, resolved once by
  Context Gathering's Step 3 in every bootstrap deployment mode — Project-scoped,
  Product-context-scoped, and Two-track alike. Only the identification step's
  behavior (ask vs. write a fixed answer with no question) varies by mode now;
  no later stage re-asks, re-derives, or reads a bootstrap-baked literal value.
- **One context-reading pass, recorded for session continuity.** Reading source
  docs is now Context Gathering's job alone (Step 3); it populates
  `design/Report.md`'s `## Evidence` table (Step 4), and every later stage
  reads context from there instead of re-reading source docs — this is also
  how a new session recaps context after picking the ticket back up.
- **New `references/00-decision-router.md`.** Research, Evaluate, and Solution
  each ran their multi-decision loop with inconsistent scoping ("loop this
  phase" vs. "loop this step") and no shared answer for how many stops a
  decision adds. This non-stage file is now the single source of truth: which
  steps loop per decision and which close once (never more than one
  Sign-off → Report → Commit regardless of decision count), plus per-decision
  native task-tracking (one task per decision, children of the stage-level
  task, mirroring `dev`'s Implement-step-children model).
- **`@docs-writer` writes every document**, including Frame's new multi-decision
  write — the orchestrator no longer edits doc content directly anywhere in
  the lifecycle.
- **Review Gate ends at parking the MR; confirming the outcome moved to
  Address Feedback.** Review Gate's old Step 4 ("has it been approved?") was
  judged to be Address Feedback's concern, not Review Gate's — single concern
  per stage. Address Feedback's new Step 1 completes Review Gate's metrics
  itself (`stage complete --stage review-gate`, since Review Gate can't know
  its own completion status until that external fact is known) and branches:
  approved or declined outright skip Address Feedback and route to Publish or
  Completion; concerns start it and continue into the existing reiterate loop.
  Address Feedback still ends every outcome — first-pass or after rework — the
  same way every other stage does: Sign-off → Report → Commit (new Steps 4–5),
  not an inline "tell the developer the next command" per branch.
- **Mechanical stage-complete guard.** `design-metrics.mjs` now refuses
  `stage complete` without a recorded passing "`<Stage> sign-off`" acceptance
  check, for every sign-off-gated stage (frame, research, evaluate, solution,
  publish, completion) — Review Gate and Address Feedback are exempt, since
  their stop is the external MR-approval fact, not a phase sign-off. An old
  seven-stage `stat.json` forward-migrates the new `completion` stage in
  place on load, same mechanism as dev's six-to-seven migration.
- **Explicit `stage start` placement.** Every reference now names exactly
  where in its steps the metrics stage starts, instead of a generic "apply
  the metrics pattern" at the top — closing the same ambiguity that caused
  dev's Context-always-shows-0 bug.

**Review pass** (a full-text consistency check, not covered by the test
suite, since it's prose cross-references rather than code): `patterns/waf-review.md`
previously had its own hardcoded stop-and-wait, contradicting Solution's new
"fold into the one sign-off" instruction when it calls that pattern — the
pattern now takes an explicit override from the caller. `patterns/design-oq-triage.md`
still described the pre-refactor one-OQ-at-a-time interactive loop, contradicting
Research's new propose-and-confirm-at-sign-off model — rewritten to match.
Plus three smaller slips from renumbering during the edit: two stale "Step 4"
cross-references in Research that should have read "Step 5", one stale
"Publish's Step 9" line in `INTENT.md`'s verify checklist that should read
"Completion's Step 4", and Frame's Step 5 prose using "Requirements/Known/Proposed"
vocabulary that didn't match `templates/frame.md`'s actual "Success/Known ECs/Proposed ECs"
headings (pre-existing drift, not introduced by this refactor, but caught in the
same pass) — aligned to the template, which is what actually lands on disk. A
second pass, after the Context Gathering/Ceremony split and the Review
Gate/Address Feedback restructuring landed, found two more: the Lifecycle doc
overstated the dev-mirrored split as "Context Gathering, Ceremony and Frame are
three separate stages" where only Context Gathering/Ceremony mirror `dev` (Frame's
separateness predates and is independent of that split); and the Lifecycle doc's
pattern table referenced a `{{DESIGN_CONTEXT_SOURCES}}` token that was never
implemented — reading source docs in single-track modes was folded into
`{{DESIGN_CONTEXT_STEP}}` instead, with no separate token ever created.

Verified: `design-metrics.test.mjs` 13/13 (3 new, covering the sign-off gate,
a retried stage needing a fresh sign-off, and review-gate/address-feedback's
exemption); `dev`'s `timing.test.mjs` 25/25 unaffected. Nothing is committed
or deployed to the installed `.claude/skills/design` copy — that is this
repo's own `patch prepare` then `patch apply`, which this change does not run.

## 2.4.0

Terminology registry, and quieter metrics CLIs. Driven by two pieces of team feedback:
wording consistency drifting across generated docs, and stats-gathering commands
flooding the console with a full metrics dump on every call.

- **Terminology registry.** New `docs/Engineering Guide/Documentation/07 Terminology.md`
  — an approved-term table (`Term`, `Approved form`, `Forbidden synonyms`, `Definition`,
  `Introduced in`). `01 Principles.md`'s Manner section gains "One term per concept",
  pointing at the registry. `docs-writer` reads it via a new `{{TERMINOLOGY_REGISTRY}}`
  substitution and appends a row whenever it coins a recurring project-specific term —
  unconditionally, on every write, the same way it already applies Doc Principles.
  Launch seeds an initial set from project evidence (code identifiers, README/doc nouns,
  confirmed Q&A) the first time a project launches with an empty registry; an adoption
  of an already-harnessed project with existing rows is left untouched.
- **Quieter metrics CLIs.** `design-metrics.mjs`'s and `timing.mjs`'s `finishCommand()`
  printed the entire `metrics` rollup object as JSON after every single `checkpoint`,
  `stage start`, `wait start`, and `check record` call — nothing in either lifecycle's
  skill references ever read that output. Trimmed to `{command, ticket}`; `stat.json`
  persistence and the computed `metrics` rollup are unaffected.

## 2.3.0

Dev skill 3.1.0: fewer approval gates, a Completion stage, honest timing, ASCII folder names.
Driven by team feedback on 3.0.0 ("too many approval gates", "not clear when it
finished", "Sonar cannot scan folders with emoji and em dash"):

- **One stop per phase.** New `patterns/phase-sign-off.md`: Plan, Implement, Test
  and Document each end with one sign-off that shows what was done, what was verified
  and by whom, what was auto-approved and why, and the suggested commits. Plan's three
  stops (proposal, persisted plan, commit) collapse into one; Implement's two stops
  per step (verify, commit) become an intelligent step checkpoint where the
  orchestrator runs the plan's verification commands itself through the metrics
  wrapper and auto-approves when everything was runnable and passed. The developer is
  asked mid-phase only for a check needing their eyes or access, a guarded command, or
  a divergence from the plan. Context ends with one sign-off on the written intent
  (everything later derives from it); Ceremony's one stop is the developer's branch
  checkout; the tracker transition is an intelligent checkpoint. The Plan architecture
  audit stays but folds into the phase sign-off; mechanical rework is auto-applied and
  recorded. Commits are still the developer's, but a suggested commit never blocks work.
- **Completion is stage 7** (`references/07-completion.md`, `🏁`): closure checks,
  archive, final metrics, archive commit, ready-to-paste PR title and body, one combined
  offer for the tracker transition and tech-debt tickets, and a clear "ticket complete"
  message. `/dev complete {ticket}` runs it alone for stories that reached Document but
  were never archived. Document no longer archives; the tracker transition is an offer,
  not required sync.
- **Timing.** Root cause of Context always showing zero: metrics were initialised at the
  end of the stage, and no reference said where `stage start`, `wait start`, `resume`
  and `stage complete` go. Context now creates the folder, report skeleton and metrics
  right after the tracker fetch (new Step 2b); every reference names its stage start and
  complete; every stop is preceded by `report` + `wait start`, so reply time is wait,
  not work. `timing.mjs` adds the `completion` stage and forward-migrates a six-stage
  `stat.json` by appending it as pending on the next mutation; nothing recorded changes.
- **Folder names are ASCII only.** Archive destination is `docs/Stories/archive/[TICKET] name`,
  same as the design skill; done status lives in the report's Status row. No emoji or
  em dash in any folder name.
- **Intent → plan → report, separated.** `0-intent.md` now follows an interface
  (`dev/interfaces/intent.md`: the questions it must answer, in the originator's
  words, shape free, after the playbook's capture-intent idea); `templates/intent.md`
  is removed. `templates/plan.md` stays strict, drops the duplicated Problem/Scope,
  links the intent, and gains a `## Solution` section with a target-state Mermaid
  diagram when wiring matters. Plan Step 2 and Context Step 5 updated accordingly.
- **One entry check.** The router's idempotency check, the per-stage Step 0 checks
  (Context, Plan) and the session-continuity banner overlapped. Now the router decides
  fresh vs. resume once, for every entry, with one question (**resume** / **restart**);
  Step 0 is gone from the references, and `session-continuity.md` only covers losing
  context mid-stage: re-read the reference, `recover`, don't redo finished work.
- **Tests first, by default.** Plan Step 1 writes the tests when the project has a
  test setup for the touched layers (one case per testable AC, existing framework);
  skipping it needs a stated reason. Step 1 closes on "suite runs, new cases red as
  expected" recorded as a self-sourced acceptance check; later steps go green. Restores
  the pre-2.1.0 default as a soft rule rather than a mandate.
- **Every phase closes the same way:** Sign-off (rework if any) → Report → Commit.
  The commit is proposed, the developer runs it, the stage checks Git and only then
  completes, so the next phase always starts on a clean worktree. Implement no longer
  suggests a commit per step mid-loop; it proposes them once, by step or logical
  block. Context's commit covers the new story folder; Ceremony folds its report rows
  into it.
- **Gates that cannot be skipped quietly.** Every phase sign-off step carries its own
  stop line instead of relying on the pattern being loaded, Ceremony records its
  sign-off like every other stage, Completion asks before it finalises, and
  `timing.mjs` now refuses `stage complete` unless a passed `<Stage> sign-off`
  acceptance check exists in the current attempt. Skipping a sign-off now fails the
  metrics, not just the etiquette.
- **Document stage does placement, not prose.** It reads the structure article, audits
  HLD deviations, builds one doc-impact list (doc/section, tier, new/updated/retired,
  why) into a new `## Documentation` table in the report, delegates all writing to
  `@docs-writer` in one call, runs the consistency review and closes the ledgers. The
  doc principles are the writer's concern and no longer restated in the stage.
- **Doc manner.** `Documentation/01 Principles.md` gains a Manner section: technical,
  simple words, certain, lead each doc and section with its core principle, concrete
  over abstract, no filler; plus a Manner row in the acceptance checks.
- Plain wording across the touched references and patterns.

## 2.2.0

Provider tracking for every operation that touches permanent files. A project can have
Claude and Codex installed side by side, and the local records could not say which
provider an `apply` or `harvest` had actually covered:

- Record a resolved `providers` scope on each operation: deployment targets for `apply`,
  the observed provider for `harvest`, the selected providers for `launch`, and `[]` for
  `prepare`, which never leaves canonical. Resolve it from the manifest and what is
  actually installed — never from the execution host or one provider's presence.
- Give `project-patch/APPLIED.md` a Providers column, name a `provider` on every mapped
  per-file result, and make each `state/index.json` mapping entry one provider's output
  with its own baselines, so one provider's state is never read as the other's.
- Require per-provider deployment, verification and completion: a run that finished one
  provider and not another is `partial`, not `applied`, and applying the same bundle to a
  second provider later is a new operation record and a new `APPLIED.md` row.
- Keep canonical writes and portable bundles provider-neutral — scope lives in local
  state, not in payloads — and treat a record with no `providers` as unknown scope to
  re-resolve rather than assuming full coverage.

## 2.1.2

Fix surfaced by the Codex greenfield e2e case after 2.1.1:

- Declare the partial-checkpoint check `status` field a closed set of
  `passed`/`pending`/`blocked`, and name the qualified variants that are rejected.
  A run recorded `independent_review` as `passed_with_scope_limit` with real
  evidence; the gate was genuinely satisfied but the grader rejected the coined
  status, failing an otherwise complete launch on vocabulary alone.
- State the rules the graders already enforced but the reference only implied:
  `checks.local` must be `passed` with evidence, both external gates need a status
  _and_ non-empty evidence, and at least one must remain `pending`/`blocked` —
  an operation where both passed is a finished launch, not a checkpoint.
- Direct reviewer nuance into `evidence` rather than the status, with a worked
  example, and add a tie-breaker: when it is unclear whether a caveated approval
  counts as acceptance, record `blocked` so the launch stays honestly in progress
  instead of closing on a qualified GO.

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
