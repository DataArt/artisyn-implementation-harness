---
name: Design Elaborate Template
description: Template for 02 Elaborate.md — Phase 3 output with Requirements × Options matrix, tradeoffs, and recommendation
type: reference
---

# <TICKET>: <Short Title> — Elaborate

_Produced by the 🏗 Elaborate phase. This is the judgment artifact. WAF assessment lives in `Report.md`._

## Requirements × Options Matrix

Rows = evaluation criteria from `00 Frame.md` (functional requirements, NFRs, constraints). Columns = options from `01 Research.md`.  
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
