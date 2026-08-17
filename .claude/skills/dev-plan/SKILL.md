---
name: dev-plan
metadata:
  version: 0.3.1
description: Plan phase of the dev lifecycle (/dev-plan or /dev orchestrator). Proposes implementation plan, saves 1-plan.md + 2-report.md.
---

The developer wants to create an implementation plan. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** See `.claude/skills/dev/pattern-session-continuity.md` — re-read this SKILL.md on resume; re-read `dev/SKILL.md` on phase exit.

## Step 0 — Idempotency check

Before doing anything else, check for stale state:

- Parse the ticket number from `$ARGUMENTS` (`ADLC-\d+`)
- If found, glob for `docs/Stories/*{TICKET}*/impl/2-report.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`)
- If the file exists, read it and extract the `Phase` row from the header table

If stale state is found, present:

> "I found an existing plan and report for `{TICKET}`:
>
> - Plan: `docs/Stories/{folder}/impl/1-plan.md`
> - Report current phase: `{phase-row}`
>
> Start fresh (overwrite) or stop here and use `/dev-implement {TICKET}` to resume? (**overwrite** / **stop**)"

**Stop and wait.**

- If **stop** — report the folder path and exit. Do not continue.
- If **overwrite** — continue normally from Step 1 below.

If no stale state is found — continue normally from Step 1.

## Step 1 — Parse the input

Detect the input shape:

- **Ticket only** — `ADLC-42` — no additional text
- **Free-form only** — no ticket number present (e.g. `add auth to docs site`)
- **Mixed** — ticket number followed by free-form text (e.g. `ADLC-42 add auth to docs site`)

A ticket number matches the pattern `ADLC-\d+`. If none is found, use `ADLC-000` as a placeholder.

Extract from the arguments:

- **ticket** — `ADLC-\d+` if present, otherwise `ADLC-000`
- **problem** — free-form description of what to build or fix (may be empty for ticket-only)
- **thoughts** — developer's initial implementation ideas (may be empty)
- **context** — any file paths, URLs, or doc references

## Step 2 — Feature branch checkout

Before reading the codebase, confirm the developer is on the correct feature branch:

> "Are you on the feature branch for this ticket? If not:
>
> ```bash
> git checkout -b feat/{ticket-lowercase}-{slug}
> ```
>
> (skip if already on it)"

**Stop and wait for confirmation.** Do not proceed to Step 3 until the developer confirms they are on the branch.

## Step 3 — Stop and validate context

Present the combined context summary to the developer and ask:

> "Here's what I'm working from:
>
> - **Ticket**: `<ticket number or 'not provided'>`
> - **Developer input**: `<problem + thoughts or 'none'>`
>
> Does this capture the right scope? Anything missing, incorrect, or out of scope before I read the codebase?"

**Stop and wait for confirmation.** If the developer corrects anything — update the context and re-summarise before continuing.

## Step 4 — Check for approved design (solution/ folder)

Before reading the codebase, check whether an approved design exists for this ticket:

- Glob for `docs/Stories/*{TICKET}*/solution/` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- If found, read all files in `solution/` in full: `Architecture.md`, `Design.md`, `Stack.md`, `Efforts.md`
- The `solution/` files are the primary spec — `Architecture.md` covers integration and NFRs, `Design.md` covers component detail

If a `solution/` folder is found, tell the developer:

> "Found approved design for `{TICKET}` — reading `solution/` as the source of truth for this plan."

Use the solution files as the primary spec input for Steps 5–6. Developer free-form input supplements; it does not override the solution.

If no `solution/` folder exists — continue normally, the plan will be derived from developer input and codebase context alone.

## Step 5 — Read codebase and architecture context

Read all context files or docs the developer referenced. Also read any relevant existing code in the affected layers. Do not guess — read the actual files before proposing anything.

**Always read architecture docs before proposing any plan:**

- Read `docs/Target Architecture (HLD)/README.md` to find the active version and the container index
- Glob for `docs/Target Architecture (HLD)/*/` to find the version folder; read the container and NFR docs inside it
- Read `docs/System Architecture (LLD)/README.md` to understand which LLD docs exist, then read the ones relevant to the layers touched by the plan

Key things to check:

- What already exists that can be reused?
- What constraints come from the Target Architecture (container ownership, data flow direction, NFRs)?
- Are there relevant skills to follow?
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

## Step 6 — Propose the plan

Write a plan broken into **numbered steps**. Each step must cover one logical layer or concern (Web, Auth, and Infrastructure are always separate steps). Each step must include:

1. **What changes** — files created or modified, with brief rationale
2. **Verification instructions** — exact commands or UI actions the developer runs themselves to confirm the step worked. Be specific:
   - CLI commands with expected output snippets
   - Which endpoint to curl and what to look for in the response
   - Which page to open and what to visually confirm

**Critical rule:** every step ends with developer verification. The next step does not start until the developer confirms the previous one passes. Make this explicit in the plan.

After writing the steps, add an **`## Acceptance Criteria`** section — a flat checklist of checkable assertions derived from:

- Developer-stated goals and "out of scope" boundaries
- Any observable end states implied by the steps (e.g. site serves correctly, auth blocks unauthenticated requests, CDK deploy succeeds)

Each item must be independently verifiable by the evaluator during `dev-test` (curl, UI action, log output, or build result). No vague items like "works correctly". Write: `[ ] {AC-N} — <what to check and where>`.

Other rules:

