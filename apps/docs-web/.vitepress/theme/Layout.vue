<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { useRoute } from 'vitepress';
import { computed } from 'vue';
import GiscusComments from './GiscusComments.vue';
import GraphExplorer from './GraphExplorer.vue';
import SidebarToggles from './SidebarToggles.vue';
import SidebarFocusToggle from './SidebarFocusToggle.vue';

const { Layout } = DefaultTheme;
const route = useRoute();

// Markdown source has `markdown.html: false` (raw HTML/component tags
// render as inert escaped text, not Vue) — typing `<GraphExplorer />`
// straight into the page doesn't work. Inject it from here instead, gated
// to this one page's route, the same way GiscusComments is injected
// globally via a Layout slot. `route.data.relativePath` is the clean
// source path (unaffected by URL-encoding quirks in `route.path`).
const isGraphExplorerPage = computed(
  () => route.data.relativePath === 'Harness/07 Knowledge Graph/04 Graph Explorer.md'
);
</script>

<template>
  <Layout>
    <template #layout-top>
      <SidebarToggles />
    </template>
    <template #nav-bar-content-after>
      <SidebarFocusToggle />
    </template>
    <template #doc-before>
      <GraphExplorer v-if="isGraphExplorerPage" />
    </template>
    <template #doc-after>
      <GiscusComments />
    </template>
  </Layout>
</template>
