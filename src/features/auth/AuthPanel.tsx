
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getSession,
  login,
  requestPasswordReset,
  resetPasswordWith,
  signup,
} from '../../lib/api';
import { Button } from '../../components/ui/Button';

type Mode = 'signin' | 'signup';

const DEFAULT_NEXT = '/studio';
const MAX_PASSWORD_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Allow only same-origin relative paths.
 * Reject protocol-relative URLs, backslashes, control characters,
 * and malformed URLs to prevent open redirects.
 */
function safeNext(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  ) {
    return DEFAULT_NEXT;
  }

  try {
    const url = new URL(value, 'https://local.invalid');

    if (url.origin !== 'https://local.invalid') {
      return DEFAULT_NEXT;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_NEXT;
  }
}

const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

/**
 * Authentication panel.
 *
 * Reads mode, next, and reset from the query string.
 * The login page should provide a Suspense boundary for useSearchParams().
 */
export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode: Mode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const next = safeNext(searchParams.get('next'));

  // Preserve the original reset token if the URL is cleaned up.
  const [resetToken] = useState<string | null>(
    () => searchParams.get('reset'),
  );

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);

  // Already signed in: skip the form.
  useEffect(() => {
    if (resetToken) return;

    let cancelled = false;

    getSession()
      .then((session) => {
        if (!cancelled && session?.authenticated) {
          router.replace(next);
        }
      })
      .catch(() => {
        // An unauthenticated user can continue to the form.
      });

    return () => {
      cancelled = true;
    };
  }, [router, next, resetToken]);

  const switchTo = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setPassword('');
    setAccessCode('');
    setShowPw(false);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setError('');

    try {
      const normalizedEmail = email.trim();

      if (
        !normalizedEmail ||
        normalizedEmail.length > MAX_EMAIL_LENGTH
      ) {
        setError('Enter a valid email address.');
        setBusy(false);
        return;
      }

      if (mode === 'signup') {
        if (!name.trim() || name.length > 80) {
          setError('Enter a valid name of up to 80 characters.');
          setBusy(false);
          return;
        }

        if (
          password.length < MIN_PASSWORD_LENGTH ||
          password.length > MAX_PASSWORD_LENGTH
        ) {
          setError(
            'Your password must be between 8 and 200 characters.',
          );
          setBusy(false);
          return;
        }

        if (!accessCode.trim()) {
          setError('Enter your team access code.');
          setBusy(false);
          return;
        }

        await signup({
          name: name.trim(),
          email: normalizedEmail,
          password,
          accessCode,
        });
      } else {
        if (
          !password ||
          password.length > MAX_PASSWORD_LENGTH
        ) {
          setError('Enter a valid password.');
          setBusy(false);
          return;
        }

        await login(password, normalizedEmail);
      }

      setPassword('');
      setAccessCode('');
      router.replace(next);
    } catch (err) {
      // The API's errors are written for people (wrong code, too many tries);
      // unexpected ones already arrive as a plain sentence (server/src/index.js).
      setError(errorText(err,
        mode === 'signup'
          ? 'Unable to create your account. Check your details and try again.'
          : 'Unable to sign in with those credentials. Please try again.',
      ));
      setBusy(false);
    }
  };

  if (resetToken) {
    return <ResetPanel token={resetToken} />;
  }

  if (forgot) {
    return (
      <ForgotPanel
        initialEmail={email}
        onBack={() => {
          setForgot(false);
          setError('');
        }}
      />
    );
  }

  const isSignup = mode === 'signup';

  return (
    <div className="auth-card">
      <h1 className="auth-title">
        {isSignup ? (
          <>
            Create your <em>studio</em> account
          </>
        ) : (
          <>
            Welcome <em>back</em>
          </>
        )}
      </h1>

      <p className="auth-sub">
        {isSignup
          ? 'For the capture and authoring team. You need the team access code from your studio lead.'
          : 'Sign in to upload captures and author tours.'}
      </p>

      <div
        className="auth-switch"
        role="tablist"
        aria-label="Account"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isSignup}
          className={!isSignup ? 'on' : ''}
          onClick={() => switchTo('signin')}
          disabled={busy}
        >
          Sign in
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={isSignup}
          className={isSignup ? 'on' : ''}
          onClick={() => switchTo('signup')}
          disabled={busy}
        >
          Create account
        </button>

        <span
          className="auth-switch-pill"
          data-side={isSignup ? 'right' : 'left'}
          aria-hidden="true"
        />
      </div>

      <form
        className="auth-form"
        onSubmit={submit}
        aria-busy={busy}
      >
        {isSignup && (
          <label className="auth-field">
            <span>Full name</span>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              maxLength={80}
              placeholder="Your name"
              disabled={busy}
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            maxLength={MAX_EMAIL_LENGTH}
            placeholder="you@company.com"
            disabled={busy}
          />
        </label>

        <label className="auth-field">
          <span>Password</span>

          <span className="auth-pw">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                isSignup ? 'new-password' : 'current-password'
              }
              required
              minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
              maxLength={MAX_PASSWORD_LENGTH}
              placeholder={
                isSignup ? 'At least 8 characters' : 'Your password'
              }
              disabled={busy}
            />

            <button
              type="button"
              onClick={() => setShowPw((value) => !value)}
              aria-pressed={showPw}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              disabled={busy}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>

        {isSignup && (
          <label className="auth-field">
            <span>Team access code</span>
            <input
              name="accessCode"
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              autoComplete="off"
              required
              maxLength={200}
              placeholder="From your studio lead"
              disabled={busy}
            />
          </label>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {!isSignup && (
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setForgot(true);
              setError('');
            }}
            disabled={busy}
          >
            Forgot password?
          </button>
        )}

        <Button
          type="submit"
          variant="primary"
          large
          className="auth-submit"
          disabled={busy}
        >
          {busy
            ? isSignup
              ? 'Creating account…'
              : 'Signing in…'
            : isSignup
              ? 'Create account'
              : 'Sign in'}
        </Button>
      </form>

      <p className="auth-foot">
        {isSignup
          ? 'Already have an account? '
          : 'New to the team? '}

        <button
          type="button"
          className="auth-link"
          onClick={() =>
            switchTo(isSignup ? 'signin' : 'signup')
          }
          disabled={busy}
        >
          {isSignup ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </div>
  );
}

