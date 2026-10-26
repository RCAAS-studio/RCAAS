import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Handshake, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { Placeholder } from '../components/Placeholder';
import { linkHandler, pageShellClass } from '../components/GuideParts';
import { buttonClass } from '../components/ui';
import { sendLead } from '../lib/leads';
import { checkContactFields } from '../../../lib/contactRules';

interface ContactPageProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
}

// Field 5 options, and the ?type= values that preselect each one.
export const GOALS: { label: string; types: string[] }[] = [
  { label: 'More bookings or visits', types: ['hospitality', '3d-tour', 'immersive'] },
  { label: 'More applications or enrolments', types: ['education'] },
  { label: 'Sell or lease property', types: ['real-estate'] },
  { label: 'Design or renovation data', types: ['digital-twin', 'laser-scanning', 'factories'] },
  { label: 'Mapping or survey', types: ['drone-mapping', 'government'] },
  { label: 'Preserve heritage', types: ['heritage', 'research'] },
  { label: 'Films or storytelling', types: ['storytelling', 'filmmaking'] },
  { label: 'Risk surveys or claims records', types: ['insurance'] },
  { label: 'Game worlds or assets', types: ['gaming', 'game-assets'] },
  { label: 'Track site progress for a loan or facility', types: ['banking', 'finance'] },
  { label: 'Show a project site to funders or partners', types: ['nonprofit', 'development'] },
  { label: 'Platform early access', types: ['platform'] },
  { label: 'Partnership', types: ['partnership'] },
  { label: 'Something else / a question', types: ['project', 'question'] },
];

const DEFAULT_GOAL = 'Something else / a question';

const goalFromType = (type: string | null) =>
  GOALS.find((goal) => type && goal.types.includes(type))?.label ?? DEFAULT_GOAL;

const PLACE_TYPES = [
  'Hotel or resort',
  'School, college or university',
  'Property',
  'Heritage site or museum',
  'Public space or municipality',
  'Office or venue',
  'Factory or industrial site',
  'Other',
];

const TIMINGS = ['As soon as possible', 'Within 1 month', '1–3 months', 'Just exploring'];

const NEXT_STEPS: { title: string; line: React.ReactNode }[] = [
  {
    title: 'We reply',
    line: (
      <>
        We read your enquiry and reply within{' '}
        {SITE_METADATA.responseTime ?? <Placeholder>[[TBI]]</Placeholder>}, often with a few questions.
      </>
    ),
  },
  { title: 'We talk', line: 'We discuss your goal, your place and your audience, by call or a short site visit.' },
  { title: 'We propose', line: 'We send a clear proposal with scope, timeline and price.' },
];

// Spam protection: a hidden honeypot field plus a minimum time on the form.
const MIN_FILL_MS = 3000;

const track = (event: string, data: Record<string, unknown> = {}) => {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer?.push({ event, ...data });
};

// G11: files the enquiry with the API (lib/leads.ts).
const submitEnquiry = (data: Record<string, string>, renderedAt: number) =>
  sendLead('contact form', renderedAt, {
    name: data.name,
    phone: data.phone,
    email: data.email,
    requirement: data.goal,
    dates: data.timing,
    details: {
      Organisation: data.organisation,
      'Type of place': data.placeType,
      Location: data.location,
      Size: data.size,
      Message: data.message,
    },
  });

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/10 focus:outline-none transition-shadow';
const labelClass = 'block text-xs font-mono text-zinc-700 mb-1.5';

