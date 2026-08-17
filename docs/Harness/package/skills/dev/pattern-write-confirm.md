# Pattern: Write-Confirm

Applies whenever the agent writes or updates a file (plan, doc, config) and the developer must validate it before the next item begins.

## The loop

For each item:

1. Write or update the file
2. Present the change — what file, what section, what changed
3. Ask for review: "Please review `<file>` and confirm it looks correct before I move to the next item."
4. **STOP** — do not move to the next item
5. Wait for explicit confirmation that the change is correct
6. Proceed to the next item only after confirmation

## Why

Writing multiple items without confirmation checkpoints means errors in item N are carried silently into item N+1. Each item should be independently verifiable.
