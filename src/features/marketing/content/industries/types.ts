import type { LucideIcon } from 'lucide-react';
import type { RoutePath } from '../../types';

export interface IndustryLink {
  label: string;
  path: RoutePath;
}

export interface IndustryItem {
  what: string;
  how: string;
  icon: LucideIcon;
}

// A self-contained audience section (challenge, offer and lists), for pages that serve two audiences.
export interface IndustryTrack {
  id: string;
  label: string;
  // Light and dark tracks keep two audiences visually distinct.
  tone: 'light' | 'dark';
  icon: LucideIcon;
  challengeTitle: string;
  challengeBody: string;
  itemsTitle: string;
  items: IndustryItem[];
  lists: { title: string; items: string[] }[];
  links?: IndustryLink[];
}

// An industry page (spec §6.6). Text may contain [[TBI: …]] / [[TBC: …]] placeholders.
// Sections are optional: each industry uses whichever its copy includes.
export interface IndustryContent {
  slug: string;
  name: string;
  // Draft copy awaiting approval: page shows a notice and is marked noindex.
  draft?: boolean;
  titleTag: string;
  metaDescription: string;
  h1: string;
  answer: string;
  primaryCta: IndustryLink;
  secondaryCta: { label: string; anchor: string };
  // Questions taken from the page's challenge text, shown as a visual beside the hero.
  heroQuestions: string[];
  // Paragraphs after the first go in "more"; id and eyebrow default to the generic challenge section.
  challenge?: { id?: string; eyebrow?: string; title: string; body: string; more?: string[] };
  experience?: { eyebrow?: string; title: string; items: IndustryItem[]; links: IndustryLink[] };
  tracks?: IndustryTrack[];
  // Progress over time: dated captures of one site, set beside the documented record of the same work.
  progress?: {
    id: string;
    eyebrow: string;
    title: string;
    intro: string;
    steps: { label: string; line: string; icon: LucideIcon }[];
    documented: { title: string; items: string[] };
    field: { title: string; items: string[] };
    bridge: string;
  };
  // Two audiences served by one capture, shown side by side.
  twoLives?: {
    id: string;
    title: string;
    columns: { title: string; icon: LucideIcon; items: string[] }[];
  };
  oneVisit?: { title: string; body: string; outputs: { label: string; line: string; icon: LucideIcon }[] };
  liveExample: {
    title: string;
    demo: 'chilancho' | 'basera' | 'nepathya' | 'madan';
    embedUrl: string | null;
    pending: string;
    caption: string;
    // Text description of the model, in the page HTML for accessibility and crawlers.
    description?: string;
    // Place the model shows, for the 3DModel contentLocation.
    place?: { type: string; name: string };
  };
  audiences?: { title: string; body: string; capture: string[]; image: string; imageAlt: string; icon: LucideIcon }[];
  // Shown after the live example unless position is 'beforeLive'.
  spaces?: {
    eyebrow?: string;
    position?: 'beforeLive' | 'afterLive';
    title: string;
    items: { space: string; why: string; icon: LucideIcon }[];
  };
  record?: { id: string; title: string; items: string[]; madeWith: string; link: IndustryLink };
  // Plain sections with an optional link list or button. "feature" sections run full width with an image.
  textSections?: {
    id: string;
    eyebrow: string;
    title: string;
    body: string;
    icon: LucideIcon;
    layout: 'feature' | 'card';
    image?: { src: string; alt: string };
    links?: IndustryLink[];
    cta?: IndustryLink;
  }[];
  workTogether?: {
    id: string;
    title: string;
    models: { model: string; description: string; icon: LucideIcon }[];
    note?: string;
    cta: IndustryLink;
  };
  channels?: { title: string; items: { channel: string; how: string; icon: LucideIcon }[] };
  // The section is hidden while there are no cards.
  proof: {
    title: string;
    cards: { name: string; tag: string; line: string; pending?: string; path: RoutePath; image: string }[];
  };
  faq: { title: string; items: { question: string; answer: string }[] };
  cta: { title: string; body: string };
  // Schema: WebPage audience and the services the page is about.
  audienceType: string;
  // Schema.org audience type; defaults to Audience.
  audienceSchemaType?: 'Audience' | 'EducationalAudience';
  serviceIds: string[];
}
