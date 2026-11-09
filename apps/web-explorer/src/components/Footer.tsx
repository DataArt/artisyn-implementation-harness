import { ArrowUpRight } from 'lucide-react';
import { repoUrl } from '../env';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>Artisyn · Implementation Harness</span>
        <span>Built to explain the harness. Not a live execution environment.</span>
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          Open source <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}
