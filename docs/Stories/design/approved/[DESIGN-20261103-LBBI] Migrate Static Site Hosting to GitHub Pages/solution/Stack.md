---
id: 64005845
purpose: "Concrete technology/library inventory of the GitHub Pages migration — what's removed, added, and unchanged"
keywords: [github-pages, stack-inventory, aws-decommission, github-actions]
---

# Stack Changes — GitHub Pages Migration

This site's stack drops its AWS deploy/hosting layer entirely and adopts GitHub's own Pages platform. Build tooling for `apps/docs-web` is unchanged.

```mermaid
flowchart LR
    subgraph REMOVED ["  Removed  "]
        CDK["AWS CDK\naws-cdk-lib"]:::removed
        CFS3["CloudFront · S3 · Lambda@Edge"]:::removed
        SECRETS["Secrets Manager · SSM Parameter Store"]:::removed
        OIDC["GitHub OIDC → AWS trust\n(CiStack roles)"]:::removed
    end

    subgraph ADDED ["  Added  "]
        ACTIONS["configure-pages@v5\nupload-pages-artifact@v3\ndeploy-pages@v4"]:::added
        PAGES["GitHub Pages\n(platform feature)"]:::added
    end

    subgraph UNCHANGED ["  Unchanged  "]
        VP["VitePress 1.x · Vite"]:::unchanged
        NODE["Node.js 24 · Yarn 4.x · Nx"]:::unchanged
    end

    classDef removed   fill:#FEE2E2,stroke:#FCA5A5,color:#991B1B
    classDef added     fill:#DCFCE7,stroke:#86EFAC,color:#166534
    classDef unchanged fill:#F1F5F9,stroke:#CBD5E1,color:#334155

    style REMOVED fill:#F8FAFC,stroke:#CBD5E1,color:#1E293B
    style ADDED fill:#F8FAFC,stroke:#CBD5E1,color:#1E293B
    style UNCHANGED fill:#F8FAFC,stroke:#CBD5E1,color:#1E293B
```

## Removed

| Item                                         | Detail                                                                                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS CDK                                      | `aws-cdk-lib`, `apps/infra/` — no longer used for this site                                                                                                                        |
| CloudFront, S3 (static origin), Lambda@Edge  | Retired along with the Infrastructure and Auth containers                                                                                                                          |
| AWS Secrets Manager, AWS SSM Parameter Store | No longer used for this site's build/deploy config                                                                                                                                 |
| GitHub OIDC-to-AWS trust                     | The `CiStack`-issued deploy/CI roles are retired; the GitHub Pages deploy uses GitHub's own OIDC token internally (`id-token: write`), scoped to the Pages deployment API, not AWS |

## Added

| Item                                                                                        | Detail                                                                                                                                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` | Official GitHub Actions for Pages deployment; no new runtime dependency to install — these run entirely within the existing GitHub Actions workflow                |
| GitHub Pages (platform feature)                                                             | Enabled via repo Settings → Pages → Source: GitHub Actions; no infrastructure-as-code definition, since it's a built-in GitHub feature, not a provisioned resource |

## Unchanged

VitePress 1.x, Vite, Node.js 24, Yarn 4.x, Nx — the build/lint/typecheck pipeline for `apps/docs-web` is untouched; only its deploy path changes.

## Compatibility/Operational Note

GitHub Pages requires the repo to be public (or GitHub Enterprise) for the free deploy path used here, and requires `pages: write` and `id-token: write` permissions on the workflow job that calls `actions/deploy-pages`. No other compatibility concern — the output is a plain static artifact.