export const ContactPage: React.FC<ContactPageProps> = ({ currentPath, onNavigate }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organisation: '',
    goal: DEFAULT_GOAL,
    placeType: '',
    location: '',
    size: '',
    timing: '',
    message: '',
    website: '', // honeypot
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const startedAt = useRef(Date.now());
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);
  const confirmed = SITE_METADATA.contactConfirmed;

  // Preselect the goal from ?type= (on load, and when arriving from another page's CTA).
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get('type');
    setForm((prev) => ({ ...prev, goal: goalFromType(type) }));
  }, [currentPath]);

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkContactFields(e.currentTarget as HTMLFormElement)) return;
    const isSpam = form.website !== '' || Date.now() - startedAt.current < MIN_FILL_MS;
    setStatus('sending');
    try {
      if (!isSpam) {
        const { website: _honeypot, ...data } = form;
        await submitEnquiry(data, startedAt.current);
        track('form_submit', { goal: form.goal });
      }
      onNavigate('/thank-you/');
    } catch {
      setStatus('error');
    }
  };

  const directRows: { label: string; icon: LucideIcon; value: React.ReactNode; href?: string; event?: string }[] = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      value: confirmed ? SITE_METADATA.whatsapp : <Placeholder>[[TBI: number + wa.me link]]</Placeholder>,
      href: confirmed ? SITE_METADATA.whatsappUrl : undefined,
      event: 'whatsapp_click',
    },
    {
      label: 'Phone',
      icon: Phone,
      value: confirmed ? SITE_METADATA.phone : <Placeholder>[[TBI]]</Placeholder>,
      href: confirmed ? `tel:${SITE_METADATA.phone.replace(/\s+/g, '')}` : undefined,
      event: 'phone_click',
    },
    {
      label: 'Email',
      icon: Mail,
      value: confirmed ? SITE_METADATA.email : <Placeholder>[[TBI]]</Placeholder>,
      href: confirmed ? `mailto:${SITE_METADATA.email}` : undefined,
      event: 'email_click',
    },
    {
      label: 'Office',
      icon: MapPin,
      value: confirmed ? (
        SITE_METADATA.address
      ) : (
        <>
          <Placeholder>[[TBI: full address]]</Placeholder>, Kathmandu, Nepal
        </>
      ),
    },
    {
      label: 'Hours',
      icon: Clock,
      value: SITE_METADATA.officeHours ?? <Placeholder>[[TBI: e.g. Sunday–Friday, 10:00–18:00 NPT]]</Placeholder>,
    },
  ];

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            Contact
          </span>
        </nav>

        {/* 1. INTRO */}
        <section className="max-w-4xl mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-900">Contact</span>
            <span className="text-zinc-400">·</span>
            <span>Kathmandu, Nepal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
          >
            Tell us about your place <span className="text-accent">and your goal.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl"
          >
            Share where your place is, what you'd like to create and what you want people to do after they see it. We'll
            reply with ideas and a clear proposal.
          </motion.p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-20 sm:mb-24">
          {/* 2. FORM (#form) */}
          <motion.section
            id="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            aria-label="Enquiry form"
            className="lg:col-span-7 rounded-2xl border border-line bg-surface p-6 sm:p-9 shadow-sm scroll-mt-24"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <p className="text-xs text-zinc-500">Fields marked with an asterisk (*) are required.</p>

              {/* Goal first */}
              <fieldset>
                <legend className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-accent text-white font-mono text-[11px] font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-bold text-zinc-900 font-display">Your goal</span>
                </legend>
                <p id="c-goal-label" className={labelClass}>
                  What do you want to achieve? *
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-labelledby="c-goal-label">
                  {GOALS.map((goal) => {
                    const selected = form.goal === goal.label;
                    return (
                      <button
                        key={goal.label}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setForm((prev) => ({ ...prev, goal: goal.label }))}
                        className={`text-left rounded-lg border px-3.5 py-2.5 text-sm transition-all ${
                          selected
                            ? 'border-accent bg-white text-zinc-900 font-semibold shadow-[0_4px_14px_-6px_rgba(225,29,72,0.35)]'
                            : 'border-line bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                              selected ? 'border-accent bg-accent shadow-[inset_0_0_0_2px_white]' : 'border-zinc-300'
                            }`}
                            aria-hidden="true"
                          />
                          {goal.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Then the place */}
              <fieldset>
                <legend className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-accent text-white font-mono text-[11px] font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-bold text-zinc-900 font-display">Your place</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="c-place" className={labelClass}>
                      What kind of place is it?
                    </label>
                    <select id="c-place" value={form.placeType} onChange={update('placeType')} className={inputClass}>
                      <option value="">Select one</option>
                      {PLACE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-location" className={labelClass}>
                      Location
                    </label>
                    <input id="c-location" type="text" value={form.location} onChange={update('location')} placeholder="e.g. Lalitpur, Pokhara" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="c-size" className={labelClass}>
                      Approximate size
                    </label>
                    <input id="c-size" type="text" value={form.size} onChange={update('size')} placeholder="e.g. 20 rooms, 2 floors, 1 hectare" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="c-timing" className={labelClass}>
                      When do you need it?
                    </label>
                    <select id="c-timing" value={form.timing} onChange={update('timing')} className={inputClass}>
                      <option value="">Select one</option>
                      {TIMINGS.map((timing) => (
                        <option key={timing} value={timing}>
                          {timing}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* G18: budget field only if confirmed, with ranges in NPR. */}
                  <div>
                    <span className={labelClass}>Budget range</span>
                    <div className="rounded-lg border border-dashed border-amber-300 bg-white px-3 py-2.5">
                      <Placeholder>[[TBC: include? If yes, ranges in NPR]]</Placeholder>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-message" className={labelClass}>
                      Tell us more *
                    </label>
                    <textarea
                      id="c-message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={update('message')}
                      placeholder="What should people feel, see or do?"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Then you */}
              <fieldset>
                <legend className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-accent text-white font-mono text-[11px] font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-bold text-zinc-900 font-display">About you</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c-name" className={labelClass}>
                      Your name *
                    </label>
                    <input id="c-name" type="text" required autoComplete="name" value={form.name} onChange={update('name')} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="c-email" className={labelClass}>
                      Email *
                    </label>
                    <input id="c-email" type="email" required autoComplete="email" value={form.email} onChange={update('email')} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="c-phone" className={labelClass}>
                      Phone or WhatsApp *
                    </label>
                    <input
                      id="c-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      aria-describedby="c-phone-help"
                      className={inputClass}
                    />
                    <p id="c-phone-help" className="mt-1 text-[11px] text-zinc-500">
                      Include country code if outside Nepal.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="c-org" className={labelClass}>
                      Organisation
                    </label>
                    <input id="c-org" type="text" autoComplete="organization" value={form.organisation} onChange={update('organisation')} className={inputClass} />
                  </div>
                </div>
              </fieldset>

              {/* Honeypot: hidden from people, tempting to bots. */}
              <div className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true">
                <label htmlFor="c-website">Website</label>
                <input id="c-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  id="c-consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-zinc-300 accent-accent shrink-0"
                />
                <label htmlFor="c-consent" className="text-xs text-zinc-600 leading-relaxed">
                  I agree to RCAAS Technology contacting me about my enquiry. See our{' '}
                  <a href="/privacy/" onClick={goToLink('/privacy/')} className="text-accent hover:text-accent-strong underline underline-offset-2">
                    Privacy Policy
                  </a>
                  . *
                </label>
              </div>

              {status === 'error' && (
                <div role="alert" className="p-4 rounded-lg bg-rose-50 border border-rose-300 text-sm text-rose-800">
                  We couldn't send your message. Please try again, or email us at{' '}
                  {confirmed ? (
                    <a href={`mailto:${SITE_METADATA.email}`} className="underline underline-offset-2">
                      {SITE_METADATA.email}
                    </a>
                  ) : (
                    <Placeholder>[[TBI: email]]</Placeholder>
                  )}
                  .
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{status === 'sending' ? 'Sending…' : 'Send my enquiry'}</span>
              </button>
            </form>
          </motion.section>

          {/* 3. SIDE PANEL (#direct) */}
          <motion.aside
            id="direct"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            aria-labelledby="direct-heading"
            className="lg:col-span-5 space-y-5 scroll-mt-24"
          >
            <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden lg:sticky lg:top-28">
              <div className="px-6 pt-6 pb-4">
                <h2 id="direct-heading" className="text-2xl font-bold tracking-tight text-ink font-display">
                  Prefer to talk?
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  We reply within {SITE_METADATA.responseTime ?? <Placeholder>[[TBI: response time]]</Placeholder>}.
                </p>
              </div>

              <dl className="divide-y divide-line border-t border-line">
                {directRows.map((row) => {
                  const Icon = row.icon;
                  const content = (
                    <>
                      <span className="w-9 h-9 rounded-lg border border-line bg-surface flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-4 h-4 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{row.label}</dt>
                        <dd className="text-sm text-zinc-900 font-medium wrap-break-word">{row.value}</dd>
                      </span>
                      {row.href && <ArrowRight className="w-4 h-4 text-zinc-300 transition-all group-hover:text-accent group-hover:translate-x-0.5" aria-hidden="true" />}
                    </>
                  );
                  return row.href ? (
                    <a
                      key={row.label}
                      href={row.href}
                      target={row.href.startsWith('http') ? '_blank' : undefined}
                      rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      onClick={() => row.event && track(row.event)}
                      className="group flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={row.label} className="group flex items-center gap-4 px-6 py-4">
                      {content}
                    </div>
                  );
                })}
              </dl>

              {/* Map: static map image linking to Google Maps once the office address is confirmed. */}
              <div className="border-t border-line p-4">
                <a
                  href={SITE_METADATA.mapsUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Map showing the RCAAS Technology office in Kathmandu"
                  className={`relative block aspect-video rounded-xl overflow-hidden border border-line bg-surface-sunken ${
                    SITE_METADATA.mapsUrl ? 'hover:border-zinc-300' : 'pointer-events-none'
                  }`}
                >
                  <svg viewBox="0 0 320 180" className="absolute inset-0 w-full h-full" aria-hidden="true">
                    <defs>
                      <pattern id="map-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <path d="M16 0H0V16" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="320" height="180" fill="url(#map-grid)" />
                    <path d="M-10 120 C60 100 110 140 170 110 S270 60 330 80" fill="none" stroke="#D4D4D8" strokeWidth="10" strokeLinecap="round" />
                    <path d="M120 -10 L150 200" stroke="#D4D4D8" strokeWidth="6" />
                    <path d="M0 40 L320 60" stroke="#E4E4E7" strokeWidth="5" />
                  </svg>
                  <motion.span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin className="w-8 h-8 text-accent fill-accent/20" aria-hidden="true" />
                  </motion.span>
                  {!SITE_METADATA.mapsUrl && (
                    <span className="absolute bottom-2 left-2">
                      <Placeholder>[[TBI: Maps URL]]</Placeholder>
                    </span>
                  )}
                </a>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* 4. WHAT HAPPENS NEXT */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mb-8">What happens next</h2>
          <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
            <span className="hidden md:block absolute left-[16%] right-[16%] top-5 h-px bg-line" aria-hidden="true" />
            {NEXT_STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex md:flex-col md:items-center md:text-center gap-4"
              >
                <span className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-accent flex items-center justify-center font-mono text-sm font-bold text-accent shrink-0">
                  {i + 1}
                </span>
                <div className="rounded-xl border border-line bg-surface p-5 flex-1 w-full">
                  <h3 className="text-sm font-bold text-zinc-900 font-display mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{step.line}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* 5. PARTNERS AND RESEARCHERS */}
        <section className="rounded-2xl border border-line bg-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 shadow-xs">
          <span className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Handshake className="w-5 h-5 text-accent" aria-hidden="true" />
          </span>
          <p className="text-sm text-zinc-700 leading-relaxed flex-1">
            Exploring a partnership, joint venture or research project? Choose "Partnership" above, or{' '}
            <a href="/about/#partner" onClick={goToLink('/about/#partner' as RoutePath)} className="text-accent hover:text-accent-strong font-semibold underline underline-offset-2">
              read how we work with partners →
            </a>
          </p>
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({ ...prev, goal: 'Partnership' }));
              document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-line bg-surface text-xs font-mono font-semibold text-zinc-800 hover:border-accent hover:text-accent transition-colors"
          >
            Choose Partnership
          </button>
        </section>
      </div>
    </div>
  );
};
