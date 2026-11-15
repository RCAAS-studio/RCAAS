'use client';
import { findIndustryContent } from '../content/industries';
import { IndustryPage } from '../pages/IndustryPage';
import { useMarketingActions } from '../routing/MarketingActions';
import { MarketingNotFound } from '../routing/MarketingNotFound';

export function IndustryEntry({ slug }: { slug: string }) {
  const { navigateTo } = useMarketingActions();
  // Content includes icon components, so only its slug crosses the server boundary.
  const industry = findIndustryContent(`/industries/${slug}/`);
  return industry ? <IndustryPage key={slug} industry={industry} onNavigate={navigateTo} /> : <MarketingNotFound />;
}
