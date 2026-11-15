import { GAME_WORLDS } from '../data/gameWorlds';
import { GAME_WORLDS_FAQS } from '../content/pageFaqs';
import { SITE_URL } from '../../../lib/shareMeta';
import type { GraphContext } from './types';

export function addServiceSchema(context: GraphContext): boolean {
  const { currentPath, graphItems } = context;
  if (currentPath.startsWith('/services/immersive-experiences/3d-virtual-tours')) {
    graphItems.push({
      '@type': 'Service',
      '@id': 'https://rcaas.tech/services/immersive-experiences/3d-virtual-tours/#service',
      url: 'https://rcaas.tech/services/immersive-experiences/3d-virtual-tours/',
      name: '3D Virtual Tours in Nepal: Beyond 360° Photos | RCAAS',
      description: 'Photorealistic 3D virtual tours that people explore freely from a link. For hotels, schools, colleges, property and heritage sites across Nepal.',
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: '3D Virtual Tours',
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
          name: 'What we create',
          item: 'https://rcaas.tech/services/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Immersive Experiences',
          item: 'https://rcaas.tech/services/immersive-experiences/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '3D Virtual Tours',
          item: 'https://rcaas.tech/services/immersive-experiences/3d-virtual-tours/',
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services/game-worlds-assets')) {
    const serviceUrl = 'https://rcaas.tech/services/game-worlds-assets/';
    graphItems.push({
      '@type': 'Service',
      '@id': `${serviceUrl}#service`,
      url: serviceUrl,
      name: GAME_WORLDS.titleTag,
      description: GAME_WORLDS.metaDescription,
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: 'Game Worlds & Assets',
    });

    // FAQPage only from resolved Q&As.
    const resolvedFaqs = GAME_WORLDS_FAQS.filter((faq) => !faq.answer.includes('[['));
    if (resolvedFaqs.length > 0) {
      graphItems.push({
        '@type': 'FAQPage',
        mainEntity: resolvedFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
        { '@type': 'ListItem', position: 2, name: 'What we create', item: 'https://rcaas.tech/services/' },
        { '@type': 'ListItem', position: 3, name: 'Game Worlds & Assets', item: serviceUrl },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services/visual-storytelling')) {
    const serviceUrl = `${SITE_URL}/services/visual-storytelling/`;
    graphItems.push({
      '@type': 'Service',
      '@id': `${serviceUrl}#service`,
      url: serviceUrl,
      name: 'Visual Storytelling',
      description: 'Guided 3D tours, cinematic fly-through films and social content made from real places, shaped around what you want your audience to feel and do.',
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: 'Visual Storytelling & Fly-Through Films',
    });

    graphItems.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'What we create',
          item: `${SITE_URL}/services/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Visual Storytelling',
          item: serviceUrl,
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services/digital-twins/3d-laser-scanning')) {
    graphItems.push({
      '@type': 'Service',
      '@id': 'https://rcaas.tech/services/digital-twins/3d-laser-scanning/#service',
      url: 'https://rcaas.tech/services/digital-twins/3d-laser-scanning/',
      name: '3D Laser Scanning in Nepal (SLAM LiDAR) | RCAAS',
      description: 'Handheld 3D laser scanning in Kathmandu and across Nepal. Point clouds, as-built drawings and 3D models of buildings, captured with SLAM LiDAR.',
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: '3D Laser Scanning (SLAM LiDAR)',
      isRelatedTo: { '@id': 'https://rcaas.tech/services/digital-twins/#service' },
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
          name: 'What we create',
          item: 'https://rcaas.tech/services/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Digital Twins & Survey',
          item: 'https://rcaas.tech/services/digital-twins/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '3D Laser Scanning',
          item: 'https://rcaas.tech/services/digital-twins/3d-laser-scanning/',
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services/digital-twins/drone-mapping')) {
    graphItems.push({
      '@type': 'Service',
      '@id': 'https://rcaas.tech/services/digital-twins/drone-mapping/#service',
      url: 'https://rcaas.tech/services/digital-twins/drone-mapping/',
      name: 'Drone Mapping & Aerial Survey in Nepal | RCAAS',
      description: 'Drone mapping and aerial survey across Nepal: true-scale maps, terrain models and 3D site models of land, buildings and heritage sites, ready for planning.',
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: 'Drone Mapping & Aerial Survey',
      isRelatedTo: { '@id': 'https://rcaas.tech/services/digital-twins/#service' },
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
          name: 'What we create',
          item: 'https://rcaas.tech/services/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Digital Twins & Survey',
          item: 'https://rcaas.tech/services/digital-twins/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Drone Mapping',
          item: 'https://rcaas.tech/services/digital-twins/drone-mapping/',
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services/digital-twins')) {
    graphItems.push({
      '@type': 'Service',
      '@id': 'https://rcaas.tech/services/digital-twins/#service',
      url: 'https://rcaas.tech/services/digital-twins/',
      name: 'Digital Twins, 3D Scanning & Survey in Nepal | RCAAS',
      description: 'Accurate, measurable 3D copies of buildings, sites and landscapes in Nepal. Point clouds, drawings, maps and models for design, planning and preservation.',
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: '3D Laser Scanning, Drone Mapping, Survey and Digital Twins',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Digital Twins & Survey Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '3D Laser Scanning',
              url: 'https://rcaas.tech/services/digital-twins/3d-laser-scanning/',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Drone Mapping & Aerial Survey',
              url: 'https://rcaas.tech/services/digital-twins/drone-mapping/',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Survey, Positioning & GIS',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Heritage Records & Digital Archives',
            },
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
          name: 'What we create',
          item: 'https://rcaas.tech/services/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Digital Twins & Survey',
          item: 'https://rcaas.tech/services/digital-twins/',
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services/immersive-experiences')) {
    graphItems.push({
      '@type': 'Service',
      '@id': 'https://rcaas.tech/services/immersive-experiences/#service',
      url: 'https://rcaas.tech/services/immersive-experiences/',
      name: 'Immersive 3D, VR & AR Experiences in Nepal | RCAAS',
      description: 'Photorealistic 3D tours, VR, AR and interactive experiences built from real places in Nepal, designed to help hotels, schools, developers and heritage sites.',
      provider: { '@id': 'https://rcaas.tech/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
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
          name: 'What we create',
          item: 'https://rcaas.tech/services/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Immersive Experiences',
          item: 'https://rcaas.tech/services/immersive-experiences/',
        },
      ],
    });
    return true;
  } else if (currentPath.startsWith('/services')) {
    graphItems.push({
      '@type': 'CollectionPage',
      '@id': 'https://rcaas.tech/services/#page',
      url: 'https://rcaas.tech/services/',
      name: 'Immersive Experiences, Storytelling & Digital Twins | RCAAS',
      description: 'What RCAAS creates from real places: immersive 3D tours, VR and AR, visual stories and films, accurate digital twins for design and planning, and game-ready worlds and assets.',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Immersive Experiences',
            url: 'https://rcaas.tech/services/immersive-experiences/',
            description: 'Photorealistic 3D tours that open from a link, VR that puts visitors on site, and interactive experiences built with game-engine tools.',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Visual Storytelling',
            url: 'https://rcaas.tech/services/visual-storytelling/',
            description: 'Guided tours, cinematic fly-through films and social content made from your 3D capture, shaped around what you want your audience to feel and do.',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Digital Twins & Survey',
            url: 'https://rcaas.tech/services/digital-twins/',
            description: 'Accurate 3D records of buildings, sites and landscapes, captured with advanced laser and aerial scanning, ready for design, planning and preservation.',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Game Worlds & Assets',
            url: 'https://rcaas.tech/services/game-worlds-assets/',
            description: 'Real locations, objects and heritage sites captured as Gaussian splats and turned into game-ready environments and props for Unreal, Unity and real-time experiences.',
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
          name: 'What we create',
          item: 'https://rcaas.tech/services/',
        },
      ],
    });
    return true;
  }
  return false;
}
