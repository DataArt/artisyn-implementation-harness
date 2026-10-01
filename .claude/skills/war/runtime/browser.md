# Browser verification

Use Claude-in-Chrome when its tools are exposed and authorized.
Check capabilities separately: navigation, interaction, network inspection, console
inspection, and DOM/accessibility inspection. Follow the integration's tool rules.
Do not replace missing network or DOM evidence with a screenshot claim.
Preserve the skill's origin scope and explicit opt-in. Report unsupported checks
as not verified; optional browser checks never block the rest of the review.

## When the tools are not exposed

Do not silently downgrade the check. Tell the developer what is missing, walk them
through the setup below, and continue only once they confirm. If they decline or the
integration cannot be enabled, record the browser checks as not verified and move on.

Requirements: a Chromium-based browser; a direct Anthropic plan (Pro, Max, Team or
Enterprise — not Bedrock, Vertex AI or Foundry); a `/login` session, because API keys
and long-lived tokens disable the integration; a current Claude Code version. Chrome
integration is not supported under WSL.

1. **Install** — add the Claude extension from the Chrome Web Store and confirm it is
   enabled in `chrome://extensions`, or start a session with `claude --chrome` and
   choose **Install extension** at the prompt.
2. **Connect** — run `claude --chrome`. If the connection drops mid-session, run
   `/chrome` → **Reconnect extension**. `/chrome` → **Enabled by default** avoids the
   flag on future sessions at the cost of always-loaded browser tools.
3. **Grant site permissions** — these live in the extension's own settings (extension
   icon → **Settings** → **Permissions**), not in Claude Code. Read-only calls run
   without a prompt; state-changing calls always prompt and can be approved for the
   whole site for the session. Granted permissions persist across sessions.
4. **Verify** — `/chrome` should report `Status: Enabled` / `Extension: Installed`.

Extension not detected, or commands stopping mid-run: dismiss any blocking browser
dialog, restart the extension in `chrome://extensions`, then `/chrome` →
**Reconnect extension**. "Receiving end does not exist" means the service worker went
idle — reconnect the same way. On Windows, named-pipe conflicts clear by restarting
Claude Code and closing other sessions using Chrome.

These are host instructions for the developer to run, never commands to execute on
their behalf. Extension site permissions are broader than the calling skill's scope:
keep to the origin that skill names regardless of what the extension allows.
