import Agents from '../../../views/cookbook/agents/Agents';
import { ROUTE_PATHS, routeFor, toMetadata } from '../../../routes';

export const metadata = toMetadata(routeFor(ROUTE_PATHS.agents));

export default function AgentsPage() {
  return <Agents />;
}
