# Studio release readiness

## Production-blocker remediation update — 17 November 2026

Current recommendation remains **NOT READY for production**, pending external staging/provider, operational restore and physical-device acceptance. The historical security findings below are superseded by [STUDIO_PRODUCTION_BLOCKERS.md](STUDIO_PRODUCTION_BLOCKERS.md): Next 16.4.5 and React/React DOM 19.2.9 installed; npm root/server audits report zero advisories; the booking-engine DNS/rebinding and unbounded-body risks have code corrections and isolated regressions. Three.js remains 0.164.1 and XGRIDS is untouched. Current full suite: 86 client + 199 server passes, two server skips; 12 Studio component browser passes; types/lint pass with six existing warnings. New whole-store restore exercise passes. Final real-browser/build/integrity evidence is recorded in the blocker report, along with uncompleted cases and provider acceptance procedures. No live restore, DNS/deployment or notification occurred.

Final patched production build and **three real Studio scenarios passed**, including UI project creation, website editing/publishing, failed-save recovery and anonymous published-site isolation. The original scene and 38 capture files (65,754,605 bytes) retained their hashes; prior disposable snapshots remained unchanged. The local development React-version mismatch was independently repaired and localhost:3000 home/Studio/login/API health all returned 200.

17 November 2026. **NOT READY for production launch.** The local core is testable and suitable for continued controlled staging work, but security hardening and provider/device/operational acceptance remain open. This is a scoped audit with explicit verification gaps, not a claim that every feature is complete.

