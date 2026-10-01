# Phase sign-off

A sign-off is where the developer looks at what the phase produced and says go, or
says what to change. The stage reference says what is
being signed off and what question to ask; this pattern says how the stop works.

The developer should feel like they are reviewing a senior colleague's work, not
approving every move of a junior one. So one sign-off per phase, with everything
they need to decide in one message.

## The protocol

1. Finish the phase's work first. The thing being signed off is already written
   (`patterns/write-confirm.md`); the developer reviews the artifact, not a draft.
2. Metrics `report --dir "$IMPL_DIR"` so the open work is checkpointed.
3. Write the summary (below) and ask the phase's question.
4. `wait start --dir "$IMPL_DIR" --reason approval --detail "Awaiting <phase> sign-off"`.
5. Stop and wait. Do not write any file while waiting.
6. On the reply:
   - **Changes requested** → `resume --dir "$IMPL_DIR" --activity <activity>`, do the
     rework in the same stage and attempt, then go back to 2. Nothing is approved
     until the developer says so.
   - **Approved** → record it, quoting or summarising their words:

     ```sh
     node {{provider:skills_root}}/dev/scripts/timing.mjs check record --dir "$IMPL_DIR" \
       --id <phase>-signoff-01 --kind acceptance --name "<Phase> sign-off" \
       --result passed --source developer --evidence "<what they said>"
     ```

     Never record this before the reply exists. Silence, a later unrelated message,
     or an automated notification is never a sign-off.

If you skip step 4, the whole reply gap counts as work time. That is the main way
wait numbers go wrong.

## What the summary contains

Short, scannable, honest. Lead with what the developer must decide.

- What was done in this phase, in a few lines.
- What was verified, by whom (self-run, worker, developer), with the real result.
- What was auto-approved along the way and why it qualified (one line each).
- Any divergence from the plan or intent, named explicitly.
- Anything you could not verify and need the developer to check, as a precise action.
- The question. One question, answerable with "go" or a list of changes.
