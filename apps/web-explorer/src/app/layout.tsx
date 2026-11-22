import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import AgentTools from '../agent/AgentTools';
import Header from '../components/Header';
import { asset, siteUrl } from '../site';
import '../styles.css';

const inter = localFont({
  src: '../fonts/Inter-latin-wght.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: 'Artisyn — Implementation Harness', template: '%s — Artisyn' },
  referrer: 'strict-origin-when-cross-origin',
  applicationName: 'Artisyn',
  authors: [{ name: 'DataArt', url: 'https://www.dataart.com' }],
  creator: 'DataArt',
  publisher: 'DataArt',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  icons: {
    icon: [
      { url: asset('/favicon.svg'), type: 'image/svg+xml' },
      { url: asset('/favicon.ico'), sizes: 'any' },
    ],
    apple: asset('/apple-touch-icon.png'),
  },
};

export const viewport: Viewport = { themeColor: '#0b1018' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <div className="app-shell">
          <Header />
          {children}
        </div>
        <AgentTools />
      </body>
    </html>
  );
}
