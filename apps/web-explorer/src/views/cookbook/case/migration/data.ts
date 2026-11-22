/**
 * Measured facts of the Vite → Next.js migration (DESIGN-20261121-UU4L), taken from the run's
 * own records, not estimated:
 * - design lifecycle: docs/Stories/design/approved/[DESIGN-20261121-UU4L] …/design/stat.json
 * - dev lifecycle: docs/Stories/design/approved/[DESIGN-20261121-UU4L] …/impl/stat.json and 2-report.md
 * - the merge commit a78baf3 (squash of PR #24)
 * Minutes are rounded to the nearest minute.
 */

/** The whole story in one folder: design/, solution/ and impl/. */
export const STORY_FOLDER =
  'docs/Stories/design/approved/[DESIGN-20261121-UU4L] Web Explorer Next.js Static Export';

export type Headline = { value: string; label: string; detail: string };

export const HEADLINES: Headline[] = [
  {
    value: '4h 21m',
    label: 'of agent work',
    detail: '51 min to design it, 3 h 30 min to build, test and document it',
  },
  {
    value: '31',
    label: 'delivery steps',
    detail: '27 planned up front, 4 added mid-flight by the developer, all done',
  },
  {
    value: '188',
    label: 'files changed',
    detail: '+22,068 / −1,989 lines across 4 containers and 2 workflows',
  },
  {
    value: '48',
    label: 'decisions on record',
    detail: '23 architecture decisions and 25 developer sign-offs and choices',
  },
  {
    value: '58',
    label: 'findings, 0 open',
    detail: 'caught by five review layers; 43 fixed, 10 documented, 4 accepted, 1 debt',
  },
  {
    value: '151',
    label: 'tests written',
    detail: '211 recorded checks; the 5 that failed were fixed and rerun',
  },
  {
    value: '25',
    label: 'docs brought up to date',
    detail: 'HLD, LLD, engineering guides and READMEs, in the same pull request',
  },
  {
    value: '58 → 97',
    label: 'landing performance',
    detail: 'Lighthouse mobile score; blocking time 4,290 → 50 ms',
  },
];

/** Where each of the 58 findings was first caught. */
export const FINDINGS_BY_STAGE = [
  { label: 'Plan audit', value: 29 },
  { label: 'Implementation review', value: 8 },
  { label: 'Test-stage review', value: 18 },
  { label: 'Documentation audit', value: 3 },
];

/** How the 58 findings were closed. */
export const FINDINGS_BY_RESOLUTION = [
  { label: 'Fixed', value: 43 },
  { label: 'Docs updated', value: 10 },
  { label: 'Accepted by the developer', value: 4 },
  { label: 'Tracked as debt', value: 1 },
];

/** Deviations from the approved design, each with a recorded decision. */
export const DEVIATIONS = [
  {
    label: 'Extensions',
    value: 6,
    note: 'scope the developer added: agent tools, the agents page, llms.txt',
  },
  {
    label: 'Contradictions',
    value: 5,
    note: 'built differently from a settled decision, each accepted',
  },
  { label: 'Omissions', value: 2, note: 'requirements not met, fixed or ruled out' },
];

export type Comparison = { metric: string; before: string; after: string; note?: string };

/** Lighthouse 13.4.1, mobile, simulated throttling, same local setup before and after. */
export const BEFORE_AFTER: Comparison[] = [
  { metric: 'Performance score (landing page)', before: '58', after: '97' },
  { metric: 'Total blocking time (landing page)', before: '4,290 ms', after: '50 ms' },
  { metric: 'First contentful paint (landing page)', before: '2.6 s', after: '0.9 s' },
  { metric: 'Largest contentful paint (landing page)', before: '2.8 s', after: '2.7 s' },
  { metric: 'Pages a crawler can index', before: '1 (hash routes)', after: '16 at real URLs' },
  { metric: 'SEO score, indexable pages', before: '100 (one page)', after: '100 on all 16' },
  { metric: 'Tools for browser agents', before: 'none', after: '5 WebMCP tools' },
  {
    metric: 'JavaScript and CSS on the landing page (gzip)',
    before: '147 KB',
    after: '244 KB',
    note: 'larger; accepted, with no measured cost to users',
  },
];

