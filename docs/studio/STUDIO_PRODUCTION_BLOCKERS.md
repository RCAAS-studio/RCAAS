# Production blocker remediation

17 November 2026. Baseline aede146 on main. The earlier audit and carousel work were already committed by the owner; this task preserved that checkout. No commit, push, deployment, DNS change or live provider exercise was performed.

**Release recommendation: NOT READY for production.** Local security corrections and recovery evidence improve readiness, but provider, physical-device and operational acceptance remain prerequisites. The full feature inventory was not repeated.

## Confirmed blockers and disposition

| Blocker | Root cause and applicability | Correction / remaining evidence |
|---|---|---|
| Outdated framework patch | Next 16.4.3 was in npm's affected range for GHSA-mfr8-8qww-v76h (16.3.0–16.4.4). Its specific use-cache/unstable-cache nesting pattern was **not found** in src, so an exploitable application path is not claimed. | Installed/pinned Next **16.4.5**, the same-minor patch. Root and server npm audits now report zero advisories. |
| RSC security baseline | React/React DOM were 19.2.7; the RSC advisory names react-server-dom packages, not React core itself. App Router uses Next's bundled RSC infrastructure; matching a React core version does not establish this RSC exploit's applicability. | Updated React/React DOM together to compatible **19.2.9** and Next to its patched version. No standalone server-dom package was added. Next's compiled RSC manifest uses a canary peer identifier, so a core-version comparison is not proof of its patch state. |
| Booking-engine SSRF | Hostname spelling was checked, then fetch resolved DNS independently; private DNS answers could pass. Body length was checked after an unbounded read. | New publicJson connector validates all DNS answers, pins the TLS connection to one validated public IP, retains the original hostname/TLS verification, refuses credentials/non-443 ports/non-HTTPS, redirects and compressed responses, and caps bytes during streaming. Four-second deadline includes DNS and reading. Late DNS cannot create a socket. |
| Outbound resource exhaustion | Public availability endpoints could trigger many concurrent external requests. Existing reservation submission rate limits do not cover every availability GET. | Coalesces identical in-flight URLs and bounds external requests to eight. Existing successful one-minute cache remains. No automatic external retries. Exhaustion/errors retain the existing unknown-availability result. |
| Backup completeness | Recovery needed direct evidence for account state, site publication, reservations and private asset records together. | New disposable restore test compares those records, drafts, numbered snapshots, project records, leads and activity byte for byte. Existing tests verify asset bytes, checksums, refusal of nonempty destinations, tampering and missing scans/snapshots. No live restore. |
| Browser coverage gap | Site editing/failure/recovery and UI project creation lacked fresh real-API coverage. | Expanded critical test creates a disposable project through the UI, enables its website feature for that fixture, edits/saves/publishes, aborts one save, confirms local work survives, retries, refreshes and checks anonymous published content stays unchanged. Acceptance result below. |
| Local frontend HTTP 500 during package update | Running Next process retained React 19.2.7 while disk React DOM became 19.2.9; logs show version mismatch and stale webpack loader errors. | Restarted the verified checkout dev stack and moved only .next/dev to a checked workspace QA path. Original localhost:3000 home, studio, login and API health returned 200. No client data changed. Restart running dev servers after dependency updates. |
| Live integrations and operations | Credentials are not designated disposable test infrastructure. | PostgreSQL/R2/mail/SMS/WhatsApp, Windows hosting/TLS, off-machine restore and physical devices remain unverified; staging procedure below. |

