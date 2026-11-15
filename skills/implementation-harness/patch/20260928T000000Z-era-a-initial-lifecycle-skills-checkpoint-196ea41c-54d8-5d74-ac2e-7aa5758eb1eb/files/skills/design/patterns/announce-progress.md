# Pattern: Announce Progress (Design)

At every phase boundary, emit a short progress announcement so the developer can see what completed and what comes next.

## Format

```
✅ Done: <one-line summary of what just completed>
📋 After this phase: <remaining phases in order>
```

## When to emit

- At every phase handoff in the design orchestrator (`design/SKILL.md`)
- At the end of every phase, after `do-report-commit.md`'s commit is confirmed

## Why

Design sessions span multiple phases across multiple sessions. Without a visible progress announcement at each boundary, it is easy to lose track of what has been completed and what remains — especially when resuming after a break or a tangent.
