# Plan stage

Apply `.claude/skills/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage plan`.

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage is
dedicated to planning only — reading `0-intent.md` and the codebase, then writing and
approving `1-plan.md`. It does not gather context or run tracker/branch ceremony;
those already happened in Context Gathering and Ceremony.

Apply `patterns/approval-sign-off.md`: follow dependencies, continue routine authorized work,
and pause only for a concrete unresolved decision, required human verification, or a
fixed sign-off gate (`patterns/approval-sign-off.md`).

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 0 — Idempotency check (direct stage invocation)

This check fires when the Plan stage is entered directly (`/dev plan {TICKET}`) —
the router's own resume check already handled the bare `/dev {TICKET}` case before
delegating here, so this only guards a deliberate re-plan request.

- Glob for `docs/Stories/*{TICKET}*/impl/1-plan.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`)
- If the file exists, read it and the `Phase` row of `2-report.md`

If stale state is found, present:

> "I found an existing plan for `{TICKET}`:
>
> - Plan: `docs/Stories/{folder}/impl/1-plan.md`
> - Report current phase: `{phase-row}`
>
> Start fresh (overwrite) or stop here and use `/dev implement {TICKET}` to resume? (**overwrite** / **stop**)"

**Stop and wait.**

- If **stop** — report the folder path and exit. Do not continue.
- If **overwrite** — continue normally from Step 1 below.

If no stale state is found — continue normally from Step 1.

## Step 1 — Read intent and codebase

Read `impl/0-intent.md` in full — it is the confirmed proto-spec from Context
Gathering. If it references an approved `solution/Architecture.md`, read the story's `design/Report.md`
and the paths listed in its `selected_artifacts` state — they remain the primary
spec; 0-intent.md and tracker ACs supplement, they do not override the solution.

Then read any context files or docs `0-intent.md` references, and any relevant
existing code in the affected layers. Do not guess — read the actual files before
proposing anything.

**Always read architecture docs before proposing any plan:**

- Read `docs/Target Architecture (HLD)/README.md` to find the active version and the container index
- Glob for `docs/Target Architecture (HLD)/*/` to find the version folder; read the container and NFR docs inside it
- Read `docs/System Architecture (LLD)/README.md` to understand which LLD docs exist, then read the ones relevant to the layers touched by the plan

Key things to check:

- What already exists that can be reused?
- What constraints come from the Target Architecture (container ownership, data flow direction, NFRs)?
- Are there relevant skills to follow (Swagger, environment, dependencies)?
- Which HLD containers and LLD sections are in scope for this ticket?

Summarize relevant constraints and continue. Ask only about material missing context.

## Step 2 — Plan content rules

Every plan is broken into **numbered steps**. Each step must cover one logical layer or concern (e.g. data, backend, frontend are always separate steps). Each step must include:

1. **What changes** — files created or modified, with brief rationale
2. **Verification instructions** — exact commands or UI actions that establish the step worked. Be specific:
   - CLI commands with expected output snippets
   - Which endpoint to curl and what to look for in the response
   - Which page to open and what to visually confirm

Every step ends with evidence-based verification. Run available authorized checks; ask the developer only for checks requiring their access or judgment. Dependencies require passing verification, not a routine confirmation.

The plan also needs an **`## Acceptance Criteria`** section — a flat checklist of checkable assertions derived from:

- Tracker acceptance criteria (fetched during Context Gathering)
- Developer-stated goals and "out of scope" boundaries
- Any observable end states implied by the steps (e.g. endpoint returns 200, UI shows X, migration runs without error)

Each item must be independently verifiable by the evaluator during the Test stage (curl, UI action, log output, or build result). No vague items like "works correctly". Write: `[ ] {AC-N} — <what to check and where>`.

**Tests when applicable.** Decide whether new or updated tests add useful evidence
for this change. Choose their type from the work's risks and the project's existing
setup: unit, integration, end-to-end, contract, load/performance, infrastructure checks,
or another relevant form. Do not force unit tests, TDD, a new framework, or a separate
"write tests" Step 1. State the chosen strategy and why it fits; when no new tests make
sense, record the reason and the verification used instead. Existing relevant checks
still apply. Do not run load/live tests merely because tools exist; respect their target,
cost and authorization boundaries.

