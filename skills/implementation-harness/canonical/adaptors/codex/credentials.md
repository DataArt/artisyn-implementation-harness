# Codex integration setup

Project MCP declarations live in .codex/config.toml. Supply stdio secrets through
the process environment (env_vars); HTTP authentication uses the configured
bearer_token_env_var. Do not copy Claude settings.local.json into Codex or put
secret values in TOML, launch answers, or reports. The developer supplies values
locally. Verify server availability in the active host; installation does not
grant trust or approve access on the developer's behalf.
