# Working on the public website

Start at `src/app/(marketing)/page.tsx` for home, or the native folder for the URL. Homepage content is composed in `features/marketing/home/HomePage.tsx`; named sections, copy and types are beside it. Existing UI, animation hooks, images and section anchors are preserved.

All public routes share `(marketing)/layout.tsx`, `.rcaas` CSS scope and `MarketingShell`. Content must not add a second main landmark or another shell. Named client adapters use `useMarketingPageProps` for existing navigation/planner callbacks. Static entry files export `marketingMetadata(path)`; industry, work and blog routes validate parameters on the server and generate metadata for the resolved path.

To add an ordinary page, create its native `page.tsx`, implement content in the appropriate marketing feature and provide its named client adapter where callbacks are needed. Update the existing metadata/content source, `ROUTES` and the separate indexable `PAGES` list in `app/sitemap.xml/route.ts` where appropriate. Add browser coverage. Each URL has one owner; the root fallback generates only moved URLs and never selects page content.

Industry and case-study slugs come from their content registries. Blog posts/pagination use `resolveBlogRoute`, preserving publication gates, preview noindex and invalid-page rejection. Keep server `notFound()` handling and `generateStaticParams` when extending these families. Resolve data containing icon functions inside client adapters rather than passing functions across the server boundary.

Navigation preserves query strings and hashes. Public assets use `withBase`/existing image helpers. GitHub Pages uses `/RCAAS` and directory indexes; do not hardcode the prefix in sections. Root-domain hosting uses the same source with an empty base path.

After route/module deletions, restart `npm run dev`. A running webpack process can retain the old import graph even when current source and clean production builds are valid. If it reports a missing former module, stop the verified project dev process, remove only its generated `.next/dev` directory and restart. Preserve source, account data and assets. Confirm the live server as well as isolated test previews.

Structured data belongs in `structuredData`, grouped by services, places/work, editorial and company. `buildMarketingGraph` is pure and testable without a browser. Shared rendered/schema FAQ answers belong in `content/pageFaqs.ts`. `useMarketingMetadata` retains document title/robots/RSS/JSON-LD updates; server metadata has a separate responsibility. Preserve output and publication filtering when changing either.

Commands:

- `npm run dev`: local frontend and API.
- `npm test`: client/tooling and server suites, including publication/schema contracts.
- `npm run lint` and `npx tsc --noEmit`: lint and types.
- `npm run build`: complete Node-host build.
- `npx playwright install chromium`: install the browser once.
- `npm run test:e2e`: compile marketing CSS, then run desktop/phone checks in an isolated Next checkout.
- `PLAYWRIGHT_CHANNEL=chrome`: optional installed Chrome channel.
- `PLAYWRIGHT_BASE_URL`: target an already running preview/export; Studio fixture checks skip there.

The default browser server copies source/public/config into an ignored workspace QA directory and injects `test/browser/fixtures/StudioFixture.tsx` there. This route is absent from production source. It uses actual Studio controls/publishing and intercepted API responses; tests verify draft revisions and asset references without writing real data. Public-site tests also block API writes and mock reads. Never use a production endpoint to test real submissions.

Reports/traces are ignored under `playwright-report` and `test-results`; CI installs Chromium explicitly. Root Node checks and `/RCAAS` exported-artifact checks serve different deployment targets. Physical-device/GPU, full authenticated-editor, database and delivery verification remain separate tasks.
