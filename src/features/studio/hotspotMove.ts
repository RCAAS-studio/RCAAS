/** Editor-only selection shared by the DOM inspector and the canvas. Never saved. */
export const hotspotMove = {
  sceneId: '',
  id: null as string | null,
  enabled: false,
  dragging: false,
};

const listeners = new Set<() => void>();
export const subscribeHotspotMove = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};
const emit = () => listeners.forEach((fn) => fn());

export function selectHotspotMove(sceneId: string, id: string | null) {
  if (hotspotMove.sceneId === sceneId && hotspotMove.id === id) return;
  Object.assign(hotspotMove, { sceneId, id, enabled: !!id });
  emit();
}

export function enableHotspotMove(enabled: boolean) {
  hotspotMove.enabled = enabled && !!hotspotMove.id;
  emit();
}

export function setHotspotDragging(dragging: boolean) {
  hotspotMove.dragging = dragging;
  emit();
}
