import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { naming } from './conventions';

interface CiStackProps extends cdk.StackProps {
  environment: string;
  workload: string;
  locationShort: string;
  orgPrefix: string;
  githubOrg: string;
  githubOrgId: string;
  githubRepo: string;
  githubRepoId: string;
  createOidcProvider: boolean;
}

export class CiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CiStackProps) {
    super(scope, id, props);
    const {
      environment,
      workload,
      locationShort,
      orgPrefix,
      githubOrg,
      githubOrgId,
      githubRepo,
      githubRepoId,
      createOidcProvider,
    } = props;
    const names = naming({ orgPrefix, environment, workload, locationShort });

    const oidcProvider = this.createOidcProvider(createOidcProvider);
    const repoSub = `repo:${githubOrg}@${githubOrgId}/${githubRepo}@${githubRepoId}:*`;

    const ciReadRole = this.createCiReadRole(
      oidcProvider,
      names,
      environment,
      workload,
      orgPrefix,
      repoSub
    );
    const deployRole = this.createDeployRole(
      oidcProvider,
      names,
      environment,
      workload,
      orgPrefix,
      repoSub
    );

    new cdk.CfnOutput(this, 'CiRoleArn', {
      value: ciReadRole.roleArn,
      description: 'Set as CI_ROLE_ARN GitHub Actions variable (ci.yml, pull_request runs)',
    });
    new cdk.CfnOutput(this, 'DeployRoleArn', {
      value: deployRole.roleArn,
      description: 'Set as DEPLOY_ROLE_ARN GitHub Actions variable (cd.yml, push-to-main runs)',
    });
  }

  // The GitHub Actions OIDC provider is an AWS-account-wide singleton, keyed by its
  // URL — not scoped to a stack. Every client after the first one deployed into a
  // shared account must import the existing provider instead of creating a second one
  // (IAM rejects a duplicate url with EntityAlreadyExistsException).
  private createOidcProvider(create: boolean): iam.IOpenIdConnectProvider {
    if (create) {
      return new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
        // Both thumbprints cover GitHub's current and previous TLS cert chains.
        thumbprints: [
          '6938fd4d98bab03faadb97b34396831e3780aea1',
          '1c58a3a8518e8759bf075b76b750d4f2df264fcd',
        ],
      });
    }
    return iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidcProvider',
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`
    );
  }

  // ci.yml runs on `pull_request` — untrusted, pre-review code. It only needs to read SSM
  // config to build; it must never reach S3, CloudFront, or Lambda. GitHub's OIDC token
  // carries `event_name` as a claim, so the trust policy can scope on it directly —
  // `environment: dev` alone can't be used to tell ci.yml and cd.yml apart, since both
  // workflows set it and it collapses `sub` to an identical value regardless of event.
  private createCiReadRole(
    oidcProvider: iam.IOpenIdConnectProvider,
    names: ReturnType<typeof naming>,
    environment: string,
    workload: string,
    orgPrefix: string,
    repoSub: string
  ): iam.Role {
    return new iam.Role(this, 'CiReadRole', {
      roleName: names.ciReadRole,
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:event_name': 'pull_request',
        },
        StringLike: {
          // Immutable subject claim — repos created after Jun 2026 include numeric org/repo IDs.
          // Find these at https://api.github.com/repos/{org}/{repo}
          'token.actions.githubusercontent.com:sub': repoSub,
        },
      }),
      inlinePolicies: {
        SsmRead: this.buildSsmPolicy(environment, workload, orgPrefix),
      },
    });
  }

  // cd.yml runs on `push` to `main` — only after a reviewed PR has merged. This is the
  // only role allowed to write to S3, CloudFront, or the auth Lambda.
  private createDeployRole(
    oidcProvider: iam.IOpenIdConnectProvider,
    names: ReturnType<typeof naming>,
    environment: string,
    workload: string,
    orgPrefix: string,
    repoSub: string
  ): iam.Role {
    return new iam.Role(this, 'DeployRole', {
      roleName: names.ciDeployRole,
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:ref': 'refs/heads/main',
        },
        StringLike: {
          // Immutable subject claim — repos created after Jun 2026 include numeric org/repo IDs.
          // Find these at https://api.github.com/repos/{org}/{repo}
          'token.actions.githubusercontent.com:sub': repoSub,
        },
      }),
      inlinePolicies: {
        S3Deploy: this.buildS3Policy(names.siteBucket),
        CloudFrontDeploy: this.buildCloudFrontPolicy(),
        LambdaDeploy: this.buildLambdaPolicy(names.authFn),
        SsmRead: this.buildSsmPolicy(environment, workload, orgPrefix),
      },
    });
  }

  private buildS3Policy(bucketName: string): iam.PolicyDocument {
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:PutObject', 's3:DeleteObject', 's3:GetObject'],
          resources: [`arn:aws:s3:::${bucketName}/*`],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:ListBucket'],
          resources: [`arn:aws:s3:::${bucketName}`],
        }),
      ],
    });
  }

  private buildCloudFrontPolicy(): iam.PolicyDocument {
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudfront:CreateInvalidation',
            'cloudfront:GetInvalidation',
            'cloudfront:GetDistributionConfig',
            'cloudfront:UpdateDistribution',
            'cloudfront:GetDistribution',
          ],
          resources: [`arn:aws:cloudfront::${this.account}:distribution/*`],
        }),
      ],
    });
  }

  private buildLambdaPolicy(fnName: string): iam.PolicyDocument {
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'lambda:UpdateFunctionCode',
            'lambda:PublishVersion',
            'lambda:ListVersionsByFunction',
            'lambda:GetFunctionConfiguration',
          ],
          resources: [`arn:aws:lambda:*:${this.account}:function:${fnName}`],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'lambda:AddPermission',
            'lambda:RemovePermission',
            'lambda:GetFunction',
            'lambda:EnableReplication*',
          ],
          // These actions are called on versioned ARNs (function:name:version)
          resources: [`arn:aws:lambda:*:${this.account}:function:${fnName}:*`],
        }),
      ],
    });
  }

  private buildSsmPolicy(
    environment: string,
    workload: string,
    orgPrefix: string
  ): iam.PolicyDocument {
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ssm:GetParameter'],
          resources: [
            `arn:aws:ssm:${this.region}:${this.account}:parameter/${orgPrefix}/${environment}/${workload}/*`,
          ],
        }),
      ],
    });
  }
}
