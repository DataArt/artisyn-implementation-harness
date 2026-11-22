import Link from 'next/link';
import CookbookMenu from './CookbookMenu';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { repoUrl, docsUrl } from '../env';
import { asset, basePath } from '../site';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <img src={asset('/brand/artisyn-mark.svg')} alt="" width="34" height="34" />
          <span>
            artisyn<span className="brand-muted"> / implementation harness</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          <a href={`${basePath}/#how-it-works`}>How It Works</a>
          <a href={`${basePath}/#capabilities`}>Capabilities</a>
          <Link href="/get-started/">Get Started</Link>
          <CookbookMenu />
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
