# Pattern: Announce Progress

At every transition point — an intelligent checkpoint auto-approving, a phase
boundary — say in a few lines what just finished and what comes next. The
developer should always be able to tell where the lifecycle is without asking.

## Format

```
✅ Done: <one-line summary of what just completed>
📋 After this phase: <remaining phases in order>
```

Omit the "After this phase" line for an in-phase checkpoint; use it only at a
phase boundary.

## When to emit

- After an intelligent checkpoint auto-approves (one line: what was checked, why
  it qualified)
- At every phase handoff, after `do-report-commit.md`'s commit is confirmed

## Why

Design sessions span multiple phases across multiple sessions. Without a visible
progress announcement, it is easy to lose track of what has been completed and
what remains — especially when resuming after a break or a tangent, or when a
checkpoint skipped asking and the developer needs to see what it decided.
