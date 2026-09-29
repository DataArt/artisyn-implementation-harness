# Pattern: Do → Report → Commit (Design)

Applies at the end of every design phase. The ordering is always the same.

## Steps

1. **Do** — complete the phase work (write artifacts, run WAF, archive, create tickets)
2. **Report** — update `design/Report.md` before presenting the commit message:
   - Phase tracker: mark current phase `✅`, next phase `🔄`
   - Append an Efforts row (date, phase, one-line note)
3. **Commit** — present the suggested commit message; **STOP** and wait for the developer to confirm

> After commit is confirmed, control returns to the caller. Compact and announce are the caller's responsibility — do not add them here.

## Invariant

`design/Report.md` must reflect the completed phase before any commit is presented. It is the recovery point — the next session reads it to know where to resume.

## Why

`design/Report.md` is the recovery point for the design session. If a commit is made before the tracker and Efforts table are updated, the next session has no reliable record of which phase completed and what was decided. Presenting the commit before reporting creates a window where code and report are out of sync.
