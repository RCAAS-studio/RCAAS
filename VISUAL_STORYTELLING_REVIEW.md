# Visual Storytelling implementation review

Review: 13 November 2026. Scope: the company service page and its enquiry handoff. Existing platform/API/database changes are outside this task.

## Initial audit and implementation checklist

- [x] Read the complete 1,272-line page, its state, data, navigation, FAQ and media dependencies, project brief, route generation and Pages workflow.
- [x] Verify media before designing: `public/media/hero.mp4` is a real silent H.264 Chilancho capture excerpt, 1600 × 900, 30 fps, 10.3 seconds, 4,132,587 bytes (`ffprobe`). Its provenance is recorded in `public/media/README.md`. The four `media/tour` stills come from the recorded computer-lab capture.
- [x] Identify misleading interactions: the film facade changes stills and prints “Now playing”; `SplatEmbed` draws generated canvas points rather than loading a captured model. Preserve that shared, already-edited component; replace its use on this page with the existing owner-confirmed XGRIDS experience.
- [x] Check before/after inputs: the first is a campus, the second a heritage courtyard collage. They are not a corresponding dated pair. Do not reuse them as restoration evidence.
- [x] Check project evidence: Chilancho is recorded as an in-house research project, with an owner-confirmed external viewer URL. Other case-study content still has unresolved facts; do not promote invented outcomes or link visitors into draft evidence.
- [x] Check contact flow: existing `/contact/?type=storytelling` selection and `sendLead` support a format handoff without a new backend. The unconfirmed budget control exposes a public placeholder.
- [x] Replace simulated playback with native video and a deliberate external 3D load, with recovery paths.
- [x] Build the hero, five-format explorer, audience framework, real evidence, four-step process and enquiry journey.
- [x] Repair comparison clipping, keyboard/touch operation and honest labels.
- [x] Remove public placeholders and qualify unverified output, accuracy, language, timing, licensing and business-result claims.
- [x] Check lint, types, existing tests, root production and `/RCAAS` static builds, then browser layouts/interactions and errors.

## Design direction

Use the existing Inter family and RCAAS tokens: white `#FFFFFF`, ink `#09090B`, muted `#52525B`, surface `#FAFAFA`, line `#E4E4E7`, accent `#E11D48`. A large, left-aligned two-line headline leads into a panoramic genuine capture. The media is the memorable element; section labels, navigation and format choices stay quiet. Alternate a light format explorer with a dark audience workshop; give the actual project evidence more space than technical specifications. Small radii frame media; avoid turning every paragraph into a card. Keep the original light footer and company grid.

Layout: headline + brief → full-width capture → playable/interactive showcase → five format choices + detail → four questions by audience → documented research example → four process steps → selected-format enquiry.

## A–D. Implementation and repaired behavior

The page now leads with “Real places. Remarkable stories.” and the genuine Chilancho capture. It distinguishes a silent capture excerpt from a finished campaign film. The video uses native play/pause, seeking, progress and fullscreen controls, `playsInline`, a poster and `preload="none"`, with no autoplay. The existing published XGRIDS experience loads after an explicit action, with a WebGL check, loading/slow states, a separate viewer link and the film alternative. The SDK and shared illustrative `SplatEmbed` are untouched.

Five format choices show a benefit, relevant capture imagery, proposed scope, applications and an enquiry link. Technical details use native disclosures. Tabs support Left/Right/Home/End, roving focus, selection state and labelled panels. Existing format hash links remain usable. The four questions retain hotel, education and property examples, with no forecast metrics. A genuine in-house research example replaces unverified client-film evidence. Four process steps lead into a service selector, project enquiry, WhatsApp and related-service/work links.

The comparison clips a full-size layer with `clip-path`, keeping both image coordinate systems identical. Its image surface and range input support mouse and touch; the native range also supports keyboard and tap-to-position. Two treatments of the same real capture are labelled as a concept rather than a restoration timeline. Images have reserved dimensions, only the hero is eager, and the 3D frame does not exist before a visitor requests it. Page-specific motion respects reduced motion.

The existing contact endpoint receives the selected format as a human-readable line in its normal lead message. Unknown query values are ignored; the visitor can change the format. Native radio inputs repair goal keyboard behavior. The unconfirmed budget widget now gives a useful optional-message instruction. A shared footer grid sizing correction prevents 16px touch input text from causing 320px horizontal overflow; its colours remain unchanged. The user-reported unterminated JSX attribute in HowWeWorkPage is repaired.

## B. Modified files

