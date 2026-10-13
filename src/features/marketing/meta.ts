// Per-page title, description and robots, and which paths exist: shared by
// App (client, on every in-app move) and the Next page (server, first load).
// Moved out of App.tsx unchanged; no React here, so the server can import it.
import { SITE_METADATA } from './data/siteData';
import { GAME_WORLDS } from './data/gameWorlds';
import { PRIVACY_DRAFT, TERMS_DRAFT } from './data/legal';
import { isGuidePublished } from './data/guides';
import { BLOG_LAUNCHED, VISIBLE_POSTS, BLOG_PAGE_SIZE, findPost, metaTitleFor, postIsIndexable } from './content/blog';
import type { BlogPost } from './content/blog';
import { findCaseStudy, isCaseStudyPublished } from './content/work';
import type { CaseStudyContent } from './content/work';
import { findIndustryContent } from './content/industries';
import type { RoutePath } from './types';

export const blogPageCount = () => Math.max(1, Math.ceil(VISIBLE_POSTS.length / BLOG_PAGE_SIZE));

// /blog/, /blog/page/{n}/ (only when there is more than one page) and /blog/{slug}/.
export type BlogRoute = { kind: 'hub'; page: number } | { kind: 'post'; post: BlogPost } | { kind: 'missing' } | null;

export const resolveBlogRoute = (path: string): BlogRoute => {
  if (!path.startsWith('/blog')) return null;
  if (path === '/blog' || path === '/blog/') return { kind: 'hub', page: 1 };
  const pageMatch = path.match(/^\/blog\/page\/(\d+)\/?$/);
  if (pageMatch) {
    const page = Number(pageMatch[1]);
    return page >= 2 && page <= blogPageCount() ? { kind: 'hub', page } : { kind: 'missing' };
  }
  const slugMatch = path.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  const post = slugMatch ? findPost(slugMatch[1]) : undefined;
  return post ? { kind: 'post', post } : { kind: 'missing' };
};

// /work/{slug}/: a case study, or missing (404) for unknown slugs.
export const resolveCaseStudy = (path: string): CaseStudyContent | 'missing' | null => {
  const match = path.match(/^\/work\/([a-z0-9-]+)\/?$/);
  if (!match) return null;
  return findCaseStudy(match[1]) ?? 'missing';
};

export const isCaseStudy = (route: CaseStudyContent | 'missing' | null): route is CaseStudyContent =>
  route !== null && route !== 'missing';

// Top-level sections the router renders; any other path (except '/') is a 404.
export const ROUTE_PREFIXES = [
  '/services',
  '/industries',
  '/work',
  '/platform',
  '/how-we-work',
  '/learn',
  '/about',
  '/faq',
  '/contact',
  '/thank-you',
  '/blog',
  '/privacy',
  '/terms',
  // from the earlier rcaas.tech site: the live tours (GalleryPage) and two policies (PolicyPages)
  '/gallery',
  '/cookies',
  '/security',
];

export const isNotFoundPath = (path: string) =>
  (path !== '/' && path !== '' && !ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) ||
  resolveBlogRoute(path)?.kind === 'missing' ||
  resolveCaseStudy(path) === 'missing';

