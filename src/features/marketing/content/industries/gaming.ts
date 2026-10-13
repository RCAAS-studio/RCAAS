import { Box, Boxes, Cpu, Film, Gamepad2, Landmark, Package, Sparkles, Zap } from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// Approved. The core claims come from the supplied "Game Worlds & Assets" copy (real locations, objects and
// heritage sites captured as Gaussian splats; game-ready environments and props; Unreal, Unity and real-time).
// Everything else is marked [[TBC]]/[[TBI]] until approved. See docs/copy/industries-gaming.md.
export const gaming: IndustryContent = {
  slug: 'gaming',
  name: 'Gaming',
  titleTag: 'Game Worlds & Assets from Real Places | RCAAS',
  metaDescription:
    'Real locations and heritage sites captured as Gaussian splats and turned into game-ready environments and props for Unreal, Unity and real-time scenes.',
  h1: 'Real places. Ready to play.',
  answer:
    'Game worlds feel real when they start from somewhere real. RCAAS Technology captures real locations, objects and heritage sites as Gaussian splats and turns them into game-ready environments and props for Unreal, Unity and real-time experiences.',
  primaryCta: { label: 'Discuss a game project', path: '/contact/?type=gaming' as RoutePath },
  secondaryCta: { label: 'See a real place in 3D', anchor: 'live-example' },
  heroQuestions: ['Can a real place become a game level?', 'Will it run in Unreal or Unity?', 'Can players instantly recognise the place?'],
  challenge: {
    title: 'Start from a real place, not a blank scene.',
    body: 'Recreating a real location by hand is slow, and the result often loses what made the place feel real. Capturing it first gives your artists an accurate, photoreal starting point that can be cleaned, optimised and built into the engine.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'From real capture to game-ready assets.',
    items: [
      {
        what: '3D asset generation',
        how: 'Photoreal 3D assets created from real-world capture, cleaned, optimised and delivered in formats ready for games, simulations and virtual production.',
        icon: Box,
      },
      {
        what: 'Game environments',
        how: 'Interactive worlds built on real captured places, combining Gaussian splatting with game-engine tools to create spaces players instantly recognise.',
        icon: Gamepad2,
      },
      {
        what: 'Props and environments',
        how: 'Real objects and locations captured as Gaussian splats and turned into props and environments. [[TBC: object types and sizes]]',
        icon: Package,
      },
      {
        what: 'Optimised exports [[TBC: formats]]',
        how: 'Assets prepared for real-time use in Unreal and Unity.',
        icon: Cpu,
      },
    ],
    links: [
      { label: 'Game Worlds & Assets', path: '/services/game-worlds-assets/' as RoutePath },
      { label: 'Immersive Experiences', path: '/services/immersive-experiences/' },
      { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Game environments', why: 'Levels and worlds built on real captured places', icon: Gamepad2 },
      { space: 'Props and assets', why: 'Real objects turned into optimised game assets', icon: Boxes },
      { space: 'Simulations', why: 'Realistic locations for simulation work [[TBC]]', icon: Zap },
      { space: 'Virtual production', why: 'Real locations as real-time backdrops', icon: Film },
      { space: 'Heritage in games', why: 'Heritage sites players can recognise and explore', icon: Landmark },
      { space: 'Real-time scenes', why: 'Interactive scenes that run in the engine', icon: Sparkles },
    ],
  },
  liveExample: {
    title: 'See a real place captured as a Gaussian splat',
    // Best available demo until a game or asset project exists.
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: a game-ready asset or environment example; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // Hidden until a game or asset project exists.
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from studios and developers',
    items: [
      {
        question: 'Which game engines do you work with?',
        answer: 'We build for Unreal and Unity, and for other real-time experiences. [[TBC: engine versions and other engines]]',
      },
      {
        question: 'Can you capture heritage sites for a game?',
        answer:
          "Yes, with proper permission from the people who care for the site. We follow each site's rules and capture without touching or disturbing the structure.",
      },
      { question: 'Which file formats do you deliver?', answer: '[[TBC: formats, e.g. engine-ready meshes and textures, splat files]]' },
      { question: 'Who owns the assets?', answer: '[[TBI: ownership and licensing terms for captured assets]]' },
      { question: 'How long does an asset or environment take?', answer: '[[TBI: typical time by scope]]' },
    ],
  },
  cta: {
    title: 'Build your world from a real place',
    body: "Tell us about your game, simulation or production and the place you want to capture. We'll suggest the right capture and send a clear proposal.",
  },
  audienceType: 'Game studios, developers, and simulation and virtual production teams',
  serviceIds: [
    'https://rcaas.tech/services/game-worlds-assets/#service',
    'https://rcaas.tech/services/immersive-experiences/#service',
  ],
};
