# Architecture interface

`Architecture.md` is the authoritative, integrated end-to-end solution record for
the story. Use it when the solution changes system, container, component ownership,
deployment topology or a cross-boundary contract. It must capture the complete
chosen solution and every settled decision made during Frame, Research, Evaluate,
Solution drafting, review and feedback. State the affected boundary and the
intended responsibility distribution. Show the relevant C4 level or supporting
view: system context, containers, deployment, dynamic flow or another justified
diagram.

Describe relationships, communication purpose, data/control crossings, technology
constraints and confirmed architectural decisions. For each material decision,
record the chosen outcome, scope and ownership, affected interfaces or contracts,
failure/recovery and operational or security consequences, and how it will be
verified. Trace representative user and system flows end to end, including normal,
failure and recovery paths where they affect the design. Reference existing
HLD/LLD/NFR documents and describe the solution delta rather than copying them.

Do not invent containers for folders, teams or tools. Do not put implementation
classes or unconfirmed target requirements in this artifact. Supporting artifacts
(`Design.md`, `Stack.md` and `Efforts.md`) may add detail, but may not introduce a
material decision absent from or conflicting with `Architecture.md`; add a concise
decision and consequence there first. Record affected architecture documents and
verification obligations for the publish phase.

## Ways to express this design

- A container or boundary diagram plus a short responsibility table can explain
  ownership, communication purpose and what changes. Label the abstraction level;
  link component internals to the implementation design rather than mixing levels.
- A sequence diagram can trace a business transaction or data flow across those
  boundaries, including a consequential failure or recovery path.
- A deployment or trust-boundary view can clarify placement, identity, network
  access or fault isolation when these determine the architecture.

## What good looks like

A reader can locate every changed responsibility, trace each representative scenario
through named boundaries, and understand the contracts, decisions and failure
consequences without reopening research or evaluation files.
Accompanying descriptions explain responsibilities and constraints the diagram
cannot express clearly; they do not merely narrate its arrows.

For example, an integration change might combine a container delta, an ownership
table and a cross-system sequence. A hosting change might instead use deployment
placement and failover flow. These are optional compositions, not mandatory headings.
