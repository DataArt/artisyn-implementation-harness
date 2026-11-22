import type { ReactNode } from 'react';
import Footer from '../../components/Footer';
import { InsideTheLoopNavProvider } from '../../views/inside-the-loop/InsideTheLoopNav';
import '../../views/inside-the-loop/inside-the-loop.css';

/**
 * Shared chrome and visited-state provider for the hub and all 10 detail pages.
 * The provider lives here, not in the hub page alone, so a node's "visited" state
 * survives navigating to its detail page and back.
 */
export default function InsideTheLoopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="container" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <InsideTheLoopNavProvider>{children}</InsideTheLoopNavProvider>
      </main>
      <Footer />
    </>
  );
}
