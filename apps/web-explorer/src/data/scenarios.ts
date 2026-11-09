/**
 * Terminal-transcript scenarios for the "see it in action" section. Phase
 * names and order are sourced from the real skills: harness-bootstrap's
 * Context → Q&A → Generation → Cleanup lifecycle, and the design/dev phase
 * lists in docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md and
 * 02 Design Lifecycle.md.
 *
 * Human-in-the-loop points match the real skills' own rule: "Two stops per
 * phase, both at its end" (`.claude/skills/{design,dev}/SKILL.md`) — a
 * sign-off, then a commit the developer runs. Nearly every phase below
 * carries a short wait/input pair for that reason, not just the one or two
 * "big" stops (Review Gate's external approval, Test's full AC sign-off).
 * Address Feedback is the one phase that's a genuine pass-through here —
 * it only runs at all when the reviewer raised concerns, and this run had
 * none.
 *
 * The design/dev example is this project's own real migration — rehosting
 * this very site from AWS to GitHub Pages — not an invented storyboard:
 * DESIGN-20261103-LBBI ("Migrate Static Site Hosting to GitHub Pages") and
 * DEV-20261108-K7XQ ("GitHub Pages Hosting"). `storyUrl` links to the real
 * story folder on GitHub, not the docs site — `docs/Stories/**` is
 * deliberately excluded from the VitePress build (the working/transient
 * tier is never published, see apps/web-docs/.vitepress/config.ts's
 * `srcExclude`), so a docs-site link would 404.
 *
 * Keep in sync if a lifecycle's stage list changes.
 */

export type ScenarioLine =
  | { kind: 'activity'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'wait'; text: string }
  | { kind: 'input'; text: string };

export type ScenarioStage = {
  title: string;
  explanation: string;
  lines: ScenarioLine[];
};

export type ScenarioId = 'bootstrap' | 'design' | 'dev';

export type Scenario = {
  id: ScenarioId;
  label: string;
  command: string;
  storyUrl?: string;
  storyLabel?: string;
  stages: ScenarioStage[];
};

