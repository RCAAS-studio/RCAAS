/**
 * Shared mobile-input state.
 *
 * The joystick / look-layer / jump button live in the DOM (outside <Canvas>),
 * and the walker reads input inside a useFrame. React state at 60 fps would
 * re-render the tree every frame, so this is a plain mutable module object that
 * both sides poke directly — the same trick the codebase already uses for
 * camera refs.
 *
 *   move : analog stick, each axis -1..1 (y = forward)
 *   look : look delta in px, ACCUMULATED by the look layer, ZEROED by the
 *          walker every frame after it consumes it
 *   jump : one-shot, set by the button, cleared by the walker
 *   run  : held while the run toggle is on
 */
import type { TouchState } from '../../@types/config.types';

export const touch: TouchState = {
  enabled: false, // true once we detect a coarse pointer
  move: { x: 0, y: 0 },
  look: { dx: 0, dy: 0 },
  jump: false,
  run: false
};

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = (q: string) => !!window.matchMedia?.(q).matches;
  // A phone or tablet: its main pointer is a finger, or it has no mouse or
  // trackpad at all. Merely supporting touch isn't enough (2026-10-14): touch
  // laptops, and many Windows PCs that report touch, have a mouse, and got the
  // joystick and touch hints instead of the mouse's controls.
  return mq('(pointer: coarse)') || (!mq('(any-pointer: fine)') && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
}
