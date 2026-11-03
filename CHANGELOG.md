## [1.1.1](https://github.com/DataArt/artisyn-implementation-harness/compare/v1.1.0...v1.1.1) (2026-11-03)

### Bug Fixes

- **deps:** bump nx and vite to patched versions ([d1af2d7](https://github.com/DataArt/artisyn-implementation-harness/commit/d1af2d71c7cac6edf13d4b27b74f7cf1ca906c62))

## [1.1.0](https://github.com/DataArt/artisyn-harness/compare/v1.0.0...v1.1.0) (2026-11-03)

### Features

- **docs-web:** render Graph Explorer as a concentric tier-ring graph with doc links ([0676441](https://github.com/DataArt/artisyn-harness/commit/0676441ae0e8ab4ba137e3f35fc6a9e460caaf7f))
- **docs-web:** wire operational graph into site build, add Graph Explorer page, collapsible sidebars ([a7043da](https://github.com/DataArt/artisyn-harness/commit/a7043da8ff9ff94518e30d0f993c8b604bff012e))
- **harness-bootstrap:** add operational-graph tool for deterministic docs indexing ([09b6bf9](https://github.com/DataArt/artisyn-harness/commit/09b6bf9e65f0c16bc3fc5c6e69b780de87e1d507))
- **harness-bootstrap:** add reindex-graph route, doc pruning, and purpose/keywords frontmatter rule ([9437a1f](https://github.com/DataArt/artisyn-harness/commit/9437a1f6b7a8ca863a4060f359e4686745042b07))
- **harness-bootstrap:** materialize operational graph, add standalone reindex-graph route ([3ce5199](https://github.com/DataArt/artisyn-harness/commit/3ce5199e55f232baf0b59f6f63ecc8a9c6912d3a))

### Bug Fixes

- **harness-bootstrap:** preserve doc id/edges across a file move or rename ([f64906c](https://github.com/DataArt/artisyn-harness/commit/f64906c5c932d9d7983c7358bde7cc3f95275a74))

## 1.0.0 (2026-10-16)

### Features

- **design:** gate-density pass, Context Gathering/Ceremony split, Product/Project tracks (3.0.0) ([f7d841c](https://github.com/DataArt/artisyn-harness/commit/f7d841ca691384c6aedff0b72f833240adf7173b))
- **design:** mirror dev's approval sign-off / intelligent-approval split ([c16ba23](https://github.com/DataArt/artisyn-harness/commit/c16ba2336f73415476505b02ef21c1c68318fe44))
- **dev:** split approval pattern into sign-off and intelligent-approval ([0c5ec11](https://github.com/DataArt/artisyn-harness/commit/0c5ec11c489af6506ae7cd4d126a6ebb8e349752))
- **docs-web:** dedicate top nav to the Harness product ([19e4785](https://github.com/DataArt/artisyn-harness/commit/19e4785ca1e7bfcc0c37aada9a64557721f2e51e))
- **docs-web:** VitePress documentation site with giscus comments ([c69a902](https://github.com/DataArt/artisyn-harness/commit/c69a90246530f3dd4fe34e147370f6ad617a976b))
- **harness-bootstrap:** manifest-driven Claude/Codex adapter (v2.0.0) ([22c1343](https://github.com/DataArt/artisyn-harness/commit/22c134392cddcdb0eb94c258a2f1a8ac7bc14e1e))
- **harness-bootstrap:** patch prepare 2.1.1 — launch fixes since 2.1.0 ([812c65f](https://github.com/DataArt/artisyn-harness/commit/812c65ff3cf459cf818a0ce994c1b3f52e0d720f))
- **harness-bootstrap:** release 2.3.0 with dev skill 3.1.0 ([09acb50](https://github.com/DataArt/artisyn-harness/commit/09acb508c62bf1c3b23c7a01c6ba3ca62ead344b))
- **harness-bootstrap:** release provider-neutral v2.1.0 ([3c7e397](https://github.com/DataArt/artisyn-harness/commit/3c7e39726d0289ef479c76c5883219daf492144a))
- **harness-bootstrap:** terminology registry and quieter metrics CLIs (2.4.0) ([b7302ae](https://github.com/DataArt/artisyn-harness/commit/b7302aed84bb67326fcef0777d3aa8717d6d1086))
- **harness-bootstrap:** track provider scope per patch operation (2.2.0) ([6eae6f8](https://github.com/DataArt/artisyn-harness/commit/6eae6f8267b60177a94b33ac9e410cf0799acbfd))
- **infra,auth:** CDK infrastructure and Lambda@Edge basic auth ([8aec800](https://github.com/DataArt/artisyn-harness/commit/8aec800d3906e5a091534bcbbe23c95087d756ed))
- **release:** add semantic-release automation ([518693c](https://github.com/DataArt/artisyn-harness/commit/518693c739db201d114c99ce6a11f382e1dc4b83))

### Bug Fixes

- **ci:** split shared OIDC deploy role into PR-scoped read role and main-scoped deploy role ([e34b9d2](https://github.com/DataArt/artisyn-harness/commit/e34b9d2f7c38859675011dde56a918d0e8137873))
- **docs-web:** disable raw HTML in markdown to prevent stored XSS ([c3705fd](https://github.com/DataArt/artisyn-harness/commit/c3705fdd0d836d78b38eb547e94d0b23a372ef73))
- **harness-bootstrap:** app README HLD/LLD links + NX-genericity audit ([b30e555](https://github.com/DataArt/artisyn-harness/commit/b30e555331853c5a1784d0fdc97c87d1a5ed2434))
- **harness-bootstrap:** close the checkpoint gate status vocabulary (2.1.2) ([c55abcb](https://github.com/DataArt/artisyn-harness/commit/c55abcb8f71202688fcc70cf6229c35be9563207))
- **harness-bootstrap:** correct 4 stale diff payloads in NX-genericity bundle ([0e7e992](https://github.com/DataArt/artisyn-harness/commit/0e7e992edabb9ac6ada96f6ac66bf9c6865e4eb0))
- **harness-bootstrap:** env vars and toolkit untracking for bootstrapped projects ([164fbdb](https://github.com/DataArt/artisyn-harness/commit/164fbdb176914a13f57fc27e705fec22c3289077))
- **harness-bootstrap:** re-sync the 2.1.2 bundle after the prettier hook ([3021766](https://github.com/DataArt/artisyn-harness/commit/3021766b6508b26582183a2e1c0cbe8bed99fd2e))
- **harness-bootstrap:** require D.1-D.5 outputs stay reserved in the plan ([4ad990e](https://github.com/DataArt/artisyn-harness/commit/4ad990e3b3a6c1b4d636c26e5fea601a5f621877))
- **harness-bootstrap:** resolve security-scan findings in launch/patch docs ([b1b8168](https://github.com/DataArt/artisyn-harness/commit/b1b81688f3eda9a8a30c2e34b6e6c72358c8ac03))
- **harness-bootstrap:** stop launch from abandoning itself to a background subagent ([ab03c9c](https://github.com/DataArt/artisyn-harness/commit/ab03c9c64fe2dc913b4f5878efb5d4622303c702))
- **harness-bootstrap:** tighten launch task-subject run_id and status-cell format ([67bc40b](https://github.com/DataArt/artisyn-harness/commit/67bc40b4af3386d568c482ea5af0db5a1fade275))
- **infra:** add CloudFront and S3 access logging ([bf2bf69](https://github.com/DataArt/artisyn-harness/commit/bf2bf69676e037fb2a080fc1731e2ec0cee88653))
- **license:** escape literal asterisk mangled by markdown auto-formatting ([fe91e9d](https://github.com/DataArt/artisyn-harness/commit/fe91e9d5a6bb5093ec95d4d5fba42a00725d2702))
