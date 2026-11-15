'use client';

import { useEffect, useReducer, useState } from "react";
import { transformFor, setTransform, subscribeTransform, gizmo, setGizmoMode } from "../../scene/transform";
import type { ViewerState } from "../../../@types/app.types";
import { Section, Segmented } from "./controls";
import { MOVE_STEPS, TURN_STEPS, StepSize, Stepper } from './controls';

/** Move / rotate / scale the model (§7.2): gizmo tool, exact numbers, and
 *  ‹ › steppers that repeat while held. Numbers are the saved transform. */
export function PlacementSection({ state }: { state: ViewerState }) {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => subscribeTransform(bump), []);
  const [moveStep, setMoveStep] = useState<number>(0.1);
  const [turnStep, setTurnStep] = useState<number>(15);
  const [note, setNote] = useState('');
  const id = state.activeId;
  const t = transformFor(id);

  const setAxis = (key: 'position' | 'rotation', i: number, value: number) => {
    const next = [...t[key]] as [number, number, number];
    next[i] = value;
    setTransform(id, { [key]: next });
  };

  return (
    <Section title="Model placement">
      <Segmented
        value={gizmo.mode}
        options={[['off', 'Off'], ['translate', 'Move'], ['rotate', 'Rotate'], ['scale', 'Scale']] as const}
        onChange={(m) => setGizmoMode(m)}
      />
      <p className="ed2-muted ed2-fine">
        Drag the handles in the view. <b>G</b> move, <b>R</b> rotate, <b>T</b> scale, <b>Esc</b> off. Hold <b>Ctrl</b> to snap.
      </p>

      <div className="ed2-xform-head">
        <span>Position</span>
        <StepSize value={moveStep} options={MOVE_STEPS} unit="m" onChange={setMoveStep} />
      </div>
      {(['X', 'Y', 'Z'] as const).map((axis, i) => (
        <Stepper key={axis} axis={axis} value={t.position[i]} step={moveStep} digits={3} unit="m"
          onChange={(v) => setAxis('position', i, v)} />
      ))}

      <div className="ed2-xform-head">
        <span>Rotation</span>
        <StepSize value={turnStep} options={TURN_STEPS} unit="°" onChange={setTurnStep} />
      </div>
      {(['X', 'Y', 'Z'] as const).map((axis, i) => (
        <Stepper key={axis} axis={axis} value={t.rotation[i]} step={turnStep} digits={1} unit="°"
          onChange={(v) => setAxis('rotation', i, v)} />
      ))}

      <div className="ed2-xform-head"><span>Scale</span></div>
      <Stepper axis="S" value={t.scale} step={0.01} digits={3} unit="×"
        onChange={(v) => setTransform(id, { scale: v })} />

      <div className="ed2-row">
        <button onClick={() => setNote(state.editor.dropToFloor())}>Floor to 0 m</button>
        <button onClick={() => { state.editor.resetTransform(); setNote('Placement reset.'); }}>Reset</button>
      </div>
      {note && <p className="ed2-muted ed2-fine">{note}</p>}
      <p className="ed2-muted ed2-fine">
        Place the model first. Moving it later doesn&apos;t move tracks, hotspots or the start view you already set.
      </p>
    </Section>
  );
}
