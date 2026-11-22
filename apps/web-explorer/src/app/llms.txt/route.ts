import { routeFor, routes } from '../../routes';
import { siteUrl } from '../../site';
import { docsUrl, repoUrl } from '../../env';

export const dynamic = 'force-static';

/** llmstxt.org format: H1, a summary line, then sections of annotated links. */
function llmsTxt(): string {
  const home = routeFor('/');
  const pages = routes
    .filter((r) => r.index)
    .map((r) => `- [${r.title}](${siteUrl}${r.path}): ${r.description}`);
  return [
    `# ${home.title}`,
    '',
    `> ${home.description}`,
    '',
    '## Pages',
    '',
    ...pages,
    '',
    '## Docs',
    '',
    `- [Documentation](${docsUrl}): Lifecycles, architecture and engineering guides for the implementation harness`,
    `- [Source code](${repoUrl}): The canonical repository of the implementation harness`,
    '',
  ].join('\n');
}

export function GET() {
  return new Response(llmsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
