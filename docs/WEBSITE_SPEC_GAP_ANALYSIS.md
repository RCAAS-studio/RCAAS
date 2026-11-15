# RCAAS website specification: gap analysis

Audit date: 15 November 2026 (revision 2, the completion and publication-safety pass, the same day: see section 0A). Scope: "Website Planning (1)" (October 2026 skeleton, build spec and draft copy) compared with the current `main` working tree (clean at the start; head `1d304b4`). The first pass was a requirements audit and changed no code. Revision 2 corrected the confirmed publication blockers (section 0A and `docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md`). Nothing has been committed, pushed or deployed.

> `docs/*` is git-ignored in this repository. Both reports are now allow-listed in `.gitignore` (two `!docs/...` lines, uncommitted), so a plain `git add` tracks them; see section 12 of `docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md` for the exact commands.

## 0. How this audit was done, and its limits

**Source document facts.**
- **Identity of the source (revision 2).** The file attached to the brief is `Website Planning (1).pdf` (an `application/pdf` attachment of 220 pages, titled "Website Planning (1)", an October 2026 skeleton, build spec and draft copy). The brief's own text called it `Website Planning (1).docx` of about 189 pages. These are **not shown to be the same edition**: no `.docx` was supplied, no copy of either file exists in the checkout (searched by name), and neither carries a version or revision line that could be compared. Page counts of a Word file and its PDF export routinely differ, so the likeliest explanation is one document in two formats, but that is an inference, not a finding. Every statement in this report is about the 220-page PDF only. If the 189-page `.docx` is a different, later or earlier edition, the owner should supply it and the spec-versus-site comparisons in section 2 should be rechecked against it.
- All 220 pages of the PDF were read, in order, as supplied in the session.
- The spec's own repo paths (`docs/SITE_SPEC.md`, `docs/content-reference.pdf`, `docs/copy/*.md`) **do not exist** in this checkout. The "reference content document" (REF §n) was never supplied, so every REF pointer is unverifiable.
- `AGENTS.md` does not exist (also recorded in `docs/ARCHITECTURE_COMPLETION.md`).

**Repository material read in full:** `CLAUDE.md`, `docs/ARCHITECTURE_COMPLETION.md`, `docs/MARKETING_DEVELOPMENT.md`, `CONTENT_TODO.md`. **Read in full in revision 2:** `docs/ARCHITECTURE.md`, `docs/FOLDER_STRUCTURE.md`, `docs/ARCHITECTURE_CHANGED_FILES.md`, `docs/FEATURE_BOOK_REVIEW.md`, `VISUAL_STORYTELLING_REVIEW.md`, and the current `CLAUDE.md`. None of them overturns a finding. Two bear on this audit: `VISUAL_STORYTELLING_REVIEW.md` records that the Visual Storytelling page was already cleaned of its invented 4K/60 fps/timing claims on 13 November (consistent with the crawl, which found none there), and `FEATURE_BOOK_REVIEW.md` confirms the Contact page now posts through the API and the "no tracking" wording needs qualifying (first-party beacons exist).

**Evidence method.**
1. Static reading of `meta.ts`, `siteData.ts`, `types/index.ts`, `sitemap.xml/route.ts`, `robots.txt/route.ts`, `llms.txt/route.ts`, content registries, `useMarketingMetadata.ts`, the contact and platform forms, `SplatEmbed.tsx` and the components named in the findings.
2. A read-only crawl (GET only, no form posts) of **all 43 routes** on the already-running local dev server (`localhost:3000`, 15 Nov 2026). It recorded status, title, description, robots, canonical, `<h1>`/`<main>` counts, iframe count, visible `[[` markers, JSON-LD in the server HTML, breadcrumbs, `tel:`/`wa.me` links and numeric claims in rendered text. Per-route results are in Appendix A.

**Not done, so no claim is made about it:**
- No production build, Lighthouse, Core Web Vitals, screen-reader or real-device run. The repo has no Lighthouse evidence either.
- No screenshots, so visual findings are inferred from code and rendered text, not seen.
- No form submission, so no email or lead delivery was exercised.
- The crawl was the dev server. Canonical host and slash behaviour differ in a production Node build and in the Pages export (both noted where they matter).
- Not every line of every page component was read. Pillar, industry and guide pages were compared by structure, headings, metadata, markers and claims, not word by word against the draft copy.

**Status key:** A implemented and verified · B implemented but improvable · C missing · D outdated or superseded · E needs owner confirmation · F not applicable.

---

## 0A. Revision 2: completion and publication-safety pass (15 November 2026)

What changed since the first pass. Details, evidence and test output are in `docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md`.

