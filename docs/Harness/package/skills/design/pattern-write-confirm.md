# Pattern: Write-Confirm (Design)

Applies whenever the agent writes or updates a design artifact and the developer must validate it before the next item begins.

## The loop

For each artifact:

1. Write or update the file
2. Say: "File saved at `<path>`. Review in your IDE — any corrections?"
3. **STOP** — do not proceed to the next artifact
4. Wait for explicit confirmation
5. Apply any requested corrections and re-save; repeat from step 2
6. Proceed only after the developer confirms the file is correct

## Why

Writing multiple artifacts without confirmation checkpoints means errors in one file are carried silently into the next. Each design artifact builds on the previous one — a wrong assumption in `Architecture.md` propagates into `Design.md` and `Stack.md` before anyone catches it.
