---
id: 7c1277c8
type: Implementation Plan Addendum
title: 'DESIGN-20261121-UU4L: Plan addendum 02 — richer SEO metadata and per-page structured data'
description: Adds keywords, Open Graph image size and alt, locale and publisher fields, sitemap lastmod, and per-page schema.org structured data, with gate checks for each
tags: [web-explorer, seo, metadata, structured-data, implementation-plan, addendum]
generated: { by: process:dev-implement, at: 2026-11-22T16:40:00Z }
updated: { by: process:dev-implement, at: 2026-11-22T16:40:00Z }
---

# DESIGN-20261121-UU4L: Plan addendum 02 — richer SEO metadata and per-page structured data

| Field     | Value                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| Plan      | [1-plan.md](1-plan.md) (approved, unchanged), [addendum 01](1-plan-addendum-01.md)                                   |
| Requested | Developer, 2026-11-22, during Implement: "arent we missing keywords in routes? and other SEO data?", then "all five" |
| Finding   | RF-034 (extension)                                                                                                   |

## Change

Five gaps in the per-page SEO data, all requested by the developer:

1. **`keywords`:** the Vite site's 19-term list (the same list Web Docs uses) restored site-wide, plus optional extra keywords per route.
2. **`og:image` metadata:** width, height (1200×630 for `social-preview.png`) and alt text.
3. **Identity fields:** `og:locale` `en_US`, `applicationName`, `authors`, `creator` and `publisher` (DataArt).
4. **`lastmod` in `sitemap.xml`:** each route's last git commit date over its source files, falling back to the build time when git history is missing. Both workflows already check out full history (`fetch-depth: 0`).
5. **Per-page structured data:** schema.org JSON-LD, injected by the post-export step like the landing's (NFR-7: no raw `<script>` in source):
   - `BreadcrumbList` (Home › Inside the loop › topic) and `WebPage` on the 10 inside-the-loop pages
   - `BreadcrumbList` (Home › Inside the loop) on the hub
   - `WebPage` on the other indexable pages
   - the landing keeps `WebSite` + `SoftwareSourceCode`

## Steps

### Step 29 — Web Explorer: keywords, image, identity and lastmod metadata

Depends on Step 13. Runs next, before Step 14.

**Changes:**

- `src/routes.ts`:
  - `SITE_KEYWORDS` (the old list)
  - `RouteEntry` gains optional `keywords` and `sources` (paths relative to `apps/web-explorer`, used for `lastmod`); `image` becomes `{ path, width, height, alt }`, defaulting to `social-preview.png`, 1200×630
  - `toMetadata()` emits `keywords`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image:alt` and `og:locale`
- `src/app/layout.tsx` — `applicationName`, `authors`, `creator` and `publisher`.
- `src/app/sitemap.ts` — `lastModified` per route from `git log -1 --format=%cI -- <sources>`, with a build-time fallback.
- `check-site.mjs` `checkMetadata` and `checkSitemap` also require:
  - non-empty `keywords`
  - `og:image:width`, `og:image:height` and `og:image:alt`
  - `og:locale`
  - an ISO-8601 `<lastmod>` per URL
  - unit cases first, as in Step 1

**Verification:**

> Run: `yarn nx run web-explorer:test`
> Expected: the new metadata and sitemap cases pass.
>
> Run: `yarn nx run web-explorer:build`, then inspect `out/get-started/index.html` and `out/sitemap.xml`
> Expected: the gate passes; the page carries every new tag; every `<url>` has a `<lastmod>`.
>
> Run: the gate on a copy of `out/` with `og:image:alt` removed from one page
> Expected: it fails, naming the file.

### Step 30 — Web Explorer: per-page structured data

Depends on Step 15. Runs with Steps 15–16.

**Changes:**

- `post-export.mjs` — injects a JSON-LD block, built from the registry, into every indexable page: `BreadcrumbList` and/or `WebPage` as listed above. It uses the same `<` escaping and placement as the landing block, and `--resign` replaces it.
- `check-site.mjs` `checkJsonLd` — every indexable page has exactly one JSON-LD block that parses, with the expected `@type`s, and every breadcrumb item URL is a registry URL.
- Unit cases in `post-export.test.mjs` and `check-site.test.mjs`.

**Verification:**

> Run: `yarn nx run web-explorer:test`
> Expected: the structured-data cases pass.
>
> Run: `yarn nx run web-explorer:build`
> Expected: the gate passes. `out/inside-the-loop/context/index.html` carries a `BreadcrumbList` with three items ending at its own URL.
>
> Run: the gate on a copy of `out/` with one page's JSON-LD corrupted
> Expected: it fails, naming the file.

## Acceptance Criteria changes

New:

- [ ] `AC-29` — Every registry page carries `keywords`, `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, `twitter:image:alt` and `og:locale` (`en_US`); the root layout emits `application-name`, `author`, `creator` and `publisher`; every `sitemap.xml` URL has an ISO-8601 `<lastmod>`. The metadata gate checks each.
- [ ] `AC-30` — Every indexable page carries exactly one schema.org JSON-LD block that parses: `BreadcrumbList` (with `WebPage`) on the hub and the 10 inside-the-loop pages, `WebPage` on the others, `WebSite` + `SoftwareSourceCode` on `/`. The hash-coverage gate does not hash JSON data blocks, and no page gets a CSP violation from them.
