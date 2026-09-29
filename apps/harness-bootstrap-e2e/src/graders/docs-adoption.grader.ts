import { PROVIDER_DETAILS } from '../testkit/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import type { GradeResult } from './filesystem.grader.ts';
import type { Provider } from '../testkit/build-launch.ts';

// The real repo's own root README is ~1.5KB; this is a generous ceiling, not
// a tight one — the point is catching "the whole project history is in here"
// drift (see fixtures/multi-container-project/FIXTURE.md), not nitpicking size.
const ROOT_README_BUDGET_CHARS = 6000;

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

/** references/launch/01d-launch-verify.md: "Trim the root README to the
 * root-context budget ... purpose, local run instructions, docs links".
 * Exact wording varies (no fixed phrase to match), so this checks the two
 * objective properties that wording is a proxy for: short, and it actually
 * points into docs/ rather than containing the docs itself.
 */
export function gradeRootReadmeBudget(root: string): GradeResult {
  const failures: string[] = [];
  const readmePath = path.join(root, 'README.md');
  if (!fs.existsSync(readmePath))
    return { grader: 'docs-adoption', pass: false, failures: ['README.md is missing'] };
  const text = fs.readFileSync(readmePath, 'utf8');
  if (text.length > ROOT_README_BUDGET_CHARS)
    failures.push(
      `README.md is ${text.length} chars, over the root-context budget (~${ROOT_README_BUDGET_CHARS}) — likely content that belongs in docs/ instead`
    );
  if (!/docs\//.test(text)) failures.push('README.md does not link to docs/ at all');
  return { grader: 'docs-adoption', pass: failures.length === 0, failures };
}

/** Engineering Guide/Documentation/02 Structure.md, "App README scope": each
 * app's README must link to its HLD container and LLD component doc, not
 * just the root docs index.
 */
export function gradeAppReadmesLinkToArchitecture(root: string, containers: string[]): GradeResult {
  const failures: string[] = [];
  for (const container of containers) {
    const readmePath = path.join(root, 'apps', container, 'README.md');
    if (!fs.existsSync(readmePath)) {
      failures.push(`apps/${container}/README.md is missing`);
      continue;
    }
    const text = fs.readFileSync(readmePath, 'utf8');
    if (!/HLD|Target Architecture/i.test(text))
      failures.push(`apps/${container}/README.md doesn't link to its HLD container`);
    if (!/LLD|System Architecture/i.test(text))
      failures.push(`apps/${container}/README.md doesn't link to its LLD component doc`);
  }
  return { grader: 'docs-adoption', pass: failures.length === 0, failures };
}

/** 01d-launch-verify.md's final audit: "HLD active-version pointers match
 * disk" — every discovered container should actually be documented, not a
 * subset. Searches the whole HLD tree (README + version folders), not just
 * the top-level README, since containers are typically listed per-version.
 */
export function gradeHldCoversContainers(root: string, containers: string[]): GradeResult {
  const hldRoot = path.join(root, 'docs/Target Architecture (HLD)');
  if (!fs.existsSync(path.join(hldRoot, 'README.md')))
    return {
      grader: 'docs-adoption',
      pass: false,
      failures: ['docs/Target Architecture (HLD)/README.md is missing'],
    };
  const text = walkFiles(hldRoot)
    .filter((f) => f.endsWith('.md'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
  const failures = containers
    .filter((container) => !new RegExp(container, 'i').test(text))
    .map((container) => `HLD doesn't mention container "${container}"`);
  return { grader: 'docs-adoption', pass: failures.length === 0, failures };
}

/** 01c-launch-docs.md: "Create/update project:docs/README.md as a thin index
 * to actual HLD/LLD/Engineering Guide content."
 */
export function gradeDocsIndexExists(root: string): GradeResult {
  const exists = fs.existsSync(path.join(root, 'docs/README.md'));
  return {
    grader: 'docs-adoption',
    pass: exists,
    failures: exists ? [] : ['docs/README.md (thin index) is missing'],
  };
}

/** Each discovered container gets its own permanent agent (a `layer`
 * template instance, per testkit/build-launch.ts's agentInstanceKnowns), not
 * just a skill install — see fixtures/multi-container-project/FIXTURE.md.
 * A container with no deployed agent is a real gap, not something to skip
 * silently.
 */
export function gradeContainerAgentsDeployed(
  root: string,
  provider: Provider,
  containers: string[]
): GradeResult {
  const { agents, extension } = PROVIDER_DETAILS[provider];
  const failures = containers
    .filter((container) => !fs.existsSync(path.join(root, agents, `${container}.${extension}`)))
    .map(
      (container) =>
        `no deployed agent for container "${container}" at ${agents}/${container}.${extension}`
    );
  return { grader: 'docs-adoption', pass: failures.length === 0, failures };
}
