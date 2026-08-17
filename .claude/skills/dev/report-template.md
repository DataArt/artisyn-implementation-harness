---
name: Dev Report Template
description: Template for 2-report.md — the living implementation report created by /dev-plan and updated throughout the dev lifecycle
type: reference
---

# <TICKET>: <Short Title> — Report

| Field  | Value                                                      |
| ------ | ---------------------------------------------------------- |
| Ticket | ADLC-XX                                                    |
| Branch | `feat/ADLC-XX-slug`                                        |
| PR     | —                                                          |
| Author | _from `git config user.name`_                              |
| Status | 🔄 In Progress                                             |
| Phase  | 📋 Plan 🔄 · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳ |

## Progress

| #   | Step         | Status     | Notes | Test | Docs |
| --- | ------------ | ---------- | ----- | ---- | ---- |
| 1   | _Step title_ | ⏳ Pending |       |      |      |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Architecture Deviations

| #   | Deviation | Justification |
| --- | --------- | ------------- |

<!--
Populated by /dev-plan Step 7b if any justified deviations were approved.
Leave empty if no deviations — do not remove the section.
Each deviation must be addressed in the Document phase: Target Architecture updated or a tech debt ticket created.
-->

## Implementation Notes

_Added for every step — a brief confirmation for smooth steps, detailed notes for surprises, workarounds, or decisions made._

## Tech Debt

| #   | Description | Type | Ticket |
| --- | ----------- | ---- | ------ |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Ticket: fill in internal ticket number (e.g. ADLC-XX), otherwise —
Rows are added here by /dev-implement (Step 3b) as debt is discovered.
-->

## Efforts Spent

| Date | Phase | Human time | AI tokens | Notes |
| ---- | ----- | ---------- | --------- | ----- |
