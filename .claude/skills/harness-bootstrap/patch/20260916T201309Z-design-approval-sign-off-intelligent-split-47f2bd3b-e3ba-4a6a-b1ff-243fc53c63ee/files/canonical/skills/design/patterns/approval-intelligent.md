# Intelligent approval

A companion to `patterns/approval-sign-off.md`'s fixed sign-off gates, for a narrower
class of checkpoint: one where whether human review is warranted depends on what the
generated content actually turned out to be, not on the stage itself.

**This pattern never applies to a gate already in `patterns/approval-sign-off.md`'s
fixed sign-off list** (every gate enumerated there — Frame Steps 1/3/5/7, Research
Steps 2b/3/3b/4/5, Evaluate Steps 1b/2b/4/4b/5/7, Solution Steps 1b/2/3/4/5/7/7b/8,
Review Gate Steps 2/4, Address Feedback Step 3, Publish Steps 2/3/6, and every
phase's Announce/Compact/Resume triad) — those stay unconditional, every time, no
matter how small the change looks. Intelligent approval only applies to a checkpoint
explicitly designated below as using it.

## The rule

At a designated checkpoint, before presenting anything to the developer:

1. State the checkpoint's fixed materiality criterion — what would make this worth a
   human's time — before looking at the actual content. Do not invent or loosen the
   criterion after seeing whether the change happens to look trivial.
2. Evaluate the actual content strictly against that criterion.
3. **Material → escalate.** Treat it as an ordinary sign-off: present the content and
   stop and wait. Default to escalating on any doubt — an unnecessary question costs
   a reply; a wrongly-skipped one costs an unreviewed decision reaching the developer
   as a fait accompli.
4. **Not material → auto-approve.** Do not ask. Record, in the artifact the developer
   will read anyway (`design/Report.md`, never a side channel), what was checked, the
   criterion applied, and why it did not qualify, in one or two lines. Continue
   without stopping.

A skip is never silent. If the developer cannot find, after the fact, exactly what
was auto-approved and why, this pattern is being used to hide work rather than to
save the developer's attention — that is a misuse of the checkpoint it was attached
to, not a valid use of this pattern.

## Designated checkpoints

- **Frame Step 3 tracker transition** (`references/01-frame.md`) — when the ticket is
  currently unassigned (or already assigned to the authenticated user) and in a
  pre-work status (e.g. Backlog/To Do/Selected), assigning it and transitioning to
  In Progress is the expected default ceremony for starting a design — auto-approve
  and announce what was done (ticket, prior status, new status) instead of asking
  first. If the ticket is already assigned to someone else, already past In
  Progress, or the transition isn't the obvious next status in its workflow, that's
  material — ask as usual before touching it. This mutates the tracker, so get the
  state check right: read the ticket's actual current assignee/status before
  deciding, never assume. This mirrors the dev lifecycle's Ceremony Step 1 checkpoint
  exactly — same tracker, same mechanism, same criterion.

## Why not just widen sign-off's routine-authorization language?

`patterns/approval-sign-off.md` already lets ordinary in-scope work proceed without
asking; it deliberately keeps that language from reaching into a named sign-off
gate. This pattern exists because some checkpoints bundle two different things: an
irreversible or manual step (always ask) and a content-review step whose necessity
depends on what the content turned out to be (sometimes ask). Splitting the two lets
the irreversible half stay absolute while the content-review half gets a real,
auditable judgment call instead of an unconditional stop — which, applied to
genuinely trivial content over and over, trains developers to rubber-stamp rather
than actually review.
