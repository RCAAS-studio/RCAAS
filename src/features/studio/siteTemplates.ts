/**
 * Starter projects (2026-09-28): what kind of place a new project is, and the
 * website draft it starts with. Only what's safe to leave as is: sections
 * that stay hidden until they're filled in (a menu with no dishes), booking
 * set up but switched off (rooms with no photos or prices yet), and headings
 * that read right for any place of that kind. Nothing here is live until
 * the website is published.
 */
import type { SiteDoc } from '../../lib/api';
import type { ProjectFeatures } from '../../@types/config.types';
import type { PlaceKind } from '../../@types/scene.types';
import type { IconName } from '../../components/ui/Icon';

export type { PlaceKind };

/** `features`: what such a place doesn't use, switched off from the start (it can be turned on from its home). */
type Starter = { site?: Partial<SiteDoc>; features?: Partial<ProjectFeatures> };
interface Template extends Starter {
  kind: PlaceKind;
  label: string;
  icon: IconName;
  /** The places it suits, so the right card is easy to spot. */
  who: string;
  /** A name for the first space, when the export didn't suggest one. */
  firstSpace: string;
}

const room = (id: string, label: string, sleeps: number) =>
  ({ id, label, units: 1, sleeps, price: '', per: '/ night', features: '', image: '', area: '', pin: false, x: 0.5, y: 0.5, space: '', view: '' });
/** Event booking with one hall to fill in, switched off (server/src/events.js). */
const events = (label: string, seated: number, standing: number) => ({
  on: false, days: 365, timezone: 'Asia/Kathmandu', note: '',
  kinds: ['Wedding', 'Reception', 'Birthday', 'Conference', 'Meeting', 'Other'],
  halls: [{ id: 'hall', label, seated, standing, area: '', features: '', image: '', space: '', view: '' }]
});
const tables = (first: string, last: string) =>
  ({ on: false, plan: '', tables: [], first, last, slot: 30, stay: 90, days: 30, maxParty: 8, closed: [], timezone: 'Asia/Kathmandu', note: '' });

export const TEMPLATES: Template[] = [
  {
    kind: 'hotel', label: 'Hotel or resort', firstSpace: 'Lobby',
    icon: 'hotel', who: 'Hotels, resorts, guest houses, homestays',
    site: {
      menu: { title: 'Dining', note: '', items: [] },
      contact: { title: 'Plan your stay', body: 'Ask about dates, rooms, events or anything else. We reply within a day.' },
      stays: {
        on: false, plan: '', checkin: '14:00', checkout: '12:00', days: 180, minNights: 1, maxNights: 14, maxGuests: 10,
        timezone: 'Asia/Kathmandu', note: '',
        rooms: [room('standard', 'Standard Room', 2), room('deluxe', 'Deluxe Room', 2), room('family', 'Family Suite', 4)]
      },
      booking: tables('09:00', '21:30'),
      events: events('Banquet Hall', 150, 250)
    }
  },
  {
    kind: 'restaurant', label: 'Restaurant or café', firstSpace: 'Dining room',
    icon: 'restaurant', who: 'Restaurants, cafés, bars, bakeries',
    site: {
      menu: { title: 'Menu', note: '', items: [] },
      contact: { title: 'Visit us', body: 'Ask about a table, a private dinner or an event.' },
      booking: tables('09:00', '21:30')
    }
  },
  {
    kind: 'venue', label: 'Banquet or event venue', firstSpace: 'Main hall',
    icon: 'event', who: 'Banquet halls, party palaces, wedding and conference venues',
    site: {
      contact: { title: 'Plan your event', body: 'Tell us the date, how many guests and the kind of event, and we’ll send options.' },
      events: events('Main Hall', 300, 500)
    }
  },
  {
    kind: 'college', label: 'College or school', firstSpace: 'Main building',
    icon: 'school', who: 'Schools, colleges, universities, training institutes',
    features: { reservations: false },
    site: { contact: { title: 'Visit the campus', body: 'Ask about admissions, courses or a campus visit.' } }
  },
  {
    kind: 'heritage', label: 'Heritage or cultural site', firstSpace: 'Courtyard',
    icon: 'temple', who: 'Temples, monasteries, museums, palaces, durbar squares',
    features: { reservations: false },
    site: { contact: { title: 'Plan a visit', body: 'Ask about opening times, guided visits or group bookings.' } }
  },
  { kind: 'other', label: 'Something else', firstSpace: 'Reception', icon: 'place', who: 'Offices, shops, homes for sale, anything else' }
];

