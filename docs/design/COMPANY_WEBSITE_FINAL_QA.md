# Company website final QA

**Latest assessment — six-task addendum, 16 November 2026: READY FOR STAGING.** The consolidated [six-task completion matrix](../RCAAS_WEBSITE_SIX_TASK_COMPLETION.md) and addendum at the end of this report supersede earlier publication counts and limitations where explicitly stated. This is not production approval or deployment. Earlier work/evidence below is retained rather than presented as a fresh run.

Date: 16 November 2026. Starting commit: `5ef01b3`, with Claude's existing uncommitted visual corrections. Scope: public company marketing pages and their browser regression tests. Nothing committed, pushed or deployed.

The safe website polish and content corrections are complete. Node production and the `/RCAAS` static export build and pass their publication gates. Owner evidence, publication choices and live hardware/provider checks below remain open; this report does not certify every advertised service or every device.

## Handoff and preservation

Read `CLAUDE.md`, `docs/ARCHITECTURE_COMPLETION.md`, `docs/FOLDER_STRUCTURE.md`, `docs/WEBSITE_SPEC_GAP_ANALYSIS.md`, `docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md`, `docs/TECHNICAL_SEO_AUDIT.md`, and `VISUAL_REFINEMENT_REPORT.md`. Reviewed the current source/diff and previous screenshot evidence. No listed handoff document was missing.

Recorded the initial worktree in ignored `qa-bug-hunt/company-start-status.txt`; saved baseline copies of files that already had changes. Existing tracked and untracked work was preserved. No architecture migration was repeated. Footer colours, brand tokens, approved page compositions and the narrower Digital Twins family containers/breadcrumbs were retained. No Studio, authentication, backend, database, booking, SDK or client-project file was modified.

## Previous Claude corrections independently checked

| Correction | Current verification |
|---|---|
| Six missing photo gradients | Correct classes remain in SplatEmbed, About, Drone Mapping and the draft cost guide. Computed gradient checks on Home/About/Drone Mapping/cost guide found 7/7/1/1 gradient elements and none with `background-image: none`. Reviewed the previous before/after demo-overlay images. |
| `/services` CTA clipping | At 320/390/768/1024/1440/1920 px, client width equals scroll width: 138/208/244/244/244/244 px. Existing `shrink-0` and wrapping correction kept. |
| Home hero dot | Existing inline dot and balanced centred text retained; previous phone capture reviewed, current home included in six-width browser sweep. |
| Digital Twins specification alignment | Existing baseline alignment, gaps, nonshrinking labels and right-aligned values retained. Coordinate row bounds checked at all six widths; no overflow. |

These were verified as existing changes, not counted as newly implemented corrections.

## Content corrections and evidence

| Location | Correction and reason |
|---|---|
| Services / ValueChainGraphic | Replaced dwell-time, heatmap, booking/conversion tracking and archive-certification promises with agreed goals, delivery review and enquiry routes. Platform source and the publication/register review explicitly do not verify platform analytics. |
| Immersive Experiences | Removed unconditional WebXR compatibility/browser-link/app-package and 1:1-scale claims. Hero, VR card and comparison now make headset/kiosk delivery project-specific. AR implementation wording also depends on the agreed format. Removed another unverified heatmap-dashboard promise from the interactive-experience card. |
| Existing Quest statement | Retained Meta Quest 2/3/3S as **owner-reported tested models**, supported by the earlier publication decision. This QA did not test a headset or demonstrate a platform VR mode. Existing FAQ distinction remains. |
| Digital Twins | Removed unconfirmed RVT/Revit-ready/LOD promises from the specification, badge and as-built description; formats and detail are agreed in the brief. Removed unconditional Nepal Grid/WGS84/EPSG assertions from the affected specification and survey copy. Software reference/use-case mentions do not establish an RVT delivery promise. |
| Laser Scanning | The wider contradiction scan found a second fixed RVT/IFC/OBJ and LOD 200/300 deliverable card. It now describes optional mesh/CAD/BIM modelling with format, detail and intended use agreed first. |
| Learn | Replaced “Written from real projects” with planning-guide wording. Verified project-specific observations/authorship remain outstanding under L01/L02; no case evidence was invented. |
| Chilancho photograph | Inspected the existing image and its uses/filenames: `case-cards/chilancho-stupa`, `splat-embed/chilancho-stupa`, the carousel and work menu. Its appearance raises the previously recorded Swayambhunath concern, but naming is not provenance. No authoritative identification or approved replacement was established. Left unchanged for owner verification; did not relabel another monument. |

