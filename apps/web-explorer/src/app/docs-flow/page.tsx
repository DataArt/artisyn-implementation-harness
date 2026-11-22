import localFont from 'next/font/local';
import DocsFlow from '../../views/docs-flow/DocsFlow';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/docs-flow/'));

const dmSans = localFont({
  src: '../../fonts/DMSans-latin-wght.woff2',
  weight: '100 1000',
  display: 'swap',
  variable: '--font-dm-sans',
});

export default function DocsFlowPage() {
  return (
    <div className={dmSans.variable}>
      <DocsFlow />
    </div>
  );
}
