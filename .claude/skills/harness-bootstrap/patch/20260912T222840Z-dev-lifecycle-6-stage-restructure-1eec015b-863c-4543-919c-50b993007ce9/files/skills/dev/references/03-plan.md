# Plan stage

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage is
dedicated to planning only — reading `intent.md` and the codebase, then writing and
approving `1-plan.md`. It does not gather context or run tracker/branch ceremony;
those already happened in Context Gathering and Ceremony.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

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

Read `impl/intent.md` in full — it is the confirmed proto-spec from Context
Gathering. If it references an approved `solution/` folder, read those files too
(`Architecture.md`, `Design.md`, `Stack.md`, `Efforts.md`) — they remain the primary
spec; intent.md and tracker ACs supplement, they do not override the solution.

Then read any context files or docs `intent.md` references, and any relevant
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

Once done, present a brief summary of findings to the developer:

> "Here's what I found in the codebase and architecture docs:
>
> - `<key finding 1>` — `<what it means for the plan>`
> - `<key finding 2>` — `<what it means for the plan>`
> - **Architecture context**: `<relevant HLD containers / NFRs / constraints>`
>
> Anything to add or clarify before I propose the plan?"

**Stop and wait for confirmation.** If the developer adds context — incorporate it before continuing.

## Step 2 — Plan content rules

Every plan is broken into **numbered steps**. Each step must cover one logical layer or concern (e.g. data, backend, frontend are always separate steps). Each step must include:

1. **What changes** — files created or modified, with brief rationale
2. **Verification instructions** — exact commands or UI actions the developer runs themselves to confirm the step worked. Be specific:
   - CLI commands with expected output snippets
   - Which endpoint to curl and what to look for in the response
   - Which page to open and what to visually confirm

**Critical rule:** every step ends with developer verification. The next step does not start until the developer confirms the previous one passes. Make this explicit in the plan.

The plan also needs an **`## Acceptance Criteria`** section — a flat checklist of checkable assertions derived from:

- Tracker acceptance criteria (fetched during Context Gathering)
- Developer-stated goals and "out of scope" boundaries
- Any observable end states implied by the steps (e.g. endpoint returns 200, UI shows X, migration runs without error)

Each item must be independently verifiable by the evaluator during the Test stage (curl, UI action, log output, or build result). No vague items like "works correctly". Write: `[ ] {AC-N} — <what to check and where>`.

**Default Step 1 — write tests for the Acceptance Criteria first (TDD).** Unless the
developer opts out during Plan Mode's review, or the project has no established test
convention, or the ticket has no testable code path (pure config/infra value change),
make the plan's Step 1 "write tests for the Acceptance Criteria" — failing before the
real implementation exists, passing once it's done. Use whatever test framework and
file convention the project already has (discovered from existing test files, the
`test` script in `package.json`/build config, or CI); never introduce a new one. Every
later implementation step's verification then includes "the corresponding AC test(s)
now pass," not just a fresh manual check. Present this as the default plan shape when
proposing steps — the developer can decline it for a given ticket.

Other rules:

- Never bundle verification into the next step — it belongs at the end of the current one
- If a step depends on a previous step, say so explicitly
- **One step = one NX project or one cross-cutting concern.** Never mix layers in a single step (e.g. Terraform infra changes alongside `app-db` script changes). If the step title can't map cleanly to one NX project name or one concern, split it. A commit message that would require two types to be honest is a reliable signal the step is too broad.
- **Infra/config steps require at least one live operational verification item.** Static checks (grep, file inspection) are necessary but not sufficient. For any step that touches infrastructure or configuration, at least one verification item must prove the thing actually works — e.g. `terraform init` connects to the correct backend, `terraform plan` output matches expectations, CLI confirms an access policy exists, a health check or curl returns the expected response. Do not write a verification block that is grep-only for an infra step.
- **Do not repeat typecheck/lint in per-step verification — the pre-commit hook runs them.** The project's Husky pre-commit hook runs `typecheck` and `lint` on every commit, so a per-step `yarn nx typecheck`/`lint` instruction is redundant noise that implies manual work the hook already does. Per-step verification should be the functional check specific to the step (curl the endpoint, open the page, inspect build output). Add a single line at the top of the plan — "Pre-commit hook runs typecheck + lint on every commit" — and let the commit boundary catch type/lint regressions.
- **For plans that change how resources are connected — network topology, VNet subnets, service-to-service routing, container boundaries — add a Mermaid diagram of the target state at the top of the plan, above the numbered steps.** A single picture lets the reviewer validate the target state before reading the step details, and becomes the reference during implementation. Also applies to any plan where "what gets wired to what" is non-obvious from the step list alone.

## Step 3 — Design and approve the plan in native Plan Mode

Call `EnterPlanMode`. Design decisions, exploration, and the developer-facing
proposal all happen inside Plan Mode rather than through a manual write/confirm
loop — Plan Mode's own explore → design → present → approve cycle replaces that here.

While in Plan Mode, the only file you may write is the plan file the system assigns
(e.g. `~/.claude/plans/<slug>.md`) — every other write, including to the story
folder, is blocked until Plan Mode is exited. Write the plan there using
`templates/plan.md`'s structure and the content rules in Step 2. Use
`AskUserQuestion` for any approach choice that needs developer input before the plan
is complete.

Call `ExitPlanMode` when the plan is ready. If the developer raises concerns, revise
and call it again within the same Plan Mode session — do not exit and re-enter for
each revision.

**Once approved** (Plan Mode has exited and normal write access is back): write the
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
- Has steps that touch more than one NX project in a non-obvious way

When triggered, delegate to `@architect` following the satellite review protocol (`.claude/skills/dev/patterns/satellite-review.md`). Prompt:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Review the following implementation plan against HLD container boundaries, data-flow direction, and NFRs. Check each step for: container boundary violations, wrong data-flow direction, NFR breaches, layer principle violations. Verdict: **go** or **reiterate** — one finding per line. Do not write or edit any files — return output only."

- **go** → proceed silently to Step 5
- **reiterate** → present findings to the developer and ask:
  1. **Rework** — revise the affected step(s); if the plan file needs structural changes, re-enter Plan Mode for the revision, otherwise edit `1-plan.md` directly and re-run this audit
  2. **Justify** — record as an approved deviation (see below)

Maximum 3 iterations. If still unresolved, present the stalemate to the developer and stop.

If the developer justifies — record each justified deviation as an `## Architecture Deviations` section in `1-plan.md` (appended after the steps). Format:

```markdown
## Architecture Deviations

| #   | Deviation                          | Justification          |
| --- | ---------------------------------- | ---------------------- |
| 1   | <what the plan does that deviates> | <developer's argument> |
```

> ⚠️ Deviations recorded here are tracked through the lifecycle: the Implement stage will highlight them in `2-report.md`, and the Document stage will prompt a Target Architecture update.

## Step 5 — Finalise the plan

`impl/1-plan.md` is now immutable — never edit it after approval.

Update the already-existing `2-report.md` (created in Context Gathering):

- `Phase` row → `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳`
- Progress table — one row per plan step, all set to `⏳ Pending`, Notes/Test/Docs empty

## Step 6 — Report back

Tell the developer the folder path and suggest a commit message:

> "Plan saved to `docs/Stories/[{TICKET}] {name}/impl/1-plan.md`.
>
> Commit with:
>
> ````
> docs({ticket-lowercase}): add implementation plan for {short-name}
> ```"
> ````

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Implement).
