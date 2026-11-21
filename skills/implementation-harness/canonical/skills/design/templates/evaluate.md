---
name: Design Evaluate Template
description: Template for 02 Evaluate.md — Phase 3 output with Requirements × Options matrix, tradeoffs, and recommendation
type: reference
---

<!-- The new doc's frontmatter: put this block, without the fences, in place of the template meta above. -->

```yaml
---
type: Design Evaluation
title: <title of the new doc>
description: <one line, what this doc is for>
tags: [<tag>, <tag>]
generated: { by: process:design-evaluate, at: <UTC now, e.g. 2026-11-18T10:00:00Z> }
updated: { by: process:design-evaluate, at: <same as generated> }
---
```

# <TICKET>: <Short Title> — Evaluate

_Produced by the 🏗 Evaluate phase. This is the judgment artifact. WAF assessment lives in `design/Report.md`._

## Requirements × Options Matrix

Rows = evaluation criteria from `design/00 Frame.md` (functional requirements, NFRs, constraints). Columns = options from `design/01 Research.md`.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement | Option A | Option B | Option C |
| ----------- | -------- | -------- | -------- |
| R1: ...     | ✅       | ⚠️ note  | ❌       |
| R2: ...     |          |          |          |

## Tradeoffs

| Dimension | Option A | Option B | Option C |
| --------- | -------- | -------- | -------- |

{{WAF_PILLAR_ROWS}}
| Integration Complexity | | | |
| Vendor Lock-in | | | |

## Recommendation

**Recommended option: Option X — <Name>**

<Why this option. Reference the Requirements matrix (which requirements it satisfies best) and the tradeoffs table (which trade-offs are acceptable and why). State what the disqualifying factors are for the other options.>

**Open questions to resolve before implementation:**

| #    | Question | Owner | Impact if unresolved  |
| ---- | -------- | ----- | --------------------- |
| OQ-1 | ...      | ...   | Blocks implementation |
