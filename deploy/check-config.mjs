// Read-only configuration checks. Never connects to storage or prints secrets.
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export function checkConfig(web, api) {
  const errors = [], warnings = [];
  const requireValue = (condition, message) => { if (!condition) errors.push(message); };
  let origin;
  try {
    const url = new URL(web.NEXT_PUBLIC_SITE_URL);
    requireValue(url.protocol === 'https:' && url.origin === web.NEXT_PUBLIC_SITE_URL &&
      !url.username && !url.password && !url.port &&
      !/^(localhost|127\.|0\.|\[|example\.)/i.test(url.hostname) && url.hostname.includes('.'),
    'NEXT_PUBLIC_SITE_URL must be the real HTTPS domain, without a path, port or trailing slash.');
    origin = url.origin;
  } catch { errors.push('NEXT_PUBLIC_SITE_URL is not a valid URL.'); }
  requireValue(!!origin && web.NEXT_PUBLIC_API_URL === origin && api.CLIENT_ORIGIN === origin,
    'NEXT_PUBLIC_API_URL and CLIENT_ORIGIN must match NEXT_PUBLIC_SITE_URL (no /api suffix).');
  requireValue(web.NODE_ENV === 'production' && api.NODE_ENV === 'production', 'Both environment files need NODE_ENV=production.');
  requireValue(!web.NEXT_PUBLIC_BASE_PATH && !web.NEXT_OUTPUT_EXPORT && (!web.NEXT_DIST_DIR || web.NEXT_DIST_DIR === '.next'),
    'This VPS bundle requires a root-path server build in .next, without static export.');
  requireValue(api.HOST === '127.0.0.1' && api.PORT === '4000', 'The API must use HOST=127.0.0.1 and PORT=4000.');
  requireValue(api.DATA_DIR === 'C:/RCAAS/data' && api.ASSET_DIR === 'C:/RCAAS/assets',
    'Use DATA_DIR=C:/RCAAS/data and ASSET_DIR=C:/RCAAS/assets with these service templates.');
  const secretKeys = ['SESSION_SECRET', 'EMBED_TOKEN_SECRET', 'EDITOR_PASSWORD'];
  for (const key of secretKeys) {
    requireValue(typeof api[key] === 'string' && api[key].length >= 32 && !/change-me|example/i.test(api[key]),
      `${key} must be replaced with a separately generated random secret (at least 32 characters).`);
  }
  requireValue(new Set(secretKeys.map(key => api[key])).size === 3, 'Use different values for the three authentication secrets.');
  requireValue(['local', 's3'].includes(api.ASSET_DRIVER), 'ASSET_DRIVER must be local or s3.');
  if (api.ASSET_DRIVER === 's3') {
    for (const key of ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']) {
      requireValue(!!api[key], `${key} is required for s3.`);
    }
    warnings.push('S3/R2 paths and an independent object backup still need verification.');
  }
  if (api.DATABASE_URL) warnings.push('PostgreSQL is configured but not tested by this check; validate import, outage recovery and backup/restore separately.');
  else warnings.push('Accounts use JSON files. All application file stores require ONE API process.');
  if (!api.RESEND_API_KEY || !api.LEADS_FROM || /resend\.dev/i.test(api.LEADS_FROM)) {
    warnings.push('Email delivery is not configured with a production sender.');
  }
  requireValue(api.DEMO_ENGINE !== '1', 'Disable DEMO_ENGINE in production.');
  return { errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [webFile, apiFile] = process.argv.slice(2);
    if (!webFile || !apiFile) throw new Error('Usage: node check-config.mjs web.env api.env');
    const { errors, warnings } = checkConfig(parseEnv(readFileSync(webFile, 'utf8')), parseEnv(readFileSync(apiFile, 'utf8')));
    for (const message of warnings) console.warn(`CHECK: ${message}`);
    for (const message of errors) console.error(`ERROR: ${message}`);
    if (!errors.length) console.log('Configuration checks passed. This does not verify live services, data or the database.');
    process.exitCode = errors.length ? 1 : 0;
  } catch { console.error('Could not read configuration. Usage: node check-config.mjs web.env api.env'); process.exitCode = 1; }
}
