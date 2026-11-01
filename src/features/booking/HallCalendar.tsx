'use client';

import { useState } from 'react';
import type { EventSession } from '../../lib/api';
import { hallDayState } from './booking';

/**
 * A month at a glance for a hall (2026-11-01): the website's hall booking and
 * a hall hotspot's card in the tour. Each day says whether the hall is free,
 * half taken (the daytime or the evening) or taken, from the parts of the day
 * held (`heldOn`); a taken day can't be picked. Frosted glass with softly
 * raised days (table-booking.css `.hc`). Dates are YYYY-MM-DD, read as UTC
 * noon so no clock shifts a day.
 */
const at = (d: string) => new Date(`${d}T12:00:00Z`);
const iso = (t: Date) => t.toISOString().slice(0, 10);
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function HallCalendar({ first, last, value, heldOn, onChange, disabled = false }: {
  first: string; last: string; value: string;
  heldOn: (date: string) => EventSession[];
  onChange: (date: string) => void;
  disabled?: boolean;
}) {
  const [month, setMonth] = useState(() => (value || first).slice(0, 7));
  const start = at(`${month}-01`);
  const days = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (start.getUTCDay() + 6) % 7; // Monday first
  const move = (n: number) => setMonth(iso(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + n, 1))).slice(0, 7));
  const title = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className="hc" role="group" aria-label="Pick the day">
      <div className="hc-head">
        <button type="button" className="hc-nav" aria-label="Previous month" disabled={month <= first.slice(0, 7)} onClick={() => move(-1)}>‹</button>
        <b>{title}</b>
        <button type="button" className="hc-nav" aria-label="Next month" disabled={month >= last.slice(0, 7)} onClick={() => move(1)}>›</button>
      </div>
      <div className="hc-grid">
        {WEEK.map((w) => <span key={w} className="hc-wd" aria-hidden>{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} aria-hidden />)}
        {Array.from({ length: days }, (_, i) => {
          const d = `${month}-${String(i + 1).padStart(2, '0')}`;
          const out = d < first || d > last;
          const st = out ? 'out' : hallDayState(heldOn(d));
          const label = `${at(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}: ${
            out ? 'not bookable online' : st === 'full' ? 'taken' : st === 'part' ? 'half taken' : 'free'}`;
          return (
            <button key={d} type="button" className={`hc-day is-${st}${d === value ? ' is-on' : ''}`} aria-label={label} aria-pressed={d === value}
              disabled={disabled || out || st === 'full'} onClick={() => onChange(d)}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <ul className="hc-key" aria-hidden>
        <li><i className="is-free" />Free</li>
        <li><i className="is-part" />Half taken</li>
        <li><i className="is-full" />Taken</li>
      </ul>
    </div>
  );
}
