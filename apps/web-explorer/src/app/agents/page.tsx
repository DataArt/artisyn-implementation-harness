import Moved, { movedMetadata } from '../../components/Moved';

export const metadata = movedMetadata('/agents/');

export default function MovedPage() {
  return <Moved from="/agents/" />;
}
