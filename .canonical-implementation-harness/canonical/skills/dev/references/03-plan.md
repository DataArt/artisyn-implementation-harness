# Plan stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage plan`. First action: `stage start --stage plan`.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This stage
is planning only: read `0-intent.md` and the codebase, write `1-plan.md`, get it
signed off. Context and Ceremony already happened.

Two stops in this stage: the sign-off in Step 5 (`patterns/phase-sign-off.md`) and the
commit in Step 7. Report sits between them.
Everything before it is routine work.

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Intent first

The plan is derived from the intent, never written beside it. So the intent comes
first, always:

- Read `impl/0-intent.md` in full. It says what and for whom; the plan says how.
- **If `0-intent.md` is missing** (an old story, or a direct `{{provider:invoke:dev}} plan`
  call that skipped Context), do not plan yet. Write the intent first, following
  Context Gathering Steps 2–5, from the tracker, any approved design and what the
  developer said. Only then continue here.
- If it is thin (a one-line problem, no outcome, no boundaries), say so, fill the
  gaps from the sources, and append what you found to the intent before planning.
  Ask the developer only for what no source can answer.

Keep the intent open while drafting. Every part of the plan should point back to
it: the Solution answers "what does better look like", each acceptance criterion
checks an outcome or a boundary, each step serves the solution. A step that serves
nothing in the intent is scope creep; an intent need that no step serves is a gap.
Both are called out in the sign-off, not quietly resolved.

If the intent references an approved `solution/Architecture.md`, read the story's
`design/Report.md` and the paths in its `selected_artifacts`. They are the primary
spec; the intent and tracker ACs supplement, they do not override the solution.

Then read any context files or docs the intent references, and the relevant
existing code in the affected layers. Do not guess; read the actual files before
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

Use `templates/plan.md` as is; its structure is strict. Three parts, in order:
`## Solution`, `## Acceptance Criteria` (and optional `## Dependencies`), `## Steps`.

**Solution.** One short paragraph: the approach, why it fits the intent and the
architecture, which HLD container(s) it touches, what is reused. Add a Mermaid
diagram of the **target state** when the plan changes how things are wired together
(network topology, service-to-service routing, container boundaries, data flow) or
when "what talks to what" is not obvious from the steps. One picture lets the
reviewer check the target before reading the steps, and is the reference during
implementation. Drop the diagram block when it adds nothing. Planning decisions go
here as one-liners; approved HLD deviations are RF rows in `2-report.md`, referenced
by ID.

**Steps.** Every plan is broken into **numbered steps**. Each step must cover one logical layer or concern (e.g. data, backend, frontend are always separate steps). Each step must include:

1. **What changes** — files created or modified, with brief rationale
2. **Verification instructions** — exact commands or UI actions that establish the step worked. Be specific:
   - CLI commands with expected output snippets
   - Which endpoint to curl and what to look for in the response
   - Which page to open and what to visually confirm

Every step ends with evidence-based verification. Run available authorized checks; ask the developer only for checks requiring their access or judgment. Dependencies require passing verification, not a routine confirmation.

**Acceptance Criteria.** A flat checklist of checkable assertions derived from:

- The intent's outcome and out-of-scope boundaries
- Tracker acceptance criteria (fetched during Context Gathering)
- Any observable end states implied by the steps (e.g. endpoint returns 200, UI shows X, migration runs without error)

Each item must be independently verifiable by the evaluator during the Test stage (curl, UI action, log output, or build result). No vague items like "works correctly". Write: `[ ] {AC-N} — <what to check and where>`.

**Tests first, by default.** When the project has a test setup for the layers this
plan touches, Step 1 writes the tests: one case per acceptance criterion that a test
can express, in the project's existing framework and conventions. Pick the type from
the work and the setup (unit, integration, end-to-end, contract, infra checks); do not
add a framework. Step 1's verification is that the suite runs and the new cases are
red for the expected reason; record that as a passed acceptance check (`--source self`,
evidence: which cases, why red). Later steps turn them green and rerun the same suite
as their own verification.

Skipping Step 1 needs a stated reason in the plan, for example: no test setup for
this layer, a pure config or infra change better proven by a live check, or the
change is a one-line fix already covered by an existing case. "Faster without" is
not a reason. Existing relevant checks still apply either way. Do not run load or
live tests merely because tools exist; respect their target, cost and authorisation
boundaries.

Other rules:

- Never bundle verification into the next step — it belongs at the end of the current one
- If a step depends on a previous step, say so explicitly
- **One step = one {{BUILD_UNIT_LABEL}} or one cross-cutting concern.** Never mix layers in a single step (e.g. Terraform infra changes alongside `app-db` script changes). If the step title can't map cleanly to one {{BUILD_UNIT_LABEL}} name or one concern, split it. A commit message that would require two types to be honest is a reliable signal the step is too broad.
- **Within that {{BUILD_UNIT_LABEL}}/concern, split further along testable units when more than one exists.** A step that bundles data/schema definition, core logic, and wiring/integration into one verification block is still too broad even though it maps to a single {{BUILD_UNIT_LABEL}} — favor several small steps, each independently verifiable (e.g. define the resource/type first, implement the behavior next, wire it into the caller last), over one step that only gets checked as a whole. A single genuinely atomic unit (e.g. provisioning one resource with no independent sub-behavior) stays one step — this is a decomposition floor, not a mandate to always split.
- **Infra/config steps require at least one live operational verification item.** Static checks (grep, file inspection) are necessary but not sufficient. For any step that touches infrastructure or configuration, at least one verification item must prove the thing actually works — e.g. `terraform init` connects to the correct backend, `terraform plan` output matches expectations, CLI confirms an access policy exists, a health check or curl returns the expected response. Do not write a verification block that is grep-only for an infra step.
- Inspect actual hooks and project targets. Do not assume Husky, lint or tests exist. Run relevant available checks; avoid repeating an unchanged successful check without a new reason.

