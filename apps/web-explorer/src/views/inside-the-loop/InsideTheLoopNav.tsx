import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Adapted from the source deck's navigation.tsx: that version's `goToId`
 * jumped between separate slides in a 10-slide deck shown one at a time.
 * Here each of the 10 topics is a real route under /inside-the-loop/{id}
 * (see InsideTheLoopRoutes.tsx), so `goToId` navigates there directly and
 * marks the topic visited — the provider lives in InsideTheLoopLayout so
 * `visited` survives the navigation and shows back on the map afterward.
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
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());
  const navigate = useNavigate();

  const goToId = (id: string) => {
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    navigate(`/inside-the-loop/${id}`);
  };

  const value = useMemo(() => ({ goToId, visited }), [visited]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
