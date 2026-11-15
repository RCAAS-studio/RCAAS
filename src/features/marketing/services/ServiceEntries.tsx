'use client';
import dynamic from 'next/dynamic';
import { useMarketingPageProps } from '../routing/MarketingActions';
const ServicesPage = dynamic(() => import('../pages/ServicesPage').then(module => module.ServicesPage));
const ImmersiveExperiencesPage = dynamic(() => import('../pages/ImmersiveExperiencesPage').then(module => module.ImmersiveExperiencesPage));
const VirtualToursPage = dynamic(() => import('../pages/VirtualToursPage').then(module => module.VirtualToursPage));
const VisualStorytellingPage = dynamic(() => import('../pages/VisualStorytellingPage').then(module => module.VisualStorytellingPage));
const DigitalTwinsPage = dynamic(() => import('../pages/DigitalTwinsPage').then(module => module.DigitalTwinsPage));
const LaserScanningPage = dynamic(() => import('../pages/LaserScanningPage').then(module => module.LaserScanningPage));
const DroneMappingPage = dynamic(() => import('../pages/DroneMappingPage').then(module => module.DroneMappingPage));
const GameWorldsPage = dynamic(() => import('../pages/GameWorldsPage').then(module => module.GameWorldsPage));

export function ServicesEntry() {
  const props = useMarketingPageProps();
  return <ServicesPage {...props} />;
}

export function ImmersiveExperiencesEntry() {
  const props = useMarketingPageProps();
  return <ImmersiveExperiencesPage {...props} />;
}

export function VirtualToursEntry() {
  const props = useMarketingPageProps();
  return <VirtualToursPage {...props} />;
}

export function VisualStorytellingEntry() {
  const props = useMarketingPageProps();
  return <VisualStorytellingPage {...props} />;
}

export function DigitalTwinsEntry() {
  const props = useMarketingPageProps();
  return <DigitalTwinsPage {...props} />;
}

export function LaserScanningEntry() {
  const props = useMarketingPageProps();
  return <LaserScanningPage {...props} />;
}

export function DroneMappingEntry() {
  const props = useMarketingPageProps();
  return <DroneMappingPage {...props} />;
}

export function GameWorldsEntry() {
  const props = useMarketingPageProps();
  return <GameWorldsPage {...props} />;
}

