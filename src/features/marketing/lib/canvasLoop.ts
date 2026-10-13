// Runs a canvas draw function once per frame, but only while it is worth the battery:
// the canvas is on screen, the tab is visible and the visitor has not asked for reduced motion.
// With reduced motion it draws a single still frame. Returns a function that stops the loop.
export function startCanvasLoop(el: Element, draw: (time: number) => void): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let id = 0;
  let running = false;
  let inView = true;

  const frame = (time: number) => {
    draw(time);
    if (running) id = requestAnimationFrame(frame);
  };

  const update = () => {
    const shouldRun = inView && !document.hidden && !reduced;
    if (shouldRun && !running) {
      running = true;
      id = requestAnimationFrame(frame);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(id);
    }
  };

  if (reduced) draw(performance.now());

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  });
  observer.observe(el);
  document.addEventListener('visibilitychange', update);
  update();

  return () => {
    running = false;
    cancelAnimationFrame(id);
    observer.disconnect();
    document.removeEventListener('visibilitychange', update);
  };
}
