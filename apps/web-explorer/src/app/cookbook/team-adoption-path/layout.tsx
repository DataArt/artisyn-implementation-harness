import type { ReactNode } from 'react';
import Footer from '../../../components/Footer';
import { TeamAdoptionPathNavProvider } from '../../../views/cookbook/team-adoption-path/TeamAdoptionPathNav';
import '../../../views/cookbook/team-adoption-path/team-adoption-path.css';

/**
 * Shared chrome and visited-state provider for the hub and all 10 detail pages.
 * The provider lives here, not in the hub page alone, so a node's "visited" state
 * survives navigating to its detail page and back.
 */
export default function TeamAdoptionPathLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="container" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <TeamAdoptionPathNavProvider>{children}</TeamAdoptionPathNavProvider>
      </main>
      <Footer />
    </>
  );
}
