# Pre-VPS audit — 5 November 2026

**Verdict: production configuration and live verification are still required before launch.** The reproduced backend bugs have focused fixes, and Windows Server 2022 deployment files are now prepared. Missing assets/owners, production settings and on-server checks remain unresolved. PostgreSQL is not enabled locally, so a successful test run does not establish that PostgreSQL works.

The findings below record the original audit, before the fixes and deployment preparation described here. Tests that write data used disposable directories. Cloud checks used read-only requests.

## Windows deployment follow-up — 5 November 2026

The owner confirmed **Windows Server 2022**. `deploy/` now contains the Windows runbook, Caddy HTTPS proxy configuration, three WinSW service configurations, production environment templates, a read-only configuration checker, and backup tools. The old missing Linux/PM2 files are superseded; no VPS deployment was performed.

- Finding 12 is addressed at the repository level: service supervision, persistent directories, NTFS permissions, HTTPS setup, release switching, rollback and on-server checks are documented. Domain configuration, installation and restart/reboot verification remain pending.
- Finding 8 has a new deployment backup path: `Backup.ps1` captures file data, separate local assets and optional PostgreSQL accounts while the API is stopped, then restarts it. Off-machine UNC copies are checksum-verified when configured. Disposable local archive/restore and mocked service recovery tests passed. Live PostgreSQL dumps, real service control and remote-share backups are not yet verified. S3 objects and secret/configuration backups need their own recovery arrangements.
- Production API startup now supports `HOST=127.0.0.1` and fails when its assigned port is occupied. Development retains its existing port fallback behavior.
- **202 tests passed, 1 intentionally skipped; TypeScript and the production build passed; lint passed with the same 6 warnings.** PowerShell syntax and service XML parsing passed. The first build could not download Google Fonts under restricted networking; the retry with network access succeeded. Caddy/WinSW executables were not installed or run locally. Logs use `qa-bug-hunt/windows-deploy-`.

Example environment values are deliberately not usable production secrets. The actual domain, secrets, missing assets/owners, PostgreSQL decision and remaining content/dependency findings still need resolution. No live account, asset, database or deployment configuration was changed.

## Fix follow-up — 5 November 2026

The user authorized focused fixes within the existing architecture. Eight regression tests first failed against the original code, then passed after the changes. A ninth test covers overlapping website saves, publication and review comments, plus refusal to overwrite a corrupt website.

| Original finding | Current status |
| --- | --- |
| 3 — overlapping writes | Fixed for server-side project/scene/website mutations in one API process. Concurrent publications create separate snapshots; project patches and website reviews retain each other's changes. Stale browser tabs saving whole documents still need revision/conflict checks, and multiple API processes still need shared locking or transactional storage. |
| 4 — corrupt bookings overwritten | Fixed. Only `ENOENT` means no bookings; invalid JSON, wrong top-level shape and I/O failures reject reads/writes. Website files follow the same fail-closed approach. |
| 5 — account errors crash API | Fixed for the session route and admin middleware; both return a generic 500 while the process remains alive. Recovery after repairing a disposable account file passed. |
| 6 — unauthorized upload chunks | Fixed. File-init, chunk and finalize operations require the upload's creator and refuse staff. Ownership persists outside uploaded/ZIP contents. Simultaneous retries cannot overwrite the same offset, and completed IDs cannot be reused. |
| 10 — reset token reused | Fixed for file accounts. Mutations are serialized, including reset consumption and admin changes; simultaneous demotions also preserve the final admin. |

Validation after fixes: **197 tests passed, 1 intentionally skipped; TypeScript and the production build passed; lint passed with the same 6 warnings.** Logs use the `qa-bug-hunt/fix-` prefix.

**Upgrade note:** in-progress uploads created before this update lack an ownership record and must be restarted. Completed models and media use the existing storage format. File data and account schemas are unchanged; no data migration is required for these fixes. Queues coordinate one API process only.

No production deployment, account reassignment, cloud upload, live-data mutation, dependency update, or PostgreSQL migration was performed. The remaining findings below are still open. Browser/GPU behavior and a real PostgreSQL instance were not tested during the fix pass.