export const scenarios: Record<ScenarioId, Scenario> = {
  bootstrap: {
    id: 'bootstrap',
    label: 'bootstrap',
    command: '/harness-bootstrap launch',
    stages: [
      {
        title: 'Context',
        explanation:
          'Scans the target repo — stack, containers, existing conventions — before generating anything.',
        lines: [
          { kind: 'activity', text: 'scanning repo structure, detecting stack…' },
          { kind: 'output', text: '✓ 3 containers detected: Web, API, Infra' },
        ],
      },
      {
        title: 'Q&A',
        explanation:
          'A short batch of project-specific questions — tracker, package manager, CI gates — personalizes the install.',
        lines: [
          { kind: 'wait', text: 'a few questions to personalize the harness…' },
          { kind: 'input', text: 'you: Jira project ND, yarn, no CI gate yet' },
        ],
      },
      {
        title: 'Generation',
        explanation:
          'Writes skills, agents, and HLD/LLD doc scaffolding personalized to the answers above.',
        lines: [
          { kind: 'activity', text: 'writing .claude/skills, .claude/agents, docs/ scaffolding…' },
          { kind: 'output', text: '✓ 14 skills, 9 agents, HLD/LLD scaffolds generated' },
        ],
      },
      {
        title: 'Cleanup',
        explanation:
          'Removes template placeholders and verifies nothing sensitive was committed before handing control back.',
        lines: [
          { kind: 'activity', text: 'removing template placeholders, checking for secrets…' },
          { kind: 'wait', text: 'harness installed. Good to start using /design or /dev?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
    ],
  },
  design: {
    id: 'design',
    label: 'design',
    command: '/design DESIGN-20261103-LBBI rehost the site from AWS to GitHub Pages',
    storyUrl:
      'https://github.com/DataArt/artisyn-implementation-harness/tree/main/docs/Stories/design/approved/%5BDESIGN-20261103-LBBI%5D%20Migrate%20Static%20Site%20Hosting%20to%20GitHub%20Pages',
    storyLabel: 'Read the real design story',
    stages: [
      {
        title: 'Context Gathering',
        explanation:
          'Resolves the ticket, pulls tracker context, and resolves which design track this belongs to.',
        lines: [
          { kind: 'activity', text: 'reading the HLD, LLD, and current AWS deploy state…' },
          {
            kind: 'output',
            text: '✓ Report.md created — local ID, no tracker ticket for this one',
          },
          { kind: 'wait', text: 'intent captured. Good to move to Ceremony?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Ceremony',
        explanation:
          'Checks out the design branch (no tracker transition here — this one ran on a local ID).',
        lines: [
          {
            kind: 'activity',
            text: 'checking out design/20261103-lbbi-migrate-static-site-hosting…',
          },
          { kind: 'output', text: '✓ branch ready' },
          { kind: 'wait', text: 'branch confirmed. Good to move to Frame?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Frame',
        explanation:
          'Writes the problem statement, success criteria, and boundaries before any solution work starts.',
        lines: [
          {
            kind: 'activity',
            text: 'framing: AWS hosting cost and ops overhead for a static site…',
          },
          { kind: 'output', text: '✓ 00 Frame.md' },
          { kind: 'wait', text: 'problem framed. Good to move to Research?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Research',
        explanation:
          'The architect returns several real options against the architecture — no recommendation yet.',
        lines: [
          {
            kind: 'activity',
            text: 'comparing 5 options: keep AWS, GH Pages (project/custom domain), Cloudflare Pages, Netlify…',
          },
          { kind: 'output', text: '✓ 01 Research.md — 10 open questions flagged' },
          {
            kind: 'wait',
            text: '5 options compared, no recommendation yet. Good to move to Evaluate?',
          },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Evaluate',
        explanation:
          'Scores the 3 viable options against the requirements and runs a Well-Architected check before recommending one.',
        lines: [
          { kind: 'activity', text: 'scoring A/B/C × requirements, running WAF check…' },
          {
            kind: 'output',
            text: '✓ 02 Evaluate.md — Option B, GitHub Pages project site, recommended',
          },
          { kind: 'wait', text: 'Option B recommended, WAF clean. Good to move to Solution?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Solution',
        explanation:
          'Drafts the actual architecture: what gets removed, what gets added, and the effort estimate.',
        lines: [
          {
            kind: 'activity',
            text: 'drafting solution: drop AWS SSM/CloudFront, add a Pages deploy workflow…',
          },
          { kind: 'output', text: '✓ solution/ written' },
          { kind: 'wait', text: 'solution drafted. Good to open the review gate?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Review Gate',
        explanation:
          'Opens a draft MR and stops — a human looks at this before anything moves forward. The one stop that waits on a real external fact, not a same-session ask.',
        lines: [
          { kind: 'wait', text: 'draft MR opened, waiting on reviewer…' },
          { kind: 'input', text: 'you: approved, ship it' },
        ],
      },
      {
        title: 'Address Feedback',
        explanation:
          'Only runs if the reviewer raised concerns — here there were none, so it is a clean pass-through, no extra sign-off needed.',
        lines: [{ kind: 'output', text: '✓ approved with no concerns — skipped' }],
      },
      {
        title: 'Publish',
        explanation: 'Updates the permanent HLD/LLD docs with the now-approved decision.',
        lines: [
          { kind: 'activity', text: 'rewriting the deployment section of the HLD and LLD…' },
          { kind: 'output', text: '✓ docs updated' },
          { kind: 'wait', text: 'docs current. Good to move to Completion?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Completion',
        explanation:
          'Archives the design and hands off the implementation ticket — DEV-20261108-K7XQ. One combined ask for anything external before it closes.',
        lines: [
          { kind: 'activity', text: 'archiving design…' },
          { kind: 'wait', text: 'design archived. Move the tracker, open the dev ticket?' },
          { kind: 'input', text: 'you: all — go' },
          { kind: 'output', text: '✓ DEV-20261108-K7XQ opened for implementation' },
        ],
      },
    ],
  },
  dev: {
    id: 'dev',
    label: 'dev',
    command: '/dev DEV-20261108-K7XQ',
    storyUrl:
      'https://github.com/DataArt/artisyn-implementation-harness/tree/main/docs/Stories/archive/%5BDEV-20261108-K7XQ%5D%20GitHub%20Pages%20Hosting',
    storyLabel: 'Read the real dev story',
    stages: [
      {
        title: 'Context',
        explanation:
          'Captures the approved design and the tracker’s own evidence before any code changes.',
        lines: [
          { kind: 'activity', text: 'reading the approved design, writing intent…' },
          { kind: 'output', text: '✓ 0-intent.md' },
          { kind: 'wait', text: 'intent captured. Good to move to Ceremony?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Ceremony',
        explanation: 'Checks out the implementation branch (same local-ID ceremony as design).',
        lines: [
          { kind: 'activity', text: 'checking out dev/20261108-k7xq-github-pages-hosting…' },
          { kind: 'output', text: '✓ branch ready' },
          { kind: 'wait', text: 'branch confirmed. Good to move to Plan?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Plan',
        explanation:
          'Breaks the approved design into a numbered list of steps with acceptance criteria.',
        lines: [
          {
            kind: 'activity',
            text: 'deriving steps: VitePress base path, CSP meta tag, CD workflow…',
          },
          { kind: 'output', text: '✓ 1-plan.md — 4 steps' },
          { kind: 'wait', text: '4 steps proposed. Good to move to Implement?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Implement',
        explanation:
          'Executes one step at a time, each with its own observed verification — intelligent checkpoints the agent clears itself, escalating only on real doubt. Every step updates 2-report.md and stat.json, the living record of what ran and how long it took.',
        lines: [
          { kind: 'activity', text: 'step 4/4: rewriting .github/workflows/cd.yml…' },
          { kind: 'output', text: '✓ build, lint, YAML validate pass' },
          { kind: 'output', text: '✓ 2-report.md + stat.json updated' },
          { kind: 'wait', text: 'all 4 steps verified. Good to move to Test?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Test',
        explanation:
          'Builds, reviews, and proves every acceptance criterion — then stops for a full sign-off, not a quick checkpoint.',
        lines: [
          { kind: 'wait', text: 'checks, review, and ACs done. Good to move to Document?' },
          { kind: 'input', text: 'you: all good' },
        ],
      },
      {
        title: 'Document',
        explanation:
          'Checks the change against the architecture and updates every doc it actually affects.',
        lines: [
          {
            kind: 'activity',
            text: 'rewriting the LLD deploy section — the no-op stub is now a real GitHub Pages workflow…',
          },
          { kind: 'output', text: '✓ LLD updated' },
          { kind: 'wait', text: 'docs current, findings closed. Good to move to Completion?' },
          { kind: 'input', text: 'you: go' },
        ],
      },
      {
        title: 'Completion',
        explanation:
          'Archives the story, hands over the commit and PR text, and closes the loop. One combined ask for anything external before it closes.',
        lines: [
          { kind: 'activity', text: 'archiving, preparing PR…' },
          { kind: 'wait', text: 'story archived. Move the tracker, open tech-debt tickets?' },
          { kind: 'input', text: 'you: none — archive' },
          { kind: 'output', text: '✓ archived, PR text handed over' },
        ],
      },
    ],
  },
};
