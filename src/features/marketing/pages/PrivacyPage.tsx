import React from 'react';
import {
  BarChart3,
  Baby,
  Ban,
  Briefcase,
  Building2,
  CalendarClock,
  Clock,
  Eraser,
  FileSearch,
  FileText,
  Globe,
  Handshake,
  Lock,
  Mail,
  MailX,
  PencilLine,
  RefreshCw,
  Scale,
  ScanLine,
  Share2,
  ShieldCheck,
  User,
  UserX,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { WithPlaceholders } from '../components/Placeholder';
import { LegalLayout, LegalSection, legalBodyClass } from '../components/LegalLayout';
import type { LegalSectionMeta } from '../components/LegalLayout';

interface PrivacyPageProps {
  onNavigate: (path: RoutePath) => void;
}

import { PRIVACY_DRAFT } from '../data/legal';
export { PRIVACY_DRAFT };

// Last updated; null until input.
const LAST_UPDATED: string | null = null;

const confirmed = SITE_METADATA.contactConfirmed;
const EMAIL = confirmed ? SITE_METADATA.email : '[[TBI: email]]';
const PHONE = confirmed ? SITE_METADATA.phone : '[[TBI: phone]]';
const ADDRESS = '[[TBI: address]]';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'who-we-are', title: 'Who we are', icon: Building2 },
  { id: 'what-this-covers', title: 'What this policy covers', icon: FileText },
  { id: 'information-we-collect', title: 'Information we collect', icon: FileSearch },
  { id: 'how-we-use', title: 'How we use information', icon: RefreshCw },
  { id: 'legal-basis', title: 'Legal basis and consent', icon: Scale },
  { id: 'sharing', title: 'Sharing', icon: Share2 },
  { id: 'children', title: 'Children', icon: Baby },
  { id: 'retention', title: 'How long we keep information', icon: Clock },
  { id: 'security', title: 'Security', icon: Lock },
  { id: 'your-rights', title: 'Your rights', icon: ShieldCheck },
  { id: 'changes', title: 'Changes to this policy', icon: CalendarClock },
  { id: 'contact', title: 'Contact', icon: Mail },
];

const COVERS: { text: string; icon: LucideIcon }[] = [
  { text: 'visit our website', icon: Globe },
  { text: 'contact us, request a proposal or join our platform early-access list', icon: Mail },
  { text: 'work with us as a client', icon: Briefcase },
  { text: 'are present in a place we capture for a project', icon: ScanLine },
  { text: 'view a 3D experience hosted on our platform', icon: Globe },
];

const COVERS_NOTE =
  'When we capture or publish a place for a client, the client decides where and how the experience is used, and their own privacy notice may also apply.';

const COLLECT: { lead: string; text: string; icon: LucideIcon }[] = [
  {
    lead: 'Information you give us:',
    text: 'your name, email, phone or WhatsApp number, organisation, and anything you write in our forms or messages.',
    icon: User,
  },
  {
    lead: 'Information collected automatically:',
    text: 'basic technical and usage data such as pages visited, device and browser type, approximate location and referring website, collected through [[TBI: analytics tool]]. [[TBC: whether cookies are used, and which]]',
    icon: BarChart3,
  },
  {
    lead: 'Information in captures:',
    text: '3D scans, photos, video and aerial images of places may incidentally include people, vehicles and number plates, neighbouring properties or personal items. [[TBI: people and faces policy, e.g. "We aim to capture when spaces are quiet, and we remove or blur identifiable people before publishing."]]',
    icon: ScanLine,
  },
  {
    lead: 'Client project information:',
    text: 'site details, drawings and other material you share with us for a project.',
    icon: Briefcase,
  },
];

const SENSITIVE_NOTE =
  "We don't ask for sensitive information, such as health, religion, caste or ethnicity, political views or financial details. Please don't include it in forms or messages.";

const USES = [
  'to reply to your enquiry and prepare proposals',
  'to deliver and support projects',
  'to send updates you asked for, such as platform early-access news',
  'to understand and improve how our website and experiences are used',
  'to meet legal and accounting obligations',
];

const PROVIDERS = [
  { what: 'website hosting', who: '[[TBI]]' },
  { what: 'form handling and email', who: '[[TBI]]' },
  { what: 'analytics', who: '[[TBI]]' },
  { what: '3D platform hosting', who: '[[TBI]]' },
  { what: 'web fonts', who: 'Google Fonts (Google receives your IP address when a page loads)' },
  { what: 'messaging, if you contact us on WhatsApp', who: 'WhatsApp (Meta), under its own terms' },
];

const RETENTION = [
  { what: "enquiries that don't become projects", period: '[[TBI: period]]' },
  { what: 'client and project records', period: '[[TBI: period, including any period required by tax and accounting law]]' },
  { what: 'early-access list', period: 'until you unsubscribe or the list closes' },
  { what: 'analytics data', period: '[[TBI]]' },
];

