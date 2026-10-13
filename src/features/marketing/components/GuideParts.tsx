import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { Placeholder } from './Placeholder';
import { FaqDetails } from './FaqDetails';
import { buttonClass, eyebrowClass, pageShellClass } from './ui';

// Shared building blocks for /learn/ guides (spec §6.11 guide template).

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

export const linkHandler = (onNavigate: (path: RoutePath) => void, path: RoutePath) => (e: React.MouseEvent) => {
  e.preventDefault();
  onNavigate(path);
};

export const GuideBreadcrumb: React.FC<{ label: string; onNavigate: (path: RoutePath) => void }> = ({ label, onNavigate }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
    <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
      Home
    </button>
    <span className="text-zinc-400" aria-hidden="true">›</span>
    <button type="button" onClick={() => onNavigate('/learn/')} className="hover:text-zinc-900 transition-colors">
      Learn
    </button>
    <span className="text-zinc-400" aria-hidden="true">›</span>
    <span className="text-accent font-semibold" aria-current="page">
      {label}
    </span>
  </nav>
);

export const GuideHeader: React.FC<{ eyebrow: string; title: string; minutes: number }> = ({ eyebrow, title, minutes }) => (
  <header className="max-w-4xl mb-10">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      <span className="font-semibold text-zinc-900">Guide</span>
      <span className="text-zinc-400">·</span>
      <span>{eyebrow}</span>
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="text-3xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-ink font-display text-balance leading-[1.12]"
    >
      {title}
    </motion.h1>

    {/* L01 author and dates stay as placeholders until input. */}
    <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs font-mono text-zinc-500 pb-6 border-b border-line">
      <span>
        By <Placeholder>[[TBI: author name, role]]</Placeholder>
      </span>
      <span className="text-zinc-400" aria-hidden="true">·</span>
      <span>
        Published <Placeholder>[[TBI]]</Placeholder>
      </span>
      <span className="text-zinc-400" aria-hidden="true">·</span>
      <span>
        Updated <Placeholder>[[TBI]]</Placeholder>
      </span>
      <span className="text-zinc-400" aria-hidden="true">·</span>
      <span>{minutes} min read</span>
    </p>
  </header>
);

export const ShortAnswer: React.FC<{ text: React.ReactNode }> = ({ text }) => (
  <motion.section
    {...fadeUp}
    aria-label="Short answer"
    className="max-w-4xl mb-20 sm:mb-24 rounded-2xl border border-accent/25 bg-accent/[0.04] p-6 sm:p-8"
  >
    <p className="text-xs font-mono uppercase tracking-wider text-accent font-semibold mb-2">Short answer</p>
    <p className="text-base sm:text-lg text-zinc-800 leading-relaxed">{text}</p>
  </motion.section>
);

export const SectionHeading: React.FC<{ eyebrow: string; title: string; className?: string }> = ({
  eyebrow,
  title,
  className = 'max-w-2xl mb-10',
}) => (
  <motion.div {...fadeUp} className={className}>
    <span className={eyebrowClass}>{eyebrow}</span>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 text-balance">
      {title}
    </h2>
  </motion.div>
);

export interface ComparisonColumn {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface ComparisonRow {
  label: string;
  values: Record<string, string>;
}

// Responsive comparison: a table with a column highlighter on desktop, stacked by column on mobile.
// All columns are styled equally until the viewer picks one.
export const ComparisonTable: React.FC<{
  eyebrow: string;
  title: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}> = ({ eyebrow, title, columns, rows }) => {
  const [highlight, setHighlight] = useState<string | null>(null);

  const columnClass = (id: string) =>
    highlight === id ? 'bg-accent/[0.05] text-zinc-900' : highlight ? 'text-zinc-400' : 'text-zinc-700';

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} className="" />

