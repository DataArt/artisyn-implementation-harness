import ContextTopology from '../../../views/cookbook/context-topology/ContextTopology';
import { ROUTE_PATHS, routeFor, toMetadata } from '../../../routes';

export const metadata = toMetadata(routeFor(ROUTE_PATHS.contextTopology));

export default function ContextTopologyPage() {
  return <ContextTopology />;
}
