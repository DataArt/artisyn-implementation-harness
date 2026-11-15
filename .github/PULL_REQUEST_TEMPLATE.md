<!--
Title follows the commit format: <type>(<scope>): <what changed>
Types: feat, fix, docs, refactor, test, chore. Example: fix(web-explorer): keep hero visible after route change
One concern per PR. Keep an unrelated refactor out of a fix.
-->

## What

<!-- One or two sentences. What changed, as a reader of the diff would describe it. -->

## Why

<!-- The problem or motivation. Link the issue: Closes #123 -->

## How to verify

<!-- What a reviewer should do to see it working. Commands, pages, or a screenshot for UI changes. -->

## Checklist

- [ ] Branch name is `<type>/short-description` and commits follow `<type>(<scope>): <what>`.
- [ ] `yarn nx affected --target=lint` and `--target=typecheck` pass locally.
- [ ] Docs are aligned with the change: the container's LLD doc, app README, or Engineering Guide article that names the changed behaviour. Typo-level changes are exempt.
- [ ] No region or credential appears hardcoded in source or docs.
- [ ] No guarded command was run from an agent session (`cdk deploy`, `git push`, the live agent E2E).
- [ ] If this changes a skill or agent that the bootstrap ships, the canonical copy under `.canonical-implementation-harness/` is updated too, or an issue explains why not.
- [ ] UI change: checked with keyboard only, with reduced motion on, and at 200% zoom / 320px width (see `ACCESSIBILITY.md`).

## Notes for the reviewer

<!-- Optional. Anything that is not obvious from the diff: trade-offs, follow-ups, what you deliberately left out. -->