        <div className="hidden md:flex flex-wrap items-center gap-2" role="group" aria-label="Highlight a column">
          <span className="text-xs font-mono text-zinc-500 mr-1">Highlight:</span>
          {columns.map((column) => (
            <button
              key={column.id}
              type="button"
              aria-pressed={highlight === column.id}
              onClick={() => setHighlight(highlight === column.id ? null : column.id)}
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                highlight === column.id
                  ? 'border-accent bg-accent text-white'
                  : 'border-line bg-white text-zinc-700 hover:border-zinc-300'
              }`}
            >
              {column.name}
            </button>
          ))}
        </div>
      </div>

      <motion.div {...fadeUp} className="hidden md:block rounded-xl border border-line overflow-hidden shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-surface border-b border-line">
            <tr>
              <td className="px-5 py-4 w-[22%]" />
              {columns.map((column) => {
                const Icon = column.icon;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    onMouseEnter={() => setHighlight(column.id)}
                    onMouseLeave={() => setHighlight(null)}
                    className={`px-5 py-4 text-sm font-bold font-display transition-colors cursor-default ${columnClass(column.id)}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                      {column.name}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {rows.map((row) => (
              <tr key={row.label} className="align-top">
                <th scope="row" className="px-5 py-4 text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  {row.label}
                </th>
                {columns.map((column) => (
                  <td key={column.id} className={`px-5 py-4 text-sm leading-relaxed transition-colors ${columnClass(column.id)}`}>
                    {row.values[column.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="md:hidden space-y-4">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.id} className="rounded-xl border border-line bg-white overflow-hidden shadow-xs">
              <h3 className="flex items-center gap-2 px-5 py-3.5 bg-surface border-b border-line text-base font-bold text-zinc-900 font-display">
                <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                {column.name}
              </h3>
              <dl className="divide-y divide-line">
                {rows.map((row) => (
                  <div key={row.label} className="px-5 py-3">
                    <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{row.label}</dt>
                    <dd className="mt-0.5 text-sm text-zinc-700">{row.values[column.id]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
};

// L02: required before a guide is published.
export const FromOurProjects: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <section id="from-our-projects" className="mb-20 sm:mb-28 scroll-mt-20">
    <SectionHeading eyebrow="From our projects" title={title} className="max-w-2xl mb-8" />
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 sm:p-8">
      <p className="mb-4">
        <Placeholder>[[TBI — required before publishing. Use real observations from RCAAS projects, for example:]]</Placeholder>
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-amber-900">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-amber-200 bg-white px-3.5 py-2.5">
            {item}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export interface GuideFaqItem {
  question: string;
  answer: React.ReactNode;
  extra?: React.ReactNode;
}

// Site-wide FAQ accordion (FaqDetails): answers stay in the DOM (<details>), so the text is in the
// page HTML (CLAUDE.md); opening animates on top of that.
export const FaqList: React.FC<{ items: GuideFaqItem[]; className?: string; firstOpen?: boolean }> = ({
  items,
  className = '',
  firstOpen = true,
}) => (
  <div className={`space-y-3 ${className}`}>
    {items.map((faq, idx) => (
      <FaqDetails key={faq.question} question={faq.question} index={idx} defaultOpen={firstOpen && idx === 0}>
        {faq.answer}
        {faq.extra}
      </FaqDetails>
    ))}
  </div>
);

export const GuideFaq: React.FC<{ faqs: GuideFaqItem[]; title?: string }> = ({ faqs, title = 'Common questions' }) => (
  <section className="mb-20 sm:mb-28">
    <SectionHeading eyebrow="Answers" title={title} className="max-w-3xl mx-auto mb-10 text-center" />
    <FaqList items={faqs} className="max-w-3xl mx-auto" />
  </section>
);

export const GuideSources: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="max-w-3xl mx-auto mb-20 sm:mb-28 pt-6 border-t border-line">
    <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-3">Sources</h2>
    <div className="space-y-2 text-xs text-zinc-600 leading-relaxed">{children}</div>
  </section>
);

export const GuideCta: React.FC<{
  title: string;
  body: string;
  icons: LucideIcon[];
  children: React.ReactNode;
}> = ({ title, body, icons, children }) => (
  <section className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center relative overflow-hidden">
    <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
      {icons.map((Icon, i) => (
        <span key={i} className="w-10 h-10 rounded-lg border border-line bg-white flex items-center justify-center shadow-xs">
          <Icon className="w-4.5 h-4.5 text-accent" />
        </span>
      ))}
    </div>
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4 text-balance">{title}</h2>
      <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">{body}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">{children}</div>
    </div>
  </section>
);

// Band-sized buttons and the page shell, from the shared design-system helpers.
export const primaryButtonClass = buttonClass('primary', 'lg', 'w-full sm:w-auto');
export const secondaryButtonClass = buttonClass('secondary', 'lg', 'w-full sm:w-auto');
export { pageShellClass };
