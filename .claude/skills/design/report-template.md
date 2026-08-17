---
name: Design Report Template
description: Template for design/Report.md — the living design report, idempotency anchor, and WAF findings store
type: reference
---

# Design Report — <TICKET>: <Short Title>

## Context

_Resolved once in Frame Step 3. Every later phase reads these values instead of re-resolving them._

| Field           | Value                                        |
| --------------- | -------------------------------------------- |
| Source docs     | `docs/Target Architecture (HLD)/`            |
| Dest docs       | `docs/Target Architecture (HLD)/<subfolder>` |
| Subfolder       | <resolved subfolder/section>                 |
| Architect agent | `@architect`                                 |

## Status

| Field  | Value                                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Ticket | <TICKET>                                                                                                               |
| Status | 🔄 In Progress                                                                                                         |
| Phase  | 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Elaborate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ |

---

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |

---

## WAF Assessment

_Filled in during the Elaborate phase closing step and updated by any `/design-review` invocation._

<!-- Append dated blocks here. Each block added by Elaborate or /design-review. -->

---

## Gate

- Approver: —
- Draft MR: —
- Approved: —

---

## Efforts

| Date | Phase | Notes |
| ---- | ----- | ----- |

---

## Implementation Tickets

_Filled in during Publish after implementation tickets are created._

| Ticket | Summary |
| ------ | ------- |
