/**
 * Context topologies to choose between before `/implementation-harness launch`. The launch
 * options are the real ones: launch question Q10b asks for the design scope (Project-scoped,
 * Product-context-scoped or Two-track, skills/implementation-harness/references/launch/
 * 02-launch-questions.md), and Q2 detects the monorepo tool. The layers follow
 * docs/Harness/00 The Story/02 Context Landscape.md.
 */

/** The map analogy from the Context Landscape: each layer is one zoom level of the same journey. */
export type ContextLayer = {
  name: string;
  zoom: 'Country' | 'City' | 'Street';
  question: string;
  owner: string;
  /** The harness setup that can keep this layer. */
  keptBy?: 'product' | 'project';
  gap?: boolean;
};

export const CONTEXT_LAYERS: ContextLayer[] = [
  {
    name: 'Business context',
    zoom: 'Country',
    question: 'Where are we going, and why this route?',
    owner: 'Owned by the business',
  },
  {
    name: 'Technical context',
    zoom: 'City',
    question: 'What are the standards and platforms?',
    owner: 'Governed centrally, or by a product-level harness',
    keptBy: 'product',
  },
  {
    name: 'Integration context',
    zoom: 'City',
    question: 'How do the projects talk to each other?',
    owner: 'Negotiated and documented, or kept by a product-level harness',
    keptBy: 'product',
  },
  {
    name: 'Project context',
    zoom: 'Street',
    question: 'What is the exact move to make right now?',
    owner: 'Nobody owns it by default',
    keptBy: 'project',
    gap: true,
  },
];

export type HarnessKind = 'project' | 'product' | 'two-track';

export type Repo = {
  name: string;
  harness?: HarnessKind;
  /** Apps or services inside the repo, each with its technology. */
  apps?: { name: string; tech: string }[];
  /** A folder of shared product context inside the repo. */
  productFolder?: string;
  /** A file in the repo that lists other repos, e.g. mani.yaml. */
  manifest?: string;
  /** Workspace repos list the repos they coordinate, grouped by tag. */
  clusters?: { tag: string; repos: string[] }[];
  dashed?: boolean;
};

export type Topology = {
  id: string;
  name: string;
  short: string;
  recommended?: boolean;
  summary: string;
  /** Repos drawn from top to bottom; `above` sits over the others as the product layer. */
  above?: Repo;
  repos: Repo[];
  footnote: string;
  fits: string[];
  launch: string[];
  watch: string[];
  /** A worked example shown under this topology only. */
  example?: { caption: string; code: string; link: { href: string; label: string } };
};

export const HARNESS_LABEL: Record<HarnessKind, string> = {
  project: 'Project harness',
  product: 'Product harness',
  'two-track': 'Two-track harness',
};

