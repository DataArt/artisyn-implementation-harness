# Test stage

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage runs
the test suite and PR review for an implemented plan.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 1 — Find the implementation folder

The argument is a ticket number (e.g. `{{PROJECT_KEY}}-042`) or a direct folder path.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- Read `1-plan.md` to understand what was built and which layers were touched
- Read `2-report.md` to understand what was already noted during implementation
- If not found: tell the developer and stop

## Step 2 — Advance phase to Test

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test 🔄 · 📝 Document ⏳
```

## Step 3 — Build check

Before the PR review, verify the monorepo builds cleanly:

> "Please run:
>
> ```bash
> {{NX_BUILD_CMD}}
> ```
>
> Let me know the result."

**Stop and wait.** If the build fails, diagnose the failure (type error, missing import, misconfigured target) and present a fix before proceeding. Do not run the PR review or tests against a broken build.

## Step 4 — DB migration check _(skip if no DB changes in this plan)_

If `1-plan.md` includes any DB layer steps (new migrations, schema changes, seed changes), prompt the developer:

> "This plan includes DB changes. Do you want to run migrations against the dev environment now? (**yes** / **skip**)"

**Stop and wait for confirmation.** If confirmed, ask the developer to run:

> ```bash
> {{NX_DB_MIGRATE_CMD}}
> ```

Report the result. If it fails, treat it as a blocker — diagnose before continuing.

## Step 5 — PR Review

Run the PR review **before** the test suite so that must-fix changes are included in the validation run.

**Layer delegation** — for each layer touched by the plan:

- {{BACKEND_LAYER_KEYWORDS}} changes → delegate to `{{BACKEND_AGENT}}` for a focused layer review
- {{FRONTEND_LAYER_KEYWORDS}} changes → delegate to `{{FRONTEND_AGENT}}` for a focused layer review
- Infra / config / docs changes → review inline

**@architect audit** — spawn `@architect` before writing the PR Review table when any of the following apply:

- The plan touches infrastructure stacks
- The plan introduces a new cross-layer integration (e.g. new backend endpoint consumed by frontend, new auth flow, new queue/event contract)
- The plan contains non-trivial flows that span more than one container

Prompt template:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Audit the following implementation against HLD container boundaries, data-flow direction, and NFRs (read `docs/Target Architecture (HLD)/README.md` to find the active version, then read `docs/Target Architecture (HLD)/{active-version}/Non-Functional Concerns/Requirements.md`). Also check layer-specific best practices (infrastructure: naming, removal policies, security rules, IAM least-privilege; backend: N+1 queries, p95 < 200ms patterns; frontend: accessibility). Files to review: `<list from plan>`. One finding per line with BUG/DESIGN/IMPROVE code." **Do not write or edit any files — return output only.**

Classify each finding using triage discipline before adding it to the PR Review table. Skip for purely mechanical or single-layer changes with no cross-cutting impact.

**Architecture note** — if anything structural changed (new module, new layer pattern, new cross-layer interaction), create `{story-folder}/impl/architecture-notes.md` with a brief description and a Mermaid diagram. Skip this file if nothing structural changed.

**Apply the review gate pattern** (`.claude/skills/dev/patterns/review-gate.md`) with section name `## PR Review`.

The findings table format for `## PR Review`:

```markdown
## PR Review

_Date: {date}_

| Code        | Finding       | File            | Severity | Resolution   |
| ----------- | ------------- | --------------- | -------- | ------------ |
| BUG-001     | <short title> | `{path}:{line}` | Must fix | {fix}        |
| DESIGN-001  | <short title> | `{path}:{line}` | Advisory | {suggestion} |
| IMPROVE-001 | <short title> | `{path}:{line}` | Optional | {suggestion} |

**Verdict:** <LGTM / Needs changes — one sentence>
```

Finding codes: `BUG` (incorrect behaviour), `SEC` (security), `PERF` (performance), `DESIGN` (architecture deviation), `IMPROVE` (optional improvement). If there are no findings, write `No findings — LGTM.`

After appending the table, check the findings for patterns worth encoding as skills:

