import * as cdk from 'aws-cdk-lib';
import { CiStack } from '../lib/ci-stack';
import { DocsStack } from '../lib/docs-stack';
import { EdgeStack } from '../lib/edge-stack';
import { defaultTags } from '../lib/conventions';

const app = new cdk.App();

const environment = process.env.ENVIRONMENT ?? 'dev';
const workload = process.env.WORKLOAD ?? 'docs';
const locationShort = process.env.LOCATION_SHORT ?? '';
const cfPriceClass = process.env.CF_PRICE_CLASS ?? 'PriceClass_100';
const orgPrefix = process.env.ORG_PREFIX ?? '';

const shared = { environment, workload, locationShort, orgPrefix };

const lambdaRegion = process.env.LAMBDA_REGION;
if (!lambdaRegion) throw new Error('LAMBDA_REGION must be set (us-east-1 for Lambda@Edge)');
if (!locationShort) throw new Error('LOCATION_SHORT must be set');
if (!orgPrefix) throw new Error('ORG_PREFIX must be set (short org code used in resource names)');

const stackSuffix = `${orgPrefix}-${workload}`;

const edgeStack = new EdgeStack(app, `EdgeStack-${stackSuffix}`, {
  ...shared,
  env: { region: lambdaRegion },
  crossRegionReferences: true,
});

Object.entries(defaultTags({ orgPrefix, environment, workload })).forEach(([k, v]) =>
  cdk.Tags.of(app).add(k, v)
);

new DocsStack(app, `DocsStack-${stackSuffix}`, {
  ...shared,
  cfPriceClass,
  edgeStack,
  crossRegionReferences: true,
  env: { region: process.env.AWS_REGION },
});

const githubOrg = process.env.GITHUB_ORG;
const githubOrgId = process.env.GITHUB_ORG_ID;
const githubRepo = process.env.GITHUB_REPO;
const githubRepoId = process.env.GITHUB_REPO_ID;
if (!githubOrg || !githubOrgId || !githubRepo || !githubRepoId) {
  throw new Error(
    'GITHUB_ORG, GITHUB_ORG_ID, GITHUB_REPO, and GITHUB_REPO_ID must all be set — ' +
      'find these at https://api.github.com/repos/{org}/{repo}'
  );
}

new CiStack(app, `CiStack-${stackSuffix}`, {
  ...shared,
  githubOrg,
  githubOrgId,
  githubRepo,
  githubRepoId,
  // The GitHub OIDC provider is an AWS-account-wide singleton. Only the first
  // client/org deployed into a shared account should create it — every subsequent
  // one must import the existing provider instead. Defaults to creating it, since
  // the common case is one dedicated AWS account per client (a fresh account has
  // no provider yet). Set to 'false' when sharing an account with an org that's
  // already provisioned it.
  createOidcProvider: (process.env.CREATE_OIDC_PROVIDER ?? 'true') !== 'false',
  env: { region: process.env.AWS_REGION },
});
