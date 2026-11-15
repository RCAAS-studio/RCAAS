'use client';
import dynamic from 'next/dynamic';
import { useMarketingPageProps } from '../routing/MarketingActions';
const ComparisonGuidePage = dynamic(() => import('../pages/ComparisonGuidePage').then(module => module.ComparisonGuidePage));
const GaussianGuidePage = dynamic(() => import('../pages/GaussianGuidePage').then(module => module.GaussianGuidePage));
const CostGuidePage = dynamic(() => import('../pages/CostGuidePage').then(module => module.CostGuidePage));

export function ComparisonGuideEntry() {
  const props = useMarketingPageProps();
  return <ComparisonGuidePage {...props} />;
}

export function GaussianGuideEntry() {
  const props = useMarketingPageProps();
  return <GaussianGuidePage {...props} />;
}

export function CostGuideEntry() {
  const props = useMarketingPageProps();
  return <CostGuidePage {...props} />;
}

