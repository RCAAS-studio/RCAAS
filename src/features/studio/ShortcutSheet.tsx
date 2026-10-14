'use client';

import { useEffect, useState } from 'react';
import { isTypingTarget } from '../scene/useLccWalker';

/** Every key the editor answers to (useLccWalker, Gizmo, history, EditorShell).
 *  Change a key there, change it here. */
const KEYS: [group: string, rows: [keys: string, what: string][]][] = [
  ['Moving', [
    ['W A S D / arrows', 'Move'],
    ['Shift', 'Faster'],
    ['N', 'Switch walking and flying'],
    ['Space / C', 'Up / down while flying'],
    ['Drag', 'Look around'],
    ['Scroll', 'Dolly in and out'],
  ]],
  ['Adding', [
    ['H', 'A hotspot where the centre dot is'],
    ['B', 'Drop a waypoint at the camera'],
    ['V', 'Save the dropped waypoints as a camera track'],
  ]],
  ['Measuring', [
    ['M', 'Measure: click two points for a line, again for more'],
    ['Drag', 'A point of a line to move it'],
    ['Delete', 'Remove the selected line'],
    ['Esc', 'Drop a half-made line, then stop measuring'],
  ]],
  ['Marking the floor plan (Floor plan → Help the plan)', [
    ['Click', 'A corner, or a side of a door or window'],
    ['Enter', 'The point under the centre dot'],
    ['Backspace', 'Undo the last point'],
    ['Esc', 'Drop the mark being made, then stop'],
  ]],
  ['Selecting', [
    ['Click', 'A hotspot or a collision box in the 3D view'],
    ['Esc', 'Back to the scene'],
    ['F2', 'Rename the space in focus in the list'],
  ]],
  ['Model placement', [
    ['G / R / T', 'Move / turn / scale arrows'],
    ['Esc', 'Put the arrows away'],
  ]],
  ['Editing', [
    ['Ctrl Z', 'Undo'],
    ['Ctrl Y / Ctrl Shift Z', 'Redo'],
    ['↑ ↓ in a number box', 'Nudge the value'],
    ['Enter / Esc in a number box', 'Save / cancel'],
  ]],
];

/** "?" (outside a text box) or the strip's button opens the list; Esc or "?" closes it. */
export function ShortcutSheet() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === '?') setOpen((v) => !v);
      else if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return (
    <>
      <button className="ed2-keys-btn" onClick={() => setOpen(true)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">?</button>
      {open && (
        <div className="np-scrim" onClick={() => setOpen(false)}>
          <div className="pl-dialog pl-dialog-wide" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={(e) => e.stopPropagation()}>
            <header className="np-head">
              <h2>Keyboard shortcuts</h2>
              <button className="np-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </header>
            <div className="pl-dialog-body ed2-keys">
              {KEYS.map(([group, rows]) => (
                <section key={group}>
                  <h3>{group}</h3>
                  <dl>
                    {rows.map(([k, what]) => (
                      <div key={group + k}><dt><kbd>{k}</kbd></dt><dd>{what}</dd></div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
