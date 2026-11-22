import type { ComponentType } from 'react';
import {
  TEAM_ADOPTION_PATH_SLUGS,
  routeFor,
  toMetadata,
  topicPath,
  type TeamAdoptionPathSlug,
} from '../../../../routes';
import TeamAdoptionPathDetailPage from '../../../../views/cookbook/team-adoption-path/TeamAdoptionPathDetailPage';
import { Requirements } from '../../../../views/cookbook/team-adoption-path/01-requirements';
import { Context } from '../../../../views/cookbook/team-adoption-path/02-context';
import { Harness } from '../../../../views/cookbook/team-adoption-path/03-harness';
import { CodeReview } from '../../../../views/cookbook/team-adoption-path/04-code-review';
import { CodeQuality } from '../../../../views/cookbook/team-adoption-path/05-quality';
import { Retro } from '../../../../views/cookbook/team-adoption-path/06-retro';
import { ContinuousImprovement } from '../../../../views/cookbook/team-adoption-path/07-improvement';
import { Onboarding } from '../../../../views/cookbook/team-adoption-path/08-onboarding';
import { Tools } from '../../../../views/cookbook/team-adoption-path/09-tools';
import { Infrastructure } from '../../../../views/cookbook/team-adoption-path/10-infrastructure';

const content: Record<TeamAdoptionPathSlug, ComponentType> = {
  requirements: Requirements,
  context: Context,
  harness: Harness,
  'code-review': CodeReview,
  quality: CodeQuality,
  retro: Retro,
  improvement: ContinuousImprovement,
  onboarding: Onboarding,
  tools: Tools,
  infrastructure: Infrastructure,
};

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return toMetadata(routeFor(topicPath(slug as TeamAdoptionPathSlug)));
}

export function generateStaticParams() {
  return TEAM_ADOPTION_PATH_SLUGS.map((slug) => ({ slug }));
}

export default async function TeamAdoptionPathTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const Content = content[slug as TeamAdoptionPathSlug];
  return (
    <TeamAdoptionPathDetailPage>
      <Content />
    </TeamAdoptionPathDetailPage>
  );
}
