import { withBase } from 'vitepress';

/**
 * Resolves a `GraphDoc.path` (repo-root-relative, e.g.
 * `"docs/Engineering Guide/01 Conventions.md"`) to the VitePress route for
 * that doc, or `null` when the doc has no route at all (e.g. `AppReadme`
 * tier docs like `apps/infra/README.md` — outside `docs/`, so outside
 * VitePress's `srcDir` entirely).
 *
 * This site's `srcDir` is `docs/` and it does NOT set `cleanUrls` (confirmed
 * against the built output — pages keep the `.html` extension), so the
 * route is: strip the leading `docs/` prefix, swap the trailing `.md` for
 * `.html`, percent-encode each path segment (folder/file names contain
 * spaces, e.g. "Engineering Guide"), and prefix with the site's configured
 * base via VitePress's own `withBase()` rather than hand-rolling base-path
 * logic.
 */
export function docUrl(path: string): string | null {
  if (!path.startsWith('docs/')) return null;
  const relative = path.slice('docs/'.length).replace(/\.md$/, '.html');
  const encoded = relative
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return withBase(`/${encoded}`);
}
