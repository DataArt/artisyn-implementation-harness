import { requireProvider, result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import { PROVIDER_DETAILS } from '../utils/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import { walkFiles } from '../utils/fs.ts';
import type { Provider } from '../utils/build-launch.ts';

// The real repo's own root README is ~1.5KB; this is a generous ceiling, not
// a tight one — the point is catching "the whole project history is in here"
// drift (see fixtures/multi-container-project/FIXTURE.md), not nitpicking size.
const ROOT_README_BUDGET_CHARS = 6000;

const ROOT_README_BUDGET = 'docs-adoption/root-readme-budget';
const APP_READMES = 'docs-adoption/app-readmes';
const HLD_CONTAINERS = 'docs-adoption/hld-containers';
const DOCS_INDEX = 'docs-adoption/docs-index';
const CONTAINER_AGENTS = 'docs-adoption/container-agents';
const DOCS_GRAPH = 'docs-adoption/docs-graph';

/** The operational-graph package's deployed files, per
 * `01d-launch-verify.md`'s Cleanup copy — everything but the canonical-only
 * test file. */
const DOCS_GRAPH_FILES = [
  'cli.mjs',
  'constants.mjs',
  'schema.mjs',
  'utils.mjs',
  'docs.mjs',
  'edges.mjs',
  'docs-operational-graph.sqlite',
];

/** references/launch/01d-launch-verify.md: "Trim the root README to the
 * root-context budget ... purpose, local run instructions, docs links".
 * Exact wording varies (no fixed phrase to match), so this checks the two
 * objective properties that wording is a proxy for: short, and it actually
 * points into docs/ rather than containing the docs itself.
 */
export function gradeRootReadmeBudget(root: string): GradeResult {
  const failures: string[] = [];
  const readmePath = path.join(root, 'README.md');
  if (!fs.existsSync(readmePath)) return result(ROOT_README_BUDGET, ['README.md is missing']);
  const text = fs.readFileSync(readmePath, 'utf8');
  if (text.length > ROOT_README_BUDGET_CHARS)
    failures.push(
      `README.md is ${text.length} chars, over the root-context budget (~${ROOT_README_BUDGET_CHARS}) — likely content that belongs in docs/ instead`
    );
  if (!/docs\//.test(text)) failures.push('README.md does not link to docs/ at all');
  return result(ROOT_README_BUDGET, failures);
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
  return result(APP_READMES, failures);
}

/** 01d-launch-verify.md's final audit: "HLD active-version pointers match
 * disk" — every discovered container should actually be documented, not a
 * subset. Searches the whole HLD tree (README + version folders), not just
 * the top-level README, since containers are typically listed per-version.
 */
export function gradeHldCoversContainers(root: string, containers: string[]): GradeResult {
  const hldRoot = path.join(root, 'docs/Target Architecture (HLD)');
  if (!fs.existsSync(path.join(hldRoot, 'README.md')))
    return result(HLD_CONTAINERS, ['docs/Target Architecture (HLD)/README.md is missing']);
  const text = walkFiles(hldRoot)
    .filter((f) => f.endsWith('.md'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
  const failures = containers
    .filter((container) => !new RegExp(container, 'i').test(text))
    .map((container) => `HLD doesn't mention container "${container}"`);
  return result(HLD_CONTAINERS, failures);
}

/** 01c-launch-docs.md: "Create/update project:docs/README.md as a thin index
 * to actual HLD/LLD/Engineering Guide content."
 */
export function gradeDocsIndexExists(root: string): GradeResult {
  const exists = fs.existsSync(path.join(root, 'docs/README.md'));
  return result(DOCS_INDEX, exists ? [] : ['docs/README.md (thin index) is missing']);
}

/** Each discovered container gets its own permanent agent (a `layer`
 * template instance, per utils/build-launch.ts's agentInstanceKnowns), not
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
  return result(CONTAINER_AGENTS, failures);
}

/** `01d-launch-verify.md`'s Cleanup wiring: every operational-graph script
 * and the seed database land in `docs/.og/`, verbatim — but its canonical-only
 * test file (`cli.test.mjs`) never does, since it is tooling, not payload.
 */
export function gradeDocsGraphAdopted(root: string): GradeResult {
  const ogDir = path.join(root, 'docs/.og');
  const failures = DOCS_GRAPH_FILES.filter((file) => !fs.existsSync(path.join(ogDir, file))).map(
    (file) => `docs/.og/${file} is missing`
  );
  if (fs.existsSync(path.join(ogDir, 'cli.test.mjs')))
    failures.push('docs/.og/cli.test.mjs should not be deployed — it is canonical-only tooling');
  return result(DOCS_GRAPH, failures);
}

export const rootReadmeBudget = (): GraderBinding => (c) => gradeRootReadmeBudget(c.root);

export const appReadmesLinkToArchitecture = (): GraderBinding => (c) =>
  gradeAppReadmesLinkToArchitecture(c.root, c.containers);

export const hldCoversContainers = (): GraderBinding => (c) =>
  gradeHldCoversContainers(c.root, c.containers);

export const docsIndexExists = (): GraderBinding => (c) => gradeDocsIndexExists(c.root);

export const containerAgentsDeployed = (): GraderBinding => (c) =>
  gradeContainerAgentsDeployed(c.root, requireProvider(c), c.containers);

export const docsGraphAdopted = (): GraderBinding => (c) => gradeDocsGraphAdopted(c.root);
