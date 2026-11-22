'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { ROUTE_PATHS } from '../paths';

type Entry = { href: string; label: string; description: string };

const RECIPES: Entry[] = [
  {
    href: ROUTE_PATHS.teamAdoptionPath,
    label: 'Team Adoption Path',
    description: 'Ten steps a team takes with the harness, each one opening the next',
  },
  {
    href: ROUTE_PATHS.knowledgeFlow,
    label: 'Knowledge Flow',
    description: 'How docs are born with the work and graduate to permanent architecture docs',
  },
  {
    href: ROUTE_PATHS.agents,
    label: 'Agents',
    description: 'How AI agents search and use this site through WebMCP and llms.txt',
  },
];

const CASE_STUDIES: Entry[] = [
  {
    href: ROUTE_PATHS.dogfood,
    label: 'Dogfood',
    description: 'The harness running on its own repository',
  },
  {
    href: ROUTE_PATHS.migration,
    label: 'Migration',
    description: 'Vite to Next.js in a working day, measured',
  },
];

const ALL = [...RECIPES, ...CASE_STUDIES];

/** Cookbook entry of the main navigation: a disclosure button with a panel of links. */
export default function CookbookMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const panelId = useId();
  const groupId = useId();
  const current = (href: string) => pathname === href || pathname.startsWith(href);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      trigger.current?.focus();
    }
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  };

  const item = (entry: Entry) => (
    <li key={entry.href}>
      <Link
        href={entry.href}
        className="nav-menu-item"
        aria-current={current(entry.href) ? 'page' : undefined}
      >
        <span className="nav-menu-label">{entry.label}</span>
        <span className="nav-menu-desc">{entry.description}</span>
      </Link>
    </li>
  );

  return (
    <div className="nav-menu" ref={root} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        className={
          ALL.some((e) => current(e.href)) ? 'nav-menu-trigger is-current' : 'nav-menu-trigger'
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Cookbook <ChevronDown size={14} aria-hidden="true" />
      </button>
      <div id={panelId} className="nav-menu-panel" hidden={!open}>
        <ul className="nav-menu-list">{RECIPES.map(item)}</ul>
        <p className="nav-menu-group" id={groupId}>
          Case studies
        </p>
        <ul className="nav-menu-list" aria-labelledby={groupId}>
          {CASE_STUDIES.map(item)}
        </ul>
      </div>
    </div>
  );
}