- Never bundle verification into the next step — it belongs at the end of the current one
- If a step depends on a previous step, say so explicitly
- **One step = one NX project or one cross-cutting concern.** Never mix layers in a single step (e.g. CDK infra changes alongside Lambda@Edge auth changes). If the step title can't map cleanly to one NX project name or one concern, split it. A commit message that would require two types to be honest is a reliable signal the step is too broad.
- **Infra/CDK steps require at least one live operational verification item.** Static checks (grep, file inspection) are necessary but not sufficient. For any step that touches infrastructure or configuration, at least one verification item must prove the thing actually works — e.g. `cdk synth` produces the expected stack, `cdk diff` output matches expectations, a CLI check confirms an IAM policy or CloudFront behavior exists, a health check or curl returns the expected response. Do not write a verification block that is grep-only for an infra step.
- **Do not repeat typecheck/lint in per-step verification — the pre-commit hook runs them.** The project's Husky pre-commit hook runs `typecheck` and `lint` on every commit, so a per-step `yarn nx typecheck`/`lint` instruction is redundant noise that implies manual work the hook already does. Per-step verification should be the functional check specific to the step (curl the endpoint, open the page, inspect build output). Add a single line at the top of the plan — "Pre-commit hook runs typecheck + lint on every commit" — and let the commit boundary catch type/lint regressions.
- **For plans that change how resources are connected — network topology, VPC subnets, service-to-service routing, container boundaries — add a Mermaid diagram of the target state at the top of the plan, above the numbered steps.** A single picture lets the reviewer validate the target state before reading the step details, and becomes the reference during implementation. Also applies to any plan where "what gets wired to what" is non-obvious from the step list alone.

## Step 7 — Write draft plan, then get approval

Apply the write-confirm pattern (`.claude/skills/dev/pattern-write-confirm.md`): write the draft plan file first (see Step 9 for folder/file structure), then ask the developer to open `1-plan.md` in their editor and review it. If the developer requests changes — update the file in place and repeat the loop. Iterate until explicitly approved. **Do not write any code.**

## Step 8 — Architecture audit _(optional — non-trivial plans only)_

**Skip this step** for mechanical plans (single-layer rename, dependency bump, config value with no structural impact). Run it when the plan:

- Introduces a new cross-layer integration, API contract, or module boundary
- Adds or changes infrastructure, IAM policy, or cloud resources
- Changes data flow between containers
- Has steps that touch more than one NX project in a non-obvious way

When triggered, delegate to `@architect` following the satellite review protocol (`.claude/skills/dev/pattern-satellite-review.md`). Prompt:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Review the following implementation plan against HLD container boundaries, data-flow direction, and NFRs. Check each step for: container boundary violations, wrong data-flow direction, NFR breaches, layer principle violations. Verdict: **go** or **reiterate** — one finding per line. Do not write or edit any files — return output only."

- **go** → proceed silently to Step 9
- **reiterate** → present findings to the developer and ask:
  1. **Rework** — revise the affected step(s) and loop back to Step 7
  2. **Justify** — record as an approved deviation (see below)

Maximum 3 iterations. If still unresolved, present the stalemate to the developer and stop.

If the developer justifies — record each justified deviation as an `## Architecture Deviations` section in `1-plan.md` (appended after the steps). Format:

```markdown
## Architecture Deviations

| #   | Deviation                          | Justification          |
| --- | ---------------------------------- | ---------------------- |
| 1   | <what the plan does that deviates> | <developer's argument> |
```

> ⚠️ Deviations recorded here are tracked through the lifecycle: `/dev-implement` will highlight them in `2-report.md`, and `/dev-document` will prompt a Target Architecture update during the Document phase.

## Step 9 — Finalise the plan folder

**Story folder and `1-plan.md`** were already created in Step 7. Confirm the folder structure is correct:

- Glob for `docs/Stories/*{TICKET}*/` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- If a design folder already exists (e.g. `[{TICKET}] {name}/`): `impl/` sits inside it.
- If none existed: `docs/Stories/[{TICKET}] {name}/impl/` was created in Step 7.

The folder name is **stable for the life of the ticket** — do not rename it. Phase state is tracked in the `Phase` row of `2-report.md`, not in the folder name.

**`1-plan.md`** was written using `.claude/skills/dev/plan-template.md` in Step 7. It is now immutable — never edit it after approval.

**Create `2-report.md`** — the living implementation report:

Create this file using the template at `.claude/skills/dev/report-template.md`.

Replace the placeholder values:

- `{TICKET}` and `<Short Title>` — from the ticket / plan title
- Header table — fill in Ticket, Branch, and Author (run `git config user.name` to get the value); leave PR as `—`, Status as `🔄 In Progress`, Phase as `📋 Plan 🔄 · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳`
- Progress table — one row per plan step, all set to `⏳ Pending`, Notes/Test/Docs empty

---

## Step 10 — Report back

Tell the developer the folder path, suggest a commit message, and remind them to create the feature branch before implementing:

> "Plan saved to `docs/Stories/[{TICKET}] {name}/impl/` (inside the existing story folder, or a new one if none existed).
>
> Commit with:
>
> ```
> docs({ticket-lowercase}): add implementation plan for {short-name}
> ```
>
> Before starting implementation, make sure you are on the feature branch:
>
> ```bash
> git checkout -b feat/{ticket-lowercase}-{slug}
> ```
>
> (skip if already on it)"

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the orchestrator from the next phase (Implement).
