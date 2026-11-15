import { SITE_URL } from '../../lib/shareMeta';

/** /llms.txt (llmstxt.org): a short, factual summary of the public site for AI crawlers.
 *  Keep it to confirmed statements: no superlatives, no sectors whose pages are still drafts, and links built
 *  from the site's own URL so a preview or a different host never advertises another domain. */
export const dynamic = 'force-static';

// Trailing slash on the static export, none on the Node host: the form each calls canonical.
const T = process.env.NEXT_OUTPUT_EXPORT === '1' ? '/' : '';

const BODY = `# RCAAS Technology
RCAAS (Reality Capture as a Service) turns real places into 3D tours, VR, AR and stories that help hotels, schools, developers and heritage sites attract visitors and make lasting impact in Nepal and beyond.

## Services
- Virtual Tours & Immersive Experiences
- 3D Laser Scanning (LiDAR)
- Digital Twins for Architecture, Engineering & Construction
- Drone Mapping
- Visual Storytelling
- Game Worlds & Assets (Gaussian splat assets, game environments, real-time scenes)

## Key Links
- Home: ${SITE_URL}/
- Services: ${SITE_URL}/services${T}
- Work: ${SITE_URL}/work${T}
- Learn: ${SITE_URL}/learn${T}
- FAQ: ${SITE_URL}/faq${T}
- Contact: ${SITE_URL}/contact${T}

## Who it is for
Hotels, schools and colleges, real estate developers, heritage and cultural sites, government and municipal bodies, game studios, filmmakers, and nonprofit and development organisations.

## What we do
We capture real places and turn them into explorable 3D experiences, survey data and stories, so people can see them from wherever they are.
`;

export function GET() {
  return new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
