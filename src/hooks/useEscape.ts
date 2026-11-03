import { useEffect, useRef } from 'react';

/**
 * Esc closes the topmost open panel (2026-11-03). Every open panel joins a
 * stack and only the last one opened takes the key, so Esc on a card over a
 * dialog closes the card first. A key another handler already used (the
 * confirm box, the measure tool) is left alone.
 */
const stack: (() => void)[] = [];

export function useEscape(onClose: (() => void) | undefined, active = true) {
  const latest = useRef(onClose);
  useEffect(() => { latest.current = onClose; });
  useEffect(() => {
    if (!active) return;
    const close = () => latest.current?.();
    stack.push(close);
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || stack[stack.length - 1] !== close) return;
      e.preventDefault();
      close();
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      stack.splice(stack.indexOf(close), 1);
    };
  }, [active]);
}
