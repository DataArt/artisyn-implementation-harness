<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { data } from './graphExplorer.data';
import type { GraphDoc } from './graphExplorer.data';

// Duplicated from docs/.og/constants.mjs's TIER_COLORS — a small, low-churn
// map kept here rather than cross-importing a generated runtime file the web
// build shouldn't depend on for correctness.
const TIER_COLORS: Record<string, string> = {
  HLD: '#1D4ED8',
  LLD: '#0E7490',
  EngineeringGuide: '#065F46',
  Story: '#D97706',
  Product: '#7C3AED',
  AppReadme: '#4B5563',
};
const UNTIERED_TIER = 'Other';
const UNTIERED_COLOR = '#6B7280';

const liveDocs = ref<GraphDoc[] | null>(null);
const loadFailed = ref(false);

// Starts from the build-time static table (`data.docs`) and upgrades to a
// live client-side query on a successful fetch + sql.js init. Never blank:
// a failed fetch or WASM init just leaves the static table in place.
const docs = computed<GraphDoc[]>(() => liveDocs.value ?? data.docs);

const grouped = computed(() => {
  const groups = new Map<string, GraphDoc[]>();
  for (const doc of docs.value) {
    const tier = doc.tier ?? UNTIERED_TIER;
    if (!groups.has(tier)) groups.set(tier, []);
    groups.get(tier)!.push(doc);
  }
  return groups;
});

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
    const [result] = db.exec('SELECT id, tier, path, title FROM docs ORDER BY tier, title');
    db.close();
    if (!result) return;
    liveDocs.value = result.values.map((row) => {
      const record = {} as GraphDoc;
      result.columns.forEach((col, i) => {
        (record as unknown as Record<string, unknown>)[col] = row[i];
      });
      return record;
    });
  } catch {
    loadFailed.value = true;
  }
}

onMounted(loadLive);
</script>

<template>
  <div class="graph-explorer">
    <p v-if="loadFailed" class="graph-explorer-note">
      Live query unavailable — showing the graph as of the last site build.
    </p>
    <table v-for="[tier, rows] in grouped" :key="tier" class="graph-explorer-table">
      <caption :style="{ color: TIER_COLORS[tier] ?? UNTIERED_COLOR }">{{ tier }}</caption>
      <thead>
        <tr>
          <th>Title</th>
          <th>Path</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in rows" :key="doc.id">
          <td>{{ doc.title ?? doc.path }}</td>
          <td><code>{{ doc.path }}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.graph-explorer-table {
  width: 100%;
  margin-bottom: 24px;
  border-collapse: collapse;
}
.graph-explorer-table caption {
  text-align: left;
  font-weight: 600;
  padding: 4px 0;
}
.graph-explorer-table th,
.graph-explorer-table td {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 6px 8px;
  text-align: left;
}
.graph-explorer-note {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
</style>
