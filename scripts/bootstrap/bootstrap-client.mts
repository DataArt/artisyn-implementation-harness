// Deterministic client-personalization script for the ADLC Discovery Tool starter kit.
// Run via tsx (already this repo's convention for TS scripts — see apps/infra/cdk.json,
// apps/lambda-auth's build), not node's native type-stripping.
//
// Does exactly four things, and nothing else — no free-text generation, no judgment calls.
// Same input always produces the same output; safe to re-run (skips work already done).
//
//   1. Literal find-replace of [[CLIENT_NAME]] across every git-tracked text file
//   2. Rewrite the {org} placeholder in the 3 project.json files (infra, docs-web, lambda-auth)
//   3. Scaffold apps/{infra,docs-web,lambda-auth}/.env.dev from .env.example + collected values —
//      every deterministic value (org/env/locationShort/region-templated shapes, same formula as
//      apps/infra/lib/conventions.ts's naming()) is fully resolved; only genuinely AWS-assigned
//      values (e.g. CF_DISTRIBUTION_ID, known only after infra:provision) stay blank
//   4. Replace the starter-kit pitch README.md with CONTRIBUTING.md's content, then remove
//      CONTRIBUTING.md — once bootstrapped, a team working in this repo needs local-dev/structure
//      docs as their README, not "how to launch a new client engagement" (already done)
//
// Invoked by the /bootstrap-client skill after it has collected and confirmed every value
// with the developer — this script performs no Q&A of its own.
//
// Usage:
//   yarn bootstrap:client \
//     --client-name "Acme Corp" \
//     --org-prefix acme \
//     --aws-region us-east-1 --location-short ue1 \
//     --github-org AcmeOrg --github-org-id 12345 \
//     --github-repo adlc-discovery-acme --github-repo-id 67890 \
//     [--giscus-repo-id R_xxx] [--giscus-category-id DIC_xxx] \
//     [--dry-run]

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { parseArgs } from 'node:util';

const REPO_ROOT = execFileSync('git', ['rev-parse', '--show-toplevel']).toString().trim();

// Extensions we never treat as text — binary files must never be find-replaced.
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.docx', '.xlsx', '.zip', '.lock',
]);

const PROJECT_JSON_FILES = [
  'apps/infra/project.json',
  'apps/docs-web/project.json',
  'apps/lambda-auth/project.json',
];

// The bootstrap tooling's own files reference `[[CLIENT_NAME]]` literally, in prose that
// documents what it does (e.g. "replaces [[CLIENT_NAME]] everywhere"). Find-replacing those
// would corrupt the tooling's own comments/docs — exclude it from Step 1 specifically.
const SELF_EXCLUDE_PREFIXES = ['scripts/bootstrap/', '.claude/skills/bootstrap-client/'];

interface EnvScaffold {
  example: string;
  target: string;
  // Keys whose value is replaced outright with the collected value.
  directFills: Record<string, string>;
}

// Shape-templated values in .env.example (e.g. "{org}-{env}-docs-{locationShort}-s3-01") are
// fully deterministic from what bootstrap already collects — same formula as
// apps/infra/lib/conventions.ts's naming(). Resolved wherever these tokens appear, in any key.
function templateTokens(v: Answers): Record<string, string> {
  return {
    '{org}': v.orgPrefix,
    '{env}': 'dev',
    '{locationShort}': v.locationShort,
    '{region}': v.awsRegion,
  };
}

function buildEnvScaffolds(v: Answers): EnvScaffold[] {
  return [
    {
      example: 'apps/infra/.env.example',
      target: 'apps/infra/.env.dev',
      directFills: {
        AWS_REGION: v.awsRegion,
        ENVIRONMENT: 'dev',
        LOCATION_SHORT: v.locationShort,
        ORG_PREFIX: v.orgPrefix,
        GITHUB_ORG: v.githubOrg,
        GITHUB_ORG_ID: v.githubOrgId,
        GITHUB_REPO: v.githubRepo,
        GITHUB_REPO_ID: v.githubRepoId,
      },
    },
    {
      example: 'apps/docs-web/.env.example',
      target: 'apps/docs-web/.env.dev',
      directFills: {
        AWS_REGION: v.awsRegion,
        VITE_GITHUB_ORG: v.githubOrg,
        VITE_GITHUB_REPO: v.githubRepo,
        ...(v.giscusRepoId ? { VITE_GISCUS_REPO_ID: v.giscusRepoId } : {}),
        ...(v.giscusCategoryId ? { VITE_GISCUS_CATEGORY_ID: v.giscusCategoryId } : {}),
      },
    },
    {
      example: 'apps/lambda-auth/.env.example',
      target: 'apps/lambda-auth/.env.dev',
      directFills: { AWS_REGION: v.awsRegion },
    },
  ];
}

