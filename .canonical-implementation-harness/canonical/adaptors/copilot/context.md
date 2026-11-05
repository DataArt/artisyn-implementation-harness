# Context and recovery in Copilot

Persist the current stage, verified outputs, pending decisions and next action in
the durable report before a handoff. On resume, read it and verify actual files.
Use the host's context management when available; do not pretend to execute user
slash commands. Compaction is optional and is not sign-off or completion.

The Copilot instruction entrypoint is `.github/copilot-instructions.md`. Copilot
may also discover other root instruction files. Inspect the
loaded sources in the host's customization view; reconcile conflicting provider procedures
without deleting unselected providers' files. Keep shared facts consistent and
scope native tool guidance to its provider. Never rely on precedence to suppress
conflicting instructions. Copilot skills in `.github/skills` take precedence over
same-name skills in other host-specific directories.
