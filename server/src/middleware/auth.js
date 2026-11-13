/**
 * Editor session auth. CLAUDE.md: "session auth for the editor, signed
 * short-lived tokens for embeds" — this is the session half. A signed,
 * httpOnly cookie carrying the account (routes/auth.js, usersStore.js), or
 * no account for the legacy shared-password sign-in.
 */
import jwt from 'jsonwebtoken';
import { getUserById, passwordChangedAt } from '../usersStore.js';

const SESSION_COOKIE = 'splatspace_session';
const SESSION_TTL = '12h';

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set — see server/.env.example');
  return s;
}

/** `role` is a snapshot for the client to read; anything
 *  that gates an admin-only action re-checks the real, current role via
 *  `requireAdmin` below, so a promotion or demotion takes effect at once
 *  instead of waiting out the session's 12h. */
export function issueSession(res, user) {
  if (!user || typeof user.id !== 'string' || !user.id) {
    throw new Error('Cannot issue an account session without an account.');
  }
  // iatMs: when, to the millisecond — a password reset voids sessions issued before it
  signSession(res, { role: user.role, sub: user.id, name: user.name, email: user.email, iatMs: Date.now() });
}

/** The shared team sign-in (the team access code, no account) sees every client's projects, names
 *  nobody in the activity log and can't be revoked, and its code is the one handed out for sign-up
 *  (2026-11-13, Phase 02). Off in production unless SHARED_TEAM_LOGIN=1; on in development (the API
 *  tests, this PC) unless SHARED_TEAM_LOGIN=0. Off, the cookies it already issued stop counting too. */
export const sharedLoginAllowed = () =>
  process.env.SHARED_TEAM_LOGIN === '1' || (process.env.SHARED_TEAM_LOGIN !== '0' && process.env.NODE_ENV !== 'production');

/** Only the explicit shared-password login can create an unscoped session. */
export function issueLegacySession(res) {
  if (!sharedLoginAllowed()) throw Object.assign(new Error('The shared team sign-in is switched off.'), { status: 403 });
  signSession(res, { role: 'admin' });
}

function signSession(res, claims) {
  const token = jwt.sign(claims, secret(), { expiresIn: SESSION_TTL });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000
  });
}

export function clearSession(res) {
  res.clearCookie(SESSION_COOKIE);
}

export function readSession(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  try {
    const claims = jwt.verify(token, secret(), { algorithms: ['HS256'] });
    // An account-less (shared team) session counts only while that sign-in is allowed.
    return claims.sub || sharedLoginAllowed() ? claims : null;
  } catch {
    return null;
  }
}

/** Why a signed-in session no longer counts, or null if it does: its account
 *  was removed, or its password changed after it was issued (a reset signs
 *  out everywhere). The legacy passwordless session has no account. */
export async function staleReason(session) {
  if (!session.sub) return null;
  const changed = await passwordChangedAt(session.sub);
  if (changed === undefined) return 'Your account was removed. Ask an admin if that’s a mistake.';
  if (changed && changed > (session.iatMs ?? session.iat * 1000)) return 'Your password was changed. Sign in again.';
  return null;
}

/** Blocks the request unless it carries a valid editor session cookie. */
export function requireEditorSession(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Sign in to the editor first.' });
  staleReason(session).then((why) => {
    if (why) { clearSession(res); return res.status(401).json({ error: why }); }
    req.session = session;
    next();
  }, next);
}

/** Blocks the request unless the session belongs to an admin, checked fresh
 *  against the account (not the JWT claim — see issueSession) so a change
 *  in role never waits out an old cookie. The legacy passwordless session
 *  (no `sub`) has always had full access and stays admin. */
export async function requireAdmin(req, res, next) {
  try {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Sign in to the editor first.' });
  const why = await staleReason(session);
  if (why) { clearSession(res); return res.status(401).json({ error: why }); }
  if (session.sub) {
    const user = await getUserById(session.sub);
    if (!user) return res.status(401).json({ error: 'Your account no longer exists.' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Only an admin can do that.' });
  }
  req.session = session;
  next();
  } catch (err) { next(err); }
}
