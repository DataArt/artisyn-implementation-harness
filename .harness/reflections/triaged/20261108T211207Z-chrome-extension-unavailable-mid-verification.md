---
status: pending-triage
timestamp: 2026-11-08T21:12:07Z
ticket: DEV-20261108-K7XQ
---

## Observation

During DEV-20261108-K7XQ's Implement Step 3 (CSP meta tag), the plan called for a
live browser check (console free of CSP violations, on the homepage, a doc page
with giscus, and the Graph Explorer page). `mcp__claude-in-chrome__tabs_context_mcp`
was called twice across the session and both times returned "Browser extension is
not connected" — the live check could not be performed by the assistant at all, and
had to be handed entirely to the developer (who then found and reported two real
bugs — a giscus category mismatch and an initially-blank Graph Explorer — that the
assistant could not have caught without that live check).

The user's own words, prompting this reflection: "web agent neeeded" (as item 2 of a
three-part reflect request, terse — the assistant's best-effort reading is that this
refers to the Chrome browser tool being unavailable when it was needed for
verification, not a request for a different/new agent; this interpretation is not
confirmed by the user).

## Impact

A stage that structurally requires a live browser check (per its own plan step)
degraded into "ask the developer to do it and paste back what they see," which
worked here but cost extra round-trips and depends on the developer being available
and willing to manually drive the check each time. If Chrome extension
connectivity is unreliable or requires a one-time setup step the session doesn't
know to prompt for, this will recur on every ticket touching a web UI.

## Suspected cause (not verified this session)

Unknown whether the extension was never installed/connected for this machine, or
whether it disconnects between sessions and needs a fresh handshake each time. The
`chrome-browser` skill (consulted before first use, per its own description) does
not appear to cover a case where `tabs_context_mcp` reports "not connected" more
than once in the same session — no documented retry, reconnect, or escalation
path was found in-session.

## Suggested direction (not committed)

- Check whether the `chrome-browser` skill (or a CLAUDE.md note) should document a
  concrete next step when `tabs_context_mcp` reports "not connected" — e.g., ask the
  developer to check the extension is installed/signed-in once, rather than silently
  falling back to developer-driven manual checks without surfacing _why_.
- Consider whether dev plan steps that require a live browser check should name an
  explicit fallback (hand to developer with precise instructions) as a first-class
  plan outcome, not just something improvised mid-step when the tool turns out to
  be unavailable.
