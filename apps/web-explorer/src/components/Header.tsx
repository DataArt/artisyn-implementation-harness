import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { repoUrl, docsUrl } from '../env';

/**
 * Shared across every page. "How it works" / "Capabilities" are in-page
 * anchors on Landing ("/") — with HashRouter, the URL's one "#" is already
 * owned by the router (e.g. "#/inside-the-loop"), so a plain
 * href="#how-it-works" would be read as a route change, not a scroll. On "/"
 * this scrolls directly; from elsewhere it navigates to "/" first and passes
 * the target via router state, which Landing's own effect picks up on mount.
 */
function SectionLink({ id, children }: { id: string; children: React.ReactNode }) {
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
    <a href={`#${id}`} onClick={onClick}>
      {children}
    </a>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="Artisyn home">
          <img
            src={`${import.meta.env.BASE_URL}brand/artisyn-mark.svg`}
            alt=""
            width="34"
            height="34"
          />
          <span>
            artisyn<span className="brand-muted"> / implementation harness</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          <SectionLink id="how-it-works">How it works</SectionLink>
          <SectionLink id="capabilities">Capabilities</SectionLink>
          <Link to="/inside-the-loop">Inside the loop</Link>
          <a href={docsUrl} target="_blank" rel="noopener noreferrer">
            Docs <ArrowUpRight size={13} />
          </a>
        </nav>
        <a className="header-github" href={repoUrl} target="_blank" rel="noopener noreferrer">
          <Code2 size={17} />
          <span>GitHub</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </header>
  );
}
