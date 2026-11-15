'use client';
import { findCaseStudy } from '../content/work';
import { CaseStudyPage } from '../pages/CaseStudyPage';
import { useMarketingActions } from '../routing/MarketingActions';
import { MarketingNotFound } from '../routing/MarketingNotFound';

export function CaseStudyEntry({ slug }: { slug: string }) {
  const { navigateTo } = useMarketingActions();
  const study = findCaseStudy(slug);
  return study ? <CaseStudyPage key={slug} study={study} onNavigate={navigateTo} /> : <MarketingNotFound />;
}
