import type { ComponentType } from 'react';
import {
  INSIDE_THE_LOOP_SLUGS,
  routeFor,
  toMetadata,
  type InsideTheLoopSlug,
} from '../../../routes';
import InsideTheLoopDetailPage from '../../../views/inside-the-loop/InsideTheLoopDetailPage';
import { Requirements } from '../../../views/inside-the-loop/01-requirements';
import { Context } from '../../../views/inside-the-loop/02-context';
import { Harness } from '../../../views/inside-the-loop/03-harness';
import { CodeReview } from '../../../views/inside-the-loop/04-code-review';
import { CodeQuality } from '../../../views/inside-the-loop/05-quality';
import { Retro } from '../../../views/inside-the-loop/06-retro';
import { ContinuousImprovement } from '../../../views/inside-the-loop/07-improvement';
import { Onboarding } from '../../../views/inside-the-loop/08-onboarding';
import { Tools } from '../../../views/inside-the-loop/09-tools';
import { Infrastructure } from '../../../views/inside-the-loop/10-infrastructure';

const content: Record<InsideTheLoopSlug, ComponentType> = {
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
  return toMetadata(routeFor(`/inside-the-loop/${slug}/`));
}

export function generateStaticParams() {
  return INSIDE_THE_LOOP_SLUGS.map((slug) => ({ slug }));
}

export default async function InsideTheLoopTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const Content = content[slug as InsideTheLoopSlug];
  return (
    <InsideTheLoopDetailPage>
      <Content />
    </InsideTheLoopDetailPage>
  );
}
