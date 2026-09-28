# Harness Bootstrap

**Version:** 7.5.0 · [Changelog](CHANGELOG.md)

The package owns reusable skills, agents, workflows, and guide templates. Permanent
project files are personalized deployments of that canonical source.

- `/harness-bootstrap launch` installs the harness and records deployment baselines.
- `/harness-bootstrap patch` asks for the direction.
- `/harness-bootstrap patch harvest [scope]` generalizes permanent improvements into
  canonical files and records a patch manifest.
- `/harness-bootstrap patch prepare [scope]` packages canonical sources already
  edited directly (no permanent file involved) into a bundle — no personalization,
  no deployment.
- `/harness-bootstrap patch apply [scope | bundle path]` personalizes current canonical
  files, or imports and deploys a supplied canonical patch.

Updated files travel as unified diffs; added files travel in full. Manifests carry
hashes, mappings, dependencies, and rationale. Project-local baselines support conflict
resolution and repeated operations. No separate packaging or synchronization mode.

Launch retains its Context → Q&A → Generation → Cleanup lifecycle and LLD/HLD
workflows. Dated reports preserve progress and project Answers. See
[entry point](SKILL.md) and [patch contract](references/patch/06-patch-state.md).

## Author

Anton Merkulov · anton.merkulov@dataart.com
