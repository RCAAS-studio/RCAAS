import React from 'react';
import { Ban, Bug, Cookie, Database, Eraser, Globe, KeyRound, Lock, Mail, RefreshCw, Server, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { RoutePath } from '../types';
import { LegalLayout, LegalSection, legalBodyClass } from '../components/LegalLayout';
import type { LegalSectionMeta } from '../components/LegalLayout';

/* /cookies/ and /security/: the Cookie and Security policies of the earlier
 * rcaas.tech site (written to match what the studio and API do), in this
 * site's legal layout. Words unchanged from that site. */

interface PolicyPageProps {
  onNavigate: (path: RoutePath) => void;
}

const LAST_UPDATED = '4 October 2026';

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className={`${legalBodyClass} space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-accent-strong [&_a]:underline [&_a]:underline-offset-2`}
  >
    {children}
  </div>
);

const CONTACT = (
  <p>
    GeoNova Solutions Pvt. Ltd., Kageshwari-Manohara, Kathmandu, Nepal. Email{' '}
    <a href="mailto:info@geonova.com.np">info@geonova.com.np</a> or call <a href="tel:+9779846789573">+977 984 678 9573</a>.
  </p>
);

const COOKIE_SECTIONS: LegalSectionMeta[] = [
  { id: 'in-short', title: 'In short', icon: Cookie },
  { id: 'the-one-cookie', title: 'The one cookie', icon: KeyRound },
  { id: 'browser-settings', title: 'Settings kept in your browser', icon: Database },
  { id: 'other-companies', title: 'Other companies', icon: Globe },
  { id: 'clearing', title: 'Clearing them', icon: Eraser },
  { id: 'changes', title: 'Changes', icon: RefreshCw },
  { id: 'contact', title: 'Contact', icon: Mail },
];

