# Triage

## Responsibility and completion

Determine the underlying concern, scope, existing owner and affected callers, then
prepare actionable changes as inactive drafts. Finish with candidate paths and
acceptance criteria or explicit defer/archive decisions. Drafting belongs to this
stage; Triage does not publish or automatically invoke validation.

| Action  | Required result                                                    |
| ------- | ------------------------------------------------------------------ |
| Update  | Proposed revision to the existing owner                            |
| Create  | New candidate and evidence that no suitable owner already exists   |
| Merge   | Consolidated candidate, superseded paths and caller migration plan |
| Retire  | Explicit removals, caller handling and rollback information        |
| Defer   | Missing evidence and a condition for reconsideration               |
| Archive | Reason no change is warranted                                      |

## Procedure

Accept a concrete request directly, or inventory pending reflections by metadata; read those relevant to the requested
scope. Use local task records first and consult the configured tracker only if
needed. Do not load every skill or fetch every linked ticket by default.

Cluster evidence by underlying failure or useful practice. A single strong case can
justify action. Inspect likely existing owners and callers before choosing update,
create, merge, retire, defer, or archive. Prefer an existing skill, agent, convention doc,
or script when it already owns the concern. Avoid turning one-off preferences into
universal rules. Broader harness audits run only when relevant or requested.

For each actionable cluster create a candidate report using
[the improvement interface](../interfaces/improvement.md), including scope, owner,
sources, proposed action and acceptance criteria. Apply [Draft](03-draft.md) within
Triage to prepare the candidate content and validation plan. New skills and agents
stay inactive drafts until validated and published through Adopt.
Deferred observations retain their source and receive status: deferred, a reason and
reconsideration condition; revisit them only when requested or relevant new evidence
is supplied. Archive no-action observations with their reason. Mark actionable reflections triaged only after
the candidate report and draft content are saved and link them to its path. Preserve source history;
move processed files to reflections/triaged or archive using Git moves for tracked
files and ordinary moves for untracked files. Present the decisions and draft paths,
then stop. Do not automatically validate or publish the drafts.
