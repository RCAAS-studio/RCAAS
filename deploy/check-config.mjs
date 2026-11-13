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
  // The shared team sign-in sees every client's projects (server/src/middleware/auth.js).
  requireValue(api.SHARED_TEAM_LOGIN !== '1', 'Turn SHARED_TEAM_LOGIN off: give every team member an account.');
  requireValue(!web.LEGACY_REDIRECT_STATUS || web.LEGACY_REDIRECT_STATUS === '308', 'LEGACY_REDIRECT_STATUS is empty (307) or 308.');
  // Separate hosts (src/lib/hosts.ts, server/src/publicUrls.js): all three or none, the same on both sides.
  const hostKeys = [['NEXT_PUBLIC_STUDIO_URL', 'STUDIO_URL'], ['NEXT_PUBLIC_TOURS_URL', 'TOURS_URL'], ['NEXT_PUBLIC_SITES_DOMAIN', 'SITES_DOMAIN']];
  const set = hostKeys.filter(([w]) => web[w]).length;
  if (set) {
    requireValue(set === 3, 'Set NEXT_PUBLIC_STUDIO_URL, NEXT_PUBLIC_TOURS_URL and NEXT_PUBLIC_SITES_DOMAIN together, or none of them.');
    for (const [w, a] of hostKeys) requireValue(web[w] === api[a], `${a} in api.env must equal ${w} in web.env.`);
    const main = origin ? new URL(origin).hostname : '';
    for (const key of ['NEXT_PUBLIC_STUDIO_URL', 'NEXT_PUBLIC_TOURS_URL']) {
      let ok = false;
      try { const u = new URL(web[key]); ok = u.protocol === 'https:' && u.origin === web[key] && !u.port && !!main && u.hostname.endsWith(`.${main}`); } catch { /* not a URL */ }
      requireValue(ok, `${key} must be an HTTPS subdomain of the site, without a path or trailing slash (e.g. https://studio.${main || 'rcaas.tech'}).`);
    }
    requireValue(!!main && /^[a-z0-9.-]+$/.test(web.NEXT_PUBLIC_SITES_DOMAIN ?? '') && web.NEXT_PUBLIC_SITES_DOMAIN.endsWith(`.${main}`),
      `NEXT_PUBLIC_SITES_DOMAIN must be a bare domain under the site, e.g. sites.${main || 'rcaas.tech'}.`);
    requireValue(web.API_INTERNAL_URL === 'http://127.0.0.1:4000', 'With separate hosts, set API_INTERNAL_URL=http://127.0.0.1:4000 in web.env.');
    warnings.push(`Separate hosts: the proxy must keep the Host header, send /api/* to the API on every host, and serve *.${web.NEXT_PUBLIC_SITES_DOMAIN} with a wildcard certificate.`);
  } else {
    for (const [, a] of hostKeys) requireValue(!api[a], `${a} is set in api.env but the site has no separate hosts.`);
  }
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