## Coverage and results

The repository inventory covered 593 tracked files: 387 text files and 206 binary files. The review concentrated on the API routes, authentication, storage implementations, SQL migration, backup/import scripts, frontend API integration, routing, deployment configuration, and existing tests. Generated builds, dependency internals, and binary media were not manually reviewed line by line.

| Check | Result |
| --- | --- |
| `npm test` | 31 client tests passed; 157 server tests passed; 1 deliberately skipped counterpart test. No failures. Server coverage includes local storage and fake S3. |
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed with 6 warnings: 5 image-element warnings and 1 effect-dependency warning. |
| `npm run build` | Passed, including TypeScript and production route generation. |
| Root and server `npm ci --dry-run --ignore-scripts --offline --audit=false --fund=false` | Passed. This validates the lockfiles locally; it does not replace a clean Linux installation. |
| Production HTTP checks | 53 generated public routes resolved successfully, following redirects. Login returned CSP, HSTS, and frame protection headers. |
| Production API with disposable data and valid synthetic secrets | Health returned 200; account creation returned 201; the session cookie had Secure and HttpOnly. |
| API against copies of current projects/scenes/sites | Health 200; gallery 200 with 7 tours; websites 200 with 2 published sites. |
| Current stored JSON | All 70 JSON files in the checked stores parsed successfully. |
| Local backup and restore | Passed against disposable data; restored contents matched the input. |
| Live R2 metadata | Authenticated listing succeeded. All 7 published tours' high-quality model metadata paths returned not found. |
| `npm audit --json` | Root: 6 moderate findings, all in development dependencies. Server: 1 moderate finding in `qs`. No high or critical findings reported. |
| Linux filename/import case scan | No tracked filename collisions or relative-import case mismatches found in the checked frontend source. |

Local raw logs are in `qa-bug-hunt/pre-vps-*.log` and `qa-bug-hunt/pre-vps-audit-*.json`. That directory is locally ignored by git; this report is the durable summary.

## What is actually storing the data

`server/src/usersStore.js:7` selects PostgreSQL only when `DATABASE_URL` is set. It is unset in both the current process and the parsed `server/.env`. `API_TEST_DATABASE_URL` is also unset. No usable local PostgreSQL installation, PostgreSQL CLI, or Docker command was found by the checks performed.

| Data | Current storage | Effect of enabling `DATABASE_URL` |
| --- | --- | --- |
| Accounts, password hashes, reset tokens | `DATA_DIR/users/*.json` — 1 admin account | Moves account operations to `app.users` in PostgreSQL. Existing accounts require an import. |
| Projects and membership | `DATA_DIR/properties/*.json` — 7 files | Remains JSON. |
| Draft tours and published snapshots | `DATA_DIR/scenes/*.json` — 52 files | Remains JSON. |
| Client websites | `DATA_DIR/sites/*.json` — 3 files | Remains JSON. |
| Bookings and waitlists | `DATA_DIR/reservations/*.json` — 2 files | Remains JSON. |
| Leads, statistics, activity | Files in `DATA_DIR` — 0 lead files, 5 statistics JSON files, 2 activity files | Remains file-backed. |
| Models, scan chunks, images, media | Local asset directory; `ASSET_DRIVER=local` | Independent of PostgreSQL. S3/R2 is a separate switch. |

The account schema is defined in `server/db/001_auth.sql`; startup migrations are in `server/src/db.js`. Queries inspected in `usersStore-pg.js` use parameters, and its transaction helper rolls back and releases clients. Those are useful implementation checks, **not a live database verification**.

Enabling PostgreSQL alone will not repair project-save races, move reservations into transactions, recover missing owner accounts, or transfer uploaded models.

## Findings to resolve before launch

### 1. Production secrets are still example values — high

**Location:** `server/src/index.js:32`, current local environment.

`SESSION_SECRET`, `EMBED_TOKEN_SECRET`, and `EDITOR_PASSWORD` still contain the example values. An isolated launch with those values and `NODE_ENV=production` exited with code 1 at the secret check. This is a confirmed deployment blocker. Running in development to bypass it would retain predictable authentication secrets and omit production cookie behavior.

