'use client';
/**
 * The studio's own confirm and prompt (2026-11-03), in place of the browser's
 * grey window.confirm/prompt: the button names the action ("Delete Basera"),
 * red when it destroys something; Esc or the backdrop cancels, Enter confirms,
 * Tab stays inside, and focus goes back where it was. Mounted inside the
 * studio's .ed2 root when there is one, so it takes the studio's theme.
 *
 *   if (!(await ask({ title: 'Delete the project?', body: '…', action: 'Delete it', danger: true }))) return;
 *   const name = await askText({ title: 'Name the project', label: 'Name', value: 'Demo' }); // null = cancelled
 */
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './ask.css';

type Opts = { title: string; body?: string; action: string; cancel?: string; danger?: boolean };
type TextOpts = Omit<Opts, 'action' | 'danger'> & { label: string; value?: string; action?: string };

function open<T>(render: (done: (v: T) => void) => React.ReactNode): Promise<T> {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    (document.querySelector('.ed2') ?? document.body).appendChild(host);
    const back = document.activeElement as HTMLElement | null;
    const root = createRoot(host);
    root.render(render((v) => {
      root.unmount();
      host.remove();
      back?.focus?.();
      resolve(v);
    }));
  });
}

function Box({ o, done, field }: { o: Opts; done: (ok: boolean, text?: string) => void; field?: { label: string; value: string } }) {
  const box = useRef<HTMLFormElement>(null);
  const [text, setText] = useState(field?.value ?? '');
  useEffect(() => {
    const first = box.current?.querySelector<HTMLElement>(field ? 'input' : '.ask-go');
    first?.focus();
    if (field) (first as HTMLInputElement | undefined)?.select();
  }, [field]);
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); }
    if (e.key !== 'Tab') return;
    const all = [...(box.current?.querySelectorAll<HTMLElement>('input, button') ?? [])];
    const i = all.indexOf(document.activeElement as HTMLElement);
    const to = e.shiftKey ? (i <= 0 ? all.length - 1 : i - 1) : (i === all.length - 1 ? 0 : i + 1);
    e.preventDefault();
    all[to]?.focus();
  };
  return (
    <div className="ask-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) done(false); }}>
      <form ref={box} className="ask" role="alertdialog" aria-modal="true" aria-labelledby="ask-t" aria-describedby={o.body ? 'ask-b' : undefined}
        onKeyDown={key} onSubmit={(e) => { e.preventDefault(); if (!field || text.trim()) done(true, text.trim()); }}>
        <h2 id="ask-t">{o.title}</h2>
        {o.body && <p id="ask-b">{o.body}</p>}
        {field && (
          <label className="ask-field"><span>{field.label}</span>
            <input value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
          </label>
        )}
        <div className="ask-row">
          <button type="button" className="ask-no" onClick={() => done(false)}>{o.cancel ?? 'Cancel'}</button>
          <button type="submit" className={`ask-go${o.danger ? ' is-danger' : ''}`} disabled={!!field && !text.trim()}>{o.action}</button>
        </div>
      </form>
    </div>
  );
}

export const ask = (o: Opts) => open<boolean>((done) => <Box o={o} done={(ok) => done(ok)} />);

export const askText = (o: TextOpts) =>
  open<string | null>((done) => <Box o={{ ...o, action: o.action ?? 'Save' }} field={{ label: o.label, value: o.value ?? '' }} done={(ok, t) => done(ok ? t ?? '' : null)} />);

/** A short note that something saved or happened, at the foot of the screen, read out by
 *  screen readers; one at a time, gone after 3.5 s. */
export function toast(text: string) {
  document.querySelectorAll('.ui-toast').forEach((el) => el.remove());
  const el = document.createElement('div');
  el.className = 'ui-toast';
  el.setAttribute('role', 'status');
  el.textContent = text;
  (document.querySelector('.ed2') ?? document.body).appendChild(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); }, 3500);
}
