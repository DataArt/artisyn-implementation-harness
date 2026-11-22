import MigrationCase from '../../views/migration-case/MigrationCase';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/migration-case/'));

export default function MigrationCasePage() {
  return <MigrationCase />;
}
