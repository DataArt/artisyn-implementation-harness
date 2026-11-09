export function FindingTriageViz() {
  return (
    <div className="triage-viz">
      <div className="triage-grid">
        {/* Column 1: AI Signal */}
        <div className="triage-card triage-card--agent">
          <div className="triage-card__head">
            <span className="triage-badge triage-badge--agent">Agent Pass</span>
          </div>
          <div className="triage-card__title">Structural Anomaly Detected</div>
          <div className="triage-card__desc">
            Raw static / diff analysis flags a potential divergence or runtime risk as{' '}
            <b>Critical</b>.
          </div>
          <div className="triage-box triage-box--warn">
            ⚠️ "Potential failure mode in data flow"
          </div>
        </div>

        {/* Column 2: Missing Context & Human Evaluation */}
        <div className="triage-card triage-card--human">
          <div className="triage-card__head">
            <span className="triage-badge triage-badge--human">Human Judgment</span>
          </div>
          <div className="triage-card__title">Applies Environmental Context</div>
          <div className="triage-card__desc">
            Human checks environmental state, release sequence, and accepted trade-offs.
          </div>
          <div className="triage-evals">
            <div className="triage-eval-item triage-eval-item--ok">
              <span>✔ Context-safe / Dev environment</span>
              <b>False Alarm · Merge PR</b>
            </div>
            <div className="triage-eval-item triage-eval-item--fix">
              <span>✖ True architectural blocker</span>
              <b>Real Bug · Fix in Task</b>
            </div>
          </div>
        </div>

        {/* Column 3: The Danger of Blind Automation */}
        <div className="triage-card triage-card--danger">
          <div className="triage-card__head">
            <span className="triage-badge triage-badge--danger">Blind Automation Danger</span>
          </div>
          <div className="triage-card__title">"Fix All Criticals" Blindly</div>
          <div className="triage-card__desc">
            Handing the raw report back to the agent without human triage wastes hours fixing
            non-issues.
          </div>
          <div className="triage-box triage-box--danger">
            ⛔ 4+ hours lost re-engineering safe dev behavior
          </div>
        </div>
      </div>

      <div className="triage-footer">
        <b>Core Principle:</b> Severity is a property of the environment and business context. The
        agent detects anomalies; the human decides what is actually a problem.
      </div>
    </div>
  );
}
