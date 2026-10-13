import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Link2 } from 'lucide-react';

/* One FAQ question, in the nav's manner (2026-10-13). Still a native
 * <details>, so every answer is in the page HTML and works without script;
 * on top of it:
 *  - it rises in as it scrolls into view, staggered, like the home page cards;
 *  - opening and closing animate the height (Web Animations), a scan line
 *    passes down the answer as it opens, and the answer rises in from a blur;
 *  - the open card wears the viewfinder (rose corner brackets), its number
 *    lights, and its + turns into ×;
 *  - each question has an id: a link to /faq/#<id> opens and shows it, and
 *    "Copy link" puts that link on the clipboard;
 *  - it follows the element's own `toggle` event, so Expand all / Collapse
 *    all can simply set `open` on every <details>.
 * Styles: rcaas.css "FAQ" (.faq-*). */

export const faqId = (question: string) =>
  `q-${question
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)}`;

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const still = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const FaqDetails: React.FC<{
  question: string;
  index?: number;
  defaultOpen?: boolean;
  hidden?: boolean;
  children: React.ReactNode;
}> = ({ question, index, defaultOpen = false, hidden = false, children }) => {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const id = faqId(question);

  // Keep in step with the element (Expand all, find-in-page, the hash below).
  useEffect(() => {
    const el = ref.current!;
    const sync = () => setOpen(el.open);
    el.addEventListener('toggle', sync);
    return () => el.removeEventListener('toggle', sync);
  }, []);

  // /faq/#q-… opens that question and brings it into view.
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    const el = ref.current!;
    el.open = true;
    window.setTimeout(() => el.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'center' }), 250);
  }, [id]);

  const onSummary = (e: React.MouseEvent) => {
    const el = ref.current;
    const body = bodyRef.current;
    if (!el || !body || still()) return; // the browser's own toggle
    e.preventDefault();
    const summary = el.querySelector('summary')!;
    const from = el.offsetHeight;
    if (!el.open) {
      el.open = true;
      const to = summary.offsetHeight + body.offsetHeight;
      el.animate({ height: [`${from}px`, `${to}px`] }, { duration: 420, easing: EASE });
    } else {
      const to = summary.offsetHeight;
      const anim = el.animate({ height: [`${from}px`, `${to}px`] }, { duration: 320, easing: EASE });
      anim.onfinish = () => {
        el.open = false;
      };
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.history.replaceState(null, '', `#${id}`);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.details
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: ((index ?? 0) % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      id={id}
      open={defaultOpen}
      className={`faq group scroll-mt-28 ${hidden ? 'hidden' : ''}`}
      data-open={open ? '' : undefined}
    >
      <summary
        onClick={onSummary}
        className="faq-q list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-4 p-5"
      >
        {index !== undefined && (
          <span className="faq-n font-mono text-[11px] tabular-nums" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
        <h3 className="flex-1 text-sm sm:text-base font-semibold text-zinc-900 font-display">{question}</h3>
        <span className="faq-ic" aria-hidden="true">
          <i />
          <i />
        </span>
      </summary>
      <div ref={bodyRef} className="faq-a">
        <span className="faq-scan" aria-hidden="true" />
        <div className="faq-a-in px-5 pb-5 pt-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
          {children}
          <button
            type="button"
            onClick={copyLink}
            className="mt-4 flex w-fit items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 transition-colors hover:text-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </motion.details>
  );
};

/** Expand all / Collapse all, for the <details> inside the element with `scope`'s id. */
export const FaqToggleAll: React.FC<{ scope: string }> = ({ scope }) => {
  const set = (open: boolean) =>
    document.querySelectorAll<HTMLDetailsElement>(`#${scope} details.faq:not(.hidden)`).forEach((d) => {
      d.open = open;
    });
  const btn =
    'inline-flex min-h-9 items-center rounded-lg border border-line bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-zinc-600 transition-colors hover:border-accent hover:text-accent';
  return (
    <div className="flex gap-2">
      <button type="button" className={btn} onClick={() => set(true)}>
        Expand all
      </button>
      <button type="button" className={btn} onClick={() => set(false)}>
        Collapse all
      </button>
    </div>
  );
};
