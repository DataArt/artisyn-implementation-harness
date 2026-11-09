<script setup lang="ts">
// Two small edge-tab buttons that collapse/expand the left nav sidebar and
// the right "On this page" outline independently of VitePress's own mobile
// off-canvas sidebar toggle. They live right on the panel's own boundary
// (not in the header) so each reads as "the handle for this panel," and
// track the panel's REAL rendered edge via ResizeObserver rather than
// recomputing VitePress's own breakpoint math, so they stay pixel-accurate
// at every viewport width without duplicating it.
//
// State persists per-browser in localStorage (a viewer convenience, not
// shared data) and is applied before paint by the inline script in
// config.ts's `head`, so there's no flash of a panel re-expanding on load.
//
// Mechanism recap (see custom.css for the collapse rules themselves):
// collapsing the LEFT sidebar zeroes --vp-sidebar-width on <html> —
// VitePress's own CSS already reads that one variable for both the
// sidebar's width and the content's padding-left, so the content column
// reclaims the freed space automatically. The RIGHT aside has no such
// variable (fixed px values), so collapsing it hides .VPDoc .aside
// directly and relaxes .content-container's own max-width to match.
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vitepress';
import { useSidebarCollapse } from './useSidebarCollapse';

const DESKTOP_QUERY = '(min-width: 960px)';
const ASIDE_QUERY = '(min-width: 1280px)';

const route = useRoute();
const { sidebarCollapsed, asideCollapsed, toggleSidebar, toggleAside } = useSidebarCollapse();

const showSidebarHandle = ref(false);
const showAsideHandle = ref(false);
const sidebarHandleLeft = ref(0);
const asideHandleLeft = ref(0);

let ro: ResizeObserver | null = null;

// Collapsed-state inset: 0 sticks the handle flush to the viewport edge
// (left: 0 / flush with the far-right content edge) rather than floating
// inward over the now-expanded content.
const COLLAPSED_INSET = 0;

function measure() {
  const sidebarEl = document.querySelector<HTMLElement>('.VPSidebar');
  const hasSidebar = !!sidebarEl && window.matchMedia(DESKTOP_QUERY).matches;
  showSidebarHandle.value = hasSidebar;
  if (hasSidebar && sidebarEl) {
    const right = sidebarEl.getBoundingClientRect().right;
    sidebarHandleLeft.value = sidebarCollapsed.value ? right + COLLAPSED_INSET : right;
  }

  const hasAsideDoc = !!document.querySelector('.VPDoc.has-aside') && window.matchMedia(ASIDE_QUERY).matches;
  showAsideHandle.value = hasAsideDoc;
  if (hasAsideDoc) {
    const contentEl = document.querySelector<HTMLElement>('.VPDoc.has-aside > .container > .content');
    if (asideCollapsed.value) {
      // Flush with the true viewport edge, same as the left handle — not
      // .content's own right edge, which still carries .VPDoc's ordinary
      // 32px page padding and would leave the right handle sitting visibly
      // short of where the left handle sticks. clientWidth, not innerWidth:
      // innerWidth includes the scrollbar track, which would otherwise sit
      // on top of (and hide) the handle whenever the page scrolls.
      asideHandleLeft.value = document.documentElement.clientWidth - COLLAPSED_INSET;
    } else {
      // The visible divider between content and outline is a border-left on
      // VPDocAsideOutline.vue's OWN inner `.content` wrapper — `.aside`
      // itself has 32px of padding-left before that. Measure the outline
      // wrapper's own left edge directly so the handle sits exactly on that
      // line instead of approximating the padding chain.
      const dividerEl = document.querySelector<HTMLElement>(
        '.VPDoc.has-aside .VPDocAsideOutline.has-outline .content'
      );
      if (dividerEl) {
        asideHandleLeft.value = dividerEl.getBoundingClientRect().left;
      } else if (contentEl) {
        // No outline on this page (e.g. a single heading) — fall back to
        // the flex boundary + the aside's own 32px padding-left.
        asideHandleLeft.value = contentEl.getBoundingClientRect().right + 32;
      }
    }
  }
}

function scheduleMeasure() {
  // Let the class toggle's CSS actually apply before reading new rects.
  requestAnimationFrame(() => requestAnimationFrame(measure));
}

onMounted(() => {
  measure();
  ro = new ResizeObserver(() => measure());
  ro.observe(document.documentElement);

  window.addEventListener('resize', scheduleMeasure);
  // VitePress is an SPA — route changes re-render .content without a resize
  // event, so re-measure once the new page's DOM (and its aside, or lack of
  // one) has settled.
  watch(
    () => route.path,
    () => nextTick(scheduleMeasure)
  );
  // Reposition when collapse state changes from ANY control (the other edge
  // handle, or SidebarFocusToggle.vue's combined button) — not just this
  // component's own clicks.
  watch([sidebarCollapsed, asideCollapsed], scheduleMeasure);
});

onBeforeUnmount(() => {
  ro?.disconnect();
  window.removeEventListener('resize', scheduleMeasure);
});

</script>

<template>
  <button
    v-show="showSidebarHandle"
    type="button"
    class="edge-handle edge-handle--left"
    :class="{ 'is-collapsed': sidebarCollapsed }"
    :style="{ left: sidebarHandleLeft + 'px' }"
    :aria-pressed="sidebarCollapsed"
    :title="sidebarCollapsed ? 'Show navigation sidebar' : 'Hide navigation sidebar'"
    @click="toggleSidebar"
  >
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
  <button
    v-show="showAsideHandle"
    type="button"
    class="edge-handle edge-handle--right"
    :class="{ 'is-collapsed': asideCollapsed }"
    :style="{ left: asideHandleLeft + 'px' }"
    :aria-pressed="asideCollapsed"
    :title="asideCollapsed ? 'Show page outline' : 'Hide page outline'"
    @click="toggleAside"
  >
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M3.5 1.5L7 5L3.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>

<style scoped>
.edge-handle {
  position: fixed;
  top: calc(var(--vp-nav-height) + 20px);
  z-index: var(--vp-z-index-sidebar, 10);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 36px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0 6px 6px 0;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  /* No transition on `left` — it should snap to the panel's new edge
     instantly, not visibly slide/lag behind the collapse. */
  transition: color 0.2s, background-color 0.2s;
}

.edge-handle--right {
  border-radius: 6px 0 0 6px;
  transform: translateX(-100%);
}

.edge-handle:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}

.edge-handle.is-collapsed {
  color: var(--vp-c-brand-1);
}

/* When its panel is collapsed, the arrow should point the direction that
   re-opens it (back toward the content, away from the edge it's pinned to). */
.edge-handle--left.is-collapsed svg,
.edge-handle--right.is-collapsed svg {
  transform: scaleX(-1);
}
</style>
