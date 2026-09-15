# Decision and approval boundaries

Apply throughout the dev lifecycle. A request to run the flow authorizes context
inspection, planning, reversible local edits within scope, relevant checks, report
updates, and routine stage transitions. Existing authorization persists; do not ask
again at each file, finding, step, or phase. Announce progress and continue.

Ask only when a concrete decision or action needs human input:

- Material scope, acceptance criteria, architecture or security tradeoffs not already
  settled. Prepare the plan or proposed change first; combine related choices once.
- Accepting a real unresolved risk or deferring required work. Record the decision,
  rationale and attribution; never treat silence as acceptance.
- Verification requiring human judgment, credentials or access unavailable to the
  agent. Complete all available checks first and request the specific missing check.
- External mutations (tracker tasks, publishing, deployment, migrations), destructive
  operations, or commits when not already authorized. Present exact targets and
  prepared content/diffs before asking. Respect project guarded-command rules.

A local fix is not itself a commit approval gate. Keep commits logical, update the
report before committing, and reuse authorization for subsequent in-scope commits.
When commits are developer-run, offer messages without blocking independent local
work; wait only when the next action actually depends on that commit.

Archive a local story only after closure checks pass. Its reversible move does not
need a separate permission prompt within an authorized full flow. Never overwrite an
existing destination. Local archival does not authorize a tracker Done transition.
A direct-stage request ends after that stage; it does not authorize the rest of the flow.
