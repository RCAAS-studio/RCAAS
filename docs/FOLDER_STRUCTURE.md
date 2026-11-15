# Folder ownership and file locations

```text
src/app/
  (marketing)/             native public URL entries and persistent marketing layout
    page.tsx              homepage route
    services/, industries/, work/, learn/, about/, contact/, ...
    [...slug]/            compatibility routes, redirects and unknown-URL handling
  login/, studio/         authentication and authoring routes
  tour/, t/, s/           public tours, project hubs and client websites
src/features/
  marketing/
    MarketingShell.tsx    shared chrome, navigation and planner/register state
    home/
      HomeRoute.tsx       adapts route actions to home composition
      HomePage.tsx        ordered homepage sections
      components/        ten named sections; masonry state belongs to IndustriesSection
      data.ts, types.ts  homepage-specific copy and contracts
    routing/             metadata, compatibility page selection and action context
    pages/               existing service, industry and content compositions
    components/          shared marketing header/footer, cards, demos and controls
    content/, data/      editorial content, configuration and publishing gates
  auth/                  account UI
  studio/                authoring, uploads, publishing and project administration
  scene/                 renderer lifecycle, scene stores, camera and collision
  tour/, hotspots/       visitor controls and spatial interactions
  booking/, enquiry/     shared guest forms and rules
  website/               client website templates and editing
src/components/ui/       genuinely shared platform UI
src/hooks/, src/lib/     shared hooks and cross-feature plumbing
src/vendor/              pinned SDK; preserve documented integration behavior
server/src/
  index.js               Express setup and router composition
  routes/                HTTP validation, guards and domain endpoints
  middleware/            shared session/project guards without router imports
  *Store*.js, store.js    existing domain persistence adapters
  storage*.js            local/S3 implementations
  db.js                  PostgreSQL account pool/migrations
  mailer.js, notify.js,
  outbox.js, claude.js    delivery and provider integrations
server/test/             API, account, storage and provider regressions
test/                    client logic and deployment/restore checks
test/browser/            Playwright browser regressions
deploy/                  proxy, Windows services, database and backup/recovery setup
docs/                    architecture and developer guides
```

Common edits: homepage hero → `home/components/HeroSection.tsx`; services → `ServicesSection.tsx`; industries → `IndustriesSection.tsx`; projects → `FeaturedWorkSection.tsx`; FAQ → `FaqSection.tsx`; footer → `marketing/components/Footer.tsx`. There is no invented testimonials section: edit real evidence through `marketing/content/work`.

Use PascalCase for React components, `useSomething` for hooks and descriptive camelCase for utilities. Keep Next's route filenames. Prefer explicit imports and existing feature ownership over speculative barrel exports or empty enterprise folders. `@/` maps to `src/`.
