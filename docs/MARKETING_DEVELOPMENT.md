# Working on the public website

Start at `src/app/(marketing)/page.tsx` for home, or the native folder for the public URL. The homepage content is composed in `features/marketing/home/HomePage.tsx`; named sections and copy are beside it. This structure preserves the existing UI, animation hooks, images and section anchors.

All public routes share `(marketing)/layout.tsx`. It applies `.rcaas` CSS scope and `MarketingShell`; page content must not add a second main landmark or another shell. Use `useMarketingActions` inside client adapters for existing navigation/planner callbacks. Ordinary page entry files export server metadata through `marketingMetadata(path)`.

To add a page: create its native `page.tsx`, implement content in an appropriate marketing feature, add metadata/content to the existing source of truth, update `ROUTES` for static checks and the separate indexable `PAGES` list in `app/sitemap.xml/route.ts` where appropriate, and add browser coverage. Give the route one owner. The compatibility fallback must not also generate that route. For data-driven content, provide validated parameters, `generateStaticParams` and server `notFound()` handling before removing fallback support.

Native router navigation preserves public query strings and hashes; public assets still go through `withBase`/existing image helpers. GitHub Pages uses `/RCAAS`, with directory indexes. Do not hardcode that prefix in sections. Root-domain deployment uses the same source with an empty base path.

Commands:

- `npm run dev`: local frontend and API.
- `npm test`: client/tooling and server suites.
- `npm run lint` and `npx tsc --noEmit`: lint and types.
- `npm run build`: complete Node-host build.
- `npx playwright install chromium`: install the test browser once.
- `npm run test:e2e`: isolated Next server and desktop/phone Chromium checks. `PLAYWRIGHT_CHANNEL=chrome` uses an installed Chrome; `PLAYWRIGHT_BASE_URL` targets an already running local/export preview.

Browser tests block API writes and mock browser API reads. Do not point them at production to test real forms. Reports/traces are ignored under `playwright-report` and `test-results`. CI installs Chromium explicitly. Physical-device/GPU, authenticated editor, database and delivery tests need separate fixtures; a passing marketing suite is not evidence those flows were tested.

Retain the compatibility exports and content-selection adapter until all consumers migrate with browser evidence. `useMarketingMetadata` contains the preserved structured-data graph; future extraction should split by content family with output-equivalence tests. Do not remove it because native server metadata exists: they currently serve different responsibilities.
