import { useEffect, useRef } from 'react';

/** Decorative company-site layer. Pointer events pass through; frames stop
 * when the pointer settles, and touch/reduced-motion visitors get a static grid. */
export function CompanyGrid() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(pointer: fine)');
    let frame = 0;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let targetX = x, targetY = y;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      element.dataset.active = 'false';
    };
    const draw = () => {
      x += (targetX - x) * .16;
      y += (targetY - y) * .16;
      element.style.setProperty('--grid-x', `${x}px`);
      element.style.setProperty('--grid-y', `${y}px`);
      element.style.setProperty('--grid-shift-x', `${(x / window.innerWidth - .5) * 12}px`);
      element.style.setProperty('--grid-shift-y', `${(y / window.innerHeight - .5) * 12}px`);
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .2) frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches || event.pointerType === 'touch' || document.hidden) return;
      targetX = event.clientX;
      targetY = event.clientY;
      element.dataset.active = 'true';
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) stop(); };
    const visibility = () => { if (document.hidden) stop(); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', stop);
    fine.addEventListener('change', stop);
    return () => {
      stop();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', stop);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', stop);
      fine.removeEventListener('change', stop);
    };
  }, []);
  return <div ref={layer} className="company-grid" aria-hidden="true"><span className="company-grid-halo" /></div>;
}
