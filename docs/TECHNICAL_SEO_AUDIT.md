# RCAAS technical SEO audit

**16 November continuation:** the six-task audit adds Gallery/Cookies/Security breadcrumbs, removes draft-sector claims from industry metadata/discovery schema, removes an unconfirmed corporate LinkedIn identity, and holds two guides under the recovered owner decision. This changes the current indexable marketing set to 28. Earlier counts and open items below remain dated history. See [the completion matrix](RCAAS_WEBSITE_SIX_TASK_COMPLETION.md) and [latest QA](design/COMPANY_WEBSITE_FINAL_QA.md) for the current assessment; no public URL was renamed.

Date: 15 November 2026. Follows `docs/WEBSITE_PUBLICATION_SAFETY_REPORT.md`. Scope: the public marketing site only. Nothing is committed, pushed or deployed, and no draft page was published. No visual design, approved copy (beyond the metadata and two schema strings named below), route or architecture was changed.

## 1. Method

Both targets were built and the **generated HTML was parsed**, not the dev server:

| Target | Build | Pages parsed |
|---|---|---|
| Node production | `NEXT_PUBLIC_SITE_URL=https://rcaas.tech npm run build` (separate dist dir) | 49 HTML pages: 30 indexable, 19 `noindex` |
| GitHub Pages export | CI's route exclusions, `NEXT_OUTPUT_EXPORT=1`, base path `/RCAAS`, site URL `https://owner.github.io/RCAAS`, in an isolated copy | 51 HTML pages: 30 indexable, 21 `noindex` |

For every page the audit read the title, description, canonical, robots, Open Graph and Twitter tags, `<h1>` count and the JSON-LD block (parsed as JSON), then compared them with each other, with the sitemap, and with `robots.txt` and `llms.txt`. The two builds' sitemap, robots and llms files were read as built.

## 2. Findings

| # | Area | Result | Outcome |
|---|---|---|---|
| 1 | Server-rendered JSON-LD | **Pass.** Exactly one block on every public page in both builds, valid JSON, no duplicate `@id`, no placeholder. Families covered: home, about, contact, faq, how-we-work, platform (WebPage/FAQPage), services (CollectionPage, and Service on all seven pillar and capability pages), industries (WebPage, FAQPage, BreadcrumbList), learn (CollectionPage, Article, FAQPage), work (CollectionPage, Article on drafts), blog (Blog, BlogPosting on drafts), cookies, security, gallery. Redirect stubs (`/gaussian-splatting`, `/how-it-works`), `/login` and `/studio` carry none, correctly. | No change |
| 2 | **Schema URLs against canonical** | **Defect.** Every URL in the schema was a hard-coded `https://rcaas.tech/<path>/`. On the Node host the canonical is slash-less (`…/services/digital-twins`), so schema and canonical named two addresses for one page. In the Pages export the host differed as well (`rcaas.tech` against `github.io/RCAAS`). | **Fixed.** `structuredData/alignUrls.ts` rebases each address onto the site URL and applies the host's slash form; `MarketingJsonLd` uses it; `next.config.mts` exposes `NEXT_PUBLIC_TRAILING_SLASH` so server and client render the same text. After the fix, all 76 page-level URLs checked (page, service, article and breadcrumb nodes) equal their canonical in both builds. The builders and their parity tests are untouched. |
| 3 | **Duplicate titles** | **Defect, confirmed.** `/industries/gaming` and `/services/game-worlds-assets` shared one title (`Game Worlds & Assets from Real Places | RCAAS`) and nearly the same description. They compete for one query and one is wasted. | **Fixed.** Gaming industry page: `3D Capture for Game Studios & Developers | RCAAS`, described for game studios and developers. The service page keeps its title. Both builds: 0 duplicate titles, 0 duplicate descriptions among indexable pages. |
| 4 | Title and description relevance, uniqueness, truncation | Reviewed all 30 indexable pages by reading each. No arbitrary limit applied. **Defects fixed:** (a) `/services` had no entry, so it fell back to the 321-character company boilerplate, which every search engine truncates mid-sentence, with a 72-character title; it now has its own title (59) and description (138) about what the pages offer. (b) The laser-scanning description (and its Service schema text) said "captured in hours, not days", a turnaround claim the owner has not confirmed (Register S01); removed. **Left as is, on purpose:** one title is 62 characters (`/learn/3d-virtual-tour-vs-360-tour-vs-video`), and three descriptions run 165–182 (`/industries`, `/learn/what-is-gaussian-splatting`, `/services/game-worlds-assets`). Each opens with its point and loses only trailing words, so no rewrite of approved copy is justified. `/security` (100) is short but specific. | Fixed (a), (b); noted the rest |
| 5 | Canonical | **Pass.** Every indexable page has exactly one canonical equal to its `og:url`. Node host: slash-less, and the home page is the bare site URL. Export: slash with the `/RCAAS` base. No page canonicalises to another page. | No change |
| 6 | Sitemap | **Pass** for marketing pages: in both builds the sitemap's marketing entries equal the set of indexable pages exactly; no `noindex` page is listed, and the cost guide (draft) is absent. **Defect (export):** the sitemap also fetches the API at build time and appended `/s/…` and `/t/…` entries. The Pages workflow deletes those routes, so a developer-built export (API reachable) listed three URLs that 404. CI has no API, so the live Pages copy was not affected. | **Fixed.** The export sitemap lists marketing pages only (30 entries, 0 `/s/` or `/t/`). The Node sitemap keeps client websites and tours from the API; locally that is the sample project `chyasal-house` and `office-chyasal` (an owner item, see section 5). |
| 7 | Robots directives, drafts | **Pass.** Drafts are `noindex, nofollow`: cost guide, factories, non-life-insurance and banking industries, four case studies, blog hub and posts, privacy, terms, thank-you, the two redirect stubs, login, studio. Each is absent from the sitemap. `robots.txt` allows all agents and names the sitemap with the right host in each build. | No change |
| 8 | Open Graph and Twitter | **Pass.** Every indexable page has `og:title`, `og:description`, `og:url`, `og:image` (1200×630, with width, height and alt), `og:site_name`, `og:type=website`, `twitter:card=summary_large_image`, `twitter:title`, `twitter:description` and `twitter:image`, and each equals the page's own title or description. **Defect:** `og:locale` was `en_US` and `<html lang>` was `en`, while all copy is British English. | **Fixed:** `en_GB` and `en-GB` (matches the spec's own requirement). One shared image still serves every page (a spec item, Register G16, left as an owner decision). |
| 9 | `llms.txt` | **Pass** after the earlier rewrite: no superlative, no draft sector, links on the build's own host and canonical slash form. | No change |
| 10 | Trailing slash | **Consistent per host**, as concluded earlier: Node 308-redirects slash to slash-less, the export serves slash. Not forced. | No change |

