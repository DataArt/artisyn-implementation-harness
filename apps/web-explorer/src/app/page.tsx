import Landing from '../views/landing/Landing';
import { routeFor, toMetadata } from '../routes';

export const metadata = toMetadata(routeFor('/'));

export default function HomePage() {
  return <Landing />;
}
