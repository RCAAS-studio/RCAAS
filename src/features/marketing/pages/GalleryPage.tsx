import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Footprints, Globe } from 'lucide-react';
import { RoutePath } from '../types';
import { pageShellClass } from '../components/ui';
import { API_BASE_URL, getGallery, withoutNightVersions, type GalleryItem } from '../../../lib/api';

/* /gallery/: every space published from the studio (GET /api/gallery), then
 * the clients' own websites with a tour inside (GET /api/sites). Links are
 * plain <a>: the tour and /s/ sites are their own pages with their own looks. */

type ClientSite = { id: string; title: string; line: string };

interface GalleryPageProps {
  onNavigate: (path: RoutePath) => void;
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

async function clientSites(): Promise<ClientSite[]> {
  const res = await fetch(`${API_BASE_URL}/api/sites`);
  return res.ok ? res.json() : [];
}

const Card: React.FC<{ href: string; pic: string | null | undefined; title: string; line?: string | null; meta: string; cta: string; icon: React.ReactNode }> = ({
  href,
  pic,
  title,
  line,
  meta,
  cta,
  icon,
}) => (
  <a
    href={href}
    className="group relative block rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 text-white shadow-xs transition-all hover:border-zinc-400"
  >
    <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-900">
      {pic ? (
        <img
          loading="lazy"
          decoding="async"
          src={`${API_BASE_URL}${pic}`}
          alt=""
          className="h-full w-full object-cover object-center opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl font-bold font-display text-zinc-700">
          {title.trim()[0]}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute top-4 right-4 text-xs font-mono">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/90 text-white text-[10px] uppercase font-semibold">
          {icon}
          {cta}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-1">{title}</h3>
        {line && <p className="text-sm text-zinc-300 line-clamp-2">{line}</p>}
        <p className="mt-2 text-[11px] font-mono text-zinc-400">{meta}</p>
      </div>
      <ArrowUpRight className="absolute top-4 left-4 w-5 h-5 text-white/70 transition-colors group-hover:text-white" aria-hidden="true" />
    </div>
  </a>
);

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<GalleryItem[] | null | 'error'>(null);
  const [sites, setSites] = useState<ClientSite[]>([]);

  useEffect(() => {
    getGallery()
      .then((list) => setItems(withoutNightVersions(list ?? [])))
      .catch(() => setItems('error'));
    clientSites().then(setSites).catch(() => setSites([]));
  }, []);

  const tours = Array.isArray(items) ? items : [];

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8 sm:mb-12">
          <button onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400">›</span>
          <span className="text-zinc-900 font-semibold">Live tours</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-12 sm:mb-14"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-2">Live tours</span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display">
            Rooms you can walk into right now
          </h1>
          <p className="mt-4 text-base sm:text-xl text-muted leading-relaxed">
            Every space here is a live 3D tour, published from our studio. Pick one and walk in. Nothing to install.
          </p>
          {tours.length > 0 && (
            <p className="mt-6 text-xs font-mono text-zinc-500">
              {tours.length} {tours.length === 1 ? 'space' : 'spaces'} open now
            </p>
          )}
        </motion.div>

        <section aria-label="Published tours" className="mb-20">
          {items === null && <p className="text-sm text-muted">Loading the tours…</p>}
          {items === 'error' && (
            <p className="text-sm text-muted">The tours can&apos;t reach the tour server right now. Try again in a moment.</p>
          )}
          {Array.isArray(items) && items.length === 0 && (
            <p className="text-sm text-muted">
              Nothing is published yet. Open a space in the{' '}
              <a href="/studio" className="underline underline-offset-2 hover:text-ink">
                studio
              </a>{' '}
              and choose Publish.
            </p>
          )}
          {tours.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {tours.map((g) => (
                <Card
                  key={g.id}
                  href={`/tour?space=${encodeURIComponent(g.id)}`}
                  pic={g.thumb}
                  title={g.title}
                  line={g.tagline}
                  meta={`${g.trackCount} ${g.trackCount === 1 ? 'guided view' : 'guided views'} · published ${dateFmt.format(new Date(g.publishedAt))}`}
                  cta="Walk in"
                  icon={<Footprints className="w-3 h-3" aria-hidden="true" />}
                />
              ))}
            </div>
          )}
        </section>

        {sites.length > 0 && (
          <section aria-labelledby="gallery-sites" className="mb-20">
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-1">Websites</span>
              <h2 id="gallery-sites" className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-display">
                Their own websites
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Some places get a whole website from us: the tour inside it, and booking and enquiries beside it.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {sites.map((s) => (
                <Card
                  key={s.id}
                  href={`/s/${encodeURIComponent(s.id)}`}
                  pic={tours.find((g) => g.propertyId === s.id && g.thumb)?.thumb}
                  title={s.title}
                  line={s.line && s.line !== s.title ? s.line : null}
                  meta={`rcaas.tech/s/${s.id}`}
                  cta="Open the website"
                  icon={<Globe className="w-3 h-3" aria-hidden="true" />}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
