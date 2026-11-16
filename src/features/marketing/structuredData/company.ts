import { SITE_METADATA } from '../data/siteData';
import { TEAM_MEMBERS, isMemberPublished, personId } from '../content/team';
import { FAQ_UPDATED, RESOLVED_FAQS } from '../content/faq';
import type { GraphContext } from './types';

export function addCompanySchema(context: GraphContext): boolean {
  const { currentPath, baseOrg, graphItems } = context;
  const breadcrumbLabels: Record<string, string> = {
    '/gallery': 'Live tours', '/cookies': 'Cookie Policy', '/security': 'Security',
  };
  const path = context.pathOnly.replace(/\/$/, '');
  if (breadcrumbLabels[path]) {
    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: breadcrumbLabels[path], item: `https://rcaas.tech${path}/` },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/platform')) {
    // 3DModel (P03 demo) and SoftwareApplication (P01 name/URL) are added once confirmed.
    graphItems.push({
      '@type': 'WebPage',
      '@id': 'https://rcaas.tech/platform/#page',
      url: 'https://rcaas.tech/platform/',
      name: 'Host, Share & Embed Your 3D Experience | RCAAS',
      description: 'RCAAS Studio puts your photorealistic space online behind one link. It opens on any phone or computer, with nothing to install. Early access open.',
      isPartOf: { '@id': 'https://rcaas.tech/#organization' },
    });

    // FAQPage only from resolved Q&As.
    graphItems.push({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do visitors need an app or special software?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. The experience opens in any modern web browser on a phone, tablet or computer.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I manage my own experiences on the platform?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Not yet. Today we publish and manage your experience for you. Subscriptions that let businesses manage their own experiences are coming soon; you can register your interest below.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I put the experience on my own website?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. A tour can be embedded on your website, and its link can be shared in messages, on social media and through a QR code.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long is my experience hosted, and what happens if hosting ends?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each project has its own agreed hosting period. If it ends, the tour stays open for a 14-day grace period; after that, access may be suspended and the project kept for 30 more days so it can be restored. Archiving or deletion after that follows your contract. You receive access to the hosted tour, not the raw capture data or 3D model files.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I see how many people explored it?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Not yet. Engagement analytics are not part of the platform today.',
          },
        },
      ],
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://rcaas.tech/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Platform',
          item: 'https://rcaas.tech/platform/',
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/contact')) {
    // contactPoint uses the same NAP as the footer, and only once it is confirmed (G06).
    if (SITE_METADATA.contactConfirmed) {
      baseOrg.contactPoint = {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: SITE_METADATA.phone,
        email: SITE_METADATA.email,
        availableLanguage: ['English', 'Nepali'],
      };
    }

    graphItems.push({
      '@type': 'ContactPage',
      '@id': 'https://rcaas.tech/contact/#page',
      url: 'https://rcaas.tech/contact/',
      name: 'Plan Your 3D Experience | Contact RCAAS Technology',
      description: "Tell RCAAS Technology about your place and your goal. We'll suggest the right 3D tour, VR, film or survey and send a clear proposal. Based in Kathmandu.",
      about: { '@id': 'https://rcaas.tech/#organization' },
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://rcaas.tech/contact/' },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/faq')) {
    // FAQPage only from answers with no placeholder left; the homepage excerpt has no schema.
    graphItems.push({
      '@type': 'FAQPage',
      '@id': 'https://rcaas.tech/faq/#page',
      url: 'https://rcaas.tech/faq/',
      name: 'FAQ: 3D Tours, VR, AR & Digital Twins | RCAAS',
      dateModified: FAQ_UPDATED,
      inLanguage: 'en-GB',
      mainEntity: RESOLVED_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://rcaas.tech/about/' },
        { '@type': 'ListItem', position: 3, name: 'FAQ', item: 'https://rcaas.tech/faq/' },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/about')) {
    // One Person per published team member (photo and role confirmed).
    const people = TEAM_MEMBERS.filter(isMemberPublished).map((member) => ({
      '@type': 'Person',
      '@id': personId(member),
      name: member.name,
      jobTitle: member.role,
      worksFor: { '@id': 'https://rcaas.tech/#organization' },
      ...(member.linkedin || member.github || member.website
        ? { sameAs: [member.linkedin, member.github, member.website].filter(Boolean) }
        : {}),
      ...(member.email ? { email: member.email } : {}),
      ...(member.photo ? { image: `https://rcaas.tech${member.photo}` } : {}),
      ...(member.knowsAbout ? { knowsAbout: member.knowsAbout } : {}),
    }));

    // The full Organization entity lives in baseOrg; the About page adds its employees.
    if (people.length > 0) {
      baseOrg.employee = people.map((person) => ({ '@id': person['@id'] }));
    }
    graphItems.push(...people);

    graphItems.push({
      '@type': 'AboutPage',
      '@id': 'https://rcaas.tech/about/#page',
      url: 'https://rcaas.tech/about/',
      name: 'About RCAAS Technology: Engineers & Game Developers',
      description: 'RCAAS Technology is a Kathmandu-based reality capture and immersive experience company. Meet the engineers and game developers behind our work.',
      mainEntity: { '@id': 'https://rcaas.tech/#organization' },
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://rcaas.tech/about/' },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/how-we-work')) {
    // No HowTo markup: the rich result is retired and plain content is enough.
    graphItems.push({
      '@type': 'WebPage',
      '@id': 'https://rcaas.tech/how-we-work/#page',
      url: 'https://rcaas.tech/how-we-work/',
      name: 'How We Work: From Real Place to Experience | RCAAS',
      description: 'How RCAAS turns a real place into an accurate 3D experience: our five-step process, our engineering and game-development team, toolkit and quality promise.',
      about: { '@id': 'https://rcaas.tech/#organization' },
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://rcaas.tech/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'About',
          item: 'https://rcaas.tech/about/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'How we work',
          item: 'https://rcaas.tech/how-we-work/',
        },
      ],
    });
    return true;
  }
  return false;
}