| File | Purpose |
| --- | --- |
| `src/features/marketing/pages/VisualStorytellingPage.tsx` | Rebuilt customer journey, format/audience interactions, evidence and conversion. |
| `src/features/marketing/storytelling.css` | Scoped page typography, layout, media, focus and responsive/reduced-motion styles. |
| `src/features/marketing/content/storytelling.ts` | Five format briefs, audience examples, validated enquiry context and tab navigation. |
| `src/features/marketing/components/StorytellingShowcase.tsx` | Real native video, opt-in external viewer and recovery states. |
| `src/features/marketing/components/StoryComparison.tsx` | Aligned conceptual comparison and pointer/touch/keyboard controls. |
| `src/features/marketing/pages/ContactPage.tsx` | Format handoff into the existing form/message, native goal radios and budget copy. |
| `src/features/marketing/meta.ts`, `App.tsx` | Page title/description and configured service/breadcrumb URLs. No invented video/review/FAQ schema. |
| `src/app/(site)/[[...slug]]/page.tsx` | Static canonical/OG URLs follow exported directory routes. |
| `next.config.mts` | Static directory indexes; narrowly allow the existing XGRIDS frame host in Node-host CSP. |
| `src/features/marketing/rcaas.css` | Footer grid shrink fix for touch devices. |
| `src/features/marketing/pages/HowWeWorkPage.tsx` | Close the broken JSX class-name quote reported by the user. |
| `test/storytelling.test.mjs` | Format URL allowlist/handoff and keyboard tab navigation regressions. |
| `CLAUDE.md`, this report | Current feature status, evidence and handoff. |

## E. Claims corrected

Removed the fictitious Basera 1:24 film, 4K/60fps/dual-audio labels, “Now playing” stills and timed waypoint controls. Removed universal 4K/8K masters, WebXR/headset/offline-kiosk delivery promises, guaranteed English/Nepali voice production, survey-grade/coordinate alignment claims, two-to-six-hour/zero-downtime capture, seven-to-fourteen-day delivery and predicted booking/conversion improvements. Resolution, codecs, runtime, language, hardware, licensing, access and delivery dates now depend on the agreed brief and available source. Existing supported browser tours, viewpoints, edited camera routes and multi-channel planning remain described.

## F, H–I. Assets, limitations and next review

- A finished, approved campaign film and approved samples for social/event outputs have not been supplied. The available clip is a silent capture excerpt. Add finished deliverables with documented media rights when available.
- No corresponding dated repeat-capture pair was found. Supply one before presenting restoration/progress evidence; the current slider is expressly conceptual.
- The repository documents Chilancho as in-house research and its viewer as owner-confirmed. A final human review must confirm public media rights, credits and any future client naming; this implementation does not certify licensing.
- The external viewer returned HTTP 200 in Chrome and the page loads its frame. Model rendering, internal viewer accessibility/performance, genuine mobile GPU behavior and physical iOS/Safari playback still need device testing. The viewer may depend on third-party availability. No headset capability is claimed.
- GitHub Pages serves static files and cannot deliver enquiries or apply Next's response headers. A reachable production API with the correct origin configuration is still needed for live form delivery. Browser submissions were mocked; no real lead, email or WhatsApp message was sent.
- The web browsing tool could not read the initial public URLs. Local source, media probing and actual Chrome network/interaction checks supplied the evidence. `squirrel` is unavailable, so no squirrelscan score or full WCAG conformance is claimed. Screen-reader and real-network performance review remain.
- No dependency, backend schema, authentication, studio, tour-management or SDK change was made for this redesign. Existing concurrent work was preserved. Nothing was pushed or deployed.

## G. Validation

- `npm test`: **239 passed, 0 failed, 2 intentional skips** (60 frontend/tooling tests plus 179 server tests). A later focused run of `test/storytelling.test.mjs` and `test/frontend-audit.test.mjs` passed all 7 checks.
- `npx tsc --noEmit --incremental false`: passed. The clean, non-incremental check avoided stale generated route cache entries from earlier builds.
- `npm run lint`: 0 errors; 6 existing warnings in unrelated scene/studio/tour code.
- `npm run build`: passed, including TypeScript and route generation; the reported HowWeWorkPage parse error is gone.
- Isolated GitHub Pages build using the CI route exclusions, `NEXT_OUTPUT_EXPORT=1`, `NEXT_PUBLIC_BASE_PATH=/RCAAS` and the GitHub Pages site URL: passed. It produces `out/services/visual-storytelling/index.html`. Served canonical/OG URLs include `/RCAAS`; target media, contact, work and related-service routes returned 200.
- Chrome at the root preview: 1440px desktop plus 768/390/320px touch layouts. Passed real video decode/play/pause/seek, no initial video download/autoplay, explicit 3D load (external page HTTP 200), blocked-video/no-WebGL recovery, tabs/arrow/end keys, FAQ disclosure, range keyboard/touch, layer-coordinate equality at 0/25/75/100%, reduced-motion styles, unchanged light footer, no horizontal scrolling, no public main-content draft markers, format preselection and a mocked successful lead message/thank-you route. No page JavaScript exceptions were captured.

Completion check: the final `/RCAAS` static artifact passed the same full Chrome run, including media, keyboard/touch controls, 768/390/320px layouts, reduced motion, base-path enquiry handoff and mocked submission. It captured no page JavaScript exceptions. A separate image-surface drag check passed at 320px: mouse movement from 10% to 80% ended at 80%, and a touch drag ended at 65%. Pointer tracking uses a stable ref so clipping changes cannot interrupt the interaction. The final production and static builds passed after that correction; lint remains at 0 errors/6 existing warnings, and the focused 7 tests passed.

Logs, fixture scripts and screenshots live under ignored `qa-bug-hunt/storytelling-*`; the static build was performed in an isolated copy, without removing platform routes from the working checkout. In particular, `storytelling-browser/root-results.json`, `static-results.json`, `top-320.png` and `comparison-320.png` retain the browser evidence. The existing video and external viewer still require the human/device review described above.
