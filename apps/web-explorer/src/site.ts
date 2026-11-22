/**
 * GitHub Pages project-site URL shape: https://dataart.github.io/artisyn-implementation-harness/
 * Web Explorer is served at the project-site root; Web Portal composes Web Docs under /docs/.
 * Plain Node imports this file (post-export step, gates), so it keeps to erasable TypeScript.
 */
export const basePath = '/artisyn-implementation-harness';
export const siteOrigin = 'https://dataart.github.io';
export const siteUrl = `${siteOrigin}${basePath}`;

/** Prefixes the base path to a public/ path such as '/brand/artisyn-mark.svg'. */
export const asset = (path: string): string => `${basePath}${path}`;
