import { useState } from 'react';
import { Glyph } from './glyphs';
import { scale, harness } from '../data';

type Item = { name: string; count: string; note: string };

const claude: Item[] = [
  {
    name: 'skills/',
    count: `${harness.skillsRules + harness.skillsCommands} files`,
    note: 'conventions and slash commands: how things are done here',
  },
  {
    name: 'agents/',
    count: `${harness.agents} files`,
    note: 'layer specialists — each with its own context',
  },
  {
    name: 'reflections/',
    count: `${harness.reflections} files`,
    note: 'post-ticket debriefs — raw material for skills',
  },
  { name: 'memory/', count: '17 files', note: "decisions you can't derive from code" },
];

const docs: Item[] = [
  {
    name: 'Stories/',
    count: `${scale.storiesTotal} tickets`,
    note: 'each with a plan before the work and a report after',
  },
  {
    name: 'Target Architecture (HLD)/',
    count: 'vision',
    note: 'the vision: what the product should be',
  },
  {
    name: 'System Architecture (LLD)/',
    count: 'layers',
    note: "what's actually built, layer by layer",
  },
  {
    name: 'Engineering Guide/',
    count: 'guide',
    note: 'how to work here: environment, conventions, onboarding',
  },
];

type Block = {
  key: string;
  path: string;
  who: string;
  headline: string;
  count: string;
  items: Item[];
};

const blocks: Block[] = [
  {
    key: 'docs',
    path: 'docs/',
    who: 'for people and for the agent',
    headline: 'What the project decided, and why',
    count: `${scale.docFiles} files`,
    items: docs,
  },
  {
    key: 'claude',
    path: '.claude/',
    who: 'for the agent only',
    headline: 'How work is done here',
    count: `${harness.skillsRules + harness.skillsCommands + harness.agents + harness.reflections} files`,
    items: claude,
  },
];

function Card({ it }: { it: Item }) {
  return (
    <div className="folderc">
      <span className="folderc__icon">
        <Glyph name="folder" size={22} />
      </span>
      <div>
        <div className="folderc__name">
          {it.name}
          {it.count && <span className="folderc__count">{it.count}</span>}
        </div>
        <div className="folderc__note">{it.note}</div>
      </div>
    </div>
  );
}

export function ContextFolders() {
  const [activeKey, setActiveKey] = useState<string>('docs');
  const active = blocks.find((b) => b.key === activeKey) ?? blocks[0];

  return (
    <div className="ctxblocks">
      <div className="ctxblocks__row">
        {blocks.map((b) => {
          const isActive = activeKey === b.key;
          return (
            <button
              key={b.key}
              type="button"
              className={`ctxblock ${isActive ? 'ctxblock--active' : ''}`}
              onClick={() => setActiveKey(b.key)}
              aria-selected={isActive}
              role="tab"
            >
              <div className="ctxblock__top">
                <span className="ctxblock__path">
                  <Glyph name="folder" size={16} />
                  <code>{b.path}</code>
                </span>
                <span className="ctxblock__badge">{b.count}</span>
              </div>
              <div className="ctxblock__headline">{b.headline}</div>
              <div className="ctxblock__meta">{b.who}</div>
              <div className="ctxblock__action">
                {isActive ? '● Showing contents' : 'Click to inspect →'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="ctxblocks__detail">
        <div className="folders__tag">
          <code>{active.path}</code> — {active.who}
        </div>
        <div className="folders__row">
          {active.items.map((it) => (
            <Card key={it.name} it={it} />
          ))}
        </div>
      </div>
    </div>
  );
}
