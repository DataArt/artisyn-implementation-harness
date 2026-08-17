---
name: design-elaborate
metadata:
  version: 1.0.0
description: Elaborate phase of the design lifecycle (/design-elaborate or /design orchestrator). AC × Options matrix + WAF assessment. Produces design/02 Elaborate.md.
---

The developer wants to run the Elaborate phase of a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.

Elaborate is Phase 3 — the judgment phase. It maps ACs against options, surfaces tradeoffs across all AWS WAF pillars, makes a recommendation with explicit WHY, and runs a closing WAF assessment of the recommended option. Output: `design/02 Elaborate.md` + `Report.md` WAF section.

---

## Step 1 — Read inputs

Find the design folder by globbing `docs/Stories/*{TICKET}*/**`.

Read in full:

- `design/Report.md` — restore Assumptions recorded during Research
- `design/00 Frame.md` — ACs (both known and accepted proposed)
- `design/01 Research.md` — the options

If either Frame or Research is missing, tell the developer which phase to complete first and stop.

---

## Step 1b — Resolve viability OQs before the matrix

Read the Open Questions table in `design/01 Research.md`. Surface any OQs classified as **(V) Viability** that are still unresolved.

If any unresolved `(V)` OQs exist:

> "The following viability OQs from Research are still open and would block the matrix if left unresolved: [list]. Can you answer any of these now, or should I mark the affected option as conditional?"

**Stop and wait.** Record resolutions in `01 Research.md` before building the matrix, or mark affected options conditional.

See `.claude/skills/design/pattern-design-oq-triage.md` for the full protocol.

---

## Step 2 — Build the Requirements × Options matrix and Tradeoffs table

**Matrix:** Rows = evaluation criteria derived from the requirements and constraints in `00 Frame.md` (functional requirements, NFRs, architectural constraints, operational concerns). Columns = every option from `01 Research.md`. Cell values: ✅ (yes) · ⚠️ (partially / with caveats) · ❌ (no). Add a brief note in any ⚠️ or ❌ cell.

> **SPIKE tickets** — the requirements listed in the ticket are often meta-level documentary requirements ("assess X", "score against 5 criteria"), not technical evaluation axes. Derive the actual evaluation criteria from the named dimensions (e.g. implementation simplicity, delivery cost, infra running cost, runtime performance, stack alignment) and use those as rows.

**Tradeoffs table:** One row per option. Columns = Reliability · Security · Cost Optimisation · Operational Excellence · Performance Efficiency · Sustainability. Plus two extra columns: Integration Complexity and Vendor Lock-in. Each cell: ✅ · ⚠️ · ❌ with a one-line rationale.

---

## Step 2b — Write the draft and review in the IDE

