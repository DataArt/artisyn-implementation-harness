/** The 18 routes the export must contain, written independently of src/routes.ts. */
export const TEAM_ADOPTION_PATH_SLUGS = [
  'requirements',
  'context',
  'harness',
  'code-review',
  'quality',
  'retro',
  'improvement',
  'onboarding',
  'tools',
  'infrastructure',
] as const;

export const ROUTES: string[] = [
  '/',
  '/cookbook/team-adoption-path/',
  ...TEAM_ADOPTION_PATH_SLUGS.map((slug) => `/cookbook/team-adoption-path/${slug}/`),
  '/get-started/',
  '/cookbook/knowledge-flow/',
  '/cookbook/case/dogfood/',
  '/cookbook/agents/',
  '/cookbook/case/migration/',
  '/comic/',
];

export const NOINDEX_ROUTES = ['/comic/'];

/** Paths published before the Cookbook restructure, each a redirect page to its new path. */
export const MOVED_ROUTES: [string, string][] = [
  ['/inside-the-loop/', '/cookbook/team-adoption-path/'],
  ...TEAM_ADOPTION_PATH_SLUGS.map((slug): [string, string] => [
    `/inside-the-loop/${slug}/`,
    `/cookbook/team-adoption-path/${slug}/`,
  ]),
  ['/docs-flow/', '/cookbook/knowledge-flow/'],
  ['/agents/', '/cookbook/agents/'],
  ['/dogfood/', '/cookbook/case/dogfood/'],
  ['/migration-case/', '/cookbook/case/migration/'],
];
