# RCAAS visual refinement report

**Continuation, 16 November 2026:** the original 15 November findings and captures below are retained as historical evidence. See [Company website final QA](COMPANY_WEBSITE_FINAL_QA.md) for fresh verification, content corrections, industry-card/cursor/carousel/navigation fixes, three-engine browser checks and the rebuilt `/RCAAS` export. In particular, sections 6–8 below describe the previous run: small carousel targets, unopened desktop-menu screenshots and the missing Pages rebuild have now been addressed; remaining photo/publication owner decisions are documented in the new report.

Date: 15 November 2026. Base: commit `5ef01b3`. The approved design was kept: no colour, typeface, layout, spacing system, brand element, copy, route, SEO code, Studio or backend file was changed. Nothing is committed, pushed or deployed.

## 1. How the site was inspected

**Measured.** A Playwright probe (`qa-bug-hunt/visual/audit.mjs`, ignored folder) loaded 32 public pages at **320, 390, 768, 1024, 1440 and 1920 px** (192 page loads) against a local production build (`next start`). It scrolled each page through so scroll reveals and lazy images ran, then measured:
- horizontal page overflow;
- elements escaping the viewport;
- broken, distorted and upscaled images;
- clipped text;
- tap targets under 24 px (at 768 px and below);
- JavaScript errors;
- the `<h1>` size, weight and left edge on every page.

Raw results are in `screenshots/audit-before.json` and `screenshots/audit-after.json`.

**Looked at.** 21 viewport screenshots: home, services, two pillar pages, an industry page, learn, contact, footer and carousel on a phone, the desktop navigation and the mobile menu. Each was taken at the width where the probe or the code suggested a problem. Before and after pairs are in `docs/design/screenshots/`.

**Baseline (before), all six widths:**
- No page scrolls sideways at any width, and no element escapes the viewport. The only exception is the contact form's honeypot, which is deliberately off-screen.
- No broken or distorted images, and no JavaScript errors.
- The heading scale is consistent: `<h1>` is 60 px, weight 700, on 28 of 31 pages at 1440 px.

The design is in good shape; the defects below are specific.

## 2. Issues found

Severity: **High** means visibly broken or unreadable. **Medium** means a visible imperfection. **Low** means a minor polish point. Preferences are not counted.

| # | Severity | Issue | Evidence | Where |
|---|---|---|---|---|
| 1 | **High** | **Overlay gradients missing on 6 photos.** The class `bg-linear-to-t from-…` had been mangled into `bg-linear-to-trom-…` (a find-and-replace accident). Tailwind generated no gradient, so the dark scrims meant to sit under text on photographs were absent. On the 3D demo poster, "Illustrative canvas demo · No app needed", "Open full screen" and the red location line sat directly on a bright sky and white stupa, almost unreadable. | Screenshot `02-before-demo-overlay-1440.png`. A source search found every instance. | `SplatEmbed.tsx` (2: the demo used on the home page, Platform, Work, the industry pages and six service pages), `AboutPage.tsx` (2), `DroneMappingPage.tsx` (1), `CostGuidePage.tsx` (1, a draft page) |
| 2 | **High** | **Button label cut off.** On `/services`, the "One capture" panel's primary button read "EXPLORE 3D VIRTUAL TOUR" with the "S →" clipped. The button had `overflow: hidden` and `nowrap`, and the flex row shrank it to the space left beside the "Best for" text. The probe measured text 244 px in a 194 px button at 1440, 147 px at 1024 and 178 px at 768. | `01-before-services-button-1440.png`; probe `textClip` (4 hits) | `OneCaptureMultiUseVisualizer.tsx` |
| 3 | Medium | **Stray dot in the home hero on phones.** The red dot before "Geomatics engineers and game developers, based in Kathmandu." was a separate flex item. When the line wrapped at 320–390 px, the text block took the full width and the dot was left alone at the far left edge, about 90 px from the words. | `03-before-home-hero-390.png` | `home/components/HeroSection.tsx` |
| 4 | Medium | **Ragged specification card.** On the three Digital Twins pages, the "Survey specification profile" rows used `items-center` with no gap. Labels such as "Sensor hardware:" broke onto two lines while values wrapped against them, so labels and values sat at different heights. | `04-before-survey-card-1440.png` | `DigitalTwinsPage.tsx` |

## 3. Corrections

| # | Exact change | Result |
|---|---|---|
| 1 | `bg-linear-to-trom-` → `bg-linear-to-t from-` in all six places, restoring the gradients the code already specified (same colours and stops). | Demo overlay text is readable over the photo (`02-after-demo-overlay-1440.png`). The About and Drone Mapping photos regain their intended shading. |
| 2 | Button: added `shrink-0`. "Best for" text: added `min-w-0`, so it wraps instead of squeezing the button. | Text 244/244 px at 768, 1024 and 1440 (no clipping). The label is complete (`01-after-services-button-1024.png`). Phones keep the existing stacked layout. |
| 3 | The line is now centred inline text (`text-center text-balance`) with the dot as an inline element before the words (`aria-hidden`). It is the same dot, colour, size and type. | The dot stays beside the first word when the line wraps. The desktop appearance is unchanged (`03-after-home-hero-390.png`). |
| 4 | Rows: `items-baseline gap-4`. Labels: `shrink-0`. Values: `text-right`. Header: `gap-3`, and the brand label does not shrink. | Each label sits on one line, aligned with the first line of its value (`04-after-survey-card-1440.png`). |

