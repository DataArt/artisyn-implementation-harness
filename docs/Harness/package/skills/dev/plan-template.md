---
name: Dev Plan Template
description: Template for 1-plan.md — the immutable implementation plan created by /dev-plan
type: reference
---

# <TICKET>: <Short Title>

| Field   | Value                          |
| ------- | ------------------------------ |
| Ticket  | {{PROJECT_KEY}}-XX             |
| Branch  | `feat/{{PROJECT_KEY}}-XX-slug` |
| Created | YYYY-MM-DD                     |

## Problem

<One paragraph — what needs to be built or fixed and why.>

## Scope

**In scope:** ...
**Out of scope:** ...

## Acceptance Criteria

<!--
Sprint contract — agreed before implementation starts.
Each item must be checkable by the evaluator (dev-test) using tools, curl, or UI.
Derived from Jira ACs + developer input. Do not change after plan is approved.
-->

- [ ] `<AC-1>` — <what to observe and where>
- [ ] `<AC-2>` — <what to observe and where>

## Dependencies

<!--
Optional — omit this section if there are none.
List tickets, PRs, or external preconditions that must be resolved before this plan can be executed.
-->

- {{PROJECT_KEY}}-XX must be merged first

## Steps

### Step N — <Layer>: <What>

**Changes:**

- `path/to/file.ts` — what changes and why

**Verification:**

> Run: `<command>`
> Expected: `<what to see>`
>
> Or: open `<URL>` and confirm `<what>`

⚠️ **Stop here. Verify this step before proceeding to Step N+1.**