export const templateFor = (kind: PlaceKind) => TEMPLATES.find((t) => t.kind === kind) ?? TEMPLATES[TEMPLATES.length - 1];

/* --- what a starter sets up, in exact words (the picker, and changing the kind later) --- */
type Parts = {
  stays?: { rooms: { label: string }[]; checkin: string; checkout: string };
  booking?: { first: string; last: string; stay: number; maxParty: number };
  events?: { halls: { label: string; seated: number; standing: number }[] };
  menu?: { title: string };
  contact?: { title: string };
};
/** One line per thing the starter sets up, with its real names and numbers. */
export function starterParts(t: Pick<Template, 'site' | 'features'>): string[] {
  const s = (t.site ?? {}) as Parts;
  const out: string[] = [];
  if (s.stays) out.push(`Room booking: ${s.stays.rooms.map((r) => r.label).join(', ')}, to price and photograph; check-in ${s.stays.checkin}, check-out ${s.stays.checkout}. Off until you switch it on.`);
  if (s.booking) out.push(`Table booking: ${s.booking.first}–${s.booking.last}, ${s.booking.stay}-minute sittings, up to ${s.booking.maxParty} guests a table. Off until you place your tables and switch it on.`);
  if (s.menu) out.push(`A “${s.menu.title}” menu section, hidden until you add dishes.`);
  for (const h of s.events?.halls ?? []) out.push(`Event booking: ${h.label}, ${h.seated} seated or ${h.standing} standing. Off until you switch it on.`);
  if (s.contact) out.push(`An enquiry section headed “${s.contact.title}”.`);
  if (t.features?.reservations === false) out.push('Bookings switched off for this project (switch Bookings on from its home if it takes them).');
  return out;
}

type Have = { stays?: { rooms?: unknown[] }; booking?: { on?: boolean; tables?: unknown[] }; events?: { halls?: unknown[] }; menu?: { title?: string; items?: unknown[] }; contact?: { title?: string; body?: string } };
const SECTION: Record<keyof Have, string> = { stays: 'Room booking', booking: 'Table booking', events: 'Event booking', menu: 'The menu', contact: 'The enquiry section' };
/** Changing an existing project's kind: the new starter's sections its website draft
 *  hasn't got yet (`patch`, to save over the draft), in words (`adds`), and the ones it
 *  has, which are left alone (`keeps`). Never touches what the author filled in. */
export function starterAdds(draft: Partial<SiteDoc>, t: Template) {
  const have = draft as Have;
  const empty: Record<keyof Have, boolean> = {
    stays: !have.stays?.rooms?.length,
    // every draft has table booking (the server fills in these same hours), so it is never re-added: hours an author changed stay
    booking: !have.booking,
    events: !have.events?.halls?.length,
    menu: !have.menu?.items?.length && !have.menu?.title?.trim(),
    contact: !have.contact?.title?.trim() && !have.contact?.body?.trim()
  };
  const patch: Record<string, unknown> = {};
  const keeps: string[] = [];
  for (const [k, v] of Object.entries(t.site ?? {})) {
    if (!(k in empty)) continue;
    if (empty[k as keyof Have]) patch[k] = v;
    else keeps.push(k === 'booking' ? 'Table booking is already set up on the website, so its hours stay as they are.' : `${SECTION[k as keyof Have]} already has your content, so it stays as it is.`);
  }
  return { patch: patch as Partial<SiteDoc>, adds: starterParts({ site: patch as Partial<SiteDoc> }), keeps };
}
