This is not a diff problem, a scope problem, or something to work around — the pass simply never
started, and **it is the single most valuable pass in this skill.** Never treat this error as
"2a found nothing", never silently continue to Step 4 with only 2b/2c, and never substitute your
own correctness sweep for it (that is exactly the reimplementation this skill forbids).

Instead, hand it back to the developer as a **one-line, ready-to-run command** — they should not
have to type or assemble anything, only paste and press Enter. Keep 2b/2c's results (they fired
in the same message and are unaffected), then say exactly this and **stop**:

> The built-in correctness pass can only be started by you — the `Skill` tool is blocked from
> invoking it. Paste this and press Enter; I'll pick up its output and finish the review:
>
> ```
> /code-review <resolved scope> --effort=<resolved effort>
> ```
>
> (Or reply `skip` to get the conventions + architecture findings on their own — the review will
> be explicitly marked as missing its correctness pass.)

Rules for that handoff:

- The command block holds **nothing but the command** — no prose, no unresolved `<...>`.
  Substitute the real scope from Step 1 and the real effort level, e.g.
  `/code-review origin/main...HEAD --effort=high`.
- Give exactly one command. No alternatives, no variants, no explanation of the flag unless asked.
- **Stop and wait.** Do not run Steps 3-5 with 2a missing while the answer is still pending.
- When `/code-review`'s output appears in the conversation, resume at Step 3 and treat that output
  as 2a's result, verbatim — same "already verified, do not second-guess" rule.
- If the developer replies `skip`, continue — but Step 4's correctness section must read
  `**NOT RUN** — blocked by disable-model-invocation, developer chose to skip` instead of "Clean",
  and Step 5 must pass that fact to `@interactive-demo` so the HTML report states it too. A
  skipped pass is never reported as a clean one.
