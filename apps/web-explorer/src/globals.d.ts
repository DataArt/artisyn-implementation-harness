/** Harness package version, read from skills/implementation-harness/package.json at build time (next.config.ts). */
declare namespace NodeJS {
  interface ProcessEnv {
    HARNESS_VERSION: string;
  }
}

/** Kept until the Vite entry is removed. */
declare const __HARNESS_VERSION__: string;
