'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Adapted from the source deck's navigation.tsx: that version's `goToId`
 * jumped between separate slides in a 10-slide deck shown one at a time.
 * Here each of the 10 topics is a real route under /inside-the-loop/{id}/
 * (app/inside-the-loop/[slug]), so `goToId` navigates there directly. A topic
 * is marked visited whenever its page is shown, including by a direct URL;
 * the provider lives in app/inside-the-loop/layout.tsx so `visited` survives
 * client navigation and shows back on the map afterward.
 */
type Navigation = {
  goToId: (id: string) => void;
  visited: ReadonlySet<string>;
};

const NavigationContext = createContext<Navigation | undefined>(undefined);

const emptyVisited: ReadonlySet<string> = new Set();

export function useNavigation(): Navigation {
  return useContext(NavigationContext) ?? { goToId: () => {}, visited: emptyVisited };
}

export function InsideTheLoopNavProvider({ children }: { children: ReactNode }) {
  const [visited, setVisited] = useState<ReadonlySet<string>>(emptyVisited);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const id = pathname.match(/^\/inside-the-loop\/([^/]+)\/?$/)?.[1];
    if (id) setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, [pathname]);

  const value = useMemo(
    () => ({ goToId: (id: string) => router.push(`/inside-the-loop/${id}/`), visited }),
    [router, visited]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
