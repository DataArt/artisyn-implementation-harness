import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const load = () => import('./post-export.mjs');

const SITE = 'https://dataart.github.io/artisyn-implementation-harness';
const LOCAL = 'http://localhost:4173/artisyn-implementation-harness';
const sha = (text) =>
  `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;

const PAGE = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Page</title>
<script>self.__boot=1</script>
<script type="application/json">{"data":true}</script>
<script src="/artisyn-implementation-harness/_next/static/chunks/main.js" async=""></script>
</head><body><header><nav>Nav</nav></header><main><h1>Title</h1><p>Body text.</p><svg><text>chart</text></svg>
<h2>Second</h2><script>self.__rsc=2</script></main><footer>Foot</footer></body></html>`;

const ROOT = {
  jsonLd: {
    '@context': 'https://schema.org',
    name: 'A <b> site',
    description: 'Uses </script> safely',
  },
  redirectSrc: '/artisyn-implementation-harness/legacy-hash-redirect.js',
};

const cspMetas = (html) => html.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/g) ?? [];
const policyOf = (html) => cspMetas(html)[0].match(/content="([^"]*)"/)[1];

test('post-export: one CSP meta right after meta charset, with the D11 directives', async () => {
  const { signPage } = await load();
  const out = signPage(PAGE, { site: SITE, upgradeInsecure: true });
  assert.equal(cspMetas(out).length, 1);
  assert.match(out, /<meta charset="utf-8"><meta http-equiv="Content-Security-Policy"/);
  const policy = policyOf(out);
  assert.match(policy, /^default-src 'none'; script-src /);
  assert.ok(policy.includes(`${SITE}/`));
  for (const d of [
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    `style-src ${SITE}/ 'unsafe-inline'`,
  ])
    assert.ok(policy.includes(d), d);
  assert.ok(policy.endsWith('upgrade-insecure-requests'));
});

test('post-export: hashes inline executable scripts, not JSON data blocks', async () => {
  const { signPage } = await load();
  const policy = policyOf(signPage(PAGE, { site: SITE, upgradeInsecure: true }));
  assert.ok(policy.includes(sha('self.__boot=1')));
  assert.ok(policy.includes(sha('self.__rsc=2')));
  assert.ok(!policy.includes(sha('{"data":true}')));
});

test('post-export: JSON-LD and the redirect script go before the first head script, escaped', async () => {
  const { signPage } = await load();
  const out = signPage(PAGE, { site: SITE, upgradeInsecure: true, root: ROOT });
  const ld = out.indexOf('<script type="application/ld+json">');
  const redirect = out.indexOf(`<script src="${ROOT.redirectSrc}"></script>`);
  const firstOriginal = out.indexOf('<script>self.__boot=1</script>');
  assert.ok(ld > 0 && redirect > ld && firstOriginal > redirect);
  const ldText = out
    .slice(ld)
    .match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.ok(!ldText.includes('<'));
  assert.ok(ldText.includes('\\u003c'));
  assert.deepEqual(JSON.parse(ldText), ROOT.jsonLd);
});

test('post-export: fails on an existing CSP meta or a missing charset', async () => {
  const { signPage } = await load();
  const signed = signPage(PAGE, { site: SITE, upgradeInsecure: true });
  assert.throws(
    () => signPage(signed, { site: SITE, upgradeInsecure: true }),
    /Content-Security-Policy/
  );
  assert.throws(
    () => signPage(PAGE.replace('<meta charset="utf-8">', ''), { site: SITE }),
    /charset/
  );
});

test('post-export: --resign replaces the earlier injections and drops upgrade-insecure-requests on http', async () => {
  const { signPage } = await load();
  const prod = signPage(PAGE, {
    site: SITE,
    upgradeInsecure: true,
    root: ROOT,
    originTrialToken: 'tok',
  });
  const local = signPage(prod, { site: LOCAL, upgradeInsecure: false, root: ROOT, resign: true });
  assert.equal(cspMetas(local).length, 1);
  assert.equal(local.match(/application\/ld\+json/g).length, 1);
  assert.equal(local.split(ROOT.redirectSrc).length - 1, 1);
  const policy = policyOf(local);
  assert.ok(policy.includes(`${LOCAL}/`));
  assert.ok(!policy.includes(SITE));
  assert.ok(!policy.includes('upgrade-insecure-requests'));
});