interface Answers {
  clientName: string;
  orgPrefix: string;
  awsRegion: string;
  locationShort: string;
  githubOrg: string;
  githubOrgId: string;
  githubRepo: string;
  githubRepoId: string;
  giscusRepoId?: string;
  giscusCategoryId?: string;
  dryRun: boolean;
}

function parseAndValidateArgs(): Answers {
  const { values } = parseArgs({
    options: {
      'client-name': { type: 'string' },
      'org-prefix': { type: 'string' },
      'aws-region': { type: 'string' },
      'location-short': { type: 'string' },
      'github-org': { type: 'string' },
      'github-org-id': { type: 'string' },
      'github-repo': { type: 'string' },
      'github-repo-id': { type: 'string' },
      'giscus-repo-id': { type: 'string' },
      'giscus-category-id': { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });

  const required = [
    'client-name', 'org-prefix', 'aws-region', 'location-short',
    'github-org', 'github-org-id', 'github-repo', 'github-repo-id',
  ] as const;
  const missing = required.filter((k) => !values[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.map((k) => `--${k}`).join(', ')}`);
  }

  const orgPrefix = values['org-prefix']!;
  if (!/^[a-z0-9]([a-z0-9-]{0,18}[a-z0-9])?$/.test(orgPrefix)) {
    throw new Error(
      `--org-prefix "${orgPrefix}" is invalid — must be lowercase alphanumeric with optional ` +
        'internal hyphens, 1-20 chars, no leading/trailing hyphen (it feeds AWS resource names).'
    );
  }
  const locationShort = values['location-short']!;
  if (!/^[a-z0-9]{2,10}$/.test(locationShort)) {
    throw new Error(
      `--location-short "${locationShort}" is invalid — must be lowercase alphanumeric, ` +
        '2-10 chars (e.g. "ue1", "euw1") — it feeds AWS resource names.'
    );
  }
  for (const [flag, val] of [
    ['github-org-id', values['github-org-id']],
    ['github-repo-id', values['github-repo-id']],
  ] as const) {
    if (!/^\d+$/.test(val!)) {
      throw new Error(`--${flag} "${val}" must be numeric — fetch it via \`gh api repos/{org}/{repo}\`.`);
    }
  }

  return {
    clientName: values['client-name']!,
    orgPrefix,
    awsRegion: values['aws-region']!,
    locationShort,
    githubOrg: values['github-org']!,
    githubOrgId: values['github-org-id']!,
    githubRepo: values['github-repo']!,
    githubRepoId: values['github-repo-id']!,
    giscusRepoId: values['giscus-repo-id'],
    giscusCategoryId: values['giscus-category-id'],
    dryRun: values['dry-run']!,
  };
}

function listTrackedTextFiles(): string[] {
  // -z: NUL-separated, unquoted paths. Without it, git quotes/escapes any path containing
  // non-ASCII characters (e.g. "✅"/"—" in docs/Stories/archive/* filenames), which silently
  // breaks readFileSync on those exact paths — found live, testing against this repo.
  const out = execFileSync('git', ['ls-files', '-z'], { cwd: REPO_ROOT }).toString();
  return out
    .split('\0')
    .filter(Boolean)
    .filter((f) => !BINARY_EXTENSIONS.has(extname(f).toLowerCase()));
}

function replaceClientNameToken(v: Answers): { filesChanged: number; replacements: number } {
  let filesChanged = 0;
  let replacements = 0;
  const token = '[[CLIENT_NAME]]';

  for (const relPath of listTrackedTextFiles()) {
    if (SELF_EXCLUDE_PREFIXES.some((prefix) => relPath.startsWith(prefix))) continue;

    const abs = resolve(REPO_ROOT, relPath);
    let content: string;
    try {
      content = readFileSync(abs, 'utf-8');
    } catch {
      continue; // unreadable as utf-8 — skip rather than guess
    }
    const count = content.split(token).length - 1;
    if (count === 0) continue;

    filesChanged += 1;
    replacements += count;
    console.log(`  ${v.dryRun ? '[dry-run] would update' : 'updating'} ${relPath} (${count}x)`);

    if (!v.dryRun) {
      writeFileSync(abs, content.split(token).join(v.clientName), 'utf-8');
    }
  }

  return { filesChanged, replacements };
}

function rewriteProjectJsonOrgPlaceholders(v: Answers): number {
  let filesChanged = 0;

  for (const relPath of PROJECT_JSON_FILES) {
    const abs = resolve(REPO_ROOT, relPath);
    if (!existsSync(abs)) {
      console.warn(`  ⚠️  ${relPath} not found — skipping`);
      continue;
    }
    const content = readFileSync(abs, 'utf-8');
    const count = content.split('{org}').length - 1;
    if (count === 0) continue;

    filesChanged += 1;
    console.log(`  ${v.dryRun ? '[dry-run] would update' : 'updating'} ${relPath} (${count}x)`);

    if (!v.dryRun) {
      writeFileSync(abs, content.split('{org}').join(v.orgPrefix), 'utf-8');
    }
  }

  return filesChanged;
}

