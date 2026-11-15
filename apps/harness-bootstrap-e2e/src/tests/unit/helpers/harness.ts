/* eslint-disable @typescript-eslint/no-explicit-any -- dynamic imports of untyped .mjs modules */
/** Shared helpers for the release-tooling, state-root, migrator and install-CLI unit tests.
 * Everything runs in scratch directories; nothing writes into the real workspace.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { workspaceRoot } from '../../../utils/paths.ts';

export { workspaceRoot };
export const pkgRoot = path.join(workspaceRoot, 'skills/implementation-harness');
export const shimRoot = path.join(workspaceRoot, 'skills/harness-bootstrap');
export const cliEntry = path.join(pkgRoot, 'bin/artisyn-implementation-harness.mjs');
export const repoScript = (rel: string) => path.join(workspaceRoot, rel);

export const sha256 = (data: Buffer | string) =>
  crypto.createHash('sha256').update(data).digest('hex');

export function tmpDir(prefix = 'harness-unit-'): string {
  return fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
}

export function write(file: string, content: string | Buffer): string {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

export function writeAll(root: string, files: Record<string, string | Buffer>): void {
  for (const [rel, content] of Object.entries(files)) write(path.join(root, rel), content);
}

/** path -> sha256 for every file under `dir`, sorted; used to prove "nothing changed". */
export function snapshot(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (current: string) => {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else out[path.relative(dir, full).split(path.sep).join('/')] = sha256(fs.readFileSync(full));
    }
  };
  walk(dir);
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

export interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** A script that does not exist exits 1 like a script that fails on purpose, which would
 * make "expect exit 1" cases pass for the wrong reason. Treat it as a harness error.
 */
function assertScriptRan(file: string, result: RunResult): RunResult {
  if (result.status !== 0 && /Cannot find module|ERR_MODULE_NOT_FOUND/.test(result.stderr))
    throw new Error(`script missing or broken import: ${file}\n${result.stderr.split('\n')[0]}`);
  return result;
}

export function runNode(
  file: string,
  args: string[] = [],
  options: { cwd?: string; env?: Record<string, string | undefined> } = {}
): RunResult {
  const result = spawnSync(process.execPath, [file, ...args], {
    cwd: options.cwd ?? workspaceRoot,
    env: { ...process.env, ...options.env },
    encoding: 'utf8',
  });
  return assertScriptRan(file, {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  });
}

/** Async variant for tests that serve HTTP from the test process while the CLI runs. */
export function runNodeAsync(
  file: string,
  args: string[] = [],
  options: { cwd?: string; env?: Record<string, string | undefined> } = {}
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd: options.cwd ?? workspaceRoot,
      env: { ...process.env, ...options.env },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', (status) => {
      try {
        resolve(assertScriptRan(file, { status, stdout, stderr }));
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function git(cwd: string, args: string[]): string {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

export async function load(file: string): Promise<Record<string, any>> {
  return (await import(pathToFileURL(file).href)) as Record<string, any>;
}

/** Minimal ZIP writer (stored or deflated entries) so tests can build release assets
 * without a zip dependency.
 */
export function buildZip(
  entries: Record<string, string | Buffer>,
  { deflate = true }: { deflate?: boolean } = {}
): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, value] of Object.entries(entries)) {
    const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const method = deflate ? 8 : 0;
    const body = deflate ? zlib.deflateRawSync(data) : data;
    const crc = zlib.crc32(data);
    const nameBuf = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, body);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + body.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, end]);
}
