import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { NextConfig } from 'next';
import { basePath } from './src/site.ts';

// Nx runs next with cwd apps/web-explorer.
const harnessVersion: string = JSON.parse(
  readFileSync(resolve(process.cwd(), '../../skills/implementation-harness/package.json'), 'utf8')
).version;

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { HARNESS_VERSION: harnessVersion },
};

export default nextConfig;
