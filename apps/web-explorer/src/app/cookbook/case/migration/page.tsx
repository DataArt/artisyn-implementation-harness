import MigrationCase from '../../../../views/cookbook/case/migration/MigrationCase';
import { ROUTE_PATHS, routeFor, toMetadata } from '../../../../routes';

export const metadata = toMetadata(routeFor(ROUTE_PATHS.migration));

export default function MigrationCasePage() {
  return <MigrationCase />;
}
