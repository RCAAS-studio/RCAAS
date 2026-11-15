# Folder ownership and file locations

```text
src/app/
  (marketing)/                 native public entries and persistent layout
    page.tsx                   homepage route
    services/, learn/, ...     small explicit page entries
    industries/[slug]/         validated industry pages and static parameters
    work/[slug]/               validated case studies and static parameters
    blog/[...slug]/            posts and valid pagination
    [...slug]/                 moved URLs and unknown-page handling only
  login/, studio/              authentication and authoring routes
  tour/, t/, s/                public tours, project hubs and client websites
src/features/
  marketing/
    MarketingShell.tsx         shared chrome, navigation and planner/register state
    home/
      HomeRoute.tsx            adapts route actions to homepage composition
      HomePage.tsx             ordered homepage sections
      components/             ten sections; IndustriesSection owns masonry state
      data.ts, types.ts       homepage-specific copy and contracts
    services/, learn/         named route adapters with lazy-loaded content
    industries/, work/        validated-slug client adapters
    blog/                     blog index and post adapters
    routing/                  named general adapters, metadata and action context
    structuredData/           pure company, services, places and editorial JSON-LD
    pages/                    existing content compositions; no routing switch
    components/               header/footer, cards, demos and shared controls
    content/, data/           editorial data, shared FAQ arrays and publishing gates
  auth/                       account UI
  studio/
    EditorShell.tsx            composition, selection and lifecycle (258 lines)
    editor/
      SceneTree.tsx            hierarchy, rename/search and filmstrip
      *Inspector.tsx          hotspot, collision, track, scene and floor-plan UI
      PlacementSection.tsx    model transform controls
      DraftControls.tsx       save and copy-to-spaces dialogs
      EditorTopBar.tsx        project/account navigation and leave guard
      controls.tsx, types.ts  shared controls/options and Selection/Pose contracts
    publishing/               PublishButton and its private dialog
    ...                       existing uploads, projects, dialogs and history
  scene/                      renderer lifecycle, scene stores, camera and collision
  tour/, hotspots/            visitor controls and spatial interactions
  booking/, enquiry/          shared guest forms and rules
  website/                    client website templates and editing
src/components/ui/            shared platform UI
src/hooks/, src/lib/          shared hooks and cross-feature plumbing
src/vendor/                   pinned SDK; preserve integration behavior
server/src/
  index.js                    Express setup and router composition
  routes/                     HTTP validation, guards and domain endpoints
  middleware/                 shared session/project guards without router imports
  *Store*.js, store.js         domain persistence adapters
  storage*.js                 local/S3 implementations
  db.js                       PostgreSQL account pool/migrations
  mailer.js, notify.js,
  outbox.js, claude.js         delivery and provider integrations
server/test/                  API, account, storage and provider regressions
test/                         client logic and deployment/restore checks
test/browser/                 Playwright public-site and Studio regressions
  fixtures/                   isolated Studio harness; never a real app route
scripts/browser-test-server.mjs disposable browser checkout and fixture injection
deploy/                       proxy, services, database and backup/recovery setup
docs/                         architecture and developer guides
```

Common homepage edits: hero → `home/components/HeroSection.tsx`; services → `ServicesSection.tsx`; industries → `IndustriesSection.tsx`; projects → `FeaturedWorkSection.tsx`; FAQ → `FaqSection.tsx`; footer → `marketing/components/Footer.tsx`. Real project evidence belongs in `marketing/content/work`.

Use PascalCase for React components, `useSomething` for hooks and descriptive camelCase for utilities. Keep Next's route filenames. Prefer explicit imports and existing feature ownership over speculative barrel exports or empty folders. `@/` maps to `src/`.

Final-audit entry points: `scripts/architecture-audit.mjs` (read-only graph/candidate report), `scripts/critical-studio-runtime.mjs` (isolated real API/production/browser workflow), `playwright.critical.config.ts` and `test/critical/studio.spec.ts`. Completion evidence, Feature Book discrepancies and changed-file inventory live beside this guide.
