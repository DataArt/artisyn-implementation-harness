/**
 * The harness lifecycles an agent can open (open_workflow) or read about
 * (get_harness_capabilities). Each points at its Web Docs article under
 * docs/Harness/03 Lifecycles/; names and phases follow those articles' titles.
 * Plain Node imports this file in tests, so it keeps to erasable TypeScript.
 */
export const WORKFLOW_IDS = ['dev', 'design', 'evolve', 'architecture', 'documents-flow'] as const;
export type WorkflowId = (typeof WORKFLOW_IDS)[number];

export type Workflow = {
  id: WorkflowId;
  name: string;
  commands: string[];
  phases: string;
  purpose: string;
  /** Article path under docs/, without the .md extension. */
  docsSource: string;
};

export const WORKFLOWS: Workflow[] = [
  {
    id: 'dev',
    name: 'Dev lifecycle',
    commands: ['/dev'],
    phases: 'Context → Ceremony → Plan → Implement → Test → Document → Completion',
    purpose: 'Delivers an authorized ticket end to end.',
    docsSource: 'Harness/03 Lifecycles/01 Dev Lifecycle',
  },
  {
    id: 'design',
    name: 'Design lifecycle',
    commands: ['/design'],
    phases: 'Frame → Research → Evaluate → Solution → Review → Address Feedback → Publish',
    purpose: 'Produces an approved architectural design before implementation.',
    docsSource: 'Harness/03 Lifecycles/02 Design Lifecycle',
  },
  {
    id: 'evolve',
    name: 'Evolve lifecycle',
    commands: ['/evolve'],
    phases: 'Reflect → Triage → Draft → Validate → Adopt',
    purpose: 'Improves harness skills, agents and conventions from observed friction.',
    docsSource: 'Harness/03 Lifecycles/03 Evolve Lifecycle',
  },
  {
    id: 'architecture',
    name: 'Architecture lifecycle',
    commands: ['/war', '/where-we-are'],
    phases: 'Audit commands, run on demand',
    purpose: 'Checks that design, implementation and documentation stay aligned.',
    docsSource: 'Harness/03 Lifecycles/04 Architecture Lifecycle',
  },
  {
    id: 'documents-flow',
    name: 'Documents flow',
    commands: ['/design publish', '/dev document'],
    phases: 'Working drafts per ticket → permanent docs',
    purpose:
      'Shows how documentation moves from ticket-scoped working files to its permanent home.',
    docsSource: 'Harness/03 Lifecycles/05 Documents Flow',
  },
];

/** Web Docs URL of a workflow's article (VitePress serves pages as .html). */
export const workflowUrl = (workflow: Workflow, docsUrl: string): string =>
  `${docsUrl.replace(/\/?$/, '/')}${workflow.docsSource.split('/').map(encodeURIComponent).join('/')}.html`;
