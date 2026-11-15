# Copilot integration setup

Project MCP declarations live in `.mcp.json` under `mcpServers`. Inspect existing
declarations before adding a server. Claude and Copilot share this file: reconcile
one change and verify affected consumers. Preserve existing editor-specific
configuration unless changing it is explicitly part of the task.

Supply secrets through local environment references such as `${TOKEN}`. HTTP bearer
authentication uses an Authorization header referencing the environment. Never put
literal credentials in settings, answers, reports, or checked-in files, and never
modify global configuration during project bootstrap.

Repository defaults use `.github/copilot/settings.json`; personal overrides in
`.github/copilot/settings.local.json` belong in `.gitignore`. Use only supported
repository keys. Configuration does not grant trust or permissions. Verify actual
server and tool availability before use; do not duplicate a built-in integration
that already meets the need.
