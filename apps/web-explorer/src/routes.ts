/**
 * Route registry: the only place a route's path, title, description, social image and
 * index flag are written. Plain Node imports this file (post-export step, gates), so it
 * keeps to erasable TypeScript and `.ts` import extensions.
 */
import type { Metadata } from 'next';
import { ROUTE_PATHS, topicPath } from './paths.ts';
import { siteUrl } from './site.ts';

export type RouteEntry = {
  /** Trailing slash, no base path: '/get-started/'. */
  path: string;
  /** The title template adds ' — Artisyn'; the landing title is absolute. */
  title: string;
  description: string;
  /** Social image in public/; defaults to DEFAULT_SOCIAL_IMAGE. */
  image?: SocialImage;
  /** false → robots noindex and left out of sitemap.xml. */
  index: boolean;
  /** Added to SITE_KEYWORDS for this page. */
  keywords?: string[];
  /** Source paths relative to apps/web-explorer; sitemap lastmod is their last commit date. */
  sources: string[];
};

export type SocialImage = { path: string; width: number; height: number; alt: string };

export const DEFAULT_SOCIAL_IMAGE: SocialImage = {
  path: '/social-preview.jpg',
  width: 1200,
  height: 630,
  alt: 'Artisyn Implementation Harness: AI engineering, structured by design. A terminal runs /implementation-harness launch through Design, Implement, Validate and Document, above the Solution Design, Development and Knowledge pillars',
};

/** The Vite site's keyword list, shared with Web Docs. */
export const SITE_KEYWORDS = [
  'agent-skills',
  'agent-skills-manager',
  'agent-skills-tools',
  'agentic-development',
  'ai-assisted-development',
  'ai-sdlc',
  'ai-sdlc-framework',
  'architecture-governance',
  'coding-agents',
  'context-engineering',
  'context-engineering-framework',
  'context-engineering-kit',
  'developer-tools',
  'developer-tools-ai-agent',
  'engineering-workflows',
  'implementation-harness',
  'software-architecture',
  'software-architecture-and-design',
  'software-development-lifecycle',
];

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

export type TeamAdoptionPathSlug = (typeof TEAM_ADOPTION_PATH_SLUGS)[number];

export { ROUTE_PATHS, topicPath };

/**
 * Paths published before the Cookbook restructure. Each stays as a noindex redirect page to its
 * new path, so shared links and search results keep working.
 */
export const MOVED: Record<string, string> = {
  '/inside-the-loop/': ROUTE_PATHS.teamAdoptionPath,
  ...Object.fromEntries(
    TEAM_ADOPTION_PATH_SLUGS.map((slug) => [`/inside-the-loop/${slug}/`, topicPath(slug)])
  ),
  '/docs-flow/': ROUTE_PATHS.knowledgeFlow,
  '/agents/': ROUTE_PATHS.agents,
  '/dogfood/': ROUTE_PATHS.dogfood,
  '/migration-case/': ROUTE_PATHS.migration,
};

const teamAdoptionPathFiles: Record<TeamAdoptionPathSlug, string> = {
  requirements: '01-requirements.tsx',
  context: '02-context.tsx',
  harness: '03-harness.tsx',
  'code-review': '04-code-review.tsx',
  quality: '05-quality.tsx',
  retro: '06-retro.tsx',
  improvement: '07-improvement.tsx',
  onboarding: '08-onboarding.tsx',
  tools: '09-tools.tsx',
  infrastructure: '10-infrastructure.tsx',
};

const teamAdoptionPath: Record<TeamAdoptionPathSlug, { title: string; description: string }> = {
  requirements: {
    title: 'Mental model shift: planning ↔ code',
    description:
      "The center of gravity in an engineer's work moved from implementation to planning — and everyone the ticket passes through feels it.",
  },
  context: {
    title: 'Context: the asset, not the prompt',
    description:
      'A prompt lives for one session. Context lives with the repository — versioned, reviewed, and inherited by the whole team.',
  },
  harness: {
    title: 'Harness: a system, not an assistant',
    description:
      'Six workflow cycles, a learning loop they all feed into, and a hard boundary on what the agent is not allowed to do.',
  },
  'code-review': {
    title: 'Code review: knowledge transfer now',
    description:
      'Agents review code against requirements and architecture docs; what is left for the human is picking the trade-off.',
  },
  quality: {
    title: 'Code quality: the criterion changed',
    description:
      'AI writes good code fast when the task is well specified, which moved the quality bar onto more formal ground and three rules.',
  },
  retro: {
    title: 'Retro: what surprised us',
    description:
      'A practice to take wholesale: regularly collecting feedback on where the team is headed and what state it is in.',
  },
  improvement: {
    title: 'Improvement: reflect → triage → skill',
    description:
      "Continuous improvement: one developer's stumble becomes part of the next generation of code — for everyone.",
  },
  onboarding: {
    title: 'Onboarding: a new hire every session',
    description:
      'A call with a colleague and a README read start to finish both turn into a call to the agent: one source now, not many.',
  },
  tools: {
    title: 'Tools: grew out of the project itself',
    description:
      'When writing a tool gets much cheaper, you start building the tools that never used to pay off.',
  },
  infrastructure: {
    title: 'Infrastructure: the harness, pointed at IaC',
    description:
      "The project's infrastructure went through the same harness as its product code: the same planning, review and documentation.",
  },
};

