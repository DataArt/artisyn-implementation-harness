# Pattern: Announce Progress

At every transition point — step complete, doc item complete, or phase boundary — emit a short progress announcement so the developer can verify nothing was skipped and know what comes next.

## Format

```
✅ Done: <one-line summary of what just completed>
🔜 Next in this phase: <remaining items, numbered>
📋 After this phase: <next stage(s)>
```

Omit the "After this phase" line if the current item is not the last one in the phase. Emit it at the final step/item of a phase.

## When to emit

- After verification completes each implementation step (`references/04-implement.md`)
- After completing each documentation item (`references/06-document.md`)
- At every phase handoff in the dev router (Context Gathering → Ceremony → Plan → Implement → Test → Document)

## Why

The developer loses track of scope mid-session — especially after multiple steps or after returning from a tangent. A one-line announcement after each completed unit lets them spot omissions, reordering, or scope drift before the next unit starts.
