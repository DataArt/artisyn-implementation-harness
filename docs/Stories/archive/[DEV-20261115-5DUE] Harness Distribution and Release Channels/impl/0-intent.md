---
id: 6990481c
type: Dev Intent
title: DEV-20261115-5DUE — Harness Distribution and Release Channels — Intent
description: Dev intent for moving the harness package to skills/implementation-harness and shipping it through automated release channels
tags: [dev intent, distribution, release channels, install cli, implementation-harness]
generated: { by: process:okf-migration, at: 2026-11-16T21:31:28Z }
updated: { by: process:okf-migration, at: 2026-11-16T21:31:28Z }
---

# DEV-20261115-5DUE — Harness Distribution and Release Channels — Intent

**Date:** 2026-11-15 · **Ticket:** local ID `DEV-20261115-5DUE` (no tracker record) · **Track:** project dev, implementing a Product design

**Sources**

- The developer's message: "DESIGN-20261115-CO1T lets implement all this distribution story in one session".
- Approved design (the spec): `docs/Stories/product-design/approved/[DESIGN-20261115-CO1T] Harness Distribution and Release Channels/` — `solution/Architecture.md` (decisions D-01…D-18, flows F1–F4), `solution/Design - *.md`, `solution/Stack.md`, `solution/Efforts.md` (12 tickets), `design/Report.md`.
- Published product docs: `docs/Harness/09 Distribution/` (written ahead, "applies from release 4.0.0").
- Repo state read on 2026-11-15: `.canonical-implementation-harness/` (with tracked `state/`, `reports/`, `registry.md`), symlinks under `.claude/skills/`, `.agents/skills/`, `.github/skills/`, `scripts/release/release-harness-bootstrap.mjs`, `releases/harness-bootstrap/`, `.github/workflows/release.yml`, `release.config.js`, `apps/harness-bootstrap-e2e/`.

## The problem

The harness package is distributed as a ZIP committed to git under `releases/harness-bootstrap/`, released by a manual script. Consumers download, unzip and place it by hand. There is no registry, no marketplace listing, no update path, and the name `harness-bootstrap` does not match the product brand. The package also keeps its runtime state inside itself, so replacing the package risks the project's history.

## What better looks like

The whole approved distribution story is in place in the repo:

- The package lives at `skills/implementation-harness/` under the new names, with the old name served by a short-lived shim.
- Runtime state lives in the project at `.harness/state/`, and existing 3.5.0 installs migrate safely.
- A copy CLI (`init` / `update` / `migrate` / `doctor`) installs and updates the package.
- The repo is its own marketplace for Claude, Codex and Copilot, and works with skills.sh and `gh skill`.
- A single automatic release workflow versions, tags, stamps, publishes to GitHub Packages and attaches the ZIP with checksum and attestation. The committed ZIPs and the manual release script are gone.
- Consumer and engineering docs describe the new installation and update paths.

The first release is 4.0.0, produced by the pipeline from the breaking rename commit.

## Who and what is affected

Harness maintainers and every project that installs the harness. In this repo: the `harness-bootstrap-e2e` container, root release tooling (`release.config.js`, `release.yml`), the provider discovery symlinks, `CLAUDE.md`, the root README, the issue template, and the Web Docs content under `docs/Harness/`. HLD container in scope: Harness Bootstrap E2E, plus the release pipeline, which has no container yet and the design asks for one.

## Out of scope

- Official curated marketplace directories (later follow-up).
- Public npmjs publishing (GitHub Packages only).
- Consumer-side `patch harvest` / `prepare`.
- Changing launch and patch semantics beyond the entrypoint name, package location and state location.

## Constraints

- The approved design is the spec; the developer's words win only where they say so.
- Guarded commands are never run by me: `git push`, `cdk deploy`, `yarn nx run harness-bootstrap-e2e:agent-e2e`. Commits are the developer's.
- No hardcoded region anywhere. Yarn only, never npm or npx in this repo's own tooling (consumer-facing commands may name `npx`, as the design settled).
- The rename must land as a breaking `feat(harness)!:` commit on a `harness` scope so the first automatic run yields exactly 4.0.0, and the harness `package.json` starts at 3.5.0.
- The release workflow stays disabled behind `HARNESS_RELEASE_ENABLED` until the developer flips it.
- `Harness Bootstrap E2E` fixtures and graders must keep working through the move.
- Patch bundle history under `patch/**` stays byte-identical.

## Open questions

1. **Admin and live-host steps.** Efforts ticket 10 (ruleset and bypass actor on GitHub) and ticket 12 (flip the variable, cut 4.0.0, per-channel smoke on real hosts, agent E2E) need your access or are guarded. My reading: I prepare everything for them (documented ruleset settings, a smoke checklist, the exact commands) and hand them over, and the code work of tickets 1–9 and 11 is what I do in this session. Is that right?
2. **Base branch.** `docs/design-20261115-co1t-harness-distribution` is 8 commits ahead of `main` (the design and its published docs, not yet merged). My reading: Ceremony branches the implementation from this branch so the spec and `docs/Harness/09 Distribution/` are present. Alternatively you merge the design first.
3. **One branch, one MR.** The 12 tickets go on one feature branch and one MR, with commits split by ticket, scoped `harness` where they touch the package. Confirm, or name a different split.
4. **E2E project name.** The design renames the harness source, package, Nx project and symlinks, but does not say whether `apps/harness-bootstrap-e2e` and its `harness-bootstrap-e2e` Nx project rename too. My reading: keep that name for now (it is this repo's test container, and CLAUDE.md names it), and only fix its paths and fixtures. Confirm.
5. **Real-host checks** inside ticket 7 (Codex `policy.authentication` value, Copilot plugin kind) need real hosts. I will take the values from official docs and mark them unverified until you check on a host.