## Step 3 — Draft and write the plan

Apply `{{provider:skills_root}}/dev/runtime/planning.md`. Draft in this order,
each part from the intent:

1. `## Solution` — the answer to the intent's "what does better look like", within
   its constraints and the architecture read in Step 1. Diagram if wiring changes.
2. `## Acceptance Criteria` — one per outcome and per out-of-scope boundary in the
   intent, plus the tracker's own ACs. Each traceable to a line in the intent.
3. `## Steps` — the smallest set that delivers the Solution, per Step 2's rules.

Then check the plan against the intent once more: anything in the plan with no
reason in the intent, anything in the intent with no step or AC. List both for the
sign-off. Use `templates/plan.md` and Step 2's content rules. Resolve approach choices
through `{{provider:skills_root}}/dev/runtime/interaction.md`: ask only when two
approaches are genuinely both reasonable and the choice changes scope, cost or
architecture. Prepare the options first; combine related choices into one question.

If the host's native planning mode has its own approval step, that step is this
phase's sign-off (Step 5) and nothing else; do not add another stop. If native mode
is unavailable, plan in the normal way; do not claim native enforcement.

When writes are allowed, persist the plan at
`docs/Stories/[{TICKET}] {name}/impl/1-plan.md` (`patterns/write-confirm.md`). The
project copy is authoritative for later stages. **Do not write implementation code.**

## Step 4 — Architecture audit _(non-trivial plans only)_

**Skip** for mechanical plans (single-layer rename, dependency bump, config value
with no structural impact). Run it when the plan:

- Introduces a new cross-layer integration, API contract, or module boundary
- Adds or changes infrastructure, IAM policy, or cloud resources
- Changes data flow between containers
- Has steps that touch more than one {{BUILD_UNIT_LABEL}} in a non-obvious way

Delegate to `@architect` following `{{provider:skills_root}}/dev/patterns/satellite-review.md`:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Review the following implementation plan against HLD container boundaries, data-flow direction, and NFRs. Check each step for: container boundary violations, wrong data-flow direction, NFR breaches, layer principle violations. Verdict: **go** or **reiterate** — one finding per line. Do not write or edit any files — return output only."

- **go** → continue to Step 5
- **reiterate** → record each finding in `2-report.md` (`patterns/review-gate.md`),
  then for each one:
  - If the fix is mechanical and changes no scope, acceptance criteria or approach,
    apply it to `1-plan.md`, note "auto-applied, no scope change" in the RF row, and
    re-run the audit. This is an intelligent-approval checkpoint
    (`patterns/approval-intelligent.md`); the record in the RF row is the audit trail.
  - Otherwise leave it open with the options (rework vs. justify as a deviation) and
    carry it into the Step 5 sign-off. Do not stop separately for it.

Maximum 3 audit rounds. If findings are still open after that, carry them into
Step 5 as decisions for the developer.

Approved exceptions are `deviation` rows with HLD references and attributed
decisions. The plan may reference RF IDs; do not create a second deviations table.
Planned exceptions stay open until their resolution is verified in Document, unless
explicitly accepted as a lasting exception.

## Step 5 — Sign-off (rework if any)

Apply `patterns/phase-sign-off.md`. Nothing is written to `2-report.md`
yet. Show `1-plan.md` in full if short, or a summary for a long one: step list and
count, Acceptance Criteria, every open or auto-applied audit finding called out, any
open approach choice, and the intent check from Step 3 (scope creep or gaps, or
"none").

> "Plan ready at `docs/Stories/[{TICKET}] {name}/impl/1-plan.md` — {N} steps, {M} audit
> findings ({auto-applied / open}). {Open decisions, if any.}
>
> Good to go, or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting plan sign-off"`.
**Stop and wait.** No reply, no next step. On approval, record the acceptance check
(`--name "Plan sign-off"`, `--source developer`, their words as evidence); without
it `stage complete` is refused.

Rework: edit `1-plan.md`, re-run Step 4 if the change is structural, present again.
Once approved, `1-plan.md` is immutable; new scope later is an addendum, never an
edit.

## Step 6 — Report

Update `2-report.md`:

- Progress table → one row per plan step, all `⏳ Pending`, Notes/Test/Docs empty
- `Phase` row → `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳`

Then metrics `report`.

## Step 7 — Commit

Propose:

```
docs({ticket-lowercase}): add implementation plan for {short-name}
```

covering `impl/1-plan.md` and the report update.

This is a manual-operation sign-off (`patterns/approval-sign-off.md`): the developer
runs the commit, you wait. `wait start --reason user_input --detail "Awaiting commit"`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists and the
worktree holds nothing from this phase. If not, say what is missing and wait again.
Then `stage complete --stage plan`. Tell the developer Implement starts with {N} steps and continue.

🔁 Re-read `{{provider:skills_root}}/dev/SKILL.md` and resume the router from the next stage (Implement).