**Required:** generate separate strong production secrets and configure `NODE_ENV=production`. Keep real values outside source control.

### 2. Tour assets are not ready for transfer — high

**Location:** `server/src/storage.js`, `server/src/storage-s3.js`, scene references, `.gitignore`.

R2 credentials successfully authenticated a listing, but the configured bucket/prefix lacks the required model metadata for all seven published tours. The draft high-quality references matched the corresponding live snapshots, so these checks apply to the live versions. Objects elsewhere in the bucket do not satisfy these paths.

Locally, the published `computer-lab2` model is missing. Two other drafts also reference missing models: `demo-project-map-plan` and `space-3d-model`. The other published high-quality metadata files checked exist locally; their full chunk contents were not verified exhaustively.

Uploaded assets are ignored by git. Uploading the repository alone will not transfer them.

**Required:** transfer the full referenced asset folders to durable VPS storage or the configured R2 paths, then verify metadata and representative chunks through the API. Recover or unpublish the broken published tour. Do not switch `ASSET_DRIVER` to `s3` until the cloud paths are populated and checked.

### 3. Concurrent project changes lose saved data — high

**Location:** `server/src/store.js:349`, `server/src/store.js:358`; similar read/modify/write patterns elsewhere in that file and `server/src/routes/sites.js:415`.

An isolated probe concurrently changed a project's kind and status. Both operations completed, but one change disappeared in **10 of 10 attempts**. Atomic file replacement prevents partial JSON; it does not protect read/modify/write operations from overwriting each other.

**Required:** serialize all changes to each document and add revision checks for saves from stale editor tabs, or move those documents into transactional storage. Merely switching accounts to PostgreSQL does not fix this.

### 4. A corrupt bookings file is silently replaced as empty — high

**Location:** `server/src/reservations.js:25`.

`listReservations()` catches every read/parse error and returns `[]`. With a deliberately malformed disposable bookings file, reads reported no bookings; the next successful write replaced the file with only the new record. A filesystem permission or I/O error is also swallowed by this catch. This can erase booking history and make occupied inventory appear available.

**Required:** return an empty list only for a genuinely missing file (`ENOENT`); propagate other failures and refuse writes until the problem is resolved. Reservation queues help within one API process, but do not coordinate multiple processes.

### 5. An account-read failure can crash the API — high

**Location:** `server/src/routes/auth.js:173`, `server/src/middleware/auth.js:77`.

The installed server uses Express 4.22.3. The session route and admin middleware have asynchronous operations without forwarding rejected promises to `next`. After corrupting a disposable account file and requesting `/api/auth/session`, the request connection closed and the API process exited with code 1.

