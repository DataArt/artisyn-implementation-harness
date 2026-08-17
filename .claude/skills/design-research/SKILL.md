---
name: design-research
metadata:
  version: 1.0.0
description: Research phase of the design lifecycle (/design-research or /design orchestrator). Delegates to @architect, produces design/01 Research.md.
---

The developer wants to run the Research phase of a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.

Research is Phase 2 of the design lifecycle. It produces a neutral, exhaustive options list — 3 to 5 alternatives with industry references. **No recommendation is made here.** Judgment lives in Phase 3 (Elaborate). Output: `design/01 Research.md`.

---

## Step 1 — Find the design folder and read Frame

Glob for `docs/Stories/*{TICKET}*/**`. Derive the folder path from the first matched file.

Read:

- `design/00 Frame.md` — the authoritative problem statement and requirements
- `design/Report.md` — session context (including the target subfolder from Frame)

If `design/00 Frame.md` does not exist, tell the developer that Frame must be completed first and stop.

**Multi-decision check:** if Frame implies two or more independent decisions, apply `.claude/skills/design/pattern-multi-decision-split.md` — loop this phase once per decision, producing `01 Research - {Decision}.md` for each.

---

## Step 2 — Read context

Read relevant docs under the resolved Source docs path (from `design/Report.md`'s `## Context` section), across its existing subfolders, for anything already established on this topic.

This read is for context priming only — do not begin research yet.

---

## Step 2b — Context validation

Present the combined context to the developer before delegating to `@architect`:

> "Here's what I'm working from for `{TICKET}`:
>
> - **Ticket**: `<summary from 00 Frame.md>`
> - **Context sources**: `<one-line summary of relevant docs and any constraints or decisions already established>`
>
> Anything missing, incorrect, or out of scope before I begin research?"

**Stop and wait.** Apply any corrections to the context before proceeding.

---

## Step 3 — Delegate to `@architect` for options research

Delegate to `@architect` with **explicit constraints**:

- Read relevant context docs under `docs/Target Architecture (HLD)/`
- Produce **3 to 5 distinct options** — include at least one "do nothing / minimal change" option if valid, and at least one industry-standard approach
- For each option: description, pros, cons, unknowns/risks, at least one industry reference or precedent, and a **colored Mermaid diagram** illustrating the approach (use `classDef` with fill/stroke/color — no default-grey diagrams)
- **Do not make a recommendation** — that is Phase 3's job
- Surface open questions that would block elaboration if left unanswered
- **Do not write or edit any files — return output only**

Once `@architect` returns, present the options output directly in the console.

**Stop and ask:**

> "Here's what `@architect` found. Does this cover all the options you want evaluated? Any gaps, missing options, or corrections before I draft `01 Research.md`?"

**Reiterate paths** — if the developer raises a concern:

- Option set incomplete → "Reiterate from Research, Step 3 — re-delegate to `@architect` with the specific gap: [gap]."
- Requirements scope has changed (new constraint discovered during research) → "Reiterate from Frame, Step 4 — re-draft the Problem/Boundaries/Proposed requirements to capture the new constraint."

If additional options are needed, re-delegate to `@architect` with the specific gap. Iterate until satisfied.

---

## Step 3b — OQ triage

OQ triage is a **distinct, separate prompt** — never bundle it into the Step 3 "are the options complete?" confirmation. Even when `@architect`'s output is long, present OQ classification as its own numbered round after option confirmation.

After the options are confirmed, present the open questions surfaced by `@architect` and ask the developer to classify each:

> "Here are the open questions from research. Classify each as **(V) Viability** — would the answer disqualify one or more options — or **(E) Elaboration-input** — affects cost/detail but not which options survive."

**Stop and wait.** Record the classification next to each OQ in `01 Research.md`.

See `.claude/skills/design/pattern-design-oq-triage.md` for the full two-tier protocol and resolution rules.

**Persist the result as Assumptions.** Once triage completes, the answered/classified OQs are a design artifact — not ephemeral conversation. Fill in the **existing** `## Assumptions` section in `design/Report.md` (pre-created by the report template — do not add a new `##` heading). Record the full OQ table (question, V/E, answer/status). Without this, Elaborate starts with no written record of what was already decided.

```markdown
_From Research OQ triage ({YYYY-MM-DD})._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |
| 1   | {question}    | (V) | {answer}        |
```

---

## Step 4 — Save and review 01 Research.md

Write `design/01 Research.md` using `.claude/skills/design/research-template.md`, populated with the confirmed options and OQ classifications.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "File saved at `design/01 Research.md`. Review in your IDE — does the structure capture the options and OQ classifications correctly? Any corrections?"

**Stop and wait.** Apply corrections and re-save if needed. Iterate until the developer confirms.

---

## Step 5 — Do → Report → Commit

Apply the do→report→commit pattern (`.claude/skills/design/pattern-do-report-commit.md`):

**Report** — update `design/Report.md`:

- Phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Elaborate 🔄 · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Research | @architect returned {N} options (<option names>); developer confirmed set complete |`

**Commit** — suggest:

> `docs({TICKET}): research — {N} options evaluated`

**Stop and wait** for the developer to confirm the commit.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.
