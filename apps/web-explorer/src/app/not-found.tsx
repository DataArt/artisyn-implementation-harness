import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../components/Footer';
import { basePath } from '../site';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist on the Artisyn Implementation Harness site.',
};

export default function NotFound() {
  return (
    <>
      <main className="container section">
        <div className="section-heading">
          <span className="eyebrow">404</span>
          <h1>Page not found</h1>
          <p>The page you are looking for does not exist or has moved.</p>
        </div>
        <p className="hero-actions">
          <Link href="/" className="button button-primary">
            Home
          </Link>
          {/* /docs/ is Web Docs, outside the Next app, so a plain link */}
          <a href={`${basePath}/docs/`} className="button button-outline">
            Docs
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
