# Update recipe

> 🔁 **Session continuity:** If resuming after context compaction, re-read this full `02 Update.md` before doing anything. Determine which stage was last completed from the audit table or work done so far, and resume from the next stage. Do not restart from Stage 0 unless explicitly asked.

Use this recipe when a project already has the harness installed and the bootstrap has since evolved — new skills, updated flows, new agents, new pattern files.

Two modes — pick one at the start and stay in it:

| Mode     | What it does                                                                                    | When to use                                                          |
| -------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Add**  | Install only components that don't exist in the project yet                                     | Safe, non-destructive. Use when you know only new things were added. |
| **Sync** | Bring existing installed components up to the new template — preserving project-specific values | Use when flows/skills have been meaningfully updated. Requires care. |

Both modes run the same Stage 0 and Stage 1 audits. Diverge at Stage 2.

---

## Stage 0 — Q&A gap check

`01 Bootstrap.md`'s question set can grow between when this project was bootstrapped and now (e.g. Q10b/Q10c, "design lifecycle scope," was added after some projects were already bootstrapped). Stage 1 (below) already scans _every_ file under `docs/Harness/package/skills/` and `docs/Harness/package/agents/` unconditionally, so it will flag a newly-unlocked component like `pattern-context-resolution.md` as **NEW** on its own — Stage 0 isn't needed to surface that. What Stage 0 actually provides: Stage 1 can tell you a component is missing, but it can't _install_ one that depends on an answer this project was never asked (e.g. you cannot deploy `product-architect` without knowing `{{PRODUCT_CONTEXT_DIR}}`). Skipping Stage 0 means Stage 2A/2B hits an unresolvable substitution mid-sync instead of asking for it up front.

**0a — Read the ledger.** Look for `.harness-bootstrap-answers.md` at the repo root.

- **Exists** — read it. It lists every question this project was explicitly asked and its answer.
- **Missing** — this project was bootstrapped before the ledger convention existed. Do not block on this: infer past answers from installed state where possible (e.g. `{{PROJECT_KEY}}` from any deployed skill; design lifecycle scope from whether `pattern-context-resolution.md` or `product-architect` are already installed), note each inferred value, then create the ledger now with what's known plus `(inferred)` next to inferred rows.

**0b — Diff the question set.** Compare every `Qn` / `Qn` sub-question in the current `01 Bootstrap.md` Stage 2 against the ledger's rows. Any question present in `01 Bootstrap.md` but absent from the ledger (and not inferable with confidence) is a **gap**.

**0c — Ask the gaps, one at a time.** Same rhythm as bootstrap Stage 2 — propose an answer if inferable from project state, confirm or ask cold otherwise, stop and wait after each. Do not batch.

> "The harness gained a new question since this project was bootstrapped: **{{Qn text}}**. {{proposed answer if inferable, else blank}} — confirm or answer?"

**0d — Record.** Append the new answer(s) to the ledger. Stage 1 (next) will independently find any now-unlocked component (e.g. `pattern-context-resolution.md`, `product-architect`) as **NEW** on its own — the reason this had to happen _before_ Stage 1 is that Stage 2A/2B needs the substitution value (e.g. `{{PRODUCT_CONTEXT_DIR}}`) to actually generate that component, not merely to detect it's missing.

If Stage 0 finds no gaps (ledger covers every current question): report "No new bootstrap questions since last update." and proceed directly to Stage 1.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 1.

---

## Stage 1 — Audit: what's installed, what changed

### 1a — Read the bootstrap

Read every `INTENT.md` and `TEMPLATE.md` in `docs/Harness/package/skills/` and `docs/Harness/package/agents/` — **including the `archive/` subdirectories**. Build a mental inventory of every component, its output path, and whether it is active or archived.

### 1b — Read the project

For each component in the bootstrap inventory:

| Check      | How                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archived?  | Is the component under `docs/Harness/package/skills/archive/` or `docs/Harness/package/agents/archive/`? If yes → **ARCHIVED** regardless of installed state. |
| Installed? | Does the Output path from INTENT.md exist in the project?                                                                                                     |
| Drifted?   | Compare the installed file against what the substitution algorithm would produce — does it differ?                                                            |
| Augmented? | Does the installed file contain content that has no counterpart in TEMPLATE.md (developer additions)?                                                         |

