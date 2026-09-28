---
name: Present And Save
description: Shared close-out mechanics for both audit references — present in console before writing anything, then save a dated, never-overwritten snapshot under WAR/{VERSION}/.
type: pattern
---

## Present findings in console

Present the full audit in the console. Do NOT write to file yet.

After presenting, say:

> "{Design | } audit complete. Any corrections before I save? (**yes** to save as-is / **no** to discuss changes)"

**Stop and wait** for confirmation. If the developer requests changes, apply them and re-present the affected sections. Repeat until approved.

## Save the audit

Output path:

```
docs/Target Architecture (HLD)/WAR/{VERSION}/{YYYY-MM-DD}-{design|implementation}-audit.md
```

Create the `WAR/{VERSION}/` directory if it does not exist. Never overwrite a previous report — each run is a dated snapshot.

## Confirm and close

After saving, report the save path and the re-run/cross-reference commands specific to the audit just run (see each reference's own closing message).
