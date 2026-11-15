# Architecture changed-file inventory

Reviewed 15 November 2026. HEAD at capture: `9fbd0d7`; working tree includes the final audit. This is an inventory of reviewed changes, not a claim that the audit agent authored existing commits or unrelated concurrent work. No commit, push or deployment was performed by the agent.

## Architecture series

Filtered tracked changes since pre-architecture baseline `1cdc8cf`, covering routes, home/routing/schema/editor modules, shared backend guard, tests, tooling and guides. Renames retain both paths. Other pre-existing product/media changes in that commit range are not relabelled as architecture work. The fresh current-worktree inventory below includes all final audit deliverables.

```text
M	.github/workflows/nextjs.yml
M	.gitignore
M	CLAUDE.md
M	README.md
A	docs/ARCHITECTURE.md
A	docs/FOLDER_STRUCTURE.md
A	docs/MARKETING_DEVELOPMENT.md
M	eslint.config.js
M	package-lock.json
M	package.json
A	playwright.config.ts
A	scripts/browser-test-server.mjs
M	scripts/dev-guide.mjs
A	server/src/middleware/projectAccess.js
M	server/src/routes/properties.js
M	server/src/routes/sites.js
A	src/app/(marketing)/[...slug]/page.tsx
A	src/app/(marketing)/about/page.tsx
A	src/app/(marketing)/blog/[...slug]/page.tsx
A	src/app/(marketing)/blog/page.tsx
A	src/app/(marketing)/contact/page.tsx
A	src/app/(marketing)/cookies/page.tsx
A	src/app/(marketing)/faq/page.tsx
A	src/app/(marketing)/gallery/page.tsx
A	src/app/(marketing)/how-we-work/page.tsx
A	src/app/(marketing)/industries/[slug]/page.tsx
A	src/app/(marketing)/industries/page.tsx
R076	src/app/(site)/layout.tsx	src/app/(marketing)/layout.tsx
A	src/app/(marketing)/learn/3d-virtual-tour-vs-360-tour-vs-video/page.tsx
A	src/app/(marketing)/learn/page.tsx
A	src/app/(marketing)/learn/planning-a-3d-experience-cost-and-timeline/page.tsx
A	src/app/(marketing)/learn/what-is-gaussian-splatting/page.tsx
A	src/app/(marketing)/not-found.tsx
A	src/app/(marketing)/page.tsx
A	src/app/(marketing)/platform/page.tsx
A	src/app/(marketing)/privacy/page.tsx
A	src/app/(marketing)/security/page.tsx
A	src/app/(marketing)/services/digital-twins/3d-laser-scanning/page.tsx
A	src/app/(marketing)/services/digital-twins/drone-mapping/page.tsx
A	src/app/(marketing)/services/digital-twins/page.tsx
A	src/app/(marketing)/services/game-worlds-assets/page.tsx
A	src/app/(marketing)/services/immersive-experiences/3d-virtual-tours/page.tsx
A	src/app/(marketing)/services/immersive-experiences/page.tsx
A	src/app/(marketing)/services/page.tsx
A	src/app/(marketing)/services/visual-storytelling/page.tsx
A	src/app/(marketing)/terms/page.tsx
A	src/app/(marketing)/thank-you/page.tsx
A	src/app/(marketing)/work/[slug]/page.tsx
A	src/app/(marketing)/work/page.tsx
D	src/app/(site)/[[...slug]]/page.tsx
D	src/app/(site)/not-found.tsx
D	src/features/marketing/App.tsx
A	src/features/marketing/blog/BlogEntries.tsx
A	src/features/marketing/content/pageFaqs.ts
A	src/features/marketing/home/HomePage.tsx
A	src/features/marketing/home/HomeRoute.tsx
A	src/features/marketing/home/components/CtaSection.tsx
A	src/features/marketing/home/components/FaqSection.tsx
A	src/features/marketing/home/components/FeaturedWorkSection.tsx
A	src/features/marketing/home/components/HeritageSection.tsx
A	src/features/marketing/home/components/HeroSection.tsx
A	src/features/marketing/home/components/HowItWorksSection.tsx
A	src/features/marketing/home/components/IndustriesSection.tsx
A	src/features/marketing/home/components/LiveExperienceSection.tsx
A	src/features/marketing/home/components/ServicesSection.tsx
A	src/features/marketing/home/components/WhyRcaasSection.tsx
A	src/features/marketing/home/data.ts
A	src/features/marketing/home/types.ts
A	src/features/marketing/industries/IndustryEntry.tsx
A	src/features/marketing/learn/GuideEntries.tsx
M	src/features/marketing/pages/ComparisonGuidePage.tsx
M	src/features/marketing/pages/GameWorldsPage.tsx
M	src/features/marketing/pages/GaussianGuidePage.tsx
M	src/features/marketing/pages/HomePage.tsx
A	src/features/marketing/routing/MarketingActions.tsx
A	src/features/marketing/routing/MarketingNotFound.tsx
A	src/features/marketing/routing/PageEntries.tsx
A	src/features/marketing/routing/metadata.ts
A	src/features/marketing/routing/useMarketingMetadata.ts
A	src/features/marketing/services/ServiceEntries.tsx
A	src/features/marketing/structuredData/buildMarketingGraph.ts
A	src/features/marketing/structuredData/company.ts
A	src/features/marketing/structuredData/editorial.ts
A	src/features/marketing/structuredData/places.ts
A	src/features/marketing/structuredData/services.ts
A	src/features/marketing/structuredData/types.ts
A	src/features/marketing/work/CaseStudyEntry.tsx
M	src/features/studio/EditorShell.tsx
A	src/features/studio/editor/ColliderInspector.tsx
A	src/features/studio/editor/DraftControls.tsx
A	src/features/studio/editor/EditorTopBar.tsx
A	src/features/studio/editor/FloorPlanInspector.tsx
A	src/features/studio/editor/HotspotInspector.tsx
A	src/features/studio/editor/PlacementSection.tsx
A	src/features/studio/editor/SceneInspector.tsx
A	src/features/studio/editor/SceneTree.tsx
A	src/features/studio/editor/TrackInspector.tsx
A	src/features/studio/editor/controls.tsx
A	src/features/studio/editor/types.ts
A	src/features/studio/publishing/PublishButton.tsx
A	test/browser/fixtures/StudioFixture.tsx
A	test/browser/marketing.spec.ts
A	test/browser/studio.spec.ts
A	test/helpers/marketing-typescript.mjs
A	test/marketing-schema.test.mjs
```

## Current working tree at final audit

```text
M .gitignore
 M CLAUDE.md
 M PHASE_STATUS.md
 M README.md
 M docs/ARCHITECTURE.md
 M docs/FOLDER_STRUCTURE.md
 M docs/MARKETING_DEVELOPMENT.md
 M scripts/dev-guide.mjs
 M src/features/marketing/pages/HomePage.tsx
 M src/features/studio/editor/DraftControls.tsx
 M src/lib/api.ts
?? docs/ARCHITECTURE_CHANGED_FILES.md
?? docs/ARCHITECTURE_COMPLETION.md
?? docs/FEATURE_BOOK_REVIEW.md
?? playwright.critical.config.ts
?? scripts/architecture-audit.mjs
?? scripts/critical-studio-runtime.mjs
?? test/critical/studio.spec.ts
```

The updated Developer Guide PDF is generated and ignored by repository policy. Feature Book extraction, browser reports/screenshots, copied captures, test accounts and temporary runtime/build files are ignored artifacts; no client capture, credentials or disposable account data is added to source control.
