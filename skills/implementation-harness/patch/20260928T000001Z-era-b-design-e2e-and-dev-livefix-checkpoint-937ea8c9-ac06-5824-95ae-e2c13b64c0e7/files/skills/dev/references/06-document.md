# Document stage

Apply `.claude/skills/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage document`. Complete it directly only for direct-stage entry — for the
full chain, keep Document active through the router's Completion work; the router
completes the stage and ticket metrics after that work succeeds. After archival,
use the new impl path for every metrics command.

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This is the final
stage — it updates permanent docs, resolves deviations, and archives the story.

Apply `patterns/approval-sign-off.md`: follow dependencies, continue routine authorized work,
and pause only for a concrete unresolved decision, required human verification, or a
fixed sign-off gate (`patterns/approval-sign-off.md`).

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 0 — Read documentation writing rules

Read `{{DOC_PRINCIPLES_ARTICLE}}` before doing anything else — it contains destination rules, diagram standards (min 1 colored Mermaid diagram per doc), format priority (diagrams → tables → text), certainty principle, and length budgets. Also read `{{DOC_STRUCTURE_ARTICLE}}` for tier placement and naming conventions.

For multi-file permanent doc updates, delegate to `@docs-writer` instead of writing inline.

## Step 1 — Find the implementation folder and advance phase

The argument is a ticket number (e.g. `{{PROJECT_KEY}}-042`) or a direct folder path.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- Read `1-plan.md` to understand what was built and which layers were touched
- Read `2-report.md` to understand what changed during implementation and any tech debt
- If not found: tell the developer and stop

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document 🔄
```

**HLD deviation audit:**

Read the active HLD version, the approved plan/design and actual changed code as well
as the report. Compare implementation against HLD contracts, boundaries and NFRs only.
Ask `@architect` for evidence-backed contradictions, extensions and omissions, without
editing files. Use `patterns/review-gate.md`: upsert existing RF IDs, including issues
already found by PR review. Record review coverage even when no findings exist.
LLD lag is normal before this stage; route it directly into the doc-update list.

Include implemented impacts from the approved solution's selected artifacts in that
same list now. Do not postpone design-impact documentation until after a closure gate.
If applicable, update the LLD feature doc in `09. Features/`, following local naming
conventions, with built flows/schema/contracts only. HLD target decisions remain the
baseline; any material target change needs authorization before editing that decision.

From the combined picture, identify what needs documenting. Use the placement matrix below, then the per-destination rules.

**HLD / LLD placement matrix:**

| HLD status                                | LLD status  | Action                                                                                                                                                                               |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HIT — solution matches existing HLD entry | HIT or MISS | Compare actual vs. designed; note deviations explicitly. Update HLD only if a settled decision changed (no rationale). Always update or create LLD entry with implementation detail. |
| MISS — solution not covered in HLD at all | HIT or MISS | Add a minimal new HLD entry (one paragraph, settled outcome only). Always update or create LLD entry with full detail.                                                               |

Principle: HLD stays high-level always. LLD is the ground truth for implementation specifics. Deviations from HLD design must be explicitly called out — never silently overwritten.

Use these rules to classify each item:

**`{app}/README.md`** — for changes scoped to an entire application:

- New or changed build targets
- New or changed env vars / configuration
- Infrastructure or build changes for that app
- Deployment or teardown procedure changes

**`docs/System Architecture (LLD)/{container}/`** — for implementation detail that is non-obvious from the code and worth preserving as a reference:

- Data flows, sequence diagrams, component relationships
- API contracts or integration patterns between containers
- Key implementation decisions — **outcomes only, no rationale** (rationale stays in the design evaluation artifact)
- Schema design, caching strategy, or config that isn't self-documenting
- Only create/update if the implementation is stable enough to be a reference — not for in-progress or experimental work
- The affected container folder will be clear from the plan context — check `docs/System Architecture (LLD)/README.md` for the current folder structure if in doubt

> ⚠️ **Certainty principle** — LLD documents describe what is built, stated with certainty. No comparisons, open questions, or rationale. Write single-direction, settled statements only.

**`docs/Engineering Guide/`** — for changes that concern the entire product, an environment, or a shared process:

- Environment provisioning or setup changes
- New or changed operational steps (CI/CD, deployment, secrets management)
- Cross-cutting tooling or workflow changes
- Anything a new developer would need to understand before touching the project

**File naming inside `docs/`:** All Markdown files under `docs/` use the format `NN Title Case.md` — two-digit number prefix, space separator, Title Case (e.g. `01 MCP Setup.md`, `09 Launching Env.md`). Pick the next available number within the folder. Update all references in `README.md` and `AGENTS.md` when adding or renaming a file.

**DRY rule:** if the substance of a change mostly belongs in the Engineering Guide or System Architecture (LLD), put the full content there and add only a short one-sentence reference in the app `README.md`. Never duplicate the same detail in two places.

Announce the combined documentation list and implement routine updates. Surface
unsettled target/scope decisions together under `patterns/approval-sign-off.md`; continue work
that does not depend on those answers.

---

## Step 2 — Update documentation

Update the identified docs as a coherent set using `patterns/write-confirm.md`.
Check links, diagrams, placement and consistency with the code. No per-file stops.

Suggested checks based on the documentation skill:

- New or changed API endpoint → update app `README.md` endpoints table
- New env var → update app `README.md` env table + `.env.example`
- New build target → update app `README.md` targets table
- Non-obvious architectural decision → capture as a skill in `.claude/skills/` or note in the relevant Target Architecture doc
- New repeatable pattern → write skill in `.claude/skills/` + register in `AGENTS.md`

---

## Step 3 — Consistency review

Have `@architect` check the updated docs against each other, the HLD target and actual
code for contradictions and stale references. Return evidence only, no edits. Upsert
findings in Review Findings with origin `doc-consistency`; resolve routine in-scope
issues and repeat relevant checks. After at most three unsuccessful review/fix rounds,
escalate the remaining issue with evidence. Do not archive with unresolved findings.
Optional documentation suggestions do not introduce another stop; report them briefly.

---

## Step 4 — Update `2-report.md`

For each step row in the `## Progress` table, fill in the **Docs** column:

