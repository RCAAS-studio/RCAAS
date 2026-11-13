import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL = '';
process.env.SESSION_SECRET = randomBytes(32).toString('hex');
const { issueSession, issueLegacySession, readSession, sharedLoginAllowed } = await import('../src/middleware/auth.js');

test('a missing account can never become an unrestricted legacy session', () => {
  let issued = false;
  const response = { cookie: () => { issued = true; } };
  for (const user of [null, undefined, {}, { id: '' }]) {
    assert.throws(() => issueSession(response, user), /without an account/);
  }
  assert.equal(issued, false);
});

test('account cookies carry a subject and secure production attributes', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    let cookie;
    issueSession({ cookie: (...args) => { cookie = args; } }, { id: 'account-id', role: 'editor', name: 'Test', email: 'test@example.test' });
    assert.equal(cookie[0], 'splatspace_session');
    assert.equal(cookie[2].httpOnly, true);
    assert.equal(cookie[2].secure, true);
    assert.equal(cookie[2].sameSite, 'lax');
    const claims = readSession({ cookies: { [cookie[0]]: cookie[1] } });
    assert.equal(claims.sub, 'account-id');
    assert.equal(claims.role, 'editor');
    assert.ok(Number.isFinite(claims.iatMs));
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

test('legacy sessions require explicit issuance and other signing algorithms are refused', () => {
  let cookie;
  issueLegacySession({ cookie: (...args) => { cookie = args; } });
  assert.equal(readSession({ cookies: { [cookie[0]]: cookie[1] } }).role, 'admin');
  const token = jwt.sign({ role: 'admin' }, process.env.SESSION_SECRET, { algorithm: 'HS384' });
  assert.equal(readSession({ cookies: { splatspace_session: token } }), null);
});

// Phase 02 (2026-11-13): the shared team sign-in sees every client's projects; production refuses it.
test('the shared team sign-in is off in production unless SHARED_TEAM_LOGIN=1, and its cookies stop counting', () => {
  const saved = { env: process.env.NODE_ENV, flag: process.env.SHARED_TEAM_LOGIN };
  const set = (env, flag) => {
    if (env === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = env;
    if (flag === undefined) delete process.env.SHARED_TEAM_LOGIN; else process.env.SHARED_TEAM_LOGIN = flag;
  };
  try {
    const legacy = jwt.sign({ role: 'admin' }, process.env.SESSION_SECRET, { algorithm: 'HS256' });
    const account = jwt.sign({ role: 'editor', sub: 'account-id', iatMs: Date.now() }, process.env.SESSION_SECRET, { algorithm: 'HS256' });
    const read = (token) => readSession({ cookies: { splatspace_session: token } });
    for (const [env, flag, allowed] of [['production', undefined, false], ['production', '0', false], ['production', '1', true],
      [undefined, undefined, true], ['development', '0', false], ['test', '1', true]]) {
      set(env, flag);
      assert.equal(sharedLoginAllowed(), allowed, `${env} ${flag}`);
      assert.equal(read(legacy)?.role ?? null, allowed ? 'admin' : null, `legacy cookie, ${env} ${flag}`);
      assert.equal(read(account)?.sub, 'account-id', 'account sessions are unaffected');
      if (allowed) issueLegacySession({ cookie: () => {} });
      else assert.throws(() => issueLegacySession({ cookie: () => assert.fail('no cookie may be set') }), /switched off/);
    }
  } finally { set(saved.env, saved.flag); }
});
