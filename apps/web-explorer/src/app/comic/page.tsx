import Comic from '../../views/comic/Comic';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/comic/'));

export default function ComicPage() {
  return <Comic />;
}
