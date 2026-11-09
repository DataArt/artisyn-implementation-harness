import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * For in-page anchors on Landing ("/") — with HashRouter, the URL's one "#" is
 * already owned by the router (e.g. "#/inside-the-loop"), so a plain
 * href="#how-it-works" is read as a route change, not a scroll. On "/" this
 * scrolls directly; from elsewhere it navigates to "/" first and passes the
 * target via router state, which Landing's own effect picks up on mount.
 */
export default function SectionLink({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };
  return (
    <a href={`#${id}`} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
