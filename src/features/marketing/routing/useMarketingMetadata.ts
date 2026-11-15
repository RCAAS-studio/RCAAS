'use client';
import { useEffect } from 'react';
import { SITE_METADATA, INDUSTRIES } from '../data/siteData';
import { GAME_WORLDS, GAME_WORLDS_FAQS } from '../pages/GameWorldsPage';
import { PUBLISHED_GUIDES } from '../data/guides';
import { TEAM_MEMBERS, isMemberPublished, personId } from '../content/team';
import { FAQ_UPDATED, RESOLVED_FAQS } from '../content/faq';
import { COMPARISON_FAQS } from '../pages/ComparisonGuidePage';
import { GAUSSIAN_FAQS } from '../pages/GaussianGuidePage';
import { BLOG_LAUNCHED, PUBLISHED_POSTS, postPath } from '../content/blog';
import { findIndustryContent, isResolvedAnswer } from '../content/industries';
import { pageMeta, isCaseStudy } from '../meta';
import { SITE_URL } from '../../../lib/shareMeta';
import type { RoutePath } from '../types';
export function useMarketingMetadata(currentPath: RoutePath) {
useEffect(() => {
    const { title, robots, pathOnly, blogRoute, caseStudyRoute } = pageMeta(currentPath);
    document.title = title;
    let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (robots) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.name = 'robots';
        document.head.appendChild(robotsTag);
      }
      robotsTag.content = robots;
    } else if (robotsTag) {
      // Next owns this tag (it wrote the server's robots): reset it rather than remove it.
      robotsTag.content = 'index, follow';
    }

    // RSS feed link, only once the blog has launched (launch rule).
    let rssTag = document.querySelector('link[type="application/rss+xml"]') as HTMLLinkElement | null;
    if (BLOG_LAUNCHED && !rssTag) {
      rssTag = document.createElement('link');
      rssTag.rel = 'alternate';
      rssTag.type = 'application/rss+xml';
      rssTag.title = 'RCAAS Technology Blog';
      rssTag.href = '/blog/rss.xml';
      document.head.appendChild(rssTag);
    }

    // Inject or update Schema.org JSON-LD
    let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const baseOrg: Record<string, unknown> = {
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
      sameAs: [
        'https://linkedin.com/company/rcaas-technology',
      ],
    };

    const graphItems: Record<string, unknown>[] = [baseOrg];

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
    } else if (currentPath.startsWith('/services/digital-twins/3d-laser-scanning')) {
      graphItems.push({
        '@type': 'Service',
        '@id': 'https://rcaas.tech/services/digital-twins/3d-laser-scanning/#service',
        url: 'https://rcaas.tech/services/digital-twins/3d-laser-scanning/',
        name: '3D Laser Scanning in Nepal (SLAM LiDAR) | RCAAS',
        description: 'Handheld 3D laser scanning in Kathmandu and across Nepal. Accurate point clouds, as-built drawings and 3D models of any building, captured in hours, not days.',
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
    } else if (findIndustryContent(pathOnly)) {
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
    } else if (currentPath.startsWith('/industries')) {
      graphItems.push({
        '@type': 'CollectionPage',
        '@id': 'https://rcaas.tech/industries/#page',
        url: 'https://rcaas.tech/industries/',
        name: 'Immersive Experiences by Industry | RCAAS',
        description: 'How RCAAS helps hotels, schools, developers, factories, heritage sites, municipalities, insurers and game studios with 3D experiences, data and assets.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: INDUSTRIES.map((industry, idx) => ({
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
    } else if (currentPath.startsWith('/learn/planning-a-3d-experience-cost-and-timeline')) {
      const guideUrl = 'https://rcaas.tech/learn/planning-a-3d-experience-cost-and-timeline/';
      // author (L01), dates and image are added once input. No FAQPage until the answers are
      // resolved, and no price markup unless real prices are published.
      graphItems.push({
        '@type': 'Article',
        '@id': `${guideUrl}#article`,
        url: guideUrl,
        mainEntityOfPage: guideUrl,
        headline: 'Planning a 3D experience: what it costs and how long it takes',
        description: 'What a 3D virtual tour or immersive experience costs in Nepal, what affects the price, how long it takes, and how to prepare. A transparent guide from RCAAS.',
        publisher: { '@id': 'https://rcaas.tech/#organization' },
        inLanguage: 'en-GB',
      });

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://rcaas.tech/learn/' },
          { '@type': 'ListItem', position: 3, name: 'Cost and timeline', item: guideUrl },
        ],
      });
    } else if (currentPath.startsWith('/learn/what-is-gaussian-splatting')) {
      const guideUrl = 'https://rcaas.tech/learn/what-is-gaussian-splatting/';
      // author (L01), datePublished, dateModified and image are added once input.
      graphItems.push({
        '@type': 'Article',
        '@id': `${guideUrl}#article`,
        url: guideUrl,
        mainEntityOfPage: guideUrl,
        headline: 'What is Gaussian splatting?',
        description: "Gaussian splatting creates photorealistic 3D scenes you can explore in a browser. How it works, what it's good at, its limits, and how it compares to other 3D methods.",
        about: { '@type': 'Thing', name: 'Gaussian splatting' },
        citation: {
          '@type': 'ScholarlyArticle',
          headline: '3D Gaussian Splatting for Real-Time Radiance Field Rendering',
          author: ['B. Kerbl', 'G. Kopanas', 'T. Leimkühler', 'G. Drettakis'],
          datePublished: '2023',
          url: 'https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/',
        },
        publisher: { '@id': 'https://rcaas.tech/#organization' },
        inLanguage: 'en-GB',
      });

      graphItems.push({
        '@type': 'FAQPage',
        mainEntity: GAUSSIAN_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://rcaas.tech/learn/' },
          { '@type': 'ListItem', position: 3, name: 'What is Gaussian splatting?', item: guideUrl },
        ],
      });
    } else if (currentPath.startsWith('/learn/3d-virtual-tour-vs-360-tour-vs-video')) {
      const guideUrl = 'https://rcaas.tech/learn/3d-virtual-tour-vs-360-tour-vs-video/';
      // author (L01), datePublished, dateModified and image are added once input.
      graphItems.push({
        '@type': 'Article',
        '@id': `${guideUrl}#article`,
        url: guideUrl,
        mainEntityOfPage: guideUrl,
        headline: '3D virtual tour vs 360° tour vs video: which should you choose?',
        description: 'An honest comparison of 3D virtual tours, 360° photo tours and video: how each works, what each is best at, and when to combine them.',
        publisher: { '@id': 'https://rcaas.tech/#organization' },
        inLanguage: 'en-GB',
      });

      graphItems.push({
        '@type': 'FAQPage',
        mainEntity: COMPARISON_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://rcaas.tech/learn/' },
          { '@type': 'ListItem', position: 3, name: '3D tour vs 360° tour vs video', item: guideUrl },
        ],
      });
    } else if (blogRoute?.kind === 'hub') {
      graphItems.push({
        '@type': 'Blog',
        '@id': 'https://rcaas.tech/blog/#blog',
        url: 'https://rcaas.tech/blog/',
        name: 'Stories from the field',
        description: 'Stories from RCAAS Technology: behind-the-scenes capture days, project launches, ideas and events from our work turning real places into 3D experiences.',
        publisher: { '@id': 'https://rcaas.tech/#organization' },
        inLanguage: 'en-GB',
        blogPost: PUBLISHED_POSTS.map((post) => ({
          '@type': 'BlogPosting',
          '@id': `https://rcaas.tech${postPath(post)}#post`,
          url: `https://rcaas.tech${postPath(post)}`,
          headline: post.title,
          datePublished: post.published,
        })),
      });

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rcaas.tech/blog/' },
        ],
      });
    } else if (blogRoute?.kind === 'post') {
      const post = blogRoute.post;
      const postUrl = `https://rcaas.tech${postPath(post)}`;
      const author = TEAM_MEMBERS.find((member) => member.slug === post.author);
      graphItems.push({
        '@type': 'BlogPosting',
        '@id': `${postUrl}#post`,
        url: postUrl,
        mainEntityOfPage: postUrl,
        headline: post.title,
        description: post.summary,
        ...(post.heroImage.src.includes('placeholder') ? {} : { image: `https://rcaas.tech${post.heroImage.src}` }),
        ...(post.published ? { datePublished: post.published, dateModified: post.updated ?? post.published } : {}),
        ...(author && isMemberPublished(author) ? { author: { '@id': personId(author) } } : {}),
        publisher: { '@id': 'https://rcaas.tech/#organization' },
        articleSection: post.category,
        ...(post.aboutPlace ? { about: { '@type': 'Place', name: post.aboutPlace } } : {}),
        isPartOf: { '@id': 'https://rcaas.tech/blog/#blog' },
        inLanguage: 'en-GB',
      });

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rcaas.tech/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rcaas.tech/blog/' },
          { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
        ],
      });
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
    } else if (currentPath === '/learn/') {
      graphItems.push({
        '@type': 'CollectionPage',
        '@id': 'https://rcaas.tech/learn/#page',
        url: 'https://rcaas.tech/learn/',
        name: 'Guides to 3D Tours, VR & Digital Twins | RCAAS',
        description: 'Plain-language guides from RCAAS on 3D virtual tours, Gaussian splatting and planning a 3D experience in Nepal, written from our own projects.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: PUBLISHED_GUIDES.map((guide, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://rcaas.tech${guide.path}`,
            name: guide.title,
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
            name: 'Learn',
            item: 'https://rcaas.tech/learn/',
          },
        ],
      });
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
    }

    const schemaGraph = {
      '@context': 'https://schema.org',
      '@graph': graphItems,
    };

    scriptTag.textContent = JSON.stringify(schemaGraph);
  }, [currentPath]);
}
