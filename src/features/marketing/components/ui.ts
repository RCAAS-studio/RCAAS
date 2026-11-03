// Shared design-system class helpers. Use these instead of re-typing button, eyebrow or shell styles.
// Colours come from the theme tokens in index.css (accent, ink, line, surface…).

export type ButtonVariant = 'primary' | 'secondary' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_BASE =
  // the press and lift match the studio, tour and client sites (globals.css "Feel"); none with reduced motion
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[color,background-color,border-color,box-shadow,scale,translate] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:opacity-60 disabled:pointer-events-none';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white shadow-sm hover:bg-accent-strong',
  secondary: 'border border-line bg-white text-zinc-900 shadow-xs hover:bg-zinc-50 hover:border-line-hover',
  dark: 'bg-zinc-900 text-white shadow-sm hover:bg-accent',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3.5 text-sm',
  lg: 'px-8 py-4 text-sm',
};

// e.g. className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}
export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') =>
  [BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], extra].filter(Boolean).join(' ');

// Small label above a heading.
export const eyebrowClass = 'text-xs font-mono uppercase tracking-wider text-accent font-semibold';

// Outer wrapper for content pages.
export const pageShellClass = 'py-14 sm:py-20 md:py-24 bg-white text-ink relative';

// Radius scale: controls (buttons, inputs, small tags) rounded-lg · cards rounded-xl ·
// large panels and bands rounded-2xl · pills and dots rounded-full.

// Heading scale: section titles and closing-band titles. H1s use text-4xl sm:text-5xl lg:text-6xl.
export const headingSize = {
  section: 'text-2xl sm:text-3xl md:text-4xl',
  band: 'text-3xl sm:text-4xl',
};
