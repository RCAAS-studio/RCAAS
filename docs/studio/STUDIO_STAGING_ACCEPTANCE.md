# Studio staging acceptance

17 November 2026; baseline `2edd5ab`. **NOT READY** for live staging acceptance
or production approval: no explicitly designated isolated host/provider resources.
Local preparation is complete subject to the results below. No deployment,
provider message, migration, bucket policy, DNS, commit or push was performed.
Existing reports were reviewed; the full inventory was not repeated.

## Dependency preflight

| Dependency | Classification | Evidence / owner action |
|---|---|---|
| Next server + Express | READY locally | Current patched baseline preserved; final checks below. Server build required, not Pages export. |
| Windows deployment preparation | READY | Existing Caddy, WinSW XML, protected-env validator, backup/restore workers. `systemd/` is a separate Linux option. |
| Isolated staging VM | REQUIRES OWNER ACTION | No explicit staging designation; do not infer it from a VPS/domain. Use a separate Windows VM and [runbook](../../deploy/STAGING.md). |
| Staging DNS, reverse proxy, HTTPS, firewall | NOT VERIFIED | No remote host operated; same-origin secure-cookie/proxy/upload acceptance pending. |
| File accounts and single-writer stores | READY locally | Disposable API/storage tests; no claim of hosted disk durability. |
| PostgreSQL test connection | MISSING | No API_TEST_DATABASE_URL in process; ordinary server/.env DATABASE_URL absent. No connection/migrations attempted. |
| R2 isolated bucket/key | REQUIRES OWNER ACTION | Ordinary cloud settings exist but aren't designated testing. New opt-in acceptance CLI prepared and tested against fake S3 only. |
| Sandbox email/notification recipients | REQUIRES OWNER ACTION | Ordinary email key present; no test designation. SMS/WhatsApp unset in inspected file. No live send. |
| Persistent directories / service ACLs | NOT VERIFIED | Templates use C:/RCAAS/data and assets outside releases; actual staging permissions/disk unknown. |
| Off-machine backup and object backup | REQUIRES OWNER ACTION | Local disposable restore passes; no designated remote share/object backup or agreed recovery objectives. |
| Physical devices / extended GPU sessions | NOT VERIFIED | No physical phone/tablet or long-duration run. |

Only key presence was reported from local configuration; no secret values were
printed. File inspection does not establish remote services or process overrides.
No confirmed staging configuration was available to classify as MISCONFIGURED.

## Confirmed correction and acceptance tooling

**P2: failed cloud-upload stream left a temporary spool file.** In
`server/src/storage-s3.js`, the pipeline ran before the cleanup `try/finally`.
A failing stream reproduced the leftover file. Moving spooling inside the
existing cleanup scope fixes it without changing upload formats or policies.
Regression checks failed first, then passed: partial-stream failure creates no
cloud object, leaves no spool file, and a retry succeeds and cleans up.

`scripts/staging-storage-acceptance.mjs` requires staging-only credentials,
explicit designation and matching independently confirmed endpoint/bucket names.
It never reads `.env` and uses one random disposable key; cleanup is exact-key,
including after failure. Fake-S3 tests cover signing/read/range/list/cleanup,
unrelated-object preservation and configuration refusal. Live bucket privacy and
application authorization are separate gates, explicitly not claimed by this CLI.

Storage/API review: asset IDs remain the public references; server storage
validates paths; private drafts and referenced deletions have API regressions.
Upload limits, ZIP validation, chunk offsets and retryable cloud finalization
are tested by existing suites. Client retries/resume are bounded; there is no
general AbortSignal contract in uploadVariant, so full interactive cancellation
is not certified by the spool cleanup test. No whole upload-wizard acceptance
or large-file throughput claim is made.

PG review: accounts only; ordered SQL migrations run under a transaction and
advisory lock. Reset/session invalidation and concurrent changes have an existing
opt-in PG suite, not executed here. Connection/statement timeouts, TLS CA support,
transaction rollback and app-schema RLS exist. Role/network restrictions,
service restart persistence and real dump/restore need designated infrastructure.
Never treat file projects, scenes, published versions, reservations or sites as PG.

Notification review: mocks verify transient retry, permanent refusal, bounded
attempts and cutoff. Booking state/conflict cases use isolated API fixtures.
No proven exactly-once delivery across a send/record crash window; no general
staging-recipient allow-list. Provider-level recipient restrictions are required
before live delivery. Do not promise crash deduplication or customer delivery.

## Fresh validation

| Check | Result |
|---|---|
| `npm test` with API_TEST_DATABASE_URL empty, ASSET_DRIVER=local | **86 client + 203 server passes**, 0 failures; 2 skips: no disposable PG DSN and local copy of S3-only assertion (fake-S3 companion runs). |
| Focused storage/outbox/lead-retry/restore tests | **11 passes**; failing spool regression was reproduced before correction. |
| `node --test server/test/staging-storage.test.js` | **3 passes**, including final unrelated-object assertion; no live cloud call. |
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed, 0 errors / same 6 warnings. |
| Production build | Passed in disposable checkout with font-download access. First restricted-network build failed fetching Google Fonts; not counted as passing. |
| Critical browsers | **7 passed, 2 failed**: Chromium 3/3; Firefox 3/3; WebKit website recovery passes, cookie assertion and genuine capture draw fail. Harness exits 1; not an accepted whole-matrix pass. |
| Component desktop/phone browser suite | **12 passed** using the existing separate-fixture config; mocked controls do not prove real rendering. Initial integrated runner stalled on shutdown; a PLAYWRIGHT_BASE_URL attempt skipped all 12 by design. Neither is counted as passing. Verified test-only server stopped afterward. |
| Source integrity | Final multi-browser harness: original scene and 38 capture files / 65,754,605 bytes unchanged. Chromium/Firefox also verify prior disposable published snapshots retain their hashes. |
| Local HTTP smoke | Home, login, Studio and /api/health on localhost:3000 all 200. |

