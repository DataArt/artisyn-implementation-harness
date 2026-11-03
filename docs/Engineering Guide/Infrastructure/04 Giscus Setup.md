---
id: b54f7afc
purpose: Manual runbook for wiring up or reconfiguring the giscus comments widget
keywords: [giscus, GitHub Discussions, comments widget, setup runbook]
---

# Giscus Setup

_Manual runbook for wiring up or reconfiguring the comments widget._

---

## When you need this

If comments show "giscus is not installed on this repository" (or the widget doesn't render at all), either this setup was never done, or `VITE_GITHUB_ORG` / `VITE_GITHUB_REPO` / `VITE_GISCUS_REPO_ID` / `VITE_GISCUS_CATEGORY_ID` in `apps/docs-web/.env.<env>` are missing or wrong — check those first.

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

## Step 5 — Wire the values into `apps/docs-web/.env.<env>`

```
VITE_GITHUB_ORG=<org>
VITE_GITHUB_REPO=<repo>
VITE_GISCUS_REPO_ID=<value from Step 4>
VITE_GISCUS_CATEGORY_ID=<value from Step 4>
```

These are `VITE_`-prefixed because Vite inlines them at **build time**, not deploy time — see `03 CI-CD Pipeline.md` for why the CI build step (not just the deploy step) must have these loaded before it runs. Push to SSM and rebuild/redeploy:

```bash
yarn nx run site:env-push:dev
yarn nx run site:deploy:dev
```

---

## Verify

Open any documentation page (not the homepage — the widget is intentionally excluded there) and confirm the giscus widget renders at the bottom of the content, below the page footer.
