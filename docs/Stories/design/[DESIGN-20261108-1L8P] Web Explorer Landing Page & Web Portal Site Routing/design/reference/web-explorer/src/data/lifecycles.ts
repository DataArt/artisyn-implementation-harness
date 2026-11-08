/** Illustrative storyboard, not a machine-readable contract of the harness runtime. */
export type LifecycleMode = 'design' | 'dev';
export type DemoStep = { title: string; description: string; activity: string; artifact: string };

export const demoSteps: Record<LifecycleMode, DemoStep[]> = {
  design: [
    {
      title: 'Understand the task',
      description: 'Read the ticket and identify the problem to solve.',
      activity: 'Reading ticket context…',
      artifact: 'Design intent',
    },
    {
      title: 'Load project context',
      description: 'Consult conventions, existing architecture, and project documentation.',
      activity: 'Reading docs/Harness/ and conventions…',
      artifact: 'Constraints and context',
    },
    {
      title: 'Check architecture',
      description: 'Evaluate the proposed approach against the target architecture.',
      activity: 'Comparing design choices with architecture…',
      artifact: 'Architectural assessment',
    },
    {
      title: 'Review the plan',
      description: 'Present a design output for feedback at the relevant review gate.',
      activity: 'Presenting proposed solution…',
      artifact: 'Reviewed design',
    },
    {
      title: 'Capture learning',
      description: 'Where applicable, carry reusable insight forward into documented conventions.',
      activity: 'Recording relevant reflection…',
      artifact: 'Reusable knowledge',
    },
  ],
  dev: [
    {
      title: 'Understand the change',
      description: 'Start from an approved task and the implementation intent.',
      activity: 'Reading ticket and plan…',
      artifact: 'Implementation scope',
    },
    {
      title: 'Load conventions',
      description: 'Read established project rules, patterns, and relevant context.',
      activity: 'Resolving engineering conventions…',
      artifact: 'Execution context',
    },
    {
      title: 'Implement',
      description: 'Make a scoped change while keeping architectural constraints in view.',
      activity: 'Applying implementation steps…',
      artifact: 'Code and documentation',
    },
    {
      title: 'Validate and review',
      description: 'Run appropriate checks and surface work for review where needed.',
      activity: 'Checking changes and preparing review…',
      artifact: 'Validated change',
    },
    {
      title: 'Learn and improve',
      description: 'Capture corrections and lessons for later work when relevant.',
      activity: 'Updating reusable conventions…',
      artifact: 'Reflection',
    },
  ],
};