export const CookiesPage: React.FC<PolicyPageProps> = ({ onNavigate }) => (
  <LegalLayout
    title="Cookie Policy"
    onNavigate={onNavigate}
    draft={false}
    lastUpdated={LAST_UPDATED}
    glanceLabel="This policy at a glance"
    glance={[
      { label: 'One cookie, only to sign in', icon: KeyRound },
      { label: 'No tracking cookies', icon: Ban },
      { label: 'No advertising', icon: ShieldCheck },
      { label: 'No banner needed', icon: Cookie },
    ]}
    sections={COOKIE_SECTIONS}
  >
    <LegalSection section={COOKIE_SECTIONS[0]} number={1}>
      <Body>
        <p>
          Visitors to our tours and websites get no cookies from us: no tracking, no analytics and no advertising cookies. We set
          one cookie, and only when someone signs in to the studio. Because nothing else is set, there is no cookie banner to
          accept.
        </p>
      </Body>
    </LegalSection>
    <LegalSection section={COOKIE_SECTIONS[1]} number={2}>
      <Body>
        <ul>
          <li>
            <b>splatspace_session</b>: keeps a team member or client signed in to the studio. It is set when you sign in, lasts
            12 hours, cannot be read by page scripts, and is sent only to our own site. It is strictly necessary: without it,
            signing in would not work.
          </li>
        </ul>
      </Body>
    </LegalSection>
    <LegalSection section={COOKIE_SECTIONS[2]} number={3}>
      <Body>
        <p>
          To remember your choices between visits, the site keeps a few settings in your browser&apos;s local storage. They
          stay on your device, are never sent to us, and identify no one:
        </p>
        <ul>
          <li>The tour&apos;s language (English, नेपाली or 中文), whether its sound is on, and whether high definition is on.</li>
          <li>The picture quality your device handles well, so the tour does not have to measure it again.</li>
          <li>Light or dark theme.</li>
          <li>In the studio: the project you last opened. On a website review link: the name you comment under.</li>
        </ul>
      </Body>
    </LegalSection>
    <LegalSection section={COOKIE_SECTIONS[3]} number={4}>
      <Body>
        <p>
          A client&apos;s website can show where they are on a Google map. The map loads only when you press <b>Show map</b>,
          and from then on Google&apos;s own cookies and{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noreferrer">
            cookie policy
          </a>{' '}
          apply to it. Until you press it, nothing is loaded from Google.
        </p>
        <p>
          Links to WhatsApp, Facebook, Instagram or a hotel&apos;s own booking page take you to those sites, which have their
          own policies.
        </p>
      </Body>
    </LegalSection>
    <LegalSection section={COOKIE_SECTIONS[4]} number={5}>
      <Body>
        <p>
          You can delete the cookie and the stored settings at any time in your browser&apos;s settings, under site data for
          this website. Signing out of the studio also removes the cookie. The site keeps working; it just forgets your
          choices.
        </p>
      </Body>
    </LegalSection>
    <LegalSection section={COOKIE_SECTIONS[5]} number={6}>
      <Body>
        <p>If we ever add a cookie that is not strictly necessary, we will list it here and ask before setting it.</p>
      </Body>
    </LegalSection>
    <LegalSection section={COOKIE_SECTIONS[6]} number={7}>
      <Body>{CONTACT}</Body>
    </LegalSection>
  </LegalLayout>
);

const SECURITY_SECTIONS: LegalSectionMeta[] = [
  { id: 'accounts', title: 'Accounts and sign-in', icon: KeyRound },
  { id: 'who-sees-what', title: 'Who can see what', icon: Users },
  { id: 'data', title: 'Data and infrastructure', icon: Server },
  { id: 'if-something-goes-wrong', title: 'If something goes wrong', icon: ShieldAlert },
  { id: 'reporting', title: 'Reporting a security problem', icon: Bug },
  { id: 'contact', title: 'Contact', icon: Mail },
];

export const SecurityPage: React.FC<PolicyPageProps> = ({ onNavigate }) => (
  <LegalLayout
    title="Security Policy"
    onNavigate={onNavigate}
    draft={false}
    lastUpdated={LAST_UPDATED}
    glanceLabel="This policy at a glance"
    glance={[
      { label: 'Passwords hashed, never readable', icon: Lock },
      { label: 'Each project private to its team', icon: Users },
      { label: 'Visitors see only published tours', icon: ShieldCheck },
      { label: 'Report a problem, safely', icon: Bug },
    ]}
    sections={SECURITY_SECTIONS}
  >
    <LegalSection section={SECURITY_SECTIONS[0]} number={1}>
      <Body>
        <ul>
          <li>Passwords are stored only as a salted scrypt hash. Nobody, including our team, can read them.</li>
          <li>
            Creating a team account needs a team access code. Clients&apos; staff join only by an invitation from the
            project&apos;s owner.
          </li>
          <li>
            Sessions last 12 hours in a cookie that page scripts cannot read. Changing or resetting a password signs that account
            out everywhere.
          </li>
          <li>Password reset links work once, for 24 hours. Repeated sign-in attempts from one connection are slowed down.</li>
        </ul>
      </Body>
    </LegalSection>
    <LegalSection section={SECURITY_SECTIONS[1]} number={2}>
      <Body>
        <ul>
          <li>
            Each client project is visible only to its owner and the people they add. Being an administrator does not show
            anyone else&apos;s projects.
          </li>
          <li>Clients&apos; staff accounts can answer their own project&apos;s enquiries and bookings and nothing else.</li>
          <li>Visitors only ever see published versions. Work in progress in the studio never changes a live tour.</li>
          <li>A tour embedded on another website can be limited to the sites its owner allows.</li>
        </ul>
      </Body>
    </LegalSection>
    <LegalSection section={SECURITY_SECTIONS[2]} number={3}>
      <Body>
        <ul>
          <li>Connections to our service are encrypted (HTTPS).</li>
          <li>
            Our database is reachable only by our own server. It is not exposed to the public internet API, and every table has
            row-level security switched on.
          </li>
          <li>Keys for email, text messages and other services are kept on the server, never in the browser.</li>
          <li>Visit statistics are totals only. We do not store visitors&apos; IP addresses.</li>
          <li>We do not take card payments, so we hold no card details.</li>
        </ul>
      </Body>
    </LegalSection>
    <LegalSection section={SECURITY_SECTIONS[3]} number={4}>
      <Body>
        <p>
          If we learn that someone got into information they should not have, we will tell the affected clients without undue
          delay, explain what happened and what we are doing about it, and inform the authorities where Nepal&apos;s law
          requires it.
        </p>
      </Body>
    </LegalSection>
    <LegalSection section={SECURITY_SECTIONS[4]} number={5}>
      <Body>
        <p>
          If you find a weakness in RCAAS.tech, email{' '}
          <a href="mailto:info@geonova.com.np?subject=Security%20report">info@geonova.com.np</a> with &quot;Security
          report&quot; in the subject. Tell us what you found and how to see it. We will reply within 5 working days and keep you
          told of the fix.
        </p>
        <p>
          Please test only against your own account, do not read or change other people&apos;s information, and give us a
          reasonable time to fix a problem before telling anyone else. We will not take action against anyone who reports in
          good faith this way.
        </p>
      </Body>
    </LegalSection>
    <LegalSection section={SECURITY_SECTIONS[5]} number={6}>
      <Body>{CONTACT}</Body>
    </LegalSection>
  </LegalLayout>
);
