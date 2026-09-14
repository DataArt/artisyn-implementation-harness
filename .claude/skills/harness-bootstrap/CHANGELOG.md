# Changelog

All notable changes to the `harness-bootstrap` package. See `references/00-overview.md` for the full package description and versioning rules (patch/minor/major, same as `skill-authoring.md`'s "Bootstrap template versioning").

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
