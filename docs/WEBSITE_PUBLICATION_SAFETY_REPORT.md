# RCAAS website: publication-safety report

**16 November continuation:** recovered source decisions now restore the two educational guides' publication hold; the guide descriptions/registries and unconfirmed corporate social schema were corrected. The gate also rejects empty HTML output. Both intended npm build paths were rechecked. Earlier counts and unavailable-source statements below describe that earlier run; see [the six-task completion matrix](RCAAS_WEBSITE_SIX_TASK_COMPLETION.md) and [latest QA](design/COMPANY_WEBSITE_FINAL_QA.md) for current evidence and remaining business/provider approvals.

Date: 15 November 2026. Continues `docs/WEBSITE_SPEC_GAP_ANALYSIS.md` (revision 2). Nothing has been committed, pushed, merged or deployed. No visual design, route, layout or styling was changed: every edit is to copy, data, metadata plumbing or tooling.

## 1. Result in one paragraph

Every confirmed publication blocker is fixed in the working tree. No indexable page now shows an editorial placeholder, and no public page carries the unverified accuracy, frame-rate, return-on-investment, load-time, capture-time, file-size, resolution or leadership claims that the first audit found. A build gate now fails `npm run build` if a placeholder reaches an indexable page, for both the Node build and the GitHub Pages export. JSON-LD is rendered into the server HTML. One decision reverses an earlier owner request and needs approval: the cost-and-timeline guide is a draft again (section 7, item 1).

## 2. Completed analysis coverage

