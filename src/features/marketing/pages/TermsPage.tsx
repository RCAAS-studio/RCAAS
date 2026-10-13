import React from 'react';
import {
  Ban,
  Box,
  CalendarClock,
  Copyright,
  ExternalLink,
  FileSignature,
  FileText,
  Gavel,
  Globe,
  Info,
  Link2,
  Mail,
  MousePointerClick,
  Scale,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { WithPlaceholders } from '../components/Placeholder';
import { LegalLayout, LegalSection, legalBodyClass } from '../components/LegalLayout';
import type { LegalSectionMeta } from '../components/LegalLayout';
import { linkHandler } from '../components/GuideParts';

interface TermsPageProps {
  onNavigate: (path: RoutePath) => void;
}

// Website terms of use only; project terms live in proposals and client contracts.
import { TERMS_DRAFT } from '../data/legal';
export { TERMS_DRAFT };

// Last updated; null until input.
const LAST_UPDATED: string | null = null;

const EMAIL = SITE_METADATA.contactConfirmed ? SITE_METADATA.email : '[[TBI: email]]';
const ADDRESS = '[[TBI: address]]';
const DOMAIN = '[[TBI: domain]]';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'about-these-terms', title: 'About these terms', icon: FileText },
  { id: 'using-the-website', title: 'Using the website', icon: MousePointerClick },
  { id: 'our-content', title: 'Our content', icon: Copyright },
  { id: 'information', title: 'Information on the website', icon: Info },
  { id: 'accuracy', title: '3D experiences and accuracy', icon: Box },
  { id: 'links', title: 'Links to other websites', icon: ExternalLink },
  { id: 'liability', title: 'Limitation of liability', icon: Scale },
  { id: 'privacy', title: 'Privacy', icon: ShieldCheck },
  { id: 'changes', title: 'Changes', icon: CalendarClock },
  { id: 'governing-law', title: 'Governing law', icon: Gavel },
  { id: 'general', title: 'General', icon: FileSignature },
  { id: 'contact', title: 'Contact', icon: Mail },
];

const MUST_NOT = [
  'copy, download, extract or reproduce 3D models, images, films or text from the website except as allowed below',
  'use bots, scrapers or other automated tools to collect content from the website or the 3D platform [[TBC: and whether our content may be used to train AI models, in line with the robots.txt decision (Register G13)]]',
  'attempt to interfere with the website or the 3D platform, or access them in unauthorised ways',
  'use a 3D experience to plan unauthorised entry to, or harm at, any place shown',
  'remove or change copyright notices or branding',
  'use the website for anything unlawful or misleading',
];

