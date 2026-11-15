# log-hub

Dev tooling for opt-in Claude Code session telemetry. Not part of the deployed public site; see
`docs/Target Architecture (HLD)/v1/Containers/Log Hub.md` for the architecture and
`docs/Engineering Guide/07 Log Hub Setup.md` for the setup walkthrough and the required data
disclosure.

Ops model:

```bash
yarn nx run log-hub:init          # once: download, verify, scaffold .local/.env
yarn nx run log-hub:serve         # every time: bring the local server up
yarn nx run log-hub:install-hook  # once, opt-in: register the Claude Code hook
```

`install-hook` fetches its installer from the server it registers against, so `serve`
must already be running before you run it — it is not interchangeable with `serve`
in this sequence.

## Troubleshooting

**`password authentication failed for user "postgres"` in the DB container logs.**
`apps/log-hub/.local/.env` was recreated (deleted and re-scaffolded by `log-hub:init`),
which generates a new random `POSTGRES_PASSWORD` — but `LOG_HUB_DATA_DIR` (outside the
repo, under `~/.cache/artisyn-log-hub/<repo-slug>/pgdata`) still holds a Postgres
cluster initialized with the old password. Postgres only applies `POSTGRES_PASSWORD`
on first `initdb` of an empty data directory, so reusing that volume with a new env
password always fails this way. Since this is throwaway dev telemetry data, fix it by
wiping the stale volume so it re-initializes with the current password:

```bash
yarn nx run log-hub:stop
rm -rf ~/.cache/artisyn-log-hub/<repo-slug>/pgdata   # find the exact path in the error above
yarn nx run log-hub:serve
```
