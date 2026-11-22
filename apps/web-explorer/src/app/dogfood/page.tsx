import Dogfood from '../../views/dogfood/Dogfood';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/dogfood/'));

export default function DogfoodPage() {
  return <Dogfood />;
}
