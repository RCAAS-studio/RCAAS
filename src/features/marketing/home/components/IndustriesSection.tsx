'use client';

import { useEffect, useMemo, useState } from 'react';
import { srcSetFor } from '../../data/images';
import { motion } from 'framer-motion';
import { RoutePath } from '../../types';
import { INDUSTRIES } from '../../data/siteData';
import { ChevronRight } from 'lucide-react';
import { linkHandler } from '../../components/GuideParts';
import { INDUSTRY_IMAGES } from '../data';
import type { HomePageProps } from '../types';

const COLUMN_QUERIES: [string, number][] = [['(min-width: 1280px)', 5], ['(min-width: 1024px)', 3], ['(min-width: 640px)', 2]];
const readColumnCount = () =>
  typeof window === 'undefined' ? 5 : COLUMN_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ?? 1;
const useColumnCount = () => {
  // Starts at the server's 5 so the first render matches the HTML Next sent; the real count follows.
  const [count, setCount] = useState(5);
  useEffect(() => {
    const lists = COLUMN_QUERIES.map(([query]) => window.matchMedia(query));
    const update = () => setCount(readColumnCount());
    update();
    lists.forEach((list) => list.addEventListener('change', update));
    return () => lists.forEach((list) => list.removeEventListener('change', update));
  }, []);
  return count;
};

export function IndustriesSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {
const industryColumnCount = useColumnCount();
const industryColumns = useMemo(() => {
    // Rough card heights (in column widths) so each card goes to the shortest column.
    const columns = Array.from({ length: industryColumnCount }, () => ({ height: 0, items: [] as { ind: (typeof INDUSTRIES)[number]; i: number }[] }));
    INDUSTRIES.forEach((ind, i) => {
      const image = INDUSTRY_IMAGES[ind.id];
      const height = (image ? (image.tall ? 0.75 : 0.5) : 0) + 0.65 + ind.summary.length / 350;
      const target = columns.reduce((min, col) => (col.height < min.height ? col : min), columns[0]);
      target.items.push({ ind, i });
      target.height += height;
    });
    return columns.map((col) => col.items);
  }, [industryColumnCount]);
return (<section id="industries" className="relative overflow-hidden py-24 sm:py-28 bg-ink">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-soft font-semibold">
              Industry Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-white font-display">
              Built around your goal
            </h2>
            <p className="mt-4 text-base text-zinc-300 leading-relaxed">
              Tell us what you want people to do. We will design the experience around it.
            </p>
          </div>

          {/* Masonry: image cards and text cards of different heights, each placed in the shortest column */}
          <div className="flex items-start gap-4 xl:gap-4">
            {industryColumns.map((column, c) => (
              <div key={c} className="flex min-w-0 flex-1 flex-col gap-4">
            {column.map(({ ind, i }) => {
              const image = INDUSTRY_IMAGES[ind.id];
              return (
                <motion.a
                  key={ind.id}
                  href={ind.link}
                  onClick={linkHandler(onNavigate, ind.link as RoutePath)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] sm:block transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {image && (
                    <div className={`relative w-24 shrink-0 overflow-hidden bg-zinc-200 sm:w-auto ${image.tall ? 'sm:aspect-4/3' : 'sm:aspect-2/1'}`}>
                      <img
                        src={image.src} srcSet={srcSetFor(image.src)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 p-4 sm:p-5">
                    <h3 className="text-lg font-semibold tracking-tight text-ink font-display leading-snug transition-colors group-hover:text-accent-strong">
                      <span className="sr-only">{ind.title}: </span>
                      {ind.goalHeadline}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{ind.summary}</p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <span className="min-w-0 truncate text-[11px] text-zinc-500">
                        For <span className="font-medium text-zinc-700">{ind.whoItsFor}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
                    </div>
                  </div>
                </motion.a>
              );
            })}
              </div>
            ))}
          </div>
        </div>
      </section>);
}
