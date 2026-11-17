# Industry Solutions redesign

17 November 2026. Scope: the homepage Industry Solutions section. The current heading, introduction, eleven industry records, photographs, destinations and draft/noindex policies are preserved. No dependencies were added. Nothing was committed, pushed or deployed.

The owner's latest instruction is **continuous slow movement, rather than six-second advances**, retaining pause and reduced-motion controls. This supersedes both the attachment's original default of no autoplay and the intermediate timed-slide version. Only the continuous version is the final implementation.

## Design decision

These are design assessments against this site, not scores from a user study.

| Criterion | A: Cinematic coverflow | B: Editorial filmstrip | C: Split-screen explorer | D: Interactive card deck |
|---|---|---|---|---|
| Brand suitability | Cinematic, but competing perspective effects | Photography and restrained capture aesthetic fit RCAAS | Fits the brand; repeats the nearby Work composition | Playful relative to the site's editorial tone |
| Visual quality | Strong central focus; flips interrupt reading | Large active photograph with clear adjacent panels | Excellent image/text separation | Depth is attractive; overlapping titles become difficult |
| User experience | Additional front/back state to understand | One active industry; direct details and CTA | Explicit list is easy to understand | Hidden cards make position less obvious |
| Mobile | Requires a different stacked arrangement | Same content and controls; swipe with visible neighbour peeks | Long list must become a picker or tabs | Tactile, but gesture and flip conflicts need care |
| All-industry discovery | Needs an additional selector | Eleven-option selector, position counter and adjacent titles | Best immediate list visibility on desktop | Weakest unless another selector is added |
| Accessibility | Perspective/flip and focus states require extra handling | Native controls, stable DOM, visible focus and linear fallback | Straightforward semantics | Overlap, hidden faces and drag alternatives require care |
| Performance | Additional transformed layers and face rendering | CSS transitions; eleven existing lazy responsive images | Simplest image transition | Extra transforms/layers and gesture coordination |
| Maintenance | More responsive and flip states | Small scoped CSS module and one component | Simple, but duplicates an existing section pattern | More stacking, gesture and face states |

**Selected: B, editorial filmstrip.** It gives the photography space while making the active industry and next action obvious. B and C received [lightweight visual previews](screenshots/industry-redesign-concepts-b-c.png); C had no clear advantage sufficient to displace the preferred B. No dramatic flip or perspective was added because it made the copy harder to read.

