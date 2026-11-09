import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Slide numbering comes from the deck order, not from each slide's own literal —
 * otherwise every reordering silently desynchronises the kickers.
 */
const SlideNumberContext = createContext<string | undefined>(undefined);
export const SlideNumberProvider = SlideNumberContext.Provider;

export function Slide({
  /** Normally omitted — the number comes from the deck order via SlideNumberProvider. */
  kicker,
  title,
  lead,
  children,
}: {
  kicker?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  const auto = useContext(SlideNumberContext);
  const num = kicker ?? auto;
  return (
    <div className="slide">
      <div className="slide__main">
        {num && <div className="slide__kicker">{num}</div>}
        <h1 className="slide__title">{title}</h1>
        {lead && <p className="slide__lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
  collapsible,
  defaultOpen = false,
}: {
  title?: string;
  children: ReactNode;
  /** if set, the section starts folded and title becomes a toggle */
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!collapsible) {
    return (
      <div className="slide__section">
        {title && <h2 className="slide__section-title">{title}</h2>}
        {children}
      </div>
    );
  }
  return (
    <div className="slide__section">
      {title && (
        <button
          className="slide__section-title slide__section-title--toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {title}
          <span className="slide__section-chev">{open ? '−' : '+'}</span>
        </button>
      )}
      {open && children}
    </div>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="bullets">
      {items.map((item, i) => (
        <li className="bullets__item" key={i}>
          <span className="bullets__dot" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type TileData = {
  value: string;
  unit?: string;
  label: string;
  note?: string;
};

export function Tiles({ items }: { items: TileData[] }) {
  return (
    <div className="tiles">
      {items.map((t) => (
        <div className="tile" key={t.label}>
          <div className="tile__value">
            {t.value}
            {t.unit && <span className="tile__unit">{t.unit}</span>}
          </div>
          <div className="tile__label">{t.label}</div>
          {t.note && <div className="tile__note">{t.note}</div>}
        </div>
      ))}
    </div>
  );
}

export function Callout({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warn' | 'bad' | 'good';
  children: ReactNode;
}) {
  const cls = tone === 'info' ? 'callout' : `callout callout--${tone}`;
  return <div className={cls}>{children}</div>;
}

export function Quote({ children, attr }: { children: ReactNode; attr?: string }) {
  return (
    <blockquote className="quote">
      {children}
      {attr && <span className="quote__attr">{attr}</span>}
    </blockquote>
  );
}

export function Cols({ n = 2, children }: { n?: 2 | 3; children: ReactNode }) {
  return <div className={`cols cols--${n}`}>{children}</div>;
}

export function Panel({
  title,
  tone,
  muted,
  icon,
  children,
}: {
  title?: string;
  tone?: 'good' | 'bad' | 'warn';
  muted?: boolean;
  /** small glyph to the left of the title — for panels that denote an entity, not a judgment */
  icon?: ReactNode;
  children: ReactNode;
}) {
  const heading = title && (
    <h3 className={tone ? `panel__title panel__title--${tone}` : 'panel__title'}>{title}</h3>
  );
  return (
    <div className={muted ? 'panel panel--muted' : 'panel'}>
      {icon && title ? (
        <div className="panel__head">
          <span className="panel__icon">{icon}</span>
          {heading}
        </div>
      ) : (
        heading
      )}
      {children}
    </div>
  );
}

export function Chips({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <div className="chip-row">
      {items.map((c) => (
        <span className={accent ? 'chip chip--accent' : 'chip'} key={c}>
          {c}
        </span>
      ))}
    </div>
  );
}

export type KeyPoint = { title: string; body: ReactNode };

/** Numbered key takeaways — the "so what" of a slide. */
export function KeyPoints({ items, spaced }: { items: KeyPoint[]; spaced?: boolean }) {
  return (
    <div className={spaced ? 'keypoints keypoints--spaced' : 'keypoints'}>
      {items.map((k, i) => (
        <div className="keypoint" key={k.title}>
          <div className="keypoint__num">{String(i + 1).padStart(2, '0')}</div>
          <div>
            <div className="keypoint__title">{k.title}</div>
            <div className="keypoint__body">{k.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Figure({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="figure">
      <div className="figure__title">{title}</div>
      {sub && <div className="figure__sub">{sub}</div>}
      {children}
    </div>
  );
}

export type Milestone = {
  label: string;
  date: string;
  /** 'done' renders a filled dot for something that already happened; 'good' | 'warn' | 'bad' adds a status badge */
  status?: 'done' | 'good' | 'warn' | 'bad';
  statusLabel?: string;
};

/** A horizontal stepper for a handful of dated milestones against plan. */
export function Milestones({ items }: { items: Milestone[] }) {
  return (
    <div className="milestones">
      {items.map((m) => (
        <div className="milestone" key={m.label}>
          <span className={`milestone__dot${m.status ? ` milestone__dot--${m.status}` : ''}`} />
          <div className="milestone__label">{m.label}</div>
          <div className="milestone__date">{m.date}</div>
          {m.statusLabel && (
            <span className={`milestone__badge milestone__badge--${m.status ?? 'good'}`}>
              {m.statusLabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="legend">
      {items.map((i) => (
        <div className="legend__item" key={i.label}>
          <span className="legend__swatch" style={{ background: i.color }} />
          {i.label}
        </div>
      ))}
    </div>
  );
}

/** A line said out loud on the project, set large enough to be the point of the block. */
export function BigQuote({
  children,
  attr,
  note,
}: {
  children: ReactNode;
  attr?: string;
  note?: ReactNode;
}) {
  return (
    <div className="bigquote">
      <p className="bigquote__text">{children}</p>
      {attr && <div className="bigquote__attr">{attr}</div>}
      {note && <div className="bigquote__note">{note}</div>}
    </div>
  );
}

/**
 * A practical observation / field takeaway from real project experience.
 */
export function FieldNote({
  title = 'How it worked in practice',
  teaser,
  children,
  defaultOpen = true,
}: {
  title?: string;
  teaser?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`fieldnote ${open ? 'fieldnote--open' : ''}`}>
      <button className="fieldnote__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="fieldnote__badge">In practice</span>
        <span className="fieldnote__head">
          <span className="fieldnote__title">{title}</span>
          {teaser && <span className="fieldnote__teaser">{teaser}</span>}
        </span>
        <span className="fieldnote__chev">{open ? '\u2212' : '+'}</span>
      </button>
      {open && <div className="fieldnote__body">{children}</div>}
    </div>
  );
}

/**
 * A first-person story from someone on the team, folded away by default: the deck
 * should read as people's experience, not as a guide — but not as a talk show either.
 */
export function HumanStory({
  who,
  role,
  teaser,
  children,
}: {
  who: string;
  role: string;
  /** one line visible before the click — enough to decide whether to open it */
  teaser: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={open ? 'story story--open' : 'story'}>
      <button className="story__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="story__avatar">{who.slice(0, 1)}</span>
        <span className="story__head">
          <span className="story__who">
            {who} <span className="story__role">{role}</span>
          </span>
          <span className="story__teaser">{teaser}</span>
        </span>
        <span className="story__chev">{open ? '\u2212' : '+'}</span>
      </button>
      {open && <div className="story__body">{children}</div>}
    </div>
  );
}
