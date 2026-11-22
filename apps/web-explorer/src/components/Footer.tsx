import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { repoUrl } from '../env';
import { ROUTE_PATHS } from '../paths';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>Artisyn · Implementation Harness</span>
        <span>Built to explain the harness. Not a live execution environment.</span>
        <Link href={ROUTE_PATHS.migration}>Migration case</Link>
        <Link href={ROUTE_PATHS.agents}>For AI agents</Link>
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          Open source <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}
