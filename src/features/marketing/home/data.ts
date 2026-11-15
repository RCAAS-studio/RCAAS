import { IMG } from '../data/images';
import { Gamepad2, Handshake, Ruler, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CASE_STUDY_CONTENT } from '../content/work';

export const HOME_CARD_COPY: Record<string, { tag: string; line: string }> = {
  'chilancho-stupa-digital-heritage': {
    tag: 'Heritage',
    line: 'Documented in 3D to preserve its form and detail for study and for the public.',
  },
  'nepathya-school-college-3d-campus-tour': { tag: 'Education', line: 'A campus tour families can take from home.' },
  'madan-ashrit-polytechnic-3d-campus-tour': {
    tag: 'Education',
    line: 'Workshops and labs prospective students can explore for themselves.',
  },
  'basera-boutique-hotel-3d-experience': { tag: 'Hospitality', line: 'A hotel guests can look around before they book.' },
};

export const INDUSTRY_IMAGES: Record<string, { src: string; tall?: boolean }> = {
  'hospitality-tourism': { src: IMG['home/industry-hospitality-tourism'], tall: true },
  education: { src: IMG['home/industry-education'] },
  factories: { src: IMG['home/industry-factories'] },
  'heritage-culture': { src: IMG['home/industry-heritage-culture'], tall: true },
  'government-municipalities': { src: IMG['home/industry-government-municipalities'] },
  gaming: { src: IMG['home/industry-gaming'], tall: true },
  filmmaking: { src: IMG['home/industry-filmmaking'] },
  'real-estate-architecture': { src: IMG['home/industry-real-estate-architecture'] },
  'non-life-insurance': { src: IMG['home/industry-non-life-insurance'] },
  'banking-financial-institutions': { src: IMG['home/industry-banking-financial-institutions'] },
  'nonprofit-international-development': { src: IMG['home/industry-nonprofit-international-development'] },
};

export const CHILANCHO_VIEWER = CASE_STUDY_CONTENT.find((study) => study.embedDemo === 'chilancho')?.embedUrl;

export const WHY_POINTS: { title: string; desc: string; icon: LucideIcon }[] = [
  {
    title: "Precise, because we're engineers.",
    desc: 'Every experience is built on accurate measurement, so what people see is true to the place.',
    icon: Ruler,
  },
  {
    title: "Engaging, because we're game developers.",
    desc: 'We bring the craft of interactive design, so people stay, explore and remember.',
    icon: Gamepad2,
  },
  {
    title: 'Story-first, built to act on.',
    desc: 'Each experience is designed around one goal: the action you want your audience to take.',
    icon: Target,
  },
  {
    title: 'Here for the long term.',
    desc: "A Kathmandu team that knows Nepal's places, conditions and people, and stays with you after launch.",
    icon: Handshake,
  },
];

export const WHY_FADE = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export const PILLAR_VISUALS: Record<string, { image: string; alt: string }> = {
  'immersive-experiences': { image: IMG['home/immersive-experiences'], alt: 'A 3D virtual tour of a real place open on screen' },
  'visual-storytelling': { image: IMG['home/visual-storytelling'], alt: 'A cinematic camera move through a captured place' },
  'digital-twins': { image: IMG['home/digital-twins'], alt: 'A measured point cloud of a building beside its drawings' },
  'game-worlds-assets': { image: IMG['home/game-worlds-assets'], alt: 'A visitor exploring a real heritage courtyard captured in 3D' },
};
