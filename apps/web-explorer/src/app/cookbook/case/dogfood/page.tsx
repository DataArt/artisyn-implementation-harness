import Dogfood from '../../../../views/cookbook/case/dogfood/Dogfood';
import { ROUTE_PATHS, routeFor, toMetadata } from '../../../../routes';

export const metadata = toMetadata(routeFor(ROUTE_PATHS.dogfood));

export default function DogfoodPage() {
  return <Dogfood />;
}
