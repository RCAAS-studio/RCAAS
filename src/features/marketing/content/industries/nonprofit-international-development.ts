import { Box, Drone, Film, Globe2, HandHeart, Landmark, Map, Megaphone, School } from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// No approved source copy exists for this industry. It is written only from RCAAS's confirmed services
// (3D tours, VR, films and storytelling, laser scanning, drone mapping, measured digital twins) and the
// approved "attract funding and engage the public" goal from docs/copy/services.md. Everything else is
// [[TBC]]/[[TBI]]. See docs/copy/industries-nonprofit-international-development.md.
export const nonprofitInternationalDevelopment: IndustryContent = {
  slug: 'nonprofit-international-development',
  name: 'Nonprofit & International Development',
  titleTag: '3D Project Sites for Nonprofits & Development | RCAAS',
  metaDescription:
    'Show funders and partners your project sites in 3D, keep measured records of places before and after your work, and tell the story from a link.',
  h1: 'Show the place. Share the impact.',
  answer:
    'Nonprofits and development organisations use RCAAS Technology to bring project sites to people who cannot visit them. We capture schools, clinics, heritage sites and communities in 3D, create tours and films funders can open from a link, and keep measured records of a place before and after the work.',
  primaryCta: { label: 'Discuss a project', path: '/contact/?type=nonprofit' as RoutePath },
  secondaryCta: { label: 'See a real place in 3D', anchor: 'live-example' },
  heroQuestions: [
    'Can our funders see the site without travelling?',
    'How do we show what changed?',
    'Can partners abroad explore the project?',
  ],
  challenge: {
    title: 'The people who fund the work rarely see it.',
    body: 'Donors, boards and partners are often far from the places their support reaches. Photos and reports show part of the picture. A 3D capture lets them move through the site themselves, and gives your team a lasting record of how the place looked.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'From a site visit to a story people can step into.',
    items: [
      {
        what: '3D tours of project sites',
        how: 'Schools, clinics, community spaces and heritage sites that funders and partners can explore from a link, on any device.',
        icon: Box,
      },
      {
        what: 'Films and guided stories',
        how: 'Fly-through films and narrated tours made from the capture, shaped around the story you want to tell.',
        icon: Film,
      },
      {
        what: 'Before-and-after records',
        how: 'Measured 3D records of a place at the start of a project and again later, so change can be shown, not only described. [[TBC: confirm repeat-capture offer]]',
        icon: Map,
      },
      {
        what: 'Aerial mapping',
        how: 'Drone mapping of wider areas, such as a village, a site boundary or a reconstruction zone. [[TBC: permit and area limits]]',
        icon: Drone,
      },
    ],
    links: [
      { label: 'Visual Storytelling', path: '/services/visual-storytelling/' },
      { label: 'Immersive Experiences', path: '/services/immersive-experiences/' },
      { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Donor and funder reports', why: 'A site supporters can explore for themselves', icon: HandHeart },
      { space: 'Fundraising campaigns', why: 'Films and tours that show the place behind the appeal', icon: Megaphone },
      { space: 'Schools and community buildings', why: 'Spaces shown as they are, inside and out', icon: School },
      { space: 'Heritage and reconstruction', why: 'Measured records of sites before and after work', icon: Landmark },
      { space: 'Partners abroad', why: 'One link that works for teams in any country', icon: Globe2 },
      { space: 'Site planning', why: 'Accurate 3D data to plan works from', icon: Map },
    ],
  },
  liveExample: {
    title: 'See a real place captured in 3D',
    // Best available demo until a nonprofit or development project exists.
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: a nonprofit or development project example; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // Hidden until a nonprofit or development project exists.
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from nonprofits and development teams',
    items: [
      {
        question: 'Can funders view the site without special software?',
        answer: 'Yes. The 3D tour opens from a link in a web browser, on a phone, tablet or computer.',
      },
      {
        question: 'Can you capture community spaces and heritage sites?',
        answer:
          "Yes, with permission from the people who own or care for the place. We follow each site's rules and capture without touching or disturbing it.",
      },
      { question: 'Can you capture the same site again later?', answer: '[[TBC: repeat-capture offer and how change is shown]]' },
      { question: 'Do you offer nonprofit pricing?', answer: '[[TBC: whether a nonprofit rate exists]]' },
      { question: 'Where can you work?', answer: '[[TBC: areas covered in Nepal and abroad, and travel arrangements]]' },
    ],
  },
  cta: {
    title: 'Bring your project site to the people who support it',
    body: "Tell us about your organisation, the place and who you need to reach. We'll suggest the right approach and send a clear proposal.",
  },
  audienceType: 'Nonprofits, NGOs, international development agencies and donor-funded programmes',
  serviceIds: [
    'https://rcaas.tech/services/visual-storytelling/#service',
    'https://rcaas.tech/services/immersive-experiences/#service',
    'https://rcaas.tech/services/digital-twins/#service',
  ],
};
