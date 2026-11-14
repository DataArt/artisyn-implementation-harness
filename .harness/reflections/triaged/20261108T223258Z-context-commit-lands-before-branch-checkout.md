---
status: pending-triage
timestamp: 2026-11-08T22:32:58Z
ticket: DESIGN-20261108-1L8P
---

## Observation

In both the `/design` and `/dev` skills, the first stage's own "Commit" step runs
_before_ Ceremony checks out the feature branch. `design/references/01-context-gathering.md`
Step 7 proposes a commit covering the new story folder, and that commit's sign-off/wait
completes before Phase 2 (Ceremony) ever runs `git checkout -b ...`. `dev/references/01-context-gathering.md`
Step 7 has the identical shape: it proposes `docs({ticket-lowercase}): capture intent for
{short-name}` and waits for the commit, then only afterward hands off to Ceremony
(`dev/references/02-ceremony.md` Step 2), which is where the branch checkout actually
happens. In this session (DESIGN-20261108-1L8P), that meant the Context Gathering commit
was proposed to run while still on `main`, before any feature/docs branch existed.

The user's own words, prompting this reflection: "retire this commit and do a first
commit after checkout... same for the dev flow."

## Impact

The lifecycle's first commit lands on `main` (or whatever branch the developer started
on) instead of the feature branch Ceremony creates. That's a direct-to-main commit for
work that is supposed to live on a scoped branch, and it means the branch's own history
doesn't start with the context/intent capture — Ceremony's later "record branch and
tracker state" commit is the first thing actually on the branch. Any downstream step that
assumes the whole story folder's history lives on one branch (e.g. a PR diff, squash, or
review of "everything since checkout") will miss this first commit entirely.

## Suggested direction (not committed)

- In both skills, retire the standalone Step 7 commit-and-wait in Context
  Gathering/Context. Instead, fold the story folder's creation into the first commit
  Ceremony makes _after_ the branch checkout sign-off — i.e., Ceremony's existing
  "record branch and tracker state" commit (dev `02-ceremony.md` Step 3,
  `docs({ticket-lowercase}): record branch and tracker state`) becomes the first commit
  of the lifecycle and additionally covers the Context stage's new files, rather than
  Context committing separately and earlier.
  - design's Ceremony (`design/references/02-ceremony.md`) should get the same
    treatment if it has its own commit step after checkout — check it was not
    inspected this session.
- Alternative if separating the commits is still wanted: keep both commits, but reorder
  the stages so Ceremony's branch checkout runs first and Context Gathering's commit
  runs second, once a feature branch already exists — this avoids collapsing two
  logically distinct commits (context capture vs. branch/tracker ceremony) into one.
- Either direction needs re-checking the "Two stops in this stage" callouts and the
  phase-tracker banners in both skills' SKILL.md/router, since they currently assume
  Context's own commit closes out that stage before Ceremony starts.