When test-first work is useful, observe the intended red state, implement, then verify
green within the same logical step. Preserve both outcomes; mark the step complete
only after its latest required checks pass. Avoid a standalone red-only step that cannot
satisfy the metrics completion gate.

Other rules:

- Never bundle verification into the next step — it belongs at the end of the current one
- If a step depends on a previous step, say so explicitly
- **One step = one {{BUILD_UNIT_LABEL}} or one cross-cutting concern.** Never mix layers in a single step (e.g. Terraform infra changes alongside `app-db` script changes). If the step title can't map cleanly to one {{BUILD_UNIT_LABEL}} name or one concern, split it. A commit message that would require two types to be honest is a reliable signal the step is too broad.
- **Within that {{BUILD_UNIT_LABEL}}/concern, split further along testable units when more than one exists.** A step that bundles data/schema definition, core logic, and wiring/integration into one verification block is still too broad even though it maps to a single {{BUILD_UNIT_LABEL}} — favor several small steps, each independently verifiable (e.g. define the resource/type first, implement the behavior next, wire it into the caller last), over one step that only gets checked as a whole. A single genuinely atomic unit (e.g. provisioning one resource with no independent sub-behavior) stays one step — this is a decomposition floor, not a mandate to always split.
- **Infra/config steps require at least one live operational verification item.** Static checks (grep, file inspection) are necessary but not sufficient. For any step that touches infrastructure or configuration, at least one verification item must prove the thing actually works — e.g. `terraform init` connects to the correct backend, `terraform plan` output matches expectations, CLI confirms an access policy exists, a health check or curl returns the expected response. Do not write a verification block that is grep-only for an infra step.
- Inspect actual hooks and project targets. Do not assume Husky, lint or tests exist. Run relevant available checks; avoid repeating an unchanged successful check without a new reason.
- **For plans that change how resources are connected — network topology, VNet subnets, service-to-service routing, container boundaries — add a Mermaid diagram of the target state at the top of the plan, above the numbered steps.** A single picture lets the reviewer validate the target state before reading the step details, and becomes the reference during implementation. Also applies to any plan where "what gets wired to what" is non-obvious from the step list alone.

## Step 3 — Design and approve the plan in native Plan Mode

Call `EnterPlanMode`. Design decisions, exploration, and the developer-facing
proposal all happen inside Plan Mode rather than through a manual write/confirm
loop — Plan Mode's own explore → design → present → approve cycle replaces that here.
This is a sign-off gate (`patterns/approval-sign-off.md`) and is never skipped or downgraded
to a local draft, regardless of routine-work authorization elsewhere in the
lifecycle — the plan itself always requires the developer's explicit sign-off before
Implement.

While in Plan Mode, the only file you may write is the plan file the system assigns
(e.g. `~/.claude/plans/<slug>.md`) — every other write, including to the story
folder, is blocked until Plan Mode is exited. Write the plan there using
`templates/plan.md`'s structure and the content rules in Step 2. Use
`AskUserQuestion` for any approach choice that needs developer input before the plan
is complete.

Call `ExitPlanMode` when the plan is ready. If the developer raises concerns, revise
and call it again within the same Plan Mode session — do not exit and re-enter for
each revision.

**Once signed off** (Plan Mode has exited and normal write access is back): write the
identical, approved content to `docs/Stories/[{TICKET}] {name}/impl/1-plan.md` — the
folder and `2-report.md` already exist from Context Gathering. This is the
authoritative project-relative copy that later stages read — the system's own plan
file is session-scoped and not visible to `references/04-implement.md` or later.
**Do not write any code.**

## Step 4 — Architecture audit _(optional — non-trivial plans only)_

**Skip this step** for mechanical plans (single-layer rename, dependency bump, config value with no structural impact). Run it when the plan:

- Introduces a new cross-layer integration, API contract, or module boundary
- Adds or changes infrastructure, IAM policy, or cloud resources
- Changes data flow between containers
- Has steps that touch more than one {{BUILD_UNIT_LABEL}} in a non-obvious way

