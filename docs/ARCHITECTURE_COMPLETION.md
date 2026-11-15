# RCAAS architecture completion assessment

Assessment date: 15 November 2026, Asia/Katmandu. Scope: the original 16-section architecture prompt and the subsequent final-audit request. No UI redesign, booking feature, timeline, merge screen, VPS deployment, push or merge was performed in this audit.

**Assessment: the architecture implementation and requested final audit are complete within the verified scope.** Production frontend, static export, source boundaries and critical desktop Studio workflows have direct evidence. Physical phone/tablet GPU behavior, real PostgreSQL/provider infrastructure and hosted release checks remain explicitly unverified. This is architecture acceptance with recorded limitations, not production-launch signoff or a percentage readiness claim.

The checkout was reviewed as a working tree, not assumed to equal a remote branch. Architecture work spans the existing `c76d0be` and `9fbd0d7` commits plus current audit changes. These commits were already present/created outside this audit; the agent made no commit. [Changed-file inventory](ARCHITECTURE_CHANGED_FILES.md) records the reviewed architecture series and current untracked audit deliverables separately. Existing client data and concurrent work were preserved.

## Evidence and commands

| Check | Command / artifact | Actual result |
| --- | --- | --- |
| Existing unit/API suite | `npm test` | 70 client/tooling + 192 server tests passed: **262 passed, 0 failed, 2 server skips**. Local and fake-S3 suites included. `qa-bug-hunt/final-unit-api.log`. |
| Types | `npx tsc --noEmit` | Passed; `qa-bug-hunt/final-types.log`. |
| Lint | `npm run lint` | Zero errors; six existing warnings: five deliberate image tags and the existing scene callback dependency warning. `qa-bug-hunt/final-lint.log`. |
| Read-only source audit | `node scripts/architecture-audit.mjs qa-bug-hunt/final-architecture-audit.json` | **397 modules, 1,365 local dependency edges; zero broken local imports, zero case mismatches, zero frontend imports of backend modules, zero runtime dependency cycles.** One type-only SCC, reviewed below. |
| Full production frontend | `node scripts/critical-studio-runtime.mjs server/src/data/scenes/office-chyasal-lobby.json server/src/data/assets` | Builds a copied full frontend using `next build --webpack`, then serves it using `next start`. Full Studio/tour routes included. Production build passed; `qa-bug-hunt/critical-production-build.log`. No fixture route injected. |
| Real critical browser tests | Same isolated harness, invoking `playwright.critical.config.ts` | Two real scenarios: account/session controls and genuine capture/editor/save/publish/anonymous tour. API requests are real and restricted to disposable data; renderer is not mocked. `qa-bug-hunt/critical-browser.log`. |
| Existing component/public browser suite | `npx playwright test --output=test-results/component-final` | **22 passed**: 10 marketing/navigation checks and 12 Studio component checks across desktop/phone emulation. Separate report folder avoids output collisions. `qa-bug-hunt/final-component-browser.log`. |
| Production public-route browser suite | `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3472/ npx playwright test test/browser/marketing.spec.ts --output=test-results/production-final` | **10 passed** against the real isolated `next start` server, covering the complete public URL/metadata matrix and navigation/controls. `qa-bug-hunt/final-production-routes.log`. |
| GitHub Pages build | Isolated copy using the same API-dependent route omissions as `.github/workflows/nextjs.yml`, `NEXT_OUTPUT_EXPORT=1`, base path `/RCAAS` | Passed. Artifact generated under ignored `.storytelling-export-*`; command implementation/evidence: `qa-bug-hunt/storytelling-static-build.mjs`, `qa-bug-hunt/final-static-build.log`. No live deployment. |
| Export browser checks | `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3458/RCAAS/ npx playwright test --output=test-results/static-final` | **10 passed, 12 intentionally skipped**. Skips are Studio fixture tests absent from external/static previews. Metadata/canonicals, URLs, query/history, controls and narrow layout passed. `qa-bug-hunt/final-static-browser.log`. |
| PDF review | Actual 27-page Feature Book text extraction plus rendered-page inspection | Complete comparison in [FEATURE_BOOK_REVIEW.md](FEATURE_BOOK_REVIEW.md), including its SHA-256 and dated claims. No project dependency added for the cached reader. |
| Source data integrity | Harness hashes before and after | Original source scene unchanged; all **38 capture files / 65,754,605 bytes** unchanged. `qa-bug-hunt/critical-source-integrity.json`. |
| Public image references | Source registry check and existing `image-variants.test.mjs` | All **118 literal marketing image paths** exist; the existing responsive-image regression passed for all registered photo variants. Private upload availability is separately evidenced by the genuine-capture scenario. |

