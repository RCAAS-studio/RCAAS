'use client';
import dynamic from 'next/dynamic';
import { useMarketingPageProps } from '../routing/MarketingActions';
const IndustriesPage = dynamic(() => import('../pages/IndustriesPage').then(module => module.IndustriesPage));
const WorkPage = dynamic(() => import('../pages/WorkPage').then(module => module.WorkPage));
const LearnPage = dynamic(() => import('../pages/LearnPage').then(module => module.LearnPage));
const PlatformPage = dynamic(() => import('../pages/PlatformPage').then(module => module.PlatformPage));
const HowWeWorkPage = dynamic(() => import('../pages/HowWeWorkPage').then(module => module.HowWeWorkPage));
const AboutPage = dynamic(() => import('../pages/AboutPage').then(module => module.AboutPage));
const FaqPage = dynamic(() => import('../pages/FaqPage').then(module => module.FaqPage));
const ContactPage = dynamic(() => import('../pages/ContactPage').then(module => module.ContactPage));
const ThankYouPage = dynamic(() => import('../pages/ThankYouPage').then(module => module.ThankYouPage));
const PrivacyPage = dynamic(() => import('../pages/PrivacyPage').then(module => module.PrivacyPage));
const TermsPage = dynamic(() => import('../pages/TermsPage').then(module => module.TermsPage));
const GalleryPage = dynamic(() => import('../pages/GalleryPage').then(module => module.GalleryPage));
const CookiesPage = dynamic(() => import('../pages/PolicyPages').then(module => module.CookiesPage));
const SecurityPage = dynamic(() => import('../pages/PolicyPages').then(module => module.SecurityPage));

export function IndustriesIndexEntry() {
  const props = useMarketingPageProps();
  return <IndustriesPage {...props} />;
}

export function WorkIndexEntry() {
  const props = useMarketingPageProps();
  return <WorkPage {...props} />;
}

export function LearnIndexEntry() {
  const props = useMarketingPageProps();
  return <LearnPage {...props} />;
}

export function PlatformEntry() {
  const props = useMarketingPageProps();
  return <PlatformPage {...props} />;
}

export function HowWeWorkEntry() {
  const props = useMarketingPageProps();
  return <HowWeWorkPage {...props} />;
}

export function AboutEntry() {
  const props = useMarketingPageProps();
  return <AboutPage {...props} />;
}

export function FaqEntry() {
  const props = useMarketingPageProps();
  return <FaqPage {...props} />;
}

export function ContactEntry() {
  const props = useMarketingPageProps();
  return <ContactPage {...props} />;
}

export function ThankYouEntry() {
  const props = useMarketingPageProps();
  return <ThankYouPage {...props} />;
}

export function PrivacyEntry() {
  const props = useMarketingPageProps();
  return <PrivacyPage {...props} />;
}

export function TermsEntry() {
  const props = useMarketingPageProps();
  return <TermsPage {...props} />;
}

export function GalleryEntry() {
  const props = useMarketingPageProps();
  return <GalleryPage {...props} />;
}

export function CookiesEntry() {
  const props = useMarketingPageProps();
  return <CookiesPage {...props} />;
}

export function SecurityEntry() {
  const props = useMarketingPageProps();
  return <SecurityPage {...props} />;
}

