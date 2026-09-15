---
name: Design Evaluate Template
description: Template for 02 Evaluate.md — Phase 3 output with Requirements × Options matrix, tradeoffs, and recommendation
type: reference
---

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

| Operational Excellence | | | |
| Security | | | |
| Reliability | | | |
| Performance Efficiency | | | |
| Cost Optimization | | | |
| Sustainability | | | |
| Integration Complexity | | | |
| Vendor Lock-in | | | |

## Recommendation

**Recommended option: Option X — <Name>**

<Why this option. Reference the Requirements matrix (which requirements it satisfies best) and the tradeoffs table (which trade-offs are acceptable and why). State what the disqualifying factors are for the other options.>

**Open questions to resolve before implementation:**

| #    | Question | Owner | Impact if unresolved  |
| ---- | -------- | ----- | --------------------- |
| OQ-1 | ...      | ...   | Blocks implementation |
