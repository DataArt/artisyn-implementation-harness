import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const load = () => import('./check-site.mjs');

const SITE = 'https://dataart.github.io/artisyn-implementation-harness';
const hash = (text) =>
  `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;
const policy = (hashes) =>
  `default-src 'none'; script-src ${hashes.join(' ')} ${SITE}/; style-src ${SITE}/ 'unsafe-inline'; img-src ${SITE}/; font-src ${SITE}/; connect-src ${SITE}/; manifest-src ${SITE}/; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests`;

const SCRIPT = 'self.__boot=1';
const signed = ({ csp = policy([hash(SCRIPT)]), body = '', head = '' } = {}) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}">${head}<script>${SCRIPT}</script><script src="/artisyn-implementation-harness/_next/static/chunks/a.js"></script></head><body><main>${body}</main></body></html>`;

const META = {
  title: '<title>Get started — Artisyn</title>',
  description: '<meta name="description" content="Install the harness.">',
  referrer: '<meta name="referrer" content="strict-origin-when-cross-origin">',
  canonical: `<link rel="canonical" href="${SITE}/get-started/">`,
  ogTitle: '<meta property="og:title" content="Get started">',
  ogDescription: '<meta property="og:description" content="Install the harness.">',
  ogUrl: `<meta property="og:url" content="${SITE}/get-started/">`,
  ogImage: `<meta property="og:image" content="${SITE}/social-preview.png">`,
  twitter: '<meta name="twitter:card" content="summary_large_image">',
};
const page = (meta = META, extra = '') =>
  `<!DOCTYPE html><html><head><meta charset="utf-8">${Object.values(meta).join('')}${extra}</head><body><main></main></body></html>`;
const without = (key) => Object.fromEntries(Object.entries(META).filter(([k]) => k !== key));
const ENTRY = { path: '/get-started/', index: true };
const opts = (fileExists = () => true) => ({ siteUrl: SITE, fileExists });

// Metadata (Step 12)

test('check-site metadata: a complete page passes', { todo: 'Step 12' }, async () => {
  const { checkMetadata } = await load();
  assert.deepEqual(checkMetadata(page(), ENTRY, opts()), []);
});

test('check-site metadata: each missing or malformed tag fails', { todo: 'Step 12' }, async () => {
  const { checkMetadata } = await load();
  const broken = {
    title: page(without('title')),
    description: page(without('description')),
    referrer: page(without('referrer')),
    ogTitle: page(without('ogTitle')),
    ogDescription: page(without('ogDescription')),
    ogUrl: page(without('ogUrl')),
    canonicalSlash: page({
      ...META,
      canonical: `<link rel="canonical" href="${SITE}/get-started">`,
    }),
    canonicalHost: page({
      ...META,
      canonical: '<link rel="canonical" href="https://example.com/get-started/">',
    }),
    ogImageRelative: page({
      ...META,
      ogImage: '<meta property="og:image" content="/social-preview.png">',
    }),
    twitter: page({ ...META, twitter: '<meta name="twitter:card" content="summary">' }),
  };
  for (const [name, html] of Object.entries(broken))
    assert.notDeepEqual(checkMetadata(html, ENTRY, opts()), [], name);
  assert.notDeepEqual(
    checkMetadata(
      page(),
      ENTRY,
      opts(() => false)
    ),
    [],
    'og:image file missing'
  );
});

test(
  'check-site metadata: a noindex route must carry robots noindex',
  { todo: 'Step 12' },
  async () => {
    const { checkMetadata } = await load();
    const comic = { path: '/comic/', index: false };
    const meta = {
      ...META,
      canonical: `<link rel="canonical" href="${SITE}/comic/">`,
      ogUrl: `<meta property="og:url" content="${SITE}/comic/">`,
    };
    assert.notDeepEqual(checkMetadata(page(meta), comic, opts()), []);
    assert.deepEqual(
      checkMetadata(page(meta, '<meta name="robots" content="noindex">'), comic, opts()),
      []
    );
  }
);

test(
  'check-site metadata: 404.html needs title, description, referrer and noindex only',
  { todo: 'Step 12' },
  async () => {
    const { check404 } = await load();
    const ok = `<html><head><meta charset="utf-8">${META.title}${META.description}${META.referrer}<meta name="robots" content="noindex"></head><body></body></html>`;
    assert.deepEqual(check404(ok), []);
    assert.notDeepEqual(check404(ok.replace('<meta name="robots" content="noindex">', '')), []);
  }
);

test(
  'check-site metadata: the sitemap lists exactly the indexable pages',
  { todo: 'Step 12' },
  async () => {
    const { checkSitemap } = await load();
    const xml = (paths) =>
      `<?xml version="1.0"?><urlset>${paths.map((p) => `<url><loc>${SITE}${p}</loc></url>`).join('')}</urlset>`;
    const indexable = ['/', '/get-started/'];
    assert.deepEqual(checkSitemap(xml(indexable), indexable, SITE), []);
    assert.notDeepEqual(checkSitemap(xml([...indexable, '/comic/']), indexable, SITE), []);
    assert.notDeepEqual(checkSitemap(xml(['/']), indexable, SITE), []);
  }
);

