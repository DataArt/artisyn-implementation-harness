---
status: triaged
triaged: 2026-11-15T00:10:00Z
candidate: .harness/evolve/20261115T000200Z-windows-entrypoint-guards/
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by Windows consumers: `docs/.og/cli.mjs` "says success and does nothing" on Windows, so the skills that call it silently skip the graph. The same was reported for `check-mermaid.mjs`.

Verified here for the graph CLI: `docs/.og/cli.mjs` line 356 guards its entrypoint with `import.meta.url === \`file://${process.argv[1]}\``. On Windows `process.argv[1]`is`C:\\path\\cli.mjs`while`import.meta.url`is`file:///C:/path/cli.mjs`, so the comparison is never true, `runCli()`never runs, and the process exits 0 with no output. The canonical copy is identical.`check-mermaid.mjs`was not verified this session; its guard should be inspected for the same pattern, as should every other`.mjs` entrypoint in the package and the skills (`timing.mjs`, `design-metrics.mjs`, launch scripts).

## Impact

On Windows the operational graph is never built, indexed or queried, and the skills treat that as a graceful fallback instead of a failure. Diagram checks may be skipped the same way. The consumer sees success with no effect.

## Suggested direction (not committed)

Replace the string comparison with a path-based check, for example `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])`, in every entrypoint; add a unit test that runs the CLI as a child process and asserts output.
