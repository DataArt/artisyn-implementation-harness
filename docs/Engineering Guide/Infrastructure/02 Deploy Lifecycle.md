# Deploy Lifecycle

_Full sequence from code change to live site — infrastructure, auth handler, and site content._

---

## Full deploy sequence

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CDK as CDK (infra:provision)
    participant LAE as lambda-auth:deploy
    participant VP as VitePress (site:deploy)
    participant CF as CloudFront
    participant S3 as S3

    Note over Dev,S3: Infrastructure changes only — skip if no CDK changes
    Dev->>CDK: yarn nx run infra:provision:dev
    CDK->>CF: provision DocsStack (distribution + OAC)
    CDK->>S3: provision S3 bucket
    CDK->>LAE: provision EdgeStack placeholder (us-east-1)
    CDK-->>CF: reset viewer-request association to placeholder

    Note over Dev,S3: Always required after CDK deploy — run independently for auth-only changes
    Dev->>LAE: yarn nx run lambda-auth:deploy:dev
    LAE->>LAE: build TypeScript → dist/index.js (esbuild)
    LAE->>LAE: zip → dist/lambda-auth.zip
    LAE->>CF: aws lambda update-function-code
    LAE->>CF: publish new version → update viewer-request association

    Note over Dev,S3: Always required after CDK or auth changes — run independently for content-only changes
    Dev->>VP: yarn nx run site:deploy:dev
    VP->>VP: VitePress build → dist/
    VP->>S3: aws s3 sync dist/
    VP->>CF: CloudFront invalidation /*
```

CDK deploy is only required when infrastructure changes. `lambda-auth:deploy` and `site:deploy` can run independently for code-only or content-only changes.

---

## Infrastructure deploy (CDK)

Two stacks are deployed in order:

| Stack       | Region                                             | Contents                                                   |
| ----------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `EdgeStack` | `us-east-1` (hard AWS requirement for Lambda@Edge) | Placeholder Lambda function for viewer-request association |
| `DocsStack` | Deployment region                                  | CloudFront distribution, S3 bucket, IAM/OAC                |

The `EdgeStack` placeholder Lambda returns `event.Records[0].cf.response` unchanged. It exists solely to establish the CloudFront viewer-request association. The real handler is deployed via `lambda-auth:deploy`.

Operational coupling: any `cdk deploy` touching `DocsStack` resets the CloudFront Lambda@Edge association back to the CDK placeholder version. `lambda-auth:deploy` must always run after a CDK deploy.

```sh
# Guarded — present to developer, do not run directly
# yarn nx run infra:provision:dev
```

---

## Auth handler deploy (`lambda-auth:deploy`)

The CI script `scripts/ci/lambda-edge-deploy.sh` runs four steps in sequence:

| Step | Action                                                                            |
| ---- | --------------------------------------------------------------------------------- |
| 1    | Build TypeScript handler and bundle with esbuild → `dist/index.js`                |
| 2    | Zip bundle → `dist/lambda-auth.zip`                                               |
| 3    | `aws lambda update-function-code` with the new zip                                |
| 4    | Publish a new Lambda version and update the CloudFront viewer-request association |

```sh
# Guarded — present to developer, do not run directly
# yarn nx run lambda-auth:deploy:dev
```

---

## Site deploy (`site:deploy`)

| Step | Action                               |
| ---- | ------------------------------------ |
| 1    | VitePress build → `dist/`            |
| 2    | `aws s3 sync dist/` to the S3 bucket |
| 3    | CloudFront invalidation on `/*`      |

```sh
# Guarded — present to developer, do not run directly
# yarn nx run site:deploy:dev
```

---

For first-time environment setup (bootstrap, env files, secrets), see `01 Local Provisioning Runbook.md`.

For the automated CI/CD pipeline (GitHub Actions, OIDC, `nx affected` deploy), see `03 CI-CD Pipeline.md`.
