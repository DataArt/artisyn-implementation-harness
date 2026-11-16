# Root instructions interface

The root instruction file is the one file every session loads: `CLAUDE.md` for
Claude, `AGENTS.md` for Codex, `.github/copilot-instructions.md` for Copilot. It is
the highest-leverage file in the harness. It points; it does not inline. Length
stays within the Documentation Principles budget for root context (60–130 prose
lines). Launch generates a scaffold from this interface and the project's facts;
the team edits it by hand afterwards.

This is an interface, not a template. It says what the file must contain and why.
Headings and order may vary, but every category below must be present and
recognisable. The registry's `structure` row for the root file checks against it.

## Required categories

**Why.** Two or three sentences: what the project is and what the harness does for
it. A new session should know what it is working on before any rule.

**What: conventions.** A pointer to the Conventions article, plus the few rules that
are hard stops and must be visible without a read: guarded commands the assistant
never runs itself, values that must never be hardcoded, commit and branch format,
package manager. Keep the inline list short; the article holds the rest.

**What: architecture.** The containers with role and stack, one table. The data
flow in one or two lines. A pointer to the active HLD version via its README, never
a hardcoded version name.

**What: NFRs.** A pointer to the active NFR requirements plus the one or two
constraints that change everyday decisions.

**How: lifecycles.** The installed skills with one-line purposes, and the stage
commands for each selected lifecycle in order. Use the provider's invocation prefix.

**How: agents.** The installed agents with their layer and tools, one table, so the
assistant delegates to the right role instead of doing the work itself.

**How: tracker and integrations.** The issue tracker, who talks to it (the scrum
agent, never a skill directly), where story folders live, and how MCP servers are
configured and enabled. No credentials, ever.

**How: work outside a ticket.** Code often lands in plain chat with no lifecycle
run active (no dev story, no design or evolve session): a component, a fix, a
refactor. The code is verified as usual, but nothing
updates the permanent docs, so they drift. The root file must instruct the
assistant that, once a logical change is done (not after every edit), it spawns the
docs-writer agent without asking and has it align the docs with the diff: the
container's LLD doc, the app README and any Engineering Guide article naming the
changed behaviour. The agent gets the changed files and the session's reasoning and
applies the doc principles and terminology itself. Each doc it writes is indexed
into the operational graph; an index failure is reported in one line and never
blocks. The developer reviews doc changes in the same diff as the code. Typo,
formatting and comment edits are exempt. The dev lifecycle's Document stage is never
used for this; it requires a story that passed Test.

## Must not contain

- Deployment configuration values (regions, account IDs, hostnames) or credentials.
- Rules duplicated from an article; link the article instead.
- Another provider's paths or invocation syntax.
- Generated prose nobody edited: a root file that reads like boilerplate is
  rewritten by hand before launch closes.
