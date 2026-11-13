# Windows Server 2022 deployment

This bundle targets **Windows Server 2022 x64**, Node.js 24, Caddy 2 and WinSW 2.x. It prepares a deployment; it has not installed anything on your VPS. Use a single API service. PostgreSQL is optional and stores accounts only. The application still needs its file data and model assets.

Replace `example.com` with the real public domain. No domain or VPS access has been supplied yet. Keep the existing UI and data formats; no database migration happens automatically as part of this guide.

## 1. Prerequisites and layout

On the VPS, install the official [Node.js 24 Windows x64 distribution](https://nodejs.org/en/download) including npm. The service files expect `C:\Program Files\nodejs\node.exe`. Download a standard Windows amd64 [Caddy 2 binary](https://caddyserver.com/download) and a stable [WinSW 2.x x64 release](https://github.com/winsw/winsw/releases) (XML targets the 2.12 configuration format). Check the publisher's checksums/signatures. These are server tools, not new application dependencies; nothing is downloaded or installed by the repository scripts.

Windows Server 2022 normally provides `tar.exe`; verify `tar.exe --version`. Install a compatible PostgreSQL client only if enabling PostgreSQL. `pg_dump` must support the database server's major version. Check available RAM and free disk before building: large scans plus staging, releases and full backups need separate headroom.

Run setup in **Administrator PowerShell**. Keep this layout on a persistent NTFS disk:

```text
C:\RCAAS\
  releases\2026-11-05-01\   source, node_modules and its own .next build
  current\                  directory junction to the selected release
  data\                     accounts, projects, scenes, sites, reservations, etc.
  assets\                   uploaded models/media when ASSET_DRIVER=local
  config\                   api.env, web.env, Caddyfile (never in Git)
  bin\                      caddy.exe
  services\                 three renamed WinSW executables and matching XML
  ops\                      backup/check/helper scripts copied from deploy/
  logs\api\, web\, proxy\   rotated service logs
  caddy-state\              persistent certificates and ACME state
  backups\                  local snapshots (also copy off the VPS)
```

Create directories and restrict access before adding secrets. SID `S-1-5-19` is Local Service, `S-1-5-18` is SYSTEM, and `S-1-5-32-544` is Administrators. The services use Local Service; code/configuration remain writable by administrators only.

```powershell
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path C:\RCAAS -Force | Out-Null
icacls.exe C:\RCAAS /inheritance:r /grant:r '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-18:(OI)(CI)F' '*S-1-5-19:(OI)(CI)RX'
if ($LASTEXITCODE -ne 0) { throw 'Root ACL setup failed' }
foreach ($name in 'releases','data','assets','config','bin','services','ops','logs\api','logs\web','logs\proxy','caddy-state','backups') {
    New-Item -ItemType Directory -Path (Join-Path C:\RCAAS $name) -Force | Out-Null
}
foreach ($name in 'data','assets','logs','caddy-state') {
    icacls.exe (Join-Path C:\RCAAS $name) /grant '*S-1-5-19:(OI)(CI)M'
    if ($LASTEXITCODE -ne 0) { throw 'Writable directory ACL setup failed' }
}
```

If `C:\RCAAS` already contains another deployment, inspect its contents and ACLs before applying setup. Do not reset permissions across an unrelated directory.

## 2. Transfer source, data and assets separately

Transfer the **reviewed source including the latest fixes** into a new release directory. Include both lockfiles and `public/`. Exclude `.git`, `.next*`, `node_modules`, all real `.env` files, logs, backups and local runtime data. Run `npm ci` on the VPS rather than copying development dependencies from the PC. A Git archive includes committed files only: it will omit uncommitted fixes until they are included in the chosen release.

Stop editing/uploading on the source PC during the final data copy. Copy the complete contents of its active `DATA_DIR` into `C:\RCAAS\data`; copy the active local asset directory into `C:\RCAAS\assets`. Copy account IDs and project membership unchanged. Seeds from a fresh checkout do not replace these stores. Use file counts and SHA-256 comparisons to verify the transfer. Do not run the PC and VPS as independent writers to shared data during cutover.

Keep `ASSET_DRIVER=local` initially unless the R2 paths have been populated and verified. The audit found missing assets and five projects with missing owners; those are still separate launch gates. Git does not contain the uploaded assets. In-progress uploads made before the ownership fix must restart.

## 3. Configure production values

Copy `web.env.example` to `C:\RCAAS\config\web.env`, `api.env.example` to `C:\RCAAS\config\api.env`, and `Caddyfile` to `C:\RCAAS\config\Caddyfile`. Copy `with-env.mjs`, `check-config.mjs`, `backup-files.mjs` and `Backup.ps1` into `C:\RCAAS\ops`.

Set the real domain in all three configurations. `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` and `CLIENT_ORIGIN` must be the same HTTPS origin, with no `/api` suffix or trailing slash. This keeps browser cookies on the same origin. Frontend values are embedded during the build, so changing them requires rebuilding.

Generate three independent secrets and enter them in `api.env` (do not send them in chat or commit them):

```powershell
node.exe -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run separately for SESSION_SECRET, EMBED_TOKEN_SECRET and EDITOR_PASSWORD.
node.exe C:\RCAAS\ops\check-config.mjs C:\RCAAS\config\web.env C:\RCAAS\config\api.env
if ($LASTEXITCODE -ne 0) { throw 'Fix production configuration before proceeding' }
```

Use literal `KEY=value` syntax, quote values with spaces, and use forward slashes in environment paths. Environment files are parsed as data, never executed as PowerShell. Leave `DATABASE_URL` blank to retain file accounts. For email, configure a verified `LEADS_FROM`, `RESEND_API_KEY` and intended `LEADS_TO`. Real delivery still needs a test. Leave unconfigured optional SMS, WhatsApp and AI features disabled.

Do not set conflicting machine-level `NODE_ENV`, `PORT`, `DATA_DIR` or secret variables. Node's service `--env-file` respects already inherited environment values. The helper used for builds explicitly loads the selected configuration. Keep `.env` files out of every release to prevent dotenv/Next from picking up development settings.

## 4. Install dependencies, test and build the release

In the new release (example below), run each command and stop on a nonzero exit code. Tests use disposable data; never set `API_TEST_DATABASE_URL` to production.

```powershell
Set-Location C:\RCAAS\releases\2026-11-05-01
npm.cmd ci --include=dev
if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed' }
npm.cmd --prefix server ci --include=dev
if ($LASTEXITCODE -ne 0) { throw 'API dependency installation failed' }
npm.cmd test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed' }
npx.cmd tsc --noEmit
if ($LASTEXITCODE -ne 0) { throw 'Type checking failed' }
npm.cmd run lint
if ($LASTEXITCODE -ne 0) { throw 'Lint failed' }
node.exe C:\RCAAS\ops\with-env.mjs C:\RCAAS\config\web.env -- 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run build
if ($LASTEXITCODE -ne 0) { throw 'Production build failed' }
# Next writes image/fetch caches and the revalidated sitemap under .next.
icacls.exe .next /grant '*S-1-5-19:(OI)(CI)M'
if ($LASTEXITCODE -ne 0) { throw 'Build cache permissions failed' }
```

Build while the previous release remains live. Outbound HTTPS is needed for npm and the build's Google font download. Do not use the GitHub Pages static export for this VPS: it cannot run the API.

## 5. Install the Windows services

Copy the downloaded Caddy binary to `C:\RCAAS\bin\caddy.exe`. Copy the same WinSW executable three times to `C:\RCAAS\services`, naming them `rcaas-api.exe`, `rcaas-web.exe` and `rcaas-proxy.exe`. Copy their matching XML files from `deploy/services/` beside them. Review executable paths and Local Service permissions before installation. Do not run the applications as LocalSystem.

For the **first deployment only**, when `current` does not exist:

```powershell
New-Item -ItemType Junction -Path C:\RCAAS\current -Target C:\RCAAS\releases\2026-11-05-01 | Out-Null
& C:\RCAAS\services\rcaas-api.exe install
if ($LASTEXITCODE -ne 0) { throw 'API service installation failed' }
& C:\RCAAS\services\rcaas-web.exe install
if ($LASTEXITCODE -ne 0) { throw 'Web service installation failed' }
& C:\RCAAS\services\rcaas-proxy.exe install
if ($LASTEXITCODE -ne 0) { throw 'Proxy service installation failed' }
Start-Service RcaasApi
Start-Service RcaasWeb
Invoke-RestMethod http://127.0.0.1:4000/api/health
Invoke-WebRequest http://127.0.0.1:3000/login -UseBasicParsing
```

Services start automatically after reboot and restart after a failing process exit. There is deliberately no service dependency that stops the website when the API is stopped for backup. Keep **one** API process; do not add a second service, PM2 cluster or load-balanced API replica. In production an occupied API port now fails startup rather than silently moving to another port.

## 6. DNS, HTTPS and firewall

Point the domain's A record to the VPS public IP. Only add AAAA if IPv6 actually reaches this server. This configuration assumes direct traffic to Caddy; start with DNS-only mode if using Cloudflare. A CDN/proxy later needs a deliberate trusted-proxy configuration.

Check that IIS or another service is not already listening on 80/443. Do not disable another site's services blindly. Allow inbound TCP 80 and 443 in both the provider firewall and Windows Firewall; keep Node ports 3000/4000, PostgreSQL 5432 and Caddy admin 2019 closed externally. Preserve your existing restricted RDP/admin access.

```powershell
New-NetFirewallRule -DisplayName 'RCAAS HTTP HTTPS' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80,443
& C:\RCAAS\bin\caddy.exe validate --config C:\RCAAS\config\Caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy configuration is invalid' }
Start-Service RcaasProxy
```

Caddy obtains and renews the domain certificate automatically. Its state stays in `C:\RCAAS\caddy-state` through code updates. Verify from **another machine** that HTTP redirects to HTTPS, the certificate is valid, `/api/health` returns `{"ok":true}`, and ports 3000/4000 are unreachable. To change proxy settings after validation, use `caddy.exe reload --config C:\RCAAS\config\Caddyfile --adapter caddyfile`.

## 7. Backups and restoration

`Backup.ps1` stops the API while capturing files and optional PostgreSQL accounts, then restarts it in a `finally` block if capture fails. This creates a maintenance window: uploads, bookings and other API calls are unavailable until it restarts. Run at quiet hours; large asset archives can take time. Coordinate upgrades with backups, and pause the scheduled task during release switching. No other program may write the stores during capture.

First perform a local rehearsal from Administrator PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\RCAAS\ops\Backup.ps1 -LocalOnly
if ($LASTEXITCODE -ne 0) { throw 'Backup failed; inspect API health and logs' }
```

Successful snapshot folders contain `data.tar.gz`, `assets.tar.gz` for local storage, `accounts.dump` when PostgreSQL is enabled, and `manifest.json` with SHA-256 hashes. Failed captures remain `.partial-*`, without being promoted to completed snapshots. Database URLs are not passed on command lines or printed by the worker. Set `PG_DUMP_EXE` in `api.env` to the installed full `pg_dump.exe` path when using PostgreSQL. The legacy `npm run backup` does **not** replace this deployment backup: it omits separate assets and PostgreSQL.

For a real off-machine backup, provision a private UNC share on a **different machine** (for example `\\backup-host\private-rcaas`). Give the backup task's Windows account write/read access. Do not use a mapped drive or a share on this same VPS. Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\RCAAS\ops\Backup.ps1 -OffsitePath '\\backup-host\private-rcaas'
```

The script verifies the transferred file hashes before reporting success. In Task Scheduler, create a daily task at a quiet time, run whether logged on or not, with highest privileges, under an account permitted to control `RcaasApi` and access the share. Use the command above, set **Do not start a new instance**, and avoid a task time limit that kills a long backup. Store the task password in Windows, never in the command or repository. Test using **Run** in Task Scheduler while logged out of that account. SYSTEM does not automatically have access to a remote share. Review task failures and disk usage; use an external uptime monitor for `/api/health`.

No snapshots are automatically deleted. After a successful restore drill, configure retention on the backup system (for example 14 daily plus monthly copies) and monitor local capacity. For `ASSET_DRIVER=s3`, this script does not download bucket objects: arrange an independent/versioned object backup. A live bucket alone is not a backup. Separately protect configuration, secrets and certificate state in encrypted administrative backups; they are not included in these data archives.

### Restore drill (new empty directories first)

**Automated check (2026-11-13):** `restore-check.mjs` performs the steps below and verifies the result. It checks every manifest hash and refuses unlisted files. It extracts into a new empty folder and parses every store file and activity line. Every published space must have its snapshot file and its scan files. With `--live`, it lists whatever differs from the live data. It prints a JSON report and exits 1 on anything that would break a restore. Warnings cover known data debts, such as an owner account that is gone or a draft without its scan. Run it after the first backup and then monthly:

```powershell
node C:\RCAAS\app\current\deploy\restore-check.mjs C:\RCAAS\backups\snapshot-REPLACE C:\RCAAS\restore-drill\REPLACE-DATE
# Straight after a backup, also compare with live data: add --live C:\RCAAS\data
# With ASSET_DRIVER=s3 the snapshot has no scans: add --assets <a local copy of the bucket> to check them.
```

The manual steps follow, for reference and for the PostgreSQL dump.

Copy a completed snapshot from the off-machine share to a scratch directory. Verify every manifest hash before extraction:

```powershell
$snapshot = 'C:\RCAAS\backups\snapshot-REPLACE-WITH-REAL-ID'
$manifest = Get-Content -LiteralPath (Join-Path $snapshot 'manifest.json') -Raw | ConvertFrom-Json
foreach ($entry in $manifest.files.PSObject.Properties) {
    $hash = (Get-FileHash -LiteralPath (Join-Path $snapshot $entry.Name) -Algorithm SHA256).Hash
    if ($hash -ne $entry.Value) { throw "Checksum mismatch: $($entry.Name)" }
}
# Use a new empty drill directory each time; never merge a restore into live data.
New-Item -ItemType Directory -Path C:\RCAAS\restore-drill\data | Out-Null
New-Item -ItemType Directory -Path C:\RCAAS\restore-drill\assets | Out-Null
tar.exe -xzf (Join-Path $snapshot 'data.tar.gz') -C C:\RCAAS\restore-drill\data
if ($LASTEXITCODE -ne 0) { throw 'Data restore failed' }
if (Test-Path -LiteralPath (Join-Path $snapshot 'assets.tar.gz')) {
    tar.exe -xzf (Join-Path $snapshot 'assets.tar.gz') -C C:\RCAAS\restore-drill\assets
    if ($LASTEXITCODE -ne 0) { throw 'Asset restore failed' }
}
```

Check representative JSON, account IDs and model chunks. For PostgreSQL, restore `accounts.dump` into a **new empty disposable database** using `pg_restore --exit-on-error --no-owner --no-privileges`, connecting as the account that will own the restored schema. Keep credentials in `PGDATABASE`/a protected PostgreSQL password file, not shell history. Apply the required CA/TLS settings. Verify account counts and a test login against this isolated restore. A dump does not include database roles; provision the target role/database separately.

For a real recovery, stop `RcaasApi` and `RcaasWeb`, preserve the current data in a dated recovery folder, and restore into new empty directories. Restore file data, local assets and the matching database from the **same** snapshot. Reapply Local Service modify permissions before starting. Never simply unset `DATABASE_URL` after using PostgreSQL: the old account JSON is stale. Resume only after health, sign-in, ownership, tours and bookings are verified.

## 8. PostgreSQL gate, if selected

Before setting the production URL, provision a disposable database with the same PostgreSQL version and TLS setup. Run the API's local-storage and S3 suites **serially against separate fresh test databases**, since fixtures create/delete accounts with the same emails. Example from `server/` with a disposable `API_TEST_DATABASE_URL`: `node --test test/api.test.js`, then a different fresh test URL for `node --test test/api-s3.test.js`. Do not run the full parallel suite against one shared database. Include outage/recovery and dump/restore checks.

For cutover, back up first, stop the API, set the intended production URL/CA in `api.env`, then from `C:\RCAAS\current\server` run:

```powershell
node.exe C:\RCAAS\ops\with-env.mjs C:\RCAAS\config\api.env -- 'C:\Program Files\nodejs\node.exe' scripts\import-users.js
if ($LASTEXITCODE -ne 0) { throw 'Account import failed; keep API stopped' }
```

The importer validates every source account before writing, applies migrations, and imports accounts in one transaction. It preserves IDs, password hashes and outstanding reset tokens. An existing account with the same ID and email is left unchanged; a mismatched ID/email aborts and rolls back the entire account import. Missing/unreadable account directories, corrupt files and duplicate source accounts fail the command. Reconcile conflicts deliberately while the API stays stopped. This does not recover absent owners or move projects/bookings into PostgreSQL. Start the API only after verification.

The CI workflow now provisions separate disposable PostgreSQL 17 databases for the local-asset and fake-S3 API suites. It runs PostgreSQL concurrency/migration regressions before API fixtures in each database. A Windows Server 2022 job also tests archive restoration and mocked service restart behavior. These jobs must complete on the pushed commit before their results can be claimed; they do not verify your production database, real services or remote backup share. The production template sets a 5-second database connection deadline and 15-second statement deadline; adjust only after investigating legitimate slow work.

## 9. Updates and rollback

1. Build and validate a new release using section 4. Keep the prior release and its build.
2. Pause scheduled backups, run one verified backup, and schedule a maintenance window. Record the current junction target with `Get-Item C:\RCAAS\current | Select-Object LinkType,Target`.
3. Stop `RcaasWeb` and `RcaasApi`. Confirm both are stopped. Rename the existing **junction itself** to a dated name such as `previous-20261105` with `Rename-Item -LiteralPath C:\RCAAS\current -NewName previous-20261105`. Verify it is a junction targeting a directory under `C:\RCAAS\releases` first. Do not recursively delete or move its target.
4. Create `C:\RCAAS\current` as a junction to the new validated release. Start the API and web services, then verify health, login and a tour through public HTTPS. Caddy can stay running during this brief maintenance window.
5. If startup or checks fail, stop both services. Rename the failed `current` junction aside, rename the saved previous junction back to `current`, and restart both services. Preserve failed releases for inspection. Re-enable the backup task once the chosen release is healthy.

Code rollback does not undo data/schema changes. Review migrations before upgrading; if a migration is incompatible with the old code, recovery needs the matching database/file snapshot and a deliberate decision about writes since that snapshot. These focused fixes do not require a data migration.

## 10. Go-live checks and known limits

- Confirm the correct public domain in canonical URLs, API calls and generated links.
- Sign in with the intended admin; check project ownership and staff restrictions.
- Upload a real asset, resume an interrupted upload, publish a tour and view it on desktop/mobile with real GPU rendering. Test metadata and chunk range requests through HTTPS.
- Submit one intended enquiry/booking and verify its receipt, persistence and actual email delivery; do not send unsolicited test messages.
- Restart services and reboot the VPS; confirm automatic startup, stable ports, data persistence and certificate state.
- Complete an off-machine restore drill, then monitor health, free disk and scheduled backup results.
- Resolve missing assets/owners, public placeholders, routing and dependency findings in `PRE_VPS_AUDIT.md`. Stale editor tabs still need save-conflict detection. One API process is mandatory with the current file stores.

Local tests do not establish Windows service installation, public DNS, certificate issuance, live PostgreSQL, cloud storage or browser/GPU readiness. Those checks require the configured VPS.

Preparation validation on 5 November 2026: 202 tests passed, 1 intentionally skipped; TypeScript and production build passed; lint had the same 6 existing warnings. Disposable backup restoration and mocked Windows service recovery passed. PowerShell syntax and XML parsing passed. The build required network access for Google Fonts. Caddy and WinSW were not installed or executed during this preparation.

## References

- [Caddy Windows services](https://caddyserver.com/docs/running#windows-service), [automatic HTTPS](https://caddyserver.com/docs/automatic-https), and [proxy routing](https://caddyserver.com/docs/caddyfile/patterns).
- [WinSW 2.12 XML configuration](https://github.com/winsw/winsw/blob/v2.12.0/doc/xmlConfigFile.md).
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting).
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) and [pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html).
