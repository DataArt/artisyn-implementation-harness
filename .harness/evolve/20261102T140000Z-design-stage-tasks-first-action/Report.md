# Evolve candidate — design: tracker creation is Resume Detection's first action

## Identity

- Candidate: `20261102T140000Z-design-stage-tasks-first-action`
- Requested outcome: the `/design` router creates (or reuses) the native task
  tracker immediately after resolving the local/tracker ID, so a developer
  never has to notice and ask for it — it's visible before the first phase's
  confirmation prompt, not retrofitted afterward.
- Scope: `.claude/skills/design/SKILL.md` only (the router). No other skill,
  reference, or pattern file changes.
- Non-goals: does not change `patterns/task-tracking.md`'s own create-vs-reuse
  logic, does not touch the `dev` lifecycle's equivalent step (out of scope —
  no evidence of the same failure there yet).
- Source reflection: `.harness/reflections/20261102T085519Z-design-stage-tasks-skipped.md`
  (status: pending-triage at time of this candidate).
- Evidence: session DESIGN-20261102-Q5MU — Context Gathering ran to sign-off
  and commit with no tracker in place; the developer asked "why dont we
  enable steps tracker?" and separately said this "happen[s] so frequently."

## Action

**Update** — existing owner is `.claude/skills/design/SKILL.md`'s Resume
Detection / Stage-tasks sections. Affected callers: every `/design` invocation
(full-chain and direct-stage entry, fresh and resumed).

## Acceptance criteria

1. On a fresh full-chain `/design` entry (ticket or free-form), the tracker
   (ten tasks, one per stage, chained) exists before Resume Detection's Step 3
   confirmation prompt is shown.
2. On a fresh direct-stage entry (e.g. `/design frame {ticket}`), the
   single-stage task exists before that stage's own Step 1 begins.
3. On a resumed design (tracker already exists from an earlier session),
   `patterns/task-tracking.md`'s own reuse logic still applies — this change
   does not duplicate tasks on resume.
4. The rest of the lifecycle (phases 1–10, decision-router child tasks)
   behaves exactly as before; this is a timing change only, not a logic
   change to what gets tracked.

## Proposed file mapping

| Source (baseline)                | Destination                      | Baseline hash                                                      | Candidate hash                                                     | Operation |
| -------------------------------- | -------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `.claude/skills/design/SKILL.md` | `.claude/skills/design/SKILL.md` | `01fcb1621a255b03f46e154daa860cfbd1d800c481ee7abb7179a190c99da40a` | `46ebbe2792894611861f83f7d0356cafb14442bbd0345d83a2269b1d73060f9e` | update    |

(Revised once during Validate: the first draft created the tracker before
`Report.md` was read on a resume, which would have populated it with no
knowledge of already-completed stages. Fixed by splitting the trigger point —
Step 1 for fresh start, right after Step 2's artifact table for resume — both
still ahead of Step 3's confirmation prompt.)

Candidate content staged at `candidate/SKILL.md` in this folder. No removals;
no rollback material beyond restoring the baseline hash above.

## Change summary (for review, not the authoritative diff)

- Resume Detection Step 1: added an explicit paragraph right after the
  found/not-found branches, directing the tracker to be created/reused
  immediately — before Step 2 (read Report.md) and Step 3 (confirmation
  prompt).
- Removed the old instruction that deferred tracker creation to "once Resume
  Detection... apply Stage tasks below" (which ran after Step 3), replacing
  it with a one-line note that tracker creation already happened at Step 1.
- Updated the "## Stage tasks" section's intro line to name the new trigger
  point explicitly (Resume Detection Step 1), so a reader doesn't have to
  infer timing from two separated sections.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflection captured 2026-11-02, this session                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Triage   | completed | This report; candidate drafted                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Validate | completed | `Validation.md` — pass, all 6 scenarios, after one in-pass revision (resume-path ordering bug found and fixed)                                                                                                                                                                                                                                                                                                                                                                           |
| Adopt    | completed | Installed `candidate/SKILL.md` over `.claude/skills/design/SKILL.md`; installed content hash (`46ebbe2792894611861f83f7d0356cafb14442bbd0345d83a2269b1d73060f9e`) matches the validated candidate exactly. No callers, discovery tables (CLAUDE.md's Skills table references the skill generically, unaffected), or companion files needed updating — this is a prose-only change inside one existing file, same frontmatter, same referenced companion paths (all 19 verified present). |

Draft readiness: validated, pass, adopted. Current stage: closed.
Next action: none — lifecycle complete.

## Unresolved decisions

- None blocking. One judgment call made during drafting: the fix is scoped to
  moving _when_ tracker creation happens, not changing _what_ gets tracked —
  this matches the reflection's own primary suggested direction (make it "the
  literal first action") over the alternative (a separate self-check gate),
  since it's the smaller, more direct change.