Record each component as one of:

- **NEW** — not installed; only candidate for Add mode
- **IN SYNC** — installed, matches what the template would produce (no action needed)
- **DRIFTED** — installed, but the template has changed since install (candidate for Sync mode)
- **AUGMENTED** — installed, and the project has added content beyond the template (must preserve; extra care in Sync)
- **ARCHIVED** — component has been moved to `docs/Harness/package/skills/archive/` or `docs/Harness/package/agents/archive/`; the installed version must be moved to `.claude/skills/.archive/` (or equivalent agent archive)

### 1c — Present the audit table

Present a summary:

| Component                | Type       | Status   | Notes                                                |
| ------------------------ | ---------- | -------- | ---------------------------------------------------- |
| `design-elaborate` skill | flow skill | DRIFTED  | Step 3 heading changed; new session-continuity block |
| `architect` agent        | agent      | NEW      | Not installed                                        |
| `onboarding` agent       | agent      | IN SYNC  | —                                                    |
| `skill-authoring` rule   | rule file  | NEW      | Not installed                                        |
| `design-oq-triage` rule  | rule file  | ARCHIVED | Bootstrap moved to archive/; move project file too   |
| …                        |            |          |                                                      |

Ask:

> "Here's the audit. Which mode — **add** (install NEW items only) or **sync** (add NEW + update DRIFTED + archive ARCHIVED items)?"

⚠️ Stop and wait. Confirm the mode before proceeding to Stage 2.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 2A or 2B per the confirmed mode.

---

## Stage 2A — Add mode (NEW items only)

For each component with status **NEW**:

1. Read its `INTENT.md` — extract Substitutions table and Conditionals
2. Check whether the required substitution values are already known from the project (read the installed skills to find them — most project-specific values appear in multiple files)
3. If any value cannot be inferred: ask once, batch all unknown values into a single question
4. Run the substitution algorithm (same as `01 Bootstrap.md` Stage 3 algorithm)
5. Write the output file

Present a summary table of what was installed. Ask: "Add complete — all new components installed. Anything to spot-check?"

⚠️ Stop and wait. Done. Do not proceed to Stage 2B.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 3.

---

## Stage 2B — Sync mode (NEW + DRIFTED + ARCHIVED items)

### Bootstrap priority rule

> **The bootstrap is the authority.** When the bootstrap template and the installed file differ, the bootstrap wins by default. The only content preserved from the installed file is content that has **no counterpart in the template** (project additions / AUGMENTED content). Project modifications to existing template content are overwritten.

This is the intentional inversion from a "careful merge" to a "bootstrap wins" posture. The bootstrap evolves the harness — if something changed in the template, treat the change as correct.

---

### The sync protocol

For every **DRIFTED** component, run this protocol — one component at a time:

**Step 1 — Extract project-specific substitution values**

Read the installed project file. Using the INTENT.md Substitutions table as the guide, locate and record the current value of each `{{PLACEHOLDER}}` in the installed file.

Example: for a skill with `{{PROJECT_KEY}}`, find the literal string that replaced it (e.g. `AIFD`). Record: `PROJECT_KEY = AIFD`.

If any substitution value cannot be found, flag it:

> "I couldn't extract `{{PLACEHOLDER}}` from the installed `<path>` — it may have been customised. What value should I use?"

⚠️ Stop and wait.

**Step 2 — Re-apply the new template**

Run the substitution algorithm on the new TEMPLATE.md using the extracted values. This produces the authoritative "clean template output" — what the file should look like after the update.

**Step 3 — Identify project additions (AUGMENTED content only)**

Scan the installed file for content that has **no counterpart in the template**. These are project additions — the only content that must be preserved.

Do **not** preserve project modifications to existing template content — those are overwritten by the bootstrap.

| Diff type                                  | Meaning                                                    | Action                              |
| ------------------------------------------ | ---------------------------------------------------------- | ----------------------------------- |
| Lines in template output, not in installed | **Template addition** — new content from bootstrap update  | Include (bootstrap wins)            |
| Lines in installed, not in template output | **Project addition** — developer added beyond the template | Preserve                            |
| Lines in both but different                | **Template update** — bootstrap changed existing content   | **Bootstrap wins — apply directly** |