const Bullets: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((item) => (
      <li key={item} className={`flex items-start gap-3 ${legalBodyClass}`}>
        <Ban className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          <WithPlaceholders text={item} />
        </span>
      </li>
    ))}
  </ul>
);

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);

  return (
    <LegalLayout
      title="Terms of Use"
      onNavigate={onNavigate}
      draft={TERMS_DRAFT}
      lastUpdated={LAST_UPDATED}
      glanceLabel="These terms at a glance"
      glance={[
        { label: 'Browse and explore', icon: Globe },
        { label: 'Share links freely', icon: Share2 },
        { label: 'Ask before reusing content', icon: Copyright },
        { label: 'Projects follow your contract', icon: FileSignature },
      ]}
      sections={SECTIONS}
    >
      {/* 1 */}
      <LegalSection section={SECTIONS[0]} number={1}>
        <p className={legalBodyClass}>
          <WithPlaceholders
            text={`These terms apply to your use of ${DOMAIN} (the "website"), operated by RCAAS Technology Pvt. Ltd. ("RCAAS", "we", "us"), ${ADDRESS}, Kathmandu, Nepal. By using the website, you agree to these terms. If you don't agree, please don't use the website.`}
          />
        </p>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
          <FileSignature className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-zinc-700 leading-relaxed">
            These are terms for using the website. If you commission a project from us, your proposal or contract sets
            out its scope, price, ownership and hosting, and it takes priority over these terms if they conflict.
          </p>
        </div>
      </LegalSection>

      {/* 2 */}
      <LegalSection section={SECTIONS[1]} number={2}>
        <p className={`${legalBodyClass} mb-4`}>
          You may browse the website and explore the 3D experiences on it for your own information. You agree not to:
        </p>
        <Bullets items={MUST_NOT} />
      </LegalSection>

      {/* 3 */}
      <LegalSection section={SECTIONS[2]} number={3}>
        <p className={`${legalBodyClass} mb-3`}>
          <WithPlaceholders text="The website, including its text, images, films, 3D models and design, is owned by RCAAS or by our clients and partners, and is protected by the Copyright Act, 2059 (2002) and other intellectual property laws. [[TBC: legal review — confirm reference]] 3D experiences of client places are shown with their permission and remain subject to our agreements with them." />
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900 mb-1">
              <Link2 className="w-4 h-4" aria-hidden="true" />
              You may
            </p>
            <p className="text-sm text-emerald-900/80 leading-relaxed">Share links to pages and experiences on the website.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-1">
              <Mail className="w-4 h-4 text-accent" aria-hidden="true" />
              Ask us first
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">Any other use needs our written permission.</p>
          </div>
        </div>
        <p className={`${legalBodyClass} mb-3`}>
          <WithPlaceholders text="[[TBC: allow quoting short extracts of Learn guides with attribution and a link]]" />
        </p>
        <p className={legalBodyClass}>
          The RCAAS name and logo are ours. Other product and company names on the website, such as equipment and
          software makers, belong to their owners and are used only to identify them. Mentioning them does not mean they
          endorse us.
        </p>
      </LegalSection>

      {/* 4 */}
      <LegalSection section={SECTIONS[3]} number={4}>
        <p className={`${legalBodyClass} mb-3`}>
          We work to keep the website accurate and up to date, but information such as capabilities, timelines and prices
          is general and may change. It is not an offer. The scope, price and terms of any project are set out in a
          written proposal or contract.
        </p>
        <p className={`${legalBodyClass} mb-3`}>
          Some images and animations on the website are illustrations or examples, not records of a specific project.
        </p>
        <p className={legalBodyClass}>We may change, suspend or remove the website, or any experience shown on it, at any time.</p>
      </LegalSection>

      {/* 5 */}
      <LegalSection section={SECTIONS[4]} number={5}>
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
          <Box className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-zinc-700 leading-relaxed">
            3D experiences on the website are for illustration and exploration. Unless agreed in writing for a specific
            project, they should not be relied on for measurements, design, engineering or legal purposes.
          </p>
        </div>
      </LegalSection>

      {/* 6 */}
      <LegalSection section={SECTIONS[5]} number={6}>
        <p className={legalBodyClass}>
          The website may link to other websites. We are not responsible for their content or practices, and a link does
          not mean we endorse them.
        </p>
      </LegalSection>

      {/* 7 */}
      <LegalSection section={SECTIONS[6]} number={7}>
        <p className={`${legalBodyClass} mb-3`}>
          We provide the website "as is". To the extent permitted by law, RCAAS is not liable for any loss arising from
          your use of, or inability to use, the website or the information on it.
        </p>
        <p className={legalBodyClass}>
          <WithPlaceholders text="Nothing in these terms limits liability that cannot be limited by law, or your rights as a consumer under the laws of Nepal, such as the Consumer Protection Act, 2075 (2018). [[TBC: legal review]]" />
        </p>
      </LegalSection>

      {/* 8 */}
      <LegalSection section={SECTIONS[7]} number={8}>
        <p className={legalBodyClass}>
          Our{' '}
          <a href="/privacy/" onClick={goToLink('/privacy/')} className="text-accent hover:text-accent-strong font-semibold underline underline-offset-2">
            Privacy Policy
          </a>{' '}
          explains how we handle personal information.
        </p>
      </LegalSection>

      {/* 9 */}
      <LegalSection section={SECTIONS[8]} number={9}>
        <p className={legalBodyClass}>
          We may update these terms. The "Last updated" date shows when they last changed, and the version in force when
          you use the website applies. If we make significant changes, we will highlight them on this page. Continued use
          of the website means you accept the updated terms.
        </p>
      </LegalSection>

      {/* 10 */}
      <LegalSection section={SECTIONS[9]} number={10}>
        <p className={legalBodyClass}>
          <WithPlaceholders text="These terms are governed by the laws of Nepal, and the courts of [[TBC: Kathmandu]] have jurisdiction. [[TBC: legal review]]" />
        </p>
      </LegalSection>

      {/* 11 */}
      <LegalSection section={SECTIONS[10]} number={11}>
        <ul className="space-y-2.5">
          {[
            'If any part of these terms cannot be enforced, the rest still applies.',
            "If we don't enforce a term straight away, we can still enforce it later.",
            '[[TBC: if a Nepali version is published, state which version applies if they differ]]',
          ].map((item) => (
            <li key={item} className={`flex items-start gap-3 ${legalBodyClass}`}>
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              <span>
                <WithPlaceholders text={item} />
              </span>
            </li>
          ))}
        </ul>
      </LegalSection>

      {/* 12 */}
      <LegalSection section={SECTIONS[11]} number={12}>
        <address className="not-italic rounded-xl border border-line bg-surface p-5 text-sm text-zinc-700 leading-relaxed">
          <WithPlaceholders text={`${EMAIL} · RCAAS Technology Pvt. Ltd., ${ADDRESS}, Kathmandu, Nepal`} />
        </address>
      </LegalSection>
    </LegalLayout>
  );
};
