'use client';
import { createContext, useContext } from 'react';
import type { RoutePath } from '../types';
export interface MarketingActions {
  currentPath: RoutePath;
  navigateTo: (path: RoutePath) => void;
  openPlanner: () => void;
}
export const MarketingActionsContext = createContext<MarketingActions | null>(null);
export function useMarketingActions() {
  const actions = useContext(MarketingActionsContext);
  if (!actions) throw new Error('Marketing content must be inside MarketingShell');
  return actions;
}