- If there are any `BUG`, `SEC`, or `DESIGN` findings that represent a **repeatable mistake** (not a one-off typo) — something that a skill or rule could prevent in future — say:

  > "This review found `{X}` pattern findings that look like a repeatable convention gap. Consider running `/skill-reflect` with a short description so it can be encoded as a skill."

  Name the specific patterns briefly. Do not prompt this if all findings are `IMPROVE`-only or `No findings`.

## Step 6 — Commit PR review fixes

Follow Stage 2 of the review gate pattern (`.claude/skills/dev/patterns/review-gate.md`) — per-fix loop until all confirmed fixes are committed. Only proceed to Step 7 once all fixes are committed and verified.

## Step 7 — Run the checks that match what changed

Pick the verification gate from what the plan actually touched — blindly running all NX checks on, say, an infra ticket wastes time and gives false confidence (a clean typecheck says nothing about whether resources were tagged correctly).

**For infra-only tickets** (Terraform / config; no TypeScript app code changed) — the primary gate is Terraform, not NX:

> "Please run:
>
> ```bash
> {{INFRA_SYNTH_CMD}}
> {{INFRA_DIFF_CMD}}
> ```
>
> Share the output. Optionally apply in a safe context once the diff looks correct."

Run `typecheck`/`lint`/`test` only for the subset of NX projects that actually changed.

**For app-code tickets** — ask the developer to run the full suite:

> "Please run:
>
> ```bash
> yarn nx run-many -t typecheck --all
> yarn nx run-many -t test --all
> yarn nx run-many -t lint --all
> ```
>
> Share the output and I'll triage any failures."

**Stop and wait.** Report results project by project as they are shared.

## Step 8 — Failure triage

For any project that fails, do not just record `❌` — diagnose:

- **Type error** — identify the file and line; suggest the fix or flag as a blocker
- **Failing assertion** — identify the test and what changed; determine if it's a stale test or a real regression
- **Lint error** — identify the rule and file; most are auto-fixable with `yarn nx run {project}:lint --fix`
- **Missing env / config** — identify the missing variable or misconfiguration

Present a concise diagnosis per failure and ask the developer how to proceed before updating the report.

## Step 9 — Acceptance criteria validation

Read the `## Acceptance Criteria` checklist from `1-plan.md`. For each item, determine whether it passed or failed based on:

- The test/build output from Step 7
- Any explicit verification instructions in the plan steps
- Ask the developer to perform any manual checks that cannot be inferred from output alone

Present the result:

> "**Acceptance Criteria:**
>
> - [x/☐] `{AC-1}` — `<pass reason or fail reason>`
> - [x/☐] `{AC-2}` — `<pass reason or fail reason>`
>
> Are there any AC items you'd like to verify manually before I continue?"

**Stop and wait.** Do not proceed to Step 9b if any AC item is unresolved. If `1-plan.md` has no `## Acceptance Criteria` section, skip this step silently.

## Step 9b — Collaborative test review

After AC validation, review what was implemented in `1-plan.md` and suggest any additional manual or integration tests the developer should consider — things the automated suite doesn't cover. Then ask:

> "Based on what was implemented, you may also want to verify:
>
> - `<suggestion 1>` — `<why it matters>`
> - `<suggestion 2>` — `<why it matters>`
>
> Anything else you'd like to test or check before moving to documentation?"

**Stop and wait.** If the developer wants to run additional checks, do so before updating the report. Only proceed once they confirm testing is complete.

## Step 10 — Update `2-report.md`

For each step row in the `## Progress` table, fill in the **Test** column:

- `✅` — tests, typecheck, and lint all passed for projects touched by this step
- `❌` — one or more checks failed (add a brief note in the Notes column)
- `—` — not applicable (e.g. infra-only step with no runnable tests)

Then append a `## Test Results` section to `2-report.md`:

```markdown
## Test Results

_Date: {date}_

| Project     | Build   | Tests   | Typecheck | Lint    |
| ----------- | ------- | ------- | --------- | ------- |
| `{project}` | ✅ / ❌ | ✅ / ❌ | ✅ / ❌   | ✅ / ❌ |

### Notes

<failures diagnosed, migrations run, anything skipped and why>
```

## Step 11 — Report back

Tell the developer:

- Overall pass/fail summary
- Any failures diagnosed and their suggested resolution
- Whether migration was run and what the outcome was
- PR review verdict and any must-fix items

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Document).
