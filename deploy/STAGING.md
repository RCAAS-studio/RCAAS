# Isolated Windows staging acceptance

17 November 2026. Preparation only; no deployment is authorized by this file.
Use a **separate Windows VM**, explicitly designated staging. Do not run these
templates alongside production: they use the same service names, ports and paths.
The current checkout has no verified staging host, database or cloud bucket.

## Configuration to prepare

Reuse [README.md](README.md) and its Windows WinSW/Caddy templates, not
`systemd/`. The existing validator intentionally requires `C:/RCAAS` and API
port 4000. On the dedicated VM this is safe; do not alter production to fit it.

Copy `api.env.example` and `web.env.example` to NEW protected files on that VM.
Do not copy the developer's `server/.env` or live client stores. Apply:

| Setting | Staging value |
|---|---|
| API and web NODE_ENV | production |
| NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_API_URL, CLIENT_ORIGIN | Same owner-selected staging HTTPS origin; no trailing slash |
| API_INTERNAL_URL | http://127.0.0.1:4000 |
| HOST / PORT | 127.0.0.1 / 4000 |
| DATA_DIR / ASSET_DIR | C:/RCAAS/data / C:/RCAAS/assets, initially empty, synthetic data only |
| ASSET_DRIVER | local first; s3 only after isolated bucket acceptance |
| DATABASE_URL | Empty for file accounts; isolated staging DSN for PG acceptance |
| SESSION_SECRET, EMBED_TOKEN_SECRET, EDITOR_PASSWORD | Three independently generated secrets, never reused from production |
| SHARED_TEAM_LOGIN / DEMO_ENGINE | 0 / 0 |
| RESEND_API_KEY, SMS_TOKEN, WHATSAPP_TOKEN, ANTHROPIC_API_KEY, LEADS_TO | Empty initially |
| Separate-host variables | All empty initially on both services |
| NEXT_OUTPUT_EXPORT, NEXT_PUBLIC_BASE_PATH | Empty; static export cannot host Studio/API |
| NEXT_DIST_DIR | .next |

Run `node deploy/check-config.mjs <protected-web-file> <protected-api-file>`.
It checks configuration only, not provider access. Run the existing protected
`with-env.mjs` build instructions from README section 4: public URLs are baked
into the build. Include reviewed uncommitted fixes explicitly in a release;
`git archive` alone omits them. Build needs Google Fonts access.

Only after owner approval: follow README sections 1–6 to provision services,
staging DNS, Caddy TLS and firewall. Keep 3000, 4000, 5432 and 2019 private;
only approved 80/443 exposure. Preserve restricted administration access.
Keep one API writer. Use Local Service ACLs, persistent data/certificate roots,
32 MB proxy request limit (uploads use chunks), rotated logs and restart policy.
Do not reuse IIS bindings or modify another site's proxy.

## Cloud storage acceptance command

Provision a separate private test bucket and bucket-scoped key manually.
Review bucket identity and public-access settings in the provider console.
In a protected process environment set these **staging-only** names:

```text
RCAAS_STAGING_CONFIRMED=isolated-disposable
STAGING_S3_ENDPOINT=<HTTPS origin>
STAGING_S3_BUCKET=<dedicated test bucket>
STAGING_S3_ACCESS_KEY_ID=<bucket-scoped key>
STAGING_S3_SECRET_ACCESS_KEY=<secret>
STAGING_S3_REGION=auto
STAGING_EXPECTED_ENDPOINT=<independently checked same origin>
STAGING_EXPECTED_BUCKET=<independently checked same bucket>
```

Run `node scripts/staging-storage-acceptance.mjs`. It never loads `.env`,
never falls back to ordinary S3 credentials, and only creates a tiny random
`rcaas-acceptance/ast_acceptance_<uuid>/probe.txt`. It checks signed upload,
stat, full bytes, range bytes, listing and exact-object deletion. On failure,
inspect/remove only the printed random object key. It does not change policies
or prove bucket privacy. A designation flag is an operator assertion, not
independent proof that infrastructure is isolated.

