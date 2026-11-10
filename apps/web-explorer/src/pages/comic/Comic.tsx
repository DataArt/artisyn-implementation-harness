import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { repoUrl } from '../../env';
import './comic.css';

/**
 * "The Factory That Remembers" — adopted from a standalone comic originally
 * published as a self-contained HTML artifact (MIT License, © 2026 DataArt).
 * Kept its own paper/ink/speech-bubble visual register rather than forcing
 * it into this site's dark terminal palette — a comic reads as a comic
 * because of that look, the same reasoning that kept the ported
 * /inside-the-loop content's own design system distinct. Scoped entirely
 * under .comic-page (see comic.css) so nothing here can collide with the
 * rest of the site's tokens.
 *
 * Not linked from the header nav (developer's explicit direction) — reachable
 * only at this direct route.
 */

type SheetId = 'wheel' | 'memory' | 'roulette' | 'fix';

const SHEETS: Record<SheetId, { file: string; width: number; height: number }> = {
  wheel: { file: 'wheel.png', width: 1536, height: 1024 },
  memory: { file: 'memory.png', width: 1672, height: 941 },
  roulette: { file: 'roulette.jpg', width: 2816, height: 1536 },
  fix: { file: 'fix.png', width: 1774, height: 887 },
};

type Bubble = { speaker: 'Engineer' | 'AI'; text: string; bot?: boolean };

type Scene = {
  id: string;
  number: string;
  title: string;
  code?: string;
  variant?: Array<'tall' | 'reverse' | 'panorama' | 'noir' | 'clean' | 'finale'>;
  sheet: SheetId;
  crop: [number, number, number, number];
  alt: string;
  bubbles: Bubble[];
  narration: string;
};