| Item | First pass | Now |
|---|---|---|
| Unverified numeric, headset and ROI claims (R-03, R-35) | Live on indexable service, work and platform pages | Removed or qualified in 11 source files plus llms.txt; a rescan of all 43 routes finds none (remaining matches are false positives such as "Android" or the honest sentence "the sample on this page is not a 4K master") |
| `llms.txt` superlative (R-04) | "the leading … provider in Nepal"; listed the banking sector, which is a draft | Rewritten: no superlative, no draft sector, links built from the site URL and the host's canonical slash form |
| Visible placeholders on indexable pages (R-32) | 113 markers on 17 pages | 0 markers on every indexable page; 12 drafts keep theirs by design (27 on the cost guide, which is now draft) |
| Placeholder build gate (R-32) | None | `scripts/check-placeholders.mjs`, run as `postbuild`: scans the built HTML of every indexable page (copy, metadata, JSON-LD); fails the build with exit 1. Covers the Node build (`.next/server/app`) and the Pages export (`out/`). Draft (`noindex`) pages are skipped |
| Cost guide (R-33) | Published, indexable, 32 markers | `draft: true` (noindex, out of the sitemap and `/learn`). **This reverses the owner's earlier request to publish it early; see the approvals list** |
| JSON-LD (section 9) | Injected in the browser only | Rendered into the server HTML by `routing/MarketingJsonLd.tsx`; the duplicate `FAQPage` that `/faq` produced (its own script plus the shell's) is gone |
| Sitemap | Hand-listed; included the cost guide; export form mismatched canonicals | Filters out any page whose own metadata is `noindex`; lists the slash form on the Pages export and the slash-less form on the Node host, matching each canonical |
| Dead data in `CASE_STUDIES` (R-05) | `deliverables` and `techUsed` held unverified claims | Traced: **never rendered anywhere**; both fields deleted so they can't be rendered by accident |
| Trailing slash (R-13) | Reported as a conflict | Re-assessed: **not a defect**. On each host the canonical, `og:url`, sitemap, redirect and `llms.txt` agree (Node: slash-less, 308 from the slash form; Pages export: slash). The spec's blanket slash rule is superseded for the Node host; nothing was forced |

Verified in this pass: `tsc`, ESLint (0 errors, the same 6 warnings), 267 unit and API tests (75 client including 5 new, 192 server, 2 skipped), the Node production build with the gate, the GitHub Pages export build with the gate, 22 browser checks on a Node preview and 10 on the `/RCAAS` export (12 fixture-only tests skip there, as before). **Not verified:** no Lighthouse, screen-reader or real-device run; the gate was proven against an injected marker on real build output but the full "build fails" path was not run through CI.

---

## 1. Executive summary

The structure of the spec is largely in place. All 30 spec URLs plus `/blog/` exist, each as a native Next route. Every page that returns 200 has one `<h1>`, one `<main>`, a visible breadcrumb (except Home and `/thank-you/`) and server-rendered text (min 200 words). The 404 response is the exception: its server HTML has no `<h1>` or `<main>` (R-44). No iframe loads on any page, 3D is click-to-load, and the case-study, blog and legal gates work (drafts are `noindex`). Contact details, hours, tagline and boilerplate match the owner's confirmed values.

The site has drifted from the spec in three ways that matter, and one of them is a launch problem:

1. **Unverified claims are live on public, indexable pages (P0). Resolved in revision 2 (section 0A).** Examples: "Relative drift error < 5 mm", "4x ROI multiplier", "Load time < 1.8 seconds", "90 FPS on Meta Quest 3, Apple Vision Pro and HTC Vive", "takes between 2 and 24 hours", "typical size 12–18 MB", "4K 60 fps / ProRes 422 / 16K panorama". The spec forbids accuracy figures, timelines, performance numbers and unconfirmed headsets (§0, §1.2, Register E05, S01, S03, P06). None of these pages carries a placeholder, so no existing gate catches them.
2. **Placeholder markers are visible to visitors on 17 indexable pages, 113 markers in total (P0). Resolved in revision 2: 0 on indexable pages, and a build gate now enforces it.** The spec requires production builds to fail on this (Placeholder convention rule 3). There is no such check. The cost guide has 32 markers yet is `draft: false`, indexable and in the sitemap.
3. **Scope grew well beyond the spec (needs owner confirmation).** The spec has 3 service pillars and 5 industries. The site has 4 pillars (Game Worlds & Assets) and 11 industry pages, three of them drafts that the home page still links to. The spec says "never create pages for keyword variants" and "do not add any project not listed". `/services/game-worlds-assets/` and `/industries/gaming/` share one title tag.

Secondary gaps (the first two are closed in revision 2: JSON-LD is now server-rendered, and the slash behaviour is consistent per host and not a defect): structured data was injected client-side only, the Node host redirects trailing-slash URLs to slash-less ones (the spec wants the opposite), analytics events are pushed to `dataLayer` but no analytics is installed, the contact form needs JavaScript, and 15 pages have descriptions outside 140–160 characters.

**Counts (from the crawl):** 43 routes · 31 indexable · 12 `noindex` · 17 indexable pages with visible placeholders (113 markers) · 5 titles over 60 characters · 15 descriptions outside 140–160 · 0 pages with iframes · a visible breadcrumb on every route except Home and `/thank-you/`. (The 43 routes are the 200 responses; the 404 probe is counted separately.)

---

## 2. Requirements coverage matrix

Priority: **P0** broken or misleading claims, security or accessibility blockers · **P1** major missing content or customer-experience problems · **P2** important visual, usability or SEO work · **P3** minor.
"Owner?" means the change needs a decision or approved facts from the owner before work starts.

### 2.1 Identity, messaging and claims

| ID | Spec § | Status | Implementation and evidence | Gap | Pri | Recommendation | Risk | Owner? |
|---|---|---|---|---|---|---|---|---|
| R-01 | §1, §1.1 | A | `siteData.ts` `SITE_METADATA`: display name, short name, "Reality Capture as a Service", boilerplate identical to §1.1; tagline "Turn real places into experiences that move people." (owner-confirmed 2026-11-03). Home `<h1>` matches. | None. | P3 | Keep. | Low | No |
| R-02 | §1 name | E | `legalName: 'RCAAS Technology Pvt. Ltd.'`, `registrationPending: true`; not put in schema `legalName`. | Spec: do not output an unverified legalName. Code complies; the data field still holds a name that is only planned. | P3 | Keep the guard. Confirm registration before ever emitting it. | Low | Yes |
| R-03 | §1.2 rules 3, 6; §0 "NEVER invent" | **Resolved in revision 2** (was C) | Public pages state performance, accuracy and timing numbers: `OneCaptureMultiUseVisualizer.tsx:43` "Load Time < 1.8 seconds"; `:180-183` "ROI Multiplier / Zero duplicate visits"; `:89-90` "90 FPS", "Meta Quest 3, Apple Vision Pro"; the 4K 60 fps / 16K panorama / ProRes 422 specs in the same file; `LaserScanningPage.tsx:396` "RELATIVE DRIFT ERROR: < 5MM" and "PULSE FREQUENCY: 200 KHZ"; `ImmersiveExperiencesPage.tsx:81,264` "90 FPS … Apple Vision Pro, and HTC Vive"; `VirtualToursPage.tsx:784` "Takes between 2 hours and 1 day"; `WorkPage.tsx:204` "Typical size about 12–18 MB"; "60 FPS" HUD labels on `/services/immersive-experiences/` and `/3d-virtual-tours/`. Crawl: `/services`, `/services/immersive-experiences`, `/3d-virtual-tours`, `/3d-laser-scanning`, `/work` all return 200 and `index, follow`. | Spec Register S01 (no turnaround), S03 (no accuracy), P06 (no file size until measured), E04/E05 (only Quest 2/3/3S are "tested"; AR per project). `CLAUDE.md` records the 2026-11-04 cut of the same kind of claim; these survived because they sit in decorative visuals. | **P0** | Remove or relabel every number above. A decorative "telemetry" overlay must read as illustration or carry no figures. Replace headset list with the three tested Quest models. Re-run the claim scan (§9, WP1) until it is empty. | High: misleading commercial claims, reputational and consumer-protection exposure | Yes (which figures, if any, can be evidenced) |
| R-04 | §1.2 rule 6; §6.9 | **Resolved in revision 2** (was C) | `llms.txt/route.ts`: "RCAAS is the leading reality capture and 3D immersive experience provider in Nepal." Also lists services and audiences wider than the spec. | Unsubstantiated superlative served to AI crawlers. | **P0** | Replace with the §1.1 boilerplate. | Medium | No |
| R-05 | §6.8, Register W01–W04 | E | `siteData.ts` `CASE_STUDIES[].deliverables/techUsed` (lines ~207-253) list "4K Cinematic Fly-Through Video", "Booking Engine Hotspot Integration", "VR Headset Exhibition Tour", "Unreal Engine Virtual Production", "DJI Mavic 3E RTK", "Orthoimagery Map", "Archival Dossier". I did not confirm where these fields render (the crawled case-study pages show none of them). | If rendered anywhere, they are unverified per-project facts. | P1 | Trace usages. Delete the fields if unused, otherwise replace with the owner-confirmed delivery lists. | Medium | Yes |
| R-06 | §7 rule 3; §6.1 §2; §6.9 §2 | **C (misleading risk)** | `SplatEmbed.tsx` is a **simulated canvas**, not the spec's click-to-load platform iframe. It names real client spaces and invents waypoints ("Sacred Chaitya", "Golden Spire Ascent", "Science Labs", "Auditorium Bay", "Fabrication Hall") and coordinates. The home page labels it "Illustrative canvas demo". `VISUAL_STORYTELLING_REVIEW.md` already replaced it on that one page with the real XGRIDS viewer. | The other uses are not individually checked. `CLAUDE.md` lists the swap as an owner decision still open ("a behaviour change, so ask first"). | **P0** where a real client's name is shown over invented content; otherwise P1 | List every page that mounts `SplatEmbed`. Where the demo names Nepathya, Madan Ashrit or Basera, replace it with the approved external viewer, or a plain poster with no invented stops. | High | Yes |
| R-07 | §4.2, §1 | B | Footer and contact show only confirmed email, phone, WhatsApp, address. | Spec footer wants Facebook, LinkedIn, WhatsApp, Instagram icons. No accounts are on file (Register G07, B03). Crawl found no social links in the header or footer HTML. | P2 | Add icons when URLs exist. Do not add empty ones. | Low | Yes (URLs) |

### 2.2 Architecture, URLs and navigation

| ID | Spec § | Status | Implementation and evidence | Gap | Pri | Recommendation | Risk | Owner? |
|---|---|---|---|---|---|---|---|---|
| R-10 | §9 (Astro, `src/content/*.md`, content collections) | **D** | Next 16 App Router, TypeScript, `features/marketing/content/*.ts` registries, Express API. | Spec proposes Astro. Superseded by the completed refactor (`docs/ARCHITECTURE_COMPLETION.md`). | n/a | Do not migrate. Keep the spec's *content* rules, not its file layout. | None | No |
| R-11 | §3.1, §3.3 | A / B | All 30 spec URLs and `/blog/` are in `ROUTES`; every one returned 200 on the crawl (slash-less form). Unknown path returns 404 with `noindex`. | Extra routes not in the spec: `/services/game-worlds-assets/`, 6 extra industries, `/gallery/`, `/cookies/`, `/security/`. | P1 | See R-12. | Medium | Yes |
| R-12 | §2.2, §2.3, §3.3 "30 indexable pages", §0 "do NOT add … any project not listed" | **E** | 4 pillars (home: "Four Pillars") and 11 industry pages. Beyond the spec: Game Worlds & Assets, Factories, Non-life Insurance, Gaming, Filmmaking, Nonprofit & International Development, Banks & Financial Institutions. Factories, Insurance and Banking are `draft: true` (`noindex`). Gaming, Filmmaking, Nonprofit are indexable, in the sitemap and carry 9, 10 and 7 visible markers. `/services/game-worlds-assets/` and `/industries/gaming/` have the **same title tag**. | Spec §3.2: "One topic = one page. Never create pages for keyword variants." The draft pages are still shown on the home page (hero chip "Factories", industry list "Banks & Financial Institutions"), against the draft rule "excluded from navigation and listings". | P1 | Owner to confirm which of the 7 additions are real offerings. Keep only evidenced ones, give each a distinct title, and keep drafts out of every listing until they pass the publish gate. | Medium: thin or duplicate pages, claims without delivered work | **Yes** |
| R-13 | §3.2 trailing slash, one host, canonicals | **C / D** | `next.config.mts:18`: `trailingSlash: true` only for the static export. On the Node host, `/services/` returns **308 → `/services`** (crawl, every route). Canonicals are slash-less (`http://localhost:3000/services`). The Pages export writes directory indexes, so the two targets disagree. Canonical base is `localhost` while `NEXT_PUBLIC_SITE_URL` is unset (known deployment gate). | Spec wants a trailing slash everywhere with the slash-less form redirected (301). Reversed. | P1 | Decide once. Either set `trailingSlash: true` for both targets and add the redirect, or amend the spec to "no trailing slash". Then make `ROUTES`, sitemap, canonical and in-page links agree. | Medium: split signals, duplicate URL forms | Yes (policy) |
| R-14 | §3.2 sitemap | B | `/sitemap.xml` is hand-maintained (`PAGES` list), plus live client sites and project tours. | Spec: `/sitemap-index.xml`, real `<lastmod>`, image entries for case studies, no drafts. Code: single file, one fixed `PAGES_MODIFIED = '2026-10-13'` for all pages (stale after the November content work), no images, no `/blog/` or case studies (correct while drafts), includes the 32-marker cost guide, `/cookies/`, `/security/`, `/gallery/`. | P2 | Derive from `ROUTES` minus drafts and real file dates. Drop the cost guide until it passes the gate. | Low | No |
| R-15 | §8.6 robots | E | `robots.txt/route.ts` allows every named AI crawler, including training crawlers. `Sitemap:` points to `/sitemap.xml`. | The spec is self-contradictory: its comment says "block AI-training crawlers" and the directive underneath says `Allow: /`. It also asks for `Disallow: /thank-you/`; the site uses `noindex, follow` (acceptable, and crawlable so the tag is seen). `CLAUDE.md` lists the allow/block choice as an owner decision. | P2 | Record the owner's choice (Register G13) and align Terms (`TermsPage.tsx:59` marker). | Low | Yes |
| R-16 | §8.7 llms.txt | B | Served from a static string. | Hand-written, not "auto-generated from the page register"; carries R-04's claim; lists nothing the spec's 30-page register contains beyond four links. | P2 | Generate from `ROUTES` + titles. | Low | No |
| R-17 | §4.1 header | B | Header (`Header.tsx`): What we create, Industries, Our work, Platform, Live tours, About, Sign in, "Plan your experience", Menu. Mobile sticky bar exists (`MarketingShell.tsx`, hidden on contact and thank-you). | Spec: no "Live tours" or "Sign in" (the platform needs both, so this is a justified addition); no secondary **"Explore a live tour"** button; the primary button opens a planner modal (not a real `<a href="/contact/?type=project">` as §4.1 requires). The code comment still says the bar "needs a confirmed WhatsApp number", which is now confirmed. | P2 | Make the primary CTA a real link (modal as enhancement). Add the secondary button, or record the deviation. Refresh the stale comment. | Low | No |
| R-18 | §4.1 WhatsApp number | **D** | Code uses `+977 981 078 9487` everywhere (owner-confirmed). | Spec §4.1 prints `+977 9866157536`; §11 copy prints `9810789487`. The spec contradicts itself. | n/a | Code is right. Treat §4.1 as superseded. | None | No |
| R-19 | §4.3 breadcrumbs | A | Visible on 42 of 43 routes. | Structured BreadcrumbList is client-injected (R-31). | P3 | Keep. | Low | No |
| R-20 | §4.4 internal linking rules | E | Not measured link-by-link. | Rules (pillar → ≥2 industries, case study, guide, etc.) not verified. | P2 | Add a script that checks each rule from the content registries. | Low | No |

### 2.3 Page templates and content

| ID | Spec § | Status | Implementation and evidence | Gap | Pri | Recommendation | Risk | Owner? |
|---|---|---|---|---|---|---|---|---|
| R-30 | §6.1 home H1 | **D / E** | Home `<h1>` is the owner-confirmed tagline, drawn with a typewriter effect (the server HTML contains the line twice plus "move people."). | §6.1 says H1 = "Real places. Real stories. Real results." (highlighted as unconfirmed); the copy file says the "Turn real places…" line. Superseded by owner decision. | P3 | Keep. Check the duplicated text is hidden from assistive tech. | Low | No |
| R-31 | §8.5 JSON-LD; §11 "Full text in page source" | **C** | `useMarketingMetadata.ts` creates the `schema-jsonld` script **in the browser** (`useEffect`). The crawl found **0 JSON-LD blocks** in the server HTML of every page except `/faq` (inline). The pure builders in `structuredData/` and `test/marketing-schema.test.mjs` are sound. | Crawlers that do not run JS (several AI crawlers) never see Organization, Service, Breadcrumb or Article data. The spec's "no placeholders in JSON-LD" is also untestable at the HTML level. | P1 | Render the graph on the server from the same `buildMarketingGraph` in the route metadata or page entry. Keep the client hook only for in-app navigation, if at all. | Medium | No |
| R-32 | Placeholder convention rule 3 and 4; §11 checklist | **Resolved in revision 2** (was C): see 0A | No `check-placeholders` script and no build gate (spec §9 names `scripts/check-placeholders.mjs`). `Placeholder.tsx` renders in every environment. Crawl: **113 markers on 17 indexable pages**: `/`(1), game-worlds(5), digital-twins(4), hospitality(3), education(3), real-estate(9), heritage(2), government(8), gaming(9), filmmaking(10), nonprofit(7), platform(2), how-we-work(2), learn hub(6), compare guide(5), gaussian guide(5), **cost guide(32)**. `CONTENT_TODO.md` (13 Nov) counts 253 markers across 50 files and is already out of date (it lists `GameWorldsPage.tsx`, `ComparisonGuidePage.tsx` and `HomePage.tsx` paths that no longer match the tree). | Spec: production builds must fail on markers in non-draft pages; draft pages are excluded from sitemap, nav and listings. | **P0** | Add the build gate (override `ALLOW_PLACEHOLDERS=true` for staging). Mark failing pages `draft` or fill them. Regenerate `CONTENT_TODO.md` from the gate's output. | High | Partly (facts) |
| R-33 | §6.11, Register L01, L02 | **Resolved in revision 2** (was C): cost guide is draft; owner to confirm | `guides.ts`: all three guides `draft: false`; the cost guide's own comment says "draft until pricing basis and timelines are input … Published early at the owner's request". Author, reading time and date are `null` (visible markers). `GuideParts.tsx:226` shows a "[[TBI — required before publishing]]" first-hand-data block. | Spec: guides need a named author, dates and first-hand data before going live; the cost guide stays draft. | P1 | Owner decision: either set the cost guide back to draft, or supply pricing basis. Fill author and dates for the two other guides, or mark them draft. | Medium | Yes |
| R-34 | §6.3 pillar template | B | Immersive (2 175 words), Visual Storytelling (1 198), Digital Twins (3 088) all server-rendered with H1, breadcrumbs, FAQ. | Spec word budgets are 900–1 200 words. Counts include header and footer (~250-300 words), so the pages are still roughly twice budget. Digital Twins has 4 markers. Visual Storytelling was rebuilt from real evidence (`VISUAL_STORYTELLING_REVIEW.md`) and is the strongest page. | P3 | Treat budgets as guidance. Remove markers. | Low | Partly |
| R-35 | §6.4 capability pages | B | 3D tours, laser scanning, drone mapping exist, no markers. | Carry the R-03 claims (drift error, 2-hour/1-day timing). Drone page: "marketing gets 4K cinematic launch reels". Spec highlighted the drone page as unconfirmed (flight permissions, S06). | P0 (R-03) | Fix with R-03. Confirm drone delivery with the owner. | Medium | Yes |
| R-36 | §6.5, §6.6 industries | B | The 5 spec industry pages exist with the spec's goal headlines (hospitality H1 checked). | Markers on all five (3, 3, 9, 2, 8). Real-estate and government have no proof project (spec: defer to phase two); code shows markers instead of omitting the section. | P1 | Hide proof sections with no approved project rather than printing markers (spec: "omit until available"). | Medium | Partly |
| R-37 | §6.8, §6.7, Register W01–W05 | B | 4 case-study pages, all `draft: true` / `noindex` (9, 11, 11, 13 markers). The publish rule in `work/published.ts` matches the spec ("missing 3D link, location or date → draft") and also blocks on any marker or listed gallery frame. `/work/` hub is indexable. | Content is the blocker, not code: capture figures, results, quotes with permission, photos (Register W01–W04). **ITECO Nepal** appears in the spec's snapshot table but has no case-study page (only a carousel card and a quote on the laser-scanning page). | P1 | Collect the facts. Owner to decide whether ITECO gets a page. | Low (gate works) | Yes |
| R-38 | §6.9 platform | B | Page exists with demo, "how it works", features, subscriptions note, early-access form (`sendLead`), FAQ. Analytics not claimed (matches spec). | Title says "Embed", spec says "Measure" (superseded: analytics not offered). Two markers remain (poster, file size). Early-access delivery is unproven: `CLAUDE.md` says the sending domain is not verified at Resend (mail reaches only the account's own address). Spec: "implement and test before launch". | P1 | Verify the sending domain, then send one real test through the form. | Medium | Yes (DNS) |
| R-39 | §6.10 how we work | B | Present. Scanner specs shown as the manufacturer's own rating with a caveat (owner-approved 2026-11-04). | Two markers (revision rounds, equipment). Accuracy table hidden (correct per spec build note). | P2 | Fill or remove. | Low | Yes |
| R-40 | §6.12 about, team | D / E | Four team members published with photos and bios the owner wrote. | Spec holds individual profiles until approval and shows one game-developer card. Owner decision of 2026-11-01 supersedes. Spec's "Where we're heading" is "not for publication"; code hides it (`SHOW_GOALS`), correct. | n/a | Keep. | Low | No |
| R-41 | §6.13 faq | A / B | FAQPage JSON-LD is inline on `/faq` only, as the spec says (the home FAQ has none). "Last updated" present. | Group list and counts not compared line by line. | P3 | Keep. | Low | No |
| R-42 | §6.14 contact | B | `ContactPage.tsx`: goal radios preselected from `?type=` (`goalFromType`), consent, honeypot, 3 s time-trap, redirect to `/thank-you/`, `form_submit` event, hours, response-time aim, map link. | (a) Form is client-side React: **does not work without JS** (spec §5: "works without JS"). (b) Budget range is a note ("include it in your message"), not a select (Register G18, optional). (c) `?type=` coverage vs the spec's 10-row table not verified. (d) Most "Plan your experience" CTAs open the planner modal instead of linking to `/contact/?type=…`, so few such links exist in the HTML (the crawl found them on only three pages: Visual Storytelling, Heritage, FAQ). | P2 | Add a native `<form action>` fallback or accept JS-only and amend the spec. Add the budget select once NPR bands are approved. | Low | Partly |
| R-43 | §6.15 legal | B | Privacy and Terms are marked draft, `noindex`, with 12 and 9 markers. Cookies and Security pages exist (not in the spec). | Drafts need legal review. Owner decision 2026-11-15: leave privacy/terms content for now. | n/a | No work until the owner releases it. | Medium (public launch) | Yes |
| R-44 | §6.15 thank-you, 404 | B | `/thank-you/`: `noindex, follow`, title matches. 404: HTTP 404, `noindex`, title "Page Not Found \| RCAAS Technology". | The 404 probe (`/nope`) had **0 `<h1>`, 0 `<main>` and 6 words** in its server HTML (dev server), so the spec's helpful-404 links and heading are not in the static HTML. Not checked on a production build. Copy not compared word for word. | P2 | Check on the production build; if the same, render the 404 content on the server. | Low | No |
| R-45 | Blog spec, §7 launch rule | A (mechanics) / C (content) | `content/blog/index.ts`: launch needs 3 published posts. Today the hub and posts are `noindex` and hidden from navigation and RSS; the RSS route exists. Four starter posts exist (spec lists three plus later ideas). The hub shows 5 markers and the "Introducing RCAAS" post 13; the other posts were not counted. | Content only. | P2 | Write posts only when real material exists. Do not launch with markers. | Low | Yes |

### 2.4 SEO, structured data, media, accessibility, measurement

| ID | Spec § | Status | Implementation and evidence | Gap | Pri | Recommendation | Risk | Owner? |
|---|---|---|---|---|---|---|---|---|
| R-50 | §8.3 title ≤ 60, description 140–160, unique | B | `meta.ts` `pageMeta`. **Titles over 60:** `/services` (76), `/industries/factories` (62), `/industries/banking-financial-institutions` (63), `/work` (64, the spec's own title), compare guide (62). **Descriptions under 140:** `/work` 134, three case studies 122–137, compare guide 133, privacy 114, terms 80, gallery 112, cookies 134, security 100. **Over 160:** `/services` 321 and `/thank-you` 321 (both fall through to the 321-character boilerplate), game-worlds 165, `/industries` 182, gaussian guide 172. One duplicate title (game worlds / gaming). | 15 pages out of range. | P2 | Give `/services` and `/thank-you` their own descriptions; tighten the rest; unify the two titles. | Low | No |
| R-51 | §8.3 `lang` | B | `<html lang="en">`. | Spec: `en-GB`. | P3 | Change to `en-GB`. | Low | No |
| R-52 | §8.3 OG | B | `og:image` present on every page (`public/og.jpg`, 1200×630, the old site's stupa). | Spec: per-section 1200×630 images. Register G16. | P3 | Add per-section images when approved assets exist. | Low | Yes |
| R-53 | §8.3 dates | C | "Last updated" appears on FAQ and legal pages only. | Spec: on services, FAQ and Learn. | P2 | Add a `updated` field to each service and guide, shown and mirrored in schema. | Low | No |
| R-54 | §7 facade, no live 3D on load | A | Crawl: **0 iframes on all 43 pages**; the viewers load after an action. Phone-size WebP variants and `srcSet` exist (`CLAUDE.md`, `image-variants.test.mjs`). | Poster alt and text description present where seen; not exhaustively checked. | P3 | Keep. | Low | No |
| R-55 | §7 performance targets (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, Lighthouse ≥ 90) | C (unmeasured) | No Lighthouse or Web Vitals record anywhere in the repo or docs. Home server HTML is 1 605 words and the site ships GSAP, framer-motion, three.js canvases and custom cursor effects. | Cannot say the targets are met. | P1 | Run Lighthouse mobile on the production build for home, a pillar, a guide and contact. Record the numbers. | Medium | No |
| R-56 | §8.8, WCAG 2.2 AA | B | One `<h1>` and one `<main>` on every 200 route (crawl; not on the 404 probe). Phase 12 of `CLAUDE.md` reports an automated check of all 42 pages and a contrast pass. | I did not re-run accessibility checks or test keyboard use. Decorative HUD overlays and typewriter text may need `aria-hidden`. | P2 | Re-run the existing browser checks after WP1–WP3, add a keyboard and screen-reader pass on facades. | Medium | No |
| R-57 | §10 events | **C / E** | Custom events are pushed to `window.dataLayer`: `form_submit`, `whatsapp_click`, `phone_click`, `email_click` (Contact only), `early_access_submit`, `blog_share`; `model_open` only if `window.gtag` exists (`WorkPage.tsx:53`). No GA4/GTM loader exists, and there is no consent control. | Events go nowhere. Phone/WhatsApp/email clicks fire only on the contact page. `video_play` is absent. Privacy copy says GA4 is "planned, consent-gated". | P2 | Decide on a provider (Register G11), add a consent-gated loader, fire click events from the shared header and footer. | Medium (privacy) | Yes |
| R-58 | §8.4, Register G08 | C | No Google Business Profile or Bing Places record can be verified from the repo. | Outside the code. | P2 | Owner action. | Low | Yes |
| R-59 | §8.1 hreflang, Nepali (G12) | F / E | No Nepali marketing pages and no hreflang. The tour viewer has EN/NE/ZH. | Optional (spec priority N). | P3 | Defer. | Low | Yes |
| R-60 | §13 Placeholder Register | B | `PLACEHOLDER_REGISTER` (41 items) shows in a dev-only modal, with owner statuses. | Spec ids G17, G18, E07, S06, H03–H05, W05, X01, B01–B03 are not mirrored, and statuses read "Simulated in Production", which is unclear. | P3 | Rename the statuses; add the missing ids. | Low | No |

---

## 3. Existing strengths

- **Routing and ownership are clean.** Every URL has one native owner, with validated dynamic families and a 404 for unknown paths.
- **Server HTML is complete.** All 43 routes render at least 200 words server-side, one `<h1>`, one `<main>`, a visible breadcrumb and an `og:image`. No iframe or live 3D loads with the page.
- **Publication gates exist and work:** case studies, industries, guides, legal pages and the blog are held back with `noindex`. The blog launch threshold is enforced in code.
- **Confirmed facts are centralised** in `SITE_METADATA` (phone, email, address, hours, response aim). Contact links agree across pages.
- **Honest sections exist.** Visual Storytelling uses real capture media and labels what is illustrative. How We Work attributes scanner specs to the manufacturer. The platform page does not claim analytics, subscriptions dates or early-access benefits.
- **Structured-data builders are pure and tested** (`structuredData/`, `test/marketing-schema.test.mjs`), so moving them to the server (R-31) is a small change.
- **Responsive images, HTML spam traps, consent checkbox, redirect to `/thank-you/`** are implemented on the contact form.

## 4. Missing functionality (from the matrix)

1. Production gate for placeholders (R-32).
2. Server-rendered JSON-LD (R-31).
3. Consent-gated analytics and shared click events (R-57).
4. Header secondary "Explore a live tour" button; real-link primary CTA (R-17).
5. No-JS contact form path; budget select (R-42).
6. Per-page "Last updated" on services and guides (R-53).
7. A rule-checker for internal linking (R-20) and for claims (WP1).
8. Performance measurements (R-55).
9. Social icons (R-07), per-section OG images (R-52), `sitemap-index.xml` with real `lastmod` (R-14).
10. The ITECO case study decision (R-37).

## 5. Outdated or superseded requirements (do not implement)

| Spec item | Why it is superseded |
|---|---|
| Astro, content collections, `src/pages/*.astro`, `astro:assets`, `@astrojs/sitemap` (§9) | The site is Next.js; the architecture refactor is complete and verified. |
| Repo layout and `docs/copy/*.md` seeding (§0, §9) | Content lives in typed registries under `features/marketing/content`. |
| H1 "Real places. Real stories. Real results." (§6.1) | The owner confirmed "Turn real places into experiences that move people." |
| WhatsApp +977 9866157536 (§4.1) | Owner-confirmed number is +977 981 078 9487. |
| Team "hold individual profiles" (§6.12) | Owner approved and published four members. |
| Platform "Measure" framing and analytics (§6.9, §10) | Studio analytics are not offered to clients; the page correctly does not claim them. |
| `sitemap-index.xml`, `GA4/GTM`, `Cloudflare` hosting notes (§8.6, §9) | Hosting is postponed; revisit with the VPS decision. |
| "30 indexable pages" (§2.4) | The site now has 31 indexable routes plus drafts; count depends on R-12. |
| Spec sitemap case-study slugs with capitals and `&` (§3.1) | Violate §3.2 itself. The code uses the lower-case slugs of the §6.8 table. |

## 6. Conflicts found

| # | Conflict | Evidence | Recommended resolution |
|---|---|---|---|
| C-1 | Spec vs code scope: 3 pillars / 5 industries vs 4 / 11 | `siteData.ts`, `types/index.ts` | Owner confirms each addition (R-12). |
| C-2 | Spec rule "no numbers, accuracy, timings" vs live pages that print them | R-03 | Remove; code and spec are right to disagree with the pages. |
| C-3 | Draft rule (excluded from listings) vs home page linking Factories and Banks | Home HTML: "Factories" chip, "Banks & Financial Institutions" card | Filter home lists by the same `draft` flag. |
| C-4 | Guides marked published vs their own "draft until…" comment | `guides.ts:50-51` | Owner decision (R-33). |
| C-5 | Slash policy: spec trailing slash; Node host slash-less; export trailing slash | Crawl 308s; `next.config.mts:18` | One policy for both targets (R-13). |
| C-6 | `CLAUDE.md` says "Every marketing page carries `ProfessionalService` + `WebSite` JSON-LD" | Server HTML has none | JSON-LD exists only after hydration (R-31). Update the wording or fix the cause. |
| C-7 | Spec internal contradictions: two WhatsApp numbers; two home H1s; robots "block" comment over `Allow: /`; unavailable `/work/` title at 64 characters against its own 60-character rule; five rows in the case snapshot but "four case studies" | Spec pp. 4, 14, 35, 21 | Treat as noted; code follows the owner's decisions. |
| C-8 | Audit Register says everything is "Simulated in Production" | `siteData.ts` `REGISTER_ITEMS` | Rename statuses so they do not read as claims of live evidence. |
| C-9 | `CONTENT_TODO.md` (13 Nov) names files that no longer exist | File list vs tree | Regenerate (WP2). |
| C-10 | Simulated canvas demos vs "Do not describe unreleased features as live" | `SplatEmbed.tsx`; `CLAUDE.md` open question | Owner decision (R-06). |

## 7. Visual and UX deficiencies

Observed from code and rendered text only; no screenshots were taken.

1. **Amber dashed placeholder boxes show inside live copy** on 17 indexable pages (`Placeholder.tsx`), including the home page and the cost guide. This is the most visible defect.
2. **Decorative "telemetry" HUD text** reads as product fact: "LIVE 3D ENGINE · 60 FPS", "LOD: Full detail", "ROI Multiplier", "Load Time" (R-03).
3. **Simulated demo with real client names** (R-06).
4. **Home leads with drafts:** Factories and Banks appear in the hero chips and industry grid but their pages are `noindex` stubs full of markers (C-3).
5. **Four pillars versus the three-column "What we create" menu in the spec** (header mega-menu and home both carry four).
6. **Heavy pages.** Home is 1 605 server words against a 600–800 spec budget, with several animated canvases. Weight is unmeasured (R-55).
7. **Primary CTA is a button/modal**, so it does nothing without JS and cannot be opened in a new tab (R-17).
8. **`/gallery/` returns 203 words**: it depends on the API; if the API is down the page is thin.

## 8. Content and evidence gaps

Facts needed from the owner (spec Register ids in brackets). Do not fill with estimates.

- **Per-project facts** for all four case studies: capture methods, area, time on site, deliverables, results, client quote with permission, photos with consent, client approval of names [W01–W04]. ITECO: include or not.
- **Pricing basis, turnaround, accuracy statements** [S01–S03], file formats [S04], GNSS/scanner specs [S05], drone permissions process [S06].
- **Hosting terms** are confirmed in the platform FAQ [P05]; ownership and portfolio terms [H02], people/faces policy [H03], archive handover [H01].
- **Guide authors and first-hand project data** [L01, L02]; blog post facts and photos [B01–B03].
- **Social URLs** [G07], Google Business Profile [G08], analytics choice [G11], AI crawler policy [G13], OG images [G16].
- **Real-estate and government proof projects** [W05]; decisions on every industry and pillar beyond the spec (R-12).
- **Budget bands in NPR** for the contact form [G18].
- **Legal review** of privacy and terms [X01]. Owner: leave for now.

## 9. Technical and SEO gaps

See R-13 (slash policy), R-14 (sitemap), R-15/R-16 (robots, llms.txt), R-31 (JSON-LD), R-32 (placeholder gate), R-50 to R-53 (metadata), R-55 (performance), R-57 (analytics). Deployment gates already listed in `CLAUDE.md` still apply: set `NEXT_PUBLIC_SITE_URL` (canonicals currently point at `localhost`), verify a Resend sending domain, and decide the Pages copy's fate.

---

## 10. Recommended implementation order

| WP | Work | Covers | Needs owner? |
|---|---|---|---|
| **WP1** | **Claims sweep.** Remove or relabel every unverified number and headset claim, fix `llms.txt`, clean the decorative HUD labels. Add a test that fails on a banned-pattern list (`FPS`, `ROI`, `< \d`, `±`, `Apple Vision`, `HTC`, `ProRes`, `16K`, `\d+–\d+ MB`, `hours and 1 day`). | R-03, R-04, R-35 | Only to approve any figure kept |
| **WP2** | **Placeholder gate.** Add `scripts/check-placeholders.mjs`, run it in `prebuild` (override `ALLOW_PLACEHOLDERS`). Mark failing pages draft or hide their sections. Remove drafts from home lists and sitemap. Regenerate `CONTENT_TODO.md`. | R-32, R-33, R-36, C-3, C-9 | Yes for the cost guide and any page to keep live |
| **WP3** | **Scope decision.** Owner confirms pillars and industries; fix the duplicate title; align home, header, footer, sitemap and `llms.txt` with the decision. | R-12 | **Yes** |
| **WP4** | **Demo honesty.** List `SplatEmbed` mounts; replace non-Chilancho simulations with approved external viewers or a plain poster. | R-06 | Yes |
| **WP5** | **SEO plumbing.** Server-render JSON-LD; one slash policy; sitemap from `ROUTES` with real dates; titles and descriptions to range; `en-GB`; "Last updated"; `sitemap-index` if wanted. | R-13, R-14, R-31, R-50 to R-53 | Slash policy only |
| **WP6** | **Conversion paths.** Real-link primary CTA, secondary header button, no-JS contact fallback, shared click events, consent-gated analytics. | R-17, R-42, R-57 | Provider choice |
| **WP7** | **Measure.** Lighthouse mobile and Web Vitals on a production build; accessibility and keyboard pass on the facades and carousels. | R-55, R-56 | No |
| **WP8** | **Content fill, as facts arrive.** Case studies, guides, blog, industries, platform marker items. | R-33, R-37, R-38, R-39, R-45 | Yes |
| **WP9** | **Outside the code.** Resend domain, Google Business Profile, socials, AI-crawler policy, legal review. | R-15, R-58, R-43 | Yes |

WP1 and WP2 come first: they remove the misleading and unfinished material before any design work. WP3 should be answered early because it changes the size of WP2, WP4 and WP8.

## 11. Completion criteria for later tasks

A later task is done only when it shows evidence for each line.

- **WP1.** A repeatable scan of rendered text for all 43 routes finds none of the banned patterns. `llms.txt` carries no superlative. A unit test fails if one returns.
- **WP2.** `npm run build` fails when a non-draft page contains `[[`. It passes with `ALLOW_PLACEHOLDERS=true`. The crawl shows 0 markers on every indexable page. No draft page is linked from the home page, header, footer or sitemap.
- **WP3.** A written owner decision for each of the 7 additions. No two pages share a title. Home, header, footer, sitemap and `llms.txt` list exactly the confirmed set.
- **WP4.** No page presents invented waypoints, spaces or coordinates under a real client's name. Every embed is either an approved external viewer or an unmistakably generic illustration.
- **WP5.** The server HTML of every indexable page contains valid JSON-LD with no placeholder values. One slash policy gives the same canonical on the Node host and the Pages export, and the other form redirects once. Every title is 60 characters or fewer, every description 140–160. `<html lang="en-GB">`.
- **WP6.** The primary CTA is an `<a href>`; the contact form submits without JS; click events fire from the header and footer; analytics load only after consent.
- **WP7.** Recorded mobile Lighthouse scores and Web Vitals for four representative pages, with any shortfall listed. Keyboard operation of every facade and carousel confirmed.
- **Every task.** `npx tsc --noEmit`, `npm run lint` (zero errors) and `npm test` pass; the existing marketing browser suite passes; `CLAUDE.md` §4 is updated in the same change; the final note lists what was not verified.

---

## Appendix A: per-route facts (crawl of the local dev server, 15 Nov 2026)

Columns: path (slash-less form, since the slash form returns 308) · title length · description length · robots · visible `[[` markers · words in server HTML · JSON-LD in server HTML.

| Path | Title chars | Desc chars | Robots | Markers | Words | JSON-LD in server HTML |
|---|---|---|---|---|---|---|
| / | 57 | 156 | index, follow | 1 | 1605 | none |
| /services | 76 (over) | 321 (out) | index, follow | 0 | 1748 | none |
| /services/immersive-experiences | 54 | 157 | index, follow | 0 | 2175 | none |
| /services/immersive-experiences/3d-virtual-tours | 53 | 144 | index, follow | 0 | 2028 | none |
| /services/visual-storytelling | 60 | 156 | index, follow | 0 | 1198 | none |
| /services/game-worlds-assets | 49 | 165 (out) | index, follow | 5 | 610 | none |
| /services/digital-twins | 56 | 154 | index, follow | 4 | 3088 | none |
| /services/digital-twins/3d-laser-scanning | 47 | 158 | index, follow | 0 | 1954 | none |
| /services/digital-twins/drone-mapping | 50 | 155 | index, follow | 0 | 1767 | none |
| /industries | 41 | 182 (out) | index, follow | 0 | 618 | none |
| /industries/hospitality-tourism | 57 | 157 | index, follow | 3 | 921 | none |
| /industries/education | 55 | 151 | index, follow | 3 | 884 | none |
| /industries/real-estate-architecture | 53 | 146 | index, follow | 9 | 867 | none |
| /industries/heritage-culture | 60 | 159 | index, follow | 2 | 1252 | none |
| /industries/government-municipalities | 57 | 160 | index, follow | 8 | 841 | none |
| /industries/factories | 62 (over) | 156 | noindex, nofollow | 9 | 752 | none |
| /industries/non-life-insurance | 55 | 141 | noindex, nofollow | 9 | 759 | none |
| /industries/gaming | 49 | 151 | index, follow | 9 | 692 | none |
| /industries/filmmaking | 56 | 146 | index, follow | 10 | 677 | none |
| /industries/nonprofit-international-development | 57 | 143 | index, follow | 7 | 749 | none |
| /industries/banking-financial-institutions | 63 (over) | 149 | noindex, nofollow | 11 | 1022 | none |
| /work | 64 (over) | 134 (out) | index, follow | 0 | 520 | none |
| /work/chilancho-stupa-digital-heritage | 49 | 128 (out) | noindex, nofollow | 9 | 647 | none |
| /work/nepathya-school-college-3d-campus-tour | 52 | 122 (out) | noindex, nofollow | 11 | 541 | none |
| /work/madan-ashrit-polytechnic-3d-campus-tour | 56 | 150 | noindex, nofollow | 11 | 514 | none |
| /work/basera-boutique-hotel-3d-experience | 55 | 137 (out) | noindex, nofollow | 13 | 529 | none |
| /platform | 50 | 146 | index, follow | 2 | 975 | none |
| /how-we-work | 50 | 155 | index, follow | 2 | 1376 | none |
| /learn | 50 | 142 | index, follow | 6 | 322 | none |
| /learn/3d-virtual-tour-vs-360-tour-vs-video | 62 (over) | 133 (out) | index, follow | 5 | 1260 | none |
| /learn/what-is-gaussian-splatting | 49 | 172 (out) | index, follow | 5 | 1190 | none |
| /learn/planning-a-3d-experience-cost-and-timeline | 52 | 157 | index, follow | 32 | 1063 | none |
| /about | 55 | 143 | index, follow | 0 | 1371 | none |
| /faq | 49 | 148 | index, follow | 0 | 1248 | FAQPage only |
| /contact | 50 | 157 | index, follow | 0 | 507 | none |
| /privacy | 33 | 114 (out) | noindex, nofollow | 12 | 1351 | none |
| /terms | 31 | 80 (out) | noindex, nofollow | 9 | 985 | none |
| /gallery | 34 | 112 (out) | index, follow | 0 | 203 | none |
| /cookies | 32 | 134 (out) | index, follow | 0 | 571 | none |
| /security | 34 | 100 (out) | index, follow | 0 | 613 | none |
| /thank-you | 28 | 321 (out) | noindex, follow | 0 | 200 | none |
| /blog | 47 | 152 | noindex, nofollow | 5 | 422 | none |
| /blog/introducing-rcaas-technology | 41 | 153 | noindex, nofollow | 13 | 459 | none |

The 404 probe (`/nope`): status 404, `noindex`, 0 h1, 0 main, 6 words. Trailing-slash forms of all 43 routes returned 308 to the slash-less form.

The crawl scripts were temporary and are not in the repo. To repeat it: GET every path in `ROUTES` (slash-less) from a running server and count `<h1>`, `<main>`, `<iframe>`, `[[`, `application/ld+json`, title and description lengths in the HTML.