No new figures, delivery deadlines, software guarantees, draft publication decisions or numerical performance claims were introduced. A source scan found no remaining `heatmap`, `dwell time`, `WebXR`, `Revit Ready` or `RVT` promise in the marketing source. This is not a business certification of all remaining service copy.

## Visual and interaction changes

| Component | Evidence and correction |
|---|---|
| Homepage industries | At 1440 px the existing five columns produced eleven 230 px cards with eleven truncated audience labels. Four CSS columns produce 292 px cards with wrapping audience labels. Responsive counts are 1/1/2/3/4/4 at the six widths. Photo crops, card typography, shadows and light/dark identity are preserved. CSS columns replace the server-five-column/client-resize regrouping, eliminating that hydration-time regrouping mechanism. CSS flows down columns; keyboard order follows the source industry order. |
| Custom LiDAR cursor | Preserved reticle, CAPTURE label, XYZ readout and point-cloud aesthetic. Movement now updates refs through animation frames rather than React position state; listeners no longer reinstall on visibility changes. Canvas work settles after movement, stops in hidden documents/on leave, and suppresses decorative drawing for reduced motion. Overlay remains noninteractive and hidden from accessibility APIs; touch-only devices omit it. No cursor redesign. |
| Header dropdowns | Previously Tab from an open disclosure went to the next top-level item, bypassing its panel. ArrowDown now opens and enters the panel, and Tab enters an already open panel. Focus inside holds it open; Escape closes and restores focus. Mouse and mobile behaviour retained. |
| Services carousel | Visual dots remain 8 px high (active 28 px wide); actual buttons are 40 × 32 px. Active state is announced. Current cards are native keyboard-accessible links; arrows transfer card focus, focus pauses autoplay, and reduced motion stops autoplay/transitions. A final drag probe reproduced a pre-existing defect in both baseline and updated builds: horizontal drag followed the card link. Pointer capture now distinguishes a horizontal swipe over 50 px from a click, changes the selected card and suppresses the pointer click. Existing motion/arrow controls remain. The focused regression includes dragging without navigation. |
| Card focus contrast | An unlayered global focus fallback overrode the layered Tailwind outline colour, producing a dark focus outline against the dark industry section. Added scoped marketing rules for industry/carousel links with the existing soft-accent colour and a 4 px offset. Global/Studio focus styles were not changed. |
| Intentional family differences | Digital Twins' narrower layout and breadcrumb treatment are consistent across its three related pages; moving all three was not justified by a defect. Visual Storytelling's approved larger heading also stays. |

## Browser and responsive evidence

The local production sweep loaded all **45 public route entries at six widths: 270 page loads**. Widths: 320, 390, 768, 1024, 1440 and 1920 px. Each page was scrolled to trigger lazy images/reveals. Results: zero failing responses, horizontal-overflow findings, broken-image findings, clipped heading/paragraph/button findings or uncaught page errors. Every entry had one main landmark and one main H1. Checks are browser heuristics, not a complete visual or WCAG certification. Later copy-only corrections on the three affected service pages received an additional six-width check.

Actual installed **Chromium, Firefox and WebKit** ran the desktop menu keyboard/mouse/Escape checks, carousel dot/arrow/card keyboard navigation and 390 px mobile-menu Escape checks; all passed. All four desktop dropdowns were captured open. Windows Playwright WebKit is not a claim of testing the Safari application. No physical phone/tablet/headset or screen reader was used.

Contact testing intercepts the lead POST with synthetic 500 then 200 responses. Invalid phone input prevents submission; the failure retains entered details; retry reaches thank-you and records exactly two mocked requests. No real enquiry was delivered. Existing format tabs, keyboard comparison range, enquiry query/history, planner, unknown routes and legacy aliases also pass the repository browser suite.

Reduced-motion cursor checks pass, and decorative layers do not intercept pointer input. Form labels, focus indicators and representative card contrast/hover behaviour were inspected separately. Photograph text was reviewed visually with the restored scrims; it was not assigned an invented pixel-level contrast certification. No automated whole-site accessibility score is claimed.

