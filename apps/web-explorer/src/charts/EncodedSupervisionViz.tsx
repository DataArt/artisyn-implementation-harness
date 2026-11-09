export function EncodedSupervisionViz() {
  return (
    <div className="encoded-viz">
      <div className="encoded-grid">
        {/* Stage 1: Pioneering New Ground */}
        <div className="encoded-card encoded-card--new">
          <div className="encoded-card__head">
            <span className="encoded-step">01</span>
            <span className="encoded-tag encoded-tag--new">Novel / Unencoded Ground</span>
          </div>
          <div className="encoded-card__title">Hands-on Guidance & Validation</div>
          <div className="encoded-meter">
            <span className="encoded-meter__label">Human Supervision Required:</span>
            <span className="encoded-meter__bar encoded-meter__bar--high">80% Hands-On</span>
          </div>
          <ul className="encoded-list">
            <li>Pioneering a new module or unfamiliar cloud tech (e.g. serverless functions)</li>
            <li>Developer actively guides the first working prototype line by line</li>
            <li>Failure modes and architectural traps are discovered live</li>
          </ul>
        </div>

        {/* Transition Bridge: Capturing into Skill */}
        <div className="encoded-bridge">
          <div className="encoded-bridge__box">
            <span className="encoded-bridge__icon">⚡</span>
            <span className="encoded-bridge__text">
              Capture lessons into <code>skill.md</code>
            </span>
            <span className="encoded-bridge__sub">Rules, conventions & verified structure</span>
          </div>
          <div className="encoded-bridge__arrow">➔</div>
        </div>

        {/* Stage 2: Repetition on Encoded Ground */}
        <div className="encoded-card encoded-card--encoded">
          <div className="encoded-card__head">
            <span className="encoded-step">02</span>
            <span className="encoded-tag encoded-tag--encoded">Encoded / Familiar Ground</span>
          </div>
          <div className="encoded-card__title">High Automated Leverage</div>
          <div className="encoded-meter">
            <span className="encoded-meter__label">Human Supervision Required:</span>
            <span className="encoded-meter__bar encoded-meter__bar--low">10% Spot Checks</span>
          </div>
          <ul className="encoded-list">
            <li>All subsequent tickets follow the captured skill automatically</li>
            <li>High execution predictability (88%+ planned steps)</li>
            <li>Developer verifies high-level intent rather than syntax</li>
          </ul>
        </div>
      </div>

      <div className="encoded-footer">
        <b>Rule:</b> The boundary for manual oversight isn't "hard vs easy" — it is{' '}
        <b>unencoded vs encoded</b>. Once an engineer teaches the model the pattern once, it scales
        across the entire team.
      </div>
    </div>
  );
}
