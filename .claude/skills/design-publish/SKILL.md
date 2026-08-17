---
name: design-publish
metadata:
  version: 1.0.0
description: Publish phase of the design lifecycle (/design-publish or /design orchestrator). Runs once the gate is approved — updates docs/Target Architecture (HLD)/, archives folder.
---

The developer wants to run the Publish phase of a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, the design lifecycle is closed — no orchestrator handoff needed.

Publish is Phase 7 — the final phase. It runs once `/design-review-gate` (or `/design-address-feedback`) has recorded an approved gate.

---

## Step 1 — Verify the gate is approved

Find the design folder by globbing `docs/Stories/*{TICKET}*/**`. Read `design/Report.md`'s `## Gate` section.

If `Approved:` is still `pending` or unset, tell the developer: "The design gate isn't approved yet — run `/design-review-gate {TICKET}` (or `/design-address-feedback {TICKET}` if there are open concerns) first." Stop.

---

## Step 2 — Doc impact identification

Delegate to `@architect` (read-only — no file writes):

- Read `solution/Architecture.md`, `solution/Design.md`, `solution/Stack.md`
- Read `design/Report.md` WAF section (P1 items)
- Read the relevant docs under `docs/Target Architecture (HLD)/` for the subfolder(s) this design touches
- Return: a list of specific `docs/Target Architecture (HLD)/` docs that need creating or updating, with the exact section and what settled decision to add or change — no rationale, no rejected options, no open questions (Certainty principle)
- **Do not write or edit any files — return output only**

Present `@architect`'s findings to the developer:

> "Here's what needs updating in `docs/Target Architecture (HLD)/`:
>
> - `{path}` → `{section}`: <what to add or change>
>
> Confirm to proceed with updates? (**yes** / **adjust**)"

**Stop and wait.**

---

## Step 3 — Apply doc updates

Read `docs/Engineering Guide/07 Documentation Principles.md` before writing anything.

Delegate to `@docs-writer` with the classified list from Step 2:

> "You are writing permanent documentation for design ticket {TICKET}. Read `docs/Engineering Guide/07 Documentation Principles.md` before writing anything — it contains destination rules, diagram standards, coloring requirements, and format priority.
>
> **Docs to create/update:**
> {list from @architect — path · section · diagrams_to_port · text_to_add}
>
> For each doc:
>
> 1. Read the current file if it exists
> 2. Port every mapped diagram from `solution/Architecture.md` — diagrams before any prose
> 3. Every doc MUST have at least one Mermaid high-level diagram; add drill-down diagrams for complex sections
> 4. All Mermaid diagrams MUST be colored (classDef + style directives)
> 5. Apply only settled decisions — no rationale, rejected options, or open questions
> 6. If a new file is created or renamed, update `docs/README.md`
>
> Return a one-line summary per doc written."

Once `@docs-writer` completes, present the summary to the developer:

> "Doc updates applied:
>
> - `{path}` → `{section}`: <what was added>
>
> Ready for `@architect` to review? (**yes** / **undo and revise**)"

**Stop and wait.**

---

## Step 4 — `@architect` reviews doc changes

Apply the satellite review pattern (`.claude/skills/design/pattern-satellite-review.md`). Delegate to `@architect` to review the doc changes just made:

- Read the updated doc(s)
- Verify the changes are accurate, consistent with the rest of the docs, and don't introduce contradictions or gaps
- Verify the change stays at governance altitude and hasn't drifted into a downstream project's implementation detail
- **Do not write or edit any files — return output only**
- Return: **OK** or a specific list of corrections needed

If **OK** → proceed to Step 5.

If **corrections needed** → apply the corrections, then show the developer what was changed (one line per edit) before re-delegating for one more review pass.

If still not OK after 2 iterations → report to the developer and stop:

> "`@architect` found unresolved issues with the doc update after 2 passes:
> <list of outstanding issues>
> Please review and resolve manually before continuing Publish."

---

## Step 5 — Update Report.md

Update phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Elaborate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ✅ · 📤 Publish ✅`

Set Status to `✅ Complete`.

Append to the Efforts table:

| Date         | Phase   | Notes                                           |
| ------------ | ------- | ----------------------------------------------- |
| {YYYY-MM-DD} | Publish | MR approved by {approver}; docs updated: {list} |

---

## Step 6 — Hand-off question

Read the Implementation note from `design/Report.md`'s `## Context` section. Offer option B only per that note's guidance.

Ask:

> "How do you want to proceed?
>
> **A** — Wrap up: archive the design folder
> **B** — Start `/dev` now (only if the implementation tickets target this repo's own code; archive on return)"

**Stop and wait.**

---

## Step 7 — Archive (option A only)

If option **A**: run the archive directly (do not present as a user instruction):

```bash
git mv "docs/Stories/[{TICKET}] {name}" "docs/Stories/archive/[{TICKET}] {name}"
```

Moving into `archive/` adds one directory level — any relative Markdown link inside the moved `design/*.md` or `solution/*.md` files that points back up to `docs/Target Architecture (HLD)/` (or any other ancestor path) now needs one more `../` than before. Grep the archived folder for relative links one level short of the new depth (e.g. `grep -rn '\.\./\.\./\.\./[A-Z]' "docs/Stories/archive/[{TICKET}] {name}"`) and add the missing `../` to each match. Do this before reporting the step complete — don't rely on a later docs build to catch it.

Report to the developer: "Design folder archived to `docs/Stories/archive/[{TICKET}] {name}`. Checked and fixed relative links broken by the move."

If option **B**: skip this step.

---

## Step 8 — Suggest commit

Suggest the developer commit with:

- If option **A**: `docs({TICKET}): publish — update docs, archive design folder`
- If option **B**: `docs({TICKET}): publish — update docs`

---

## Step 9 — Hand-off

**If option A:**

Say: "Design complete and archived. Implementation tickets can be tracked as `ADLC-{N}` stories — see `solution/Efforts.md` for the WBS. Read the Implementation note from `design/Report.md`'s `## Context` section for where implementation actually happens."

**If option B:**

Invoke `/dev` with the first implementation ticket key from `solution/Efforts.md`. The dev flow handles archive.
