import Moved, { movedMetadata } from '../../components/Moved';

export const metadata = movedMetadata('/inside-the-loop/');

export default function MovedPage() {
  return <Moved from="/inside-the-loop/" />;
}
