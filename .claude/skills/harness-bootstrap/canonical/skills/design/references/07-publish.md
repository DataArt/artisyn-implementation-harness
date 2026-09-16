# Publish stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics unit is
`--stage publish`. Follow its initialization/recovery, entry, wait, check, and exit
commands. When this reference is used only as a correction recipe within another
active stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`.
Publish is the final stage. It runs once Review Gate (or Address Feedback) has
recorded an approved gate.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`. When this stage is complete, the design lifecycle is closed — no router handoff needed.

## Step 1 — Verify the gate is approved

Find the story folder by globbing `docs/Stories/*{TICKET}*/design/**`. Read
`design/Report.md`'s `## Gate` section.

If `Approved:` is still `pending` or unset, tell the developer: "The design gate isn't approved yet — run `/design review-gate {TICKET}` (or `/design address-feedback {TICKET}` if there are open concerns) first." Stop.

---

## Step 2 — Doc impact identification

Delegate to `{{DESIGN_ARCHITECT_AGENT}}` (read-only — no file writes):

- Read `design/Report.md` and the paths listed in its `selected_artifacts` state;
  those paths point into the sibling `solution/` directory. Do not assume a fixed
  set of solution filenames.
- Read `design/Report.md` WAF section (P1 items)
- Read the relevant docs under `{{DESIGN_DOCS_ROOT}}` for the subfolder(s) this design touches
- Return: a list of specific `{{DESIGN_DOCS_ROOT}}` docs that need creating or updating, with the exact section and what settled decision to add or change — no rationale, no rejected options, no open questions (Certainty principle)
- **Do not write or edit any files — return output only**

Present `{{DESIGN_ARCHITECT_AGENT}}`'s findings to the developer:

> "Here's what needs updating in `{{DESIGN_DOCS_ROOT}}`:
>
> - `{path}` → `{section}`: <what to add or change>
>
> Confirm to proceed with updates? (**yes** / **adjust**)"

This is a sign-off gate (`patterns/approval-sign-off.md`). **Stop and wait.**

---

## Step 3 — Apply doc updates

Read `{{DOC_PRINCIPLES_ARTICLE}}` before writing anything. For each destination,
also apply the matching Engineering Guide intent: `03 HLD Intent.md` for HLD
containers, `04 LLD Intent.md` for LLD component details, and `05 NFR Intent.md`
for NFR requirements and acceptance evidence. Tell `@docs-writer` which intent
applies to each path and require the resulting section to satisfy that intent.

Use `solution/Architecture.md` as the source for the complete published solution.
Port its settled decisions and end-to-end flows; treat the other selected solution
artifacts as supporting detail and flag any conflict before publishing.

Delegate to `@docs-writer` with the classified list from Step 2:

> "You are writing permanent documentation for design ticket {TICKET}. Read `{{DOC_PRINCIPLES_ARTICLE}}` before writing anything — it contains destination rules, diagram standards, coloring requirements, and format priority.
>
> **Docs to create/update:**
> {list from {{DESIGN_ARCHITECT_AGENT}} — path · section · diagrams_to_port (only when needed) · text_to_add}
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
>
> Return a one-line summary per doc written."

Once `@docs-writer` completes, present the summary to the developer:

> "Doc updates applied:
>
> - `{path}` → `{section}`: <what was added>
>
> Ready for `{{DESIGN_ARCHITECT_AGENT}}` to review? (**yes** / **undo and revise**)"

This is a sign-off gate (`patterns/approval-sign-off.md`). **Stop and wait.**

---

## Step 4 — `{{DESIGN_ARCHITECT_AGENT}}` reviews doc changes

Apply the satellite review pattern (`.claude/skills/design/patterns/satellite-review.md`). Delegate to `{{DESIGN_ARCHITECT_AGENT}}` to review the doc changes just made:

- Read the updated doc(s)
- Verify the changes are accurate, consistent with the rest of the docs, and don't introduce contradictions or gaps
- Verify the change stays at governance altitude and hasn't drifted into a downstream project's implementation detail
- **Do not write or edit any files — return output only**
- Return: **OK** or a specific list of corrections needed

If **OK** → proceed to Step 5.

If **corrections needed** → apply the corrections, then show the developer what was changed (one line per edit) before re-delegating for one more review pass.

If still not OK after 2 iterations → report to the developer and stop:

> "`{{DESIGN_ARCHITECT_AGENT}}` found unresolved issues with the doc update after 2 passes:
> <list of outstanding issues>
> Please review and resolve manually before continuing Publish."

---

## Step 5 — Update Report.md

Update phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ✅ · 📤 Publish ✅`

Set Status to `✅ Complete`.

Append to the Efforts table:

| Date         | Phase   | Notes                                           |
| ------------ | ------- | ----------------------------------------------- |
| {YYYY-MM-DD} | Publish | MR approved by {approver}; docs updated: {list} |

---

## Step 6 — Wrap-up question (single stop)

{{DESIGN_HANDOFF_NOTE}}

The permanent docs are updated and reviewed — this is the **only remaining stop**
in the lifecycle. Ask both closing questions in one message:

> "Permanent docs are updated and reviewed. One thing to wrap up: publish the {N} implementation tickets from `solution/Efforts.md` to the tracker? (**yes** / **no**)
>
> Then I'll finish up: archive the story, sync the tracker, and hand you the final commit."

This is a sign-off gate (`patterns/approval-sign-off.md`). **Stop and wait.** Record the wait per the metrics pattern. Once answered, run
Steps 7–10 straight through with no further stops.

---

## Step 7 — Publish implementation tickets (if yes)

If the developer said **yes**: delegate to `@scrum-master` with the approved WBS
from `solution/Efforts.md` — summaries, types, layer, and dependency links. Report
the created ticket keys in one line.

If **no**: record in `design/Report.md` that implementation tickets were not published.

---

## Step 8 — Archive

Run the archive directly (do not present as a user instruction):

```bash
git mv "docs/Stories/[{TICKET}] {name}" "docs/Stories/archive/[{TICKET}] {name}"
```

Moving into `archive/` adds one directory level — any relative Markdown link inside the moved `design/*.md` or `solution/*.md` files that points back up to `{{DESIGN_DOCS_ROOT}}` (or any other ancestor path) now needs one more `../` than before. Grep the archived folder for relative links one level short of the new depth (e.g. `grep -rn '\.\./\.\./\.\./[A-Z]' "docs/Stories/archive/[{TICKET}] {name}"`) and add the missing `../` to each match. Do this before reporting the step complete — don't rely on a later docs build to catch it.

Report to the developer: "Design folder archived to `docs/Stories/archive/[{TICKET}] {name}`. Checked and fixed relative links broken by the move."

---

## Step 9 — Tracker sync

Derive the worklog effort from the design metrics: total observed work time in `design/stat.json` (via the `report` output), rounded to a sensible worklog unit. Delegate to `@scrum-master`: log the worklog with that effort, then transition `{TICKET}` to Done — or ask which status only if the ticket's workflow offers alternatives. Report the outcome in one line, naming the logged effort and its source.

---

Before close-out, after all required work and tracker sync succeed, run
`stage complete --stage publish`, `complete`, and `report` using the current design
directory (the archived path). Record actual Design approval evidence before
completion, including when Publish was invoked directly.

## Step 10 — Close-out

End the session with a single message — status summary plus the suggested commit,
nothing further to answer:

> "Design complete. Story archived to `docs/Stories/archive/[{TICKET}] {name}`; implementation tickets: {created keys / skipped}; {TICKET} synced ({worklog}, Done).
>
> Suggested commit: `docs({TICKET}): publish — update docs, sync tracker, archive design folder`"
