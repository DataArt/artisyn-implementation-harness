/**
 * Real numbers, pulled from the repo on 2026-08-26.
 * Sources: git log, file counts, docs/, .claude/, apps/tools/delivery-report/data/*.json
 */

export const asOf = 'August 26, 2026';

export const scale = {
  months: 5,
  commits: 1220,
  contributors: 7,
  nxProjects: 13,
  loc: 187265,
  testFiles: 129,
  migrations: 54,
  webComponents: 258,
  docFiles: 545,
  docLines: 84780,
  storiesTotal: 161,
  storiesArchived: 146,
  storiesActive: 15,
};

export const harness = {
  skillsRules: 20,
  skillsCommands: 32,
  skillsDrafts: 10,
  agents: 12,
  reflections: 107,
  reflectionsTriaged: 93,
  triageRuns: 7,
};

export const commitsByMonth = [
  { label: 'Apr', value: 189, note: 'Bootstrap, cloud infrastructure, first harness' },
  { label: 'May', value: 163, note: 'Data layer: raw queries → ORM, warehouse conventions' },
  { label: 'Jun', value: 127, note: 'Precompute pattern, data pipeline incident' },
  {
    label: 'Jul',
    value: 390,
    note: 'Migration to the managed CI/CD platform, Discovery, Rankings',
  },
  { label: 'Aug', value: 351, note: 'Shortlists, Evidence, QA cycle, x-ray' },
];

export const locByLayer = [
  { label: 'Web (React)', value: 89681, display: '89,700 lines' },
  { label: 'Libs (data, clients)', value: 40847, display: '40,800 lines' },
  { label: 'BFF (backend-for-frontend)', value: 29640, display: '29,600 lines' },
  { label: 'Internal tools', value: 15674, display: '15,700 lines' },
  { label: 'Compute (ETL)', value: 9519, display: '9,500 lines' },
  { label: 'Infra (IaC)', value: 1904, display: '1,900 lines' },
];

export const reflectionsByMonth = [
  { label: 'Apr', value: 28, note: 'Infrastructure sprint, skill system laid down' },
  { label: 'May', value: 38, note: 'Data layer, PR-review patterns' },
  { label: 'Jun', value: 19, note: 'Precompute pipeline' },
  { label: 'Jul', value: 12, note: 'Curve dropping — conventions already encoded' },
  { label: 'Aug', value: 10, note: 'A handful of new patterns' },
];

export const reflectionCategories = [
  { label: 'Process', value: 30 },
  { label: 'Data', value: 17 },
  { label: 'Architecture', value: 12 },
  { label: 'Infrastructure', value: 8 },
  { label: 'DX', value: 7 },
  { label: 'Skills', value: 7 },
  { label: 'Tooling', value: 5 },
  { label: 'Frontend', value: 4 },
];

/**
 * How the steps inside tickets went, from the plans and reports of every story.
 * The unit is one implementation step inside a ticket — NOT a ticket, and not an
 * organisational blocker. `Blocked` still mixes both kinds together: waiting on
 * access or on an answer by email is in here alongside "the frontend is waiting
 * for an API". Splitting those apart needs a re-read of the reports (DECK-TODO C12).
 */
export const stepOutcomes = [
  { label: 'Went as planned', value: 289, color: '#0ca30c' },
  { label: 'Friction / rework', value: 28, color: '#fab219' },
  { label: 'Skipped', value: 7, color: '#8890aa' },
  { label: 'Blocked', value: 6, color: '#d03b3b' },
];

export const prFindings = {
  keys: ['Fixed', 'Optional', 'False positive'],
  rows: [
    { label: 'ND-101', values: [1, 3, 1] },
    { label: 'ND-102', values: [6, 3, 1] },
    { label: 'ND-153', values: [2, 3, 0] },
    { label: 'ND-168', values: [8, 2, 1] },
    { label: 'ND-176', values: [2, 5, 1] },
    { label: 'ND-178', values: [2, 3, 0] },
    { label: 'ND-179', values: [1, 10, 1] },
    { label: 'ND-181', values: [9, 5, 2] },
    { label: 'ND-184', values: [0, 3, 1] },
  ],
};

