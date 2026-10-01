---
name: Dev Plan Template
description: Template for 1-plan.md — the immutable implementation plan created by /dev plan. Strict structure; the intent it implements lives in 0-intent.md and is linked, not repeated.
type: reference
---

# <TICKET>: <Short Title> — Plan

| Field   | Value                          |
| ------- | ------------------------------ |
| Ticket  | ND-XX             |
| Intent  | [0-intent.md](0-intent.md)     |
| Branch  | `feat/ND-XX-slug` |
| Created | YYYY-MM-DD                     |

<!--
Do not repeat the problem, outcome, scope or constraints here. They live in
0-intent.md (see interfaces/intent.md). This document answers one question: how.
-->

## Solution

<One short paragraph: the approach and why it fits the intent and the architecture.
Name the HLD container(s) touched and anything reused.>

```mermaid
%% Required when the plan changes how things are wired together (network topology,
%% service-to-service routing, container boundaries, data flow) or when "what talks
%% to what" is not obvious from the step list. Show the TARGET state, coloured per
%% Documentation/01 Principles.md. Delete this block when a diagram adds nothing.
flowchart LR
    A["Component A"]:::changed --> B["Component B"]:::existing
    classDef changed fill:#176B54,stroke:#104D3C,color:#fff
    classDef existing fill:#2C3E50,stroke:#1A252F,color:#fff
```

<!--
Optional: decisions taken while planning, one line each (choice, reason). Approved
deviations from the HLD are RF rows in 2-report.md, referenced here by ID, never a
second table.
-->

## Acceptance Criteria

<!--
Sprint contract — agreed before implementation starts. Derived from the intent's
outcome and boundaries plus tracker ACs. Each item must be checkable by the Test
stage with a command, curl, log output or a UI action. Do not change after approval.
-->

- [ ] `<AC-1>` — <what to observe and where>
- [ ] `<AC-2>` — <what to observe and where>

## Dependencies

<!--
Optional — omit this section if there are none.
Tickets, PRs or external preconditions that must be resolved before this plan runs.
-->

- ND-XX must be merged first

## Steps

<!-- Step 1 writes the tests by default when the project has a test setup for the
touched layers: one case per testable acceptance criterion, in the existing framework.
Skipping it needs a stated reason (no setup for this layer, config/infra change proven
by a live check, one-line fix covered by an existing case). Keep the heading below and
replace the body, or replace it with "Step 1 — Tests: skipped because <reason>".
-->

### Step 1 — Tests: <what the cases cover>

**Changes:**

- `<project test location>` — new cases for `<AC-1>`, `<AC-2>`; type: `<unit / integration / e2e / ...>`, framework: `<existing one>`

**Verification:**

> Run: `<test command>`
> Expected: suite runs; new cases fail for the expected reason (`<assertion>`), nothing else breaks

### Step N — <Layer>: <What>

**Changes:**

- `<test location>` — only if this step needs cases Step 1 could not write yet
- `path/to/file.ts` — what changes and why

**Verification:**

> Run: `<command>`
> Expected: `<what to see>` — including relevant tests passing, where applicable
>
> Or: open `<URL>` and confirm `<what>`

Run required verification before dependent steps; request human verification only when needed.
