# Pattern: Write-Confirm (Design)

Applies whenever the agent writes or updates a design artifact that still
needs review before the phase closes.

## The announcement

1. Write or update the file.
2. Say: "File saved at `<path>`." — one line, no question.

That is the whole pattern. It does not stop, and it does not wait. The actual
review and confirmation happen once, at the phase's sign-off
(`patterns/phase-sign-off.md`), where every artifact the stage produced is
presented together. A caller drafting several artifacts in sequence applies
this announcement after each one and keeps going — never stops between them.

## Why

A stop after every file is the per-step gate the lifecycle moved away from:
the developer reviewing a senior colleague's finished work in one pass, not
approving each file as it's written. Confirmation still happens — just once,
with everything to decide in the same message, not fragmented across N stops
for N artifacts.
