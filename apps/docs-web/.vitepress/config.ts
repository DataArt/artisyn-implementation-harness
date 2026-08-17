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

      sidebar: {
        '/The Story/': [{ text: 'The Story', items: scanSection('The Story') }],
        '/Target Architecture (HLD)/': scanSection(`Target Architecture (HLD)/${HLD_VERSION}`),
        '/System Architecture (LLD)/': scanSection('System Architecture (LLD)'),
        '/Engineering Guide/': scanSection('Engineering Guide'),
        '/Harness/': [],
      },
    },
  })
);