/**
 * Set a password from a one-time reset or invitation link.
 * The backend must enforce token expiry and single-use semantics.
 */
function ResetPanel({ token }: { token: string }) {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Remove the query string from the visible URL without losing the
  // token already captured by AuthPanel.
  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname,
    );
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (busy) return;

    if (
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      setError('Your password must be between 8 and 200 characters.');
      return;
    }

    if (password !== again) {
      setError('The two passwords don’t match.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await resetPasswordWith(token, password);

      setPassword('');
      setAgain('');

      // Assumes the API establishes a valid session on success.
      router.replace('/studio');
    } catch (err) {
      setError(errorText(err,
        'Unable to reset your password. The link may have expired or already been used. Request a new link and try again.',
      ));
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">
        Set your <em>password</em>
      </h1>

      <p className="auth-sub">
        Choose a new password for your account.
      </p>

      <form
        className="auth-form"
        onSubmit={submit}
        aria-busy={busy}
      >
        <label className="auth-field">
          <span>New password</span>

          <span className="auth-pw">
            <input
              name="newPassword"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              placeholder="At least 8 characters"
              disabled={busy}
            />

            <button
              type="button"
              onClick={() => setShowPw((value) => !value)}
              aria-pressed={showPw}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              disabled={busy}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>

        <label className="auth-field">
          <span>Type it again</span>

          <input
            name="confirmPassword"
            type={showPw ? 'text' : 'password'}
            value={again}
            onChange={(e) => setAgain(e.target.value)}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            disabled={busy}
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          large
          className="auth-submit"
          disabled={busy}
        >
          {busy ? 'Saving…' : 'Set password and sign in'}
        </Button>
      </form>
    </div>
  );
}

/**
 * Request a one-time password-reset link.
 * The server must return a generic response regardless of account existence.
 */
function ForgotPanel({
  initialEmail,
  onBack,
}: {
  initialEmail: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (busy) return;

    const normalizedEmail = email.trim();

    if (
      !normalizedEmail ||
      normalizedEmail.length > MAX_EMAIL_LENGTH
    ) {
      setError('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await requestPasswordReset(normalizedEmail);
      setSent(true);
    } catch (err) {
      // e.g. no email set up here: the API says to ask an admin for a link
      setError(errorText(err,
        'Unable to process your request right now. Please try again later.',
      ));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">
        Reset your <em>password</em>
      </h1>

      {sent ? (
        <p className="auth-sub" role="status">
          If this email address has an account, a reset link is on
          its way. The link should work once and expire after 24
          hours. Check your spam folder if it hasn’t arrived in a
          few minutes.
        </p>
      ) : (
        <>
          <p className="auth-sub">
            Enter your account&apos;s email and we&apos;ll send you
            a link to choose a new password.
          </p>

          <form
            className="auth-form"
            onSubmit={submit}
            aria-busy={busy}
          >
            <label className="auth-field">
              <span>Email</span>

              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                maxLength={MAX_EMAIL_LENGTH}
                placeholder="you@company.com"
                disabled={busy}
              />
            </label>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              large
              className="auth-submit"
              disabled={busy}
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </>
      )}

      <p className="auth-foot">
        <button
          type="button"
          className="auth-link"
          onClick={onBack}
          disabled={busy}
        >
          Back to sign in
        </button>
      </p>
    </div>
  );
}