export const CONSISTENT = [
  {
    title: 'Code',
    body: '17 routes at merge, pre-rendered at real URLs, each with its own metadata and a hashed Content Security Policy that the build checks page by page.',
  },
  {
    title: 'Tests',
    body: '43 unit cases, 105 browser cases and a Lighthouse gate on every route, wired into CI so a regression fails the pull request.',
  },
  {
    title: 'Docs',
    body: 'Architecture, component and runbook docs rewritten in the same change, checked by an architecture audit and three consistency rounds.',
  },
  {
    title: 'Decisions',
    body: 'Every deviation, accepted risk and piece of debt is written down with who decided it and why, so the next change starts from facts.',
  },
];

export type Gain = {
  area: string;
  metric: string;
  before: string;
  after: string;
  value: string;
};

/** What the migration made the site capable of, at merge. "Before" is main at a1f1997. */
export const GAINS: Gain[] = [
  {
    area: 'Static pages',
    metric: '17 pages',
    before: 'one HTML shell, hash routes',
    after: 'every route pre-rendered at a real URL',
    value:
      'Content is in the HTML on arrival: first paint 2.6 → 0.9 s, nothing for a crawler to run.',
  },
  {
    area: 'Search engines',
    metric: 'SEO 100 × 16',
    before: 'one description, four Open Graph tags',
    after: 'per-page title, canonical, Open Graph, keywords, JSON-LD and a sitemap',
    value: 'Each page can be found, previewed and understood on its own.',
  },
  {
    area: 'AI agents',
    metric: '5 tools',
    before: 'nothing an agent could call',
    after: 'WebMCP tools over 2 indexes, plus llms.txt',
    value: 'A browser agent can search 119 pages, read them and open a workflow without scraping.',
  },
  {
    area: 'Security',
    metric: '1 policy per page',
    before: 'one shared policy allowing Google Fonts and data: images',
    after: 'a hashed policy per page, no third-party hosts, fonts self-hosted',
    value: 'The build rebuilds every policy and fails on any drift or unhashed script.',
  },
  {
    area: 'Tests',
    metric: '148 cases',
    before: 'no test or e2e target',
    after: '105 browser cases and 43 unit cases',
    value:
      'CSP, hydration, old links, navigation, agent tools and accessibility are checked in a real browser.',
  },
  {
    area: 'CI/CD',
    metric: 'every PR',
    before: 'lint, typecheck, test and build',
    after: 'plus browser tests and Lighthouse on every affected pull request',
    value: 'A broken page, policy or agent tool fails the pull request before it can merge.',
  },
  {
    area: 'Lighthouse',
    metric: 'every route',
    before: 'not measured; the baseline run scored the landing page 58',
    after: 'an Nx target that gates SEO and agent readiness; landing page 97',
    value: 'Search and agent readiness cannot quietly regress.',
  },
  {
    area: 'Accessibility',
    metric: 'WCAG 2.2 AA',
    before: 'no automated check',
    after: 'an axe check on every page, with a baseline that only shrinks',
    value: 'Known gaps are listed and owned; new ones fail the build.',
  },
];

export type LifecycleStage = {
  name: string;
  /** Tracked minutes, rounded; 0 means under half a minute. */
  work: number;
  wait: number;
  produced: string[];
  decidedBy: string;
};

export type Lifecycle = {
  id: 'design' | 'development';
  name: string;
  command: string;
  summary: string;
  stages: LifecycleStage[];
};

