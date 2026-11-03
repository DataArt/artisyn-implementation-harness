import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import cytoscape, { type Core, type ElementDefinition, type NodeSingular } from 'cytoscape';
import { useData } from 'vitepress';
import { data } from './graphExplorer.data';
import type { GraphDoc, GraphEdge } from './graphExplorer.data';
import {
  TIER_COLORS,
  UNTIERED_TIER,
  TIER_RING,
  tierColor,
  tierRing,
  edgeGroup,
  EDGE_GROUP_LABELS,
  buildCytoscapeStyle,
  type EdgeGroup,
} from './cytoscapeStyle';
import { docUrl } from './docUrl';

const tiers = [...Object.keys(TIER_COLORS), UNTIERED_TIER];
const edgeGroups: EdgeGroup[] = ['keyword-match', 'references', 'graduation', 'mirrors'];
const edgeGroupLabels = EDGE_GROUP_LABELS;

export default {
  setup() {
    const liveDocs = ref<GraphDoc[] | null>(null);
    const liveEdges = ref<GraphEdge[] | null>(null);
    const loadFailed = ref(false);
    const canvasEl = ref<HTMLDivElement | null>(null);
    let cy: Core | null = null;
    const { isDark } = useData();

    // Starts from the build-time static data and upgrades to a live
    // client-side query on a successful fetch + sql.js init. Never blank: a
    // failed fetch or WASM init just leaves the static data in place — both
    // the table and the canvas read from the same `docs`/`edges` computeds.
    const docs = computed<GraphDoc[]>(() => liveDocs.value ?? data.docs);
    const edges = computed<GraphEdge[]>(() => liveEdges.value ?? data.edges);

    const tierEnabled = ref<Record<string, boolean>>(
      Object.fromEntries(tiers.map((tier) => [tier, true]))
    );
    const edgeGroupEnabled = ref<Record<EdgeGroup, boolean>>(
      Object.fromEntries(edgeGroups.map((group) => [group, true])) as Record<EdgeGroup, boolean>
    );

    const filteredDocs = computed(() =>
      docs.value.filter((doc) => tierEnabled.value[doc.tier ?? UNTIERED_TIER])
    );

    const filteredEdges = computed(() => {
      const visibleIds = new Set(filteredDocs.value.map((doc) => doc.id));
      return edges.value.filter(
        (edge) =>
          edgeGroupEnabled.value[edgeGroup(edge.edge_type)] &&
          visibleIds.has(edge.from_id) &&
          visibleIds.has(edge.to_id)
      );
    });

    const grouped = computed(() => {
      const groups = new Map<string, GraphDoc[]>();
      for (const doc of filteredDocs.value) {
        const tier = doc.tier ?? UNTIERED_TIER;
        if (!groups.has(tier)) groups.set(tier, []);
        groups.get(tier)!.push(doc);
      }
      return groups;
    });

    const elements = computed<ElementDefinition[]>(() => {
      const nodes = filteredDocs.value.map((doc) => ({
        data: {
          id: doc.id,
          label: doc.title ?? doc.path,
          tier: doc.tier ?? UNTIERED_TIER,
          path: doc.path,
        },
      }));
      const edgeEls = filteredEdges.value.map((edge) => ({
        data: {
          id: `${edge.from_id}->${edge.to_id}:${edge.edge_type}`,
          source: edge.from_id,
          target: edge.to_id,
          group: edgeGroup(edge.edge_type),
        },
      }));
      return [...nodes, ...edgeEls];
    });

    // Reads this site's own VitePress theme tokens at render time, rather
    // than hardcoding light-mode values, so the label plate (Cytoscape
    // `text-background-*`) and label text color stay legible — and
    // dark-mode-aware — in both appearance modes. Falls back to
    // `buildCytoscapeStyle()`'s own light-mode defaults when `document` is
    // unavailable (shouldn't happen in practice; this only runs client-side
    // from `onMounted`/a `watch`, never during SSR).
    function currentCytoscapeStyle(): string {
      if (typeof document === 'undefined') return buildCytoscapeStyle();
      const root = getComputedStyle(document.documentElement);
      const textColor = root.getPropertyValue('--vp-c-text-1').trim();
      const bgColor = root.getPropertyValue('--vp-c-bg-soft').trim();
      return buildCytoscapeStyle(textColor || undefined, bgColor || undefined);
    }

    function applyCursor(target: HTMLElement, clickable: boolean) {
      target.style.cursor = clickable ? 'pointer' : '';
    }

    function renderGraph() {
      if (!canvasEl.value) return;
      if (cy) {
        cy.destroy();
        cy = null;
      }
      // cytoscape's constructor `style` option is typed as `StylesheetJson`
      // (a JS array of blocks) only — the plain-text stylesheet string this
      // module builds is accepted by the `.style()` *method*'s type instead,
      // even though both are valid at runtime.
      const maxRing = Math.max(...Object.values(TIER_RING));
      cy = cytoscape({
        container: canvasEl.value,
        elements: elements.value,
        layout: {
          name: 'concentric',
          // cytoscape's `concentric` layout places the node with the
          // HIGHEST `concentric()` value in the center, so ring numbers
          // (0 = center, per TIER_RING) must be inverted here: Product
          // (ring 0) needs the highest score to land in the center, the
          // outermost ring (5) needs the lowest.
          concentric: (node: NodeSingular) => maxRing - tierRing(node.data('tier') as string),
          // Uniform spacing between rings regardless of how many nodes
          // land on each ring — tiers are very unevenly sized (Story
          // vastly outnumbers Product). NOT `equidistant` — cytoscape's own
          // concentric layout forces every ring's gap to match the LARGEST
          // gap any one ring needs when `equidistant: true`, and our
          // outermost ring (AppReadme/Other, ~most of the ~115 docs) needs a
          // huge radius to avoid overlap, which blows every other ring's gap
          // out by that same amount and overflows the fit bounding box.
          // Leaving it unset (default false) keeps each ring's own radius
          // step at the per-level minimum (`maxNodeSize + minNodeSpacing`),
          // which still guarantees no two rings ever collide.
          levelWidth: () => 1,
          minNodeSpacing: 32,
        },
        motionBlur: true,
        minZoom: 0.1,
        maxZoom: 4,
      });
      cy.style(currentCytoscapeStyle());

      const canvas = canvasEl.value;
      cy.on('tap', 'node', (evt) => {
        const url = docUrl(evt.target.data('path') as string);
        if (url) window.open(url, '_blank', 'noopener');
      });
      cy.on('mouseover', 'node', (evt) => {
        const clickable = docUrl(evt.target.data('path') as string) !== null;
        applyCursor(canvas, clickable);
      });
      cy.on('mouseout', 'node', () => {
        applyCursor(canvas, false);
      });
    }

    async function loadLive() {
      try {
        const [{ default: initSqlJs }, { default: wasmUrl }] = await Promise.all([
          import('sql.js/dist/sql-wasm.js'),
          import('sql.js/dist/sql-wasm.wasm?url'),
        ]);
        const SQL = await initSqlJs({ locateFile: () => wasmUrl });
        const response = await fetch('/docs-operational-graph.sqlite');
        if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
        const buffer = new Uint8Array(await response.arrayBuffer());
        const db = new SQL.Database(buffer);
        const [docsResult] = db.exec('SELECT id, tier, path, title FROM docs ORDER BY tier, title');
        const [edgesResult] = db.exec('SELECT from_id, to_id, edge_type FROM edges');
        db.close();
        if (docsResult) {
          liveDocs.value = docsResult.values.map((row) => {
            const record = {} as GraphDoc;
            docsResult.columns.forEach((col, i) => {
              (record as unknown as Record<string, unknown>)[col] = row[i];
            });
            return record;
          });
        }
        if (edgesResult) {
          liveEdges.value = edgesResult.values.map((row) => {
            const record = {} as GraphEdge;
            edgesResult.columns.forEach((col, i) => {
              (record as unknown as Record<string, unknown>)[col] = row[i];
            });
            return record;
          });
        }
      } catch {
        loadFailed.value = true;
      }
    }

    // loadLive() mutates liveDocs/liveEdges synchronously on success, which
    // reactively changes `elements` — the watch(elements, ...) below would
    // then fire on its own schedule, on top of the explicit renderGraph()
    // call right after, rendering the graph twice on first load. Suppress
    // the watcher only for that one startup transition; every later change
    // (filter toggles, a live re-fetch) still re-renders normally once this
    // is true.
    let initialRenderDone = false;

    onMounted(async () => {
      await loadLive();
      renderGraph();
      initialRenderDone = true;
    });

    onBeforeUnmount(() => {
      cy?.destroy();
      cy = null;
    });

    watch(elements, () => {
      if (!initialRenderDone) return;
      renderGraph();
    });

    // VitePress's dark-mode toggle flips the `dark` class on `<html>`
    // without remounting this component, so the node/label colors baked
    // into `cy.style()` at the last `renderGraph()` call go stale — restyle
    // in place (no need to rebuild the whole layout) whenever the theme
    // flips.
    watch(isDark, () => {
      cy?.style(currentCytoscapeStyle());
    });

    return {
      loadFailed,
      canvasEl,
      tiers,
      edgeGroups,
      edgeGroupLabels,
      tierEnabled,
      edgeGroupEnabled,
      grouped,
      tierColor,
      docUrl,
    };
  },
};
