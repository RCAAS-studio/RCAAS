/** /llms.txt (llmstxt.org): the rcaas.tech site's own (public/llms.txt in
 *  github.com/meshuman/rcaas), served as written. */
export const dynamic = 'force-static';

const BODY = "# RCAAS Technology\nRCAAS (Reality Capture as a Service) turns real places into 3D tours, VR, AR and stories that help hotels, schools, developers and heritage sites attract visitors and make lasting impact in Nepal and beyond.\n\n## Services\n- Virtual Tours & Immersive Experiences\n- 3D Laser Scanning (LiDAR)\n- Digital Twins for Architecture, Engineering & Construction\n- Drone Mapping\n- Visual Storytelling\n- Game Worlds & Assets (Gaussian splat assets, game environments, real-time scenes)\n\n## Key Links\n- Home: https://rcaas.tech/\n- Services: https://rcaas.tech/services/\n- Work/Case Studies: https://rcaas.tech/work/\n- Learn & Blog: https://rcaas.tech/learn/\n\n## Target Audience\nHotels, real estate developers, educational institutions, construction firms, game studios, filmmakers, nonprofits and development organisations, banks and financial institutions, and heritage sites seeking to digitize physical spaces.\n\n## Positioning\nRCAAS is the leading reality capture and 3D immersive experience provider in Nepal. We don't just capture photos; we create digital twins and interactive 3D spaces that allow users to walk through and experience locations remotely.\n";

export function GET() {
  return new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
