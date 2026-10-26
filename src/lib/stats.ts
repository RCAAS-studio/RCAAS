'use client';

import { useEffect } from 'react';
import { API_BASE_URL, visitSource } from './api';
import { isPublicTour } from '../features/scene/scenes';
import { projected } from '../features/hotspots/hotspotProjector';

/** Visit and time counts for the monthly client report (server/src/stats.js).
 *  sendBeacon with text/plain: it survives the tab closing and needs no preflight. */
type Beacon = { space: string; visit?: true; src?: string; seconds?: number; looked?: Record<string, number>; hotspot?: string; first?: true; intent?: Intent };
function send(body: Beacon) {
  try {
    navigator.sendBeacon(`${API_BASE_URL}/api/stats`, new Blob([JSON.stringify(body)], { type: 'text/plain' }));
  } catch { /* counting must never break the tour */ }
}

/** Public tour only: one visit per space opened (with where the visitor came
 *  from, visitSource), plus the seconds spent in it while the tab was visible and
 *  how long each hotspot sat in the middle of the view ("looked at"): sent on
 *  leaving the space, hiding the tab or closing it. */
export function useVisitBeacon(space: string) {
  useEffect(() => {
    if (!isPublicTour() || !space) return;
    send({ space, visit: true, ...(visitSource() ? { src: visitSource()! } : {}) });
    let since = document.visibilityState === 'visible' ? Date.now() : 0;
    // each second: the hotspots on screen near its middle (the middle half across, 60% down)
    let looked: Record<string, number> = {};
    const tick = setInterval(() => {
      if (!since) return;
      const w = window.innerWidth, h = window.innerHeight;
      for (const m of projected.list) {
        if (m.onScreen && Math.abs(m.x - w / 2) < w / 4 && Math.abs(m.y - h / 2) < h * 0.3) looked[m.id] = (looked[m.id] ?? 0) + 1;
      }
    }, 1000);
    const flush = () => {
      if (!since) return;
      const seconds = Math.round((Date.now() - since) / 1000);
      since = 0;
      const any = Object.keys(looked).length > 0;
      if (seconds > 0) send({ space, seconds, ...(any ? { looked } : {}) });
      looked = {};
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
      else if (!since) since = Date.now();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      flush();
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [space]);
}

/** A booking or enquiry card: 'enquire' (Ask about this space), 'book' (Book now), 'table', 'room'; or 'whatsapp', its chat button;
 *  or 'handoff', on to the hotel's own booking page (not a card: the report keeps it out of the cards' total). */
export type Intent = 'enquire' | 'book' | 'table' | 'room' | 'whatsapp' | 'event' | 'handoff';

// The path to a booking, counted per space visit like the visits themselves:
// the first hotspot opened in a space marks that visit "engaged", and each
// kind of card counts once. Forgotten on leaving the page.
const once = new Set<string>();

/** Public tour only: a hotspot opened (every time, for how much attention each gets). */
export function countHotspot(space: string, hotspot: string) {
  if (!isPublicTour() || !space) return;
  const first = !once.has(`engaged:${space}`);
  once.add(`engaged:${space}`);
  send({ space, hotspot, ...(first ? { first: true as const } : {}) });
}

/** Public tour only: a booking or enquiry card opened, once per space visit. */
export function countIntent(space: string, intent: Intent) {
  if (!isPublicTour() || !space || once.has(`${intent}:${space}`)) return;
  once.add(`${intent}:${space}`);
  send({ space, intent });
}
