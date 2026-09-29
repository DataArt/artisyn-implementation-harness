An Nx-shaped project with four distinct, real containers (`fe`, `be`,
`infra`, `mobile`), each carrying its own genuine evidence
(`react`/`express`/`aws-cdk-lib`/`react-native` in each `package.json`) so
launch's Q2/Q3 evidence-based detection has real signal to work from instead
of a single placeholder app. No `docs/` at all, and only a one-line root
README — docs (root README, Engineering Guide, HLD, LLD, per-container
agents) are meant to be generated _by_ a from-scratch launch against this
fixture, not pre-seeded, so a case using this fixture can grade what launch
actually produces rather than drift against something we hand-authored.

Expect a real launch selection over this fixture to produce one `layer`
agent instance per container (`fe`, `be`, `infra`, `mobile` — see
`agentInstanceKnowns` in testkit/build-launch.ts, `LAYER_PATH` pointing at
each `apps/<name>`), not just skills, and an HLD with all four containers
documented (not a subset) — a docs-adoption grader against this fixture
should treat a missing container-to-agent mapping, or a container HLD omits,
as a real gap.
