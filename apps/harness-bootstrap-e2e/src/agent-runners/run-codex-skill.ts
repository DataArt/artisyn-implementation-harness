import { PROVIDERS } from '../testkit/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { SkillRunOptions, SkillRunResult, StreamEvent } from './types.ts';

/** Native Codex JSONL runner. The workspace-write sandbox confines fixture writes;
 * approval_policy=never makes an unavailable permission fail instead of hanging.
 * Authentication and model selection use the caller's existing Codex configuration.
 */
export function runCodexSkill(options: SkillRunOptions): Promise<SkillRunResult> {
  const start = performance.now();
  const args = [
    'exec',
    '--json',
    '--ephemeral',
    '--skip-git-repo-check',
    // Keep this isolated E2E runnable when the caller's global config names an
    // in-product alias the CLI cannot use with this account. The current Codex
    // model ID is the default; local runs can select another supported one.
    '--model',
    process.env.HB_E2E_CODEX_MODEL?.trim() || 'gpt-6-sol',
    '--sandbox',
    'workspace-write',
    '-c',
    'approval_policy="never"',
    // The launch creates the consumer's .codex/config.toml during this turn,
    // after Codex has loaded its session config. Enable native planning for
    // this run explicitly; the canonical setting persists it for future runs.
    '-c',
    'tools.update_plan.enabled=true',
    '-',
  ];
  // Codex protects its provider directories by default. Bootstrap must create
  // skills/agents/config under these paths, so grant only the fixture-local
  // destinations as additional writable roots for this isolated E2E workspace.
  const providerDirs = ['.agents', '.codex'].map((dir) => path.resolve(options.cwd, dir));
  for (const dir of providerDirs) {
    fs.mkdirSync(dir, { recursive: true });
    args.push('--add-dir', dir);
  }
  for (const dir of options.addDirs ?? []) args.push('--add-dir', dir);
  return new Promise((resolve, reject) => {
    const child = spawn(PROVIDERS.codex, args, {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '',
      buffered = '';
    let timedOut = false;
    const events: StreamEvent[] = [];
    let finalResult: unknown;
    let killTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(
      () => {
        timedOut = true;
        child.kill('SIGTERM');
        killTimer = setTimeout(() => child.kill('SIGKILL'), 5_000);
      },
      options.timeoutMs ?? 5 * 60_000
    );
    const consume = (line: string) => {
      if (!line.trim()) return;
      try {
        const event = JSON.parse(line) as StreamEvent;
        events.push(event);
        if (event.type === 'turn.completed' || event.type === 'turn.failed') finalResult = event;
        if (options.logProgress ?? true)
          console.log(
            `[codex ${Math.round((performance.now() - start) / 1000)}s] ${event.type} ${event.item?.type ?? ''}`
          );
      } catch {
        /* Preserve non-JSON lines in stdout for diagnostics. */
      }
    };
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
      buffered += chunk;
      const lines = buffered.split('\n');
      buffered = lines.pop() ?? '';
      for (const line of lines) consume(line);
    });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk;
      if (options.logProgress ?? true) process.stderr.write(chunk);
    });
    child.stdin.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EPIPE') stderr += error.message;
    });
    child.stdin.end(options.prompt);
    child.on('error', (error) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      reject(new Error(`Codex launch failed: ${error.message}`));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      consume(buffered);
      // Codex emits `error` events for recoverable stream reconnects (for
      // example, a broken pipe followed by a successful reconnect). A completed
      // turn with a zero process exit is authoritative; only a failed/missing
      // turn, timeout, or failed process makes this invocation fail.
      const failed =
        timedOut ||
        code !== 0 ||
        !events.some((event) => event.type === 'turn.completed') ||
        events.some((event) => event.type === 'turn.failed');
      if (options.transcriptPath) {
        try {
          fs.mkdirSync(path.dirname(options.transcriptPath), { recursive: true });
          fs.writeFileSync(options.transcriptPath, stdout, 'utf8');
        } catch (error) {
          stderr += `\nCould not persist Codex transcript: ${(error as Error).message}`;
        }
      }
      resolve({
        exitCode: failed ? 1 : code,
        stdout,
        stderr: timedOut ? `${stderr}\nCodex timed out` : stderr,
        durationMs: Math.round(performance.now() - start),
        json: finalResult,
        events,
        transcriptPath: options.transcriptPath,
      });
    });
  });
}
