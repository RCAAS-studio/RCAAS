// pg_dump/pg_restore do not expand a URI supplied as the PGDATABASE default.
// Supply libpq's connection fields separately, keeping credentials off argv.
export function postgresEnv(connectionString, caFile, inherited = process.env) {
  const fail = () => { throw new Error('Invalid PostgreSQL backup connection settings. Use a postgres:// or postgresql:// URL with a host and database.'); };
  let url;
  try { url = new URL(connectionString); } catch { fail(); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.hash || url.pathname.length < 2) fail();
  const env = { ...inherited };
  // Avoid machine-level connection settings selecting a different database,
  // user, service or TLS policy. PGPASSFILE remains available for passwordless URLs.
  for (const key of Object.keys(env)) {
    if (/^PG(?:HOST|HOSTADDR|PORT|DATABASE|USER|PASSWORD|SERVICE|SERVICEFILE|SSLMODE|SSLROOTCERT|SSLCERT|SSLKEY|SSLCRL|OPTIONS|CONNECT_TIMEOUT|APPNAME|CHANNELBINDING|TARGETSESSIONATTRS|GSSENCMODE)$/i.test(key)) delete env[key];
  }
  try {
    Object.assign(env, {
      PGHOST: decodeURIComponent(url.hostname).replace(/^\[|\]$/g, ''),
      PGPORT: url.port || '5432',
      PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGCONNECT_TIMEOUT: '15'
    });
  } catch { fail(); }
  const params = {
    sslmode: 'PGSSLMODE', sslrootcert: 'PGSSLROOTCERT', sslcert: 'PGSSLCERT', sslkey: 'PGSSLKEY', sslcrl: 'PGSSLCRL',
    application_name: 'PGAPPNAME', options: 'PGOPTIONS', connect_timeout: 'PGCONNECT_TIMEOUT',
    channel_binding: 'PGCHANNELBINDING', target_session_attrs: 'PGTARGETSESSIONATTRS', gssencmode: 'PGGSSENCMODE'
  };
  for (const [key, value] of url.searchParams) {
    if (!Object.hasOwn(params, key)) fail();
    env[params[key]] = value;
  }
  if (caFile) Object.assign(env, { PGSSLROOTCERT: caFile, PGSSLMODE: 'verify-full' });
  return env;
}
