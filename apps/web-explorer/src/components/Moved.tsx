import type { Metadata } from 'next';
import Link from 'next/link';
import { MOVED, routeFor } from '../routes';
import { basePath, siteUrl } from '../site';

const target = (from: string) => {
  const to = MOVED[from];
  if (!to) throw new Error(`No new path recorded for ${from}`);
  return { to, title: routeFor(to).title };
};

/** A published path that moved: noindex, canonical to the new address. */
export function movedMetadata(from: string): Metadata {
  const { to, title } = target(from);
  return {
    title: `Moved: ${title}`,
    description: `This page moved to ${siteUrl}${to}`,
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteUrl}${to}` },
  };
}

/** Sends a visitor from an old path to its new one at once, with a link if the refresh is blocked. */
export default function Moved({ from }: { from: string }) {
  const { to, title } = target(from);
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${basePath}${to}`} />
      <main className="container section">
        <div className="section-heading">
          <h1>This page has moved</h1>
          <p>
            It is now <Link href={to}>{title}</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
