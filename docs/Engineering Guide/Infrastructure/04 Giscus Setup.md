---
id: b54f7afc
purpose: Manual runbook for wiring up or reconfiguring the giscus comments widget
keywords: [giscus, GitHub Discussions, comments widget, setup runbook]
---

# Giscus Setup

_Manual runbook for wiring up or reconfiguring the comments widget._

---

## When you need this

If comments show "giscus is not installed on this repository" (or the widget doesn't render at all), either this setup was never done, or `VITE_GITHUB_ORG` / `VITE_GITHUB_REPO` / `VITE_GISCUS_REPO_ID` / `VITE_GISCUS_CATEGORY_ID` are missing or wrong — check those first: `apps/web-docs/.env.<env>` for local builds, the repository variables of the same names for the deployed site.

---

## Step 1 — Enable GitHub Discussions

```bash
gh api repos/{org}/{repo} -X PATCH -f has_discussions=true
```

Or via the browser: repo → **Settings → General → Features** → check **Discussions**.

---

## Step 2 — Install the giscus GitHub App

Install the [giscus GitHub App](https://github.com/apps/giscus), scoped to `{org}/{repo}`.

---

## Step 3 — Create a Discussions category

Repo → **Discussions** tab → **New category**. Use **Announcements** format, so only maintainers/giscus start new top-level discussions — not open floor for arbitrary new discussions. Name it whatever you like (this repo uses "ADLC Comments"); note the name, you'll need it in Step 4.

---

## Step 4 — Capture the repo ID and category ID

**Private repos have no UI path for this** — giscus.app's own configuration wizard needs public visibility to auto-detect a repo, and GitHub's embedded GraphQL Explorer no longer exists. Use the authenticated GraphQL API instead:

```bash
gh api graphql -f query='
  query {
    repository(owner: "{org}", name: "{repo}") {
      id
      discussionCategories(first: 10) {
        nodes { id name }
      }
    }
  }
'
```

`repository.id` → `GISCUS_REPO_ID`. Match the category name from Step 3 against `discussionCategories.nodes` → that node's `id` → `GISCUS_CATEGORY_ID`.

---

## Step 5 — Wire the values into `apps/web-docs/.env.<env>` and the repository variables

```
VITE_GITHUB_ORG=<org>
VITE_GITHUB_REPO=<repo>
VITE_GISCUS_REPO_ID=<value from Step 4>
VITE_GISCUS_CATEGORY_ID=<value from Step 4>
```

These are `VITE_`-prefixed because Vite inlines them at **build time**, not deploy time. Set them in two places:

| Build                         | Where the values come from                                                                                                                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local (`dev` / `prod` config) | `apps/web-docs/.env.dev` or `.env.prod`, loaded by the `envFile` of `web-docs:build` and `web-docs:serve`                                                                                                                                                               |
| Deployed site (`ci` config)   | Repository variables `VITE_GITHUB_ORG`, `VITE_GITHUB_REPO`, `VITE_GISCUS_REPO_ID`, `VITE_GISCUS_CATEGORY_ID` (Settings → Secrets and variables → Actions → Variables), passed to the build step of `.github/workflows/cd.yml`; the `ci` configuration loads no env file |

`web-docs:deploy`, `web-docs:env-push` and `web-docs:env-pull` are retirement stubs that print a message and exit 0; they are not the deploy path. `cd.yml` builds `web-docs` via `nx affected` and deploys the `web-portal:build` output to GitHub Pages — see [09 CI-CD](../09%20CI-CD.md).

---

## Verify

Open any documentation page (not the homepage — the widget is intentionally excluded there) and confirm the giscus widget renders at the bottom of the content, below the page footer.
