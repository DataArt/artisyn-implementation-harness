---
name: Design OQ Triage Protocol
description: Two-tier classification of open questions from Research — viability OQs answered before Elaborate matrix is built; elaboration-input OQs deferred
type: reference
---

# Design OQ Triage Protocol

Open questions (OQs) surfaced during Research fall into two tiers that determine when they must be answered.

## Two Tiers

| Tier                  | Label | Definition                                                                                                                            | When to resolve                                                 |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Viability**         | `(V)` | Would the answer disqualify one or more options from the matrix? (e.g. legal gate, hard network constraint, missing required feature) | **Before** the Elaborate matrix is built                        |
| **Elaboration-input** | `(E)` | Affects cost modelling, sizing, or implementation detail — does not change which options are viable                                   | Defer to Elaborate Step 5b or capture as implementation tickets |

## Interaction format

OQ triage must be an interactive Q&A loop — not a batch form:

1. **Show the full list upfront** so the developer sees the scope.
2. **Ask each OQ one at a time** — present the question, wait for the answer.
3. **If the answer is ambiguous**, ask a clarifying follow-up before recording the classification and moving on.
4. **Only proceed to the next OQ** once the current one is fully resolved (classification recorded + answer noted if `(V)`).

Do not dump all OQs in a table and ask the developer to classify them simultaneously. That is a form, not a triage session — it produces shallow answers and misses nuance.

## Rules

1. At the end of Research Step 3 (after options are approved), present the OQ list and ask the developer to classify each as `(V)` or `(E)` using the interactive loop above.
2. Answer all `(V)` OQs before saving `01 Research.md`. If a `(V)` OQ cannot be answered now, either eliminate the affected option or mark it as conditional.
3. At the start of Elaborate (Step 1b), re-read the OQ list. If any unresolved `(V)` OQs remain, surface and resolve before building the matrix.
4. In Solution, re-check whether any `(V)` OQs from Elaborate are still open. If any remain unresolved and would block implementation, create a spike ticket for them in `Efforts.md`.
5. Capture `(E)` OQs in `01 Research.md`'s Open Questions table with `(E)` prefix — they become Elaborate Step 5b inputs.

## Why

When many OQs surface during Research and the recommendation is written before viability-blocking OQs are resolved, the recommendation must be revised mid-Elaborate once the blockers surface. Tiering OQs at Research — enforcing that `(V)` OQs are resolved before the matrix is built, and triaging one-at-a-time rather than as a batch form — prevents this rework.
