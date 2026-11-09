import type { MarkdownRenderer } from 'vitepress';
import container from 'markdown-it-container';

// A custom container is the sanctioned way to get a styled wrapper div without raw
// HTML passthrough — see "Custom Containers" in the VitePress markdown guide. Colored
// callouts map onto VitePress's built-in `::: info` / `::: tip` / `::: warning`
// containers instead.
export function registerContainers(md: MarkdownRenderer) {
  md.use(container, 'screenshot', {
    render: (tokens: { nesting: number }[], idx: number) =>
      tokens[idx].nesting === 1 ? '<div class="screenshot">\n' : '</div>\n',
  });
}
