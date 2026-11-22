'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { HARNESS_LABEL, TOPOLOGIES, type Repo, type Topology } from './data';

/** Inline `code` in data strings, rendered as <code>. */
function Text({ value }: { value: string }) {
  return (
    <>
      {value.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith('`') ? (
          <code key={i} className="mono">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}

function RepoBox({ repo }: { repo: Repo }) {
  return (
    <div className={repo.dashed ? 'ct-repo is-dashed' : 'ct-repo'}>
      <div className="ct-repo-head">
        <span className="ct-repo-name">{repo.name}</span>
        {repo.harness && (
          <span className={`ct-badge ct-badge-${repo.harness}`}>{HARNESS_LABEL[repo.harness]}</span>
        )}
      </div>
      {(repo.productFolder || repo.manifest) && (
        <div className="ct-files">
          {repo.productFolder && <span className="ct-file">{repo.productFolder}</span>}
          {repo.manifest && <span className="ct-file">{repo.manifest}</span>}
        </div>
      )}
      {repo.apps && (
        <ul className="ct-apps">
          {repo.apps.map((app) => (
            <li key={app.name}>
              <span>{app.name}</span>
              <small>{app.tech}</small>
            </li>
          ))}
        </ul>
      )}
      {repo.clusters && (
        <ul className="ct-clusters">
          {repo.clusters.map((c) => (
            <li key={c.tag}>
              <span className="ct-tag">tag: {c.tag}</span>
              <span className="ct-cluster-repos">{c.repos.join(' · ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A plain-text reading of the diagram, for screen readers. */
function describe(t: Topology): string {
  const repo = (r: Repo) =>
    [
      `${r.name}${r.harness ? ` with a ${HARNESS_LABEL[r.harness].toLowerCase()}` : ''}`,
      r.productFolder ? `product context in ${r.productFolder}` : '',
      r.manifest ? `repositories listed in ${r.manifest}` : '',
      r.apps ? `apps: ${r.apps.map((a) => `${a.name} (${a.tech})`).join(', ')}` : '',
      r.clusters
        ? `clusters: ${r.clusters.map((c) => `${c.tag} (${c.repos.join(', ')})`).join('; ')}`
        : '',
    ]
      .filter(Boolean)
      .join(', ');
  return [
    t.above ? `On top: ${repo(t.above)}.` : '',
    ...t.repos.map((r) => `${repo(r)}.`),
    t.footnote,
  ].join(' ');
}

/** The four topologies as tabs; each panel draws the setup and says how to launch it. */
export default function TopologyExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = TOPOLOGIES[active];

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + TOPOLOGIES.length) % TOPOLOGIES.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="ct-explorer">
      <div className="ct-tabs" role="tablist" aria-label="Context topologies">
        {TOPOLOGIES.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`ct-tab-${item.id}`}
            aria-selected={i === active}
            aria-controls={`ct-panel-${item.id}`}
            tabIndex={i === active ? 0 : -1}
            className={i === active ? 'ct-tab is-active' : 'ct-tab'}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
          >
            <span className="ct-tab-short">{item.short}</span>
            <span className="ct-tab-name">{item.name}</span>
            {item.recommended && <span className="ct-recommended">Best case</span>}
          </button>
        ))}
      </div>

      <div
        className="ct-panel"
        role="tabpanel"
        id={`ct-panel-${t.id}`}
        aria-labelledby={`ct-tab-${t.id}`}
      >
        <p className="ct-summary">{t.summary}</p>
        <div className="ct-diagram">
          <div className="ct-diagram-art" aria-hidden="true">
            {t.above && (
              <>
                <RepoBox repo={t.above} />
                <div className="ct-link">designs and governs</div>
              </>
            )}
            <div className="ct-repos">
              {t.repos.map((r) => (
                <RepoBox key={r.name} repo={r} />
              ))}
            </div>
            <p className="ct-footnote">{t.footnote}</p>
          </div>
          <p className="ct-sr-only">{describe(t)}</p>
        </div>
        <div className="ct-columns">
          <div>
            <h3>Fits when</h3>
            <ul>
              {t.fits.map((line) => (
                <li key={line}>
                  <Text value={line} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>How to launch</h3>
            <ol>
              {t.launch.map((line) => (
                <li key={line}>
                  <Text value={line} />
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3>Watch for</h3>
            <ul>
              {t.watch.map((line) => (
                <li key={line}>
                  <Text value={line} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        {t.example && (
          <figure className="ct-figure">
            <figcaption>{t.example.caption}</figcaption>
            <pre className="mono ct-code">{t.example.code}</pre>
            <a href={t.example.link.href} className="icon-link ct-more">
              {t.example.link.label} <ArrowUpRight size={14} />
            </a>
          </figure>
        )}
      </div>
    </div>
  );
}
