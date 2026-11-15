# Validate

## Responsibility and completion

Establish whether this candidate meets its acceptance criteria without conflicting
with existing guidance or breaking affected callers. Produce a recorded verdict:
pass, fail (needs revision), or blocked, with evidence and limitations. A pass makes
the candidate eligible for Adopt; it does not publish or automatically invoke Adopt.

## Procedure

Read the candidate report, proposed content, relevant callers and
[the validation interface](../interfaces/validation.md). Check that the candidate
still matches the active baseline. Review changed references and discovery metadata.

Exercise the candidate in an isolated location or an explicitly scoped session.
Check a representative intended task, an unrelated task that should not trigger it,
and an existing caller or behavior at risk. For agents check role/tool boundaries;
for docs check guidance against evidence; for scripts run meaningful checks.
Record actual inputs, method, observed outcomes and limitations. A manual walkthrough
is not a runtime test; label it accordingly. Never fabricate tool availability or
successful delegation. Elapsed time and worker self-reports are not validation.

Use pass, fail or blocked. Failed cases return to Draft; unavailable required
capabilities stay blocked with the next action. Retest affected cases after edits;
evidence applies to the candidate content hashes, not merely its name. Complete
Validate only when the scoped acceptance criteria pass.
