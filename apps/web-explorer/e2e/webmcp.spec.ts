import type { Page } from '@playwright/test';
import { test, expect, url, cspViolations } from './pages-emulation';
import { ROUTES } from './routes';

type ToolResult = { content: { type: string; text: string }[]; isError?: boolean };

/** Installs a recording WebMCP stub on document.modelContext or navigator.modelContext. */
async function installStub(page: Page, host: 'document' | 'navigator') {
  await page.addInitScript((target) => {
    const tools: {
      name: string;
      inputSchema: unknown;
      annotations?: { readOnlyHint?: boolean };
    }[] = [];
    (window as unknown as { __tools: typeof tools }).__tools = tools;
    const modelContext = {
      registerTool: (tool: (typeof tools)[number]) => {
        tools.push(tool);
      },
      unregisterTool: (name: string) => {
        const i = tools.findIndex((t) => t.name === name);
        if (i >= 0) tools.splice(i, 1);
      },
      getTools: () => tools.slice(),
    };
    Object.defineProperty(target === 'document' ? document : navigator, 'modelContext', {
      value: modelContext,
      configurable: true,
    });
    // A build with the origin-trial token gets a native document.modelContext on the emulated
    // dataart.github.io origin, which the site prefers; hide it to exercise the navigator path.
    if (target === 'navigator')
      Object.defineProperty(document, 'modelContext', { value: undefined, configurable: true });
  }, host);
}

const toolNames = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { __tools: { name: string }[] }).__tools.map((t) => t.name).sort()
  );

async function callTool(page: Page, name: string, input: unknown): Promise<unknown> {
  const result = await page.evaluate(
    async ([toolName, toolInput]) => {
      const tool = (
        window as unknown as {
          __tools: { name: string; execute: (i: unknown) => Promise<unknown> }[];
        }
      ).__tools.find((t) => t.name === toolName);
      return tool ? tool.execute(toolInput) : null;
    },
    [name, input] as const
  );
  // Chrome's API returns any JSON value; accept an MCP-style content wrapper as well.
  const wrapped = result as ToolResult | null;
  return wrapped && Array.isArray(wrapped.content) ? JSON.parse(wrapped.content[0].text) : result;
}

const EXPECTED_TOOLS = [
  'get_harness_capabilities',
  'get_install_instructions',
  'get_page',
  'open_workflow',
  'search_documentation',
];

for (const host of ['document', 'navigator'] as const) {
  test.describe(`WebMCP tools on ${host}.modelContext`, () => {
    for (const route of ROUTES) {
      test(`${route} registers the tools once with valid schemas`, async ({ page, report }) => {
        await installStub(page, host);
        await page.goto(url(route));
        await expect.poll(() => toolNames(page)).toEqual(EXPECTED_TOOLS);

        const tools = await page.evaluate(
          () =>
            (
              window as unknown as {
                __tools: {
                  name: string;
                  inputSchema: { type?: string; properties?: object };
                  annotations?: { readOnlyHint?: boolean };
                }[];
              }
            ).__tools
        );
        for (const tool of tools) {
          expect(tool.inputSchema.type).toBe('object');
          expect(typeof tool.inputSchema.properties).toBe('object');
          // open_workflow navigates the tab; every other tool only reads.
          expect(tool.annotations?.readOnlyHint).toBe(tool.name !== 'open_workflow');
        }
        expect(report.requests.some((r) => r.includes('agent-index.json'))).toBe(false);
        expect(await cspViolations(page, report)).toEqual([]);
      });
    }

    test('search, page and install tools return the expected content', async ({ page, report }) => {
      await installStub(page, host);
      await page.goto(url('/'));
      await expect.poll(() => toolNames(page)).toEqual(EXPECTED_TOOLS);

      const search = (await callTool(page, 'search_documentation', { query: 'context' })) as {
        results: { url: string }[];
      };
      expect(search.results.map((r) => r.url)).toContain(url('/inside-the-loop/context/'));

      const docs = (await callTool(page, 'search_documentation', {
        query: 'operational graph',
        source: 'docs',
      })) as {
        results: { source: string; title: string }[];
      };
      expect(docs.results[0]).toMatchObject({ source: 'docs', title: 'Operational Graph' });

      const pageContent = (await callTool(page, 'get_page', { path: '/get-started/' })) as {
        title: string;
        text: string;
      };
      expect(pageContent.title).toMatch(/get started/i);
      expect(pageContent.text.length).toBeGreaterThan(0);

      const install = (await callTool(page, 'get_install_instructions', {
        channel: 'zip',
        provider: 'claude',
      })) as {
        install: { code: string }[];
      };
      expect(install.install.map((b) => b.code).join('\n')).toContain('.zip');

      expect(await cspViolations(page, report)).toEqual([]);
    });

    test('open_workflow navigates to the lifecycle article and capabilities answer', async ({
      page,
    }) => {
      await installStub(page, host);
      await page.goto(url('/'));
      await expect.poll(() => toolNames(page)).toEqual(EXPECTED_TOOLS);
      const caps = (await callTool(page, 'get_harness_capabilities', {})) as {
        lifecycles: { id: string }[];
      };
      expect(caps.lifecycles.map((l) => l.id)).toContain('dev');
      const opened = (await callTool(page, 'open_workflow', { workflow: 'dev' })) as {
        opened: string;
      };
      expect(opened.opened).toBe(url('/docs/Harness/03%20Lifecycles/01%20Dev%20Lifecycle.html'));
      await expect(page).toHaveURL(opened.opened);
    });

    test('the agents page lists exactly the registered tools', async ({ page }) => {
      await installStub(page, host);
      await page.goto(url('/agents/'));
      await expect.poll(() => toolNames(page)).toEqual(EXPECTED_TOOLS);
      const listed = await page
        .locator('[data-tool-name]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('data-tool-name')).sort());
      expect(listed).toEqual(EXPECTED_TOOLS);
    });

    test('client navigation does not register the tools twice', async ({ page }) => {
      await installStub(page, host);
      await page.goto(url('/'));
      await expect.poll(() => toolNames(page)).toEqual(EXPECTED_TOOLS);
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Get started' })
        .click();
      await expect(page).toHaveURL(url('/get-started/'));
      expect(await toolNames(page)).toEqual(EXPECTED_TOOLS);
    });
  });
}
