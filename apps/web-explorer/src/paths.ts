/**
 * Route paths that mirror the main navigation: Cookbook recipes, and case studies within it.
 * Dependency-free so client components can import it without pulling in the route registry.
 */
export const ROUTE_PATHS = {
  teamAdoptionPath: '/cookbook/team-adoption-path/',
  knowledgeFlow: '/cookbook/knowledge-flow/',
  agents: '/cookbook/agents/',
  dogfood: '/cookbook/case/dogfood/',
  migration: '/cookbook/case/migration/',
} as const;

/** A Team Adoption Path topic page, e.g. `/cookbook/team-adoption-path/context/`. */
export const topicPath = (slug: string) => `${ROUTE_PATHS.teamAdoptionPath}${slug}/`;
