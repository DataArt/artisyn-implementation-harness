/**
 * Route registry: the only place a route's path, title, description, social image and
 * index flag are written. Plain Node imports this file (post-export step, gates), so it
 * keeps to erasable TypeScript and `.ts` import extensions.
 */
export type RouteEntry = {
  /** Trailing slash, no base path: '/get-started/'. */
  path: string;
  /** The title template adds ' — Artisyn'; the landing title is absolute. */
  title: string;
  description: string;
  /** File in public/; defaults to '/social-preview.png'. */
  image?: string;
  /** false → robots noindex and left out of sitemap.xml. */
  index: boolean;
};

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

export type InsideTheLoopSlug = (typeof INSIDE_THE_LOOP_SLUGS)[number];

export const routes: RouteEntry[] = [
  {
    path: '/',
    title: 'Artisyn — Implementation Harness',
    description:
      'Explore Artisyn Implementation Harness: structured AI engineering lifecycles, architecture-aware execution, reusable skills, and continuous learning.',
    index: true,
  },
  {
    path: '/inside-the-loop/',
    title: 'Inside the loop',
    description: 'How the implementation harness runs each part of the engineering loop.',
    index: true,
  },
  ...INSIDE_THE_LOOP_SLUGS.map((slug): RouteEntry => ({
    path: `/inside-the-loop/${slug}/`,
    title: slug,
    description: `Inside the loop: ${slug}.`,
    index: true,
  })),
  {
    path: '/get-started/',
    title: 'Get started',
    description:
      'Install the Artisyn Implementation Harness: pick a channel and an AI provider, then copy the install, launch and update commands.',
    index: true,
  },
  {
    path: '/docs-flow/',
    title: 'Docs flow',
    description: 'How documentation moves through the harness lifecycles.',
    index: true,
  },
  {
    path: '/dogfood/',
    title: 'Dogfood',
    description: 'How this repository builds itself with the implementation harness.',
    index: true,
  },
  {
    path: '/comic/',
    title: 'Comic',
    description: 'A comic about AI engineering with the implementation harness.',
    index: false,
  },
];