Reference review: [GallerySlider.tsx](https://github.com/prabhatbhusal/polk_road/blob/main/src/components/GallerySlider.tsx) was read through the connected GitHub tool. Its central hierarchy, smaller neighbours and circular arrangement informed the composition. Its source was not copied; render-time viewport reads, oversized page overflow and uncontrolled timers were avoided. The [Dribbble reference](https://dribbble.com/shots/24266607-Top-Deals-Card-Carousel) page was accessible, but its actual shot image could not be retrieved. Visual analysis of that shot is **not claimed**.

## Visual evidence

| Capture | Evidence |
|---|---|
| Previous masonry, desktop | [1440 px baseline](screenshots/industries-after-1440-viewport.png), retained from 16 November's accepted audit |
| Previous masonry, phone | [390 px baseline](screenshots/industries-after-390-viewport.png), retained from 16 November's accepted audit |
| Proposed B and C | [Static comparison](screenshots/industry-redesign-concepts-b-c.png) |
| Implemented filmstrip, desktop | [1440 px](screenshots/industry-redesign-after-1440.png) |
| Implemented filmstrip, phone | [390 px](screenshots/industry-redesign-after-390.png) |
| Long title and expanded details | [320 px](screenshots/industry-redesign-details-320.png) |

The new captures show the local production build. Fixed navigation, mobile action chrome and the decorative cursor are hidden only during section capture to keep the subject unobstructed; their product source is unchanged. A fresh pre-change dev capture was discarded because the old animation remained transparent before hydration. The historical baseline above is identified by its actual date rather than presented as a fresh capture.

## Implementation and interaction

- One centre-weighted panel and its neighbours form a photographic filmstrip. The nearest panel has the strongest scale/brightness; the emphasis transfers continuously as panels move. To keep the moving text readable, panels share a stable width instead of shrinking while their copy is passing through. All eleven articles have stable identities and are rendered once. No duplicate slide clones or render-time browser-width queries are used.
- Existing dark ink, white text and accent tokens remain. Panels have nearly square corners; a restrained translucent caption replaces the crowded masonry cards. The approved heading and introduction are unchanged.
- CSS controls layout at every width. A centred panel is 232 px at a 320 px viewport, 302 px at 390, about 415 px at 768, about 553 px at 1024, and 650 px at 1440/1920. Phone neighbours remain partly visible. Images retain `object-fit: cover`, responsive sources and lazy decoding. The viewport uses `overflow: clip` so focus or browser automation cannot accidentally scroll its clipped contents sideways.
- Previous/next, the labelled eleven-option native picker, ArrowLeft/ArrowRight, Home/End and horizontal pointer swipes navigate circularly. Manual navigation retains or restores a useful focus position. Controls are at least 44 px high.
- Hover or keyboard focus reveals the selected description and audience. Touch visitors can tap the photo or Details. The Explore industry link stays separate, has a real base-path-aware href, and preserves modified-click behaviour. A completed swipe cannot consume the next intentional CTA activation.
- A time-based animation frame loop drifts at **24 CSS pixels per second**, without slide stops. Progress is written to one scoped CSS variable; React updates the nearest industry only when the centre boundary is crossed. Circular offsets are committed before paint, preserving the same visible geometry at the last/first boundary. Pause/Play is visible before the panels. Hover suspends movement; keyboard entry into a panel centres it and stops rotation. Manual selection, swiping and detail-button interaction also stop it until Play is pressed. Offscreen and hidden-tab guards suspend scheduling. The rotation control itself can restart movement while it holds focus. Resuming continues from the frozen position; missed background time is not replayed.
- Reduced motion disables automatic rotation and CSS transitions, including when the preference changes during a visit. The counter avoids automatic live announcements during rotation. Collapsed text is hidden from accessibility APIs; far slides are inert. Native industry links and summaries remain available without JavaScript.
- Panel height and the status-message space are reserved. Expanding text or changing panels does not move the next homepage section. No animation library is required by this component.

## Verification

Accepted checks and counts are recorded below; raw logs and scratch builds are ignored under `qa-bug-hunt/`.

| Check | Command / method | Actual result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | Passed on the final source. An earlier optional-field typing error in the new test was corrected. |
| ESLint | `npm run lint` | Passed: 0 errors, the same 6 existing warnings. |
| Relevant unit tests | `node --test test/publication-safety.test.mjs test/marketing-schema.test.mjs` | 16 passed, 0 failed/skipped. |
| Full Node production build | `node qa-bug-hunt/industry-node-build.mjs --reuse`, which runs the real `npm run build` with isolated local environment/dist output | Passed, including the normal CSS prebuild, TypeScript and publication postbuild gate: 29 indexable of 51 scanned pages, no unresolved placeholders. |
| GitHub Pages export | `node qa-bug-hunt/industry-static-build.mjs` | Passed with `/RCAAS` base path in an isolated same-drive snapshot, excluding only the dynamic routes/proxy excluded by existing CI. Uses the complete root-generated marketing CSS. Gate: 28 indexable of 52 scanned pages, no unresolved placeholders. |
| Final browser regressions | PowerShell: `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3531/'; npx playwright test test/browser/industry-solutions.spec.ts test/browser/company-polish.spec.ts --grep 'all eleven\|arrows and keyboard\|a swipe advances\|continuous movement\|industry links remain\|industry filmstrip' --timeout=90000 --reporter=line`; repeat with `http://127.0.0.1:3532/RCAAS/`. | Node preview: **12 passed** (desktop + phone). Static preview: **12 passed**. 24 final browser cases, 0 failed. |
| Responsive/content probe | `node qa-bug-hunt/industry-final-probe.mjs` | All eleven industries at **320, 390, 768, 1024, 1440 and 1920 px**: no page overflow, clipped active headings, overflowing captions, broken images or undersized CTA/details targets; section height change **0 px** across selection/reveal. No page or hydration errors recorded. Firefox and WebKit passed keyboard wrap, focus reveal, reduced motion and industry-link navigation after the Firefox sandbox startup failure was retried outside the sandbox. |

The new regression tests exercise all eleven choices, titles, summaries, audience text, loaded images and original hrefs; arrows/keyboard wrap; real mobile touch swipe followed by a first-attempt CTA activation; no-JavaScript links; continuous movement over consecutive intervals; automatic last-to-first wrap; frozen Pause, moving Resume, and reduced-motion freeze. The superseded six-second implementation's earlier passes are excluded from final acceptance.

## Files changed

- `src/features/marketing/home/components/IndustriesSection.tsx`: photographic filmstrip, interaction, circular selection and controlled continuous motion.
- `src/features/marketing/home/components/IndustriesSection.module.css`: scoped responsive layout, reveals, focus and reduced motion.
- `test/browser/industry-solutions.spec.ts`: content/routes, keyboard/circular navigation, swipe/CTA, continuous movement/loop/pause/resume/reduced motion and no-JavaScript regressions.
- `test/browser/company-polish.spec.ts`: replaced the obsolete masonry assertion with the new filmstrip assertion.
- `CLAUDE.md`: feature status and this handoff.
- This report and the four new comparison/result screenshots linked above.

## Limits and remaining risks

- The installed Next.js 16.4.3 build reported a known-vulnerability upgrade notice. The first build was stopped after compilation; repeating the identical command, as permitted by the notice, completed normally. No warning suppression, dependency upgrade or framework patch was included in this section change. Production security acceptance still requires a separately reviewed framework update.
- Browser automation uses local previews and isolated GET responses, with writes blocked. It does not certify real phones, real Safari, screen-reader use, remote hosts or outbound services. No genuine client record was changed.
- The full pre-existing website suite was not certified by this focused change. Its previously recorded contact/navigation failures and the wider publication/hosting decisions in the six-task assessment remain separate outstanding work.
- Existing draft-sector links remain as supplied. Their visibility/publication decision was not altered. No service/detail page, header/footer, Studio, authentication, backend, database, viewer, SEO system or publication gate implementation was changed.
