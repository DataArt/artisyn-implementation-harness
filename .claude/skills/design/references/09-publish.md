# Publish stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics unit is
`--stage publish`. First action, at Step 1: `stage start --stage publish`. Follow
the pattern's wait, check, and exit commands for everything after. When this
reference is used only as a correction recipe within another active stage,
retain that stage's metrics ownership.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`.
Publish updates the permanent docs. It runs once Review Gate (or Address
Feedback) has recorded an approved gate, and hands off to Completion
(`references/10-completion.md`) for archiving, tracker sync, and the final PR.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`.

## Step 1 — Verify the gate is approved

`$DESIGN_DIR` comes from the router's Resume Detection. Read `design/Report.md`'s
`## Gate` section.

If `Approved:` is still `pending` or unset, tell the developer: "The design gate isn't approved yet — run `/design review-gate {TICKET}` (or `/design address-feedback {TICKET}` if there are open concerns) first." Stop.

---

## Step 2 — Doc impact identification

Before delegating, attempt yourself: `node docs/.og/cli.mjs search --term
<text>` (or `query --related-to <doc>`) against
`docs/.og/docs-operational-graph.sqlite` for docs related to this design
beyond what `design/Report.md` already names. Required (not best-effort):
when the graph is missing, stale (see `references/reindex-graph.md`'s Staleness check), or the call errors, fall back to grep/glob
over `{dest docs}` for the same information — either way, never let this
block the stage. This runs here, not inside the delegation below:
`{resolved architect agent}` can resolve to a read-only agent with no shell
access (`@product-architect` on the Product track), so the query must be the
orchestrator's own step, with whatever it surfaces folded into the
delegation's context.

Delegate to `{resolved architect agent}` (read-only — no file writes):

- Read `design/Report.md` and the paths listed in its `selected_artifacts` state;
  those paths point into the sibling `solution/` directory. Do not assume a fixed
  set of solution filenames.
- Read `design/Report.md` WAF section (P1 items)
- Read the relevant docs under `{dest docs}` for the subfolder(s) this design touches, plus whatever the graph query above surfaced
- Return: a list of specific `{dest docs}` docs that need creating or updating, with the exact section and what settled decision to add or change — no rationale, no rejected options, no open questions (Certainty principle)
- **Do not write or edit any files — return output only**

This is an intelligent-approval checkpoint (`patterns/approval-intelligent.md`).
Auto-approval condition: every row names a specific doc, section, and change
with no judgment call about scope — nothing ambiguous about what "settled
decision" it traces to.

Condition met → note the list in one line and continue to Step 3 without
asking; the full list is still shown at Step 5's sign-off for the record.

A row is ambiguous (ties to no clear settled decision, or the scope is a
judgment call) → this is a sign-off gate (`patterns/approval-sign-off.md`):

> "Here's what needs updating in `{dest docs}`:
>
> - `{path}` → `{section}`: <what to add or change>
>
> Confirm to proceed with updates? (**yes** / **adjust**)"

**Stop and wait.**

---

## Step 3 — Apply doc updates

Read `docs/Engineering Guide/Documentation/01 Principles.md` before writing anything. For each destination,
also apply the matching Engineering Guide intent: `03 HLD Intent.md` for HLD
containers, `04 LLD Intent.md` for LLD component details, and `05 NFR Intent.md`
for NFR requirements and acceptance evidence. Tell `@docs-writer` which intent
applies to each path and require the resulting section to satisfy that intent.

Use `solution/Architecture.md` as the source for the complete published solution.
Port its settled decisions and end-to-end flows; treat the other selected solution
artifacts as supporting detail and flag any conflict before publishing.

Delegate to `@docs-writer` with the classified list from Step 2:

> "You are writing permanent documentation for design ticket {TICKET}. Read `docs/Engineering Guide/Documentation/01 Principles.md` before writing anything — it contains destination rules, diagram standards, coloring requirements, and format priority.
>
> **Docs to create/update:**
> {list from {resolved architect agent} — path · section · diagrams_to_port (only when needed) · text_to_add}
>
> For each doc:
>
> 1. Read the current file if it exists
> 2. Port only the diagrams explicitly mapped for that destination from
>    `solution/Architecture.md`; place a ported diagram before related prose.
> 3. Add a diagram only when the destination's applicable HLD/LLD/NFR intent or the
>    mapped change requires one; do not manufacture diagrams for simple text updates.
> 4. All Mermaid diagrams MUST be colored (classDef + style directives)
> 5. Apply only settled decisions — no rationale, rejected options, or open questions
> 6. If a new file is created or renamed, update `docs/README.md`
> 7. Ensure frontmatter `purpose:` (one line, what the doc is for) and
>    `keywords:` (a short list) are present and accurate, written from your own
>    understanding of the doc's actual content. Unlike `id` (assigned once,
>    never reassigned), these two are editable — update either when the doc's
>    content changed enough that the existing value no longer fits
>
> Return a one-line summary per doc written."