| Area | Status |
|---|---|
| Planning document (`Website Planning (1).pdf`, 220 pages) | All 220 pages read in the first pass. **Identity:** the brief called it a 189-page `.docx`. No `.docx` was supplied and no copy of either file is in the checkout, so the two are **not shown to be the same edition**. Page counts of a Word file and its PDF export normally differ, so one document in two formats is likely, but unproven. Every finding is about the 220-page PDF. The owner should supply the `.docx` if it may be a different edition. |
| `docs/ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, `ARCHITECTURE_CHANGED_FILES.md`, `FEATURE_BOOK_REVIEW.md`, `VISUAL_STORYTELLING_REVIEW.md`, current `CLAUDE.md` | Read in full this pass. None overturns a finding. They explain why the Visual Storytelling page was already clean (13 Nov rewrite), confirm the Contact form posts through the API, and state that "no tracking" is too broad a phrase (first-party beacons exist). |
| Spec versus site comparisons skipped last time | Done for the claim-bearing and placeholder-bearing pages (every page listed in sections 3 and 4). **Still not done:** a word-by-word comparison of every pillar, industry and guide page against the draft copy. The spec's `REF §n` reference document was never supplied, so those pointers remain unverifiable. |
| Claims | All numeric, headset, ROI, timing and superlative claims traced to file, route, evidence and status (section 3). |
| Placeholders | Every marker on the 17 affected pages traced to a purpose and resolved (section 4). |
| Source data and demos | Traced (section 5). |
| Technical SEO | Investigated against live behaviour (section 6). |
| Scope | Differences recorded, nothing removed (section 8). |

## 3. Confirmed publication defects: claims

Evidence rule used: a claim stays only if the owner's decisions record it (`CLAUDE.md`, 2026-11-04 content pass, Placeholder Register E05/S01/S03/P06) or the repository measures it. No measurement or owner statement exists for any figure below. Line numbers are those before the edit.

| Claim as published | Source (before) | Public route | Evidence available | Status | Action |
|---|---|---|---|---|---|
| "Relative drift error < 5 mm"; "LiDAR pulse frequency 200 kHz" | `LaserScanningPage.tsx:393,396` | `/services/digital-twins/3d-laser-scanning` | None. The 2026-11-04 decision cut every "±5 mm" claim; the only accuracy figure the owner confirmed is the Lixel K1 manufacturer rating on `/how-we-work`, with its caveat. | Published | Overlay now reads "LIDAR SWEEP: ILLUSTRATION" and "ACCURACY AGREED PER PROJECT" |
| "4x ROI multiplier / Zero duplicate visits" | `OneCaptureMultiUseVisualizer.tsx:180-183` | `/services` | None | Published | Tile now "1 / One capture / Several outputs" |
| "Load time < 1.8 seconds" | `OneCaptureMultiUseVisualizer.tsx:43` | `/services` | None; no Lighthouse or Web Vitals record exists in the repository | Published | Row removed |
| "90 FPS", "Meta Quest 3, Apple Vision Pro", "HTC Vive", "110° stereo", "Standalone VR App", "Kiosk auto-reset" | `OneCaptureMultiUseVisualizer.tsx:84-90`; `ImmersiveExperiencesPage.tsx:81,264`; `ValueChainGraphic.tsx:67` | `/services`, `/services/immersive-experiences` | Owner-confirmed only: VR tested on Meta Quest 2, 3 and 3S, checked per experience; no platform VR mode (Register E05) | Published | Rewritten to the tested models, "assessed per project"; the FAQ now says the browser tour has no VR mode, as `/faq` already does |
| "60 FPS" HUD labels; "Zero Plugins · 60 FPS" | `InteractiveTourFeaturesDemo.tsx:163`; `ImmersiveExperiencesPage.tsx:43,520`; `OneCaptureMultiUseVisualizer.tsx:342` | `/services`, `/services/immersive-experiences`, `/services/immersive-experiences/3d-virtual-tours` | None | Published | Labelled "ILLUSTRATIVE 3D DEMO" or "DEMO"; "smooth 60 FPS" sentence trimmed |
| "Takes between 2 hours and 1 day with zero guest disruption"; real-estate "scanned in a few hours to a day" | `VirtualToursPage.tsx:784`; `content/industries/real-estate-architecture.ts` | `/services/immersive-experiences/3d-virtual-tours`, `/industries/real-estate-architecture` | None; Register S01 forbids any turnaround | Published | Capture is "planned around your operations"; timing "agreed at the start" |
| "Typical size about 12–18 MB" | `WorkPage.tsx:204` | `/work` | None (Register P06: no file size until measured) | Published | Figure removed |
| "4K 60fps", "4K UHD Master", "ProRes 422 HQ", "16K Panorama", "Shutter 1/120 · ISO 200", "4K cinematic launch reels", planner "4K Cinematic Fly-Through Film", "curated 4K fly-through cameras", "Social 4K" | `OneCaptureMultiUseVisualizer.tsx:51,60-74,354-359`; `DroneMappingPage.tsx:810`; `ProjectPlannerModal.tsx:25,178`; `ValueChainGraphic.tsx:50,65` | `/services`, `/services/digital-twins/drone-mapping`, planner modal on every page | None. `VISUAL_STORYTELLING_REVIEW.md` records that resolution and codec depend on the agreed brief. | Published | Resolution reads "Agreed per brief"; overlay labels describe the illustration; drone copy says "subject to flight approvals" |
| "Leading reality capture … provider in Nepal"; audience list including banks (a draft sector) | `llms.txt/route.ts` | `/llms.txt` | None | Served | Rewritten without the superlative, without draft sectors; links from the site URL |
| Revit and IFC models, DWG/DXF/IFC "standardised", "Apple Quick Look (.usdz) and Google Scene Viewer (.gltf)", "launching instantly", "physical QR stickers", "bilingual narration", "Multi-Discipline ROI", "VR development" on the Chilancho card | `OneCaptureMultiUseVisualizer.tsx`; `ValueChainGraphic.tsx`; `ImmersiveExperiencesPage.tsx`; `DigitalTwinsPage.tsx:1203`; `CurvedArchCarousel.tsx:30` | `/services`, `/services/immersive-experiences`, `/services/digital-twins` | Register S04 and E04: formats and AR are per project, "needs verification" | Published | Qualified to "agreed per project" or "where the project supports it" |
| `CASE_STUDIES[].deliverables` and `techUsed` ("DJI Mavic 3E RTK", "Unreal Engine Virtual Production", "VR Headset Exhibition Tour", …) | `data/siteData.ts` | **Nowhere: never rendered** (traced, section 5) | None | Not published | Both fields deleted so no future page can render them by accident |

**Reviewed and kept (supported by an owner decision):** the Lixel K1 manufacturer rating "±1.2 cm" with its caveat (`HowWeWorkPage.tsx:170`); "200,000 points/s", now labelled "scanner rating (manufacturer)"; Meta Quest 2, 3 and 3S as tested; the sentence on `/services/visual-storytelling` that the sample "is not a 4K master". `AboutPage.tsx:79` ("the same kind of technology behind leading documentation and immersive projects around the world") refers to other organisations' projects, not RCAAS leadership. It is the owner's copy and was left alone.

**Re-scan after the edits:** all 43 routes of the local server were fetched and searched for the figures above and for `[[TB`. The only matches are false positives ("Android" contains "roi", "archive" contains "vive") and the honest "not a 4K master" sentence, plus the 12 draft pages' own markers.

## 4. Confirmed publication defects: placeholders

The first pass counted 113 visible markers on 17 indexable pages. A fresh count of the same server HTML at the start of this pass gave 112 on the same 17 pages (the one-marker difference is unexplained; it may have been a conditionally rendered marker). The table below accounts for all 112. Now: **0 on every indexable page**. Disposition by purpose:

| Purpose | Where | Count | What was done |
|---|---|---|---|
| Live-example slot ("embed URL, poster, file size", "a … example; if none, use the best available demo") and its caption | Seven industry pages and `/services/game-worlds-assets` | 13 | The slot now says "Illustrative canvas demo". `SplatEmbed` already labels itself that way, so the label is true. No fake link or caption was invented. |
| Result or outcome slot on a proof card ("result once data exists") | hospitality, education (×2), heritage, government | 5 | Slot hidden. The card keeps its approved line. |
| FAQ answer that was only a marker (formats, ownership, timing, repeat capture, nonprofit rate, coverage area) | gaming (3), filmmaking (4), nonprofit (3), government (1), game-worlds service (2) | 13 | Hidden on published pages (shown on drafts). They were already excluded from the FAQ schema. The question returns when the owner supplies the answer. |
| Optional-offer markers (`[[TBC]]` after a claim; "keep only if offered") | hospitality, real-estate, heritage, government, gaming, filmmaking, nonprofit, digital twins, game worlds | 24 | Claim kept where the owner's decisions support it, reworded to "agreed per project" where they do not, removed where it was only an optional extra (the subscription-heritage line, tender response, game-developer add-on). |
| Timeline, accuracy or format answers | real-estate (3), government (2) | 5 | Replaced with a neutral "agreed at the start" sentence; no figure supplied. |
| Guide byline, dates | `/learn` and the two published guides | 12 | Author and dates are shown only when supplied. Reading time stays. |
| Guide "From our projects" evidence prompt (Register L02) and empty "sources" lines | two published guides | 4 | Renders nothing until real observations exist. The sources section keeps the one real source (the 2023 Inria paper). |
| Platform FAQ "Will it slow down my website?" (an unconfirmed assurance) and "poster, file size" line | `/platform` | 2 | Removed. |
| Revision rounds; GNSS equipment | `/how-we-work` | 2 | Count removed; "Ground control, where a project needs it". |
| Home demo description ("spaces shown, e.g. lobby, rooms") | `/` | 1 | Sentence removed. |
| Cost-and-timeline guide (31 markers: pricing basis, time per stage, price rows) | `/learn/planning-a-3d-experience-cost-and-timeline` | 31 (27 once the shared byline and evidence fixes applied; the rest are its own price and time rows) | **The page lacks publishable content.** Set to draft: `noindex`, out of the sitemap, out of `/learn`. Text kept intact for when pricing and timelines are supplied. |

**Drafts keep their markers on purpose** (all `noindex`): factories, non-life-insurance and banking industries; the four case studies; the cost guide; `/privacy`; `/terms`; the blog hub and its one post.

## 5. Source data and demonstrations (Phase 4)

| Item | File | Where it renders | Real or illustrative |
|---|---|---|---|
| `CASE_STUDIES[].deliverables` / `techUsed` | `data/siteData.ts`, `types/index.ts` | **Nowhere.** `WorkPage` only filters on `tag`; the detail pages use `content/work/*.ts`. | Unverified, unrendered; deleted |
| `CASE_STUDIES` other fields | `siteData.ts` | `/work` list, case-study cards | Owner's 2026-11-04 table |
| `SplatEmbed` simulated canvas | `components/SplatEmbed.tsx` | Home, Platform, Work, eight industry pages, six service pages, case studies (draft), blog post (draft) | **Illustration.** It labels itself "Illustrative canvas demo · No app needed" and "Illustrative preview" in the component, so every use is labelled. Left untouched. |
| `OneCaptureMultiUseVisualizer` | `components/` | `/services` only | Illustration over real photographs; overlay text now says so |
| `InteractiveTourFeaturesDemo` | `components/` | `/services/immersive-experiences`, `/3d-virtual-tours` | Illustration |
| `ValueChainGraphic`, `CurvedArchCarousel` | `components/` | `/services` only | Descriptive graphics |
| Chilancho capture clip, XGRIDS viewer link, `/gallery` live tours | `public/media/hero.mp4`, `CHILANCHO_VIEWER`, `GET /api/gallery` | Visual Storytelling, Platform, industry live examples, `/gallery` | **Authentic**; not changed |

## 6. Technical SEO (Phase 5), by evidence

| Topic | Finding | Action |
|---|---|---|
| JSON-LD | Was written into the page by `useEffect`, so the server HTML had none (except `/faq`). | `routing/MarketingJsonLd.tsx` renders the same graph into the server HTML and updates it on client moves. Verified: one block per page in the Node build and the export. |
| `/faq` duplicate | The page injected its own `FAQPage` and the shell injected another: two after hydration, and the page's copy did not filter unresolved answers. | Page script removed; the shell's graph, which does filter, is the single source. One `FAQPage` verified. |
| Canonical, `og:url` | Consistent with each host. Node host: slash-less (`/services`). Export: slash with the `/RCAAS` base (`/RCAAS/services/`). | None. The spec's blanket slash rule is superseded for the Node host. |
| Trailing slash | Node host 308-redirects `/services/` to `/services`; the export serves the slash form. Each matches its own canonical. | None. Not a defect, nothing forced. |
| Sitemap | Hand-listed, so it still listed the cost guide after it went draft; export entries lacked the slash their canonicals have. | Filters out any page whose own metadata is `noindex`; uses the host's canonical slash form; `lastmod` bumped to 2026-11-15. Verified: cost guide absent on both. |
| Draft and `noindex` | `pageMeta` marks drafts correctly; guides, industries, work, blog and legal gates all work. Note `pageMeta` expects the slash form of a path, as the route entries pass it. | None |
| `llms.txt` | Superlative and a draft sector. | Rewritten (section 3) |
| Not changed (P2/P3, listed in the gap analysis) | 5 titles over 60 characters (`/services` is 76); 15 descriptions outside 140–160; `lang="en"` versus spec `en-GB`; per-section OG images; "Last updated" dates; `robots.txt` allows AI crawlers (owner decision recorded in `CLAUDE.md`); no analytics loader. | Owner and content decisions, not publication blockers |

## 7. Remaining requirements needing owner approval

1. **Cost guide as a draft.** The owner asked for it to be published early. It had 31 unresolved placeholders (pricing basis, time per stage, price rows). Restore by setting `draft: false` in `data/guides.ts` once the answers exist; the gate will then confirm it is clean.
2. **Which removed figures, if any, can be evidenced** (accuracy, frame rate, load time, capture times, file size, resolutions). Nothing was substituted.
3. **The answers to the hidden FAQ questions** (formats, ownership and licensing, delivery time by scope, repeat capture, nonprofit rate, coverage area, tender eligibility).
4. **Guide authorship and dates (L01) and real project observations (L02).**
5. **Scope** (section 8).
6. **Demo wording.** The industry live examples now say "Illustrative canvas demo". The owner may prefer to link the real Chilancho viewer, which is a behaviour change and was not made.
7. **`Website Planning (1).docx`.** If the 189-page file is a different edition, supply it for recheck.
8. **Unchanged owner decisions** carried from the first report: AI-crawler policy, GA4 and consent, `en-GB`, whether the GitHub Pages copy stays public, title and description lengths.
9. **Legal review** of privacy and terms; they remain draft.

## 8. Scope differences recorded, not changed

| Spec | Site | Note |
|---|---|---|
| 3 service pillars | 4: adds Game Worlds & Assets | Page is published and in the sitemap; `llms.txt` lists it; its title tag duplicates `/industries/gaming` (flagged in the gap analysis) |
| 5 industry pages | 11: adds filmmaking, gaming, government, nonprofit, real estate (all published), and factories, non-life insurance, banking (drafts) | The drafts are `noindex`; the first audit found the home page still links to them. Not removed or published. |
| "Never add a project not listed" | Four case studies, all draft | Unchanged |

No pillar, industry page or route was removed, merged, renamed or published.

## 9. Files modified

**Tooling and tests (new):** `scripts/check-placeholders.mjs`; `test/publication-safety.test.mjs`; `src/features/marketing/routing/MarketingJsonLd.tsx`.

**Config:** `package.json` (`postbuild`, `check:placeholders`); `.gitignore` (two allow-list lines for the two reports).

**Routes and metadata plumbing:** `src/app/llms.txt/route.ts`; `src/app/sitemap.xml/route.ts`; `src/features/marketing/MarketingShell.tsx`; `routing/useMarketingMetadata.ts`; `pages/FaqPage.tsx`.

**Data and registries:** `data/guides.ts`; `data/siteData.ts`; `types/index.ts`; `content/pageFaqs.ts`; `content/industries/{education,filmmaking,gaming,government-municipalities,heritage-culture,hospitality-tourism,nonprofit-international-development,real-estate-architecture}.ts`.

**Page and component copy:** `components/{OneCaptureMultiUseVisualizer,InteractiveTourFeaturesDemo,ProjectPlannerModal,ValueChainGraphic,CurvedArchCarousel,GuideParts}.tsx`; `pages/{DigitalTwinsPage,DroneMappingPage,GameWorldsPage,ImmersiveExperiencesPage,LaserScanningPage,VirtualToursPage,WorkPage,PlatformPage,HowWeWorkPage,IndustryPage,LearnPage,ComparisonGuidePage,GaussianGuidePage}.tsx`; `home/components/LiveExperienceSection.tsx` (all under `src/features/marketing`).

**Documents:** `docs/WEBSITE_SPEC_GAP_ANALYSIS.md` (revision 2), this report, `CLAUDE.md` (status entry).

Not touched: studio, authentication, API, scene, tour, booking, styles, images, routes, `SplatEmbed`, `next.config.mts`, the workflow file.

## 10. Test results (15 November 2026)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed, no output |
| `npm run lint` | 0 errors, 6 warnings (the same 6 as the baseline in `CLAUDE.md`) |
| `npm test` | **75 client + 192 server passed, 2 server skipped, 0 failed.** Five client tests are new (`test/publication-safety.test.mjs`): the gate flags a marker in copy, in metadata and in JSON-LD; leaves `noindex` pages alone; walks nested output; and every indexable route has marker-free metadata and structured data |
| `npm run build` (Node host, separate dist dir) | Passed. `postbuild`: "31 indexable of 51 pages scanned, no unresolved placeholders" |
| Gate against a failing page | Injected `[[TBC: injected test]]` into a copy of the real built `services.html`: exit 1 with the file and marker named |
| GitHub Pages export (`NEXT_OUTPUT_EXPORT=1`, `/RCAAS`, CI's route exclusions, in an isolated copy) | Built. Gate ran on `out/`: "31 indexable of 51 pages scanned", clean. Canonicals carry `/RCAAS/…/`; sitemap lists the slash form; cost guide `noindex` and absent from the sitemap; `llms.txt` and `sitemap.xml` present |
| Browser suite, Node preview (`npm run test:e2e`) | **22 passed** (desktop and phone: marketing URL matrix, metadata, planner, navigation, and the Studio fixture checks) |
| Browser suite, `/RCAAS` export (served by a small static server) | **10 passed, 12 skipped** (the fixture-only skips, as in the earlier baseline) |
| Rendered re-scan of 43 routes | No unsupported figure or marker on any indexable page (section 3) |
| Dev-server spot checks | `/industries/gaming`, `/filmmaking`, `/government-municipalities`, `/services/game-worlds-assets`, `/learn`, `/learn/what-is-gaussian-splatting`: one `<h1>`, the "Illustrative canvas demo" label present, FAQ questions present or hidden as intended, 0 markers; the 404 probe still returns 404 |
| Metadata preserved | `pageMeta` untouched; the route-by-route title, description, canonical and robots assertions in `marketing.spec.ts` pass |
| Studio and authentication | No file in them was edited. The Studio fixture checks in the 22 above pass. No real login, project or publish was exercised in this pass. |

A harness note, not a code issue: the first export run in the isolated copy failed one browser check because Tailwind skips git-ignored folders, so the copy's CSS was 45 KB instead of 152 KB and a fixed overlay swallowed a click. Reusing the repository's compiled CSS fixed it. The repository itself is unaffected.

## 11. Known production limitations

- **The gate sees prerendered HTML only.** Routes rendered per request (marked dynamic in the build output) and content that appears only after hydration are not scanned. Every public marketing page and every case-study, industry and blog page is prerendered, so the gap is small, but a client-only placeholder would be missed. The unit tests cover metadata and JSON-LD for every route independently.
- **`npm run build` only.** A bare `next build` skips `postbuild`. CI and the Pages workflow both call `npm run build`.
- **The cost guide's text and the other drafts still contain markers** by design; the gate skips them because they are `noindex`. Removing `draft` from one without clearing it makes the build fail, which is the intended behaviour.
- **Nothing here is measured performance.** No Lighthouse, Web Vitals, screen-reader, physical-device or real-network run was made. The removed figures have not been replaced by measured ones.
- **Not exercised:** form submission, email or WhatsApp delivery, real login, publish, GA4, the GitHub Pages deployment itself, the production host's redirects behind a proxy, Search Console. The static export was served locally, not from GitHub.
- **A React development warning** ("Encountered a script tag while rendering React component") appears in browser-test logs. It also appears in logs from before this pass; it comes from the root layout's inline scripts, not from the new JSON-LD component (React exempts `application/ld+json`). Dev only.
- **Line endings.** Some edited files now have mixed LF and CRLF lines. Git normalises them on commit (it warned for 17 files); no content is affected.
- **Draft pages are still linked from the home page** (first-pass finding). Their copy is not published; the links are an owner decision.

## 12. Making sure the two reports are not lost

`docs/*` is git-ignored here, with an allow-list of earlier reports. Two lines were added to `.gitignore` so both new reports behave like them:

```
!docs/WEBSITE_SPEC_GAP_ANALYSIS.md
!docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md
```

To track everything from this pass (nothing has been staged):

```bash
git add .gitignore package.json
git add docs/WEBSITE_SPEC_GAP_ANALYSIS.md docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md CLAUDE.md
git add scripts/check-placeholders.mjs test/publication-safety.test.mjs src/features/marketing/routing/MarketingJsonLd.tsx
git add -u src        # the modified source files under src/
git status            # review before committing
```

If you would rather not change `.gitignore`, drop the first line and use `git add -f` on the two `docs/` files. The same commands apply either way.