Official sources: [Next advisory](https://github.com/vercel/next.js/security/advisories/GHSA-mfr8-8qww-v76h), [React RSC advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3). Registry advisory results are time-specific and do not certify absence of all vulnerabilities. Three.js remains **0.164.1**, with its existing package constraint and XGRIDS files untouched. Required @emnapi lock entries remain present; no broad npm audit fix or renderer upgrade was run.

## Network contract and regression evidence

External availability requires public HTTPS on the standard port in development and production. The internal /api/demo-engine path remains in-process and works without network access. Existing HTTP-only development adapters now return unknown; this is an intentional security boundary, not a reservation-policy change. Private adapters require a separately designed trusted connector, not a bypass flag.

The server reads only the configured published hotspot's URL; public callers supply stay parameters, not arbitrary destinations. Authoring permissions, published-project checks, guest validation, per-IP submission rate limits and queue-based booking conflict checks are unchanged. Requests carry no customer session cookie, bearer credential or user-supplied headers. Redirects are never followed. Missing/error/invalid responses disclose no internal network information and use the existing null/unknown result. DNS/IP defenses are conservative: private, loopback, link-local, multicast, documentation and non-global IPv6 ranges are refused, including IPv4-mapped IPv6. Arbitrary response content is not rendered as HTML.

server/test/publicJson.test.js has seven focused tests covering private/mixed DNS, literal/encoded URLs, hostname-preserving pinned lookup, both Node lookup callback forms, redirects, oversized/encoded/broken JSON, DNS and response deadlines, and late DNS. Transport dependency injection is confined to tests; production uses node:https with normal certificate validation. These tests simulate DNS/transport boundaries; they are not a live provider interoperability certificate.

## Validation

- npm audit --json and npm audit --prefix server --json: **0 advisories** after patching.
- npm test: **86 client + 199 server passes**, **2 server skips**, no failures. Skips: no disposable PostgreSQL DSN; local-only copy of the S3-specific assertion, covered by the fake-S3 rerun.
- npx tsc --noEmit: passed. npm run lint: 0 errors, same 6 existing warnings.
- New network/recovery focused run: **11 passed**.
- Studio component browser suite: **12 passed** on desktop/phone using isolated fixtures, not real-rendering evidence.
- Final real production/GPU workflow result: **3 passed** (project UI creation/site failure-recovery and anonymous site; account/session lifecycle; genuine capture/editor/save/undo/redo/publish/anonymous tour). Earlier setup failures are excluded.
- Production build: final harness runs next build --webpack in a copied checkout with full Studio/tour routes. No warning bypass is used.
- Source integrity: original scene unchanged; **38 capture files / 65,754,605 bytes unchanged**. Previously published disposable version-1 snapshots retain their hashes. The new website test verifies saved draft changes and failed writes do not alter the published site.

Earlier new website-test attempts failed because the disposable project feature flag and response wrapper were initially assumed incorrectly. These were test setup defects, not accepted passes. The final test explicitly enables the disposable website feature and checks the real response status/shape. Local HTTP 500 was independently reproduced and repaired as above.

Logs are ignored under qa-bug-hunt/blockers-*.log/json and critical-*.log/json. Reports retain accepted results. Temporary contexts/builds never become production routes. The wider phone upload wizard, every hotspot type, reservations browser matrix and team UI matrix remain incomplete; existing local/fake-S3 API tests cover narrower contracts.

## Safe staging acceptance protocol

Do not execute provider tests from ordinary server/.env. An operator must explicitly designate an isolated staging environment, verify endpoint/account/bucket identity and disposable records, and disable customer-facing notifications. This task found no such designation and therefore made **no live provider calls**.

1. **PostgreSQL:** provision a new empty disposable database, synthetic accounts only; set API_TEST_DATABASE_URL explicitly, then run node --test server/test/postgres.test.js and the API suites against it. The test refuses a nonempty account table. Verify migrations, reset/session invalidation, concurrent role operations and transaction rollback. Destroy only the designated test database after review.
2. **R2:** use a separate staging bucket and least-privilege bucket-scoped key. Under a random audit asset prefix, exercise put/stat/list/range/read/hash/delete through storage-s3; verify unauthorized draft reads fail, published reads succeed, missing files and retries behave, then remove only the recorded synthetic prefix. Fake-S3 success is already recorded; real R2 consistency/ranges/privacy remain pending.
3. **Email/SMS/WhatsApp:** use sandbox credentials and a recipient allow-list controlled by the operator; intercept all customer destinations. Verify reservation/lead outbox retry, permanent refusal and deduplication with synthetic requests. Obtain evidence for sender/domain approval and delivery without contacting a business guest.
4. **Windows Server/public tours:** new staging hostname and isolated DATA_DIR/asset root; follow deploy/README.md, one API writer, HTTPS/same-origin cookies, upload limits, proxy headers/rate limits and anonymous snapshot reads. Verify restart and rollback. No DNS or deployment was performed here.
5. **Recovery:** stop only staging writers, make a backup with deploy/backup-files.mjs into an empty separate directory, restore with deploy/restore-check.mjs into another empty directory, compare hashes and bring up a separate API on restored stores. Include asset records/staging/attachments and optional PG dump; S3 snapshots need an independent verified object inventory/version backup. Run an off-machine restore and agree recovery objectives before launch.
6. **Devices:** genuine captures and representative converted meshes/video on actual phone/tablet/GPU, slow network, repeated scene loads and long sessions. Measure load time, memory and responsiveness; no new FPS or field latency claims are made here.

## Changed files

package.json and package-lock.json; server/src/engine.js; new server/src/publicJson.js and server/test/publicJson.test.js; test/restore-check.test.mjs; test/critical/studio.spec.ts; CLAUDE.md; STUDIO_FUNCTIONAL_AUDIT.md; STUDIO_RELEASE_READINESS.md; this report. No marketing design, renderer contract, data format, booking hold/cancellation policy or publication defaults changed.
