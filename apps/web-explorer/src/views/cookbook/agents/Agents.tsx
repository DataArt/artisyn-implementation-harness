import { ArrowUpRight, Bot, FileJson, FileText, Map, ShieldCheck } from 'lucide-react';
import Footer from '../../../components/Footer';
import { TOOL_DEFINITIONS, type ToolDefinition } from '../../../agent/definitions';
import { asset } from '../../../site';
import { docsUrl } from '../../../env';
import './agents.css';

type Property = { type?: string; enum?: readonly string[]; description?: string };

function inputsOf(tool: ToolDefinition) {
  const required = new Set(tool.inputSchema.required ?? []);
  return Object.entries(tool.inputSchema.properties as Record<string, Property>).map(
    ([name, p]) => ({
      name,
      required: required.has(name),
      type: p.enum ? p.enum.join(' | ') : (p.type ?? 'string'),
      description: p.description ?? '',
    })
  );
}

const DEVTOOLS_SAMPLE = `const tools = await document.modelContext.getTools();
console.table(tools.map((t) => t.name));

const search = tools.find((t) => t.name === 'search_documentation');
await document.modelContext.executeTool(search, { query: 'design lifecycle' });`;

const RESOURCES = [
  {
    href: asset('/llms.txt'),
    label: 'llms.txt',
    note: 'A Markdown summary of every page, for language models',
    icon: <FileText size={18} />,
  },
  {
    href: asset('/agent-index.json'),
    label: 'agent-index.json',
    note: 'Headings and text of every site page',
    icon: <FileJson size={18} />,
  },
  {
    href: asset('/docs/agent-index.json'),
    label: 'docs/agent-index.json',
    note: 'Headings and text of every documentation article',
    icon: <FileJson size={18} />,
  },
  {
    href: asset('/sitemap.xml'),
    label: 'sitemap.xml',
    note: 'Every indexable page, with its last change',
    icon: <Map size={18} />,
  },
];

export default function Agents() {
  return (
    <>
      <main className="container section agents-page">
        <div className="section-heading">
          <span className="eyebrow">FOR AI AGENTS</span>
          <h1>Use this site with AI agents.</h1>
          <p>
            Browser agents can search the documentation, read pages, get install instructions and
            open workflows through WebMCP tools this site registers. Crawlers and language models
            can read the machine-readable files below. Everything is static: there is no server and
            no account.
          </p>
        </div>

        <section aria-labelledby="tools-heading" className="agents-block">
          <h2 id="tools-heading">
            <Bot size={20} /> What an agent can do here
          </h2>
          <ul className="agents-tools">
            {TOOL_DEFINITIONS.map((tool) => (
              <li key={tool.name} className="agents-tool" data-tool-name={tool.name}>
                <div className="agents-tool-head">
                  <code className="mono">{tool.name}</code>
                  <span
                    className={
                      tool.annotations.readOnlyHint
                        ? 'agents-badge'
                        : 'agents-badge agents-badge-nav'
                    }
                  >
                    {tool.annotations.readOnlyHint ? 'read-only' : 'opens a page'}
                  </span>
                </div>
                <p>{tool.description}</p>
                {inputsOf(tool).length > 0 ? (
                  <dl className="agents-inputs">
                    {inputsOf(tool).map((input) => (
                      <div key={input.name}>
                        <dt>
                          <code className="mono">{input.name}</code>
                          {input.required ? '' : ' (optional)'}
                        </dt>
                        <dd>
                          <code className="mono">{input.type}</code> — {input.description}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="agents-muted">No inputs.</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="try-heading" className="agents-block">
          <h2 id="try-heading">How to try it</h2>
          <ol className="agents-steps">
            <li>
              Use Chrome 150 or later. WebMCP is experimental: turn it on at{' '}
              <code className="mono">chrome://flags/#enable-webmcp-testing</code> and relaunch, or
              rely on this site&apos;s WebMCP origin trial when it is active.
            </li>
            <li>Open any page of this site; the tools register once the page has loaded.</li>
            <li>In DevTools, list the tools and call one:</li>
          </ol>
          <pre className="mono agents-code">{DEVTOOLS_SAMPLE}</pre>
          <p className="agents-muted">
            Without WebMCP the site works the same and registers nothing.
          </p>
        </section>

        <section aria-labelledby="files-heading" className="agents-block">
          <h2 id="files-heading">Machine-readable files</h2>
          <ul className="agents-resources">
            {RESOURCES.map((r) => (
              <li key={r.label}>
                <a href={r.href} className="icon-link">
                  {r.icon} {r.label} <ArrowUpRight size={14} />
                </a>
                <span>{r.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="limits-heading" className="agents-block">
          <h2 id="limits-heading">
            <ShieldCheck size={20} /> What the tools can and cannot do
          </h2>
          <ul className="agents-limits">
            <li>
              They read only public pages of this site and its documentation; nothing is written
              anywhere.
            </li>
            <li>
              <code className="mono">open_workflow</code> is the one tool that acts: it navigates
              this tab to a lifecycle article in the <a href={docsUrl}>documentation</a>.
            </li>
            <li>
              There is no server, no account and no data collection; the indexes are static files.
            </li>
            <li>
              Every page carries a strict Content Security Policy: scripts, styles, fonts and data
              load only from this site.
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
