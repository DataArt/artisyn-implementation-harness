import Agents from '../../views/agents/Agents';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/agents/'));

export default function AgentsPage() {
  return <Agents />;
}