// llms.txt (Step 13)

test(
  'check-site llms.txt: a valid file passes; missing parts fail',
  { todo: 'Step 13' },
  async () => {
    const { checkLlmsTxt } = await load();
    const urls = [`${SITE}/`, `${SITE}/get-started/`];
    const valid = `# Artisyn — Implementation Harness\n\n> Structured AI engineering lifecycles.\n\n## Pages\n\n- [Home](${urls[0]}): Landing page\n- [Get started](${urls[1]}): Install the harness\n`;
    assert.deepEqual(checkLlmsTxt(valid, urls), []);
    assert.notDeepEqual(checkLlmsTxt(valid.replace('# Artisyn', 'Artisyn'), urls), [], 'no H1');
    assert.notDeepEqual(checkLlmsTxt('# Short\n', urls), [], 'too short, no links');
    assert.notDeepEqual(
      checkLlmsTxt(valid.replace(/- \[Get started\].*\n/, ''), urls),
      [],
      'route missing'
    );
    assert.notDeepEqual(
      checkLlmsTxt(`${valid}- [Comic](${SITE}/comic/): x\n`, urls),
      [],
      'comic present'
    );
  }
);

// Security (Step 16)

test('check-site security: a correctly signed page passes', { todo: 'Step 16' }, async () => {
  const { checkSecurity } = await load();
  assert.deepEqual(checkSecurity(signed(), SITE), []);
});

test(
  'check-site security: uncovered hash, duplicate or misplaced CSP, external URL fail',
  { todo: 'Step 16' },
  async () => {
    const { checkSecurity } = await load();
    const uncovered = checkSecurity(signed({ csp: policy([hash('other')]) }), SITE);
    assert.ok(
      uncovered.some((e) => e.includes(SCRIPT.slice(0, 80))),
      'names the script'
    );
    assert.notDeepEqual(
      checkSecurity(
        signed({ head: `<meta http-equiv="Content-Security-Policy" content="${policy([])}">` }),
        SITE
      ),
      []
    );
    const misplaced = signed().replace(
      '<meta charset="utf-8">',
      '<meta charset="utf-8"><script>x</script>'
    );
    assert.notDeepEqual(checkSecurity(misplaced, SITE), []);
    assert.notDeepEqual(
      checkSecurity(signed({ body: '<img src="https://evil.example/x.png" alt="">' }), SITE),
      []
    );
    assert.notDeepEqual(
      checkSecurity(
        signed({ head: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2">' }),
        SITE
      ),
      []
    );
  }
);

test('check-site security: the root JSON-LD block must parse', { todo: 'Step 16' }, async () => {
  const { checkJsonLd } = await load();
  assert.deepEqual(
    checkJsonLd(
      signed({
        head: '<script type="application/ld+json">{"@context":"https://schema.org"}</script>',
      })
    ),
    []
  );
  assert.notDeepEqual(
    checkJsonLd(signed({ head: '<script type="application/ld+json">{oops</script>' })),
    []
  );
  assert.notDeepEqual(checkJsonLd(signed()), [], 'missing block');
});

// Agent index (Step 18)

test('check-site agent index: complete index passes; gaps fail', { todo: 'Step 18' }, async () => {
  const { checkAgentIndex } = await load();
  const entry = (path) => ({
    path,
    url: `${SITE}${path}`,
    title: 'T',
    description: 'D',
    headings: ['T'],
    text: 'Some text',
  });
  const index = { source: 'site', entries: [entry('/'), entry('/get-started/')] };
  const indexable = ['/', '/get-started/'];
  assert.deepEqual(checkAgentIndex(index, indexable, 1_000_000), []);
  assert.notDeepEqual(
    checkAgentIndex({ ...index, entries: [entry('/')] }, indexable, 1_000_000),
    [],
    'route missing'
  );
  assert.notDeepEqual(
    checkAgentIndex(
      { ...index, entries: [...index.entries, entry('/comic/')] },
      indexable,
      1_000_000
    ),
    [],
    'comic'
  );
  assert.notDeepEqual(
    checkAgentIndex(
      { ...index, entries: [{ ...entry('/'), text: '' }, entry('/get-started/')] },
      indexable,
      1_000_000
    ),
    [],
    'empty text'
  );
  assert.notDeepEqual(checkAgentIndex(index, indexable, 10), [], 'too large');
});

// Origin trial (Step 21)

test(
  'check-site origin trial: tag present exactly when the token is set',
  { todo: 'Step 21' },
  async () => {
    const { checkOriginTrial } = await load();
    const tagged = signed({ head: '<meta http-equiv="origin-trial" content="tok">' });
    assert.deepEqual(checkOriginTrial(tagged, 'tok'), []);
    assert.deepEqual(checkOriginTrial(signed(), undefined), []);
    assert.notDeepEqual(checkOriginTrial(signed(), 'tok'), []);
    assert.notDeepEqual(checkOriginTrial(tagged, undefined), []);
  }
);
