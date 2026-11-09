import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DefaultTheme } from 'vitepress';
import { DOCS_ROOT } from './constants';

const prettify = (name: string) => name.replace(/^\d+\s+/, '');

export function scanSection(rel: string): DefaultTheme.SidebarItem[] {
  try {
    const entries = readdirSync(resolve(DOCS_ROOT, rel), { withFileTypes: true });
    const files = entries
      .filter(
        (d) => !d.isDirectory() && d.name.endsWith('.md') && !/^(index|README)\.md$/i.test(d.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({
        text: prettify(d.name.replace(/\.md$/, '')),
        link: `/${rel}/${d.name.replace(/\.md$/, '')}`,
      }));
    const dirs = entries
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({ text: prettify(d.name), items: scanSection(`${rel}/${d.name}`) }))
      .filter((d) => d.items.length > 0);
    return [...files, ...dirs];
  } catch {
    return [];
  }
}
