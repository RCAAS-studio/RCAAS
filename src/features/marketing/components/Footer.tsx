import React, { useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { BLOG_LAUNCHED } from '../content/blog';
import { withBase } from '../../../lib/basePath';
import { studioHref } from '../../../lib/hosts';
import { emailProblem } from '../../../lib/contactRules';
import { sendLead } from '../lib/leads';

interface FooterProps {
  onNavigate: (path: RoutePath) => void;
  onOpenRegister: () => void;
}

type FooterLink = [label: string, path: RoutePath];

// RCAAS content with the owner's reference: soft survey grid, three navigation
// columns, contact icons and an inset legal bar. Keep navigation usable as links.
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: 'What we create', links: [
    ['Immersive Experiences', '/services/immersive-experiences/'],
    ['3D Virtual Tours', '/services/immersive-experiences/3d-virtual-tours/'],
    ['Visual Storytelling', '/services/visual-storytelling/'],
    ['Digital Twins & Survey', '/services/digital-twins/'],
    ['3D Laser Scanning', '/services/digital-twins/3d-laser-scanning/'],
    ['Drone Mapping', '/services/digital-twins/drone-mapping/'],
    ['Game Worlds & Assets', '/services/game-worlds-assets/']
  ] },
  { title: 'Industries', links: [
    ['Hotels & Tourism', '/industries/hospitality-tourism/'],
    ['Education & Campuses', '/industries/education/'],
    ['Real Estate & Architecture', '/industries/real-estate-architecture/'],
    ['Factories', '/industries/factories/'],
    ['Heritage & Culture', '/industries/heritage-culture/'],
    ['Government & Municipalities', '/industries/government-municipalities/'],
    ['Non-life Insurance', '/industries/non-life-insurance/'],
    ['Gaming', '/industries/gaming/'],
    ['Filmmaking', '/industries/filmmaking/'],
    ['Nonprofit & Development', '/industries/nonprofit-international-development/'],
    ['Banks & Financial Institutions', '/industries/banking-financial-institutions/']
  ] },
  { title: 'Company', links: [
    ['About RCAAS', '/about/'],
    ['How We Work', '/how-we-work/'],
    ['Case Studies & Projects', '/work/'],
    ['Live 3D Tours', '/gallery/'],
    ['Cloud 3D Platform', '/platform/'],
    ['Guides & Articles', '/learn/'],
    ...(BLOG_LAUNCHED ? [['Blog', '/blog/'] as FooterLink] : []),
    ['FAQ', '/faq/'],
    ['Contact & Enquiry', '/contact/']
  ] }
];

const LEGAL: FooterLink[] = [
  ['Privacy policy', '/privacy/'], ['Terms of service', '/terms/'],
  ['Cookies', '/cookies/'], ['Security', '/security/']
];

