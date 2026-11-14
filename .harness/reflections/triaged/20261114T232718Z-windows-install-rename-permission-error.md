---
status: deferred
deferred: 2026-11-15T00:10:00Z
reason: not reproducible here and the report names no path or error text; the atomic write-then-rename helpers are plausible suspects on Windows file locking but a blind retry loop would hide real failures.
reconsider-when: a consumer supplies the failing path and error (EPERM/EBUSY) or it recurs on a Windows CI run; then add a bounded rename retry in the write helpers with the path in the message.
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by Windows consumers: a few times during `/harness-bootstrap launch` a file write failed with a permission error on rename; a retry fixed it. Not reproduced here.

## Impact

Intermittent install failures that look like harness bugs; the atomic write-then-rename pattern (`atomicWrite`, staging renames) is sensitive to Windows file locking (antivirus, editors, indexers holding handles).

## Suggested direction (not committed)

Inspect the rename paths in the launch scripts and `docs/.og/utils.mjs`; add a short bounded retry with backoff on `EPERM`/`EBUSY` for rename on Windows, and report the path when it still fails.
