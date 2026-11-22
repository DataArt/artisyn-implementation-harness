import fs from 'node:fs';
import path from 'node:path';
import { test, expect, url, outDir } from './pages-emulation';

test('a configured link shows its selection', async ({ page }) => {
  await page.goto(url('/get-started/?channel=zip&provider=codex'));
  const channels = page.getByRole('group', { name: 'Installation channel' });
  const providers = page.getByRole('group', { name: 'AI provider' });
  await expect(channels.getByRole('button', { name: /Release ZIP/ })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(providers.getByRole('button', { name: /Codex/ })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

test('the exported page contains the default selection commands', async () => {
  const html = fs.readFileSync(path.join(outDir, 'get-started', 'index.html'), 'utf8');
  expect(html).toContain(
    'npx skills add DataArt/artisyn-implementation-harness --skill implementation-harness'
  );
});