**Step 4 — Present what will be written**

If there are project additions (AUGMENTED content) that will be preserved, show them:

> "Syncing `<path>` with bootstrap (bootstrap wins on all template content).
>
> **Project additions preserved** (your content not in the template — kept as-is):
>
> ```
> (kept) <content>
> ```
>
> Writing now. (**skip this file** to leave it untouched)"

If there are no project additions, write directly without presenting a diff — just report "Updated `<path>`."

⚠️ Stop and wait only when there are project additions to confirm. Skip the stop when the file has no AUGMENTED content.

**Step 5 — Write**

Write the merged file: clean template output with any project additions appended/integrated.

If "skip": leave the installed file untouched. Note it in the summary.

---

### ARCHIVED components

For every **ARCHIVED** component (bootstrap moved it to `archive/`):

1. Move the installed file to `.claude/skills/.archive/` using `git mv`
2. Report: "Archived `<path>` → `.claude/skills/.archive/<name>`"

Do not stop and wait — archiving follows the bootstrap unconditionally.

---

### Stage 2B order of operations

Process DRIFTED components in this order (dependencies first):

1. Pattern files (`.claude/skills/design/pattern-*.md`, `dev/pattern-*.md`) — these have no project-specific values; safe to update verbatim
2. Shared template files (`*-template.md`) — minimal project-specific content
3. Phase skills (`design-frame`, `design-research`, etc.) — moderate project-specific content
4. Orchestrator skills (`design/`, `dev/`) — low project-specific content (mostly structural)
5. Agents — high project-specific content; extra care
6. Rule files (`skill-authoring.md`, `architecture-docs.md`) — typically verbatim

After all DRIFTED components: install all **NEW** components (same as Stage 2A).

---

### Stage 2B — Post-sync checks

After all files are written, run these checks:

**No unresolved placeholders:**

```bash
grep -r "{{" .claude/skills/ .claude/agents/ --include="*.md" | grep -v "docs/Harness/package"
```

Any match is a defect — a placeholder was not substituted. Fix before declaring done.

**Preserved additions still present:**

For each component flagged AUGMENTED, verify the project-specific additions appear in the written file.

**Verify checklists:**

For each updated component, re-run its INTENT.md Verify checklist against the written file. Report any failing items.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 3.

---

## Stage 3 — New pattern files and companions

Pattern files and companion template files (`*-template.md`) live in skill folders rather than as independent installable components. They may be added without a corresponding SKILL.md update.

After Stages 2A/2B, check for these:

- `docs/Harness/package/skills/<name>/*.template.md` — companion templates alongside SKILL.md
- `docs/Harness/package/skills/<lifecycle>/pattern-*.md` — shared pattern files

For each: check if it exists at the corresponding path in the project. If not, copy verbatim (no substitution needed — pattern files and templates are generic).

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 4.

---

## Stage 4 — Engineering Guide docs

The `Engineering Guide/` lifecycle docs in `docs/Engineering Guide/Lifecycles/` are installed from `docs/Harness/package/Engineering Guide/` and may have changed in the new bootstrap.

### Audit

For each lifecycle doc in `docs/Harness/package/Engineering Guide/Lifecycles/`:

1. Check if the installed version exists in `docs/Engineering Guide/Lifecycles/`
2. If it exists, diff it against the bootstrap source

Classify each as **NEW**, **IN SYNC**, or **DRIFTED** (same categories as Stage 1).

### Add mode

For any **NEW** lifecycle docs not yet installed: apply the same conditionals as `01 Bootstrap.md` Block D (Design lifecycle doc → only if Design in Q10, etc.), then copy verbatim.

### Sync mode

For **DRIFTED** lifecycle docs: apply the safe-merge protocol from Stage 2B.

Lifecycle docs have minimal project-specific content — typically only WAF pillar names (from Q11) and Jira/Confluence URLs (from Q5). These are easy to re-extract from the installed file.

Present the diff. Ask:

