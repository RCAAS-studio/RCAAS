/**
 * The Postgres connection (Supabase, or any Postgres: nothing here is
 * Supabase-specific, so moving providers is pg_dump + a new DATABASE_URL).
 * Only this server talks to the database; tables live in the `app` schema,
 * which Supabase's public Data API doesn't expose, with RLS on as well.
 */
import pg from 'pg';
import { promises as fs, readFileSync } from 'fs';
import path from 'path';

// DATABASE_CA_FILE: the provider's CA certificate (Supabase: Database → SSL
// configuration → download), so the TLS connection is verified, not just encrypted.
const ca = process.env.DATABASE_CA_FILE ? readFileSync(process.env.DATABASE_CA_FILE, 'utf8') : undefined;

function positiveSetting(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0 || number > 2147483647) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return number;
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: positiveSetting('DATABASE_POOL_MAX', 10),
  connectionTimeoutMillis: positiveSetting('DATABASE_CONNECTION_TIMEOUT_MS', 5000),
  statement_timeout: positiveSetting('DATABASE_STATEMENT_TIMEOUT_MS', 15000),
  ...(ca && { ssl: { ca } })
});
// An idle connection the provider drops must not crash the server.
pool.on('error', (err) => console.error('[db] idle connection error:', err.message));

/** Runs `fn(client)` in one transaction; rolls back if it throws. */
export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const out = await fn(client);
    await client.query('commit');
    return out;
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Applies pending migrations atomically. A transaction-scoped lock also
 * protects initial schema creation when two instances start together. */
export async function migrate() {
  const dir = path.join(import.meta.dirname, '..', 'db');
  const applied = await tx(async (c) => {
    await c.query('select pg_advisory_xact_lock(785355, 1)');
    await c.query(`create schema if not exists app;
      create table if not exists app.schema_migrations (name text primary key, applied_at timestamptz not null default now());
      alter table app.schema_migrations enable row level security;`);
    const done = new Set((await c.query('select name from app.schema_migrations')).rows.map((r) => r.name));
    const names = [];
    for (const name of (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
      if (done.has(name)) continue;
      const sql = await fs.readFile(path.join(dir, name), 'utf8');
      await c.query(sql);
      await c.query('insert into app.schema_migrations (name) values ($1)', [name]);
      names.push(name);
    }
    return names;
  });
  for (const name of applied) console.log(`[db] applied ${name}`);
}
