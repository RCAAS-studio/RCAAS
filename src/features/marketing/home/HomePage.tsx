'use client';

import type { HomePageProps } from './types';
import { SpatialBackgroundScan } from '../components/SpatialBackgroundScan';
import { InfiniteMarquee } from '../components/InfiniteMarquee';
import { HeroSection } from './components/HeroSection';
import { LiveExperienceSection } from './components/LiveExperienceSection';
import { ServicesSection } from './components/ServicesSection';
import { IndustriesSection } from './components/IndustriesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { WhyRcaasSection } from './components/WhyRcaasSection';
import { FeaturedWorkSection } from './components/FeaturedWorkSection';
import { HeritageSection } from './components/HeritageSection';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';

export function HomePage({ onNavigate, onOpenPlanner }: HomePageProps) {
 return <div className="relative overflow-hidden bg-white text-ink">
 <SpatialBackgroundScan />
 <HeroSection onOpenPlanner={onOpenPlanner} />
 <InfiniteMarquee />
 <LiveExperienceSection />
 <ServicesSection onNavigate={onNavigate} />
 <IndustriesSection onNavigate={onNavigate} />
 <HowItWorksSection onNavigate={onNavigate} />
 <WhyRcaasSection onNavigate={onNavigate} onOpenPlanner={onOpenPlanner} />
 <FeaturedWorkSection onNavigate={onNavigate} />
 <HeritageSection onNavigate={onNavigate} />
 <FaqSection onNavigate={onNavigate} />
 <CtaSection onOpenPlanner={onOpenPlanner} />
 </div>;
}
