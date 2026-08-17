import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { naming } from './conventions';

interface EdgeStackProps extends cdk.StackProps {
  environment: string;
  workload: string;
  locationShort: string;
  orgPrefix: string;
}

export class EdgeStack extends cdk.Stack {
  public readonly authFnVersion: lambda.Version;
  public readonly authFnName: string;

  constructor(scope: Construct, id: string, props: EdgeStackProps) {
    super(scope, id, props);
    const { environment, workload, locationShort, orgPrefix } = props;
    const names = naming({ orgPrefix, environment, workload, locationShort });

    const role = this.createRole(names.authSecret);
    const fn = this.createFunction(names.authFn, role);

    this.authFnVersion = fn.currentVersion;
    // RETAIN prevents CloudFormation from deleting old versions — Lambda@Edge
    // versions cannot be deleted while CloudFront replication is active.
    this.authFnVersion.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    this.authFnName = names.authFn;

    new cdk.CfnOutput(this, 'AuthLambdaFunctionName', { value: fn.functionName });
  }

  private createRole(secretName: string): iam.Role {
    return new iam.Role(this, 'AuthFnRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        SecretsManagerRead: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['secretsmanager:GetSecretValue'],
              // Wildcard region: Lambda@Edge executes globally; SM region is build-time config
              resources: [`arn:aws:secretsmanager:*:${this.account}:secret:${secretName}-*`],
            }),
          ],
        }),
      },
    });
  }

  private createFunction(fnName: string, role: iam.Role): lambda.Function {
    return new lambda.Function(this, 'AuthFn', {
      functionName: fnName,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      // memorySize intentionally unset — CDK default is 128 MB, matching the Lambda@Edge ceiling.
      // Setting it explicitly changes the version hash and breaks the CFn cross-stack export.
      // Placeholder passthrough — real handler deployed via lambda-auth:deploy
      code: lambda.Code.fromInline(
        'exports.handler = async (event) => event.Records[0].cf.response;'
      ),
      role,
      timeout: cdk.Duration.seconds(5),
    });
  }
}
