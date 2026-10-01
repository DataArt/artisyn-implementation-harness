# Delivery Gap Report — {{VERSION}}

_Generated: {{YYYY-MM-DD}}_

---

## Summary

{{2–3 sentence narrative: overall delivery posture, dominant gap type, most critical gaps}}

---

## Gap Matrix

| Container                                               | Designed (HLD) | Implemented (code) | Documented (LLD) | Gap |
| ------------------------------------------------------- | -------------- | ------------------ | ---------------- | --- |
| {{one row per container discovered from HLD in Step 2}} |                |                    |                  |     |

**Gap key:**

- **LLD missing** — designed and implemented but not documented → documentation debt
- **Not yet built** — designed but no implementation exists → delivery debt
- **In progress** — partial implementation → in-flight
- **Design debt** — HLD has significant open questions or TBD sections
- **—** — fully covered across all three dimensions

---

## Delivery Debt

Containers designed but not yet implemented (or only stubbed):

{{list — one entry per container, describe what is missing and why it matters}}

---

## Documentation Debt

Containers implemented but with empty or partial LLD coverage:

{{list — one entry per container, describe what would be most valuable to capture}}

---

## Design Debt

HLD containers with significant open questions or TBD sections:

{{list — one entry per container, describe what needs to be resolved and what is blocked on it}}

---

## Recommended Next Actions

| Priority | Action     | Command                                                                              |
| -------- | ---------- | ------------------------------------------------------------------------------------ |
| P1       | {{action}} | `/dev document <TICKET>` or `/design <TICKET>` |
| P2       | {{action}} |                                                                                      |
| P3       | {{action}} |                                                                                      |