These counts are different suites, not a claim that every application path has end-to-end coverage. The two database-related skips are not counted as passes. A prior API-only/fixture run is not substituted for the real critical run.

## Critical Studio workflow matrix

| Requested workflow | Status | Direct evidence |
| --- | --- | --- |
| Login and session handling | Completed and verified | Actual email/password login through the UI; wrong password produces an alert; HttpOnly/Lax session cookie; reload persistence; tampered cookie rejected; logout restores login gating. File account adapter, local HTTP. |
| Open an existing project | Completed and verified | Project created during disposable setup, then opened through the signed-in Studio page and its actual editor route. |
| Load genuine 3D assets | Completed and verified on this desktop | Original LCC2 capture copied to a private disposable asset. Real asset responses and native WebGL instanced drawing observed; canvas screenshot inspected. Browser reported **ANGLE / NVIDIA GeForce RTX 4070 Ti SUPER / D3D11**. This is not a phone benchmark or full fidelity assessment. |
| Edit a scene | Completed and verified for tested edits | Rename through the hierarchy, add a text hotspot through the real editor bridge and set its X coordinate through the real inspector. No mocked renderer or editor bridge in this suite. |
| Save changes | Completed and verified | Real Save space button, dirty-to-clean state, actual API readback of title/hotspot coordinate and unchanged model asset reference. |
| Undo/redo | Completed and verified for tested history | Real top-bar Undo and Redo restore/reapply the scene rename. Broader scene-document/history fields additionally have unit coverage. Every 3D drag gesture is not certified. |
| Publish | Completed and verified | Real Publish dialog publishes version 2; API snapshot/title/hotspot readback agrees. |
| View published tour | Completed and verified | New anonymous browser context follows `/t/<project>/<space>` to the real tour, starts it, waits for the entry veil to leave, and observes independent native GPU instanced rendering. Anonymous draft read is rejected. |
| Preserve previously published content | Completed and verified for disposable snapshots | Before republish, public read retains the original title. After republish, earlier version-1 file hashes remain identical, including the initially seeded published scene. Asset references remain stable. Real client files are only read for copying/hash verification. |

The browser launch permits SwiftShader as a fallback, but the recorded tested context used the NVIDIA renderer above. Permission to launch Chromium and obtain fonts was needed in this Windows sandbox; the successful runs used normal process permissions. Failed test-harness selector attempts were corrected, not reported as product failures or counted as passes. Final screenshots wait for the tour's entrance animation rather than accepting a covered canvas.

## Every original architecture requirement

The original proposed tree explicitly allowed stronger existing ownership and prohibited cosmetic/empty layers. “Deferred” below is an explicit justified decision, not an unreported omission.

