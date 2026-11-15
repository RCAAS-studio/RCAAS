'use client';

import type React from 'react';
import type { HotspotType } from '../../../@types/hotspot.types';
import { useEffect, useRef, useState } from 'react';


export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ed2-sect">
      <div className="ed2-lbl">{title}</div>
      {children}
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Shown and typed in these units: the box shows value / scale (eye level is
   *  stored in scan units, shown in metres). */
  scale?: number;
  unit?: string;
  /** A typed value may go past the slider's end, up to this (a 20 s flight on a 12 s slider). */
  typedMax?: number;
}

export function Slider({ label, value, min, max, step, onChange, scale = 1, unit = '', typedMax = max }: SliderProps) {
  const decimals = Math.max(0, -Math.floor(Math.log10(step / scale) + 1e-9));
  const shown = (value / scale).toFixed(decimals);
  const [text, setText] = useState(shown);
  useEffect(() => setText(shown), [shown]); // dragged, undone, or another item picked
  const cancelled = useRef(false);
  // Leaving the box saves it, once; Enter just leaves it, Esc leaves it without saving.
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setText(shown); return; }
    const n = parseFloat(text);
    if (!Number.isFinite(n)) { setText(shown); return; }
    const v = Math.min(typedMax, Math.max(min, n * scale));
    onChange(v);
    setText((v / scale).toFixed(decimals));
  };
  return (
    <div className="ed2-slider">
      <span className="ed2-slider-top">
        <span>{label}</span>
        <span className="ed2-slider-val">
          <input type="number" className="ed2-slider-num" aria-label={unit ? `${label} (${unit})` : label}
            value={text} min={min / scale} max={typedMax / scale} step={step / scale}
            onChange={(e) => setText(e.target.value)} onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') { cancelled.current = true; e.currentTarget.blur(); }
            }} />
          {unit}
        </span>
      </span>
      <input type="range" aria-label={label} min={min} max={max} step={step} value={Math.min(max, value)}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="ed2-seg">
      {options.map(([v, l]) => (
        <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button className={`ed2-toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <span className="ed2-toggle-knob" />
      <span>{label}</span>
    </button>
  );
}

export const HS_TYPES: HotspotType[] = ['text', 'image', 'video', 'audio', 'link', 'portal', 'table', 'room', 'hall'];

export const MOVE_STEPS = [0.01, 0.1, 1] as const;

export const TURN_STEPS = [1, 15, 90] as const;

export function StepSize({ value, options, unit, onChange }: {
  value: number; options: readonly number[]; unit: string; onChange: (v: number) => void;
}) {
  return (
    <span className="ed2-stepsize" role="group" aria-label="Step size">
      {options.map((o) => (
        <button key={o} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>{o}{unit}</button>
      ))}
    </span>
  );
}

/** A number field with ‹ › buttons. Press and hold a button to keep stepping. */
export function Stepper({ axis, value, step, digits, unit, onChange }: {
  axis: 'X' | 'Y' | 'Z' | 'S'; value: number; step: number; digits: number; unit: string;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => stop, []);

  const nudge = (dir: 1 | -1) => {
    const next = Number((valueRef.current + dir * step).toFixed(6));
    valueRef.current = next;
    onChange(next);
  };
  const hold = (dir: 1 | -1) => {
    nudge(dir);
    const repeat = (delay: number) => {
      timer.current = setTimeout(() => { nudge(dir); repeat(Math.max(40, delay * 0.85)); }, delay);
    };
    repeat(350);
  };
  const btn = (dir: 1 | -1, label: string) => (
    <button
      className="ed2-step-btn"
      aria-label={`${dir < 0 ? 'Decrease' : 'Increase'} ${axis} by ${step}${unit}`}
      onPointerDown={(e) => { e.preventDefault(); hold(dir); }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nudge(dir); } }}
    >{label}</button>
  );

  return (
    <div className={`ed2-step ed2-step-${axis.toLowerCase()}`}>
      <span className="ed2-step-axis">{axis}</span>
      {btn(-1, '‹')}
      <input
        className="ed2-step-num"
        inputMode="decimal"
        value={draft ?? value.toFixed(digits)}
        onFocus={(e) => { setDraft(value.toFixed(digits)); e.target.select(); }}
        onChange={(e) => {
          setDraft(e.target.value);
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            nudge(e.key === 'ArrowUp' ? 1 : -1);
            setDraft(null);
          }
        }}
      />
      {btn(1, '›')}
      <span className="ed2-step-unit">{unit}</span>
    </div>
  );
}
