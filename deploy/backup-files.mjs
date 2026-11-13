// Called ONLY while Backup.ps1 has stopped the API. No .env auto-discovery.
import { mkdir, readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const output = path.resolve(process.argv[2] || '.');
const { DATA_DIR, ASSET_DIR, ASSET_DRIVER, DATABASE_URL, DATABASE_CA_FILE } = process.env;
const within = (parent, child) => {
  const rel = path.relative(path.resolve(parent), child);
  return !rel || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
};
function run(executable, args, env = process.env) {
  const result = spawnSync(executable, args, { cwd: output, env, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
  // Do not echo tool errors that could contain connection details or credentials.
  if (result.error || result.status !== 0) throw new Error(`${path.basename(executable)} failed; check installation, paths, permissions and connectivity.`);
}
try {
  if (!process.argv[2] || !DATA_DIR || !ASSET_DIR || !['local', 's3'].includes(ASSET_DRIVER)) throw new Error('Missing backup settings.');
  if (within(DATA_DIR, output) || within(ASSET_DIR, output)) throw new Error('Backup destination must be outside data and assets.');
  if (!(await stat(DATA_DIR)).isDirectory()) throw new Error('DATA_DIR is missing.');
  if (ASSET_DRIVER === 'local' && !(await stat(ASSET_DIR)).isDirectory()) throw new Error('ASSET_DIR is missing.');
  // Existing nonempty destinations are never overwritten.
  await mkdir(output, { recursive: true });
  if ((await readdir(output)).length) throw new Error('Backup destination must be empty.');
  run('tar', ['-czf', 'data.tar.gz', '-C', path.resolve(DATA_DIR), '.']);
  if (ASSET_DRIVER === 'local') run('tar', ['-czf', 'assets.tar.gz', '-C', path.resolve(ASSET_DIR), '.']);
  if (DATABASE_URL) {
    const env = { ...process.env, PGDATABASE: DATABASE_URL, PGCONNECT_TIMEOUT: '15' };
    if (DATABASE_CA_FILE) Object.assign(env, { PGSSLROOTCERT: DATABASE_CA_FILE, PGSSLMODE: 'verify-full' });
    // Set PG_DUMP_EXE to the absolute PostgreSQL bin/pg_dump.exe path on Windows.
    run(process.env.PG_DUMP_EXE || 'pg_dump', ['--no-password', '--format=custom', '--lock-wait-timeout=60s', '--file=accounts.dump'], env);
  }
  const manifest = { createdAt: new Date().toISOString(), assetDriver: ASSET_DRIVER, accounts: DATABASE_URL ? 'postgresql' : 'files', files: {} };
  for (const name of await readdir(output)) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path.join(output, name))) hash.update(chunk);
    manifest.files[name] = hash.digest('hex');
  }
  await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
  // Ensure the manifest is readable before reporting success.
  JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
  console.log('Backup archives and SHA-256 manifest created.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
