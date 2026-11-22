/**
 * The AWS region the agent E2E asks launch to configure aws-mcp for. A region is deployment
 * configuration and never appears in source (CLAUDE.md), so it comes from HARNESS_E2E_AWS_REGION.
 */
export function e2eAwsRegion(): string {
  const region = process.env.HARNESS_E2E_AWS_REGION?.trim();
  if (!region)
    throw new Error(
      'Set HARNESS_E2E_AWS_REGION to the AWS region the agent E2E should configure aws-mcp for.'
    );
  return region;
}