export const routes: RouteEntry[] = [
  {
    path: '/',
    title: 'Artisyn — Implementation Harness',
    description:
      'Explore Artisyn Implementation Harness: structured AI engineering lifecycles, architecture-aware execution, reusable skills, and continuous learning.',
    index: true,
    sources: ['src/views/landing'],
  },
  {
    path: ROUTE_PATHS.teamAdoptionPath,
    title: 'Team Adoption Path',
    description:
      'A map of ten real dependencies, not a checklist — each one opened the door to the next on a project built with the implementation harness.',
    index: true,
    keywords: ['team-adoption-path'],
    sources: ['src/views/cookbook/team-adoption-path/TeamAdoptionPathHub.tsx'],
  },
  ...TEAM_ADOPTION_PATH_SLUGS.map((slug): RouteEntry => ({
    path: topicPath(slug),
    ...teamAdoptionPath[slug],
    index: true,
    keywords: ['team-adoption-path', slug],
    sources: [`src/views/cookbook/team-adoption-path/${teamAdoptionPathFiles[slug]}`],
  })),
  {
    path: '/get-started/',
    title: 'Get started',
    description:
      'Install the Artisyn Implementation Harness: pick a channel and an AI provider, then copy the install, launch and update commands.',
    index: true,
    keywords: ['install', 'claude-code', 'codex', 'github-copilot'],
    sources: ['src/views/get-started'],
  },
  {
    path: ROUTE_PATHS.knowledgeFlow,
    title: 'Knowledge Flow',
    description:
      'An interactive walkthrough of how documentation is born with the work: working drafts per ticket, graduating to permanent docs.',
    index: true,
    keywords: ['documentation-lifecycle', 'docs-as-code'],
    sources: ['src/views/cookbook/knowledge-flow'],
  },
  {
    path: ROUTE_PATHS.dogfood,
    title: 'Dogfood',
    description:
      'We run the harness on the harness: this repository is the canonical source of the implementation harness and its first consumer.',
    index: true,
    keywords: ['dogfooding'],
    sources: ['src/views/cookbook/case/dogfood'],
  },
  {
    path: ROUTE_PATHS.agents,
    title: 'For AI agents',
    description:
      'Use the Artisyn Implementation Harness site with AI agents: WebMCP tools to search the docs and get install instructions, plus llms.txt and content indexes.',
    index: true,
    keywords: ['webmcp', 'llms-txt', 'ai-agents', 'agentic-browsing'],
    sources: ['src/views/cookbook/agents', 'src/agent'],
  },
  {
    path: ROUTE_PATHS.migration,
    title: 'Migration case: Vite to Next.js',
    description:
      'How the harness migrated this site from Vite to Next.js in a working day: 31 steps, 58 findings closed, 151 tests and 25 docs, measured from the run itself.',
    index: true,
    keywords: ['case-study', 'framework-migration', 'vite', 'nextjs', 'static-export'],
    sources: ['src/views/cookbook/case/migration'],
  },
  {
    path: '/comic/',
    title: 'The factory that remembers',
    description:
      'One engineer. One AI. And a project that had to be explained all over again, every morning.',
    index: false,
    sources: ['src/views/comic'],
  },
];

export function routeFor(path: string): RouteEntry {
  const entry = routes.find((r) => r.path === path);
  if (!entry) throw new Error(`routes: no registry entry for ${path}`);
  return entry;
}

/** Title, description, canonical, Open Graph, Twitter and robots for one route. */
export function toMetadata(entry: RouteEntry): Metadata {
  const url = `${siteUrl}${entry.path}`;
  const social = entry.image ?? DEFAULT_SOCIAL_IMAGE;
  const image = {
    url: `${siteUrl}${social.path}`,
    width: social.width,
    height: social.height,
    alt: social.alt,
  };
  return {
    title: entry.path === '/' ? { absolute: entry.title } : entry.title,
    description: entry.description,
    keywords: [...SITE_KEYWORDS, ...(entry.keywords ?? [])],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Artisyn',
      locale: 'en_US',
      title: entry.title,
      description: entry.description,
      url,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: entry.description,
      images: [{ url: image.url, alt: image.alt }],
    },
    ...(entry.index ? {} : { robots: { index: false } }),
  };
}
