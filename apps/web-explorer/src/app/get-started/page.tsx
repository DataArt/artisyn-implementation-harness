import { Suspense } from 'react';
import Footer from '../../components/Footer';
import GetStarted, { GetStartedView } from '../../views/get-started/GetStarted';
import { channels, providers } from '../../views/get-started/commands';
import { routeFor, toMetadata } from '../../routes';

export const metadata = toMetadata(routeFor('/get-started/'));

export default function GetStartedPage() {
  return (
    <>
      <Suspense
        fallback={<GetStartedView channelId={channels[0].id} providerId={providers[0].id} />}
      >
        <GetStarted />
      </Suspense>
      <Footer />
    </>
  );
}
