# Worker + Satellite Review Pattern

After completing any non-trivial implementation step, the worker agent itself invokes `@architect` as a satellite reviewer before presenting verification to the developer.

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
   > "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Review the implementation of Step N from plan `<1-plan.md path>`. Check: HLD container boundaries and data-flow direction, layer best practices (infrastructure: naming/security rules/IAM least-privilege; backend: p95/N+1; frontend: accessibility), NFRs from `docs/Target Architecture (HLD)/<active version>/02. Non-Functional Concerns/00. Requirements.md`. Verdict: **go** or **reiterate** — one finding per line."
3. If **go**: worker presents verification to the developer
4. If **reiterate**: worker addresses findings, loop repeats
5. **Maximum 3 iterations.** If still unresolved after 3, worker escalates to the developer with a summary of the stalemate

## Why

Without a review loop, best-practice violations (hardcoded names, wrong security rules, removal policies, layer boundary breaches) surface only at PR review time — after deployment, requiring a dedicated refactor step.
