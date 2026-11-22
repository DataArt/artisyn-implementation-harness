import Moved, { movedMetadata } from '../../../components/Moved';
import { TEAM_ADOPTION_PATH_SLUGS } from '../../../routes';

export const dynamicParams = false;

export function generateStaticParams() {
  return TEAM_ADOPTION_PATH_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return movedMetadata(`/inside-the-loop/${slug}/`);
}

export default async function MovedTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Moved from={`/inside-the-loop/${slug}/`} />;
}
