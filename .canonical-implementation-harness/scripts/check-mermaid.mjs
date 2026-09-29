#!/usr/bin/env node
// Node standard library only. Renderer dependencies are managed separately.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { sha256 } from './lib/fs-safe.mjs';

/** Extract every top-level Mermaid fence from a Markdown file's text, rejecting
 * a fence nested inside a blockquote/list item/indented code block — those
 * need normalizing to a top-level fence before this gate can see them.
 */
export function extract(text, source) {
  const diagrams = [];
  let fence;
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence && opening) {
      fence = {
        char: opening[1][0],
        length: opening[1].length,
        mermaid: opening[2].trim() === 'mermaid',
        line: index + 1,
        lines: [],
      };
    } else if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) {
        if (fence.mermaid)
          diagrams.push({ source, line: fence.line, text: fence.lines.join('\n') + '\n' });
        fence = undefined;
      } else fence.lines.push(line);
    } else if (
      /^\s*(?:>|[-+*]|\d+[.)]).*(?:`{3,}|~{3,})\s*mermaid\s*$/.test(line) ||
      /^ {4,}(?:`{3,}|~{3,})mermaid\s*$/.test(line)
    ) {
      throw Error(
        `${source}:${index + 1}: nested Mermaid fence requires normalization to a top-level fence`
      );
    }
  }
  if (fence) throw Error(`${source}:${fence.line}: unclosed fence`);
  return diagrams;
}

function assertConfigShape(config) {
  if (
    !Array.isArray(config.files) ||
    !config.files.length ||
    !config.files.every((f) => typeof f === 'string')
  )
    throw Error('files must be an explicit nonempty path array');
  if (
    !Array.isArray(config.renderer) ||
    !config.renderer.length ||
    !config.renderer.every((a) => typeof a === 'string') ||
    !config.rendererIdentity
  )
    throw Error('renderer argument array and pinned rendererIdentity required');
  if (typeof config.output !== 'string') throw Error('output directory required');
}

/** Walk `files` and every `.mmd` it locally links to, collecting each source's
 * frozen hash (for the post-render integrity recheck) and every Mermaid
 * diagram found along the way. Per-file errors are recorded on `manifest`
 * rather than aborting the whole run — one bad input shouldn't hide the
 * results for every other one.
 */
function collectDiagrams(files, manifest) {
  const queue = [...new Set(files.map((f) => path.resolve(f)))].sort();
  const visited = new Set();
  const diagrams = [];
  for (let i = 0; i < queue.length; i++) {
    const file = queue[i];
    if (visited.has(file)) continue;
    visited.add(file);
    try {
      const text = fs.readFileSync(file, 'utf8');
      manifest.sources.push({ path: file, sha256: sha256(text) });
      if (file.endsWith('.mmd')) diagrams.push({ source: file, line: 1, text });
      else if (/\.md$/i.test(file)) {
        diagrams.push(...extract(text, file));
        // Only local Markdown links; reference-style/HTML links must be listed in files.
        for (const match of text.matchAll(
          /\]\((?:<([^>]+\.mmd)>|([^\s)]+\.mmd))(?:\s+"[^"]*")?\)/g
        )) {
          const target = match[1] || match[2];
          if (!/^[a-z]+:/i.test(target)) queue.push(path.resolve(path.dirname(file), target));
        }
      } else throw Error('only .md and .mmd inputs are supported');
    } catch (error) {
      manifest.errors.push({ source: file, error: error.message });
    }
  }
  return diagrams;
}

/** Render one diagram to SVG through the pinned renderer and record its
 * command, exit status, and hashes into `manifest.diagrams`.
 */
function renderDiagram(diagram, index, config, output) {
  const stem = String(index + 1).padStart(4, '0');
  const input = path.join(output, stem + '.mmd');
  const target = path.join(output, stem + '.svg');
  fs.writeFileSync(input, diagram.text);
  const args = [...config.renderer.slice(1), '-i', input, '-o', target];
  const result = spawnSync(config.renderer[0], args, {
    encoding: 'utf8',
    timeout: config.timeoutMs ?? 120000,
    maxBuffer: 10 * 1024 * 1024,
    shell: false,
  });
  const svg = fs.existsSync(target) ? fs.readFileSync(target) : Buffer.alloc(0);
  const passed = !result.error && result.status === 0 && /<svg[\s>]/.test(svg.toString());
  return {
    source: diagram.source,
    line: diagram.line,
    input,
    inputSha256: sha256(diagram.text),
    output: target,
    outputSha256: svg.length ? sha256(svg) : null,
    command: [config.renderer[0], ...args],
    exitCode: result.status,
    error: result.error?.message ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: passed ? 'passed' : 'failed',
  };
}

function renderDiagrams(diagrams, config, output, manifest, save) {
  for (const [index, diagram] of diagrams.entries()) {
    manifest.diagrams.push(renderDiagram(diagram, index, config, output));
    save();
  }
}

/** Re-hash every collected source after rendering — a source edited mid-run
 * invalidates its own results rather than being silently trusted.
 */
function verifySourcesUnchanged(manifest) {
  for (const source of manifest.sources) {
    try {
      if (sha256(fs.readFileSync(source.path)) !== source.sha256)
        throw Error('source changed during validation');
    } catch (error) {
      manifest.errors.push({ source: source.path, error: error.message });
    }
  }
}

function computeStatus(manifest, diagramCount) {
  if (manifest.errors.length || manifest.diagrams.some((d) => d.status !== 'passed'))
    return 'failed';
  return diagramCount ? 'passed' : 'not-applicable';
}

export function run(config) {
  assertConfigShape(config);
  const output = path.resolve(config.output);
  if (fs.existsSync(output)) throw Error('output must be a fresh directory');
  const manifest = {
    status: 'pending',
    renderer: config.renderer,
    rendererIdentity: config.rendererIdentity,
    sources: [],
    diagrams: [],
    errors: [],
    visualReview: 'pending',
  };
  fs.mkdirSync(output, { recursive: true });
  const save = () =>
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(manifest, null, 2) + '\n');
  const diagrams = collectDiagrams(config.files, manifest);
  renderDiagrams(diagrams, config, output, manifest, save);
  verifySourcesUnchanged(manifest);
  manifest.status = computeStatus(manifest, diagrams.length);
  save();
  return manifest;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)
) {
  try {
    if (process.argv.length !== 3) throw Error('Usage: node check-mermaid.mjs <config.json>');
    const result = run(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    console.log(
      `${result.status}: ${result.diagrams.length} diagrams; visual review remains separate`
    );
    if (result.status === 'failed') process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
