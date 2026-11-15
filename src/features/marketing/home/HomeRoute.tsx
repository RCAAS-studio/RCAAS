'use client';
import { useMarketingActions } from '../routing/MarketingActions';
import { HomePage } from './HomePage';

/** Adapts the existing action callbacks to the native '/' route. */
export function HomeRoute() {
  const { navigateTo, openPlanner } = useMarketingActions();
  return <HomePage onNavigate={navigateTo} onOpenPlanner={openPlanner} />;
}
