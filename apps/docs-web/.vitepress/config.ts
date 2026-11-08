import fs from 'node:fs';
import path from 'node:path';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { defineConfig } from 'vitepress';
import { scanSection } from './utils/sidebar';
import { HLD_VERSION } from './utils/constants';
import { registerContainers } from './utils/markdown-containers';

export default withMermaid(
  defineConfig({
    title: 'Artisyn Implementation Harness',
    description: 'AI-first engineering lifecycles',
    head: [
      ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
      [
        'meta',
        {
          name: 'keywords',
          content:
            'agent-skills, agent-skills-manager, agent-skills-tools, agentic-development, ai-assisted-development, ai-sdlc, ai-sdlc-framework, architecture-governance, coding-agents, context-engineering, context-engineering-framework, context-engineering-kit, developer-tools, developer-tools-ai-agent, engineering-workflows, implementation-harness, software-architecture, software-architecture-and-design, software-development-lifecycle',
        },
      ],
      // Applies the persisted sidebar/aside collapse state before hydration
      // (same pattern VitePress itself uses for dark mode) so returning
      // visitors don't see the panel flash open then collapse on load.
      [
        'script',
        { id: 'check-sidebar-collapse' },
        `(()=>{try{const d=document.documentElement;
          if(localStorage.getItem('vp-sidebar-collapsed')==='true')d.classList.add('sidebar-collapsed');
          if(localStorage.getItem('vp-aside-collapsed')==='true')d.classList.add('aside-collapsed');
        }catch(e){}})();`,
      ],
    ],

    srcDir: '../../docs',
    srcExclude: ['Stories/**'],

    // The operational graph's sqlite lives at <srcDir>/.og/ (a dot-directory,
    // excluded from VitePress's own page scan) — copy it into the build output
    // here instead of via docs/public/, so the binary db never has to sit in
    // source control as a generated, constantly-churning file. site-build.sh
    // runs `cli.mjs build` before this build, so the file is current when read.
    async buildEnd(siteConfig) {
      const graphDb = path.join(siteConfig.srcDir, '.og', 'docs-operational-graph.sqlite');
      if (fs.existsSync(graphDb))
        fs.copyFileSync(graphDb, path.join(siteConfig.outDir, 'docs-operational-graph.sqlite'));
    },

    // Raw HTML in markdown source is disabled — any <script>/<iframe>/event-handler
    // attribute pasted into docs/ (e.g. from a workshop transcript) renders as inert
    // text instead of executing in readers' browsers. Styled wrapper divs that used
    // to rely on raw HTML passthrough now go through the custom container above.
    markdown: {
      html: false,
      config: registerContainers,
    },

    themeConfig: {
      search: {
        provider: 'local',
      },

      socialLinks: [
        {
          icon: 'github',
          link: `https://github.com/${process.env.VITE_GITHUB_ORG}/${process.env.VITE_GITHUB_REPO}`,
        },
        { icon: 'linkedin', link: 'https://www.linkedin.com/company/dataart/posts/?feedView=all' },
        {
          icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><image href="/da-favicon.png" width="32" height="32"/></svg>',
          },
          link: 'https://www.dataart.com/artisyn',
        },
      ],

      nav: [
        { text: 'Explore', link: '/Harness/01%20Explore/' },
        { text: 'Quick Start', link: '/Harness/02%20Quick%20Start/' },
        { text: 'Lifecycles', link: '/Harness/03%20Lifecycles/00%20Overview' },
        { text: 'Adoption', link: '/Harness/04%20Adoption/00%20Adoption%20Path' },
        { text: 'Principles', link: '/Harness/05%20Principles/' },
        { text: 'Roadmap', link: '/Harness/06%20Roadmap/' },
        { text: 'Operational Graph', link: '/Harness/07%20Operational%20Graph/' },
        { text: '🔒', link: '/Harness/08%20Security%20Scan/' },
      ],

      sidebar: {
        '/Target Architecture (HLD)/': scanSection(`Target Architecture (HLD)/${HLD_VERSION}`),
        '/System Architecture (LLD)/': scanSection('System Architecture (LLD)'),
        '/Engineering Guide/': scanSection('Engineering Guide'),
        '/Harness/00 The Story/': [
          { text: 'The Story', items: scanSection('Harness/00 The Story') },
        ],
        '/Harness/01 Explore/': [{ text: 'Explore', items: scanSection('Harness/01 Explore') }],
        '/Harness/02 Quick Start/': [
          { text: 'Quick Start', items: scanSection('Harness/02 Quick Start') },
        ],
        '/Harness/03 Lifecycles/': [
          { text: 'Lifecycles', items: scanSection('Harness/03 Lifecycles') },
        ],
        '/Harness/04 Adoption/': [{ text: 'Adoption', items: scanSection('Harness/04 Adoption') }],
        '/Harness/05 Principles/': [
          { text: 'Principles', items: scanSection('Harness/05 Principles') },
        ],
        '/Harness/06 Roadmap/': [{ text: 'Roadmap', items: scanSection('Harness/06 Roadmap') }],
        '/Harness/07 Operational Graph/': [
          { text: 'Operational Graph', items: scanSection('Harness/07 Operational Graph') },
        ],
        '/Harness/08 Security Scan/': [
          { text: '🔒 Security Scan', items: scanSection('Harness/08 Security Scan') },
        ],
        '/Harness/': [],
      },
    },

    vite: {
      optimizeDeps: {
        // mermaid 11.x uses fastdom for DOM measurement batching; it's a UMD/CJS
        // module Vite's dependency scanner doesn't discover on its own (only
        // reached via mermaid's dynamically-loaded diagram chunks), so without
        // forcing it into the pre-bundle it's served raw and fails the browser's
        // ESM "no default export" check — recurs on every dep-cache invalidation
        // (e.g. adding a new dependency), not just a one-time stale-cache fluke.
        include: ['mermaid', 'fastdom', 'fastdom/extensions/fastdom-promised.js'],
      },
    },
  })
);
