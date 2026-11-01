import type { Metadata } from 'next';
import { NOINDEX } from '../../lib/shareMeta';

/** The studio is for signed-in teams: keep every page of it out of search. */
export const metadata: Metadata = { robots: NOINDEX };

// Inter in every studio page and its dialogs (2026-11-01); here, so it leaves with the studio. What
// the client's visitors see keeps the tour's own face, in the Preview too: the viewer (.vw) and the
// hotspots' markers and cards (.hs-*).
const INTER = ':root{--sans:var(--font-inter),"Helvetica Neue",Helvetica,Arial,sans-serif}'
  + '.vw,[class^="hs-"],[class*=" hs-"]{--sans:var(--font-ui),ui-monospace,monospace}';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <><style>{INTER}</style>{children}</>;
}
