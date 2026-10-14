import type { Viewpoint } from './viewpoint.types';
import type { Hotspot, HotspotType } from './hotspot.types';
import type { Collider } from './scene.types';

/** Editor commands exposed by App.jsx's <Stage>, consumed by EditorShell and
 *  the viewer's own preview path. Kept loose (return types vary by call site)
 *  since this is an internal authoring bridge, not a public API. */
export interface EditorApi {
  snapshot: () => string | undefined;
  getPose: () => { x: number; y: number; z: number; yaw: number };
  copySpawn: () => void;
  setSceneSpawn: () => void;
  setBackground: (hex: string) => void;
  newViewFromPose: (label?: string) => Viewpoint;
  updateViewToCurrent: (id: string) => void;
  appendWpTo: (id: string) => void;
  removeWpFrom: (id: string, i: number) => void;
  /** Put waypoint i where the camera is now (the rest of the path stays). */
  setWpTo: (id: string, i: number) => void;
  /** Take the camera to waypoint i, looking where it looks. */
  goToWp: (id: string, i: number) => void;
  renameView: (id: string, label: string) => void;
  setViewSeconds: (id: string, seconds: number) => void;
  removeViewpoint: (id: string) => void;
  play: (vp: Viewpoint) => void;
  /** `onEnd` fires once when the sequence stops for any reason other than
   *  a new sequence replacing it — an interruption, or stopSequence(). */
  playSequence: (list: Viewpoint[], opts?: { onIndex?: (i: number) => void; onEnd?: () => void }) => void;
  stopSequence: () => void;
  exportAll: () => string;
  addHotspot: (type: HotspotType) => Hotspot | undefined;
  updateHotspot: (id: string, patch: Partial<Hotspot>) => void;
  removeHotspot: (id: string) => void;
  placeHotspotAtCamera: (id: string) => void;
  lookAtHotspot: (id: string) => void;
  /** Collision boxes: the ones that need the camera. Edits go straight to sceneDoc. */
  addCollider: () => Collider;
  placeColliderAtCamera: (id: string) => void;
  exportScene: () => string;
  resetTransform: () => void;
  /** Moves the model so the floor under the camera sits at y = 0. Returns a
   *  sentence for the inspector to show. */
  dropToFloor: () => string;
  /** The point of the scan under a spot on screen (px from the canvas's top left), or null. */
  surfaceAt: (x: number, y: number) => [number, number, number] | null;
  /** Where a point in the space shows on screen (px), and whether it is in front of the camera. */
  toScreen: (p: [number, number, number]) => { x: number; y: number; front: boolean };
  /** A point in the space ↔ the scan's own frame (Z-up metres, the floor plan's), through the
   *  scan's root, so marks stay put when the model is moved. Null with no scan loaded. */
  toScan: (p: [number, number, number]) => [number, number, number] | null;
  fromScan: (p: [number, number, number]) => [number, number, number] | null;
  /** Fly to stand in front of a hotspot, facing it (the concierge's "take me there"). */
  goToHotspot: (id: string) => void;
}

/** The state object App.jsx's <Stage> reports up to Viewer / EditorShell. */
export interface ViewerState {
  activeId: string;
  activeName: string;
  tagline: string;
  loading: boolean;
  progress: number;
  ready: boolean;
  /** The current space's model didn't load (missing files, network error). */
  failed: boolean;
  unitScale: number;
  flying: boolean;
  viewpoints: Viewpoint[];
  select: (sceneId: string) => void;
  /** Open the day or night version of this space, staying where you stand. */
  selectKeepingView: (sceneId: string) => void;
  playViewport: (vp: Viewpoint) => void;
  stopFly: () => void;
  /** Fly mode: re-frame the aerial view on the middle of the space. */
  flyReset: () => void;
  /** Glide into the open space's start view from where it was first seen (App.tsx standBack). Once per space load; a no-op after. */
  arrive: () => void;
  editor: EditorApi;
}
