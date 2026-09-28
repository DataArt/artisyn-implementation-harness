# Sign-off

A **sign-off** is a stop-and-wait gate: the developer must explicitly approve
content, personally run a manual operation, or confirm an out-of-band decision,
before the lifecycle proceeds. It blocks progress until an explicit reply; silence,
a later unrelated message, or an automated notification is never a sign-off.

A step that names itself a sign-off gate is a human checkpoint by design: that stop
is unconditional, never skipped, downgraded to an announcement, or weakened by
routine-work authorization — however small the change looks. Whether a given step
requires a sign-off, and which kind, is a decision made at that step, not by this
pattern; changing it is its own explicit edit, called out on its own, never a side
effect of an unrelated change.

Three common shapes:

- **Content sign-off** — the developer reviews a drafted or persisted artifact and
  confirms it. Present the actual content (in full if reasonably short, or a
  faithful summary for a long artifact); a summary that omits what changed is not
  a basis for approval. Present every item the developer needs to meaningfully
  confirm, regardless of how many you already checked yourself.
- **Manual operation** — an action only the developer can run (branch checkout, a
  commit, a guarded command). Propose the exact command and wait for them to run
  it and confirm — never run it yourself, even once they've said yes.
- **External confirmation** — a fact only the developer can attest to (the MR was
  approved, a manual check passed). This can never be inferred, self-certified, or
  substituted by a WAF pass or a clean satellite review, however thorough those are
  as evidence to report.

Running an available, non-guarded check yourself (re-reading a file, re-deriving a
table from data already confirmed) as a debugging aid is routine authorized work
and does not require asking first — but it never substitutes for the sign-off
itself. Report exactly what you checked, then still stop and wait for the specific
confirmation the gate needs.
