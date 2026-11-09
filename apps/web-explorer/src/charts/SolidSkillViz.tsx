export function SolidSkillViz() {
  return (
    <div className="solid-viz">
      <div className="solid-grid">
        {/* Left Side: Without explicit skill scope (Model defaults to lazy/quick) */}
        <div className="solid-track solid-track--bad">
          <div className="solid-track__head">
            <span className="solid-tag solid-tag--bad">Without Explicit Skill</span>
            <div className="solid-track__title">Default: Path of Least Resistance</div>
          </div>
          <div className="solid-codebox solid-codebox--bad">
            <div className="solid-codebox__line">
              <span className="code-dim">// Monolithic Controller</span>
            </div>
            <div className="solid-codebox__line">
              <span className="code-kw">class</span> <span className="code-fn">OrderEndpoint</span>{' '}
              {'{'}
            </div>
            <div className="solid-codebox__line">
              &nbsp;&nbsp;<span className="code-kw">async</span> handle(req, res) {'{'}
            </div>
            <div className="solid-codebox__line">
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="code-dim">// Mixed: DB query + auth + transformation</span>
            </div>
            <div className="solid-codebox__line">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-kw">const</span> raw ={' '}
              <span className="code-kw">await</span> db.query(...)
            </div>
            <div className="solid-codebox__line">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-kw">return</span>{' '}
              res.json(transform(raw))
            </div>
            <div className="solid-codebox__line">&nbsp;&nbsp;{'}'}</div>
            <div className="solid-codebox__line">{'}'}</div>
          </div>
          <ul className="solid-list solid-list--bad">
            <li>Model knows SOLID, but defaults to lowest effort</li>
            <li>Tight coupling & mixed layer responsibilities</li>
            <li>High long-term maintenance & testing debt</li>
          </ul>
        </div>

        {/* Center Activation Arrow */}
        <div className="solid-mid">
          <div className="solid-mid__pill">
            <span>Skill Scope:</span>
            <code>skill: bff-architecture</code>
            <small>
              "Apply SOLID principles: decouple handlers, services, and repository adapters"
            </small>
          </div>
          <div className="solid-mid__arrow">➔</div>
        </div>

        {/* Right Side: With Skill activating model expertise */}
        <div className="solid-track solid-track--good">
          <div className="solid-track__head">
            <span className="solid-tag solid-tag--good">With Skill Scope (SOLID)</span>
            <div className="solid-track__title">Activated: Expert Architectural Level</div>
          </div>
          <div className="solid-codebox solid-codebox--good">
            <div className="solid-codebox__line">
              <span className="code-dim">// Decoupled Layered Architecture</span>
            </div>
            <div className="solid-codebox__line">
              <span className="code-kw">interface</span>{' '}
              <span className="code-type">OrderRepository</span> {'{...}'}
            </div>
            <div className="solid-codebox__line">
              <span className="code-kw">class</span> <span className="code-fn">OrderService</span>{' '}
              {'{'}
            </div>
            <div className="solid-codebox__line">
              &nbsp;&nbsp;constructor(<span className="code-kw">private</span> repo:{' '}
              <span className="code-type">OrderRepository</span>) {'{}'}
            </div>
            <div className="solid-codebox__line">
              &nbsp;&nbsp;<span className="code-kw">async</span> getOrder(id) {'{'} ... {'}'}
            </div>
            <div className="solid-codebox__line">{'}'}</div>
            <div className="solid-codebox__line">
              <span className="code-kw">class</span>{' '}
              <span className="code-fn">OrderController</span> {'{...}'}
            </div>
          </div>
          <ul className="solid-list solid-list--good">
            <li>Single Responsibility & Dependency Inversion enforced</li>
            <li>Predictable structure across all endpoints</li>
            <li>Latent knowledge explicitly unlocked by skill rules</li>
          </ul>
        </div>
      </div>

      <div className="solid-footer">
        <b>Takeaway:</b> You don't teach the model SOLID from scratch — it already knows it. The
        skill exists to <b>demand</b> high-standard architecture rather than accepting lazy
        defaults.
      </div>
    </div>
  );
}