/**
 * Skill learning funnel. Values must decrease monotonically — otherwise the funnel shape lies.
 * The third stage — 20 active skills plus 10 drafts still incubating.
 */
export const skillFunnel = [
  { label: 'Reflections', value: 107, note: 'after a ticket — /evolve reflect' },
  { label: 'Passed triage', value: 93, note: '7 runs of /evolve triage' },
  { label: 'Became a rule', value: 30, note: '20 active + 10 drafts' },
  { label: 'Active now', value: 20, note: 'versioned with the repository' },
];

export const timelineEvents = [
  {
    date: '2026-04-02',
    kind: 'phase' as const,
    title: 'Kickoff',
    detail: 'Nx monorepo, warehouse connection, start of cloud provisioning.',
  },
  {
    date: '2026-04-20',
    kind: 'milestone' as const,
    title: 'Infra ready',
    detail:
      'Static hosting, managed database, container registry, app hosting — all via IaC. CI/CD live.',
  },
  {
    date: '2026-05-07',
    kind: 'milestone' as const,
    title: 'Data layer',
    detail: 'Raw queries → ORM. Warehouse conventions documented. Migration Tool.',
  },
  {
    date: '2026-06-01',
    kind: 'milestone' as const,
    title: 'Precompute',
    detail: 'Precompute pattern in the relational database, later reused by every compute story.',
  },
  {
    date: '2026-06-10',
    kind: 'incident' as const,
    title: 'Data corruption incident',
    detail:
      'Key columns overwritten across 1.58M rows during pipeline migration. Blocked 3 stories at once, recovered via precompute.',
  },
  {
    date: '2026-07-01',
    kind: 'milestone' as const,
    title: 'CI/CD migration',
    detail: 'Full migration to a managed CI/CD platform.',
  },
  {
    date: '2026-08-26',
    kind: 'phase' as const,
    title: 'Now',
    detail: '146 stories archived, 15 in progress. Project in its final phase.',
  },
];

/**
 * Planned effort — from apps/tools/delivery-report/Estimate+Team(Milestones).csv
 * Unit — a delivery iteration per the milestone plan.
 */
export const plan = {
  iterationsTotal: 27,
  iterationsM1: 17,
  iterationsM2: 6,
  iterationsStabilisation: 4,
  milestones: 17,
};

/**
 * Actual usage — from ~/.claude/stats-cache.json.
 * IMPORTANT: this is data for ONE developer on ONE machine, as of July 8, 2026.
 * Not the whole team, not the whole period. The numbers are honest, but they're a lower bound.
 */
export const usage = {
  scopeNote: 'one developer, one machine, May 28 – July 8, 2026',
  sessions: 161,
  messages: 58243,
  tokensTotal: 2_887_629_517,
  tokensOutput: 19_827_718,
  cacheReadShare: 96.1,
  models: 5,
};

/**
 * Progress against the plan, on a real date axis. Kickoff April 2, planned
 * delivery September 18 — so the whole run below sits inside the planned span,
 * and today is not the finish line.
 *
 * The run, as the team tells it: three weeks with nothing closed while the
 * process was being built, a steep climb that catches the plan at the halfway
 * mark of the planned time, a batch of new scope at the end of June — the share
 * complete drops the day it lands, because there is suddenly more to do — and
 * then back in front of the plan, which is where the project is now.
 *
 * `day` is days since kickoff. The pair at 89/90 is the scope change: same work
 * done, larger denominator.
 */