By this point the matrix + tradeoffs are already the bulk of the draft content, and they are too large to review comfortably in the console. **Write `design/02 Elaborate.md` now** (matrix + tradeoffs, recommendation section left as a placeholder) using `.claude/skills/design/elaborate-template.md`, then point the developer to the file.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`):

> "Draft saved at `design/02 Elaborate.md` — review the Requirements × Options matrix and tradeoffs table in your IDE. Any corrections before I write the recommendation?"

**Stop and wait.** Apply corrections and re-save. Iterate until confirmed.

Only after confirmation, proceed to the recommendation (Step 4 fills the placeholder in the same file).

---

## Step 3 — Write the Recommendation

State which option is recommended and why — explicitly referencing:

- Which ACs it satisfies best (from the matrix)
- Which tradeoffs are acceptable and why (from the tradeoffs table)
- What the disqualifying factors are for the other options

The recommendation must be falsifiable: if a stated assumption later turns out wrong, the recommendation can be revisited.

Also list the **open questions** that must be resolved before implementation begins — with a suggested owner for each.

---

## Step 4 — Fill the recommendation in 02 Elaborate.md

`design/02 Elaborate.md` already exists from **Step 2b** (matrix + tradeoffs, confirmed). Fill the recommendation placeholder with the Step 4 recommendation + open questions; do not rewrite the matrix/tradeoffs unless corrections were raised.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "Recommendation written to `design/02 Elaborate.md`. Review in your IDE — does the recommendation hold? Any corrections?"

**Reiterate paths** — if the developer raises a concern:

- Missing option in the matrix → "Reiterate from Research, Step 3 — re-delegate to `@architect` with the specific gap."
- Wrong or missing AC → "Reiterate from Frame, Step 4 — re-draft the Success section."
- Tradeoff cell wrong → "Reiterate from Elaborate, Step 2 — rebuild the tradeoffs table with the correction."
- Recommendation needs revisiting after a fix → "Reiterate from Elaborate, Step 4 — restate the recommendation against the updated table."

**Stop and wait.** Apply corrections and re-save if needed. Iterate until the developer confirms.

---

## Step 4b — Resolve open questions

Once the draft is confirmed, walk through the open questions listed in Step 4's recommendation. For each:

- If the developer can answer it now → record the resolution and update `02 Elaborate.md`
- If it requires external input → note the owner and leave as open for implementation

This can be a single exchange — not one stop per question. Ask:

> "Here are the open questions from the recommendation. Which can you answer now before we move to Solution?"

**Stop and wait.** Update any resolved questions in the draft before saving.

---

## Step 5 — Run closing WAF assessment

After `02 Elaborate.md` is approved, run a WAF assessment **of the recommended option only** against all AWS Well-Architected Framework pillars.

**AWS Well-Architected Framework pillars:**

| Pillar                 | Focus                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- |
| Reliability            | Ability to recover from failures and meet demand                                 |
| Security               | Protecting data, systems, and assets through risk assessments and controls       |
| Cost Optimisation      | Avoiding unnecessary costs and maintaining cost visibility                       |
| Operational Excellence | Running and monitoring systems to deliver business value and continually improve |
| Performance Efficiency | Using computing resources efficiently as demand changes                          |
| Sustainability         | Minimising environmental impact of running cloud workloads                       |

Use RAG ratings: 🟢 Green · 🟡 Amber · 🔴 Red.

For each pillar: Strengths · Gaps · Recommendations (P1 / P2 / P3).

Present the assessment in the console for review. Apply corrections if requested.

**Stop and ask:**

> "Any corrections to the WAF assessment before I save? (**yes** / **I have corrections**)"

**Stop and wait.**

**Reiterate paths** — if a P1 gap is found that the current recommendation cannot address:

- Security or reliability gap at architecture level → "Reiterate from Elaborate, Step 4 — revisit the recommendation to address [gap]."
- Gap that requires an option not in the matrix → "Reiterate from Research, Step 3 — re-delegate to `@architect` with the specific constraint."

---

## Step 6 — Save both artifacts

**6a — 02 Elaborate.md**

Already written and confirmed in Step 5. If any corrections were made in Step 5b or Step 6, re-save now.

**6b — Add WAF block inside Report.md**

The `## WAF Assessment` section already exists in `design/Report.md` (pre-created by the template). Append a dated block **inside** that section — do not add a new `##` heading:

```markdown
### WAF — Elaborate — {YYYY-MM-DD}

_Recommended option: <option name>._

| Pillar                 | Rating   | Headline |
| ---------------------- | -------- | -------- |
| Reliability            | 🟢/🟡/🔴 | ...      |
| Security               | 🟢/🟡/🔴 | ...      |
| Cost Optimisation      | 🟢/🟡/🔴 | ...      |
| Operational Excellence | 🟢/🟡/🔴 | ...      |
| Performance Efficiency | 🟢/🟡/🔴 | ...      |
| Sustainability         | 🟢/🟡/🔴 | ...      |

**P1 items (resolve before implementation):**

- {list}

Full elaboration: `design/02 Elaborate.md`
```

---

## Step 7 — Do → Report → Commit

Apply the do→report→commit pattern (`.claude/skills/design/pattern-do-report-commit.md`):

**Report** — update `design/Report.md`:

- Phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Elaborate ✅ · 📦 Solution 🔄 · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Elaborate | Recommended <option name>; WAF: <summary of RAG ratings>; {N} P1 items |`

**Commit** — suggest:

> `docs({TICKET}): elaborate — recommend <option name>`

**Stop and wait** for the developer to confirm the commit.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.
