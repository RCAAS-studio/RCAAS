import { SITE_METADATA } from '../data/siteData';
import { pageMeta } from '../meta';
import { addServiceSchema } from './services';
import { addPlaceSchema } from './places';
import { addEditorialSchema } from './editorial';
import { addCompanySchema } from './company';
import type { GraphItem } from './types';

export function buildMarketingGraph(currentPath: string, metadata = pageMeta(currentPath)) {
  const baseOrg: GraphItem = {
    '@type': 'ProfessionalService',
    '@id': 'https://rcaas.tech/#organization',
    logo: 'https://rcaas.tech/logo.png',
    image: 'https://rcaas.tech/logo.png',
    name: SITE_METADATA.displayName,
    alternateName: ['RCAAS', SITE_METADATA.nameMeaning],
    url: 'https://rcaas.tech/',
    description: SITE_METADATA.boilerplate,
    slogan: SITE_METADATA.tagline,
    ...(SITE_METADATA.foundingYear ? { foundingDate: SITE_METADATA.foundingYear } : {}),
    email: SITE_METADATA.email,
    telephone: SITE_METADATA.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kageshwori-Manohara',
      addressLocality: 'Kathmandu',
      addressRegion: 'Bagmati',
      addressCountry: 'NP',
    },
    areaServed: { '@type': 'Country', name: 'Nepal' },
    knowsAbout: [
      '3D virtual tours',
      'Virtual reality',
      'Augmented reality',
      'Gaussian splatting',
      'SLAM LiDAR laser scanning',
      'Drone mapping',
      'Digital twins',
      'Heritage documentation',
      'Game environment and asset development',
      'Gaussian splat game assets',
    ],
  };
  const graphItems: GraphItem[] = [baseOrg];
  const context = { currentPath, pathOnly: metadata.pathOnly, blogRoute: metadata.blogRoute, caseStudyRoute: metadata.caseStudyRoute, baseOrg, graphItems };
  for (const addSchema of [addServiceSchema, addPlaceSchema, addEditorialSchema, addCompanySchema]) {
    if (addSchema(context)) break;
  }
  return { '@context': 'https://schema.org', '@graph': graphItems };
}
