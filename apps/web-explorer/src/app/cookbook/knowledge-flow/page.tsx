import localFont from 'next/font/local';
import KnowledgeFlow from '../../../views/cookbook/knowledge-flow/KnowledgeFlow';
import { ROUTE_PATHS, routeFor, toMetadata } from '../../../routes';

export const metadata = toMetadata(routeFor(ROUTE_PATHS.knowledgeFlow));

const dmSans = localFont({
  src: '../../../fonts/DMSans-latin-wght.woff2',
  weight: '100 1000',
  display: 'swap',
  variable: '--font-dm-sans',
});

export default function KnowledgeFlowPage() {
  return (
    <div className={dmSans.variable}>
      <KnowledgeFlow />
    </div>
  );
}
