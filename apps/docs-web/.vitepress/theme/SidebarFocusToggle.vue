<script setup lang="ts">
// A single square "focus mode" button in the nav bar: collapses BOTH the
// left sidebar and the right outline in one click (when either is open), or
// restores both (when both are already collapsed). Shares its collapse
// state with SidebarToggles.vue's per-edge handles via useSidebarCollapse's
// MutationObserver, so `is-active` stays correct no matter which control —
// this button or an edge handle — a visitor used last.
import { computed } from 'vue';
import { useSidebarCollapse, hasAside } from './useSidebarCollapse';

const { sidebarCollapsed, asideCollapsed, setSidebar, setAside } = useSidebarCollapse();

const focused = computed(() => sidebarCollapsed.value && (!hasAside() || asideCollapsed.value));

function toggleFocus() {
  const next = !focused.value;
  setSidebar(next);
  if (hasAside()) setAside(next);
}
</script>

<template>
  <button
    type="button"
    class="focus-toggle"
    :class="{ 'is-active': focused }"
    :aria-pressed="focused"
    :title="focused ? 'Show both sidebars' : 'Hide both sidebars (focus mode)'"
    @click="toggleFocus"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.5 5.5V2.5C1.5 1.94772 1.94772 1.5 2.5 1.5H5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10.5 1.5H13.5C14.0523 1.5 14.5 1.94772 14.5 2.5V5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.5 10.5V13.5C14.5 14.0523 14.0523 14.5 13.5 14.5H10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5.5 14.5H2.5C1.94772 14.5 1.5 14.0523 1.5 13.5V10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>

<style scoped>
.focus-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  margin-left: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.25s, background-color 0.25s;
}

@media (min-width: 960px) {
  .focus-toggle {
    display: flex;
  }
}

.focus-toggle:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.focus-toggle.is-active {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}
</style>
