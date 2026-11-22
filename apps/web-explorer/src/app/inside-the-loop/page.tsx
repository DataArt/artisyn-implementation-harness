import InsideTheLoopHub from '../../views/inside-the-loop/InsideTheLoopHub';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/inside-the-loop/'));

export default function InsideTheLoopHubPage() {
  return <InsideTheLoopHub />;
}
