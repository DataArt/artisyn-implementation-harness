---
name: dev-test
metadata:
  version: 0.3.1
description: Test phase of the dev lifecycle (/dev-test or /dev orchestrator). Runs tests, performs layer-delegated PR review, appends findings to 2-report.md.
---

The developer wants to run the test stage for an implemented plan. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** See `.claude/skills/dev/pattern-session-continuity.md` — re-read this SKILL.md on resume; re-read `dev/SKILL.md` on phase exit.

## Step 1 — Find the implementation folder

The argument is a ticket number (e.g. `ADLC-042`) or a direct folder path.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- Read `1-plan.md` to understand what was built and which layers were touched
- Read `2-report.md` to understand what was already noted during implementation
- If not found: tell the developer and stop

## Step 2 — Advance phase to Test

Update the `Phase` row in `2-report.md`:

```
📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test 🔄 · 📝 Document ⏳
```

## Step 3 — Build check

Before the PR review, verify the monorepo builds cleanly:

> "Please run:
>
> ```bash
> yarn nx run-many -t build -p site lambda-auth
> ```
>
> Let me know the result."

**Stop and wait.** If the build fails, diagnose the failure (type error, missing import, misconfigured target) and present a fix before proceeding. Do not run the PR review or tests against a broken build.

## Step 4 — PR Review

Run the PR review **before** the test suite so that must-fix changes are included in the validation run.

**Layer delegation** — for each layer touched by the plan:

- Auth / Lambda handler changes → delegate to `@auth` for a focused layer review
- Web / VitePress / docs-web changes → delegate to `@web` for a focused layer review
- Infra / CDK / config changes → review inline

**@architect audit** — spawn `@architect` before writing the PR Review table when any of the following apply:

- The plan touches CDK infrastructure stacks
- The plan introduces a new cross-layer integration (e.g. new auth flow, new CloudFront behaviour)
- The plan contains non-trivial flows that span more than one container

Prompt template:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Audit the following implementation against HLD container boundaries, data-flow direction, and NFRs (read the `Non-Functional Concerns/Requirements.md` doc for that version). Also check layer-specific best practices (infrastructure: naming, removal policies, security rules, IAM least-privilege; auth: password handling, timing attacks, header validation). Files to review: `<list from plan>`. One finding per line with BUG/DESIGN/IMPROVE code." **Do not write or edit any files — return output only.**

Classify each finding using triage discipline before adding it to the PR Review table. Skip for purely mechanical or single-layer changes with no cross-cutting impact.

**Architecture note** — if anything structural changed (new module, new layer pattern, new cross-layer interaction), create `{story-folder}/impl/architecture-notes.md` with a brief description and a Mermaid diagram. Skip this file if nothing structural changed.

**Apply the review gate pattern** (`.claude/skills/dev/pattern-review-gate.md`) with section name `## PR Review`.

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

## Step 5 — Commit PR review fixes

Follow Stage 2 of the review gate pattern (`.claude/skills/dev/pattern-review-gate.md`) — per-fix loop until all confirmed fixes are committed. Only proceed to Step 6 once all fixes are committed and verified.

## Step 6 — Run the checks that match what changed

Pick the verification gate from what the plan actually touched — blindly running all NX checks on, say, an infra ticket wastes time and gives false confidence (a clean typecheck says nothing about whether resources were tagged correctly).

**For infra-only tickets** (CDK / config; no TypeScript app code changed) — the primary gate is CDK, not NX:

> "Please run:
>
> ```bash
> yarn nx run infra:synth   # confirm clean synth and expected resource tags/naming
> ```
>
> Share the output. Optionally run `yarn nx run infra:diff` in a safe context."

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

## Step 7 — Failure triage

For any project that fails, do not just record `❌` — diagnose:

- **Type error** — identify the file and line; suggest the fix or flag as a blocker
- **Failing assertion** — identify the test and what changed; determine if it's a stale test or a real regression
- **Lint error** — identify the rule and file; most are auto-fixable with `yarn nx run {project}:lint --fix`
- **Missing env / config** — identify the missing variable or misconfiguration

Present a concise diagnosis per failure and ask the developer how to proceed before updating the report.

## Step 8 — Acceptance criteria validation

Read the `## Acceptance Criteria` checklist from `1-plan.md`. For each item, determine whether it passed or failed based on:

- The test/build output from Step 6
- Any explicit verification instructions in the plan steps
- Ask the developer to perform any manual checks that cannot be inferred from output alone

Present the result:

> "**Acceptance Criteria:**
>
> - [x/☐] `{AC-1}` — `<pass reason or fail reason>`
> - [x/☐] `{AC-2}` — `<pass reason or fail reason>`
>
> Are there any AC items you'd like to verify manually before I continue?"

**Stop and wait.** Do not proceed to Step 8b if any AC item is unresolved. If `1-plan.md` has no `## Acceptance Criteria` section, skip this step silently.

## Step 8b — Collaborative test review

After AC validation, review what was implemented in `1-plan.md` and suggest any additional manual or integration tests the developer should consider — things the automated suite doesn't cover. Then ask:

> "Based on what was implemented, you may also want to verify:
>
> - `<suggestion 1>` — `<why it matters>`
> - `<suggestion 2>` — `<why it matters>`
>
> Anything else you'd like to test or check before moving to documentation?"

**Stop and wait.** If the developer wants to run additional checks, do so before updating the report. Only proceed once they confirm testing is complete.

## Step 9 — Update `2-report.md`

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

<failures diagnosed, anything skipped and why>
```

## Step 10 — Report back

Tell the developer:

- Overall pass/fail summary
- Any failures diagnosed and their suggested resolution
- PR review verdict and any must-fix items

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the orchestrator from the next phase (Document).
