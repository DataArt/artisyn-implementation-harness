import TeamAdoptionPathHub from '../../../views/cookbook/team-adoption-path/TeamAdoptionPathHub';
import { ROUTE_PATHS, routeFor, toMetadata } from '../../../routes';

export const metadata = toMetadata(routeFor(ROUTE_PATHS.teamAdoptionPath));

export default function TeamAdoptionPathHubPage() {
  return <TeamAdoptionPathHub />;
}