/** Email only: filed as an enquiry (lib/leads.ts), so it reaches the team's inbox like every other form. */
function SignUp() {
  const renderedAt = useRef(Date.now());
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [problem, setProblem] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wrong = email.trim() ? emailProblem(email) : 'Enter your email address.';
    if (wrong) { setProblem(wrong); return; }
    setProblem('');
    setState('sending');
    try {
      await sendLead('updates sign-up', renderedAt.current, {
        name: 'Updates sign-up', phone: '', email: email.trim(), website: trap,
        details: { Request: 'Email me when RCAAS has news.' }
      });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return <p className="rc-footer-form-message" role="status">Thanks. We’ll write when there’s news.</p>;
  }
  return (
    <form onSubmit={submit} className="rc-footer-form" noValidate aria-busy={state === 'sending'}>
      <div className="rc-footer-input-row">
        <label className="sr-only" htmlFor="footer-email">Email address</label>
        <input
          id="footer-email" type="email" required autoComplete="email" placeholder="Email address…" value={email}
          onChange={(e) => { setEmail(e.target.value); setProblem(''); if (state === 'error') setState('idle'); }}
          aria-invalid={!!problem} aria-describedby={problem ? 'footer-email-problem' : undefined}
          className="rc-footer-email"
        />
        {/* honeypot: people never see it; the API drops a filled one */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" />
        <button type="submit" disabled={state === 'sending'} className="rc-footer-submit">
          {state === 'sending' ? 'Sending…' : 'Sign up'}
          <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
      {problem && <p id="footer-email-problem" className="rc-footer-form-message rc-footer-error" role="alert">{problem}</p>}
      {state === 'error' && <p className="rc-footer-form-message rc-footer-error" role="alert">That didn’t send. Try again, or write to {SITE_METADATA.email}.</p>}
    </form>
  );
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenRegister }) => {
  const contact = SITE_METADATA.contactConfirmed;
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, path: RoutePath) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
  const backToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return (
    <footer className="rc-footer">
      <div className="rc-footer-inner">
        <div className="rc-footer-main">

          {/* Brand, sign-up, contact */}
          <div className="rc-footer-brand">
            <a href={withBase('/')} onClick={(event) => navigate(event, '/')} className="rc-footer-logo" aria-label="RCAAS Technology, home">
              <img src={withBase('/logo.png')} alt="" width="522" height="106" loading="lazy" decoding="async" />
            </a>
            <p className="rc-footer-description">{SITE_METADATA.tagline}</p>
            <p className="rc-footer-location">Reality capture & immersive experiences.<br />{SITE_METADATA.location}</p>
            <h3 className="rc-footer-signup-title">Stay in the loop</h3>
            <p className="rc-footer-signup-copy">
              New work, straight to your inbox. No spam.
            </p>
            <SignUp />
            {contact && (
              <div className="rc-footer-contact">
                <div className="rc-footer-icons">
                <a href={SITE_METADATA.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${SITE_METADATA.whatsapp}`}>
                  <MessageCircle size={17} aria-hidden="true" />
                </a>
                <a href={`mailto:${SITE_METADATA.email}`} aria-label={`Email ${SITE_METADATA.email}`}>
                  <Mail size={17} aria-hidden="true" />
                </a>
                <a href={`tel:${SITE_METADATA.phone.replace(/[^\d+]/g, '')}`} aria-label={`Call ${SITE_METADATA.phone}`}>
                  <Phone size={17} aria-hidden="true" />
                </a>
                </div>
                <a className="rc-footer-contact-email" href={`mailto:${SITE_METADATA.email}`}>{SITE_METADATA.email}</a>
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="rc-footer-columns">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3>{col.title}</h3>
                <ul>
                  {col.links.map(([label, path]) => (
                    <li key={path}>
                      <a href={withBase(path)} onClick={(event) => navigate(event, path)}>
                        {label}
                      </a>
                    </li>
                  ))}
                  {col.title === 'Company' && (
                    <li><a href={studioHref('/login')}>Sign in <ArrowUpRight size={13} aria-hidden="true" /></a></li>
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="rc-footer-divider">
          <span>Namaste <span aria-hidden="true">🙏</span></span>
          <button type="button" onClick={backToTop} aria-label="Back to top"><ArrowUp size={19} aria-hidden="true" /></button>
          <span>Made in Nepal.</span>
        </div>
        <div className="rc-footer-bottom">
          <p>&copy; {new Date().getFullYear()} {SITE_METADATA.displayName}. All rights reserved.</p>
          <nav aria-label="Legal"><ul>{LEGAL.map(([label, path]) => (
            <li key={path}><a href={withBase(path)} onClick={(event) => navigate(event, path)}>{label}</a></li>
          ))}</ul></nav>
            {/* Placeholder register (§13): a review tool, shown only in local development. */}
            {process.env.NODE_ENV !== 'production' && (
              <button onClick={onOpenRegister} className="rc-footer-register" title="Inspect Section 13 Placeholder & Simulation Register">
                Audit register
              </button>
            )}
        </div>
      </div>
    </footer>
  );
};
