import Moved, { movedMetadata } from '../../components/Moved';

export const metadata = movedMetadata('/docs-flow/');

export default function MovedPage() {
  return <Moved from="/docs-flow/" />;
}
