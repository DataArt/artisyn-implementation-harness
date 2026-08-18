import { withMermaid } from 'vitepress-plugin-mermaid';
import { defineConfig } from 'vitepress';
import { scanSection } from './utils/sidebar';
import { HLD_VERSION } from './utils/constants';

export default withMermaid(
  defineConfig({
    title: 'Artisyn Harness',
    description: 'AI-first engineering lifecycles',
    head: [['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }]],

    srcDir: '../../docs',
    srcExclude: ['Stories/**', 'Harness/package/**'],

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
      ],

      sidebar: {
        '/The Story/': [{ text: 'The Story', items: scanSection('The Story') }],
        '/Target Architecture (HLD)/': scanSection(`Target Architecture (HLD)/${HLD_VERSION}`),
        '/System Architecture (LLD)/': scanSection('System Architecture (LLD)'),
        '/Engineering Guide/': scanSection('Engineering Guide'),
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
        '/Harness/': [],
      },
    },
  })
);
