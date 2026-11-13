import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const date = value => value == null ? null : new Date(value);

export function validateAccounts(accounts) {
  if (!Array.isArray(accounts) || !accounts.length) throw new Error('No file accounts found; check DATA_DIR before importing.');
  const ids = new Set(), emails = new Set();
  return accounts.map((account, index) => {
    const fail = () => { throw new Error(`Invalid or duplicate source account at position ${index + 1}; no accounts imported.`); };
    if (!account || typeof account !== 'object' || !uuid.test(account.id) ||
      typeof account.name !== 'string' || !account.name.trim() ||
      typeof account.email !== 'string' || !/^[^\s@]+@[^\s@]+$/.test(account.email) ||
      account.email !== account.email.trim().toLowerCase() ||
      !/^[0-9a-f]{32}:[0-9a-f]{128}$/i.test(account.passwordHash) ||
      !['admin', 'editor', 'staff'].includes(account.role ?? 'editor')) fail();
    const id = account.id.toLowerCase();
    const created = date(account.createdAt);
    const changed = date(account.passwordChangedAt);
    const resetExpires = date(account.reset?.expires);
    if (!created || !Number.isFinite(created.getTime()) ||
      (changed && !Number.isFinite(changed.getTime())) ||
      (account.reset != null && (!/^[0-9a-f]{64}$/i.test(account.reset.hash) || !resetExpires || !Number.isFinite(resetExpires.getTime()))) ||
      ids.has(id) || emails.has(account.email)) fail();
    ids.add(id); emails.add(account.email);
    return [id, account.name, account.email, account.passwordHash, account.role ?? 'editor', changed, created,
      account.reset?.hash ?? null, resetExpires];
  });
}

export async function readFileAccounts(directory) {
  // Read/parse failures must stop cutover, never masquerade as an empty import.
  const files = (await readdir(directory)).filter(file => file.endsWith('.json')).sort();
  const accounts = await Promise.all(files.map(async file => JSON.parse(await readFile(path.join(directory, file), 'utf8'))));
  validateAccounts(accounts);
  return accounts;
}

export async function importAccounts(pool, accounts) {
  const rows = validateAccounts(accounts);
  const client = await pool.connect();
  try {
    await client.query('begin');
    // The API must be stopped for cutover. This also prevents concurrent writes
    // from racing the identity checks if another importer is accidentally run.
    await client.query('lock table app.users in share row exclusive mode');
    let added = 0;
    for (const row of rows) {
      const existing = (await client.query('select id, email from app.users where id = $1 or email = $2', [row[0], row[2]])).rows;
      if (existing.length) {
        if (existing.length !== 1 || existing[0].id !== row[0] || existing[0].email !== row[2]) {
          throw new Error('An existing database account has a conflicting ID or email. Reconcile ownership before retrying; import rolled back.');
        }
        continue; // Preserve any password/role changes already made in PostgreSQL.
      }
      await client.query(`insert into app.users
        (id, name, email, password_hash, role, password_changed_at, created_at, reset_hash, reset_expires)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, row);
      added++;
    }
    await client.query('commit');
    return { added, skipped: rows.length - added };
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally { client.release(); }
}
