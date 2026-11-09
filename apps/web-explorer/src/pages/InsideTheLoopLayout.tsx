import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { InsideTheLoopNavProvider } from './InsideTheLoopNav';

/**
 * Shared chrome + visited-state provider for the hub and all 10 detail
 * pages under /inside-the-loop/*. The provider lives here, not in the hub
 * page alone, so a node's "visited" state survives navigating to its detail
 * page and back.
 */
export default function InsideTheLoopLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <InsideTheLoopNavProvider>
          <Outlet />
        </InsideTheLoopNavProvider>
      </main>
      <Footer />
    </div>
  );
}
