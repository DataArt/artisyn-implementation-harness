# Sign-off

A **sign-off** is a stop-and-wait: the developer must explicitly reply before the
lifecycle moves on. Silence, a later unrelated message, or an automated
notification is never a sign-off.

The lifecycle uses sign-offs sparingly. The normal place is the end of a phase
(`patterns/phase-sign-off.md`). Steps inside a phase use intelligent checkpoints
(`patterns/approval-intelligent.md`) and keep going when the content qualifies.

Three shapes:

- **Content sign-off** — the developer reviews what was produced and confirms it.
  Show the actual content, in full if short, or a faithful summary for a long
  artifact. A summary that hides what changed is not a basis for approval.
- **Manual operation** — something only the developer runs: a commit, a push, a
  guarded command. Propose the exact command and wait for them to confirm; then
  check the result yourself where you can (Git, a file). Never run it yourself, even
  once they've said yes.
- **External confirmation** — a fact only the developer can attest to, such as "I
  looked at the UI and it's right". Never infer it or self-certify it.

## Self-run checks

Running an available, non-guarded check yourself (build, typecheck, test, curl)
is routine work. Do it, record it with the metrics wrapper, and report the real
result with `--source self`.

A self-run check **is** enough to pass a step checkpoint when the plan's
verification item is something a command can answer and the command passed. It is
**not** enough for things only a human can see or decide: UI/UX appearance,
behaviour on the developer's machine when it plausibly differs from yours, a
guarded command, or a divergence from the plan. Those stop and ask.

A worker's own report, or a satellite reviewer's `go`, is input to your decision,
never the decision. Verify the claimed change actually landed (`git status`,
`git diff`, real output) before you treat it as done.
