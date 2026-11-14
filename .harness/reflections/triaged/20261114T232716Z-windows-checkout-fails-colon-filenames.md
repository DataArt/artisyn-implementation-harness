---
status: triaged
triaged: 2026-11-15T00:10:00Z
candidate: .harness/evolve/20261115T000100Z-windows-safe-image-filenames/
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by consumers on Windows: `git checkout` of this repository fails. Two tracked files have a colon in their name, which Windows does not allow:

- `docs/public/images/context/AI Factory: From Intent to Confuse.png`
- `docs/public/images/context/Context Foundation: Stable Tools vs. Broken Migration.png`

Verified here: `git ls-files | grep ':'` lists exactly these two files.

## Impact

Anyone on Windows cannot clone or check out this repository at all, before any harness skill runs. This blocks the canonical source repo, not only the bootstrapped package.

## Suggested direction (not committed)

Rename both images without the colon and update their references in `docs/`. Consider a CI or pre-commit check that rejects filenames with characters invalid on Windows (`: * ? " < > |`).