test('post-export: origin-trial meta right after the CSP meta only when a token is given', async () => {
  const { signPage } = await load();
  const withToken = signPage(PAGE, {
    site: SITE,
    upgradeInsecure: true,
    originTrialToken: 'tok',
  });
  assert.match(
    withToken,
    /<meta http-equiv="Content-Security-Policy"[^>]*><meta http-equiv="origin-trial" content="tok">/
  );
  assert.ok(!signPage(PAGE, { site: SITE, upgradeInsecure: true }).includes('origin-trial'));
});

test('post-export: extracts headings and main text without chrome, scripts or svg', async () => {
  const { extractPageContent } = await load();
  const { headings, text } = extractPageContent(PAGE);
  assert.deepEqual(headings, ['Title', 'Second']);
  assert.equal(text, 'Title Body text. Second');
});

// Per-page structured data (Step 30, addendum 02)

const REGISTRY = [
  {
    path: '/',
    title: 'Artisyn — Implementation Harness',
    description: 'Home.',
    index: true,
    sources: [],
  },
  {
    path: '/cookbook/team-adoption-path/',
    title: 'Team Adoption Path',
    description: 'Hub.',
    index: true,
    sources: [],
  },
  {
    path: '/cookbook/team-adoption-path/context/',
    title: 'Context',
    description: 'Context page.',
    index: true,
    sources: [],
  },
  {
    path: '/get-started/',
    title: 'Get started',
    description: 'Install.',
    index: true,
    sources: [],
  },
  { path: '/comic/', title: 'Comic', description: 'Comic.', index: false, sources: [] },
];
const ctx = {
  siteUrl: SITE,
  routes: REGISTRY,
  repoUrl: 'https://github.com/DataArt/artisyn-implementation-harness',
};
const typesOf = (ld) => (ld['@graph'] ?? [ld]).map((n) => n['@type']).sort();

test('post-export structured data: topic pages get WebPage + a 3-item BreadcrumbList ending at the page', async () => {
  const { pageJsonLd } = await load();
  const ld = pageJsonLd(REGISTRY[2], ctx);
  assert.deepEqual(typesOf(ld), ['BreadcrumbList', 'WebPage']);
  const crumbs = ld['@graph'].find((n) => n['@type'] === 'BreadcrumbList').itemListElement;
  assert.deepEqual(
    crumbs.map((c) => c.item),
    [
      `${SITE}/`,
      `${SITE}/cookbook/team-adoption-path/`,
      `${SITE}/cookbook/team-adoption-path/context/`,
    ]
  );
  assert.deepEqual(
    crumbs.map((c) => c.position),
    [1, 2, 3]
  );
});

test('post-export structured data: pages with no route above them get WebPage, landing its graph, noindex none', async () => {
  const { pageJsonLd } = await load();
  assert.deepEqual(typesOf(pageJsonLd(REGISTRY[1], ctx)), ['WebPage']);
  assert.deepEqual(typesOf(pageJsonLd(REGISTRY[3], ctx)), ['WebPage']);
  assert.deepEqual(typesOf(pageJsonLd(REGISTRY[0], ctx)), ['SoftwareSourceCode', 'WebSite']);
  assert.equal(pageJsonLd(REGISTRY[4], ctx), undefined);
});

// RF-036: Lighthouse reads <origin>/robots.txt and <origin>/llms.txt under the page CSP.

test('post-export: connect-src also allows exactly the two origin-root files Lighthouse reads', async () => {
  const { signPage } = await load();
  const directive = (html) =>
    policyOf(html)
      .split('; ')
      .find((d) => d.startsWith('connect-src '));
  assert.equal(
    directive(signPage(PAGE, { site: SITE, upgradeInsecure: true })),
    `connect-src ${SITE}/ https://dataart.github.io/robots.txt https://dataart.github.io/llms.txt`
  );
  assert.equal(
    directive(signPage(PAGE, { site: LOCAL, upgradeInsecure: false })),
    `connect-src ${LOCAL}/ http://localhost:4173/robots.txt http://localhost:4173/llms.txt`
  );
});

test('post-export registryAncestors: only route paths above the page, nearest last', async () => {
  const { registryAncestors } = await load();
  const byPath = new Map(REGISTRY.map((r) => [r.path, r]));
  assert.deepEqual(registryAncestors('/cookbook/team-adoption-path/context/', byPath), [
    '/cookbook/team-adoption-path/',
  ]);
  assert.deepEqual(registryAncestors('/cookbook/team-adoption-path/', byPath), []);
  assert.deepEqual(registryAncestors('/cookbook/case/migration/', byPath), []);
  assert.deepEqual(registryAncestors('/', byPath), []);
});
