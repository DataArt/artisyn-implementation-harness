# Claude in Chrome — Setup

Read before running any workflow step that uses the `mcp__claude-in-chrome__*` browser tools
(`/x-ray` Step 4b) if those tools aren't already available in the session.

## Requirements

- Chrome, Edge, or a Chromium-based browser (Brave, Arc, Vivaldi, Opera)
- A direct Anthropic plan (Pro, Max, Team, or Enterprise) — not available via Bedrock, Vertex AI,
  or Foundry
- Authenticated via `/login` (API keys and long-lived tokens disable Chrome integration)
- Latest Claude Code version

## Install

1. Chrome Web Store: search "Claude" or visit the extension's Web Store listing, click
   **Add to Chrome**, confirm permissions, then verify it's enabled in `chrome://extensions`.
2. Or let Claude Code drive it: start a session with `claude --chrome` — when prompted "Claude
   wants to use your browser", choose **Install extension** and follow the guided setup.

## Connect to the current session

```bash
claude --chrome
```

Claude Code detects the extension and connects automatically (a one-time dialog explains site
permissions). If the connection drops mid-session, run `/chrome` → **Reconnect extension**.

To skip the `--chrome` flag on every future session, run `/chrome` → **Enabled by default** (this
increases context usage, since the browser tools stay loaded every session).

## Grant permission

Site permissions live in the **Chrome extension's own settings** (extension icon → **Settings** →
**Permissions**), not in Claude Code itself:

- Read-only calls (screenshot, read page, find elements) run without a prompt.
- State-changing calls (click, type, navigate) always prompt for approval — you can approve "all
  actions on this site for this session" when asked.
- Permissions granted here persist across sessions; they don't need to be re-granted each time.

## Verify it's working

Run `/chrome` — expect `Status: Enabled` / `Extension: Installed`. Or ask Claude to navigate to
any page and interact with it; a new Chrome tab should open and respond.

## Scope restriction for this project

Every workflow step that uses these tools (`/x-ray` Step 4b) is restricted to
**`{{LOCAL_WEB_URL}}`** (the web app's dev server) — never any other URL or origin, even if the
extension itself has broader site permissions granted. Reading network requests the loaded page
fires to other local ports (e.g. `{{LOCAL_API_URL}}` for the BFF) via `read_network_requests` is
fine — that's the page's own traffic, not the browser navigating elsewhere.

## Troubleshooting

| Issue                            | Fix                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| "Extension not detected"         | Restart Chrome, confirm it's enabled in `chrome://extensions`, run `/chrome` → **Reconnect extension** |
| Browser commands stop responding | Dismiss any alert/confirm dialog blocking the page; restart the extension in `chrome://extensions`     |
| "Receiving end does not exist"   | The extension's service worker went idle — run `/chrome` → **Reconnect extension**                     |
| Named pipe conflicts (Windows)   | Restart Claude Code; close other Claude Code sessions using Chrome                                     |

**Windows note:** Chrome integration is not supported under WSL.

Source: [Use Claude Code with Chrome](https://code.claude.com/docs/en/chrome.md) (official Claude Code docs).
