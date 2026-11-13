# Phase 03 — data durability, backup and restore (13 November 2026)

## Store inventory (`DATA_DIR`, verified in code)

| Store | Files | Write safety | Tests |
|---|---|---|---|
| Accounts | `users/*.json`, or Postgres `app.users` with `DATABASE_URL` | serialized mutations; reset token consumed once | `persistence.test.js`, `session.test.js`, `postgres.test.js` (CI only) |
| Projects | `properties/<id>.json` | `writeQueue.withWriteLock` per document (`store.js`) | persistence: overlapping changes keep every field and member |
| Spaces | `scenes/<id>.json` (draft) + `<id>@<n>.json` (published, immutable) | lock + draft revision (409 on a stale tab, `draftRevision.js`) | persistence: concurrent publishes give distinct snapshots |
| Websites | `sites/<id>.json` | lock (`routes/sites.js`); a corrupt file refuses writes | persistence |
| Bookings | `reservations/<id>.json` | one queue per project (`reservations.js`); a corrupt file refuses writes | persistence + API tests (409 on double booking) |
| Enquiries | `leads/<id>.json` | one file per enquiry, created whole | API tests |
| Visit stats | `stats/<project>/…` | queued (`stats.js`) | API tests |
| Activity | `activity/<project>.jsonl` | append-only lines | — |
| Scans/photos | `ASSET_DIR` or R2 | written once at upload, then served immutable | storage tests (disk + fake S3) |

Every whole-file write is a temp file plus rename (`dataDir.js writeFileWhole`, `dataDir.test.js`: 40 writes raced against 200 reads, none torn). **The locks coordinate one API process: run exactly one API instance.**

## Backup and restore

- **Capture:** `deploy/Backup.ps1` stops the API, runs `backup-files.mjs` (`data.tar.gz`, `assets.tar.gz`, `accounts.dump` with Postgres, SHA-256 `manifest.json`), restarts the API, and copies the snapshot to an off-machine UNC share, checking every hash on the share. This already existed.
- **New: `deploy/restore-check.mjs`**, the restore drill as one command:
  - checks every hash and refuses unlisted files;
  - extracts into an empty folder only;
  - parses every store file and every activity line;
  - requires each published space's snapshot and its scan files;
  - with `--live`, compares the restore with live data.
  - It exits 1 on anything that breaks a restore. The runbook (`deploy/README.md` §7) now points to it.
- **Tests:** `test/restore-check.test.mjs` covers a clean round trip with 0 differences, a tampered archive and an unlisted file (refused before extracting), and a missing published snapshot, missing published scan and unreadable JSON (each an error).
- **Rehearsal on this PC (13 Nov):**
  - **Source:** a fresh copy of today's data, laid out as in production (data and assets apart), plus the real 1.5 GB of scans, read in place.
  - **Backup:** 47 s; `data.tar.gz` 18.7 MB, `assets.tar.gz` 1.53 GB.
  - **Restore and check:** 4 s. 76 store files parsed, **0 differences from the source**.
  - **It found one real error:** the published tour `computer-lab2` has no scan file. This is PRE_VPS finding 2: that tour is broken for visitors.
  - **Warnings:** 5 projects owned by a missing account (PRE_VPS finding 7), and 2 drafts without scans.
  - The drill files were deleted afterwards.
- **Still open (hard stop):**
  - an off-machine copy that is restored and checked, on the server, from the share;
  - backup scheduling in Task Scheduler;
  - a versioned R2 backup once `ASSET_DRIVER=s3`;
  - secrets and configuration kept in a separate encrypted backup.
  
  These need the server.

## When Postgres should replace a JSON store

Accounts can already use Postgres. Move another store only when one of these is true; don't move them all at once:

1. **More than one API process** (load or zero-downtime deploys). The in-process locks then stop protecting bookings, projects and sites. Move **bookings** first (a double booking costs money), then projects and sites.
2. **Two people often edit one website draft or project at once.** Draft revisions already turn a lost save into a 409 for spaces and websites, so this is a usability trigger, not a safety one.
3. **A store outgrows files.** Stats and leads are per-file today; consider a move when a project passes ~10k leads or the report gets slow.

Each move keeps the same exports, adds a numbered SQL migration (`server/db/NNN_*.sql`, applied on start and recorded in `app.schema_migrations`) and an import script that keeps ids, and adds a `pg_dump` restore test to the drill.

## Migrations

- Scene documents migrate on read (`migrate.js`); published snapshots are never rewritten.
- SQL migrations run once each, in order.
- The file → Postgres account import keeps ids and rolls back on a conflict (`test/deployment.test.mjs`).
- Rolling back a code release never needs a data rollback, because new fields default when absent (rule 2).