export const TOPOLOGIES: Topology[] = [
  {
    id: 'workload-monorepo',
    name: 'One workload, one monorepo',
    short: 'Monorepo',
    recommended: true,
    summary:
      'One repository around one workload: the same release cycle, the same team and the same task board, even when the apps use different technologies.',
    above: { name: 'product repo (optional)', harness: 'product', dashed: true },
    repos: [
      {
        name: 'workload monorepo',
        harness: 'project',
        apps: [
          { name: 'web', tech: 'Frontend' },
          { name: 'api', tech: 'Backend' },
          { name: 'pipelines', tech: 'Data' },
        ],
      },
    ],
    footnote: 'Same release cycle · one team · one task board',
    fits: [
      'The apps ship together and one team plans them on one board',
      'Frontend, backend and data code change in the same pull requests',
      'You can choose the repository layout, or consolidate a few repos',
    ],
    launch: [
      'Run `/implementation-harness launch` in the monorepo root',
      'Design scope: Project-scoped (the default)',
      'Launch detects the monorepo tool: Nx, Turborepo, Lerna or pnpm workspaces',
      'Later, a product harness in its own repo can design across several workloads',
    ],
    watch: [
      'Keep one workload per repo: a monorepo of unrelated products blurs the context',
      'Record each app’s boundaries in the architecture docs so the agent keeps them',
    ],
  },
  {
    id: 'product-inside',
    name: 'One repo, the product inside',
    short: 'Two-track',
    summary:
      'A single repository holds the product and its apps. One harness keeps two kinds of context: the shared product architecture and each project’s own.',
    repos: [
      {
        name: 'product repo',
        harness: 'two-track',
        productFolder: 'docs/Product Context',
        apps: [
          { name: 'app one', tech: 'Service' },
          { name: 'app two', tech: 'Service' },
          { name: 'app three', tech: 'Site' },
        ],
      },
    ],
    footnote: 'This site works this way: docs/Harness is the product track',
    fits: [
      'The product and its apps already live in one repository',
      'Product decisions and project decisions are made by the same people',
      'You want cross-app design and per-app design in one flow',
    ],
    launch: [
      'Run `/implementation-harness launch` once, in the repository root',
      'Design scope: Two-track',
      'Product context folder: an existing shared folder, or docs/Product Context',
      'Each design session then picks its track: product or project',
    ],
    watch: [
      'Keep the product folder for decisions that span apps, not for one app’s detail',
      'Name the apps as containers so project docs and product docs stay apart',
    ],
  },
  {
    id: 'many-repos',
    name: 'Many repos, a product on top',
    short: 'Many repos',
    summary:
      'Legacy repositories, structured however history left them. Each gets its own project harness; a product harness on top designs and governs how they interact.',
    above: { name: 'product repo', harness: 'product' },
    repos: [
      { name: 'repo A', harness: 'project', apps: [{ name: 'portal', tech: 'Frontend' }] },
      { name: 'repo B', harness: 'project', apps: [{ name: 'orders', tech: 'Backend' }] },
      { name: 'repo C', harness: 'project', apps: [{ name: 'reports', tech: 'Data' }] },
    ],
    footnote: 'The product layer owns the integration contracts between repos',
    fits: [
      'Repos have separate owners, release cycles or boards you cannot merge',
      'Cross-repo features and contracts keep going wrong',
      'Each repo needs its own record of what was decided and built',
    ],
    launch: [
      'Launch each repository with Design scope: Project-scoped',
      'Create a product repo and launch it with Design scope: Product-context-scoped',
      'Design features that cross repos in the product repo, then deliver them per repo',
    ],
    watch: [
      'Start with the repos that change most; launch the rest as work reaches them',
      'Keep integration contracts in the product context, not copied into every repo',
    ],
  },
  {
    id: 'mani-workspace',
    name: 'Hundreds of repos, one workspace',
    short: 'Repo per service',
    summary:
      'A legacy estate with a repository per microservice. Launching a harness in each one does not scale; a workspace repo coordinates them by cluster instead.',
    repos: [
      {
        name: 'workspace repo',
        harness: 'two-track',
        productFolder: 'docs/Product Context',
        manifest: 'mani.yaml',
        clusters: [
          { tag: 'payments', repos: ['payments-api', 'ledger', 'payouts'] },
          { tag: 'catalog', repos: ['catalog-api', 'search', 'pricing'] },
          { tag: 'identity', repos: ['auth', 'profiles', 'sessions'] },
        ],
      },
    ],
    footnote: '…and hundreds more, each tagged with its cluster',
    fits: [
      'Repositories per microservice number in the dozens or hundreds',
      'Services group naturally into clusters that change together',
      'You cannot restructure the repositories, only coordinate them',
    ],
    launch: [
      'Create a workspace repository with mani (github.com/alajmo/mani)',
      'List every repository in mani.yaml and tag it with its cluster',
      'Run `mani sync` to clone them, and `mani run <task> --tags <cluster>` across a cluster',
      'Launch the harness in the workspace repo; Two-track keeps the product context there',
    ],
    watch: [
      'Define clusters by what changes together, not by the organisation chart',
      'Keep each cluster’s architecture docs in the workspace, next to its tag',
    ],
    example: {
      caption: 'mani.yaml in the workspace repo: every repository, tagged with its cluster',
      code: `projects:
  payments-api:
    url: git@github.com:acme/payments-api.git
    tags: [payments]
  ledger:
    url: git@github.com:acme/ledger.git
    tags: [payments]
  catalog-api:
    url: git@github.com:acme/catalog-api.git
    tags: [catalog]

tasks:
  status:
    cmd: git status --short`,
      link: { href: 'https://github.com/alajmo/mani', label: 'mani on GitHub' },
    },
  },
];

export const CHECKLIST = [
  'Which code ships together on one release cycle? That is one workload.',
  'Which team and which task board own it?',
  'Which repositories change together in the same feature?',
  'Where will shared product decisions live, and who owns them?',
  'Which integration contracts cross a repository boundary?',
  'Which existing docs are current enough for the harness to start from?',
];
