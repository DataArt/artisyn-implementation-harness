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
