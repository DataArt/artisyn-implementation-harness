---
skill: agents/docs-writer
output: {{provider:agents_root}}/docs-writer.{{provider:agent_extension}}
---

## Purpose

When adding, renaming or removing pages, verify existing documentation-site navigation
still resolves. This responsibility is conditional on a site configuration being
present; it does not require creating one.

Permanent doc writer invoked any time architecture or project docs need to be created or updated — during the design lifecycle's Publish stage, the dev lifecycle's Document stage, or any inline conversation. Reads the project's Documentation Principles article before writing, enforces diagram-first format with colored Mermaid, and applies the certainty principle. Also maintains existing docs-site navigation when pages are added, renamed or removed.

## Substitutions

| Placeholder                  | Source                          | Notes                                                        |
| ---------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `{{DOC_PRINCIPLES_ARTICLE}}` | Q — Doc Principles article path | e.g. `docs/Engineering Guide/Documentation/01 Principles.md` |
| `{{DOC_STRUCTURE_ARTICLE}}`  | Q — Doc Structure article path  | e.g. `docs/Engineering Guide/Documentation/02 Structure.md`  |

## Conditionals

None.

## Verify checklist

- [ ] `{{DOC_PRINCIPLES_ARTICLE}}` resolves to a file that exists in the project
- [ ] `{{DOC_STRUCTURE_ARTICLE}}` resolves to a file that exists in the project
- [ ] Agent description mentions it can be invoked from any phase (not just the Publish stage)
- [ ] Agent points to Core doc principles in `{{DOC_PRINCIPLES_ARTICLE}}` rather than restating diagram/coloring/certainty/length rules
- [ ] Output format (one-line summary per doc) is described
