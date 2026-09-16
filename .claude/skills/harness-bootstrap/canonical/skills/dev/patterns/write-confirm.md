# Write and review

Apply `patterns/approval-sign-off.md`. Write the authorized set of local docs/config files,
check references and consistency, then present a combined summary. Continue through
routine items. Ask for specific unsettled decisions or unavailable human verification
only; file creation and routine edits do not require per-item confirmation.

**Exception — when a call site names this pattern as its sign-off gate** (e.g. Plan
Step 5, on the persisted `1-plan.md`): the above "continue through routine items"
default does not apply there. Present the content per that gate's own instructions
and **stop and wait for the developer's sign-off** before continuing — the call
site's explicit stop-and-wait always governs over this pattern's default.