- `✅` — documentation for this step is complete
- `—` — not applicable (no docs needed for this step)
- (empty) — not yet done

Then append a `## Documentation` section at the end of `2-report.md` for the full item-level breakdown:

```markdown
## Documentation

_Date: {date}_

| Item            | Action                               |
| --------------- | ------------------------------------ |
| `<file or doc>` | Created / Updated / No change needed |

### Notes

<any decisions made, docs skipped and why>
```

Refresh metrics with `report`; the quality summary is generated beside Stage Metrics.

## Step 5 — Resolve decisions and tech debt

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval conditions: every Review Finding already carries a resolution with
recorded evidence, every proposed TD row has a concrete owner and next action with
no risk-acceptance or scope-deferral implied, and no tracker task needs creating
beyond what's already authorized.

All conditions met → auto-approve: record in `2-report.md` that this checkpoint ran
with nothing outstanding, and continue.

Any condition fails or is uncertain → present one combined review of unresolved
findings, prepared doc changes and proposed TD tasks. Request only
decisions that remain unauthorized: real risk acceptance, required-work deferral,
target changes, or external tracker creation. For each proposed task prepare its
title, description, owner, linked RF IDs and next action before asking. Reuse
existing authorization for anything already covered.

Create only authorized tracker tasks through `@scrum-master`; record returned keys.
If creation fails, keep the local TD row and the external action pending, never invent
a key. Local-ID or trackerless flows retain owner/next action in the local ledger.
Declining optional tracker creation is allowed; it is not permission to skip a required
finding resolution. New findings from late changes use the same table and closure checks.

## Step 6 — Closure and archive

Verify before moving the story:

- Every RF row is `fixed`, `accepted`, `tech-debt` or `doc-updated` with the evidence,
  attributed decisions and TD links required by `patterns/review-gate.md`.
- Required acceptance criteria and latest applicable checks pass. Deferred required work
  needs an explicit approved scope decision; a TD row alone does not waive acceptance.
- Planned doc updates and consistency review are complete; no pending required action
  is represented as complete. Run metrics `report` then `quality validate` to check the
  ledger's structural closure; this does not substitute for reviewing its evidence.

Apply `patterns/approval-sign-off.md`. Archive locally using `git mv` when files are tracked,
or a normal move for an untracked story, preserving `impl/stat.json` and all artifacts —
this is a reversible local move, not a commit, and running it directly is fine, same as
elsewhere in this harness. Never overwrite an existing archive destination. Use
`docs/Stories/archive/[{TICKET}] ✅ Done — {name}` and update relative links as needed.
Update report state, then propose the Conventional Commit for the developer to run —
never commit yourself, same rule as Implement and Plan.
Use the new impl path for every subsequent metrics command.

For full-flow entry keep Document active and Status In Progress while required router
Completion work remains. The router finalizes phase/status and metrics once it succeeds.
For direct-stage entry finish only Document, record actual remaining lifecycle work,
and leave tracker completion to an authorized full-flow completion. Archive only when
the story as a whole satisfies the closure checks above.

## Step 7 — Report back

Report changed docs, verified finding resolutions, retained debt and its disposition,
actual archive location (if moved), and any pending external actions. Do not duplicate
the router's tracker Done transition. Return to Completion only for full-flow entry.
