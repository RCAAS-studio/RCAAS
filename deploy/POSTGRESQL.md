# PostgreSQL authentication: VPS or managed

Prepared 13 November 2026. Both options use the existing `pg` adapter and `app.users` schema. Choose one production database before cutover. No production database or local account was changed by this preparation.

Accounts, scrypt password hashes, roles, password-change times and hashed one-time reset tokens use PostgreSQL when `DATABASE_URL` is set. Sessions remain signed, host-only HttpOnly cookies; there is no database session/device registry. Projects, membership, scenes, websites, bookings and reports still require the persistent file stores. Run **one API process**.

## Option A: PostgreSQL on the Windows VPS

1. Install a supported PostgreSQL release with its latest maintenance update using the [official Windows download](https://www.postgresql.org/download/windows/). Keep database files outside code releases. Record the installed Windows service name and PostgreSQL major version.
2. Bind PostgreSQL to `127.0.0.1` and keep port 5432 closed in Windows and provider firewalls. Configure `pg_hba.conf` for the application database/user on loopback with `scram-sha-256`; verify the effective rule order. PostgreSQL runs under its own service account.
3. In an administrator database session, create a dedicated application role and database:

   ```sql
   CREATE ROLE rcaas_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
   ```

   Set its password interactively with `\password rcaas_app` in psql, then:

   ```sql
   CREATE DATABASE rcaas_auth OWNER rcaas_app;
   ```

   The application role needs to own/create its `app` schema and run the numbered migrations. Do not use the PostgreSQL superuser as the API account.
4. Set `DATABASE_URL=postgresql://rcaas_app:<URL-encoded-password>@127.0.0.1:5432/rcaas_auth` in the protected `C:/RCAAS/config/api.env`. Keep `DATABASE_CA_FILE` empty for this loopback-only connection. Do not expose it over the network.
5. Set `PG_DUMP_EXE` to the installed `pg_dump.exe` path. Ensure the PostgreSQL service starts automatically and the API recovers after a database restart.

## Option B: a managed PostgreSQL database

1. Provision a dedicated database and application role with the permissions required above. Use the provider's direct or supported session endpoint for migrations and backup tools; verify any pooler restrictions with that provider.
2. Store the provider URL in `DATABASE_URL`. Percent-encode reserved characters in its username/password. Restrict inbound access to the VPS where supported.
3. Require verified TLS. For a private/provider CA, put the certificate in the protected configuration directory and set `DATABASE_CA_FILE`. The API now keeps that CA and full verification even when the connection URL contains conflicting SSL settings. For a publicly trusted certificate, use `sslmode=verify-full` and test from the VPS. Do not disable certificate verification to bypass errors.
4. Install a PostgreSQL client compatible with the server's major version, even though the database is remote. `Backup.ps1` still needs `pg_dump.exe`. Confirm provider snapshots and retention; keep an independently restorable backup.
5. Test connectivity, certificate validation, connection limits, outage recovery and backup restoration on the actual provider before cutover. Local tests do not establish provider-specific readiness.

## Cutover and verification

- Set `SHARED_TEAM_LOGIN=0`. Give each teammate an account. The shared access code remains the signup code; its production login bypass is disabled.
- Generate separate production session/embed/access-code secrets. Use `DATABASE_CONNECTION_TIMEOUT_MS=5000`, `DATABASE_STATEMENT_TIMEOUT_MS=15000` and a pool size appropriate for the provider's connection limit.
- Back up the current accounts, file stores and assets. Stop the API before the final account import. In the release's `server/` directory, use the runbook's environment runner to execute `scripts/import-users.js` with the production `api.env`.
- The importer validates all source records and imports in one transaction. Matching IDs/emails remain unchanged; a conflicting ID/email aborts the account import. IDs and password hashes stay intact so project ownership and existing passwords continue to work.
- Start the API with the intended URL. Check health, account login, project membership, staff restrictions, password change/reset, invitations, removed accounts and blocked shared login. Verify Secure/HttpOnly cookies through HTTPS on the studio host.
- Verify reset email delivery with an intended recipient after configuring a verified sender. An accepted request alone does not establish delivery.
- Schedule `Backup.ps1` with an off-machine destination. Keep `postgres-env.mjs` beside `backup-files.mjs`: it supplies the actual database, host, user and TLS parameters to `pg_dump` without credentials in command arguments.

## Restore and rollback

Restore into a **new, empty disposable database** first, using a compatible `pg_restore --exit-on-error --no-owner --no-privileges --dbname <database-name> accounts.dump`. Set connection fields separately (`PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`); use a protected `PGPASSFILE` for the password. A complete connection URL in `PGDATABASE` is not expanded by these tool defaults. For a managed server, also configure the correct CA and `PGSSLMODE=verify-full`.

Check restored account IDs, roles, password login, reset-token state and membership against the matching file snapshot. A dump does not create the target database role. For real recovery, stop writers, preserve the failed state, and restore accounts, file data and assets from the same snapshot. Code rollback alone does not roll back account changes. Never unset `DATABASE_URL` as a shortcut after PostgreSQL has received writes: the old JSON accounts are stale.

## Evidence from this preparation

A disposable PostgreSQL 17.11 instance ran locally with a non-superuser application role. Concurrent migrations/first signups, final-admin protection, single-use resets, transaction rollback and statement cancellation passed. The real API suites passed with both local assets (64 tests) and fake S3 (65 tests). A production API login returned Secure/HttpOnly cookies and refused shared login. During a database stop it returned health 503 and session 500, remained alive and recovered after restart. The actual backup worker's dump restored account IDs, roles and working password hashes into another database.

This exposed and fixed the dump connection bug and prompted a regression for CA settings overridden by a connection URL. Live VPS services, provider TLS, off-machine recovery and real email delivery still require verification.

References: [PostgreSQL connection parameters](https://www.postgresql.org/docs/17/libpq-connect.html), [client environment variables](https://www.postgresql.org/docs/17/libpq-envars.html), [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html).
