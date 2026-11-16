import { INDUSTRIES } from '../data/siteData';
import { findIndustryContent, isResolvedAnswer } from '../content/industries';
import { isCaseStudy } from '../meta';
import type { GraphContext } from './types';

export function addPlaceSchema(context: GraphContext): boolean {
  const { currentPath, pathOnly, caseStudyRoute, graphItems } = context;
  if (findIndustryContent(pathOnly)) {
    const industry = findIndustryContent(pathOnly)!;
    const industryUrl = `https://rcaas.tech/industries/${industry.slug}/`;
    graphItems.push({
      '@type': 'WebPage',
      '@id': `${industryUrl}#page`,
      url: industryUrl,
      name: industry.titleTag,
      description: industry.metaDescription,
      audience: { '@type': industry.audienceSchemaType ?? 'Audience', audienceType: industry.audienceType },
      about: industry.serviceIds.map((id) => ({ '@id': id })),
      // 3DModel for the live example is added once its embed URL is confirmed.
      ...(industry.liveExample.embedUrl
        ? {
            associatedMedia: {
              '@type': '3DModel',
              name: industry.liveExample.caption,
              embedUrl: industry.liveExample.embedUrl,
              creator: { '@id': 'https://rcaas.tech/#organization' },
              ...(industry.liveExample.place
                ? { contentLocation: { '@type': industry.liveExample.place.type, name: industry.liveExample.place.name } }
                : {}),
            },
          }
        : {}),
      inLanguage: 'en-GB',
    });

    // FAQPage only from resolved Q&As.
    const resolved = industry.faq.items.filter((item) => isResolvedAnswer(item.answer));
    if (resolved.length > 0) {
      graphItems.push({
        '@type': 'FAQPage',
        mainEntity: resolved.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      });
    }

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://rcaas.tech/industries/' },
        { '@type': 'ListItem', position: 3, name: industry.name, item: industryUrl },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/industries')) {
    graphItems.push({
      '@type': 'CollectionPage',
      '@id': 'https://rcaas.tech/industries/#page',
      url: 'https://rcaas.tech/industries/',
      name: 'Immersive Experiences by Industry | RCAAS',
      description: 'Explore 3D experiences, survey data and assets for hotels, education, property, heritage, municipalities, game studios, filmmakers and nonprofits in Nepal.',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: INDUSTRIES.filter((industry) => !findIndustryContent(industry.link)?.draft).map((industry, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: industry.title,
          url: `https://rcaas.tech${industry.link}`,
          description: `${industry.goalHeadline} ${industry.summary}`,
        })),
      },
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
          name: 'Industries',
          item: 'https://rcaas.tech/industries/',
        },
      ],
    });
    return true;
  } else if (isCaseStudy(caseStudyRoute)) {
    const study = caseStudyRoute;
    const studyUrl = `https://rcaas.tech/work/${study.slug}/`;
    // datePublished, dateModified, image and the place address are added once real (Register W01–W04).
    graphItems.push({
      '@type': 'Article',
      '@id': `${studyUrl}#article`,
      url: studyUrl,
      mainEntityOfPage: studyUrl,
      headline: study.h1,
      description: study.metaDescription,
      author: { '@id': 'https://rcaas.tech/#organization' },
      publisher: { '@id': 'https://rcaas.tech/#organization' },
      about: { '@type': study.placeType, name: study.placeName },
      ...(study.embedUrl
        ? {
            associatedMedia: {
              '@type': '3DModel',
              name: study.placeName,
              description: study.heroResult,
              embedUrl: study.embedUrl,
              url: study.embedUrl,
              creator: { '@id': 'https://rcaas.tech/#organization' },
              ...(study.location ? { contentLocation: { '@type': 'Place', name: study.location } } : {}),
              ...(study.date ? { dateCreated: study.date } : {}),
            },
          }
        : {}),
      inLanguage: 'en-GB',
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: 'Our Work', item: 'https://rcaas.tech/work/' },
        { '@type': 'ListItem', position: 3, name: study.name, item: studyUrl },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/work')) {
    graphItems.push({
      '@type': 'CollectionPage',
      '@id': 'https://rcaas.tech/work/#page',
      url: 'https://rcaas.tech/work/',
      name: 'Our Work: 3D Experiences & Digital Heritage Projects | RCAAS',
      description: 'Explore 3D experiences RCAAS has built for heritage sites, schools, colleges and hotels in Nepal, and the stories behind each project.',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Chilancho Stupa Digital Heritage',
            url: 'https://rcaas.tech/work/chilancho-stupa-digital-heritage/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Nepathya School and College 3D Campus Tour',
            url: 'https://rcaas.tech/work/nepathya-school-college-3d-campus-tour/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Madan Ashrit Memorial Polytechnic 3D Campus Tour',
            url: 'https://rcaas.tech/work/madan-ashrit-polytechnic-3d-campus-tour/',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Basera Boutique Hotel 3D Experience',
            url: 'https://rcaas.tech/work/basera-boutique-hotel-3d-experience/',
          },
        ],
      },
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
          name: 'Our Work',
          item: 'https://rcaas.tech/work/',
        },
      ],
    });
    return true;
  }
  return false;
}