const scenes: Scene[] = [
  {
    id: 'scene-1',
    number: '01',
    title: 'The wheel keeps turning',
    variant: ['panorama'],
    sheet: 'wheel',
    crop: [0, 0, 1536, 1024],
    alt: 'A software factory wheel has six AI-staffed stages. The left board, AI IS EVERYWHERE, lists Analysis, Design, Implement, QA, Deploy, and Maintain with checkmarks. The right board, BUT IS IT WORKING?, lists Faster output, Mixed quality, Rework, and Unclear productivity.',
    bubbles: [
      { speaker: 'Engineer', text: 'With a helper like this, we’ll finally get everything done!' },
      { speaker: 'AI', text: 'Speed increased. But where are we going?', bot: true },
    ],
    narration:
      'AI has joined every stage of software development. But going faster does not mean we are building the right thing.',
  },
  {
    id: 'scene-2',
    number: '02',
    title: '9 AM. Everything works',
    variant: ['tall'],
    sheet: 'memory',
    crop: [12, 120, 482, 810],
    alt: 'The engineer feeds architecture, decisions, and conventions into the robot’s context funnel. A complete glowing cube leaves the conveyor.',
    bubbles: [
      {
        speaker: 'Engineer',
        text: 'Add sign-in before checkout. Use our existing session service.',
      },
      { speaker: 'AI', text: 'I can see the architecture and constraints. On it!', bot: true },
    ],
    narration: 'When the right context is at hand, the results look good.',
  },
  {
    id: 'scene-3',
    number: '03',
    title: 'By evening, the wires are tangled',
    variant: ['tall', 'reverse'],
    sheet: 'memory',
    crop: [505, 110, 660, 817],
    alt: 'Conversations become a knot of pipes, documents fade, and a cracked cube appears on the conveyor.',
    bubbles: [
      { speaker: 'Engineer', text: 'We agreed to do this differently… Where was that?' },
      { speaker: 'AI', text: 'I found three versions. Which one is current?', bot: true },
    ],
    narration:
      'Requirements change. Decisions scatter across conversations. AI speeds up the work, along with the confusion.',
  },
  {
    id: 'scene-4',
    number: '04',
    title: 'The next morning',
    variant: ['tall'],
    sheet: 'memory',
    crop: [1180, 145, 475, 780],
    alt: 'In a new session, the engineer brings the same documents to a puzzled robot again.',
    bubbles: [
      { speaker: 'AI', text: 'Hello! Can you tell me about your project?', bot: true },
      { speaker: 'Engineer', text: 'But I explained it all yesterday!' },
    ],
    narration:
      'Without persistent context, every new conversation starts with another introduction. The human becomes the project’s only memory.',
  },
  {
    id: 'scene-5',
    number: '05',
    title: 'Plausible. Fast. Wrong.',
    variant: ['noir'],
    sheet: 'roulette',
    crop: [0, 265, 1395, 1260],
    alt: 'A dark room of slot machines shows software development turning into roulette.',
    bubbles: [
      { speaker: 'AI', text: 'I built sign-in with a third-party provider!', bot: true },
      {
        speaker: 'Engineer',
        text: 'Our architecture decision rules that out. And we already have a session service.',
      },
    ],
    narration:
      'A short prompt leaves gaps. A long one makes a person explain the whole project again. A faster AI does not solve this on its own.',
  },
  {
    id: 'scene-6',
    number: '06',
    title: 'First, agree on what to build',
    code: '/design',
    variant: ['clean'],
    sheet: 'fix',
    crop: [4, 105, 341, 395],
    alt: 'The engineer and robot discuss a system design on a whiteboard.',
    bubbles: [
      { speaker: 'Engineer', text: 'Let’s understand the task, constraints, and options first.' },
      { speaker: 'AI', text: 'And write down the approach we choose.', bot: true },
    ],
    narration: 'The intent takes shape. Now we can discuss it and check it.',
  },
  {
    id: 'scene-7',
    number: '07',
    title: 'The plan has a home',
    code: 'HLD',
    variant: ['clean', 'reverse'],
    sheet: 'fix',
    crop: [352, 106, 337, 345],
    alt: 'The engineer approves the architecture, giving the robot an agreed document to follow.',
    bubbles: [
      { speaker: 'Engineer', text: 'Approved. This is how the system should work.' },
      { speaker: 'AI', text: 'The HLD will guide my implementation.', bot: true },
    ],
    narration:
      'HLD, the High-Level Design, records the agreed architecture. A decision no longer depends on who remembers yesterday’s conversation.',
  },
  {
    id: 'scene-8',
    number: '08',
    title: 'Build from the agreed plan',
    code: '/dev',
    variant: ['clean'],
    sheet: 'fix',
    crop: [697, 109, 345, 398],
    alt: 'The robot writes code while the engineer follows the implementation.',
    bubbles: [
      {
        speaker: 'AI',
        text: 'I’m using the existing service and the team’s conventions.',
        bot: true,
      },
      { speaker: 'Engineer', text: 'Yes. Within our agreed architecture.' },
    ],
    narration:
      'Project context guides implementation, leaving less room to guess how this particular project works.',
  },
  {
    id: 'scene-9',
    number: '09',
    title: 'Record what was actually built',
    code: 'LLD',
    variant: ['clean', 'reverse'],
    sheet: 'fix',
    crop: [1049, 109, 319, 398],
    alt: 'The robot writes details of the actual implementation in an open notebook.',
    bubbles: [
      {
        speaker: 'AI',
        text: 'The code is ready. I’m recording what I built and how it works.',
        bot: true,
      },
      { speaker: 'Engineer', text: 'The next session can pick up from here.' },
    ],
    narration:
      'LLD, the Low-Level Design, describes the system as implemented. Code and documentation are created within the same workflow.',
  },
  {
    id: 'scene-10',
    number: '10',
    title: 'See the gap before the crisis',
    code: '/where-we-are',
    variant: ['clean'],
    sheet: 'fix',
    crop: [1373, 128, 396, 382],
    alt: 'A monitor compares HLD and LLD, showing matches and differences.',
    bubbles: [
      { speaker: 'Engineer', text: 'Have we built everything we planned?' },
      {
        speaker: 'AI',
        text: 'Here’s what matches. And here are the gaps we need to review.',
        bot: true,
      },
    ],
    narration:
      'Comparing intent with implementation reveals delivery debt. A visible gap can be discussed, assessed, and resolved.',
  },
  {
    id: 'scene-11',
    number: '11',
    title: 'The factory that remembers',
    variant: ['finale'],
    sheet: 'roulette',
    crop: [1418, 250, 1390, 1280],
    alt: 'People and robots work together, passing glowing cubes along conveyors connected by Harness and Context gears.',
    bubbles: [
      { speaker: 'Engineer', text: 'A new task. Ready to keep going?' },
      {
        speaker: 'AI',
        text: 'I’ll check the current HLD and LLD first. Then let’s get to work!',
        bot: true,
      },
    ],
    narration:
      'Knowledge stays with the project and helps the next person or AI session. That continuity lasts while the team keeps its documents current.',
  },
];

function SceneArt({ scene }: { scene: Scene }) {
  const sheet = SHEETS[scene.sheet];
  const [x, y, w, h] = scene.crop;
  const clipId = `clip-${scene.id}`;
  return (
    <svg className="comic-art" viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label={scene.alt}>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <image
          href={`${import.meta.env.BASE_URL}comic/${sheet.file}`}
          width={sheet.width}
          height={sheet.height}
        />
      </g>
    </svg>
  );
}