Database failures can reach the same unguarded operations when PostgreSQL is enabled; that outage path was inspected, not tested against a real database. Forward asynchronous failures to the error middleware consistently. The relevant behavior is documented in [Express error handling](https://expressjs.com/en/guide/error-handling/).

### 6. Staff accounts can write upload chunks — high

**Location:** `server/src/routes/assets.js:90`, `server/src/routes/assets.js:105`.

The create-asset endpoint correctly returned 403 for a synthetic staff account. The file-init and chunk endpoints accepted the same account, returned 200, and wrote 21 bytes to staging under a caller-chosen valid asset ID. These routes lack the staff/asset checks used by creation and finalization. This permits unauthorized staging writes, storage consumption, and potential interference with other in-progress uploads. The probe did not finalize an asset or alter a real upload.

**Required:** check the role and ownership of the upload at every stage; bind staging uploads to the creating account. Add regression coverage for file-init and chunk requests.

### 7. Five projects refer to missing owner accounts — high

**Location:** current project files; `server/src/store.js:373`, `server/src/store.js:390`, `server/src/store.js:397`.

These projects have owner IDs absent from the current account store, no members, and non-null owners, so they are hidden from every current account and cannot be claimed normally:

- `basera-boutique-hotel`
- `demo-project`
- `ns-outdoor`
- `space`
- `test-riverside-resort`

Account admins do not automatically receive project access in this implementation. The legacy shared-password session can still see them. No ownership was changed during the audit.

**Required:** recover the original account IDs or deliberately reassign these projects to the intended account before migration. Importing the single current account will not restore absent owners.

### 8. Backups do not cover PostgreSQL, and off-machine coverage depends on configuration — high when PostgreSQL is enabled

**Location:** `server/scripts/backup-data.js:31`, `server/scripts/backup-data.js:42`.

The script archives `DATA_DIR` and its local backup/restore path worked in the probe. It never exports PostgreSQL, so account changes made after enabling PostgreSQL would not be recoverable from this archive. Existing account JSON files would be stale copies.

With `ASSET_DRIVER=local`, this script also does not upload an off-machine backup. Assets in an `ASSET_DIR` outside `DATA_DIR` are excluded from the archive. This matters because the current example sets `ASSET_DIR` separately.

**Required:** retain file-store backups, add PostgreSQL backups if using it, and verify restoration of both. PostgreSQL documents database exports with `pg_dump` in [SQL Dump](https://www.postgresql.org/docs/current/backup-dump.html). Ensure assets have their own recovery plan if outside the archive. Cron/system-service scheduling and a real VPS restore were not verified here.

### 9. PostgreSQL integration remains unverified — deployment gate if choosing PostgreSQL

**Location:** `server/src/db.js:15`, `server/test/api.test.js:80`, `.github/workflows/nextjs.yml`.

The integration tests explicitly use `API_TEST_DATABASE_URL` or an empty database URL. Current tests therefore exercised file accounts. CI does not provision PostgreSQL or set that test URL.

The pool does not set a connection timeout or a query deadline. The pool documentation states that the default connection timeout is disabled: [node-postgres Pool](https://node-postgres.com/apis/pool). Migrations also have no startup lock between API instances.

**Required before claiming PostgreSQL readiness:** run the SQL migration and account tests against a disposable real PostgreSQL database, import current accounts while preserving IDs, verify sign-in/password reset/roles, test an outage and recovery, and perform backup/restore. Isolate the local-storage and S3 test runs with separate test databases or fresh serial runs, since they create the same account fixtures. Never point destructive integration tests at a live database.

Use one API process while reservations, statistics, and other stores depend on in-memory queues. Multiple API workers require shared locking or transactional persistence, even if accounts use PostgreSQL.

### 10. File-account reset links can be accepted twice concurrently — medium

**Location:** `server/src/usersStore-file.js:164`.

Two concurrent calls using the same disposable reset token both succeeded. Both read the live token before either writes its removal. The PostgreSQL implementation uses a conditional update for this operation, but the file implementation has no equivalent serialization.

**Required:** serialize account mutations and consume reset tokens atomically. The probe needed an existing valid token; it did not demonstrate arbitrary account access.

### 11. Public/API URLs still target localhost — high for deployment

**Location:** `src/lib/api.ts:14`, `src/lib/shareMeta.ts:7`, `next.config.mts:9`, current environment examples.

No root production environment file is configured. The tested build emitted the homepage canonical `http://localhost:3000` and its API default is `http://localhost:4000`. In a visitor's browser, localhost refers to that visitor's machine. Production image fetching also blocks private/local IPs in this configuration.

**Required:** set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` to the intended public HTTPS origin before building, and set `CLIENT_ORIGIN` to the frontend origin. These public frontend values need a rebuild; changing only API runtime variables is insufficient.

### 12. VPS deployment artifacts are missing — high for deployment

**Location:** missing `deploy/`; `package.json`, `.github/workflows/nextjs.yml`, `README.md`, `CLAUDE.md`.

The repository currently has no `deploy/` directory, process-manager configuration, reverse-proxy configuration, or current VPS deployment guide, although several comments and documents refer to them. Root `npm start` starts only Next; the API must be started separately from `server/`. Existing CI publishes a limited static GitHub Pages copy, which cannot run the API or database.

`DATA_DIR` is unset locally and defaults inside the checkout. Production should explicitly use a durable directory outside the checkout. The environment templates do not fully document the production data path, production mode, canonical URL, email sender, and backup configuration together.

**Required:** prepare and review a VPS runbook, run both services under supervision, configure the proxy/HTTPS and durable directories, and verify restart and rollback on the target machine. Keep secrets and uploaded data out of source deployments.

### 13. Email sender configuration is incomplete — medium

**Location:** `server/src/mailer.js:55`, `server/src/mailer.js:88`.

An email API key is configured, but `LEADS_FROM` is unset. The implementation consequently uses the Resend test sender. The application itself documents that this sender is restricted to the account owner's address, so successful local tests using a fake email service do not prove delivery to clients or guests.

**Required:** configure an approved sender and verify delivery to an intended external recipient. Domain verification and actual delivery were not checked, and no real email was sent. SMS, WhatsApp, and AI features also have no active keys locally; treat them as disabled features unless separately configured.

### 14. Unfinished copy is visible on public pages — medium

**Location:** `src/features/marketing/pages`, `src/features/marketing/content`, `src/features/marketing/components/Placeholder.tsx`.

The tracked source scan found 254 `[[TBI...]]` / `[[TBC...]]` occurrences across 50 files. Some are fallbacks or draft content; they are not all visible simultaneously. Production HTML checks nevertheless found unresolved placeholders on the homepage, contact page, about page, industry pages, guides, case studies, and legal pages. The Placeholder component intentionally renders these visibly. Draft/noindex metadata reduces search exposure but does not hide the pages from visitors.

**Required:** replace or remove unresolved public copy and keep unfinished pages out of public navigation as appropriate. The audit did not invent missing business facts or finalize policy wording.

### 15. Unknown nested marketing URLs return successful pages — medium

**Location:** `src/features/marketing/meta.ts:64`, `src/app/(site)/[[...slug]]/page.tsx:48`.

`/totally-missing-audit-page` returned 404, but `/services/totally-missing-audit-page` and `/industries/totally-missing-audit-page` returned 200. Route validation accepts any descendant of a known prefix, and the client renderer falls back to the section's content.

**Required:** validate against the actual supported routes and valid dynamic slugs, then return 404 for unknown descendants.

### 16. Dependency advisories need a focused update — medium

The root audit reports six moderate findings stemming from development-only `minimatch` 10.2.6 and its ESLint dependency chain. The server audit reports a moderate `qs` 6.16.0 finding. These are dependency advisories; an exploitable application path was not demonstrated.

**Required:** update the affected transitive packages using the lockfiles and repeat the existing validation. Advisory references: [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [qs](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw). No dependency changes were made during this audit.

## Recommended order

1. Fix the reproduced data-loss, API-crash, upload-authorization, and reset-token bugs, with targeted regression tests.
2. Recover missing ownership and decide which tours/sites should actually be public; transfer all required assets.
3. Choose file accounts or PostgreSQL explicitly. If PostgreSQL is chosen, validate it using a disposable instance, import accounts preserving IDs, and add database backup/restore coverage.
4. Supply production secrets, public URLs, sender settings, durable data paths, and the VPS deployment configuration; rebuild with the real public values.
5. Review visible unfinished content and route handling, update affected dependencies, and run the checks again.
6. On the VPS, verify HTTPS, both supervised services, database/storage access, a real upload and publish cycle, an enquiry, the booking flows being offered, and a restore from backup before opening traffic.

## Verification limits

No live PostgreSQL instance was available; PostgreSQL connectivity, migrations, permissions, transactions, and recovery remain unverified. R2 reads succeeded, but no cloud write/delete or transfer was performed. The metadata checks did not stream every scan chunk. The headless Chrome attempt did not complete reliably, so the page results above are HTTP/server-rendered checks rather than a completed browser interaction audit. Actual GPU rendering, mobile performance, real email/SMS delivery, Linux/VPS operation, HTTPS/proxy behavior, service supervision, and production backup scheduling were not tested. The squirrelscan CLI was unavailable; no crawler score or full squirrelscan audit is claimed.
