import Moved, { movedMetadata } from '../../components/Moved';

export const metadata = movedMetadata('/migration-case/');

export default function MovedPage() {
  return <Moved from="/migration-case/" />;
}
