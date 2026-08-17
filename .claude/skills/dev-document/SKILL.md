---
name: dev-document
metadata:
  version: 0.3.1
description: Document phase of the dev lifecycle (/dev-document or /dev orchestrator). Updates READMEs, LLD, Engineering Guide; resolves deviations; archives story. Final phase.
---

The developer wants to run the documentation stage for an implemented plan. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** See `.claude/skills/dev/pattern-session-continuity.md` — re-read this SKILL.md on resume; re-read `dev/SKILL.md` on phase exit.

## Step 0 — Read documentation writing rules

Read `docs/Engineering Guide/07 Documentation Principles.md` before doing anything else — it contains destination rules, diagram standards (min 1 colored Mermaid diagram per doc), format priority (diagrams → tables → text), certainty principle, and length budgets. Also read `docs/Engineering Guide/02 Doc Structure.md` for tier placement and naming conventions.

For multi-file permanent doc updates, delegate to `@docs-writer` instead of writing inline.

## Step 1 — Find the implementation folder and advance phase

The argument is a ticket number (e.g. `ADLC-042`) or a direct folder path.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- Read `1-plan.md` to understand what was built and which layers were touched
- Read `2-report.md` to understand what changed during implementation and any tech debt
- If not found: tell the developer and stop

Update the `Phase` row in `2-report.md`:

```
📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document 🔄
```

**Deviation audit (before classifying docs):**

1. Read `1-plan.md` and `2-report.md` in full — plan steps, architecture deviations table, and every implementation note
2. Merge them into a single context block
3. Feed the merged context to `@architect`: "Given this plan and implementation report, identify every decision — planned or emergent — that diverges from, extends, or is absent from `docs/Target Architecture (HLD)/` and `docs/System Architecture (LLD)/`. For each finding, name the exact doc section and the one-sentence change required. **Do not write or edit any files — return output only.**"
4. **Apply the review gate pattern** (`.claude/skills/dev/pattern-review-gate.md`) with section name `## Deviation Audit` — write findings to `2-report.md` first, then present triage, then wait for confirmation before proceeding to the classified doc list

From the combined picture, identify what needs documenting. Use the placement matrix below, then the per-destination rules.

**HLD / LLD placement matrix:**

| HLD status                                | LLD status  | Action                                                                                                                                                                               |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HIT — solution matches existing HLD entry | HIT or MISS | Compare actual vs. designed; note deviations explicitly. Update HLD only if a settled decision changed (no rationale). Always update or create LLD entry with implementation detail. |
| MISS — solution not covered in HLD at all | HIT or MISS | Add a minimal new HLD entry (one paragraph, settled outcome only). Always update or create LLD entry with full detail.                                                               |

Use these rules to classify each item:

**`{app}/README.md`** — for changes scoped to an entire application:

- New or changed build targets
- New or changed env vars / configuration
- Infrastructure or build changes for that app
- Deployment or teardown procedure changes

**`docs/System Architecture (LLD)/{container}/`** — for implementation detail that is non-obvious from the code and worth preserving as a reference:

- Data flows, sequence diagrams, component relationships
- API contracts or integration patterns between containers
- Key implementation decisions — **outcomes only, no rationale** (rationale stays in `solution/design/`)
- Schema design, caching strategy, or config that isn't self-documenting
- Only create/update if the implementation is stable enough to be a reference — not for in-progress or experimental work
- The affected container folder will be clear from the plan context — check `docs/System Architecture (LLD)/README.md` for the current folder structure if in doubt

> ⚠️ **Certainty principle** — LLD documents describe what is built, stated with certainty. No comparisons, open questions, or rationale. Write single-direction, settled statements only.

**`docs/Engineering Guide/`** — for changes that concern the entire product, an environment, or a shared process:

- Environment provisioning or setup changes
- New or changed operational steps (CDK deploy, secrets management)
- Cross-cutting tooling or workflow changes
- Anything a new developer would need to understand before touching the project

