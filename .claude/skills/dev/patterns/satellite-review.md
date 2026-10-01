# Worker + Satellite Review Pattern

After completing any non-trivial implementation step, the worker agent itself invokes `@architect` as a satellite reviewer before presenting verification to the developer.

Apply `.claude/skills/dev/runtime/delegation.md`. If nested delegation is unavailable,
the orchestrator dispatches the independent reviewer after the worker returns.

## When to trigger

Trigger a satellite review after any step that:

- Adds or changes infrastructure definitions, IAM policy, or cloud resources
- Introduces a new API endpoint, module, or cross-layer integration
- Changes data flow between containers
- Involves a workaround or non-obvious implementation decision

Skip for mechanical steps: rename, dependency bump, config value with no structural impact.

## Review protocol

1. Worker completes the step
2. Worker invokes `@architect` with:
   > "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Review the implementation of Step N from plan `<1-plan.md path>`. Check: HLD container boundaries and data-flow direction, layer best practices (infrastructure: naming/security rules/IAM least-privilege; backend: p95/N+1; frontend: accessibility), NFRs located through the active architecture documentation index. Do not write or edit files; return findings only. Verdict: **go** or **reiterate** — one finding per line."
3. If **go**: worker hands off to the orchestrator (never directly to the developer)
   — see Handoff below.
4. If **reiterate**: return findings to the orchestrator for `patterns/review-gate.md` recording before fixes. The orchestrator owns the report, delegates in-scope fixes, and requests only unresolved human decisions. Repeat relevant review after fixes.
5. **Maximum 3 iterations.** If still unresolved after 3, worker escalates to the orchestrator with a summary of the stalemate, for the orchestrator to present to the developer.

## Handoff — report to the orchestrator

A satellite `go`, and the worker's own account of what it did, are both inputs to
the orchestrator's step checkpoint (`references/04-implement.md` Step 3). Neither
replaces it.

1. Worker hands the orchestrator a structured summary: what changed (files
   touched, brief rationale), what the worker itself verified and the real result,
   and the satellite's verdict. This is a report, not a completed step. The
   orchestrator checks the change actually landed (`git status`/`git diff`, real
   command output) rather than trusting the self-report.
2. The orchestrator then runs the step checkpoint itself: run the plan's
   verification items, auto-approve when they qualify, or stop and ask the
   developer when they don't. A worker never talks to the developer directly.

## Why

Without a review loop, best-practice violations (hardcoded names, wrong security rules, removal policies, layer boundary breaches) surface only at PR review time — after deployment, requiring a dedicated refactor step. Without an explicit handoff step, a satellite `go` or a worker's own report can get silently treated as done, skipping the orchestrator's own check of what actually landed.
