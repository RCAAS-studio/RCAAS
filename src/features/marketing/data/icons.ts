import {
  Banknote,
  Building2,
  Clapperboard,
  Compass,
  Factory,
  Film,
  Gamepad2,
  GraduationCap,
  HandHeart,
  Hotel,
  House,
  Landmark,
  ShieldCheck,
  View,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// One icon per industry, shared by the homepage cards and the navigation menu.
export const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  'hospitality-tourism': Hotel,
  education: GraduationCap,
  'real-estate-architecture': House,
  factories: Factory,
  'heritage-culture': Landmark,
  'government-municipalities': Building2,
  'non-life-insurance': ShieldCheck,
  gaming: Gamepad2,
  filmmaking: Clapperboard,
  'nonprofit-international-development': HandHeart,
  'banking-financial-institutions': Banknote,
};

// One icon per pillar, keyed by PILLARS[].iconName.
export const PILLAR_ICONS: Record<string, LucideIcon> = { View, Film, Compass, Gamepad2 };

export const industryIcon = (id: string): LucideIcon => INDUSTRY_ICONS[id] ?? Building2;