export const progressVsPlan = {
  plannedDeliveryDay: 169,
  /**
   * Curvature of the planned line. The plan is not linear: on a project whose
   * shape is understood up front you expect fast movement early, then slower
   * and slower progress as the work stabilises — the last 10% is the heavy
   * part. 0 would be a straight line; 0.9 is a visible but not extreme bend.
   */
  planCurvature: 0.9,
  nowDay: 146,
  /** Where the actual line meets the plan — end of May, climbing steeply. */
  caughtUpDay: 59,
  /** The stretch at the start where no scope was closed at all. */
  flatUntilDay: 44,
  /** New tickets landed here: the percentage drops without anything being undone. */
  scopeAddedDay: 89,
  /** Where the line comes back in front of the plan after absorbing that scope. */
  backInFrontDay: 110,
  months: [
    { label: 'Apr', day: 0 },
    { label: 'May', day: 29 },
    { label: 'Jun', day: 60 },
    { label: 'Jul', day: 90 },
    { label: 'Aug', day: 121 },
    { label: 'Sep', day: 152 },
  ],
  actual: [
    { day: 0, pct: 0 },
    { day: 44, pct: 0 },
    { day: 59, pct: 53 },
    { day: 68, pct: 63 },
    { day: 78, pct: 71 },
    { day: 89, pct: 79 },
    { day: 90, pct: 58 },
    { day: 100, pct: 67 },
    { day: 110, pct: 77 },
    { day: 122, pct: 86 },
    { day: 135, pct: 92 },
    { day: 146, pct: 96 },
  ],
};

/**
 * Where the usage numbers come from — worth saying out loud on the slide.
 * Source: local Claude Code stats on one developer's machine
 * (~/.claude/stats-cache.json, version 4). Not a team-wide export, not a vendor invoice.
 */
export const usageSource = {
  what: "local Claude Code stats on a developer's machine",
  period: 'May 28 – July 7, 2026',
  activeDays: 37,
  sessionsPerDay: 4.4,
  messagesPerSession: 362,
};

/**
 * Model share of total token volume (input + output + cache read and write).
 * `since` — the date the model first appears in the stats: the mix changed not
 * because we tuned it, but because new models came out.
 */
export const modelMix = [
  {
    label: 'Sonnet 4.6 · since May 28',
    value: 79.0,
    display: '79%',
    note: 'The main working model for nearly the whole period: plans, implementation, tests, docs.',
  },
  {
    label: 'Opus 4.8 · since Jun 20',
    value: 12.2,
    display: '12%',
    note: 'Arrived mid-project, took over the heavy sessions — architecture, untangling hard spots.',
  },
  {
    label: 'Sonnet 5 · since Jun 30',
    value: 5.0,
    display: '5%',
    note: 'Released near the end of the period — simply replaced the previous Sonnet.',
  },
  {
    label: 'Fable 5 · since Jul 2',
    value: 2.5,
    display: '2.5%',
    note: "The final days of the period, didn't have time to pick up volume.",
  },
  {
    label: 'Haiku 4.5 · since May 30',
    value: 1.3,
    display: '1.3%',
    note: 'Cheap background utility work — titles, summaries, small helper calls.',
  },
];

/** What the 2.89B tokens break down into. Percentages are of the total volume. */
export const tokenSplit = [
  {
    label: 'Cache read',
    display: '2,776M',
    pct: '96.1%',
    what: 'context that was already loaded and is being reused. Billed at a fraction of the cost of fresh input.',
  },
  {
    label: 'Cache write',
    display: '90M',
    pct: '3.1%',
    what: 'the cost of making context reusable in the first place. A one-time charge per session.',
  },
  {
    label: 'Generated by the model',
    display: '19.8M',
    pct: '0.7%',
    what: 'all output: code, plans, reviews, documentation, explanations, discarded options.',
  },
  {
    label: 'Fresh input',
    display: '2.6M',
    pct: '0.09%',
    what: 'what actually went into the model as new text. Less than a tenth of a percent.',
  },
];

/** Total codebase size (sum of locByLayer) — anchor for the model's output volume. */
export const codebaseLines = 187_265;