export function pageMeta(currentPath: string) {
  let title = '3D Tours, VR & Immersive Experiences in Nepal | RCAAS';
  let metaDesc = SITE_METADATA.boilerplate;

  if (currentPath.startsWith('/services/immersive-experiences/3d-virtual-tours')) {
    title = '3D Virtual Tours in Nepal: Beyond 360° Photos | RCAAS';
    metaDesc = 'Photorealistic 3D virtual tours that people explore freely from a link. For hotels, schools, colleges, property and heritage sites across Nepal.';
  } else if (currentPath.startsWith('/services/game-worlds-assets')) {
    title = GAME_WORLDS.titleTag;
    metaDesc = GAME_WORLDS.metaDescription;
  } else if (currentPath.startsWith('/services/visual-storytelling')) {
    title = 'Fly-Through Films & Visual Storytelling in Nepal | RCAAS';
    metaDesc = 'Guided 3D tours, cinematic fly-through films and social content made from real places, shaped around what you want your audience to feel and do.';
  } else if (currentPath.startsWith('/services/digital-twins/3d-laser-scanning')) {
    title = '3D Laser Scanning in Nepal (SLAM LiDAR) | RCAAS';
    metaDesc = 'Handheld 3D laser scanning in Kathmandu and across Nepal. Accurate point clouds, as-built drawings and 3D models of any building, captured in hours, not days.';
  } else if (currentPath.startsWith('/services/digital-twins/drone-mapping')) {
    title = 'Drone Mapping & Aerial Survey in Nepal | RCAAS';
    metaDesc = 'Drone mapping and aerial survey across Nepal: true-scale maps, terrain models and 3D site models of land, buildings and heritage sites, ready for planning.';
  } else if (currentPath.startsWith('/services/digital-twins')) {
    title = 'Digital Twins, 3D Scanning & Survey in Nepal | RCAAS';
    metaDesc = 'Accurate, measurable 3D copies of buildings, sites and landscapes in Nepal. Point clouds, drawings, maps and models for design, planning and preservation.';
  } else if (currentPath.startsWith('/services/immersive-experiences')) {
    title = 'Immersive 3D, VR & AR Experiences in Nepal | RCAAS';
    metaDesc = 'Photorealistic 3D tours, VR, AR and interactive experiences built from real places in Nepal, designed to help hotels, schools, developers and heritage sites.';
  } else if (currentPath.startsWith('/services')) {
    title = 'Immersive Experiences, Storytelling, Digital Twins & Game Worlds | RCAAS';
  } else if (findIndustryContent(currentPath.split(/[?#]/)[0])) {
    const industry = findIndustryContent(currentPath.split(/[?#]/)[0])!;
    title = industry.titleTag;
    metaDesc = industry.metaDescription;
  } else if (currentPath.startsWith('/industries')) {
    title = 'Immersive Experiences by Industry | RCAAS';
    metaDesc = 'How RCAAS helps hotels, schools, developers, factories, heritage sites, municipalities, insurers, game studios, filmmakers, nonprofits and banks with 3D experiences, data and assets.';
  } else if (isCaseStudy(resolveCaseStudy(currentPath.split(/[?#]/)[0]))) {
    const study = resolveCaseStudy(currentPath.split(/[?#]/)[0]) as CaseStudyContent;
    title = study.titleTag;
    metaDesc = study.metaDescription;
  } else if (currentPath.startsWith('/work')) {
    title = 'Our Work: 3D Experiences & Digital Heritage Projects | RCAAS';
    metaDesc = 'Explore 3D experiences RCAAS has built for heritage sites, schools, colleges and hotels in Nepal, and the stories behind each project.';
  } else if (currentPath.startsWith('/platform')) {
    title = 'Host, Share & Measure Your 3D Experience | RCAAS';
    metaDesc = 'The RCAAS 3D platform puts your photorealistic space online behind one link. It opens on any phone or computer, with nothing to install. Early access open.';
  } else if (currentPath.startsWith('/how-we-work')) {
    title = 'How We Work: From Real Place to Experience | RCAAS';
    metaDesc = 'How RCAAS turns a real place into an accurate 3D experience: our five-step process, our engineering and game-development team, toolkit and quality promise.';
  } else if (currentPath.startsWith('/learn/planning-a-3d-experience-cost-and-timeline')) {
    title = '3D Virtual Tour Cost & Timeline in Nepal | RCAAS';
    metaDesc = 'What a 3D virtual tour or immersive experience costs in Nepal, what affects the price, how long it takes, and how to prepare. A transparent guide from RCAAS.';
  } else if (currentPath.startsWith('/learn/what-is-gaussian-splatting')) {
    title ='What Is Gaussian Splatting? A Plain Guide | RCAAS';
    metaDesc = "Gaussian splatting creates photorealistic 3D scenes you can explore in a browser. How it works, what it's good at, its limits, and how it compares to other 3D methods.";
  } else if (currentPath.startsWith('/learn/3d-virtual-tour-vs-360-tour-vs-video')) {
    title ='3D Virtual Tour vs 360° Tour vs Video: Which to Choose | RCAAS';
    metaDesc = 'An honest comparison of 3D virtual tours, 360° photo tours and video: how each works, what each is best at, and when to combine them.';
  } else if (currentPath.startsWith('/learn')) {
    title = 'Guides to 3D Tours, VR & Digital Twins | RCAAS';
    metaDesc = 'Plain-language guides from RCAAS on 3D virtual tours, Gaussian splatting and planning a 3D experience in Nepal, written from our own projects.';
  } else if (currentPath.startsWith('/about')) {
    title = 'About RCAAS Technology: Engineers & Game Developers';
    metaDesc = 'RCAAS Technology is a Kathmandu-based reality capture and immersive experience company. Meet the engineers and game developers behind our work.';
  } else if (currentPath.startsWith('/faq')) {
    title = 'FAQ: 3D Tours, VR, AR & Digital Twins | RCAAS';
    metaDesc = 'Answers to common questions about RCAAS Technology: what we create, cost and timelines, how people view experiences, ownership, privacy and hosting.';
  } else if (currentPath.startsWith('/contact')) {
    title = 'Plan Your 3D Experience | Contact RCAAS Technology';
    metaDesc = "Tell RCAAS Technology about your place and your goal. We'll suggest the right 3D tour, VR, film or survey and send a clear proposal. Based in Kathmandu.";
  } else if (currentPath.startsWith('/thank-you')) {
    title = 'Thank You | RCAAS Technology';
  } else if (currentPath.startsWith('/blog')) {
    const blogRoute = resolveBlogRoute(currentPath.split(/[?#]/)[0]);
    if (blogRoute?.kind === 'post') {
      title = metaTitleFor(blogRoute.post);
      metaDesc = blogRoute.post.summary;
    } else {
      title = 'Blog: Stories from the Field | RCAAS Technology';
      metaDesc = 'Stories from RCAAS Technology: behind-the-scenes capture days, project launches, ideas and events from our work turning real places into 3D experiences.';
    }
  } else if (currentPath.startsWith('/privacy')) {
    title = 'Privacy Policy | RCAAS Technology';
    metaDesc = 'How RCAAS Technology collects, uses and protects personal information on our website and in the places we capture.';
  } else if (currentPath.startsWith('/terms')) {
    title = 'Terms of Use | RCAAS Technology';
    metaDesc = 'Terms for using the RCAAS Technology website and the 3D experiences shown on it.';
  } else if (currentPath.startsWith('/gallery')) {
    title = 'Live 3D Tours You Can Walk | RCAAS';
    metaDesc = 'Published interactive 3D tours of hotels, halls and spaces in Nepal, live from our studio. Open one and walk it.';
  } else if (currentPath.startsWith('/cookies')) {
    title = 'Cookie Policy | RCAAS Technology';
    metaDesc = 'RCAAS sets one cookie, only when you sign in, and no tracking or advertising cookies. What stays in your browser, and how to clear it.';
  } else if (currentPath.startsWith('/security')) {
    title = 'Security Policy | RCAAS Technology';
    metaDesc = 'How RCAAS protects accounts, guests’ details and client tours, and how to report a security problem.';
  }

  const pathOnly = currentPath.split(/[?#]/)[0] as RoutePath;
  const notFound = isNotFoundPath(pathOnly);
  if (notFound) title = 'Page Not Found | RCAAS Technology';


  // Robots: draft guides render for review but stay out of search; thank-you and 404 are never indexed.
  const isDraftGuide =
    pathOnly.startsWith('/learn/') && pathOnly !== '/learn/' && !isGuidePublished(pathOnly);
  const isDraftLegal =
    (pathOnly.startsWith('/privacy') && PRIVACY_DRAFT) || (pathOnly.startsWith('/terms') && TERMS_DRAFT);
  const blogRoute = resolveBlogRoute(pathOnly);
  const isDraftBlog =
    (blogRoute?.kind === 'hub' && !BLOG_LAUNCHED) || (blogRoute?.kind === 'post' && !postIsIndexable(blogRoute.post));
  const caseStudyRoute = resolveCaseStudy(pathOnly);
  const isDraftCaseStudy = isCaseStudy(caseStudyRoute) && !isCaseStudyPublished(caseStudyRoute);
  const isDraftIndustry = Boolean(findIndustryContent(pathOnly)?.draft);
  const robots = isDraftGuide || isDraftLegal || isDraftBlog || isDraftCaseStudy || isDraftIndustry
    ? 'noindex, nofollow'
    : pathOnly.startsWith('/thank-you')
      ? 'noindex, follow'
      : notFound
        ? 'noindex'
        : null;

  return { title, description: metaDesc, robots, notFound, pathOnly, blogRoute, caseStudyRoute };
}
