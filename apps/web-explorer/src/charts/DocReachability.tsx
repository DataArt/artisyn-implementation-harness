import { siConfluence, siGit, siClaude } from 'simple-icons';

export function DocReachability() {
  return (
    <div className="reach-viz">
      {/* Track 1: Repository Documentation (Direct, In-Sync) */}
      <div className="reach-track reach-track--good">
        <div className="reach-side">
          <div className="reach-icon-box reach-icon-box--git">
            <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
              <path d={siGit.path} />
            </svg>
          </div>
          <div>
            <div className="reach-source-title">
              <code>docs/</code> & <code>.claude/</code>
            </div>
            <div className="reach-source-sub">Repository file system</div>
          </div>
        </div>

        <div className="reach-bridge reach-bridge--good">
          <div className="reach-bridge__line">
            <span className="reach-bridge__label reach-bridge__label--good">
              Direct Agent Read · Fast & Deterministic
            </span>
          </div>
          <div className="reach-bridge__tags">
            <span className="reach-badge reach-badge--good">✔ Exact grep & tree</span>
            <span className="reach-badge reach-badge--good">✔ Versioned with PR</span>
            <span className="reach-badge reach-badge--good">✔ 100% reachability</span>
          </div>
        </div>

        <div className="reach-target reach-target--good">
          <div className="reach-icon-box reach-icon-box--claude">
            <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
              <path d={siClaude.path} />
            </svg>
          </div>
          <div>
            <div className="reach-target-title">Full Context Fidelity</div>
            <div className="reach-target-sub">Never skips rules; drift visible in code</div>
          </div>
        </div>
      </div>

      {/* Track 2: Confluence via MCP (Fragile, Skips Content) */}
      <div className="reach-track reach-track--bad">
        <div className="reach-side">
          <div className="reach-icon-box reach-icon-box--confluence">
            <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
              <path d={siConfluence.path} />
            </svg>
          </div>
          <div>
            <div className="reach-source-title">Confluence Wiki</div>
            <div className="reach-source-sub">External enterprise wiki</div>
          </div>
        </div>

        <div className="reach-bridge reach-bridge--bad">
          <div className="reach-bridge__line reach-bridge__line--dashed">
            <span className="reach-bridge__label reach-bridge__label--bad">
              MCP Tool Bridge · API round-trips
            </span>
          </div>
          <div className="reach-bridge__tags">
            <span className="reach-badge reach-badge--bad">✖ Skips nested sections</span>
            <span className="reach-badge reach-badge--bad">✖ Search & chunk limits</span>
            <span className="reach-badge reach-badge--bad">✖ Drift silent until runtime</span>
          </div>
        </div>

        <div className="reach-target reach-target--bad">
          <div className="reach-icon-box reach-icon-box--claude-dim">
            <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
              <path d={siClaude.path} />
            </svg>
          </div>
          <div>
            <div className="reach-target-title">Partial / Degraded Context</div>
            <div className="reach-target-sub">Omissions discovered only from bad output</div>
          </div>
        </div>
      </div>
    </div>
  );
}
