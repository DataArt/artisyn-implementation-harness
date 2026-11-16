import { PROVIDERS } from '../utils/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

import type { SkillRunOptions, SkillRunResult, StreamEvent } from './_types.ts';
import { DEFAULT_RUNNER_TIMEOUT_MS } from '../utils/constants.ts';

/** A short, human-readable line for one stream-json event — not a full
 * transcript, just enough to prove the agent is doing something and roughly
 * what, while it runs.
 */
function describeEvent(event: StreamEvent): string | undefined {
  if (event.type === 'system' && event.subtype === 'init') return `[init] model=${event.model}`;
  if (event.type === 'assistant') {
    const block = event.message?.content?.find((c) => c.type === 'tool_use' || c.type === 'text');
    if (block?.type === 'tool_use') return `[tool] ${block.name}`;
    if (block?.type === 'text' && block.text?.trim())
      return `[text] ${block.text.trim().slice(0, 120)}`;
  }
  if (event?.type === 'result') return `[result] ${event.subtype} in ${event.duration_ms}ms`;
  return undefined;
}

/** Invokes the real `claude` CLI headlessly against an isolated fixture
 * workspace — no interactive session, no manual approval. This is the only
 * way to exercise the skill's actual judgment (Q&A inference, harvest
 * generalization, patch prepare/apply) since those steps have no
 * deterministic script standing in for them. Real agent spend per call:
 * keep this suite small (see vitest.agent-e2e.config.ts), never on Nx cache,
 * and never wired into an unattended CI job without deliberate sign-off —
 * for now this runs locally, on request, only.
 */
export function runClaudeSkill(options: SkillRunOptions): Promise<SkillRunResult> {
  const start = performance.now();
  const args = [
    '-p',
    options.prompt,
    '--output-format',
    'stream-json',
    '--include-partial-messages',
    '--verbose',
    '--permission-mode',
    'bypassPermissions',
  ];
  for (const dir of options.addDirs ?? []) args.push('--add-dir', dir);
  const logProgress = options.logProgress ?? true;

  return new Promise((resolve, reject) => {
    const child = spawn(PROVIDERS.claude, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timeoutMs = options.timeoutMs ?? DEFAULT_RUNNER_TIMEOUT_MS;
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs);

    let stdout = '';
    let stderr = '';
    let buffered = '';
    let finalResult: unknown;
    const events: StreamEvent[] = [];

    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
      buffered += chunk;
      const lines = buffered.split('\n');
      buffered = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line) as StreamEvent;
          events.push(event);
          if (event.type === 'result') finalResult = event;
          if (logProgress) {
            const summary = describeEvent(event);
            if (summary)
              console.log(`[claude ${Math.round((performance.now() - start) / 1000)}s] ${summary}`);
          }
        } catch {
          // Not every line is guaranteed valid JSON mid-stream; ignore and keep reading.
        }
      }
    });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk;
      if (logProgress) process.stderr.write(chunk);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (options.transcriptPath) {
        try {
          fs.mkdirSync(path.dirname(options.transcriptPath), { recursive: true });
          fs.writeFileSync(options.transcriptPath, stdout, 'utf8');
        } catch (error) {
          stderr += `\nCould not persist Claude transcript: ${(error as Error).message}`;
        }
      }
      resolve({
        exitCode: code,
        stdout,
        stderr,
        durationMs: Math.round(performance.now() - start),
        json: finalResult,
        events,
        transcriptPath: options.transcriptPath,
      });
    });
  });
}
