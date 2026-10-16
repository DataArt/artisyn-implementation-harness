import DefaultTheme from 'vitepress/theme';
import { onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';
import type { Theme } from 'vitepress';
import Layout from './Layout.vue';
import './style.css';

function openOverlay(content: SVGElement | HTMLImageElement) {
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);' +
    'display:flex;align-items:center;justify-content:center;' +
    'cursor:zoom-out;padding:32px;box-sizing:border-box';

  const clone = content.cloneNode(true) as SVGElement | HTMLImageElement;
  if (clone instanceof SVGElement) {
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    clone.style.cssText =
      'max-width:100%;max-height:100%;background:var(--vp-c-bg);border-radius:8px;padding:24px';
  } else {
    clone.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;border-radius:8px';
  }
  overlay.appendChild(clone);

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
}

function attachZoom() {
  document.querySelectorAll<HTMLElement>('.mermaid').forEach((el) => {
    if (el.dataset.zoomReady) return;
    const svg = el.querySelector('svg');
    if (!svg) return;
    el.dataset.zoomReady = '1';
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => openOverlay(svg));
  });

  document.querySelectorAll<HTMLImageElement>('.vp-doc img').forEach((img) => {
    if (img.dataset.zoomReady) return;
    img.dataset.zoomReady = '1';
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openOverlay(img));
  });
}

export default {
  extends: DefaultTheme,
  Layout,
  setup() {
    const route = useRoute();
    onMounted(() => {
      const observer = new MutationObserver(attachZoom);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    watch(
      () => route.path,
      () => nextTick(attachZoom)
    );
  },
} satisfies Theme;
