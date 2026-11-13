'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { hotspotsFor, subscribeDoc, updateHotspot } from '../scene/sceneDoc';
import { gizmo, subscribeTransform } from '../scene/transform';
import { beginHistoryGroup } from './history';
import { createHotspotControls } from './hotspotControls';
import { hotspotMove, setHotspotDragging, subscribeHotspotMove } from './hotspotMove';

/** Mounted only in the studio, never in Preview or the public tour. */
export function HotspotGizmo({ sceneId }: { sceneId: string }) {
  const { camera, scene, gl } = useThree();
  useEffect(() => {
    const handles = createHotspotControls({
      camera, scene, element: gl.domElement,
      target: () => hotspotMove.sceneId === sceneId && hotspotMove.enabled && gizmo.mode === 'off'
        ? hotspotsFor(sceneId).find((h) => h.id === hotspotMove.id) ?? null : null,
      write: (id, position) => updateHotspot(sceneId, id, { position }),
      begin: () => beginHistoryGroup(sceneId),
      dragging: (active) => { gizmo.dragging = active; setHotspotDragging(active); },
    });
    const offs = [subscribeHotspotMove(handles.sync), subscribeDoc(handles.sync), subscribeTransform(handles.sync)];
    return () => { offs.forEach((off) => off()); handles.dispose(); };
  }, [camera, scene, gl, sceneId]);
  return null;
}
