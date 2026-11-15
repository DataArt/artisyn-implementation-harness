import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifySha256Sums } from './checksums.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const LOCAL_DIR = join(PROJECT_ROOT, '.local');
const ENV_EXAMPLE_PATH = join(PROJECT_ROOT, '.env.example');
const ENV_PATH = join(LOCAL_DIR, '.env');
const RELEASE_ASSETS = ['install.sh', 'docker-compose.yml', 'SHA256SUMS'];

export interface Downloader {
  download(url: string, destPath: string): Promise<void>;
}

/** Default downloader: plain `fetch`, writing the response body to `destPath`. */
export const fetchDownloader: Downloader = {
  async download(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`download failed: ${url} -> HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buf);
  },
};

/** Reads `LOG_HUB_VERSION=` from the committed `.env.example` — the single, reviewable source of
 *  this wrapper's pinned release (not the scaffolded, gitignored `.local/.env`). */
export function readVersion(envExamplePath: string = ENV_EXAMPLE_PATH): string {
  const content = readFileSync(envExamplePath, 'utf8');
  const match = /^LOG_HUB_VERSION=(.+)$/m.exec(content);
  if (!match) {
    throw new Error(`LOG_HUB_VERSION not found in ${envExamplePath}`);
  }
  return match[1].trim();
}

/**
 * Downloads the pinned release's install.sh, docker-compose.yml and SHA256SUMS into `destDir`,
 * then verifies all three against SHA256SUMS before returning. Throws on any download failure
 * or checksum mismatch; the caller must not proceed past a thrown error.
 */
export async function fetchAndVerifyRelease(
  version: string,
  destDir: string,
  downloader: Downloader = fetchDownloader
): Promise<void> {
  mkdirSync(destDir, { recursive: true });
  const baseUrl = `https://github.com/DataArt/artisyn-log-hub/releases/download/v${version}`;

  for (const asset of RELEASE_ASSETS) {
    await downloader.download(`${baseUrl}/${asset}`, join(destDir, asset));
  }

  // SHA256SUMS lists every release asset (README.md, the source zip, install.ps1, ...); only
  // verify the lines for files we actually downloaded, or verifySha256Sums throws on the rest.
  const allSums = readFileSync(join(destDir, 'SHA256SUMS'), 'utf8');
  const relevantAssets = new Set(RELEASE_ASSETS.filter((name) => name !== 'SHA256SUMS'));
  const relevantSums = allSums
    .split('\n')
    .filter((line) => {
      const filename = line.trim().split(/\s+/).pop();
      return filename !== undefined && relevantAssets.has(filename);
    })
    .join('\n');
  verifySha256Sums(destDir, relevantSums);
}

/** Derives a stable, filesystem-safe slug for this checkout: the git remote, or the checkout path. */
export function repoSlug(cwd: string = PROJECT_ROOT): string {
  try {
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd,
      encoding: 'utf8',
    }).trim();
    return remote.replace(/^.*[:/]([^/]+\/[^/]+?)(\.git)?$/, '$1').replace(/[^a-zA-Z0-9._-]/g, '-');
  } catch {
    return basename(cwd).replace(/[^a-zA-Z0-9._-]/g, '-');
  }
}

/** Generates a random value suitable for a Postgres password or session secret. */
export function generateSecret(): string {
  return randomBytes(32).toString('hex');
}

export interface ScaffoldEnvOptions {
  dataDirFor?: (cwd: string) => string;
  secretGenerator?: () => string;
}

/**
 * Scaffolds `envPath` from `examplePath` if `envPath` does not exist, then fills only the lines
 * that are still empty after the copy (`LOG_HUB_DATA_DIR`, `POSTGRES_PASSWORD`, `SESSION_SECRET`).
 * Never touches a line that already has a value, and never overwrites an existing file's other
 * content. Idempotent: a second call against an already-filled file is a no-op.
 */
export function scaffoldEnv(
  examplePath: string,
  envPath: string,
  options: ScaffoldEnvOptions = {}
): void {
  const dataDirFor =
    options.dataDirFor ??
    ((cwd: string) => join(homeCacheDir(), 'artisyn-log-hub', repoSlug(cwd), 'pgdata'));
  const secretGenerator = options.secretGenerator ?? generateSecret;

  mkdirSync(dirname(envPath), { recursive: true });

  if (!existsSync(envPath)) {
    writeFileSync(envPath, readFileSync(examplePath, 'utf8'));
  }

  const fillers: Record<string, () => string> = {
    LOG_HUB_DATA_DIR: () => dataDirFor(PROJECT_ROOT),
    POSTGRES_PASSWORD: secretGenerator,
    SESSION_SECRET: secretGenerator,
  };

  const lines = readFileSync(envPath, 'utf8').split('\n');
  let changed = false;
  const result = lines.map((line) => {
    for (const [key, fill] of Object.entries(fillers)) {
      const match = new RegExp(`^${key}=$`).exec(line);
      if (match) {
        changed = true;
        return `${key}=${fill()}`;
      }
    }
    return line;
  });

  if (changed) {
    writeFileSync(envPath, result.join('\n'));
  }
}

function homeCacheDir(): string {
  return process.env.HOME ? join(process.env.HOME, '.cache') : '/tmp/.cache';
}

async function main(): Promise<void> {
  const version = readVersion();
  console.log(`log-hub:init — downloading and verifying release v${version}...`);
  await fetchAndVerifyRelease(version, LOCAL_DIR);
  console.log('log-hub:init — checksums verified.');
  scaffoldEnv(ENV_EXAMPLE_PATH, ENV_PATH);
  console.log(`log-hub:init — ${ENV_PATH} ready. Run "yarn nx run log-hub:serve" next.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`log-hub:init failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
