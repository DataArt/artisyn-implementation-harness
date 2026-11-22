import Moved, { movedMetadata } from '../../components/Moved';

export const metadata = movedMetadata('/dogfood/');

export default function MovedPage() {
  return <Moved from="/dogfood/" />;
}
