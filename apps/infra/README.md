# infra

AWS CDK stacks provisioning the CloudFront distribution, S3 origin, Lambda@Edge association,
IAM roles, and the GitHub OIDC CI/CD role (`CiStack`).

## Targets

| Target      | Command                           | Output                                  |
| ----------- | --------------------------------- | --------------------------------------- |
| `typecheck` | `yarn nx run infra:typecheck`     | TypeScript check (no emit)              |
| `lint`      | `yarn nx run infra:lint`          | ESLint on `bin`/`lib`                   |
| `synth`     | `yarn nx run infra:synth:dev`     | CDK synthesized CloudFormation template |
| `diff`      | `yarn nx run infra:diff:dev`      | Diff against deployed stacks            |
| `provision` | `yarn nx run infra:provision:dev` | ⚠️ guarded — CDK deploy, run manually   |
| `output`    | `yarn nx run infra:output:dev`    | Stack outputs from CloudFormation       |
| `destroy`   | `yarn nx run infra:destroy:dev`   | ⚠️ guarded — tears down the stacks      |

`infra:provision` is never run by CI/CD — see `docs/Engineering Guide/Infrastructure/03 CI-CD Pipeline.md`
for why, and `02 Deploy Lifecycle.md` for the full manual deploy sequence.

## Run locally

```bash
yarn install
yarn nx run infra:diff:dev    # review before provisioning
```

`infra:provision:dev` and `infra:provision:prod` are guarded commands — present them as
instructions for the developer to run, never run directly.

## Links

→ `docs/Target Architecture (HLD)/v1/Containers/Infrastructure.md` — HLD for this container
→ `docs/System Architecture (LLD)/Infrastructure/00. Overview.md` — LLD: stack/construct structure