**File naming inside `docs/`:** All Markdown files under `docs/` use the format `NN Title Case.md` — two-digit number prefix, space separator, Title Case (e.g. `01 MCP Setup.md`, `09 Launching Env.md`). Pick the next available number within the folder. Update all references in `README.md` and `CLAUDE.md` when adding or renaming a file.

**DRY rule:** if the substance of a change mostly belongs in the Engineering Guide or System Architecture (LLD), put the full content there and add only a short one-sentence reference in the app `README.md`. Never duplicate the same detail in two places.

Present the classified list to the developer:

> "Based on the plan, I'll check/update:
>
> - `{app}/README.md` — `<what changed at app level>`
> - `docs/Engineering Guide/{article}` — `<what changed globally>`
>
> Does that look right? Confirm to proceed or tell me what to add/remove."

**Stop and wait for confirmation before proceeding.**

---

## Step 2 — Update documentation

Work through each identified item one at a time. Apply the write-confirm pattern (`.claude/skills/dev/pattern-write-confirm.md`) for each item — announce what you are about to update before writing, then follow the loop. After each confirmation, emit a progress announcement (`.claude/skills/dev/pattern-announce-progress.md`) showing remaining doc items.

Suggested checks based on the documentation skill:

- New or changed API endpoint → update app `README.md` endpoints table
- New env var → update app `README.md` env table + `.env.example`
- New build target → update app `README.md` targets table
- Non-obvious architectural decision → capture as a skill in `.claude/skills/` or note in the relevant Target Architecture doc
- New repeatable pattern → write skill in `.claude/skills/` + register in `CLAUDE.md`

---

## Step 3 — Collaborative documentation review

After completing all identified items, ask:

> "Based on what was implemented, you may also want to document:
>
> - `<suggestion 1>` — `<why it might be worth capturing>`
> - `<suggestion 2>` — `<why it might be worth capturing>`
>
> Is there anything else you'd like to document or update before I write the report?"

**Stop and wait.** If the developer wants additional items, work through them using the same one-at-a-time flow from Step 2. Only proceed once they confirm documentation is complete.

---

## Step 4 — Update `2-report.md`

For each step row in the `## Progress` table, fill in the **Docs** column:

- `✅` — documentation for this step is complete
- `—` — not applicable (no docs needed for this step)
- (empty) — not yet done

Then append a `## Documentation` section at the end of `2-report.md`:

```markdown
## Documentation

_Date: {date}_

| Item            | Action                               |
| --------------- | ------------------------------------ |
| `<file or doc>` | Created / Updated / No change needed |

### Notes

<any decisions made, docs skipped and why>
```

Say:

> "`2-report.md` updated with documentation summary. Please confirm it looks correct."

**Stop and wait for confirmation.**

---

## Step 5 — Track tech debt

Read the `## Tech Debt` section from `2-report.md`. If there are any TD items, present them to the developer:

> "The following tech debt items were captured during implementation:
>
> - **TD-1** — `{title}`: `<one-line description>`
> - **TD-2** — ...
>
> Would you like to add these to a tracking document or note them somewhere? Say **skip** to continue without action."

**Stop and wait for confirmation.**

---

## Step 5b — Propose architecture doc updates from design impact

Check whether an approved design exists for this ticket:

- Glob for `docs/Stories/*{TICKET}*/solution/Architecture.md` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`)
- Also check `docs/Stories/archive/*{TICKET}*/solution/Architecture.md` (folder may already be archived)
- If found, read `solution/Architecture.md` for the settled architecture decisions from the design

If an Architecture Impact table is found, cross-reference it against what was actually implemented (from `1-plan.md` and `2-report.md`). Only surface impacts whose corresponding implementation step is marked complete.

Present to the developer:

> "The design for `{TICKET}` identified these architecture doc updates. Based on what was implemented, the following are ready to publish:
>
> - [ ] `<doc path>` — `<what to add or change>`
>
> These should reflect only what was built — no rationale, no alternatives, settled outcomes only.
>
> Run `@architect` with the doc path and a summary of the decision to update each one.
>
> Proceed with archiving? (**yes** / **update docs first**)"

**Stop and wait.** If the developer wants to update docs now, assist and confirm each change before continuing. If they say yes — proceed to Step 5c.

If no design folder or Architecture Impact table is found — skip this step silently and proceed to Step 5c.

---

## Step 5c — Resolve architecture deviations

Check `1-plan.md` for an `## Architecture Deviations` section. If any rows are present, they must be resolved before archiving.

