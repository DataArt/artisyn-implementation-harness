---
name: war-design
metadata:
  version: 0.3.1
description: WAR of Target Architecture design docs (/war-design). @architect assesses against the configured {{WAF_FRAMEWORK}} pillars. Does NOT audit code — use /war-implementation.
---

The developer wants to run a Well-Architected Review of the Target Architecture design documents for a version. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

---

## Overview

This skill audits the **Target Architecture documents** for a given version against the {{WAF_FRAMEWORK}} pillars. It assesses whether the architecture _as designed and documented_ is sound — not whether the code implements it (use `/war-implementation` for that).

The subject is `docs/Target Architecture (HLD)/{VERSION}/` — container docs, cross-cutting docs, NFRs, sizing. For implementation code audit, use `/war-implementation [VERSION]`. For a single story's design review, use `/design-review {TICKET}`.

---

## Step 1 — Determine scope

Read `docs/Target Architecture (HLD)/README.md` to find the **current active version**. Use that version for all paths — do not hardcode a version.

Parse `$ARGUMENTS`:

- If a version is given (e.g. `MVP`, `V1`): use that version instead of the active version
- If a pillar is specified (e.g. `MVP Security`, `RE`): scope the audit to that pillar only
- If no argument: use the active version, all pillars

Present to the developer:

> "Running Well-Architected Design Audit for **\<VERSION\>** — \<pillar scope or 'all pillars'\>. Confirm? (**yes** / **no**)"

Wait for confirmation.

---

## Step 2 — Read Target Architecture documents

Read all of the following for the target version. Do not ask the developer — read them directly:

**Overview & NFRs:**

- `System Overview.md`
- `Non-Functional Concerns/Requirements.md`
- `System Sizing.md`

**Containers (`Containers/`):** read all files.

**Non-Functional Concerns (`Non-Functional Concerns/`):** read all files.

Do not summarise to the developer. Proceed to Step 3.

---

## Step 3 — Assess each pillar

Using the architecture documents read in Step 2, assess each pillar in scope. The question for each pillar is: **does the architecture design adequately address this concern?** Flag gaps in the design itself — missing decisions, under-specified failure modes, unresolved trade-offs, or internal contradictions between docs.

### Pillar definitions

{{WAF_PILLARS_TABLE}}

### RAG rating

| Rating   | Meaning                                                                                     |
| -------- | ------------------------------------------------------------------------------------------- |
| 🟢 Green | Design adequately addresses this pillar — decisions made, documented, internally consistent |
| 🟡 Amber | Partially addressed — some gaps, open questions, or under-specified areas remain            |
| 🔴 Red   | Not addressed — material gap in the design that must be resolved                            |

### Output per pillar

```
### <Pillar name> — <RAG emoji + colour>

**Strengths**
- What the design gets right for this pillar (reference specific doc/section)

**Gaps**
- Specific gaps or unresolved decisions (reference the doc where the gap was found)

**Recommendations**
- P1: resolve before implementation begins
- P2: address in next design iteration
- P3: backlog / nice-to-have
```

---

## Step 4 — Present findings in console

Present the full audit in the console. Do NOT write to file yet.

After presenting, say:

> "Design audit complete. Any corrections before I save? (**yes** to save as-is / **no** to discuss changes)"

Wait for confirmation. If the developer requests changes, apply them and re-present the affected sections. Repeat until approved.

---

## Step 5 — Save the audit

Output path:

```
docs/Target Architecture (HLD)/WAR/{VERSION}/{YYYY-MM-DD}-design-audit.md
```

Create the `WAR/{VERSION}/` directory if it does not exist.

Format:

```markdown
# Well-Architected Design Audit — {VERSION}

_Assessed: {YYYY-MM-DD}. Architecture version: {VERSION}._
_Scope: all WAF pillars | <pillar name>._

---

## Summary

| Pillar     | Rating   | Headline |
| ---------- | -------- | -------- |
| <Pillar 1> | 🟢/🟡/🔴 |          |
| <Pillar 2> | 🟢/🟡/🔴 |          |

---

## Pillar Assessments

<full pillar detail>

---

## Top Recommendations

P1 items — address before implementation.

| #   | Pillar | Recommendation |
| --- | ------ | -------------- |
| 1   |        |                |

---

## Docs Reviewed

- `System Overview.md`
- `Non-Functional Concerns/Requirements.md`
- `System Sizing.md`
- `Containers/` — all files
- `Non-Functional Concerns/` — all files
```

---

## Step 6 — Confirm and close

After saving:

> "Design audit saved to `docs/Target Architecture (HLD)/WAR/{VERSION}/{date}-design-audit.md`.
>
> To re-run: `/war-design`
> To scope to one pillar: `/war-design {pillar}` (e.g. `/war-design Security`)
> To audit the implementation against this design: `/war-implementation`"
