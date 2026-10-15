
'use client';

import { useState, type FormEvent } from 'react';
import { changePassword } from '../../lib/api';

type PasswordChangeProps = {
  cls: 'site' | 'ed2';
  email: string;
};

type PasswordChangeState = {
  busy: boolean;
  done: boolean;
  error: string | null;
};

const INITIAL_STATE: PasswordChangeState = {
  busy: false,
  done: false,
  error: null,
};

export function PasswordChange({
  cls,
  email,
}: PasswordChangeProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [state, setState] =
    useState<PasswordChangeState>(INITIAL_STATE);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate submissions.
    if (state.busy) return;

    if (current.length === 0 || next.length < 8 || next.length > 200) {
      setState({
        busy: false,
        done: false,
        error: 'Enter your current password and a new password between 8 and 200 characters.',
      });
      return;
    }

    if (current === next) {
      setState({
        busy: false,
        done: false,
        error: 'Your new password must be different from your current password.',
      });
      return;
    }

    setState({ busy: true, done: false, error: null });

    try {
      await changePassword(current, next);

      setCurrent('');
      setNext('');

      setState({
        busy: false,
        done: true,
        error: null,
      });
    } catch (err: unknown) {
      // Do not expose internal exceptions or server details.
      setState({
        busy: false,
        done: false,
        error:
          err instanceof Error
            ? err.message
            : 'The password could not be changed. Please try again.',
      });
    }
  };

  return (
    <form
      className={`${cls}-pw`}
      onSubmit={submit}
      aria-busy={state.busy}
    >
      <h2>Change password</h2>

      <div>
        <label htmlFor={`${cls}-current-password`}>
          Current password
        </label>
        <input
          id={`${cls}-current-password`}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          disabled={state.busy}
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            setState(INITIAL_STATE);
          }}
        />
      </div>

      <div>
        <label htmlFor={`${cls}-new-password`}>
          New password
        </label>
        <input
          id={`${cls}-new-password`}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={200}
          disabled={state.busy}
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
            setState(INITIAL_STATE);
          }}
        />
      </div>

      <button type="submit" disabled={state.busy}>
        {state.busy ? 'Changing…' : 'Change password'}
      </button>

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={state.error ? 'is-error' : undefined}
      >
        {state.error ??
          (state.done ? 'Password changed successfully.' : '')}
      </p>
    </form>
  );
}
