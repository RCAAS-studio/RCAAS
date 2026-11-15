'use client';

import { useCallback, useEffect, useReducer, useState } from "react";
import { gizmo, setGizmoMode } from "../scene/transform";
import { renameScene } from "../scene/scenes";
import { walkerCfg } from "../scene/walkerConfig";
import { subscribeViewpoints } from "../scene/viewpoints";
import { subscribeHistory, watchHistory } from "./history";
import { hotspotsFor, subscribeDoc, hasUnsavedChanges, collidersFor, removeCollider, selectCollider, colliderUi, hotspotUi, setUnitScale } from "../scene/sceneDoc";
import { MeasureTool } from "../scene/MeasureTool";
import { PlanMarker, type PlanTool } from "./PlanMarker";
import { isTypingTarget } from "../scene/useLccWalker";
import { uiConfig, setUiConfig, useUiConfig } from "../../lib/uiConfig";
import { HotspotMarkers } from "../hotspots/HotspotMarkers";
import { ShortcutSheet } from "./ShortcutSheet";
import { hotspotMove, selectHotspotMove, subscribeHotspotMove } from "./hotspotMove";
import { Uploader } from "./Uploader";
import type { ViewerState } from "../../@types/app.types";
import type { HotspotType } from "../../@types/hotspot.types";
import type { Property } from "../../@types/scene.types";
import './editor.css';
import { Section, Segmented, Toggle } from "./editor/controls";
import { SceneTree, Filmstrip } from './editor/SceneTree';
import { HotspotInspector } from './editor/HotspotInspector';
import { ColliderInspector } from './editor/ColliderInspector';
import { TrackInspector } from './editor/TrackInspector';
import { WorldInspector } from './editor/SceneInspector';
import { CopyToSpaces } from './editor/DraftControls';
import { TopBar, LeaveGuard } from './editor/EditorTopBar';
import type { Selection, Pose } from './editor/types';

/* ================================================================= */

