# Engineer Role

![Engineer Role](/images/engineering-guide/engineer-role.png)

> **Engineer = creative direction. AI = follows the workflow and assists with implementation.**

## The Mental Model

Think of the AI assistant as a senior pair-programmer who knows the codebase conventions inside out, never forgets a checklist, and can type faster than any human — but still needs _you_ to decide what to build and why.

The engineer owns the problem. The AI owns the execution.

## What the Engineer Does

- **Defines the goal** — picks up the ticket, understands the business context, decides the approach
- **Makes architectural calls** — chooses patterns, resolves trade-offs, says "no" when a suggestion doesn't fit
- **Reviews every step** — the AI stops at each phase boundary; the engineer reads the output and approves or redirects
- **Catches what the AI can't** — domain nuance, product intent, "this is technically correct but wrong for us"

## What the AI Does

- **Follows the workflow** — runs the `/dev` lifecycle (Plan → Implement → Test → Document) without skipping steps
- **Knows the conventions** — reads the skills, respects the architecture, applies project-specific rules automatically
- **Implements incrementally** — one step at a time, surfacing blockers early rather than delivering a big surprise
- **Keeps the docs honest** — updates READMEs and skills as part of the same task, not as an afterthought

## Division of Responsibility

| Concern             | Owner         | Reason                                                 |
| ------------------- | ------------- | ------------------------------------------------------ |
| What to build       | Engineer      | Requires business context and product judgement        |
| How to structure it | Engineer + AI | Collaborative — AI proposes, engineer decides          |
| Writing the code    | AI            | AI is fast and consistent; engineer reviews            |
| Testing             | AI + Engineer | AI runs the suite; engineer validates intent           |
| Documentation       | AI            | AI has full context of what changed; engineer approves |

## In Practice

The engineer is never idle. While the AI is implementing, the engineer is reading the plan, thinking ahead, spotting risks. The moment the AI pauses for confirmation, the engineer is ready with a decision — not catching up.

This keeps velocity high without trading away quality or ownership.

---

→ See `Engineering Guide/Lifecycles/01 Dev Lifecycle.md` for the ticket-to-PR process.
→ See `Engineering Guide/04 AI Coding Tool Compatibility.md` for how the harness maps to specific AI tools.