const RIGHTS: { text: string; icon: LucideIcon }[] = [
  { text: 'tell you what personal information we hold about you', icon: FileSearch },
  { text: 'correct information that is wrong', icon: PencilLine },
  { text: 'delete your information, where we are not required to keep it', icon: Eraser },
  { text: 'stop sending you updates', icon: MailX },
  { text: 'withdraw your consent', icon: Ban },
];

const RIGHTS_PROCESS =
  'To make a request, contact us at the details below. We may ask you to confirm your identity, and we will reply within [[TBI: response period]].';
const RIGHTS_COMPLAINT =
  'If you are not satisfied with our response, you can raise a complaint under the laws of Nepal. [[TBC: legal review — confirm the complaint route]]';

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => (
  <LegalLayout
    title="Privacy Policy"
    onNavigate={onNavigate}
    draft={PRIVACY_DRAFT}
    lastUpdated={LAST_UPDATED}
    glanceLabel="Who this policy covers"
    glance={[
      { label: 'Website visitors', icon: Globe },
      { label: 'Enquiries and sign-ups', icon: Mail },
      { label: 'Clients', icon: Handshake },
      { label: 'People in captures', icon: Users },
    ]}
    sections={SECTIONS}
  >
    {/* 1 */}
    <LegalSection section={SECTIONS[0]} number={1}>
      <p className={legalBodyClass}>
        <WithPlaceholders
          text={`RCAAS Technology Pvt. Ltd. ("RCAAS", "we", "us") is a company registered with the Office of the Company Registrar, Nepal [[TBI: registration number]], with its office at ${ADDRESS}, Kathmandu. We decide how and why the personal information described here is used, and we are responsible for it. For any privacy question, contact [[TBC: name or role of the person responsible for privacy]] at ${EMAIL}.`}
        />
      </p>
    </LegalSection>

    {/* 2 */}
    <LegalSection section={SECTIONS[1]} number={2}>
      <p className={`${legalBodyClass} mb-4`}>This policy explains how we handle personal information when you:</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COVERS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.text} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
              <Icon className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
              <span className="text-sm text-zinc-700 leading-relaxed">{item.text}</span>
            </li>
          );
        })}
      </ul>
      <p className={`${legalBodyClass} mt-4`}>{COVERS_NOTE}</p>
    </LegalSection>

    {/* 3 */}
    <LegalSection section={SECTIONS[2]} number={3}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COLLECT.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.lead} className="rounded-xl border border-line bg-white p-5 shadow-xs">
              <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
              </span>
              <p className="text-sm text-zinc-600 leading-relaxed">
                <strong className="text-zinc-900 font-semibold">{item.lead}</strong> <WithPlaceholders text={item.text} />
              </p>
            </div>
          );
        })}
      </div>
      <p className={`${legalBodyClass} mt-4`}>{SENSITIVE_NOTE}</p>
    </LegalSection>

    {/* 4 */}
    <LegalSection section={SECTIONS[3]} number={4}>
      <p className={`${legalBodyClass} mb-3`}>We use personal information only:</p>
      <ul className="space-y-2 mb-4">
        {USES.map((use) => (
          <li key={use} className={`flex items-start gap-3 ${legalBodyClass}`}>
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
            {use}
          </li>
        ))}
      </ul>
      <p className={`${legalBodyClass} mb-5`}>
        We don't use it for any other purpose unless you agree or the law requires it.
      </p>
      <p className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-900">
        <Ban className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
        We do not sell personal information.
      </p>
    </LegalSection>

    {/* 5 */}
    <LegalSection section={SECTIONS[4]} number={5}>
      <p className={legalBodyClass}>
        <WithPlaceholders text="We handle personal information in line with the Constitution of Nepal (Article 28, right to privacy), the Privacy Act, 2075 (2018), the Privacy Regulations, 2077 (2020) and other applicable laws of Nepal. [[TBC: legal review — confirm these references and whether other laws, such as the Electronic Transactions Act, 2063 (2008), should be named]]" />
      </p>
      <p className={`${legalBodyClass} mt-3`}>
        We collect and use personal information with your consent (for example, when you submit a form), to
        perform a contract with you, or where the law requires it. Where we rely on consent, you can withdraw it at
        any time by contacting us. This does not affect anything we did before you withdrew it.
      </p>
      <p className={`${legalBodyClass} mt-3`}>
        <WithPlaceholders text="Before we capture a place, we agree the timing and arrangements with the client, and the client is responsible for telling staff, guests, students or residents that capture will take place. [[TBC: confirm this is reflected in client contracts]]" />
      </p>
    </LegalSection>

    {/* 6 */}
    <LegalSection section={SECTIONS[5]} number={6}>
      <p className={`${legalBodyClass} mb-4`}>
        We share personal information only with service providers that help us run our business, under appropriate
        safeguards:
      </p>
      <dl className="rounded-xl border border-line divide-y divide-line overflow-hidden mb-4">
        {PROVIDERS.map((provider) => (
          <div key={provider.what} className="grid grid-cols-[1fr_auto] sm:grid-cols-[14rem_1fr] gap-3 px-4 py-3 bg-white">
            <dt className="text-sm text-zinc-700">{provider.what}</dt>
            <dd className="text-sm">
              <WithPlaceholders text={provider.who} />
            </dd>
          </div>
        ))}
      </dl>
      <p className={`${legalBodyClass} mb-2`}>
        <WithPlaceholders text="Some of these providers may store data outside Nepal. [[TBI: where, and safeguards]]" />
      </p>
      <p className={`${legalBodyClass} mb-2`}>
        We may also share information with our professional advisers, such as lawyers and accountants, and we may
        disclose it if required by law.
      </p>
      <p className={legalBodyClass}>
        Our website links to other services, such as LinkedIn, WhatsApp and Google Maps. Their own privacy policies
        apply when you use them.
      </p>
    </LegalSection>

    {/* 7 */}
    <LegalSection section={SECTIONS[6]} number={7}>
      <p className={legalBodyClass}>
        <WithPlaceholders text="Our website is not directed at children, and we don't knowingly collect personal information from children through it. If you think a child has sent us information, contact us and we will delete it." />
      </p>
      <p className={`${legalBodyClass} mt-3`}>
        <WithPlaceholders text="When we capture schools and other places where children may be present, we ask the institution to inform parents or guardians beforehand, and we work with it to [[TBI: e.g. schedule capture outside school hours and remove or blur any identifiable child before publishing]]." />
      </p>
    </LegalSection>

    {/* 8 */}
    <LegalSection section={SECTIONS[7]} number={8}>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RETENTION.map((item) => (
          <div key={item.what} className="rounded-xl border border-line bg-surface p-4">
            <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{item.what}</dt>
            <dd className="mt-1.5 text-sm text-zinc-800 font-medium">
              <WithPlaceholders text={item.period} />
            </dd>
          </div>
        ))}
      </dl>
      <p className={`${legalBodyClass} mt-4`}>After these periods, we delete personal information or anonymise it.</p>
    </LegalSection>

    {/* 9 */}
    <LegalSection section={SECTIONS[8]} number={9}>
      <p className={legalBodyClass}>
        We use reasonable technical and organisational measures to protect personal information, including access
        controls and backups stored in more than one place. No system is completely secure, so we cannot guarantee
        absolute security.
      </p>
      <p className={`${legalBodyClass} mt-3`}>
        If a security incident is likely to affect your personal information, we will take steps to limit the harm
        and tell you, and the authorities where the law requires it.
      </p>
    </LegalSection>

    {/* 10 */}
    <LegalSection section={SECTIONS[9]} number={10}>
      <p className={`${legalBodyClass} mb-4`}>You can ask us to:</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {RIGHTS.map((right) => {
          const Icon = right.icon;
          return (
            <li key={right.text} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-xs">
              <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
              </span>
              <span className="text-sm text-zinc-700 leading-relaxed pt-1">{right.text}</span>
            </li>
          );
        })}
      </ul>
      <p className={`${legalBodyClass} mb-5`}>
        <WithPlaceholders text={RIGHTS_PROCESS} />
      </p>
      <div className="flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/[0.04] p-5">
        <UserX className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-zinc-700 leading-relaxed">
          <WithPlaceholders
            text={`If you appear in one of our published experiences and want to be removed or blurred, contact us at ${EMAIL} and we will [[TBI: response commitment]].`}
          />
        </p>
      </div>
      <p className={`${legalBodyClass} mt-5`}>
        <WithPlaceholders text={RIGHTS_COMPLAINT} />
      </p>
    </LegalSection>

    {/* 11 */}
    <LegalSection section={SECTIONS[10]} number={11}>
      <p className={legalBodyClass}>
        We may update this policy. The "Last updated" date above shows when it last changed. If we make significant
        changes, we will highlight them on this page.
      </p>
    </LegalSection>

    {/* 12 */}
    <LegalSection section={SECTIONS[11]} number={12}>
      <address className="not-italic rounded-xl border border-line bg-surface p-5 text-sm text-zinc-700 leading-relaxed">
        <WithPlaceholders text={`${EMAIL} · ${PHONE} · RCAAS Technology Pvt. Ltd., ${ADDRESS}, Kathmandu, Nepal`} />
      </address>
      <p className={`${legalBodyClass} mt-3`}>
        <WithPlaceholders text="[[TBC: publish a Nepali version of this policy, and state which version applies if they differ]]" />
      </p>
    </LegalSection>
  </LegalLayout>
);
