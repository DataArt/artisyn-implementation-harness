import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { repoUrl, docsUrl } from '../env';
import SectionLink from './SectionLink';

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
          <Link to="/docs-flow">Docs flow</Link>
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