## 3. Changed files

| File | Change |
|---|---|
| `src/features/marketing/structuredData/alignUrls.ts` (new) | Pure helper that rebases schema URLs and applies the slash form |
| `src/features/marketing/routing/MarketingJsonLd.tsx` | Applies it to the graph |
| `next.config.mts` | `env.NEXT_PUBLIC_TRAILING_SLASH` (set for the static export only) |
| `src/features/marketing/content/industries/gaming.ts` | Own title and description |
| `src/features/marketing/meta.ts` | `/services` title and description; laser-scanning description |
| `src/features/marketing/structuredData/services.ts` | Same laser-scanning sentence in the Service schema |
| `src/features/marketing/routing/metadata.ts`, `src/app/layout.tsx` | `og:locale` `en_GB`; layout `lang="en-GB"` |
| `src/app/sitemap.xml/route.ts` | Export lists marketing pages only |
| `test/publication-safety.test.mjs` | Three new tests (below) |
| `.gitignore`, `CLAUDE.md`, this file | Allow-list line; status entry |

## 4. Validation evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed |
| `npm run lint` | 0 errors, 6 warnings (the known six) |
| `npm test` | 78 client + 192 server passed, 2 server skipped, 0 failed |
| New tests | Schema URLs take the slash form of each host (node and export cases, files and other origins untouched); every indexable route has a unique title and description and no "hours, not days" style timing; a page's schema URL equals its canonical form in both modes |
| Node production build | Passed; placeholder gate: 31 indexable of 51 prerendered pages, clean |
| Pages export build | Passed; gate: 31 of 51, clean |
| Parsed-HTML audit, both builds (after the fixes) | 0 duplicate titles; 0 duplicate descriptions; one canonical, one JSON-LD block, one `<h1>` on every indexable page; 76 of 76 schema URLs equal their canonical; sitemap equals the indexable set; no `noindex` page listed; Open Graph and Twitter complete |
| Browser, Node preview (`npm run test:e2e`) | 22 passed |
| Browser, `/RCAAS` export (static server) | 10 passed, 12 fixture-only skips (as in the earlier baseline) |

The new duplicate-title test was written after the defect was seen in the build output; it passes now, and was not separately run against the old gaming title.

## 5. Open items (owner decisions, not defects fixed here)

1. **Sample project in the Node sitemap.** `chyasal-house` and `office-chyasal` are real published projects on this PC, so they appear in the Node sitemap. `CLAUDE.md` already says to unpublish or delete the sample before launch.
2. **`/industries` description (182 characters)** names insurers and banks, whose pages are drafts; the hub page links to them.
3. **One shared share image** for all pages, and no per-page `og:image:alt`.
4. **Schema host in the Pages copy.** It now names `github.io/RCAAS` as its own entity. If the copy should defer to `rcaas.tech`, canonicals (not only schema) would need to point there. The earlier recommendation stands: switch Pages off once `rcaas.tech` is live.
5. `/gallery`, `/cookies` and `/security` show a breadcrumb on the page but emit no `BreadcrumbList` (organisation node only). Not a defect; a small addition if wanted.
6. `robots.txt` still allows every AI crawler (a recorded owner decision). `Organization.sameAs` lists LinkedIn only.

## 6. Not verified

- No Search Console, Rich Results Test, Lighthouse or live crawl; schema was checked for valid JSON and URL consistency, not against Google's validator.
- The production host behind a proxy, real redirects and TLS, and the deployed GitHub Pages site were not exercised: the Node HTML came from a local production build, and the export was served by a local static server.
- Dynamic (per-request) pages are not in the parsed set. Studio, authentication and the client website and tour routes were not part of this audit.
- The dev server running on this machine needs a restart to pick up the new `next.config.mts` setting.