When triggered, delegate to `@architect` following the satellite review protocol (`.claude/skills/dev/patterns/satellite-review.md`). Prompt:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Review the following implementation plan against HLD container boundaries, data-flow direction, and NFRs. Check each step for: container boundary violations, wrong data-flow direction, NFR breaches, layer principle violations. Verdict: **go** or **reiterate** — one finding per line. Do not write or edit any files — return output only."

- **go** → proceed silently to Step 5
- **reiterate** → present findings to the developer and ask:
  1. **Rework** — revise the affected step(s); if the plan file needs structural changes, re-enter Plan Mode for the revision (its own approve cycle covers the sign-off). Otherwise, edit `1-plan.md` directly. This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval conditions: the rework is a mechanical, single-purpose fix, and it changes no scope, acceptance criteria, or approach. All conditions met → auto-approve: record the finding, the fix, and "no scope/approach change" in the Step 4 record, then re-run the audit. Any condition fails or is uncertain (the change alters what a step does, adds/removes a step, or resolves the finding differently than intended) → this is a sign-off gate (`patterns/approval-sign-off.md`): present the exact diff of what changed and why (referencing the RF finding) and **stop and wait for the developer's sign-off** before re-running this audit. A `go` verdict from a re-audit does not substitute for either path — the developer (or the stated auto-approve conditions) signs off on the content, `@architect` only checks it against HLD.
  2. **Justify** — record as an approved deviation (see below)

Maximum 3 iterations. If still unresolved, present the stalemate to the developer and stop.

Record audit findings in `2-report.md` using `patterns/review-gate.md`, including
approved exceptions as `deviation` rows with HLD references and attributed decisions.
The plan may reference RF IDs and the approved constraints; do not create a second
live deviations table. Planned exceptions remain open until their required resolution
is verified in Document, unless explicitly accepted as a lasting exception.

## Step 5 — Final sign-off on the persisted plan

This is a **second, distinct sign-off gate** (`patterns/approval-sign-off.md`) — separate
from Step 3's Plan Mode approval and from any Step 4 rework sign-off. Step 3 approves
the _drafted_ content inside Plan Mode; a Step 4 rework sign-off (if it happened)
only covers one diff against one finding. Neither is a look at the complete plan as
it actually landed on disk, especially after rework — so once `impl/1-plan.md` is
written (Step 3's initial write, plus any Step 4 revisions), apply
`patterns/write-confirm.md` to it: present the persisted file — in full if reasonably
short, or a summary (step list, step count, Acceptance Criteria, and every Step 4
rework/deviation entry called out explicitly) for a long plan — and ask:

> "Plan finalized at `impl/1-plan.md` — {N} steps, {M} deviations recorded. Ready to
> start Implement, or does anything need another look now that it's all in one place?"

**Stop and wait for the developer's sign-off.** If they ask for changes, they are
changes to an unapproved plan — treat them like any other Step 3/4 revision (edit,
then re-present here) rather than writing them silently. `impl/1-plan.md` is
immutable only once this sign-off is given.

## Step 6 — Advance phase and report back

Only after Step 5's sign-off, update the already-existing `2-report.md` (created in
Context Gathering):

- `Phase` row → `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳`
- Progress table — one row per plan step, all set to `⏳ Pending`, Notes/Test/Docs empty

Committing the plan is a manual operation, same as Ceremony's branch checkout and
Implement's per-step commits: never run `git add`/`git commit` yourself. This is a
sign-off gate (`patterns/approval-sign-off.md`) — tell the developer the folder path and
propose the exact command:

> "Plan saved to `docs/Stories/[{TICKET}] {name}/impl/1-plan.md`.
>
> Commit with:
>
> ```
> docs({ticket-lowercase}): add implementation plan for {short-name}
> ```
>
> Let me know once it's committed and I'll start Implement."

**Stop and wait for the developer's sign-off** that they've committed it. Do not
advance to Implement until they confirm.

🔁 Once confirmed, re-read `.claude/skills/dev/SKILL.md` and resume the router from
the next stage (Implement).