| Prompt requirement | Status | Assessment / evidence |
| --- | --- | --- |
| §1 Study target and reference repositories | Completed and verified | Earlier review recorded `prabhatbhusal/polk_road` homepage composition, tree `0e152c5`; RCAAS checkout/current diff remains authoritative. No blind copying. |
| §2 Read instructions, README, guides, blueprint and phase/deployment docs | Completed and verified for available material | CLAUDE/README, architecture/deployment/phase reports and blueprint text reviewed earlier; actual Feature Book now extracted/reviewed. Developer Guide generator and generated guide reviewed/updated. No applicable AGENTS.md was found. Planning and historical audit claims are not treated as implementation proof. |
| §3 Remove custom marketing routing only after replacement coverage | Completed and verified | Old App/MarketingPage switch removed after native route coverage. Live webpack stale-cache failure was reproduced and resolved by a scoped dev-stack restart/cache cleanup; four live pages returned 200. |
| §4 Conventional, readable, feature-owned, testable architecture without new frameworks | Completed and verified within scope | Native App Router entries, named home/editor modules, explicit context/contracts, scoped metadata builders; no new state framework or runtime dependency. Playwright was explicitly approved. |
| §5 Use a sensible target tree, preserve SDK/assets/backend boundaries, avoid empty enterprise layers | Completed and verified | See [folder map](FOLDER_STRUCTURE.md). Existing feature/store ownership retained; no speculative controllers/repositories or SDK rewrite. Dynamic route static parameters and exports build successfully. |
| §6 Discoverable homepage, actual sections/order, one main landmark and edit locations | Completed and verified | `app/(marketing)/page.tsx` → HomeRoute → short HomePage composition with ten named sections; original section JSX was compared in extraction; browser anchors and one-main checks pass. No testimonial content was invented. Footer location is documented. |
| §7 Native routing/history/redirects/dynamic content/metadata/SEO | Completed and verified for tested contracts | All listed URLs plus visible blog content; validated industry/work/blog families, valid pagination generation, aliases, 404s, query/hash/back behavior, canonicals and draft noindex; no overlapping route ownership. |
| §7 Loading, scroll restoration and transitions across every route/device | Implemented but not fully verified | Shared shell/transition/scroll code retained; direct navigation/history and desktop/phone regressions pass. Every scroll position, browser and assistive/device combination was not exhaustively exercised. No unsupported loading UI was invented. |
| §7 GitHub Pages/root-domain compatibility, sitemap and public links | Completed and verified locally | Node production and `/RCAAS` export builds/browser checks pass. Existing sitemap/robots/llms and public URL helpers retained. Hosted DNS/TLS/indexing are not local evidence. |
| §8 Review/split clear Studio and scene boundaries while preserving data/history/SDK | Completed and verified for refactored boundaries | EditorShell composition, named inspectors/hierarchy/top bar/draft controls/publishing and shared controls; 29 extracted bodies matched. Real core workflows plus component/API/history tests pass. Asset/source hashes unchanged. |
| §8 Further scene/camera/upload/project/API splitting | Deferred, with justification | Existing feature ownership is clear enough to preserve; no demonstrated benefit justifies more churn or changing SDK lifecycle. User explicitly requested no line-count-driven splitting. |
| §9 Backend boundaries and API/persistence/integration separation | Completed and verified for changed boundary | Shared project guard extracted to middleware, preserving the old export and removing properties/sites runtime cycle. Existing stores, storage drivers, delivery modules and API contracts retained; full local/fake-S3 regressions pass. |
| §9 PostgreSQL/file account modes, hashing, sessions, roles and recovery behavior | Implemented but not fully verified across all infrastructure | No schema/auth migration was made. Real file-backed login/session path tested; role/isolation/reset/storage contracts covered by existing tests. No disposable PostgreSQL DSN was supplied for this run, so PostgreSQL-live behavior is not marked passed. Provider-delivered reset mail remains unverified. |
| §9 Protect client data, bookings/leads/notifications/storage/secrets | Completed and verified for this task's operations | Only disposable API data is written; external providers disabled; source capture/scene unchanged. Existing API regressions pass. No real bookings, account reassignment or environment-secret changes. |
| §10 Dead code/unused imports/exports/duplicates/cycles/types/CSR/CSS/prop ownership | Completed and verified as an audit | Repeatable 397-module scan, manual candidate review and boundary assessment below. Export candidates are not automatically deleted. Lint retains six prior warnings. |
| §11 Naming/import conventions, no cosmetic wholesale rename | Completed and verified | New named component modules use conventional names; shared controls/types and Next filenames retained. Zero broken relative/alias imports or case mismatches in scanned source. |
| §12 Architecture/folder/marketing docs, CLAUDE, commands and cheat sheet | Completed and verified | Three required guides updated, CLAUDE and Developer Guide generator updated; PDF regenerated in prior phase and refreshed for final handoff. This completion report, Feature Book comparison and inventory provide final evidence. |
| §13 Ordered, small, reviewable phases; preserve concurrent work | Completed and verified | Existing staged migration, targeted Studio extraction, guard fix and final audit documented. Current audit adds tests/reporting and corrects stale comments; does not restart migration. Existing commits/work were preserved. |
| §14 Lint/types/unit/integration/full build/static build | Completed and verified | Actual results and exact scope above. No skipped database check counted as a pass. |
| §14 Homepage/services/dynamic URLs/navigation/login/Studio/published tours/editor/assets/API/base path/metadata/mobile | Completed and verified for listed automated scenarios | Root/static desktop/phone tests, real desktop critical workflow and API suite. Physical-phone GPU, all tools and production infra are qualified separately. |
| §15 Easier navigation/maintenance, clear ownership, preserved features/data | Completed and verified within scope | Native entries and named components, concrete folder map and command/evidence record. Functional tests and read-only fixture hashes support preservation; not a claim that every feature is exhaustively tested. |
| §16 Final report: problems/tree/files/routing/components/backend/preservation/tests/limits/remaining work | Completed and verified | This report, [ARCHITECTURE.md](ARCHITECTURE.md), [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md), [changed files](ARCHITECTURE_CHANGED_FILES.md), and [Feature Book comparison](FEATURE_BOOK_REVIEW.md). |
| Push, merge or deploy without approval | Deferred, with justification | None performed. These actions are outside the authorized verification task. |

## Code-quality findings and disposition

