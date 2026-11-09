import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useNavigation } from './InsideTheLoopNav';

/**
 * Wraps each of the 10 ported detail slides: marks the topic visited even
 * when reached by a direct URL (not just a map click), and adds a way back
 * to the map — the source deck had its own deck-wide back/forward controls
 * that aren't ported, so this is the one piece of chrome these pages need
 * that their own content doesn't provide.
 */
export default function InsideTheLoopDetailPage({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { goToId, visited } = useNavigation();
  // `goToId`/`visited` are intentionally not in the dep array: this should
  // only re-run when the route's `id` itself changes, not on every provider
  // re-render (goToId is a fresh reference each render; including it here
  // would refire the effect far more often than the id actually changes).
  useEffect(() => {
    if (!visited.has(id)) goToId(id);
  }, [id]);

  return (
    <>
      <Link to="/inside-the-loop" className="icon-link" style={{ marginBottom: 20 }}>
        <ChevronLeft size={15} /> Back to the map
      </Link>
      {children}
    </>
  );
}