## Actual checks
| Check | Actual result |
|---|---|
| npm test with API_TEST_DATABASE_URL empty and ASSET_DRIVER=local | Initial full run: client tests pass; server 192 passed, 0 failed, 2 skipped. Local and fake-S3 API suites included; synthetic notification providers only. |
| node --test test/*.test.mjs after copy fix | 85 passed, 0 failed/skipped. Includes two new destination-copy regressions. |
| npx tsc --noEmit | Passed. |
| npm run lint | Passed: 0 errors, 6 existing warnings. |
| Studio component browser tests | 12 passed (desktop/phone) in a separately served disposable fixture. Accepted command: npx playwright test test/browser/studio.spec.ts --config=qa-bug-hunt/studio-component.config.ts --output=test-results/studio-components-final. Initial integrated runner stalled at shutdown; a fresh fixture hit the one-time framework warning. Neither incomplete attempt is counted as a pass. |
| Real production/GPU harness | Two scenarios passed: file-account session lifecycle; genuine capture/editor/save/undo/redo/publish/anonymous tour and immutable prior snapshot. Fresh run 17 November. |
| Full production frontend | next build --webpack passed in disposable harness copy, including routes and TypeScript. Existing generated CSS copied; no marketing source modified. |
| Capture integrity | Original scene unchanged; 38 files / 65,754,605 bytes unchanged by SHA-256 comparison. |
| node scripts/architecture-audit.mjs qa-bug-hunt/studio-architecture-audit.json | 403 modules / 1,377 edges; 0 broken local imports, 0 case mismatches, 0 frontend/backend imports, 0 runtime cycles. One type-only cycle; 7 duplicate groups and 50 export candidates remain review candidates, not automatic deletion instructions. |
| Feature Book | Actual PDF hash matches existing complete extraction; extraction reviewed; fresh reader run blocked by missing cached reader. |
| Static export | Not rerun for this Studio-only fix; the earlier same-day carousel Node/Pages results remain separate historical evidence. |
| PostgreSQL | Skipped: no explicitly supplied disposable test DSN. The other server skip is the local-suite S3-only assertion, exercised by its fake-S3 companion. |
| R2, email, SMS, WhatsApp, production hosts | No live calls or changes. Simulated-provider tests do not certify these services. |

Real harness command: node qa-bug-hunt/studio-critical-runtime.mjs server/src/data/scenes/office-chyasal-lobby.json server/src/data/assets. This is an ignored copy of scripts/critical-studio-runtime.mjs, with a normal identical-build retry only when Next emits SecurityFatalError. It uses random local ports, copied assets, disposable accounts/directories and disabled external credentials, verifies source hashes, then removes its own verified runtime directory after unlinking its dependency junction.

Logs: qa-bug-hunt/studio-audit-tests.log, studio-audit-client-final.log, studio-audit-types.log, studio-audit-lint.log, studio-components-accepted.log, studio-critical-run.log, critical-production-build.log, critical-browser.log, critical-source-integrity.json. These logs are ignored and may be removed later; accepted results are retained here. Final totals: 277 unit/API passes, 2 server skips, 12 component browser passes and 2 real critical browser passes. Test counts are not feature-completeness percentages.

## Required workflow matrix
| Flow | Evidence and limit |
|---|---|
| A sign in / create / dashboard | Real login/dashboard/open project; creation performed through actual API setup. Complete UI creation path unverified. |
| B upload / space / editor | API upload-format/security/resume tests; genuine capture copied into isolated asset storage and opened in real editor. Full upload wizard interaction unverified. |
| C edit / hotspot / save / refresh | Real text hotspot/coordinate and title save with API readback; complete refreshed renderer state for every hotspot type unverified. |
| D undo / redo / save | Real rename undo/redo plus client history-field tests. All complex drags not certified. |
| E preview / publish / anonymous tour | Real publish and anonymous native rendering pass; not every preview mode. |
| F draft cannot change live snapshot | API and real critical snapshot/hash checks pass. |
| G website draft / preview / publish / public | API suite verifies data boundary; complete real website-builder browser workflow remains unverified. |
| H booking / conflicts / status | Actual isolated API suites cover table/room/hall overlap, waitlist, statuses and notification stubs; complete calendar UI matrix unverified. |
| I restricted / cross-project | Actual API ownership/staff/private-asset checks pass; full restricted-user browser matrix remains unverified. |
| J asset failure / recovery | Upload/invalid format and draft failure contracts pass; real GPU missing/slow asset switching and context loss remain unverified. |

## Security, storage and operational gates

Read-only configuration inspection found ASSET_DRIVER=local and no DATABASE_URL in server/.env. R2 and email credential fields are present, but no values were exposed and no provider connection was attempted. Process/service overrides were not inferred from this file. The audit harness explicitly overrides accounts/storage/notifications with isolated settings.

1. Review and patch the known-vulnerability warning from installed Next.js before launch; no framework upgrade was silently performed.
2. Harden engine.js DNS/private-address handling before accepting arbitrary author-configured engine URLs. Current source-level exposure is documented in the functional audit; no exploit against live hosts was attempted.
3. Use one API writer for file stores. PostgreSQL accounts and S3 assets do not make the rest stateless. Preserve DATA_DIR, asset records, staging, attachments, snapshots and optional database together.
4. Verify real R2 access/privacy/ranges, staging PostgreSQL migrations/reset/session invalidation, production same-origin cookies/TLS, reverse-proxy upload limits and rate limiting.
5. Verify notification sender/domain and synthetic-recipient delivery in staging; no real business reservations.
6. Perform off-machine restore and service rollback drills with agreed recovery objectives. Tooling test success is not a production restore drill.
7. Check published sample exposure, memberships, missing original uploads and complete file manifests before cutover. This audit made no production-data corrections.
8. Measure low-end phone first-frame time, large-upload throughput, sequential scene/GPU memory and long-running editor stability. No new performance benchmark is claimed.

Windows Server/Caddy/WinSW setup is documented in deploy/README.md; it was not installed or operated here. No DNS, hosting, database schema, storage format, booking/retention policy, billing or publication defaults were changed. No commit/push/merge/deployment.

## Completion boundary

This pass delivers the inventory, a demonstrated data-integrity correction, regression coverage and a release assessment. It does **not** complete the prompt's exhaustive per-feature browser, hardware, provider, performance and failure-injection matrix. Those incomplete checks are named above rather than marked passed. The existing Developer Guide generator, blueprint extraction, architecture reports and Feature Book comparison were consulted; no new full Developer Guide PDF review/render or source-document refresh is claimed.
