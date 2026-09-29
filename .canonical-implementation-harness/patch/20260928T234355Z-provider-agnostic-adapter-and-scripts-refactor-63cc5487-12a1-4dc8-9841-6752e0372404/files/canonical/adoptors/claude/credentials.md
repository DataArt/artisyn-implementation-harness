# Claude integration setup

Shared server declarations live in .mcp.json. Keep secret values in the developer's
local environment or untracked .claude/settings.local.json env block. Never collect
values in conversation, launch answers, or reports. Preserve existing local settings.
The developer supplies values locally and restarts the session as needed. Verify
server availability with the exposed tools or claude mcp list; installation does
not grant trust or approve server access on the developer's behalf.
