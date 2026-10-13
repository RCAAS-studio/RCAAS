import { Banknote, CalendarClock, ClipboardCheck, Drone, FileCheck, GitCompare, HardHat, Layers, ScanLine, TrendingUp } from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// DRAFT copy written from RCAAS's confirmed services (laser scanning, drone mapping, measured digital twins,
// shareable 3D) and the owner's brief: track a site's progress over time, and connect actual progress in the
// field with the documented progress. No approved source copy exists. Claims about lenders' rules, regulators,
// acceptance as evidence and capture frequency are placeholders for legal and business review.
// See docs/copy/industries-banking-financial-institutions.md.
export const bankingFinancialInstitutions: IndustryContent = {
  slug: 'banking-financial-institutions',
  name: 'Banks & Financial Institutions',
  draft: true,
  titleTag: 'Site Progress Evidence for Banks & Lenders in Nepal | RCAAS',
  metaDescription:
    'Dated 3D captures of a financed site, set beside the documented progress, so banks and financial institutions can see how a project is really moving.',
  h1: 'See the progress. Check it against the paper.',
  answer:
    'Banks and financial institutions use RCAAS Technology to follow a financed site over time. We capture the site in 3D on a set of dates, so the progress in the field can be compared with the progress that has been documented, and shared with the credit team from a link.',
  primaryCta: { label: 'Discuss a project', path: '/contact/?type=banking' as RoutePath },
  secondaryCta: { label: 'See how progress is tracked', anchor: 'progress' },
  heroQuestions: [
    'Is the site where the report says it is?',
    'What changed since the last visit?',
    'Can the file show it, not just describe it?',
  ],
  challenge: {
    title: 'Progress reports describe the work. The site shows it.',
    body: 'Lenders fund construction, expansion and equipment they rarely see. Reports, certificates and photographs arrive on paper, and checking each one against the real site means another trip. A dated 3D capture gives the credit team the same site to look at on every review, from the office.',
  },
  progress: {
    id: 'progress',
    eyebrow: 'Progress over time',
    title: 'One site, captured on a set of dates, beside what was documented.',
    intro:
      'We capture the site at the start and again at agreed points as the work moves. Each capture is dated and measured, so the record builds up as a timeline. [[TBC: capture frequency, e.g. by loan milestone or on a fixed schedule]]',
    steps: [
      {
        label: 'Baseline capture',
        line: 'The site before work begins, or as it stands when the facility is approved.',
        icon: ScanLine,
      },
      {
        label: 'Progress captures',
        line: 'The same site again on agreed dates, by laser scan and drone from the same positions.',
        icon: CalendarClock,
      },
      {
        label: 'Side-by-side comparison',
        line: 'Each dated capture set beside the progress that was documented for that date.',
        icon: GitCompare,
      },
      {
        label: 'Evidence file',
        line: 'A dated 3D record, shared from a link, kept with the loan file. [[TBC: storage, retention and who holds the master copy]]',
        icon: FileCheck,
      },
    ],
    documented: {
      title: 'The documented progress',
      items: [
        'Progress and engineer reports',
        'Drawings, schedules and quantities',
        'Photographs and site notes',
        'Claims and certificates for each stage',
      ],
    },
    field: {
      title: 'The actual progress',
      items: [
        'Dated laser and aerial captures of the site',
        'A measured 3D model, to check against the quantities',
        'A 3D tour the credit team can open from a link',
        'The same viewpoints, so one date can be set beside the next',
      ],
    },
    bridge: 'Where the two agree, the file shows it. Where they differ, you can see it early and ask the right question.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'Evidence a credit team can open.',
    items: [
      {
        what: 'Site progress tracking',
        how: 'Repeat 3D captures of a financed site, so progress is followed on a timeline instead of reported once.',
        icon: TrendingUp,
      },
      {
        what: 'Field-to-file comparison',
        how: 'The measured site set beside drawings, quantities and reports, to see where documented and actual progress meet.',
        icon: GitCompare,
      },
      {
        what: 'Construction and project sites',
        how: 'Buildings, plants and developments under way, captured inside and out, with drone coverage of the wider site. [[TBC: site types and sizes]]',
        icon: HardHat,
      },
      {
        what: 'Collateral and asset records',
        how: 'A measured 3D record of a property or asset at the time of lending, and again later. [[TBC: confirm as a delivered service]]',
        icon: Layers,
      },
    ],
    links: [
      { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
      { label: '3D Laser Scanning', path: '/services/digital-twins/3d-laser-scanning/' },
      { label: 'Drone Mapping', path: '/services/digital-twins/drone-mapping/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Construction finance', why: 'Release decisions checked against a dated view of the site', icon: HardHat },
      { space: 'Project and development loans', why: 'Progress followed across the life of the facility', icon: Banknote },
      { space: 'Industrial and plant finance', why: 'Equipment and works seen where they stand', icon: ScanLine },
      { space: 'Property and collateral', why: 'A measured record at lending and again later', icon: Layers },
      { space: 'Remote branches and sites', why: 'One link in place of another trip [[TBC]]', icon: Drone },
      { space: 'Reviews and audits', why: 'The same site, on dates, for anyone who needs to check', icon: ClipboardCheck },
    ],
  },
  liveExample: {
    title: 'See a real place captured in 3D',
    // Best available demo until a banking or progress-tracking project exists.
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: a progress-tracking example with two or more dated captures of one site; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // Hidden until a banking or progress-tracking project exists.
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from banks and financial institutions',
    items: [
      {
        question: 'Can the credit team view the site without visiting?',
        answer: 'Yes. Each capture opens from a link in a web browser, on a phone, tablet or computer.',
      },
      {
        question: 'Does capturing disturb the site or the work?',
        answer: 'No. Laser scanning and drone capture do not touch the structure, and we plan visits around the site team.',
      },
      { question: 'Will the 3D record be accepted as evidence?', answer: '[[TBC: legal and policy review, and which lenders or regulators have accepted it]]' },
      { question: 'How often is the site captured?', answer: '[[TBC: frequency and milestones]]' },
      { question: 'How do you keep the data confidential?', answer: '[[TBC: data handling, access control and agreements for lender clients]]' },
      { question: 'What does it cost?', answer: '[[TBI: pricing by site size and number of visits]]' },
    ],
  },
  cta: {
    title: 'Follow the work, not only the report',
    body: "Tell us about the project, who needs to see the progress and how often. We'll suggest the right schedule of captures and send a clear proposal.",
  },
  audienceType: 'Banks, financial institutions, lenders and credit teams',
  serviceIds: [
    'https://rcaas.tech/services/digital-twins/#service',
    'https://rcaas.tech/services/immersive-experiences/#service',
  ],
};