| Audit area | Finding and decision |
| --- | --- |
| Unreachable files | One runtime-source candidate: `marketing/pages/HomePage.tsx`, a two-line legacy re-export. Retained deliberately for import compatibility; no current route uses it. Its stale “existing router” comment was corrected. Ambient declarations are compiler roots, not dead files. |
| Export candidates | 53 unconsumed-by-other-module exports: 19 type contracts, 27 used inside their declaring module, two Next proxy entry exports and five manual candidates. They are not 53 unused functions. |
| Five manual export candidates | `headingSize`, `setManualTier`, `clearManualTier`, `setWalkEnabled`, `readTheme`. Manual-tier setters explicitly preserve compatibility; the navigation setter is a legacy alias. The theme reader/style preset have no current static caller. Retained without runtime risk; removal/consolidation offers little benefit and could alter import or theme behavior. No claim of zero dormant exports. |
| Runtime cycles | None. One type-only SCC comprises scene metadata, API and stats through the `Intent` type. Type imports erase at build; no runtime initialization loop. Backend properties/sites cycle remains removed. |
| Duplicate server-rendered site loaders | Identical small fetch bodies in `/s` variants. Retained with route ownership; extracting a generic abstraction adds little clarity and is outside changed boundaries. |
| Duplicate booking People icons / detail callbacks | Four local People icons and repeated small form/FAQ callbacks. Reviewed; these are scoped UI shapes rather than divergent business rules. No booking or design-system rewrite during final architecture verification. |
| Duplicate MeasureTool/PlanMarker callback | Matching event cleanup body, separate scene tools/lifecycles. Retained to avoid coupling independent interactions solely for textual deduplication. |
| Duplicate account-adapter staff wrapper | File/PostgreSQL adapters implement the same public contract; tiny matching wrapper retained with both adapter tests. |
| Total duplicate groups | Seven exact-body groups over the scan threshold: the route loader, People icons, booking callbacks, two service FAQ/callback groups, tool cleanup and staff-account adapter wrapper. Repetition is recorded, not hidden or automatically refactored. |
| Client/server boundaries | Native pages/metadata stay server-owned; callback/animation adapters and scene renderer remain client-owned. Industry icon functions resolve from slugs inside client entries. No frontend imports from backend modules. Server components do not start the singleton renderer. |
| Unnecessary CSR | Policy/FAQ content could eventually be further server-rendered with small client navigation islands. Current compositions depend on callbacks/animation/shared client state; server conversion has no demonstrated benefit in this audit and would repeat migration. Deferred deliberately. |
| CSS and prop ownership | `.rcaas` scoping, shared marketing actions, editor component props and scene stores retained. No CSS/layout changes in this audit. Complete computed-style/accessibility certification is not claimed. |
| Stale documentation in source | Corrected API header claiming a nonexistent baked-scene fallback/Django backend and draft-control comment claiming no login page. No executable behavior changed by these comment corrections. |
| Broken references / obsolete router | No current source import of removed marketing App/MarketingPage. Current native routes, static parameters and type/build checks pass. Only historical documentation names the removed files. |

Static analysis covers literal local imports/re-exports, dynamic imports, require calls and worker URLs in app/server/scripts/tests. It excludes vendor SDK internals, generated output, runtime data and fixtures. It is conservative around namespace consumers, framework conventions, same-file usage and externally invoked APIs; it does not prove absence of reflective/dynamic bugs or secrets. The pinned vendor SDK remains untouched.

## Remaining limits and operational handoff

| Item | Status / reason |
| --- | --- |
| Physical phone/tablet rendering, touch/thermal behavior and constrained network timing | Implemented but not fully verified. No physical mobile device or controlled mobile network was exercised. Phone emulation is not substituted. |
| All camera modes, calibration, full drag/gizmo/collision combinations, audio/360 and every Studio inspector | Implemented but not fully verified. Critical tested subset and component/API regressions are listed; exhaustive tool certification is separate. |
| PostgreSQL, real R2, external mail/SMS/WhatsApp/AI delivery | Implemented but not fully verified. No disposable DB DSN/provider fixture or live-service signoff in this run; no production credentials/data were repurposed. |
| Hosted Linux CI, production TLS/DNS, service reboot, rollback and off-machine restore | Deferred, with justification. Local builds/tests do not prove hosted operations; no push/deployment was authorized. |
| General automatic server autosave | Not implemented as described in the historical Feature Book. Explicit save and save-before-publish are verified; no new autosave feature belongs in this task. |
| Larger scene/API reshaping and removal of retained compatibility exports | Deferred, with justification. No demonstrated maintainability gain warrants additional regression risk for acceptance. |
| Booking redesign, multi-selection, camera timeline, conflict-merge screen and VPS features | Deferred, with justification. Explicitly outside this final-audit request. |

Current architecture work can be handed off with these limits. The dated Feature Book remains an internal historical artifact; [its comparison](FEATURE_BOOK_REVIEW.md) is the current interpretation. Do not promote a blueprint production phase, deploy, or promise every device/provider based on this report.
