# Implementation design interface

Use when the solution changes behavior, state, algorithms, contracts or internal
component structure. Explain the selected behavior from trigger/input through
processing, state/data changes, outputs and relevant failure or recovery paths.

State changed interfaces, schemas, events, commands, validation and compatibility
rules with evidence or confirmed decisions. Include security, performance,
reliability, accessibility, observability or cost concerns only when they affect
this design; link approved NFRs instead of duplicating them.

Identify implementation boundaries, migration or rollout obligations and the tests,
checks, exercises or measurements that verify the result. Avoid fixed security,
observability and testing sections when they do not apply. Record unresolved choices
in the design report, not as placeholders in the published artifact.

## Ways to express this design

- A component diagram plus descriptions of responsibilities and provided/required
  contracts can show the internal structure within the affected container. Use
  meaningful design components rather than a catalogue of source files or classes.
- Sequence diagrams can explain important interactions: request validation, state
  changes, external calls, response delivery, and material failure/recovery branches.
- State machines can specify lifecycle transitions; schemas and concrete payload
  examples can clarify data ownership, validation and compatibility.
- A UI mockup or interaction flow can make user decisions, loading/empty/error
  states, navigation and accessibility behavior tangible when the problem is visual.

## What good looks like

An implementer can trace an input to its observable outcome, identify which
component owns each step, and understand the contract at every affected boundary.
Failure behavior is concrete enough to verify. Diagrams, descriptions and examples
use consistent names and each contribute information rather than duplicate it.

An API change might use a component view, a request/response example and an error
sequence. A workflow change might use a state machine and transition rules. A UI
feature might combine a mockup, component responsibilities and a save/retry sequence.
Choose or invent the composition that best explains this problem.
