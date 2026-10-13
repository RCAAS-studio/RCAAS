import type { RoutePath } from '../../types';

// A case study (spec §6.8), following the story template:
// Snapshot → Live experience → Challenge → Story → What we built → Results → Client voice → Gallery → What we used → Next.
// Text may contain [[TBI: …]] / [[TBC: …]] placeholders.
export interface CaseStudyContent {
  slug: string;
  // Breadcrumb label and short name.
  name: string;
  titleTag: string;
  metaDescription: string;
  h1: string;
  heroResult: string;
  industryLabel: string;
  image: string;
  imageAlt: string;
  // Schema.org type and name for the place the project is about.
  placeType: string;
  placeName: string;
  snapshot: { label: string; value: string }[];
  // Launch rule: without a 3D link, location and date the page stays draft.
  embedUrl: string | null;
  location: string | null;
  date: string | null;
  embedDemo: 'chilancho' | 'basera' | 'nepathya' | 'madan';
  embedCaption: string;
  challenge: string;
  story: string;
  built: string;
  received: string;
  // Omitted from the page until real; kept here so the gaps stay visible in review.
  resultsPending: string;
  clientVoicePending: string;
  results?: string;
  clientVoice?: { quote: string; name: string; role: string };
  gallery: string[];
  galleryAlt?: string;
  used: { label: string; path: RoutePath }[];
  usedPending?: string;
  industry: { label: string; path: RoutePath };
  nextSlug: string;
}
