# Phase sign-off

A sign-off is where the developer looks at what the phase produced and says go, or
says what to change. The stage reference says what is being signed off and what
question to ask; this pattern says how the stop works.

The developer should feel like they are reviewing a senior colleague's work, not
approving every move of a junior one. So one sign-off per phase, with everything
they need to decide in one message. Steps inside a phase use intelligent
checkpoints (`patterns/approval-intelligent.md`) and keep going when the content
qualifies; anything they would have asked about gets carried into this one stop
instead of raised on its own.

## The protocol

1. Finish the phase's work first. The thing being signed off is already written
   (`patterns/write-confirm.md`); the developer reviews the artifact, not a draft.
2. Metrics `report` so the open work is checkpointed.
3. Write the summary (below) and ask the phase's question.
4. `wait start --reason approval --detail "Awaiting <phase> sign-off"`.
5. Stop and wait. Do not write any file while waiting.
6. On the reply:
   - **Changes requested** → `resume --activity <activity>`, do the rework in the
     same stage, then go back to 2. Nothing is approved until the developer says
     so.
   - **Approved** → record it, quoting or summarising their words:

     ```sh
     node {{provider:skills_root}}/design/scripts/design-metrics.mjs check record --dir "$DESIGN_DIR" \
       --id <phase>-signoff-01 --kind acceptance --name "<Phase> sign-off" \
       --result passed --source developer --evidence "<what they said>"
     ```

     Never record this before the reply exists. Silence, a later unrelated
     message, or an automated notification is never a sign-off.

If you skip step 4, the whole reply gap counts as work time. That is the main way
wait numbers go wrong.

## What the summary contains

Short, scannable, honest. Lead with what the developer must decide.

- What was produced in this phase, in a few lines.
- What was checked, by whom (self-run, satellite reviewer, developer), with the
  real result.
- What was auto-approved along the way and why it qualified (one line each).
- Any open finding carried in from an intelligent checkpoint (WAF P1, review
  correction, OQ), named explicitly, with the decision it needs.
- Anything you could not verify and need the developer to check, as a precise
  action.
- The question. One question, answerable with "go" or a list of changes.
