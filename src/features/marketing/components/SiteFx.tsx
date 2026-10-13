import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* Site-wide motion in the nav's manner (2026-10-13), without touching each page:
 *  - photos in the page are revealed by a scan line the first time they scroll
 *    into view (this marks them `data-fx-in`; rcaas.css "Site motion" draws it);
 *  - a scroll gauge on the right edge fills with the page's scroll (CSS only);
 *  - on every move between pages a rose scan line sweeps down the screen
 *    (`sweep` changes per page; App passes it).
 * Nothing moves with reduced motion. */

export const SiteFx: React.FC<{ sweep: string; first: boolean }> = ({ sweep, first }) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.querySelector('.rcaas-app main');
    if (!root) return;
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).setAttribute('data-fx-in', '');
          seen.unobserve(e.target);
        }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    const watch = () =>
      root.querySelectorAll<HTMLImageElement>('img:not([data-fx])').forEach((img) => {
        // Already on screen when the page opens: leave it be, the page has its own entrance.
        const r = img.getBoundingClientRect();
        img.setAttribute('data-fx', r.top < window.innerHeight && r.bottom > 0 ? 'seen' : '');
        if (img.getAttribute('data-fx') === '') seen.observe(img);
      });
    watch();
    const grew = new MutationObserver(watch);
    grew.observe(root, { childList: true, subtree: true });
    return () => {
      seen.disconnect();
      grew.disconnect();
    };
  }, []);

  return (
    <>
      <div className="fx-gauge" aria-hidden="true">
        <span />
      </div>
      <AnimatePresence>
        {!first && (
          <motion.span
            key={sweep}
            className="fx-sweep"
            aria-hidden="true"
            initial={{ top: '0%', opacity: 1 }}
            animate={{ top: '100%', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
