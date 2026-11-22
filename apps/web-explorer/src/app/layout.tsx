import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
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
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-shell">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
