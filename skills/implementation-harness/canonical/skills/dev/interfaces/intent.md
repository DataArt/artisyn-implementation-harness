# Intent interface

`0-intent.md` is the first document of a ticket. Context Gathering writes it once,
before any branch or plan work, so what reaches planning is what the originator
meant and not something several steps removed from it. It follows the capture-intent
idea from the AI-native SDLC playbook: human readable, version controlled, in the
originator's own terms, no formal language required.

This is an interface, not a template. It says what the document must answer. It
does not prescribe headings, order, length or diagrams. Use whatever shape makes the
answers clearest for this ticket; a short ticket may be ten lines.

## What it must answer

- **What is the problem?** What people cannot do today, or what is wrong, and why
  it matters. In the words of the ticket, the design or the developer, not
  analyst-speak.
- **What does better look like?** The outcome from the user's or developer's point
  of view. What "done" means, not how it is built.
- **Who and what is affected?** The users, teams, apps and HLD container(s) that
  feel this change.
- **What is out of scope?** Explicit boundaries the developer or ticket set.
- **What are the constraints?** Things that must stay unchanged, deadlines,
  compliance or NFR limits, an approved design that is the spec.
- **What is still open?** Questions nobody could answer during Context Gathering.
  Empty is fine; never invent one.

Also keep the provenance at the top: ticket, date, and where the intent came from
(tracker, Confluence pages, approved design artifacts, the developer's message),
with links. A reader should be able to check every claim against its source.

## What it must not contain

- Implementation steps, file lists or commands. That is `1-plan.md`.
- Acceptance criteria as a checklist. The plan derives them from this document.
- The chosen solution or a diagram of it. That is the plan's `## Solution`.
- Status, progress or findings. That is `2-report.md`.

## Rules

- Write it in Context Step 4; the developer signs it off in Step 5. Afterwards only
  append to the open questions; never rewrite the confirmed answers.
- Developer input wins over tracker text when they conflict; say so where it happens.
- If an approved `solution/Architecture.md` exists, say that it is the spec and
  link it. Do not copy it.
- Keep it short. If it is longer than the plan, something that belongs in the plan
  has leaked in.

## What good looks like

A developer who has never seen the ticket reads `0-intent.md` and can say in their
own words what is being asked, for whom, where the edges are, and what is unknown.
They cannot tell from it how it will be built, and they do not need to.