Once `@docs-writer` completes, note the summary (one line per doc) and continue
straight to Step 4 — the developer reviews it, with the architect's verdict,
at Step 5's single sign-off, not here.

For each doc written, call
`node docs/.og/cli.mjs index --dir . --doc <source-path> --edge <type> --to
<destination-path>` automatically — edge direction is source-first, matching the
edge-type names: `<source-path>` is `solution/Architecture.md` (the Story's
settled solution), `<destination-path>` is the doc just written (the
HLD/Product-track file from Step 3's list above); `<type>` is `story-to-hld` for a
Project-track publish, `story-to-product` for a Product-track publish. `--to`'s
target must already be indexed (it errors otherwise); if the destination doc is
new, index it with a plain `index --doc <destination-path>` call first, then this
one. Non-blocking: on failure, report it in one line and continue — never stop
the stage for this.

---

## Step 4 — `{resolved architect agent}` reviews doc changes

Apply the satellite review pattern (`.claude/skills/design/patterns/satellite-review.md`). Delegate to `{resolved architect agent}` to review the doc changes just made:

- Read the updated doc(s)
- Verify the changes are accurate, consistent with the rest of the docs, and don't introduce contradictions or gaps
- Verify the change stays at governance altitude and hasn't drifted into a downstream project's implementation detail
- **Do not write or edit any files — return output only**
- Return: **OK** or a specific list of corrections needed

If **OK** → proceed to Step 5.

If **corrections needed** → apply the corrections, then show the developer what was changed (one line per edit) before re-delegating for one more review pass.

If still not OK after 2 iterations → report to the developer and stop:

> "`{resolved architect agent}` found unresolved issues with the doc update after 2 passes:
> <list of outstanding issues>
> Please review and resolve manually before continuing Publish."

---

## Step 5 — Sign-off

Apply `patterns/phase-sign-off.md`. Present the doc-impact list from Step 2 and
what was written, and the architect's verdict from Step 4:

> "Permanent docs are updated and reviewed: {list from Step 2, `{resolved architect agent}` OK}. Good to go, or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting publish sign-off"`.
**Stop and wait.** On approval, record the acceptance check
(`--name "Publish sign-off"`, `--source developer`); without it `stage complete`
is refused.

Rework: apply the corrections, re-delegate to `{resolved architect agent}` (Step 4), present again.

## Step 6 — Report

Update `design/Report.md`:

- Phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ✅ · 📤 Publish ✅ · 🏁 Completion 🔄`
- Append to Efforts table: `| {YYYY-MM-DD} | Publish | MR approved by {approver}; docs updated: {list} |`

Then metrics `report`.

## Step 7 — Commit

Propose:

> `docs({TICKET}): publish, update permanent docs`

This is a manual-operation sign-off (`patterns/approval-sign-off.md`) — the
developer runs the commit, never you. `wait start --reason user_input`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists
and the worktree holds nothing from this phase. If not, say what is missing and
wait again. Then `stage complete --stage publish`.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the router from the next stage (Completion).