The focused production probe checked 18 final-copy route/width combinations with zero overflow/clipping findings and found labels on every visible contact control. Representative white-card text measured 6.29:1 (hovered heading), 7.73:1 (body) and 4.83:1 (audience label); browser canvas conversion was used for computed OKLCH colours before calculating luminance. The keyboard outline now computes to a solid 2 px `rgb(251, 113, 133)`. The industry image hover transform still changes. Chromium CDP touch input also confirmed swipe changes the selected carousel card while retaining `/services`, and a subsequent tap navigates normally; this is emulation, not hardware testing.

Development tests emit an existing reduced-motion hydration style warning from `CaseStudyShowcase` and a client script-tag warning. Neither is an uncaught page error, and neither was introduced by these changes. They remain follow-up accessibility/rendering review items; the suite's green result must not be read as “zero console warnings.” Six existing lint warnings also remain outside this change.

## Performance and media

Measured before/after on isolated local production previews: unthrottled Chromium, 1440 × 1000, DPR 1. Instrumentation counted the cursor canvas's clears, observed layout shifts/long tasks and sampled initial resource transfer. This is one exploratory run, not field Core Web Vitals or Lighthouse.

| Observation | Before | After |
|---|---:|---:|
| Cursor clears during 1,200 ms after settling | 73 | 0 |
| Reduced-motion idle clears during 500 ms | 30 | 0 |
| Observed CLS | 0.001543 | 0.001540 |
| FCP | 116 ms | 116 ms |
| Observed long tasks | 0 | 0 |

The confirmed improvement is removal of idle decorative canvas work. Do not infer a meaningful CLS/FCP improvement from these samples. Resource bytes were 2,479,912 and 2,097,277; image/cache/loading variation means these are not a verified bandwidth reduction.

Existing responsive image variants/lazy loading and Next font loading (`display: swap`) are retained. No new dependency or eager 3D loader was added. The Visual Storytelling film retains native controls and `preload="none"`; its MP4 responds with `206 video/mp4` to a range request. Zero viewer iframes exist initially or after selecting Interactive 3D; explicit Load creates one iframe pointing at the owner-confirmed XGRIDS URL. The external response was intercepted for this safe test: **genuine remote 3D rendering, video playback quality and headset behaviour are not verified by this probe**.

## Build and regression results

| Command/check | Actual result |
|---|---|
| `npx tsc --noEmit` | Passed, including new browser test source. |
| `npm run lint` | 0 errors, same 6 existing warnings. |
| `npm test` | 78 client tests and 192 API/server tests passed; 2 server tests skipped. Total 270 passed, 2 skipped. |
| `npx playwright test --timeout=90000 --output=test-results/company-final` | 32 passed, 0 skipped, against an isolated checkout with test-only Studio fixtures earlier in this continuation. The final drag/focus corrections were subsequently checked in the production browser runs below. Fixtures are synthetic; no real client scene was edited. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3521/ npx playwright test --timeout=90000 --output=test-results/company-node-verified` | Final production source: 20 passed, 12 fixture-only tests intentionally skipped. Includes the new desktop/phone drag-without-navigation regression. |
| `npm run css:rcaas`, then `node qa-bug-hunt/company-preview.mjs final --reuse` | Passed. Isolated full Node `next build --webpack`, TypeScript and publication gate. Gate: 31 indexable of 51 generated HTML pages, no unresolved placeholders. |
| `node qa-bug-hunt/company-preview.mjs export --reuse` | Passed. `NEXT_OUTPUT_EXPORT=1`, `NEXT_PUBLIC_BASE_PATH=/RCAAS`, isolated static build. Omitted only the same unsupported dynamic Studio/tour routes and proxy as Pages CI. Gate: 30 indexable of 52 generated HTML pages, no unresolved placeholders. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3522/RCAAS/ npx playwright test --timeout=90000 --output=test-results/company-static-verified` | 20 passed; 12 Studio fixture tests intentionally skipped on the export. These skips are not passes. HTML report directory was set separately to prevent report collisions. |
| `node qa-bug-hunt/company-cross-browser.mjs` | All three browser engines passed the focused interactions described above after the final changes. Firefox initially crashed before page creation in the sandbox; the successful rerun used the installed engines outside that sandbox. |
| Production responsive probe | 270 public page loads; zero recorded failures. |
| `node qa-bug-hunt/company-handoff-probe.mjs` | 45 route checks per build plus two sitemap checks: 92 checks. Status/title/canonical/base path/parseable JSON-LD/one H1 verified. Both sitemaps return 200 with 30 URLs. Existing noindex flags retained on draft industry/case-study/guide/legal/blog pages and thank-you. |
| `node qa-bug-hunt/company-accessibility-probe.mjs` and `node qa-bug-hunt/company-touch-probe.mjs` | Final production source: 18 additional responsive checks, form labels, computed focus/contrast/hover and pointer drag passed; emulated touch swipe and tap passed. |
| Additional `npx playwright test test/browser/studio.spec.ts --timeout=90000 --output=test-results/company-fixtures-final` | All 12 fixture cases reported success, but this extra runner stalled after the last case and was interrupted during teardown. Not counted as another completed green suite. The earlier completed 32-case run and final 20-case public production/export runs are the completed browser evidence. |
| `git diff --check` | Passed. |