function scaffoldEnvDevFiles(v: Answers): { created: string[]; skipped: string[] } {
  const created: string[] = [];
  const skipped: string[] = [];

  for (const scaffold of buildEnvScaffolds(v)) {
    const exampleAbs = resolve(REPO_ROOT, scaffold.example);
    const targetAbs = resolve(REPO_ROOT, scaffold.target);

    if (!existsSync(exampleAbs)) {
      console.warn(`  ⚠️  ${scaffold.example} not found — skipping ${scaffold.target}`);
      continue;
    }
    if (existsSync(targetAbs)) {
      skipped.push(scaffold.target);
      console.log(`  ${scaffold.target} already exists — not overwritten (merge manually if needed)`);
      continue;
    }

    const tokens = templateTokens(v);
    const lines = readFileSync(exampleAbs, 'utf-8').split('\n');
    let resolvedFnName: string | undefined;

    let filled = lines.map((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) return line;
      const [, key, value] = match;

      let resolved = key in scaffold.directFills ? scaffold.directFills[key] : value;
      for (const [token, replacement] of Object.entries(tokens)) {
        if (resolved.includes(token)) resolved = resolved.split(token).join(replacement);
      }
      if (key === 'LAMBDA_FUNCTION_NAME') resolvedFnName = resolved;
      return `${key}=${resolved}`;
    });

    // CW_LOG_GROUP references the function name computed on its own line above —
    // resolved as a second pass once that value is known.
    if (resolvedFnName) {
      filled = filled.map((line) => line.replace('{function-name}', resolvedFnName!));
    }

    created.push(scaffold.target);
    console.log(`  ${v.dryRun ? '[dry-run] would create' : 'creating'} ${scaffold.target}`);

    if (!v.dryRun) {
      writeFileSync(targetAbs, filled.join('\n'), 'utf-8');
    }
  }

  return { created, skipped };
}

function swapReadmeForContributing(v: Answers): boolean {
  const contributingAbs = resolve(REPO_ROOT, 'CONTRIBUTING.md');
  const readmeAbs = resolve(REPO_ROOT, 'README.md');

  if (!existsSync(contributingAbs)) {
    console.log('  CONTRIBUTING.md not found — already swapped in a prior run, skipping');
    return false;
  }

  console.log(
    `  ${v.dryRun ? '[dry-run] would replace' : 'replacing'} README.md with CONTRIBUTING.md, then remove CONTRIBUTING.md`
  );

  if (!v.dryRun) {
    writeFileSync(readmeAbs, readFileSync(contributingAbs, 'utf-8'), 'utf-8');
    unlinkSync(contributingAbs);
  }

  return true;
}

function main() {
  const answers = parseAndValidateArgs();

  console.log(`\n${answers.dryRun ? '🔍 DRY RUN — no files will be written\n' : '✏️  Applying personalization\n'}`);

  console.log('Step 1 — [[CLIENT_NAME]] find-replace');
  const { filesChanged, replacements } = replaceClientNameToken(answers);
  console.log(`  → ${filesChanged} file(s), ${replacements} replacement(s)\n`);

  console.log('Step 2 — project.json {org} placeholders');
  const projectJsonChanged = rewriteProjectJsonOrgPlaceholders(answers);
  console.log(`  → ${projectJsonChanged} file(s)\n`);

  console.log('Step 3 — .env.dev scaffolding');
  const { created, skipped } = scaffoldEnvDevFiles(answers);
  console.log(`  → ${created.length} created, ${skipped.length} skipped (already existed)\n`);

  console.log('Step 4 — README swap');
  const swapped = swapReadmeForContributing(answers);
  console.log(`  → ${swapped ? 'done' : 'skipped'}\n`);

  console.log('─'.repeat(60));
  console.log(answers.dryRun ? 'Dry run complete — re-run without --dry-run to apply.' : 'Bootstrap complete.');
  console.log('─'.repeat(60));

  if (!answers.dryRun) {
    console.log('\nStill manual (not this script\'s job):');
    console.log('  - AWS account setup, `cdk bootstrap`, first `cdk deploy` — see the Quick Setup Guide');
    console.log('  - CF_DISTRIBUTION_ID stays blank until after `infra:provision` + `infra:output` — see the Quick Setup Guide');
    console.log('  - Review `git diff` before committing — this touched every file containing [[CLIENT_NAME]]');
  }
}

try {
  main();
} catch (err) {
  console.error(`\n❌ ${(err as Error).message}\n`);
  process.exit(1);
}