Then configure the **staging API** against that bucket. With two synthetic
accounts: upload a small valid fixture; verify other-user and anonymous draft
GET/ranges fail; publish and confirm anonymous snapshot asset reads work;
unpublish and check access again. Verify referenced-asset deletion is refused,
interrupted upload resumes and failed finalization retries. Check any public
R2/custom-domain URL cannot bypass draft authorization. Never test these steps
on a real project. Direct storage checks do not prove API access control.

## PostgreSQL acceptance

Accounts only move to PG; projects, scenes, snapshots, sites, bookings, outbox
and private asset metadata still use DATA_DIR. Inspect `server/db/001_auth.sql`;
migrations are sorted, transactional and advisory-locked. The `app` schema has
RLS; the API's owner role must work while public/anon roles cannot read it.
Use verified TLS/CA, private network restrictions, a dedicated database role,
5-second connection and 15-second statement deadlines.

With an owner-designated **empty disposable database**, set
`API_TEST_DATABASE_URL` in a protected environment and run:

```powershell
node --test server/test/postgres.test.js
node --test server/test/api.test.js
# Use a DIFFERENT fresh database before the following suite:
node --test server/test/api-s3.test.js
```

Do not run these concurrently against one database. The PG regression applies
migrations before checking the users table; its nonempty guard is NOT permission
to point it at production. Verify identity before execution. Test one synthetic
account across a staging API restart, password reset/session invalidation,
staging database interruption/recovery, and dump/restore to a third empty DB.
Do not stop a shared provider database. Follow [POSTGRESQL.md](POSTGRESQL.md).
Never unset DATABASE_URL as a rollback to stale JSON accounts.

## Notifications and reservations

Start with providers disabled and existing mocked suites. Live acceptance needs
a sandbox account plus a provider-enforced recipient allow-list: the application
has no general staging-recipient allow-list. Check LEADS_TO, project recipients,
guest addresses/phones and queued outbox entries are all synthetic. If any
destination cannot be constrained, do not enable that provider.

Create one disposable table/room/hall request, confirm it through the staging
API/UI, verify persisted status and sandbox receipt, then test conflict and
cancellation states without changing reservation policies. Record provider IDs.
Use mocks for forced 429/503/permanent failures; do not repeatedly send live
messages to simulate failure. Retries are bounded (5/15/60/180 minutes, at most
five attempts, two-day cutoff). There is no demonstrated exactly-once delivery:
a crash after send but before recording can duplicate a notice. Monitor and
reconcile provider IDs; do not promise deduplication across that crash window.

## Recovery, rollback and monitoring

Proposed owner-approved targets: nightly snapshots, <=24-hour data-loss window,
four-hour restore target, 14 daily and monthly retained copies. These are targets,
not measured guarantees. Schedule more often if booking volume requires it.
Stop staging writers while taking the coordinated backup via `Backup.ps1`.
Protect DATA_DIR, assets, optional accounts.dump, secrets and certificate state;
R2 needs an independent object backup/version inventory. A live bucket is not a
backup. Verify transfer hashes on a separate machine and alert on task failure,
health 503, low disk, provider delivery failure and outbox backlog.

Restore into new empty directories, verify manifest hashes with
`deploy/restore-check.mjs`, restore PG into a new DB with matching roles/TLS,
restore object bytes and metadata together, then start an isolated API and check
login, ownership, draft/published reads and synthetic bookings. Never restore
over the staging or production stores. Record achieved restore time and loss.

Rehearse service restart and VM reboot, then the release-junction rollback in
README section 9. Preserve failed releases. Code rollback cannot reverse data
migrations; use coordinated snapshots and account for later writes. Off-machine
restore, real service recovery and TLS acceptance remain owner-run gates.