These are fresh runs, not copied historical results. Earlier test attempts exposed harness issues (a too-strict `0s` expectation versus the global 0.01 ms reduced-motion rule, an ambiguous alert locator matching Next's announcer, asynchronous card-focus timing, a cold dev-server timeout, and a static test URL missing its trailing slash). Corrected tests/runs supersede those attempts; raw logs remain available. The `/RCAAS/` trailing slash in the Playwright base URL is necessary for relative `./` navigation.

Builds used disposable snapshots linked to the installed dependencies, with an intentionally unavailable API upstream at port 39999. Expected build-time API connection warnings therefore do not demonstrate live API or lead-delivery availability. Neither the user's existing development server nor production data was used for mutations. Preview URLs are local verification, not deployed environments.

Stopped this run's local previews and removed its three verified disposable production/export snapshots after testing; raw logs and selected evidence remain. The additional development fixture run reported a Google Fonts fetch failure and used a fallback; production builds succeeded. Live build-network/font availability remains an environment consideration.

## Exact files changed in this continuation

All paths below are relative to the repository root:

- `src/features/marketing/home/components/IndustriesSection.tsx`
- `src/features/marketing/components/CaptureLidarCursor.tsx`
- `src/features/marketing/components/CurvedArchCarousel.tsx`
- `src/features/marketing/components/Header.tsx`
- `src/features/marketing/components/ValueChainGraphic.tsx`
- `src/features/marketing/pages/ImmersiveExperiencesPage.tsx`
- `src/features/marketing/pages/DigitalTwinsPage.tsx` (copy changes layered on Claude's preserved alignment fix)
- `src/features/marketing/pages/LaserScanningPage.tsx`
- `src/features/marketing/pages/LearnPage.tsx`
- `src/features/marketing/rcaas.css` (scoped card focus rules only)
- `test/browser/company-polish.spec.ts` (new focused regressions)
- `docs/design/COMPANY_WEBSITE_FINAL_QA.md` (this report)
- `docs/design/VISUAL_REFINEMENT_REPORT.md` (dated continuation appended)
- `docs/design/screenshots/` (nine selected captures listed below)
- `CLAUDE.md` (handoff note appended)

Other dirty source files and `.gitignore` were already changed on arrival. Their changes belong to the previous visual refinement; they have not been reverted or claimed as new work. Existing `!docs/design/` allows these selected report assets to be tracked. Raw browser reports, traces, scratch builds and logs stay in ignored `qa-bug-hunt/`, `playwright-report/` and `test-results/`; nothing was staged.

## Selected screenshot evidence

| View | Before | After/current |
|---|---|---|
| Industries desktop | [1440 before](screenshots/industries-before-1440-viewport.png) | [1440 after](screenshots/industries-after-1440-viewport.png) |
| Industries phone | [390 before](screenshots/industries-before-390-viewport.png) | [390 after](screenshots/industries-after-390-viewport.png) |
| Open desktop services menu | — | [Services](screenshots/navigation-open-services-1440.png) |
| Open desktop industries menu | — | [Industries](screenshots/navigation-open-industries-1440.png) |
| Open desktop work menu | — | [Work](screenshots/navigation-open-work-1440.png) |
| Open desktop about menu | — | [About](screenshots/navigation-open-about-1440.png) |
| WebKit mobile menu | — | [390 px](screenshots/mobile-menu-webkit-390.png) |

Previous four correction pairs remain in this folder and are indexed by `VISUAL_REFINEMENT_REPORT.md`. New captures use normal motion and scroll through reveal-dependent cards before returning to the capture position. They are representative viewports, not exhaustive visual approval of every page.

## Remaining owner decisions and deployment limitations

1. Establish the Chilancho photograph's provenance and supply/approve a replacement if necessary, across the carousel, demo posters and menus.
2. Decide whether to keep linking the three draft industries from home/menu/footer. They remain noindex; they were not published by this task. Cost/pricing, legal, case-study and blog drafts also retain their gates.
3. Confirm CAD/BIM formats/detail, project VR/AR delivery requirements and evidence of headset testing. Supply guide authorship, dates and real project observations. The conservative copy is not a substitute for those inputs.
4. Approve real social destinations, legal/privacy text, pricing, any additional service/industry scope and remaining publication-register items. No invented links or decisions were supplied.
5. Decide whether illustrative canvas demos should be replaced with approved genuine viewers. Labels and click-to-load behaviour remain; this task does not validate them as captured 3D assets.
6. Verify physical devices, actual Safari, assistive technology, real media playback and genuine remote 3D/WebGL rendering before claiming compatibility. Review the existing CaseStudyShowcase reduced-motion hydration warning.
7. Test live API/form delivery and production host/DNS/SSL/security headers only in an approved deployment environment. Static Pages hosting cannot itself supply Node API business logic; its real API endpoint/CORS and host settings need deployment verification. Local builds are not a VPS launch or deployment approval.
8. Review the previously documented optional SEO/editorial choices: title/description lengths, per-page OG images, language variant, analytics/consent and AI-crawler policy. Existing canonical, structured-data, sitemap and publication safeguards were preserved.

Optional Studio design suggestions (not implemented or part of website completion): review selection feedback, camera-track timeline usability and conflict-resolution clarity in a separate Studio task with genuine asset/hardware regression coverage. No Studio redesign is proposed as a prerequisite for this website handoff.

## Six-task addendum — 16 November 2026

Release assessment: **READY FOR STAGING**. All six original objectives now have requirement-level statuses, evidence, changes, limitations and owner decisions in [RCAAS_WEBSITE_SIX_TASK_COMPLETION.md](../RCAAS_WEBSITE_SIX_TASK_COMPLETION.md). Existing verified architecture/design work was retained; this pass completed safe gaps rather than repeating the migration or treating historical documentation as implemented functionality.

### Recovered sources and publication changes

Located `Website Planning (1).docx`, its actual **220-page PDF**, the distinct `Website Planning.docx`, the **236-page** November completion master, and the **three-page** confirmed-decisions PDF/DOCX. The matrix records their SHA-256 identities and content-comparison method. Word's reported 189-page layout remains unverified; a missing DOCX can no longer be cited as the blocker. Extracted internal text remains ignored QA material and was not published.

The recovered owner decision holds educational guides until genuine project observations and editorial approval exist. Both currently unapproved educational guides are now draft/noindex, absent from Learn discovery and sitemap, and show review notices on their unchanged review URLs. Learn shows a useful review/contact state instead of an empty card grid. The current sitemap contains **28** marketing entries, down from 30; this is an intentional publication correction. Cost guide, case studies, legal, blog and industry draft holds remain.

Removed draft-sector promises from industry metadata and excluded draft industry records from its collection schema. Removed the unconfirmed corporate LinkedIn `sameAs` assertion (Register G07); personal team links and newer approved profile/design decisions were preserved. Learn metadata/schema no longer claims guides were written from verified projects. Added the missing existing-visible breadcrumb chains for Gallery, Cookies and Security, with no URL changes. Updated the sitemap content date to 16 November.

The standard project, intended VPS instructions, and both configured CI builds use `npm run build`, so their `postbuild` gate is not bypassed. Bare `next build` still skips npm lifecycle hooks and is not a documented release path; it also omits CSS prebuild and the pinned webpack command. No redundant Next hook was introduced. A confirmed CLI defect was fixed: an existing but empty HTML output directory now exits 2 instead of reporting success. Actual CLI regressions also verify exit 1 for indexable markers and exit 0 for intentional noindex drafts.

### Measured accessibility and rendering corrections

- Case-study labels on the dark section measured below 4.5:1; small grey text now uses existing zinc-400 and active numbering uses the existing soft accent. Large inactive titles keep their intentional subdued appearance.
- A service-step number measured about 4.0:1 on pale pink; it now uses the existing stronger accent. No palette token or footer colour changed.
- Desktop disclosure buttons measured 22 × 30 px. They are now 24 × 30 px, and their negative margin was removed after a follow-up audit showed adjacent links obscured part of the expanded target.
- Contact information used invalid definition-list markup (`dt/dd` inside links/spans). It is now a named semantic list with the same rows, labels, links, spacing and icons.
- Home, Services and Contact primary introductions were invisible in initial HTML until their fade hydrated. They now paint before JavaScript while retaining their vertical movement and the home typewriter. A JavaScript-disabled browser regression checks this behaviour.
- A real phone-width planner failure surfaced during scripted interaction measurement: its close button could sit outside the viewport. The panel now has a viewport-bounded scroll area, named dialog semantics, initial and contained keyboard focus, Escape dismissal, restored focus and temporary background scroll locking. Validation, enquiry payload and API behaviour were not changed.
- Showcase progress now renders stable initial server/client attributes; CSS handles reduced-motion progress suppression. The earlier specific hydration style mismatch is corrected. Generic Framer reduced-motion notices and the existing inert script-tag development warning are not represented as application crashes.

### Lighthouse and Web Vitals

Tools: cached **Lighthouse 13.6.0** and **web-vitals 6.2.3**; no project dependency/lockfile change. Local production Node preview, Windows Playwright Chromium. Mobile Lighthouse uses its recorded default simulated-throttling profile; desktop uses the desktop preset. Raw configuration, versions and compact before/after data are in [six-task-performance-summary.json](screenshots/six-task-performance-summary.json).

| Final Lighthouse sample | Performance | Accessibility | LCP | CLS |
|---|---:|---:|---:|---:|
| Home, mobile profile | 99 | 100 | 1,210 ms | 0.001892 |
| Home, desktop profile | 100 | 100 | 332 ms | 0.008760 |
| Services, mobile profile | 100 | 100 | 1,207 ms | 0 |
| Contact, mobile profile | 99 | 100 | 1,052 ms | 0 |
| Visual Storytelling, mobile profile | 82 | 100 | 4,952 ms | 0.000139 |

Before the targeted corrections, valid samples were Home mobile 85/96 (LCP 4,177 ms), Home desktop 99/93, Services mobile 86/97 (LCP 3,995 ms), Contact mobile 90/94 (LCP 3,610 ms), and Storytelling mobile 83/100. The primary introduction changes remove a demonstrated hydration/opacity dependency. These are single local lab samples, not statistically proven percentage gains. Storytelling's image remains its LCP element; its 4.95 s simulated-mobile result is an explicit performance risk for staging/device review. Its approved image/composition was not replaced to chase a score.

Separate scripted `web-vitals` visits measured real browser event timing. These visits used no network throttling, DPR 1, 390 × 900 with CDP CPU 4× or 1440 × 900 with CPU 1×. Each exercised representative menu/planner, carousel, invalid form, or format/media-tab interactions, then scrolled. API reads were mocked and writes blocked. Do not compare their LCP directly with Lighthouse's simulated-network LCP.

| Scripted visit | Phone INP | Desktop INP | Phone CLS | Desktop CLS |
|---|---:|---:|---:|---:|
| Home | 112 ms | 176 ms | 0.000284 | 0.008430 |
| Services | 80 ms | 80 ms | 0 | 0.000642 |
| Contact | 40 ms | 48 ms | 0 | 0.000619 |
| Visual Storytelling | 80 ms | 48 ms | 0 | 0.000723 |

LCP/INP/CLS callbacks were present for all eight scripted visits. No 3D iframe was loaded. This is neither field INP nor a 75th-percentile user population. Lighthouse's 100 accessibility scores on these five samples are automated results, not screen-reader, physical-device or whole-site WCAG certification. Existing click-to-load video/3D behaviour and the earlier cursor idle-work improvement remain.

### Final builds, routes and safe platform checks

Actual npm lifecycle builds passed in isolated **same-drive, unignored** snapshots with complete generated Tailwind utilities checked: Node gate **29 indexable of 51 generated HTML pages**, export gate **28 of 52**, zero unresolved placeholders. The extra generated-HTML gate count must not be confused with the **28 public marketing URLs** in each sitemap. Node was built with production canonical identity `https://rcaas.tech`; the test API proxy remained local and deliberately had no live upstream. The static identity was `https://owner.github.io/RCAAS/`.

The final release probe completed **92 SEO/output checks**: 45 route entries per build plus each sitemap/robots/llms set. It checked status, current title/description, canonical, `og:url`, parsed page-level schema URL agreement, one main H1, draft noindex, three new breadcrumbs and absence of unconfirmed corporate social schema. Both sitemap URL sets exactly match their 28 indexable marketing URLs; robots and llms use the configured identity. The changed Home/Services/Contact/Learn/two-guide pages also passed **36** new route/width loads at the six requested widths, without recorded horizontal overflow, broken images or clipping. The earlier 270-load full-site result was not presented as a fresh 270-load rerun.

Final focused Chromium, Firefox and WebKit interactions actually ran. The existing menu/keyboard/Escape/card-navigation checks pass; the phone planner bounds/Escape/focus-restoration checks are also included. WebKit on Windows is not the Safari application. Reviewed current [Learn phone](screenshots/six-task-learn-390.png), [contact rows phone](screenshots/six-task-contact-details-390.png) and [showcase desktop](screenshots/six-task-showcase-1440.png) captures; the earlier before/after and four open-menu captures remain.

GET-only, unauthenticated platform smoke checks found:

- API health 200; session endpoint reports `authenticated: false`; private property collection rejects with 401.
- Production-preview `/login` and `/studio` return 200, noindex, `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`; no credential-field data was found in their HTML. This is an anonymous entry-point check, not a claim of live account lifecycle verification.
- The local public API currently exposes one published website (`chyasal-house`) and two gallery entries covering `chyasal-house`/`office-chyasal`. This confirms the sample-publication concern. No real record was unpublished, deleted or edited.
- Existing local `/s/chyasal-house`, `/t/chyasal-house`, `/t/office-chyasal` and the approved external XGRIDS viewer return HTTP 200. The site request needed a longer retry after a cold dev compile. HTTP shell availability is not genuine-3D/GPU/media/hardware certification; no browser beacons or provider messages were sent by this probe.

### Changed files in the six-task continuation

This inventory is in addition to the earlier continuation's files; overlapping files retain those earlier changes.

- Tooling/tests: `scripts/check-placeholders.mjs`, `test/publication-safety.test.mjs`, `test/browser/company-polish.spec.ts`.
- Discovery/publication: `src/app/sitemap.xml/route.ts`; marketing `meta.ts`, `data/guides.ts`, `structuredData/buildMarketingGraph.ts`, `structuredData/company.ts`, `structuredData/editorial.ts`, `structuredData/places.ts`.
- Marketing components: `components/GuideParts.tsx`, `components/CaseStudyShowcase.tsx`, `components/ProjectPlannerModal.tsx`, `components/ValueChainGraphic.tsx`, `home/components/HeroSection.tsx`, `rcaas.css`.
- Marketing pages: `pages/ComparisonGuidePage.tsx`, `pages/GaussianGuidePage.tsx`, `pages/LearnPage.tsx`, `pages/ContactPage.tsx`, `pages/ServicesPage.tsx`.
- Handoff: `.gitignore` (new matrix allow-list), `CLAUDE.md`, `docs/RCAAS_WEBSITE_SIX_TASK_COMPLETION.md`, `docs/WEBSITE_SPEC_GAP_ANALYSIS.md`, `docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md`, `docs/TECHNICAL_SEO_AUDIT.md`, this report, three selected captures and the compact performance JSON.

Raw extraction, complete Lighthouse output, browser traces/logs and scratch builds stay outside the handoff artifacts. No authentication, Studio, scene/SDK, backend, database, booking or client-project behaviour file was changed. No secrets were added to frontend environment values. Nothing was staged, committed, pushed or deployed.

### Release limits and required owner actions

The matrix gives every requirement a status instead of calling all six tasks complete. Before production: approve guide observations/authorship and case/media permissions; resolve the Chilancho identity/date question and draft-sector navigation; approve legal/privacy/pricing/hosting terms and final profiles/share image; isolate/unpublish samples through an authorised content workflow; choose Pages preview indexing/canonical policy; configure and test the real API and email/database/storage providers; complete physical device, real Safari/screen-reader/remote-3D checks; run hosted CI and operational backup, service rollback and off-machine restore acceptance. Static Pages cannot supply the Node API or Next response headers by itself. Outbound font access is a build dependency unless an approved self-hosting change is made.

Rejected/retried setup attempts are not release passes: sandbox font downloads failed; a cross-drive temporary build hit a Windows resolver limitation; an ignored QA clone caused Tailwind to omit utilities, so those early Lighthouse figures were discarded. Accepted builds used an unignored same-drive snapshot and verified the full stylesheet before measuring. No product workaround for these audit-isolation problems was added to deployment.
