import { Box, ClipboardCheck, Drone, FileSearch, GitCompare, Globe, Ruler, ScanLine, Share2, ShieldCheck, Waves } from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// DRAFT copy written from RCAAS's confirmed services (laser scanning, drone mapping, shareable 3D),
// applied to non-life insurance. No approved copy yet: review before publishing (see docs/copy).
// Claims about evidence, regulators or response times are left as placeholders for legal and business review.
export const nonLifeInsurance: IndustryContent = {
  slug: 'non-life-insurance',
  name: 'Non-life Insurance',
  draft: true,
  titleTag: '3D Site Records for Non-life Insurance in Nepal | RCAAS',
  metaDescription:
    'Measured 3D records of insured properties in Nepal for underwriting surveys, risk improvement, claims and loss adjusting, shared from a link.',
  h1: 'See the risk. Document the loss.',
  answer:
    'Underwriters need to understand a property before they cover it, and claims teams need a clear record of what was there before and after a loss. RCAAS Technology creates measured 3D records of buildings, factories and sites across Nepal that insurers, surveyors and loss adjusters can explore and measure from anywhere.',
  primaryCta: { label: 'Discuss a survey', path: '/contact/?type=insurance' as RoutePath },
  secondaryCta: { label: 'See a 3D record', anchor: 'live-example' },
  heroQuestions: [
    'What did the property look like before the loss?',
    'How big is the damaged area?',
    'Can the surveyor see it without travelling?',
  ],
  challenge: {
    title: 'Photos and notes leave room for doubt.',
    body: 'Risk surveys and claims often rely on photographs, sketches and site notes taken from a few angles. When a loss happens, it can be hard to show what a property looked like before, or to measure the extent of damage, especially at remote sites or after floods and earthquakes when access is difficult.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'Records you can measure, share and revisit.',
    items: [
      { what: 'Pre-risk 3D survey', how: 'A measured 3D record of an insured property for underwriting and risk improvement.', icon: ClipboardCheck },
      {
        what: 'Post-loss 3D documentation',
        how: 'Capture damage as it is, so it can be measured and reviewed before the site is cleared.',
        icon: ScanLine,
      },
      {
        what: 'Drone survey of large or hard-to-reach sites',
        how: 'Roofs, warehouses, industrial sites and flood or landslide areas. [[TBC: subject to flight approval]]',
        icon: Drone,
      },
      { what: 'Shareable 3D view', how: 'Underwriters, adjusters and reinsurers explore the same site from a link.', icon: Share2 },
      { what: 'Before-and-after comparison [[TBC]]', how: 'Compare a site captured before and after a loss.', icon: GitCompare },
    ],
    links: [
      { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
      { label: '3D laser scanning', path: '/services/digital-twins/3d-laser-scanning/' },
      { label: 'Drone mapping', path: '/services/digital-twins/drone-mapping/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Underwriting surveys', why: 'Understand a property in full before cover is agreed', icon: FileSearch },
      { space: 'Risk improvement', why: 'Point to specific hazards and agree changes with the insured', icon: ShieldCheck },
      { space: 'Claims documentation', why: 'A measured record of the loss as it was found', icon: Box },
      { space: 'Loss adjusting', why: 'Measure damaged areas and review them remotely', icon: Ruler },
      { space: 'Catastrophe response [[TBC]]', why: 'Aerial records after earthquakes, floods and landslides', icon: Waves },
      { space: 'Reinsurance reporting', why: 'Share the same site record with reinsurers abroad', icon: Globe },
    ],
  },
  liveExample: {
    title: 'See what a 3D record looks like',
    // Best available demo until an insurance survey or claims project exists.
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: insurance survey or claims example; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // Hidden until an insurance project exists.
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from insurers and loss adjusters',
    items: [
      {
        question: 'How soon can you capture a site after a loss?',
        answer: '[[TBI: typical response time and coverage area]]',
      },
      {
        question: 'Can the 3D record support a claim?',
        answer: '[[TBC: legal review — how 3D records can support claims, and how capture date and data integrity are recorded]]',
      },
      {
        question: 'Can several parties view the same record?',
        answer:
          'Yes. A 3D record can be shared from a link, so underwriters, adjusters and reinsurers can review the same site from wherever they are.',
      },
      {
        question: 'How accurate are the measurements?',
        answer: '[[TBI: accuracy and conditions]]. We agree the accuracy your survey or claim needs at the start.',
      },
      { question: 'Who owns the data?', answer: '[[TBI: ownership and confidentiality terms for insurer projects]]' },
    ],
  },
  cta: {
    title: 'Give your underwriters and adjusters the full picture',
    body: "Tell us about the properties you cover or the loss you need to document. We'll recommend the right capture and send a clear proposal.",
  },
  audienceType: 'Non-life insurers, reinsurers, loss adjusters and risk surveyors',
  serviceIds: ['https://rcaas.tech/services/digital-twins/#service'],
};