Logs: ignored `qa-bug-hunt/staging-*.log` and `critical-*.log/json`.
Historical results in the previous reports are not counted as fresh passes.
Marketing/carousel sources, renderer pins and client data are unchanged by edits.

Cross-browser invocation: set RCAAS_CRITICAL_BROWSERS=chromium,firefox,webkit,
then run `node scripts/critical-studio-runtime.mjs server/src/data/scenes/office-chyasal-lobby.json server/src/data/assets`.
Default invocation still runs Chromium only. The first expanded run had 5 passes
and 4 failures. Two failures were a repeated test project name (409), corrected
with UUID names in the fixture; no project-creation business rule changed.
WebKit reported SameSite=None despite the server's Lax setting: an independent
minimal local HTTP server reproduced this Playwright/WebKit reporting mismatch
while its raw Set-Cookie header contained SameSite=Lax. The strict assertion is
retained, and browser enforcement/HTTPS remains unverified. WebKit also timed out
at the native capture-draw assertion after 90 seconds. Optional floorplan image
404s in the trace do not establish the rendering root cause. Do not equate this
Windows WebKit build with physical Safari or weaken the renderer assertion.
The final rerun removes both project-name failures: Chromium and Firefox each
pass all three real-API scenarios, WebKit passes website editing/recovery and
retains the two findings above. Chromium uses SwiftShader launch support; native
WebGL calls are real, but this is not physical GPU performance certification.

Accepted component command: `npx playwright test test/browser/studio.spec.ts --config=qa-bug-hunt/studio-component.config.ts --output=test-results/staging-components-accepted`.
This existing local config targets the disposable fixture on port 3471, with
PLAYWRIGHT_BASE_URL unset. It must never be redirected to client data.

## Workflow evidence and remaining limits

| Required flow | Scope of evidence |
|---|---|
| Login, logout, session | Critical browser login/reload/invalid-cookie/logout; API session tests. Hosted secure cookies and actual time-based browser expiration remain open. |
| Project creation | Critical suite creates project through UI. |
| Upload / scene loading | API tests upload formats, chunks and failures; critical suite copies genuine source assets into disposable storage, not through upload UI. |
| Hotspot / save / undo / redo | Critical suite authors one text hotspot and rename history, saves and reads back; other tools/long gestures not fully certified. |
| Preview / publish / anonymous tour | Critical published scene rendering and prior snapshot hashes; full editor Preview control not separately exercised. |
| Client website | Critical draft save/reload, publish, failed-save retry and anonymous website isolation; explicit preview-mode UI remains open. |
| Bookings and cross-project authorization | Real disposable API suites, fake delivery; not a complete browser calendar/team matrix. |
| Failed network recovery | Real website save aborted then retried; upload/connector failure tests. GPU context loss and slow-cloud endurance remain open. |

## Owner acceptance and recovery

Follow [deploy/STAGING.md](../../deploy/STAGING.md) for exact configuration,
guarded cloud command, serial disposable-PG tests, sandbox notification steps,
Windows service/reverse-proxy setup, monitoring, backup sequence and rollback.
Existing restore tests include account files, project records, drafts, numbered
snapshots, sites, reservations, asset metadata, original asset bytes and archive
integrity. They do not prove a live PG dump or remote object recovery.

Owner checklist:

- Designate isolated VM/origin, fresh PG databases, private R2 bucket/key and sandbox recipients; no credentials in chat or Git.
- Approve staging provisioning separately; verify services restart after reboot, HTTPS cookies, private ports, ranges and proxy upload limits.
- Agree recovery frequency/retention, provision off-machine backup, restore coordinated file/PG/object copies to empty destinations and measure recovery time.
- On physical Android, iPhone/iPad and desktop: record device/OS/browser/GPU and asset; open tour, touch/navigate, inspect hotspot, edit/save/refresh, upload/resume, publish, logout. Record failures/screenshots.
- Repeat scene switching and editing for an agreed long session; test slow network, offline/reconnect and memory/context loss. Record measured load/interaction times; emulation is not physical-device evidence.
- Complete browser upload wizard, preview, booking/calendar and restricted-team flows on staging before launch approval.

## Files changed

`server/src/storage-s3.js`, `server/test/storage-s3.test.js`,
`server/test/staging-storage.test.js`, `scripts/staging-storage-acceptance.mjs`,
`playwright.critical.config.ts`, `deploy/STAGING.md`, this report,
`test/critical/studio.spec.ts`, `STUDIO_RELEASE_READINESS.md`, `CLAUDE.md`.

Production remains NOT READY until provider, hosting, device and operational
acceptance has actual evidence. Successful local tests alone do not resolve it.
