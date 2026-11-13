/**
 * Copies the file accounts (DATA_DIR/users/*.json) into Postgres, keeping
 * their ids and password hashes, so everyone signs in as before and every
 * project's owner/member ids still match. Safe to run again: an email that's
 * already in the database with the same ID is left alone. Conflicting IDs
 * abort the entire import. Stop the API and take a backup before cutover.
 * JSON files are untouched but become stale after PostgreSQL receives writes;
 * restoring a matching backup is required to roll back those later changes.
 *
 *   npm run db:import-users
 */
import 'dotenv/config';
import path from 'path';
import { DATA_DIR } from '../src/dataDir.js';
import { readFileAccounts, importAccounts } from './import-users-data.js';

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL in server/.env first.');
  process.exit(1);
}
let pool;
try {
  const accounts = await readFileAccounts(path.join(DATA_DIR, 'users'));
  const db = await import('../src/db.js');
  pool = db.pool;
  await db.migrate();
  const { added, skipped } = await importAccounts(pool, accounts);
  console.log(`${added} account(s) added, ${skipped} already have matching IDs/emails and were left unchanged.`);
} catch {
  // Parse and PostgreSQL errors can contain account records or connection details.
  console.error('Account import failed. No partial account import was committed. Check source account validity, matching IDs/emails, database access and DATA_DIR; keep the API stopped.');
  process.exitCode = 1;
} finally { await pool?.end(); }
