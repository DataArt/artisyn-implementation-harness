'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Slide numbering comes from the deck order, not from each slide's own literal —
 * otherwise every reordering silently desynchronises the kickers.
 */
const SlideNumberContext = createContext<string | undefined>(undefined);
export function SlideNumberProvider({ value, children }: { value: string; children: ReactNode }) {
  return <SlideNumberContext.Provider value={value}>{children}</SlideNumberContext.Provider>;
}

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
