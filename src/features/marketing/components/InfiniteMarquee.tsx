import React from 'react';

interface InfiniteMarqueeProps {
  items?: string[];
  className?: string;
}

// What we capture and what we make. Facts only: no specs, accuracy figures or performance claims.
const DEFAULT_MARQUEE_ITEMS = [
  'Hotels and resorts',
  'Schools and campuses',
  'Heritage sites',
  'Property and architecture',
  'Factories',
  '3D virtual tours',
  'VR and AR',
  'Fly-through films',
  'Measured digital twins',
  'Game-ready assets',
];

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  items = DEFAULT_MARQUEE_ITEMS,
  className = '',
}) => {
  return (
    <div className={`relative w-full overflow-hidden border-y border-line bg-surface py-3.5 ${className}`}>
      
      {/* Side Vignettes */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-surface to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-surface to-transparent z-10" />

      {/* Infinite Scrolling Track */}
      <div className="animate-loro-marquee flex items-center">
        {[...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-5 px-5 shrink-0">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted hover:text-ink transition-colors">
              {text}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
        ))}
      </div>
    </div>
  );
};
