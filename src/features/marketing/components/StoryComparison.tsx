import React, { useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { withBase } from '../../../lib/basePath';

/** A presentation concept using one real still, never a fictitious dated pair. */
export function StoryComparison() {
  const [position, setPosition] = useState(50);
  const image = withBase('/media/hero.jpg');
  const moveDivider = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width > 0) setPosition(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))));
  };
  return (
    <figure className="story-comparison">
      <div className="story-comparison-stage" aria-hidden="true"
        onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); moveDivider(event); }}
        onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveDivider(event); }}
        onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
        onPointerCancel={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
        <img src={image} alt="" width="1600" height="900" loading="lazy" className="story-comparison-muted" data-fx="seen" draggable={false} />
        <div className="story-comparison-reveal" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={image} alt="" width="1600" height="900" loading="lazy" data-fx="seen" draggable={false} />
        </div>
        <span className="story-comparison-label story-comparison-colour">Colour treatment</span>
        <span className="story-comparison-label story-comparison-original">Muted treatment</span>
        <div className="story-comparison-divider" style={{ left: `${position}%` }}><ChevronsLeftRight size={18} /></div>
      </div>
      <label htmlFor="story-comparison-range">Explore the comparison concept <output htmlFor="story-comparison-range">{position}% colour</output></label>
      <input id="story-comparison-range" type="range" min="0" max="100" value={position}
        aria-describedby="story-comparison-note" aria-valuetext={`${position}% colour treatment, ${100 - position}% muted treatment`}
        onChange={event => setPosition(Number(event.target.value))} />
      <figcaption id="story-comparison-note">Two colour treatments of the same Chilancho capture. This demonstrates the slider interaction; it is not a dated before/after record or evidence of restoration or survey accuracy.</figcaption>
    </figure>
  );
}