**After, all six widths:**
- Clipped text went from 4 to 0.
- Horizontal overflow, broken images, distorted images and errors stay at 0.
- The other counts are unchanged (the figures in section 6 are not visible defects).

## 4. Files modified

- `src/features/marketing/components/SplatEmbed.tsx`
- `src/features/marketing/components/OneCaptureMultiUseVisualizer.tsx`
- `src/features/marketing/home/components/HeroSection.tsx`
- `src/features/marketing/pages/DigitalTwinsPage.tsx`
- `src/features/marketing/pages/AboutPage.tsx`
- `src/features/marketing/pages/DroneMappingPage.tsx`
- `src/features/marketing/pages/CostGuidePage.tsx`
- `.gitignore`: added `!docs/design/` so this report and its evidence can be tracked like the other reports.
- `docs/design/VISUAL_REFINEMENT_REPORT.md` and `docs/design/screenshots/` (8 PNG files and 2 JSON files, 2.2 MB)

Class names only; no markup restructuring beyond the hero line's dot.

## 5. Test results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed |
| `npm run lint` | 0 errors, the known 6 warnings |
| `npm test` | 78 client + 192 server passed, 2 skipped, 0 failed |
| Production build (`npm run build`, separate dist dir) | Passed, including the placeholder gate (31 indexable of 51 pages, clean) |
| Browser suite (`npm run test:e2e`) | 22 passed (desktop and phone: marketing routes, metadata, planner, navigation, Studio fixtures) |
| Visual probe, 192 page loads at 320, 390, 768, 1024, 1440 and 1920 px | Before: 4 clipped-text findings. After: 0. No overflow, broken or distorted images, or page errors at any width, before or after. |

The GitHub Pages export was not rebuilt for this change. The edits are Tailwind class names and one inline element, compiled the same way in both builds, but that is not the same as having tested the export.

## 6. Reviewed and deliberately preserved

These are differences or measurements that are not defects, or that would need a design or content decision:

- **Narrower container on the Digital Twins family.** Its pages start at 176 px rather than 112 px at 1440, and their breadcrumb style differs from the other pillars. It is a consistent family-level choice; aligning it would move every section on three pages, so it was left for a design decision.
- **Visual Storytelling's larger, lighter headline** (80 px, weight 600). This comes from its approved redesign of 13 November.
- **The home and thank-you pages use a centred `<h1>`.** This is deliberate.
- **Pillar and industry heroes keep a large empty area on the right at 1440 px.** This is the existing composition.
- **Upscaled images at 1× density (29 measurements).** Phone-width cover images in tall frames pick the 640 px variant at 1× density. Real phones at 2× and 3× density request the larger variants, so this is not visible on them. It was left alone.
- **Tap targets under 24 px.** These are mostly links whose text is shorter than 24 px but which have clear space around them (the "FAQ" footer link at 22 × 35, the footer email link at 18 px tall, "Read more" links at 16 px tall). They also include native range sliders (16 px tall) and consent checkboxes that sit inside a clickable label. All of these fall under WCAG 2.5.8's spacing and label exemptions or are native controls.
- **The services carousel dots (8 × 40 px, closely spaced).** These are a real small-target case. The carousel is also swipeable and has arrow buttons, and enlarging the dots would change their look, so the dots were left as they are.
- **The custom cursor overlay** appears in desktop screenshots; it is part of the design.

## 7. Content items noticed (not changed: outside a visual task, owner decision)

- **The `/services` "Outcome & Impact" card** says "Visitor engagement metrics, dwell time, direct bookings, admissions enquiries". The site otherwise avoids claiming platform analytics, as `CLAUDE.md` records.
- **The `/services/immersive-experiences` hero** lists "WebXR & Headset Compatible", while the FAQ says the browser tour has no VR mode yet.
- **The Digital Twins specification card** lists "RVT" (Revit) and "Nepal Grid (UTM)". Revit output is not confirmed (Register S04).
- **`/learn`** says "Written from real projects", while the guides' project observations (L02) are not yet supplied.
- **The Chilancho Stupa photograph** on the services carousel and the demo poster appears to show Swayambhunath. This is an existing owner item in `CLAUDE.md`.
- **The footer and the industries menu list the three draft industries.**

## 8. Limitations

- **Screenshots** came from headless Chromium at 1× density on Windows. No real phone or tablet, Safari or Firefox was used, and no screen reader.
- **Animation timing** was observed only through scroll-through probes and still captures. GSAP and Framer timing were not frame-measured, and no timing was changed.
- **Desktop dropdown panels** were not captured open. The click in the script toggled the panel shut. The mobile menu was captured open and looked correct.
- **The probe's rules are heuristics.** The 21 screenshots cover the pages and widths where issues were found or suspected, not every page at every width.
- **The GitHub Pages export** was not rebuilt (see section 5).
