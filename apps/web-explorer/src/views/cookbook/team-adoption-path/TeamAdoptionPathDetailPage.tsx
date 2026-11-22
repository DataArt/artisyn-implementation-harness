import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ROUTE_PATHS } from '../../../paths';

/**
 * Wraps each of the 10 ported detail slides with a way back to the map — the
 * source deck had its own deck-wide back/forward controls that aren't ported,
 * so this is the one piece of chrome these pages need that their own content
 * doesn't provide. Visited state is recorded by TeamAdoptionPathNavProvider.
 */
export default function TeamAdoptionPathDetailPage({ children }: { children: ReactNode }) {
  return (
    <>
      <Link href={ROUTE_PATHS.teamAdoptionPath} className="icon-link" style={{ marginBottom: 20 }}>
        <ChevronLeft size={15} /> Back to the map
      </Link>
      {children}
    </>
  );
}
