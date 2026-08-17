---
skill: agents/docs-writer
output: .claude/agents/docs-writer.md
---

## Purpose

Permanent doc writer invoked any time architecture or project docs need to be created or updated — during design-publish, dev-document, or any inline conversation. Reads the project's Documentation Principles article before writing, enforces diagram-first format with colored Mermaid, and applies the certainty principle. Replaces the old `writing-docs` skill.

## Substitutions

| Placeholder                  | Source                          | Notes                                                        |
| ---------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `{{DOC_PRINCIPLES_ARTICLE}}` | Q — Doc Principles article path | e.g. `docs/Engineering Guide/09 Documentation Principles.md` |
| `{{DOC_STRUCTURE_ARTICLE}}`  | Q — Doc Structure article path  | e.g. `docs/Engineering Guide/10 Doc Structure.md`            |

## Conditionals

None.

## Verify checklist

- [ ] `{{DOC_PRINCIPLES_ARTICLE}}` resolves to a file that exists in the project
- [ ] `{{DOC_STRUCTURE_ARTICLE}}` resolves to a file that exists in the project
- [ ] Agent description mentions it can be invoked from any phase (not just design-publish)
- [ ] Coloring table lists at least 4 semantic color roles
- [ ] Certainty principle is stated
- [ ] Output format (one-line summary per doc) is described
