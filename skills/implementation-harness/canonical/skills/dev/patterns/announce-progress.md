# Pattern: Announce Progress

At every transition point — step done, doc item done, phase boundary — say in a
few lines what just finished and what comes next. The developer should always be
able to tell where the lifecycle is without asking.

## Format

```
✅ Done: <one-line summary of what just completed>
🔜 Next in this phase: <remaining items, numbered>
📋 After this phase: <next stage(s)>
```

Omit the "After this phase" line unless this was the last item in the phase.

## When to emit

- After each implementation step's checkpoint (`references/04-implement.md`)
- After each documentation item (`references/06-document.md`)
- At every phase handoff: Context → Ceremony → Plan → Implement → Test → Document → Completion
- At the very end, Completion's closing message says the ticket is finished

## Why

The developer loses track mid-session, especially after several steps or a
tangent. One short announcement per unit lets them spot a skipped or reordered
item before the next one starts, and makes "is it finished?" a question that never
needs asking.
