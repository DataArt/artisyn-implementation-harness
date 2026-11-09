/**
 * Simplified, one-line-per-phase summary of the harness's actual lifecycles,
 * sourced from docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md and
 * 02 Design Lifecycle.md. Phase names, order, and artifacts match those docs;
 * descriptions are condensed for a landing-page demo, not the full invariant
 * text. Keep this in sync if either lifecycle's stage list changes.
 */
export type LifecycleMode = 'design' | 'dev';
export type DemoStep = { title: string; description: string; activity: string; artifact: string };

export const demoSteps: Record<LifecycleMode, DemoStep[]> = {
  design: [
    {
      title: 'Context Gathering',
      description: 'Resolve the ticket, fetch tracker context, and resolve the design track.',
      activity: 'Reading sources into the Evidence table…',
      artifact: 'Report.md',
    },
    {
      title: 'Ceremony',
      description: 'Tracker transition and feature branch checkout.',
      activity: 'Confirming branch and tracker state…',
      artifact: 'Feature branch',
    },
    {
      title: 'Frame',
      description: 'Write the problem, success criteria, and boundaries.',
      activity: 'Drafting 00 Frame.md…',
      artifact: '00 Frame.md',
    },
    {
      title: 'Research',
      description:
        'The architect returns 3–5 options against the architecture — no recommendation yet.',
      activity: 'Gathering and comparing options…',
      artifact: '01 Research.md',
    },
    {
      title: 'Evaluate',
      description: 'Score options against requirements, recommend one, run a WAF check.',
      activity: 'Building the requirements × options matrix…',
      artifact: '02 Evaluate.md',
    },
    {
      title: 'Solution',
      description: 'Draft the architecture, design, stack, and effort estimate.',
      activity: 'Drafting solution artifacts…',
      artifact: 'solution/ folder',
    },
    {
      title: 'Review',
      description: 'Open a draft MR and wait for out-of-band human approval.',
      activity: 'Requesting review…',
      artifact: 'Draft MR',
    },
    {
      title: 'Address Feedback',
      description: 'Reiterate into an earlier phase on concerns, then re-approve or decline.',
      activity: 'Resolving reviewer feedback…',
      artifact: 'Re-approved design',
    },
    {
      title: 'Publish',
      description: 'Update the permanent architecture docs with the approved decisions.',
      activity: 'Writing doc updates…',
      artifact: 'Updated HLD/LLD docs',
    },
    {
      title: 'Completion',
      description: 'Archive the design, sync the tracker, hand off implementation tickets.',
      activity: 'Archiving and finalizing…',
      artifact: 'Approved, archived design',
    },
  ],
  dev: [
    {
      title: 'Context',
      description: 'Capture the request, approved design, and tracker evidence.',
      activity: 'Writing 0-intent.md…',
      artifact: '0-intent.md',
    },
    {
      title: 'Ceremony',
      description: 'Check out the feature branch; authorized tracker transition.',
      activity: 'Confirming branch and tracker state…',
      artifact: 'Feature branch',
    },
    {
      title: 'Plan',
      description: 'Derive the solution, acceptance criteria, and numbered steps from the intent.',
      activity: 'Drafting 1-plan.md…',
      artifact: '1-plan.md',
    },
    {
      title: 'Implement',
      description: 'Execute one step at a time, each with observed verification.',
      activity: 'Running step checks…',
      artifact: 'Code + report notes',
    },
    {
      title: 'Test',
      description: 'Build, review, and prove every acceptance criterion with evidence.',
      activity: 'Running checks and review…',
      artifact: 'AC evidence',
    },
    {
      title: 'Document',
      description:
        'Audit deviations against the architecture, update affected docs, close ledgers.',
      activity: 'Writing the doc impact list…',
      artifact: 'Updated documentation',
    },
    {
      title: 'Completion',
      description: 'Archive the story, sync the tracker, hand over commit and PR text.',
      activity: 'Archiving and finalizing…',
      artifact: 'Merged, documented change',
    },
  ],
};
