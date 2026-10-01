---
name: Dev Plan Template
description: Template for 1-plan.md — the immutable implementation plan created by /dev plan
type: reference
---

# <TICKET>: <Short Title>

| Field   | Value             |
| ------- | ----------------- |
| Ticket  | ND-XX             |
| Branch  | `feat/ND-XX-slug` |
| Created | YYYY-MM-DD        |

## Problem

<One paragraph — what needs to be built or fixed and why.>

## Scope

**In scope:** ...
**Out of scope:** ...

## Acceptance Criteria

<!--
Sprint contract — agreed before implementation starts.
Each item must be checkable by the evaluator (dev-test) using tools, curl, or UI.
Derived from tracker ACs + developer input. Do not change after plan is approved.
-->

- [ ] `<AC-1>` — <what to observe and where>
- [ ] `<AC-2>` — <what to observe and where>

## Dependencies

<!--
Optional — omit this section if there are none.
List tickets, PRs, or external preconditions that must be resolved before this plan can be executed.
-->

- ND-XX must be merged first

## Steps

<!-- Choose tests only where useful for this work and supported by project setup:
unit, integration, end-to-end, contract, load/performance, infra checks, or another
relevant type. State why it fits; if no new tests make sense, record why and the
alternative verification. No mandatory test-writing Step 1 or TDD requirement.
When using test-first work, keep red → implementation → green within a logical step.
-->

### Step N — <Layer>: <What>

**Changes:**

- `<project-appropriate test location>` — new/updated tests if useful; choose the type and convention from the work and existing setup
- `path/to/file.ts` — what changes and why

**Verification:**

> Run: `<command>`
> Expected: `<what to see>` — including relevant tests passing, where applicable
>
> Or: open `<URL>` and confirm `<what>`

Run required verification before dependent steps; request human verification only when needed.
