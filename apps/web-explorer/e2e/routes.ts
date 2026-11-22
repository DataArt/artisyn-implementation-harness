/** The 18 routes the export must contain, written independently of src/routes.ts. */
export const INSIDE_THE_LOOP_SLUGS = [
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
  '/inside-the-loop/',
  ...INSIDE_THE_LOOP_SLUGS.map((slug) => `/inside-the-loop/${slug}/`),
  '/get-started/',
  '/docs-flow/',
  '/dogfood/',
  '/agents/',
  '/migration-case/',
  '/comic/',
];

export const NOINDEX_ROUTES = ['/comic/'];