> "Here's what changed in `<doc path>`:
>
> ```diff
> <diff>
> ```
>
> Apply? (**yes** / **skip** / **edit before applying**)"

⚠️ Stop and wait per doc.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 5.

---

## Stage 5 — AGENTS.md / CLAUDE.md additions

AGENTS.md and CLAUDE.md are not generated from bootstrap templates — they are project-maintained. However, they may need manual additions after a sync:

- New skills added → add rows to the Skills table in AGENTS.md
- New agents added → add rows to the Agents table in AGENTS.md
- New slash commands added → add rows to the Slash commands section

Present the additions needed:

> "These entries need to be added to AGENTS.md:
>
> **Skills table:**
> | Skill | Purpose |
> | `<name>` | `<description from TEMPLATE.md frontmatter>` |
>
> **Agents table:**
> | Agent | Layer | Tools |
> | `<name>` | `<layer>` | `<tools from TEMPLATE.md frontmatter>` |
>
> Add these now? (**yes** / **I'll add manually**)"

⚠️ Stop and wait.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Stage 6.

---

## Stage 6 — Post-validation (final-final review)

After all stages complete, run a thorough side-by-side validation of **every** updated or added flow skill and lifecycle doc against its bootstrap source. This is not a spot-check — read every step of every file. It catches incomplete syncs, missed steps, wrong pattern refs, or leftover installed-version content.

> ⚠️ Do not skip this stage because "it was just synced". The sync is mechanical and error-prone. Stage 6 is the quality gate.

### For each updated or added skill

1. **Read the installed file** (e.g. `.claude/skills/design-frame/SKILL.md`)
2. **Read the bootstrap template** (e.g. `docs/Harness/package/skills/design-frame/TEMPLATE.md`)
3. Apply the substitution table mentally — resolve all `{{PLACEHOLDER}}` values
4. **Compare step-by-step, section by section:**

   - Are all steps present and in the correct order?
   - Does each step's content match the bootstrap (after substitution)?
   - Is session-continuity block present at the top (for phase skills)?
   - Do phase skills re-read the orchestrator at the end?
   - Are pattern file references correct (e.g. `pattern-write-confirm.md`, not stale inline instructions)?
   - Are any obsolete path references still present (e.g. old `design-architect-review.md` path, `design/03 Specify.md`)?
   - Do all stop-and-wait / HARD STOP instructions match the template?

5. Report any discrepancy as a defect — fix it before declaring the skill in sync.

### For pattern files

For each pattern file updated or added:

1. Read the installed file (e.g. `.claude/skills/dev/pattern-review-gate.md`)
2. Read the bootstrap source (e.g. `docs/Harness/package/skills/dev/pattern-review-gate.md`)
3. Verify they are identical — pattern files have no project-specific substitutions.

### For Engineering Guide lifecycle docs

For each lifecycle doc updated in Stage 4:

1. Read the installed doc and the bootstrap source side-by-side
2. Verify: Phases table matches, Invariants match, Patterns section present (if applicable), Mermaid diagram matches
3. Report any discrepancy

### Pass criteria

A skill or lifecycle doc passes validation when:

- All steps/sections from the bootstrap are present
- No unresolved `{{PLACEHOLDER}}` tokens remain
- Pattern references point to the correct paths (`pattern-*.md` in the skill subfolder)
- No stale standalone rule file paths (e.g. `.claude/skills/design-oq-triage.md` should be `.claude/skills/design/pattern-design-oq-triage.md`)
- ARCHIVED items no longer appear in active skill paths
- Session continuity block present (phase skills)
- Orchestrator re-read instruction present at end of phase skills

Present the validation report before the commit summary.

🔁 Re-read `docs/Harness/package/02 Update.md` and proceed to Summary and commit.

---

## Summary and commit

Once all stages and validation complete, present:

| Component | Action                              | Validation                    |
| --------- | ----------------------------------- | ----------------------------- |
| `<name>`  | Added / Updated / Skipped / In sync | ✅ pass / ⚠️ defect fixed / — |

Suggest commit:

> `chore(harness): update to latest bootstrap — <N> updated, <M> added`

⚠️ Stop and wait for developer to confirm commit.
