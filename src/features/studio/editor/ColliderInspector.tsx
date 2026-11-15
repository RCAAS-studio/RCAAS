'use client';

import { useState } from "react";
import { updateCollider } from "../../scene/sceneDoc";
import type { EditorApi } from "../../../@types/app.types";
import type { Collider } from "../../../@types/scene.types";
import { Section } from "./controls";
import { MOVE_STEPS, StepSize, Stepper } from './controls';

/** An invisible wall or floor for where the scan has holes: visitors walk
 *  into it or stand on it, and never see it. The colour is the studio's only. */
export function ColliderInspector({ ed, c, sceneId, onDelete }: {
  ed: EditorApi; c: Collider; sceneId: string; onDelete: () => void;
}) {
  const [step, setStep] = useState<number>(0.1);
  const set = (patch: Partial<Collider>) => updateCollider(sceneId, c.id, patch);
  const setAxis = (key: 'position' | 'size', i: number, v: number) => {
    const next = [...c[key]] as [number, number, number];
    next[i] = key === 'size' ? Math.max(0.05, v) : v;
    set({ [key]: next });
  };

  return (
    <>
      <Section title="Collision box">
        <input className="ed2-name" value={c.label} onChange={(e) => set({ label: e.target.value })} />
        <div className="ed2-row" style={{ marginTop: 6 }}>
          <input type="color" value={c.color} onChange={(e) => set({ color: e.target.value })} />
          <span className="ed2-muted">colour in the studio · invisible in the tour</span>
        </div>
        <p className="ed2-muted ed2-fine">
          Visitors can&apos;t walk through it and can stand on it. Use it where the scan has holes: a missing wall, a gap in the floor.
        </p>
      </Section>

      <Section title="Placement">
        <p className="ed2-muted ed2-fine">It stays where it is until you move it: drag the arrows in the view, or aim the centre dot at the wall or floor and press Move to the dot.</p>
        <div className="ed2-row">
          <button onClick={() => ed.placeColliderAtCamera(c.id)}>Move to the dot</button>
        </div>
        <div className="ed2-xform-head">
          <span>Position</span>
          <StepSize value={step} options={MOVE_STEPS} unit="m" onChange={setStep} />
        </div>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <Stepper key={axis} axis={axis} value={c.position[i]} step={step} digits={3} unit="m"
            onChange={(v) => setAxis('position', i, v)} />
        ))}
        <div className="ed2-xform-head"><span>Size (width, height, depth)</span></div>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <Stepper key={axis} axis={axis} value={c.size[i]} step={step} digits={3} unit="m"
            onChange={(v) => setAxis('size', i, v)} />
        ))}
        <div className="ed2-xform-head"><span>Turn</span></div>
        <Stepper axis="Y" value={c.yaw} step={15} digits={1} unit="°"
          onChange={(v) => set({ yaw: v })} />
      </Section>

      <div className="ed2-row ed2-viewactions">
        <button className="ed2-del" onClick={onDelete}>🗑 Delete collision box</button>
      </div>
    </>
  );
}