For each deviation, present to the developer:

> "The plan recorded the following architecture deviation(s) that must be resolved now:
>
> | #   | Deviation     | Justification     |
> | --- | ------------- | ----------------- |
> | 1   | `{deviation}` | `{justification}` |
>
> For each deviation, choose one:
>
> 1. **Update Target Architecture** — the change is intentional and the HLD/LLD should reflect it. Run `@architect` with the doc path and the approved justification.
> 2. **Track as tech debt** — the deviation is a known shortcut and will be corrected later.
>
> Tell me which action to take for each deviation."

**Stop and wait.** Work through each deviation one at a time using the same confirm-per-item flow from Step 2. Do not proceed to Step 5d until all deviations are resolved.

If `1-plan.md` has no `## Architecture Deviations` section or the table is empty — skip this step silently and proceed to Step 5d.

---

## Step 5d — Satellite consistency review

Before archiving, spawn `@architect` to cross-check all documentation modified in this session for internal contradictions and stale references.

Prompt template:

> "Read the following docs that were created or updated during this documentation session: `<list every file written or edited in Steps 2–5c>`. For each file, identify: (1) any statement that contradicts a statement in another listed doc or in `docs/Target Architecture (HLD)/`, (2) any reference to a technology, tool, or resource that is no longer present in the codebase (stale reference). One finding per line. If none, say 'No issues found.' **Do not write or edit any files — return output only.**"

If `@architect` returns findings, **apply the review gate pattern** (`.claude/skills/dev/pattern-review-gate.md`) with section name `## Satellite Review`. The tri-choice for each finding is **fix** / **td** (track as tech debt) / **skip** — present this alongside the standard triage.

If no issues are found, continue directly to Step 6.

---

## Step 6 — Archive the story

Mark the story as done and move it to the archive:

1. Update the `Phase` row in `2-report.md` to all-complete:
   ```
   📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅
   ```
2. Update `Status` in `2-report.md` to `✅ Complete`.
3. Run `git mv` to archive the story folder (the skill runs this directly — do not present as a user instruction):

   ```bash
   git mv "docs/Stories/[{TICKET}] {name}" "docs/Stories/archive/[{TICKET}] ✅ Done — {name}"
   ```

   Report to the developer: "Story archived to `docs/Stories/archive/[{TICKET}] ✅ Done — {name}`."

4. Apply the do → report → commit pattern (`.claude/skills/dev/pattern-do-report-commit.md`) — present a commit message only after Steps 4–5 above have updated `2-report.md`:

> "Documentation complete and story archived. Please commit with:
>
> ```
> docs({ticket-lowercase}): update docs and archive story
> ```
>
> Once committed, let me know."

**Stop and wait for confirmation before proceeding to Step 7.**

---

## Step 7 — Report back

Tell the developer:

- Documentation stage complete
- Summary of what was updated
- Any items intentionally skipped and why
- Story archived to `docs/Stories/archive/[{TICKET}] ✅ Done — {name}`

Then close with:

> "**Ticket complete.** If anything surprised you during this ticket — an approach that didn't work, a pattern you had to figure out, or a convention you had to invent — capture it now:
>
> ```
> /skill-reflect <your brain-dump here>
> ```
>
> Reflections feed the skill library. Even a sentence is enough."

🔁 Document is the final phase — no further orchestrator handoff needed.
