'use client';
import dynamic from 'next/dynamic';
import { GameWorldsPage } from '../pages/GameWorldsPage';
import { resolveBlogRoute, isNotFoundPath } from '../meta';
import { useMarketingActions } from './MarketingActions';
const HomePage = dynamic(() => import('../pages/HomePage').then((m) => m.HomePage));
const ServicesPage = dynamic(() => import('../pages/ServicesPage').then((m) => m.ServicesPage));
const ImmersiveExperiencesPage = dynamic(() => import('../pages/ImmersiveExperiencesPage').then((m) => m.ImmersiveExperiencesPage));
const VirtualToursPage = dynamic(() => import('../pages/VirtualToursPage').then((m) => m.VirtualToursPage));
const VisualStorytellingPage = dynamic(() => import('../pages/VisualStorytellingPage').then((m) => m.VisualStorytellingPage));
const DigitalTwinsPage = dynamic(() => import('../pages/DigitalTwinsPage').then((m) => m.DigitalTwinsPage));
const LaserScanningPage = dynamic(() => import('../pages/LaserScanningPage').then((m) => m.LaserScanningPage));
const DroneMappingPage = dynamic(() => import('../pages/DroneMappingPage').then((m) => m.DroneMappingPage));
const IndustriesPage = dynamic(() => import('../pages/IndustriesPage').then((m) => m.IndustriesPage));
const WorkPage = dynamic(() => import('../pages/WorkPage').then((m) => m.WorkPage));
const PlatformPage = dynamic(() => import('../pages/PlatformPage').then((m) => m.PlatformPage));
const HowWeWorkPage = dynamic(() => import('../pages/HowWeWorkPage').then((m) => m.HowWeWorkPage));
const LearnPage = dynamic(() => import('../pages/LearnPage').then((m) => m.LearnPage));
const AboutPage = dynamic(() => import('../pages/AboutPage').then((m) => m.AboutPage));
const FaqPage = dynamic(() => import('../pages/FaqPage').then((m) => m.FaqPage));
const ContactPage = dynamic(() => import('../pages/ContactPage').then((m) => m.ContactPage));
const ThankYouPage = dynamic(() => import('../pages/ThankYouPage').then((m) => m.ThankYouPage));
const PrivacyPage = dynamic(() => import('../pages/PrivacyPage').then((m) => m.PrivacyPage));
const TermsPage = dynamic(() => import('../pages/TermsPage').then((m) => m.TermsPage));
const BlogHubPage = dynamic(() => import('../pages/BlogHubPage').then((m) => m.BlogHubPage));
const BlogPostPage = dynamic(() => import('../pages/BlogPostPage').then((m) => m.BlogPostPage));
const NotFoundPage = dynamic(() => import('../pages/NotFoundPage').then((m) => m.NotFoundPage));
const GalleryPage = dynamic(() => import('../pages/GalleryPage').then((m) => m.GalleryPage));
const CookiesPage = dynamic(() => import('../pages/PolicyPages').then((m) => m.CookiesPage));
const SecurityPage = dynamic(() => import('../pages/PolicyPages').then((m) => m.SecurityPage));

export function MarketingPage() {
const { currentPath, navigateTo, openPlanner } = useMarketingActions();
if (isNotFoundPath(currentPath)) return <NotFoundPage onNavigate={navigateTo} />;

    if (currentPath === '/') {
      return <HomePage onNavigate={navigateTo} onOpenPlanner={openPlanner} />;
    }
    if (currentPath.startsWith('/services/immersive-experiences/3d-virtual-tours')) {
      return (
        <VirtualToursPage
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/services/game-worlds-assets')) {
      return <GameWorldsPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/services/visual-storytelling')) {
      return (
        <VisualStorytellingPage
          onNavigate={navigateTo}
        />
      );
    }
    if (currentPath.startsWith('/services/immersive-experiences')) {
      return (
        <ImmersiveExperiencesPage
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/services/digital-twins/3d-laser-scanning')) {
      return (
        <LaserScanningPage
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/services/digital-twins/drone-mapping')) {
      return (
        <DroneMappingPage
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/services/digital-twins')) {
      return (
        <DigitalTwinsPage
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/services')) {
      return (
        <ServicesPage
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/industries')) {
      return (
        <IndustriesPage
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/work')) {
      return (
        <WorkPage
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/platform')) {
      return <PlatformPage onNavigate={navigateTo} onOpenPlanner={openPlanner} />;
    }
    if (currentPath.startsWith('/how-we-work')) {
      return <HowWeWorkPage onNavigate={navigateTo} onOpenPlanner={openPlanner} />;
    }
    if (currentPath.startsWith('/learn')) {
      return (
        <LearnPage
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenPlanner={openPlanner}
        />
      );
    }
    if (currentPath.startsWith('/about')) {
      return <AboutPage onNavigate={navigateTo} onOpenPlanner={openPlanner} />;
    }
    if (currentPath.startsWith('/faq')) {
      return <FaqPage onNavigate={navigateTo} onOpenPlanner={openPlanner} />;
    }
    if (currentPath.startsWith('/contact')) {
      return <ContactPage currentPath={currentPath} onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/thank-you')) {
      return <ThankYouPage onNavigate={navigateTo} />;
    }
    const blogRoute = resolveBlogRoute(currentPath.split(/[?#]/)[0]);
    if (blogRoute?.kind === 'hub') {
      return <BlogHubPage key={blogRoute.page} page={blogRoute.page} onNavigate={navigateTo} />;
    }
    if (blogRoute?.kind === 'post') {
      return <BlogPostPage key={blogRoute.post.slug} post={blogRoute.post} onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/privacy')) {
      return <PrivacyPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/terms')) {
      return <TermsPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/gallery')) {
      return <GalleryPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/cookies')) {
      return <CookiesPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/security')) {
      return <SecurityPage onNavigate={navigateTo} />;
    }

    // Anything else is a custom 404.
    return <NotFoundPage onNavigate={navigateTo} />;
  
}
