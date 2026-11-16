import { COMPARISON_FAQS, GAUSSIAN_FAQS } from '../content/pageFaqs';
import { PUBLISHED_GUIDES } from '../data/guides';
import { TEAM_MEMBERS, isMemberPublished, personId } from '../content/team';
import { PUBLISHED_POSTS, postPath } from '../content/blog';
import type { GraphContext } from './types';

export function addEditorialSchema(context: GraphContext): boolean {
  const { currentPath, blogRoute, graphItems } = context;
  if (currentPath.startsWith('/learn/planning-a-3d-experience-cost-and-timeline')) {
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
    return true;
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
    return true;
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
    return true;
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
    return true;
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
    return true;
  } else if (currentPath === '/learn/') {
    graphItems.push({
      '@type': 'CollectionPage',
      '@id': 'https://rcaas.tech/learn/#page',
      url: 'https://rcaas.tech/learn/',
      name: 'Guides to 3D Tours, VR & Digital Twins | RCAAS',
      description: 'RCAAS learning resources on 3D virtual tours, Gaussian splatting and planning a 3D experience. Guides are reviewed before publication; contact our team for help.',
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
    return true;
  }
  return false;
}
