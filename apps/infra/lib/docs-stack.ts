import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { naming } from './conventions';
import { EdgeStack } from './edge-stack';

const PRICE_CLASS_MAP: Record<string, cloudfront.PriceClass> = {
  PriceClass_100: cloudfront.PriceClass.PRICE_CLASS_100,
  PriceClass_200: cloudfront.PriceClass.PRICE_CLASS_200,
  PriceClass_All: cloudfront.PriceClass.PRICE_CLASS_ALL,
};

interface DocsStackProps extends cdk.StackProps {
  environment: string;
  workload: string;
  locationShort: string;
  orgPrefix: string;
  cfPriceClass: string;
  edgeStack: EdgeStack;
}

export class DocsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DocsStackProps) {
    super(scope, id, props);
    const { environment, workload, locationShort, orgPrefix, cfPriceClass, edgeStack } = props;
    const names = naming({ orgPrefix, environment, workload, locationShort });

    const siteBucket = this.createSiteBucket(names.siteBucket);
    const secret = this.createAuthSecret(names.authSecret);
    const distribution = this.createDistribution(siteBucket, edgeStack, cfPriceClass);

    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, 'AuthSecretArn', { value: secret.secretArn });
    new cdk.CfnOutput(this, 'AuthSecretName', { value: secret.secretName });
    new cdk.CfnOutput(this, 'AuthLambdaFunctionName', { value: edgeStack.authFnName });
  }

  private createSiteBucket(bucketName: string): s3.Bucket {
    return new s3.Bucket(this, 'SiteBucket', {
      bucketName,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }

  private createAuthSecret(secretName: string): secretsmanager.Secret {
    return new secretsmanager.Secret(this, 'AuthSecret', {
      secretName,
      description: 'Basic auth credentials for Lambda@Edge — managed via lambda-auth:sm-push',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }

  private createDistribution(
    siteBucket: s3.Bucket,
    edgeStack: EdgeStack,
    cfPriceClass: string
  ): cloudfront.Distribution {
    return new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      // S3 returns 403 (not 404) for missing objects on private buckets.
      // Remap to the VitePress 404 page so browsers get a proper not-found response.
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: [
          {
            functionVersion: edgeStack.authFnVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
      },
      priceClass: PRICE_CLASS_MAP[cfPriceClass] ?? cloudfront.PriceClass.PRICE_CLASS_100,
    });
  }
}
