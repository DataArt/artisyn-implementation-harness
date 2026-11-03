# lambda-auth

Lambda@Edge handler enforcing the basic-auth password gate on every CloudFront viewer request.

## Targets

| Target      | Command                              | Output                                         |
| ----------- | ------------------------------------ | ---------------------------------------------- |
| `typecheck` | `yarn nx run lambda-auth:typecheck`  | TypeScript check (no emit)                     |
| `lint`      | `yarn nx run lambda-auth:lint`       | ESLint                                         |
| `build`     | `yarn nx run lambda-auth:build:dev`  | esbuild bundle + zip, SSM env fetched first    |
| `deploy`    | `yarn nx run lambda-auth:deploy:dev` | Lambda update, version publish, CF association |
| `logs`      | `yarn nx run lambda-auth:logs:dev`   | CloudWatch logs for the deployed function      |

`deploy` is run by `cd.yml` on merge to `main` via `nx affected`, never manually for routine
changes — see `docs/Engineering Guide/Infrastructure/03 CI-CD Pipeline.md`.

## Run locally

```bash
yarn install
yarn nx run lambda-auth:typecheck
yarn nx run lambda-auth:build:dev
```

## Links

→ `docs/Target Architecture (HLD)/v1/Containers/Auth.md` — HLD for this container
→ `docs/System Architecture (LLD)/Auth/00. Overview.md` — LLD: handler structure, auth flow
