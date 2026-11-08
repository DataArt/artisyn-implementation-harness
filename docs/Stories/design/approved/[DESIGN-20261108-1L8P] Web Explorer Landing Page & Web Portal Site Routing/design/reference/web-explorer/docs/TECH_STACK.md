# Recommended technology stack

## Baseline (included)

| Concern | Choice                                                     | Notes                                                                                                  |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Runtime | Node.js 24 LTS line recommended                            | Consistent with the project's `.nvmrc` convention. Follow root `.nvmrc` when embedded in the monorepo. |
| UI      | React 19 + TypeScript                                      | Browser-only SPA.                                                                                      |
| Tooling | Vite 8 + `@vitejs/plugin-react`                            | Dev, static build, React Fast Refresh. No Next.js/SSR.                                                 |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` + scoped CSS tokens | CSS tokens keep theme coherent. Use utilities for incremental expansion.                               |
| Icons   | Lucide React                                               | Tree-shakeable line icons.                                                                             |
| Motion  | Motion for React                                           | Only meaningful UI transitions; honor reduced motion.                                                  |
| State   | Local React state                                          | No state library for this size.                                                                        |
| Routing | Hash links / one page                                      | No react-router for v1.                                                                                |
| Content | Typed TypeScript objects                                   | Review against canonical `docs/Harness/` when publishing.                                              |
| Hosting | Static `dist/` on CDN                                      | No backend, DB, auth, API or server functions.                                                         |

**Not included intentionally:** shadcn/ui (can add later for dialogs/forms), React Flow (not needed for v1), CMS, analytics SDK, data-fetching client, backend.

## Standalone commands

```bash
corepack enable
# Node 24 according to .nvmrc
yarn install
yarn dev
yarn typecheck
yarn build
```

Run Vite from the app folder. The app can also be installed using npm if you prefer, but the recommended path is the host monorepo's Yarn 4.

## Integration with an existing Nx/Yarn monorepo

1. Place the package at `apps/web-explorer`.
2. Check that root Yarn workspaces include it (typically `apps/*`). Keep a **single root lockfile**, do not create an app-local competing lockfile.
3. Install dependencies from the repository root and use the repo's Node/Yarn versions.
4. Use existing Nx inference or register an explicit Nx target appropriate to the repo; do not assume Nx discovers arbitrary script targets without configuration.
5. Set deploy output to `apps/web-explorer/dist` (relative to repo root).
6. Add only the CI targets you actually need: typecheck and build initially; add accessibility/smoke tests as the product grows.
7. Check CSP, asset base path and caching when deploying under a subpath; Vite default assumes deployment at `/`.

Recommended Yarn invocation once the workspace has been registered:

```bash
yarn workspace @artisyn/web-explorer dev
yarn workspace @artisyn/web-explorer typecheck
yarn workspace @artisyn/web-explorer build
```

## Version strategy

`package.json` specifies compatible major ranges current for the handoff. When integrating, reconcile them with the actual root constraints and lockfile. Do not change the root monorepo's React, Vite or TypeScript versions blindly.

## Deployment

Build produces self-contained static files in `dist/`. Any CDN/static host works. Only one page and hash anchors, so no SPA server-side history fallback is currently required. Set long cache for hashed `/assets/*`, short cache for `index.html`. Configure HTTPS and an appropriate security policy. For social previews, replace relative `og:image` with the absolute production URL before launch.

## Authoritative references

- https://vite.dev/guide/
- https://tailwindcss.com/docs/installation/using-vite
- https://motion.dev/docs/react-installation
- https://lucide.dev/guide/packages/lucide-react
- https://ui.shadcn.com/docs/installation/vite (optional later)