export function EditorShell({ state, property, onPreview }: {
  state: ViewerState | null;
  property?: Property;
  onPreview: () => void;
}) {
  const [pane, setPane] = useState<'scene' | 'look'>('scene');
  const [sel, setSel] = useState<Selection | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [editTick, bump] = useReducer((n) => n + 1, 0);
  useUiConfig();

  useEffect(() => subscribeViewpoints(bump), []);
  useEffect(() => subscribeDoc(bump), []);
  useEffect(() => subscribeHistory(bump), []);
  useEffect(() => subscribeHotspotMove(bump), []);
  const activeId = state?.activeId;
  useEffect(() => (activeId ? watchHistory(activeId) : undefined), [activeId]);
  const [copying, setCopying] = useState(false);
  // Measure (MeasureTool): the top bar's ruler, or M outside a text box
  const [measuring, setMeasuring] = useState(false);
  const closeMeasure = useCallback(() => setMeasuring(false), []);
  // Marks for the floor plan (PlanMarker): one click tool at a time, so measuring ends it
  const [planTool, setPlanTool] = useState<PlanTool | null>(null);
  const closePlanTool = useCallback(() => setPlanTool(null), []);
  useEffect(() => { if (measuring) setPlanTool(null); }, [measuring]);
  useEffect(() => { if (planTool) setMeasuring(false); }, [planTool]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) setMeasuring((v) => !v);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    if (!state?.editor) return;
    const id = setInterval(() => setPose(state.editor.getPose()), 160);
    return () => clearInterval(id);
  }, [state?.editor]);

  // Drop a selection that no longer exists (deleted, or scene switched).
  useEffect(() => {
    if (!state || !sel) return;
    const inTracks = (state.viewpoints || []).some((v) => v.id === sel.id);
    const inHs = hotspotsFor(state.activeId).some((h) => h.id === sel.id)
      || collidersFor(state.activeId).some((c) => c.id === sel.id);
    if (!inTracks && !inHs) setSel(null);
  }, [state, sel, editTick]);

  // The view's move arrows follow the selected hotspot or collision box; the model's
  // own gizmo steps aside so the two sets of handles never overlap.
  useEffect(() => {
    const id = sel?.type === 'collider' ? sel.id : null;
    selectCollider(id);
    const hotspotId = sel?.type === 'hotspot' && !measuring && !planTool ? sel.id : null;
    if ((id || hotspotId) && gizmo.mode !== 'off') setGizmoMode('off');
    selectHotspotMove(activeId ?? '', hotspotId);
    return () => { selectCollider(null); selectHotspotMove('', null); };
  }, [sel, activeId, measuring, planTool]);

  // A box clicked in the 3D view opens it, as picking it from the tree does;
  // a hotspot added with H opens like one added from the tree.
  useEffect(() => {
    colliderUi.onPick = (id) => setSel({ type: 'collider', id });
    hotspotUi.onAdd = (id) => setSel({ type: 'hotspot', id });
    return () => { colliderUi.onPick = undefined; hotspotUi.onAdd = undefined; };
  }, []);

  // Esc (outside a text box) goes back to the Scene/Look panes.
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isTypingTarget(e.target)) setSel(null); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  if (!state) return <div className="ed2-boot">Loading editor…</div>;

  const ed = state.editor;
  const dirty = hasUnsavedChanges(state.activeId);
  const tracks = state.viewpoints || [];
  const hotspots = hotspotsFor(state.activeId);
  const colliders = collidersFor(state.activeId);
  const selHotspot = sel?.type === 'hotspot' ? hotspots.find((h) => h.id === sel.id) : null;
  const selTrack = sel?.type === 'track' ? tracks.find((t) => t.id === sel.id) : null;
  const selCollider = sel?.type === 'collider' ? colliders.find((c) => c.id === sel.id) : null;

  const addTrack = () => {
    const v = ed.newViewFromPose(`Track ${tracks.length + 1}`);
    if (v?.id) setSel({ type: 'track', id: v.id });
  };
  const addHotspot = (type: HotspotType) => {
    const h = ed.addHotspot(type);
    if (h?.id) setSel({ type: 'hotspot', id: h.id });
  };
  // Session-only, like every other studio edit (§19) — "Save to server" writes
  // it, because sceneDocFor() reads `title` off the same object.
  const doRename = (sceneId: string, name: string) => {
    if (renameScene(sceneId, name)) bump();
  };

  return (
    <div className="ed2">
      <LeaveGuard dirty={dirty} />
      <TopBar key={state.activeId} onPreview={onPreview} onMeasure={() => setMeasuring(true)} sceneId={state.activeId} property={property} />
      {measuring && (
        <MeasureTool
          editor={state.editor} unitScale={walkerCfg.unitScale || 1} onClose={closeMeasure}
          onCalibrate={(u) => setUnitScale(state.activeId, u)}
        />
      )}
      {planTool && <PlanMarker editor={state.editor} mode={planTool} onMode={setPlanTool} onClose={closePlanTool} />}

      <SceneTree
        state={state} tracks={tracks} hotspots={hotspots} colliders={colliders} sel={sel}
        onSelect={(s) => { setSel(s); if (!s) setPane('scene'); }} onAddTrack={addTrack} onAddHotspot={addHotspot}
        onAddCollider={() => setSel({ type: 'collider', id: ed.addCollider().id })}
        onNewSpace={() => setUploaderOpen(true)} onRename={doRename}
        onCopy={hotspots.length || tracks.length ? () => setCopying(true) : undefined}
      />
      {copying && <CopyToSpaces sceneId={state.activeId} propertyId={property?.id ?? null} onClose={() => setCopying(false)} />}

      {uploaderOpen && (
        <Uploader
          propertyId={property?.id ?? null}
          onClose={() => setUploaderOpen(false)}
          onCreated={(id) => { setUploaderOpen(false); state.select(id); }}
        />
      )}

      <div className="ed2-inspector">
        {sel && (
          <div className="ed2-row">
            <button onClick={() => setSel(null)} title="Esc">← Back to scene</button>
          </div>
        )}
        {selHotspot ? (
          <HotspotInspector
            ed={ed} hs={selHotspot} activeId={state.activeId} onAddTable={() => {
              // the next table starts with this one's seats: a room's tables are mostly one size
              const h = ed.addHotspot('table');
              if (!h?.id) return;
              const seats = selHotspot.payload?.capacity;
              if (seats) ed.updateHotspot(h.id, { payload: { ...h.payload, capacity: seats } });
              setSel({ type: 'hotspot', id: h.id });
            }}
            onDelete={() => { ed.removeHotspot(selHotspot.id); setSel(null); }}
          />
        ) : selCollider ? (
          <ColliderInspector
            ed={ed} c={selCollider} sceneId={state.activeId}
            onDelete={() => { removeCollider(state.activeId, selCollider.id); setSel(null); }}
          />
        ) : selTrack ? (
          <TrackInspector
            ed={ed} track={selTrack} sceneId={state.activeId}
            onDelete={() => { ed.removeViewpoint(selTrack.id); setSel(null); }}
            onBump={bump}
          />
        ) : (
          <>
            <div className="ed2-panetabs">
              {(['scene', 'look'] as const).map((p) => (
                <button key={p} className={p === pane ? 'on' : ''} onClick={() => setPane(p)}>
                  {p === 'scene' ? 'Scene' : 'Look'}
                </button>
              ))}
            </div>
            {pane === 'scene' && <WorldInspector state={state} pose={pose} onBump={bump} onPlanTool={setPlanTool} />}
            {pane === 'look' && <CustomizeInspector onBump={bump} />}
          </>
        )}
      </div>

      <Filmstrip
        vps={tracks} selId={selTrack?.id}
        onSelect={(id) => setSel({ type: 'track', id })}
        onPlay={(vp) => ed.play(vp)}
        onAdd={addTrack}
      />

      <HotspotMarkers
        sceneId={state.activeId} mode="edit" selId={selHotspot?.id}
        moveId={state.ready && !state.loading && !state.flying && hotspotMove.sceneId === state.activeId && hotspotMove.enabled ? hotspotMove.id ?? undefined : undefined}
        moveDragging={hotspotMove.dragging}
        onSelect={(id) => setSel({ type: 'hotspot', id })}
      />

      <div className="ed2-aim" aria-hidden />
      <div className="ed2-hint-strip">
        drag 3D to look · <b>WASD</b> move · <b>H</b> hotspot where the dot is · <b>N</b> fly · scroll = dolly · <ShortcutSheet />
      </div>
    </div>
  );
}

/* -------------------------- Look pane ------------------------- */

function CustomizeInspector({ onBump }: { onBump: () => void }) {
  const ui = uiConfig;
  return (
    <>
      <Section title="Brand">
        <input className="ed2-name" defaultValue={ui.brand}
          onChange={(e) => setUiConfig({ brand: e.target.value })} />
        <Toggle label="Show brand on tour" value={ui.showBrand}
          onChange={(v) => { setUiConfig({ showBrand: v }); onBump(); }} />
        <div className="ed2-row">
          <input type="color" defaultValue={ui.accent}
            onChange={(e) => { setUiConfig({ accent: e.target.value }); onBump(); }} />
          <span className="ed2-muted">accent colour</span>
        </div>
      </Section>

      <Section title="View labels">
        <Toggle label="Show labels in the dock" value={ui.showLabels}
          onChange={(v) => { setUiConfig({ showLabels: v }); onBump(); }} />
        <Segmented value={ui.labelAlign}
          options={[['left', 'Left'], ['center', 'Center'], ['right', 'Right']] as const}
          onChange={(a) => { setUiConfig({ labelAlign: a }); onBump(); }} />
      </Section>
    </>
  );
}