function SceneArticle({ scene }: { scene: Scene }) {
  const variantClass = (scene.variant ?? []).map((v) => `comic-scene--${v}`).join(' ');
  return (
    <article className={`comic-scene ${variantClass}`} aria-labelledby={`title-${scene.id}`}>
      <header className="comic-scene-head">
        <span className="comic-number">{scene.number}</span>
        <h3 id={`title-${scene.id}`}>{scene.title}</h3>
        {scene.code && <code>{scene.code}</code>}
      </header>
      <div className="comic-scene-body">
        <figure>
          <SceneArt scene={scene} />
        </figure>
        <div className="comic-dialogue">
          {scene.bubbles.map((b, i) => (
            <div key={i} className={'comic-bubble' + (b.bot ? ' comic-bubble--bot' : '')}>
              <span className="comic-speaker">{b.speaker}</span>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="comic-narration">{scene.narration}</p>
    </article>
  );
}

export default function Comic() {
  const byId = (id: string) => scenes.find((s) => s.id === id)!;

  return (
    <div className="app-shell">
      <Header />
      <main className="comic-page">
        <div className="comic-shell">
          <section className="comic-hero">
            <div>
              <span className="comic-issue">ENGINEERING STORIES &middot; ISSUE 01</span>
              <h1>
                The factory
                <br /> that <span>remembers</span>
              </h1>
              <p className="comic-dek">
                One engineer. One AI. And a project that had to be explained all over again, every
                morning.
              </p>
              <div className="comic-hero-bottom">
                <a
                  className="comic-read"
                  href="#comic-scenes"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('comic-scenes')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Read the comic &darr;
                </a>
                <span className="comic-meta">Based on real events</span>
              </div>
            </div>
            <div className="comic-hero-art">
              <div className="comic-publisher-logo" role="img" aria-label="DataArt">
                <img
                  src={`${import.meta.env.BASE_URL}comic/dataart-logo.png`}
                  alt=""
                  width="45"
                  height="45"
                />
                <span className="comic-publisher-wordmark" aria-hidden="true">
                  DataArt
                </span>
              </div>
              <img
                className="comic-team-badge"
                src={`${import.meta.env.BASE_URL}comic/engineer-ai-hug.png`}
                width={1254}
                height={1254}
                alt="The engineer and AI agent hug each other and both give a thumbs-up, framed by a circular cyan-accented ring."
              />
            </div>
          </section>

          <section className="comic-act-start" id="comic-scenes">
            <span className="comic-act-label">Act I &middot; The promise of speed</span>
            <h2>Faster, faster</h2>
          </section>

          <div className="comic-scenes">
            <SceneArticle scene={byId('scene-1')} />
            <SceneArticle scene={byId('scene-2')} />
            <SceneArticle scene={byId('scene-3')} />
            <SceneArticle scene={byId('scene-4')} />

            <section className="comic-interlude">
              <span className="comic-act-label">Act II &middot; The diagnosis</span>
              <h2>
                We made forgetting
                <br /> happen faster.
              </h2>
              <p>
                The context stayed in chats, conversations, and people&rsquo;s heads.
                <br /> It never reached the assembly line.
              </p>
              <span className="comic-wire" aria-hidden="true">
                &darr;
              </span>
            </section>

            <SceneArticle scene={byId('scene-5')} />

            <section className="comic-interlude comic-solution">
              <span className="comic-act-label">Act III &middot; Artisyn Harness</span>
              <h2>
                What if the memory
                <br /> lived <em>in the project?</em>
              </h2>
              <p>
                The harness connects development stages through current documents: what we decided,
                how we should build it, and what we actually built.
              </p>
              <div className="comic-big-wire" aria-hidden="true">
                &darr;
              </div>
            </section>

            <SceneArticle scene={byId('scene-6')} />
            <SceneArticle scene={byId('scene-7')} />
            <SceneArticle scene={byId('scene-8')} />
            <SceneArticle scene={byId('scene-9')} />
            <SceneArticle scene={byId('scene-10')} />
            <SceneArticle scene={byId('scene-11')} />

            <section className="comic-closing">
              <h2>
                Speed helps
                <br /> when it has direction.
              </h2>
              <div className="comic-chain" aria-label="The Harness workflow">
                <code>/design</code>
                <span>&rarr; HLD &rarr;</span>
                <code>/dev</code>
                <span>&rarr; LLD &rarr;</span>
                <code>/where-we-are</code>
              </div>
              <span className="comic-end">The story ends. The work continues.</span>
            </section>
          </div>

          <section className="comic-about">
            <strong>BIG IDEAS, LITTLE PICTURES</strong>
            <p>
              A picture-book guide for the very youngest: how we build projects in an AI Software
              Factory using Artisyn Harness.
            </p>
            <p>
              From the first idea to working software, our engineer and AI helper show how shared
              plans, project knowledge, and up-to-date documentation keep everyone moving in the
              same direction.
            </p>
            <p>
              <strong>This story is based on real events.</strong>
            </p>
            <p>
              Explore{' '}
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                Artisyn Harness on GitHub &#8599;
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
