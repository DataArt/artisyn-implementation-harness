// Shared collapse state for the left sidebar / right outline, backed by
// <html> classes + localStorage. Three controls write this state
// (SidebarToggles.vue's two edge handles, SidebarFocusToggle.vue's combined
// button) and all three need to reflect it correctly no matter which one a
// visitor used last — a MutationObserver on <html>'s class attribute, rather
// than each component only reading state once on mount, is what keeps them
// all in sync with each other.
import { ref, onMounted, onBeforeUnmount } from 'vue';

const SIDEBAR_KEY = 'vp-sidebar-collapsed';
const ASIDE_KEY = 'vp-aside-collapsed';

export function useSidebarCollapse() {
  const sidebarCollapsed = ref(false);
  const asideCollapsed = ref(false);
  let observer: MutationObserver | null = null;

  function sync() {
    const root = document.documentElement;
    sidebarCollapsed.value = root.classList.contains('sidebar-collapsed');
    asideCollapsed.value = root.classList.contains('aside-collapsed');
  }

  onMounted(() => {
    sync();
    observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  });

  onBeforeUnmount(() => observer?.disconnect());

  function setSidebar(collapsed: boolean) {
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }

  function setAside(collapsed: boolean) {
    document.documentElement.classList.toggle('aside-collapsed', collapsed);
    localStorage.setItem(ASIDE_KEY, String(collapsed));
  }

  return {
    sidebarCollapsed,
    asideCollapsed,
    setSidebar,
    setAside,
    toggleSidebar: () => setSidebar(!sidebarCollapsed.value),
    toggleAside: () => setAside(!asideCollapsed.value),
  };
}

export function hasAside(): boolean {
  return !!document.querySelector('.VPDoc.has-aside');
}