/** Per-stage facts from the design and impl stat.json, design/Report.md and impl/2-report.md. */
export const LIFECYCLES: Lifecycle[] = [
  {
    id: 'design',
    name: 'Solution Design',
    command: '/design',
    summary: '2 decisions researched, 23 architecture decisions, HLD updated before any code',
    stages: [
      {
        name: 'Context & ceremony',
        work: 0,
        wait: 13,
        produced: ['The developer intent captured', 'A design branch and story folder'],
        decidedBy: 'Developer sign-off',
      },
      {
        name: 'Frame',
        work: 3,
        wait: 14,
        produced: [
          '11 evaluation criteria',
          '6 known and 4 proposed requirements',
          '2 decisions to make: rendering and routing, and security headers',
        ],
        decidedBy: 'Developer sign-off on the decisions and the frame',
      },
      {
        name: 'Research',
        work: 0,
        wait: 24,
        produced: [
          '4 options per decision from @architect',
          'Routing: catch-all with React Router, App Router shell, App Router Server Components, Pages Router',
          'Security: four ways to deliver a Content Security Policy on GitHub Pages',
        ],
        decidedBy: 'Developer sign-off',
      },
      {
        name: 'Evaluate',
        work: 6,
        wait: 17,
        produced: [
          'Every option scored against the 11 criteria',
          'Chosen: App Router with Server Components, and a hashed policy per page',
          'A spike on Next.js 16.4.6 to measure the inline scripts',
        ],
        decidedBy: 'Developer sign-off, which revised the routing pick',
      },
      {
        name: 'Solution',
        work: 27,
        wait: 7,
        produced: [
          'Architecture with 23 decisions, 2 design specs, the stack and the effort plan',
          'Architect review in 2 rounds: 8 material and 22 mechanical points, all resolved',
          'Well-Architected review across 6 pillars: 1 priority item, resolved',
        ],
        decidedBy: 'Developer sign-off and approval',
      },
      {
        name: 'Review gate',
        work: 0,
        wait: 0,
        produced: ['Self-approved; the merge-request review was waived by the developer'],
        decidedBy: 'Developer',
      },
      {
        name: 'Publish',
        work: 13,
        wait: 68,
        produced: [
          'HLD updated: Web Explorer, Web Portal, Web Docs, System Overview, System Sizing',
          'NFR-16 to NFR-19 added, NFR-7 extended, accessibility requirements updated',
          'Architect review of the published docs',
        ],
        decidedBy: 'Developer sign-off',
      },
      {
        name: 'Completion',
        work: 2,
        wait: 1,
        produced: ['The design archived as approved, ready for delivery'],
        decidedBy: 'Developer sign-off',
      },
    ],
  },
  {
    id: 'development',
    name: 'Development',
    command: '/dev',
    summary: '31 steps, 27 acceptance criteria met, docs and tests in the same pull request',
    stages: [
      {
        name: 'Context & ceremony',
        work: 1,
        wait: 14,
        produced: ['Intent: all 8 design units, on the design branch', 'Metrics tracking started'],
        decidedBy: 'Developer sign-off',
      },
      {
        name: 'Plan',
        work: 32,
        wait: 11,
        produced: [
          '27 steps, tests first, each with its own checks',
          '27 acceptance criteria',
          'Plan audit: 29 findings fixed before any code changed',
        ],
        decidedBy: 'Developer plan sign-off',
      },
      {
        name: 'Implement',
        work: 103,
        wait: 39,
        produced: [
          '31 steps: 27 planned and 4 added by the developer mid-flight',
          'Routing, metadata, hashed policies, agent tools and gates',
          'Implementation review: 8 findings; WebMCP tools checked live in Chrome',
        ],
        decidedBy: 'Developer decisions on the CSP sources, bundle size, panel heights and CI',
      },
      {
        name: 'Test',
        work: 35,
        wait: 35,
        produced: [
          '27 of 27 acceptance criteria proven',
          'Component review and architecture audit: 18 findings',
          'CI on the pull request: Linux sandbox, origin trial and harness version fixed',
        ],
        decidedBy: 'Developer decisions on the version gate and the WCAG ratchet',
      },
      {
        name: 'Document',
        work: 37,
        wait: 5,
        produced: [
          '25 docs updated across HLD, LLD, guides and READMEs',
          'HLD deviation audit: every deviation decided',
          '3 consistency rounds, the last one clean',
        ],
        decidedBy: 'Developer sign-off; one accepted deviation',
      },
      {
        name: 'Completion',
        work: 1,
        wait: 0,
        produced: ['Story closed, metrics finalised, PR text written'],
        decidedBy: 'Developer sign-off',
      },
    ],
  },
];
