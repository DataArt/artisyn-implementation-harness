declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

// sql.js ships no types; GraphExplorer.vue imports its emscripten build and
// matching wasm binary directly to sidestep the package's browser/default
// export-condition ambiguity (see 1-plan.md Step 12's implementation notes).
declare module 'sql.js/dist/sql-wasm.js' {
  interface SqlJsStatic {
    Database: new (data?: Uint8Array) => {
      exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
      close: () => void;
    };
  }
  type InitSqlJs = (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  const initSqlJs: InitSqlJs;
  export default initSqlJs;
}

declare module '*.wasm?url' {
  const url: string;
  export default url;
}

// GraphExplorer.vue is assembled from `<template src>`/`<script src>`/
// `<style src>` (see GraphExplorer/GraphExplorer.vue's own comment) — a
// plain `<script src="./script.ts">` block, not `<script setup>`, so its
// file exports Options-API-shaped `{ setup() {...} }` component options
// rather than a default-exported component directly; `*.vue`'s shim above
// still covers the outer `.vue` import site correctly.
