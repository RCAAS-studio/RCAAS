import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoutePath, CaseStudy } from '../types';
import { CASE_STUDIES, SITE_METADATA } from '../data/siteData';
import { findCaseStudy } from '../content/work';
import { CaseStudyPage } from './CaseStudyPage';
import { SplatEmbed } from '../components/SplatEmbed';
import { SpotlightCard } from '../components/SpotlightCard';
import { pageShellClass } from '../components/ui';

interface WorkPageProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ currentPath, onNavigate }) => {
  const [filterTag, setFilterTag] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<CaseStudy | null>(null);

  // Check if viewing a specific case study page
  const currentProject = CASE_STUDIES.find((c) => currentPath.includes(c.slug)) || null;

  // Handle ESC key to close 3D modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalProject(null);
      }
    };
    if (activeModalProject) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeModalProject]);

  // /work/{slug}/ renders the story-led case study template (src/content/work).
  const caseStudy = findCaseStudy(currentPath.split(/[?#]/)[0].replace(/^\/work\//, '').replace(/\/$/, ''));
  if (caseStudy) {
    return <CaseStudyPage key={caseStudy.slug} study={caseStudy} onNavigate={onNavigate} />;
  }

  const handleOpen3DModal = (project: CaseStudy) => {
    setActiveModalProject(project);
    // Fire analytical event if telemetry is present
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (event: string, action: string, params: unknown) => void }).gtag) {
      (window as unknown as { gtag: (event: string, action: string, params: unknown) => void }).gtag('event', 'model_open', {
        project_slug: project.slug,
        project_title: project.title,
      });
    }
  };

  const filteredProjects = filterTag === 'All'
    ? CASE_STUDIES
    : CASE_STUDIES.filter((c) => c.tag === filterTag);

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8 sm:mb-12">
          <button 
            onClick={() => onNavigate('/')} 
            className="hover:text-zinc-900 transition-colors"
          >
            Home
          </button>
          <span className="text-zinc-400">›</span>
          <button 
            onClick={() => onNavigate('/work/')} 
            className={`transition-colors ${!currentProject ? 'text-zinc-900 font-semibold' : 'hover:text-zinc-900'}`}
          >
            Our Work
          </button>
          {currentProject && (
            <>
              <span className="text-zinc-400">›</span>
              <span className="text-accent font-semibold">{currentProject.title}</span>
            </>
          )}
        </nav>

        {(
          /* ==============================================================
             OUR WORK SHOWCASE HUB (/work/) - SPEC §6.7
             ============================================================== */
          <div>
            {/* 1. HERO */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mb-12 sm:mb-14"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-2">
                Portfolio &amp; Showcase
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display">
                Step inside our work
              </h1>
              <p className="mt-4 text-base sm:text-xl text-muted leading-relaxed">
                Every project here started with a real place and a clear goal. Open any of them, move around, and see what your audience would see.
              </p>

              {/* Filter Chips: All · Heritage · Education · Hospitality */}
              <div className="mt-8 flex flex-wrap items-center gap-2">
                {['All', 'Heritage', 'Education', 'Hospitality'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
                      filterTag === tag
                        ? 'bg-accent text-white font-medium shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 2. EXPERIENCE SHOWCASE (#showcase) */}
            <section id="showcase" className="mb-20">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-1">
                  Interactive Spatial Models
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-display">
                  Explore in 3D
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Tap any place to open it. Nothing to install.
                </p>
              </div>

              {/* Tiles Grid (ExperienceShowcase) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 text-white shadow-xs transition-all hover:border-zinc-400"
                  >
                    {/* Poster Image */}
                    <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={project.heroImage}
                        alt={project.posterAlt || `3D view of ${project.title}`}
                        className="h-full w-full object-cover object-center opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
                        <span className="px-2.5 py-1 rounded bg-black/75 text-white border border-white/20">
                          {project.tag}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-accent/90 text-white text-[10px] uppercase font-semibold">
                          Explorable 3D
                        </span>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-1">
                          {project.title}
                        </h3>
                        <p className="text-xs text-zinc-300 line-clamp-1 mb-4 font-sans">
                          {project.clientGoal}
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpen3DModal(project)}
                            className="loro-btn-primary px-4 py-2 text-xs uppercase tracking-wider font-semibold cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>Explore in 3D</span>
                            <span>&rarr;</span>
                          </button>
                          <button
                            onClick={() => onNavigate(`/work/${project.slug}/` as RoutePath)}
                            className="px-3 py-2 text-xs uppercase tracking-wider font-mono text-zinc-300 hover:text-white bg-white/30 hover:bg-white/30 rounded transition-colors cursor-pointer"
                          >
                            Case story
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note under grid */}
              <p className="mt-4 text-xs font-mono text-zinc-500">
                Note: Each experience loads only when you open it. Typical size about 12–18 MB.
              </p>
            </section>

            {/* 3. THE STORIES BEHIND THEM (#stories) */}
            <section id="stories" className="mb-20 pt-8 border-t border-zinc-200">
              <div className="mb-8">
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-1">
                  Context, Scope &amp; Craft
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-display">
                  The stories behind them
                </h2>
              </div>

              {/* StoryCaseCard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <SpotlightCard
                    key={`story-${project.id}`}
                    onClick={() => onNavigate(`/work/${project.slug}/` as RoutePath)}
                    className="cursor-pointer p-7 flex flex-col justify-between group hover:border-zinc-400 transition-colors"
                  >
                    <div>
                      {/* Tag & Location */}
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-3">
                        <span className="text-accent font-semibold">{project.tag}</span>
                        <span>{project.location}</span>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-xl font-bold text-ink font-display group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>

                      {/* Goal */}
                      <div className="mt-3 text-xs leading-relaxed text-muted">
                        <span className="font-semibold text-zinc-700">Goal:</span> {project.clientGoal}
                      </div>

                      {/* What we created */}
                      <div className="mt-2 text-xs leading-relaxed text-muted">
                        <span className="font-semibold text-zinc-700">What we created:</span> {project.whatWeCreated || 'Interactive 3D tour model.'}
                      </div>
                      
                      {/* Note: Result line omitted until verified data exists per spec §6.7 build note */}
                    </div>

                    {/* Link */}
                    <div className="mt-6 pt-4 border-t border-zinc-200/80 flex items-center justify-between text-xs font-medium text-zinc-700">
                      <span className="text-accent font-semibold group-hover:underline">
                        Read the story →
                      </span>
                      <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </section>

            {/* 4. PROOF STRIP — hidden until filled per spec §6.7 */}

            {/* 5. MORE ON REQUEST */}
            <div className="mb-14 rounded-lg border border-zinc-200 bg-zinc-50/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                  Private Archives &amp; Enterprise NDA
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  Some of our work is private to our clients. Ask us and we'll share relevant examples for your project.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/contact/')}
                className="self-start sm:self-center px-4 py-2 text-xs font-mono font-medium rounded border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 transition-colors shrink-0"
              >
                Request examples →
              </button>
            </div>

            {/* 6. CTA BAND */}
            <section className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-8 sm:p-12 shadow-xs">
              <div className="max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-2">
                  Initiate a Capture
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-display tracking-tight">
                  Your place could be next
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                  Tell us about your place and what you want people to do. We'll show you what's possible and send a clear proposal.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onNavigate('/contact/')}
                    className="loro-btn-primary px-6 py-3 text-xs uppercase tracking-wider"
                  >
                    Plan your experience →
                  </button>
                  <a
                    href={SITE_METADATA.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-xs uppercase tracking-wider font-mono font-medium rounded border border-zinc-300 text-zinc-800 hover:border-zinc-900 hover:bg-white transition-colors inline-flex items-center gap-2"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>

      {/* ==============================================================
         SPLATEMBED 3D MODAL OVERLAY
         ============================================================== */}
      <AnimatePresence>
        {activeModalProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setActiveModalProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl max-h-[90dvh] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-bold text-sm sm:text-base font-display">{activeModalProject.title}</span>
                  <span className="text-xs font-mono text-zinc-400 hidden sm:inline">· {activeModalProject.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-zinc-400 hidden md:inline">ESC to close</span>
                  <button
                    onClick={() => setActiveModalProject(null)}
                    aria-label="Close modal"
                    className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* 3D Canvas Embed */}
              <div className="relative flex-1 min-h-[420px] sm:min-h-[520px] bg-black">
                <SplatEmbed initialDemo={activeModalProject.embedDemoId} autoStart={true} />
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-400 font-mono gap-2">
                <span>{activeModalProject.clientGoal}</span>
                <button
                  onClick={() => {
                    const slug = activeModalProject.slug;
                    setActiveModalProject(null);
                    onNavigate(`/work/${slug}/` as RoutePath);
                  }}
                  className="text-accent hover:text-rose-400 font-semibold"
                >
                  View full case study →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
