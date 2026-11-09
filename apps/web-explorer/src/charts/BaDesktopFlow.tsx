import { useState } from 'react';
import { Glyph } from '../components/glyphs';

export function BaDesktopFlow() {
  const [activeStep, setActiveStep] = useState<'context' | 'skills' | 'ticket'>('skills');

  return (
    <div className="baflow">
      {/* Desktop Window Container */}
      <div className="baflow__window">
        <div className="baflow__header">
          <div className="baflow__dots">
            <span className="baflow__dot baflow__dot--red" />
            <span className="baflow__dot baflow__dot--yellow" />
            <span className="baflow__dot baflow__dot--green" />
          </div>
          <div className="baflow__title">
            <span className="baflow__title-app">Claude Desktop</span>
            <span className="baflow__title-sep">·</span>
            <span className="baflow__title-project">Project: Product Requirements & Discovery</span>
          </div>
          <div className="baflow__badge">BA Workspace</div>
        </div>

        <div className="baflow__body">
          {/* Column 1: Context & Discovery Input */}
          <div
            className={`baflow__col ${activeStep === 'context' ? 'baflow__col--active' : ''}`}
            onClick={() => setActiveStep('context')}
          >
            <div className="baflow__col-header">
              <div className="baflow__step-num">1</div>
              <div>
                <div className="baflow__col-title">Project Knowledge</div>
                <div className="baflow__col-sub">Discovery context</div>
              </div>
            </div>

            <div className="baflow__cards">
              <div className="baflow__card">
                <div className="baflow__card-icon">
                  <Glyph name="docs" size={16} />
                </div>
                <div>
                  <div className="baflow__card-name">HLD & Data Models</div>
                  <div className="baflow__card-note">Schema contracts & entity boundaries</div>
                </div>
              </div>

              <div className="baflow__card">
                <div className="baflow__card-icon">
                  <Glyph name="prototype" size={16} />
                </div>
                <div>
                  <div className="baflow__card-name">Interactive Prototype</div>
                  <div className="baflow__card-note">UX flows & confirmed client feedback</div>
                </div>
              </div>

              <div className="baflow__card">
                <div className="baflow__card-icon">
                  <Glyph name="globe" size={16} />
                </div>
                <div>
                  <div className="baflow__card-name">Domain Glossary</div>
                  <div className="baflow__card-note">Scouting metrics, player rankings, roles</div>
                </div>
              </div>
            </div>
          </div>

          <div className="baflow__arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="#94a3b8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Column 2: Custom BA Skills */}
          <div
            className={`baflow__col ${activeStep === 'skills' ? 'baflow__col--active' : ''}`}
            onClick={() => setActiveStep('skills')}
          >
            <div className="baflow__col-header">
              <div className="baflow__step-num baflow__step-num--accent">2</div>
              <div>
                <div className="baflow__col-title">Claude Desktop Skills</div>
                <div className="baflow__col-sub">Standardized flow</div>
              </div>
            </div>

            <div className="baflow__cards">
              <div className="baflow__skill-card">
                <div className="baflow__skill-top">
                  <span className="baflow__skill-cmd">skill: flow-decompose</span>
                  <span className="baflow__skill-tag">Epic → Stories</span>
                </div>
                <p className="baflow__skill-desc">
                  Takes high-level feature vision and breaks it into atomic user journeys without
                  gaps.
                </p>
              </div>

              <div className="baflow__skill-card">
                <div className="baflow__skill-top">
                  <span className="baflow__skill-cmd">skill: context-enricher</span>
                  <span className="baflow__skill-tag">Acceptance Criteria</span>
                </div>
                <p className="baflow__skill-desc">
                  Injects schemas, error states, and Given-When-Then criteria directly into the
                  ticket.
                </p>
              </div>
            </div>
          </div>

          <div className="baflow__arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="#94a3b8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Column 3: Generated Ticket / Dev Handover */}
          <div
            className={`baflow__col ${activeStep === 'ticket' ? 'baflow__col--active' : ''}`}
            onClick={() => setActiveStep('ticket')}
          >
            <div className="baflow__col-header">
              <div className="baflow__step-num">3</div>
              <div>
                <div className="baflow__col-title">Generated Story</div>
                <div className="baflow__col-sub">Direct input to Claude Code</div>
              </div>
            </div>

            <div className="baflow__ticket">
              <div className="baflow__ticket-head">
                <span className="baflow__ticket-id">US-042</span>
                <span className="baflow__ticket-title">Player Comparison Matrix</span>
              </div>
              <div className="baflow__ticket-content">
                <div className="baflow__code-line">
                  <span className="baflow__code-kw"># Context:</span>{' '}
                  /docs/architecture/lld.md#scouting
                </div>
                <div className="baflow__code-line">
                  <span className="baflow__code-kw"># Given:</span> scout selects 2+ radar profiles
                </div>
                <div className="baflow__code-line">
                  <span className="baflow__code-kw"># When:</span> metric weights are recalculated
                </div>
                <div className="baflow__code-line">
                  <span className="baflow__code-kw"># Then:</span> percentile ranking reflects
                  filter
                </div>
              </div>
              <div className="baflow__ticket-footer">
                <span className="baflow__next-cmd">
                  → Handed to Dev: <code>/dev-plan US-042</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
