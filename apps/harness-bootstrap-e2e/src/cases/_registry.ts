import type { CaseEntry } from './_types.ts';

/** Case names and paths only; importing the registry never registers tests. */
export const cases: CaseEntry[] = [
  {
    id: 'boot-claude-from-scratch-greenfield',
    path: 'src/cases/boot-claude-from-scratch-greenfield.spec.ts',
  },
  {
    id: 'boot-codex-from-scratch-greenfield',
    path: 'src/cases/boot-codex-from-scratch-greenfield.spec.ts',
  },
  { id: 'design-dev-claude', path: 'src/cases/design-dev-claude.spec.ts' },
  { id: 'design-dev-codex', path: 'src/cases/design-dev-codex.spec.ts' },
  { id: 'dev-claude', path: 'src/cases/dev-claude.spec.ts' },
  { id: 'dev-codex', path: 'src/cases/dev-codex.spec.ts' },
  { id: 'patch-prepare-apply', path: 'src/cases/patch-prepare-apply.spec.ts' },
  { id: 'reindex-graph', path: 'src/cases/reindex-graph.spec.ts' },
];
