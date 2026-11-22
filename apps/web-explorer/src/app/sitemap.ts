import { execFileSync } from 'node:child_process';
import type { MetadataRoute } from 'next';
import { routes } from '../routes';
import { siteUrl } from '../site';

export const dynamic = 'force-static';

const buildTime = new Date();

/** Last commit date over a route's sources; the build time when git has no history for them. */
function lastModified(sources: string[]): Date {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...sources], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso ? new Date(iso) : buildTime;
  } catch {
    return buildTime;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes
    .filter((r) => r.index)
    .map((r) => ({ url: `${siteUrl}${r.path}`, lastModified: lastModified(r.sources) }));
}
