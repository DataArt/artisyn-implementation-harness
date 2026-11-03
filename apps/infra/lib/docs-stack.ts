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

    const logsBucket = this.createLogsBucket(names.logsBucket);
    const siteBucket = this.createSiteBucket(names.siteBucket, logsBucket);
    const secret = this.createAuthSecret(names.authSecret);
    const distribution = this.createDistribution(siteBucket, logsBucket, edgeStack, cfPriceClass);

    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, 'LogsBucketName', { value: logsBucket.bucketName });
    new cdk.CfnOutput(this, 'AuthSecretArn', { value: secret.secretArn });
    new cdk.CfnOutput(this, 'AuthSecretName', { value: secret.secretName });
    new cdk.CfnOutput(this, 'AuthLambdaFunctionName', { value: edgeStack.authFnName });
  }

  // CloudFront's standard (non-v2) logging delivers via bucket ACLs, which requires
  // OBJECT_WRITER ownership — BUCKET_OWNER_ENFORCED (the default, ACLs disabled)
  // rejects the delivery. 180-day retention bounds how long access records (client
  // IPs, request paths) are kept, matching basic-auth brute-force / credential-sharing
  // detection needs without indefinite accumulation.
  private createLogsBucket(bucketName: string): s3.Bucket {
    return new s3.Bucket(this, 'LogsBucket', {
      bucketName,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      lifecycleRules: [{ expiration: cdk.Duration.days(180) }],
    });
  }

  private createSiteBucket(bucketName: string, logsBucket: s3.Bucket): s3.Bucket {
    return new s3.Bucket(this, 'SiteBucket', {
      bucketName,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsBucket: logsBucket,
      serverAccessLogsPrefix: 's3-access-logs/',
    });
  }

  private createAuthSecret(secretName: string): secretsmanager.Secret {
    return new secretsmanager.Secret(this, 'AuthSecret', {
      secretName,
      description: 'Basic auth credentials for Lambda@Edge — managed via lambda-auth:sm-push',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }

  // Defense-in-depth against any future XSS vector (NFR-7 already blocks the main
  // one by disabling raw HTML in markdown): restricts script/style/frame/connect
  // origins to this site plus giscus.app, the one third party the Discuss container
  // embeds. 'unsafe-inline' is required for VitePress's own framework-injected
  // bootstrap scripts (dark-mode/sidebar-collapse init, run inline in every page's
  // <head> — not something this app controls) and for Vue/mermaid's inline styles.
  // 'wasm-unsafe-eval' is required for the Operational Graph Explorer's sql.js (WASM)
  // — plain 'unsafe-eval' is not granted. Validated against a local build with no
  // CSP violations on the homepage, a doc page with the giscus widget, and the Graph
  // Explorer (see `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md` NFR-10).
  private createResponseHeadersPolicy(): cloudfront.ResponseHeadersPolicy {
    return new cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://giscus.app",
            "style-src 'self' 'unsafe-inline' https://giscus.app",
            "img-src 'self' data: https://giscus.app https://avatars.githubusercontent.com",
            "font-src 'self' data:",
            "connect-src 'self' https://giscus.app",
            'frame-src https://giscus.app',
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'self'",
          ].join('; '),
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN,
          override: true,
        },
        contentTypeOptions: { override: true },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
      },
    });
  }

  private createDistribution(
    siteBucket: s3.Bucket,
    logsBucket: s3.Bucket,
    edgeStack: EdgeStack,
    cfPriceClass: string
  ): cloudfront.Distribution {
    return new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      logBucket: logsBucket,
      logFilePrefix: 'cloudfront-logs/',
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
        responseHeadersPolicy: this.createResponseHeadersPolicy(),
      },
      priceClass: PRICE_CLASS_MAP[cfPriceClass] ?? cloudfront.PriceClass.PRICE_CLASS_100,
    });
  }
}
