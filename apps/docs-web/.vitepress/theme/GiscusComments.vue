<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vitepress';

// GISCUS_REPO_ID and GISCUS_CATEGORY_ID are opaque GitHub GraphQL node IDs,
// unique to this repo's Giscus installation — generate fresh values at
// https://giscus.app once Giscus is enabled on the target repo.
const GISCUS_REPO = `${import.meta.env.VITE_GITHUB_ORG}/${import.meta.env.VITE_GITHUB_REPO}`;
const GISCUS_REPO_ID = import.meta.env.VITE_GISCUS_REPO_ID;
const GISCUS_CATEGORY = 'ADLC Comments';
const GISCUS_CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID;
const GISCUS_MAPPING = 'specific';
const GISCUS_THEME = 'preferred_color_scheme';

const mount = useTemplateRef<HTMLDivElement>('mount');
const route = useRoute();

function decodedPathname(): string {
  try {
    return decodeURIComponent(window.location.pathname);
  } catch {
    return window.location.pathname;
  }
}

function injectGiscus() {
  if (!mount.value) return;

  mount.value.replaceChildren();

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-repo', GISCUS_REPO);
  script.setAttribute('data-repo-id', GISCUS_REPO_ID);
  script.setAttribute('data-category', GISCUS_CATEGORY);
  script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
  script.setAttribute('data-mapping', GISCUS_MAPPING);
  script.setAttribute('data-term', decodedPathname());
  script.setAttribute('data-strict', '1');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', GISCUS_THEME);
  script.setAttribute('data-lang', 'en');

  mount.value.appendChild(script);
}

onMounted(injectGiscus);

// VitePress is an SPA — client-side navigation (sidebar/nav links) updates
// `route.path` without remounting this component. Giscus has no
// postMessage API for remapping to a different discussion in-place, so on
// every route change we tear down the previously-injected script/iframe and
// re-inject a fresh script with the recomputed discussion term.
watch(
  () => route.path,
  () => injectGiscus()
);
</script>

<template>
  <div ref="mount" class="giscus-comments"></div>
</template>

<style scoped>
.giscus-comments {
  margin-top: 32px;
}
</style>
