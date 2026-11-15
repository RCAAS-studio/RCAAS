'use client';
import { useEffect, useReducer, useState } from 'react';
import { Slider, Segmented, Toggle } from '@/features/studio/editor/controls';
import { PublishButton } from '@/features/studio/publishing/PublishButton';
import { reloadDraft } from '@/features/studio/draftActions';
import { setLook, collidersFor, subscribeDoc } from '@/features/scene/sceneDoc';
import { hydrateScenes, renameScene } from '@/features/scene/scenes';
import { SceneTree } from '@/features/studio/editor/SceneTree';
import { HotspotInspector } from '@/features/studio/editor/HotspotInspector';
import { ColliderInspector } from '@/features/studio/editor/ColliderInspector';
import { TrackInspector } from '@/features/studio/editor/TrackInspector';
import type { EditorApi, ViewerState } from '@/@types/app.types';
import type { Hotspot } from '@/@types/hotspot.types';
import type { Viewpoint } from '@/@types/viewpoint.types';
import type { Selection } from '@/features/studio/editor/types';
import '@/features/studio/editor.css';

/** Copied into an isolated checkout by browser-test-server; never a real app route. */
export default function StudioFixture() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [height, setHeight] = useState(1.5);
  const [mode, setMode] = useState('walk');
  const [audio, setAudio] = useState(false);
  useEffect(() => { reloadDraft('fixture').then(() => setReady(true)).catch(error => setError(error.message)); }, []);
  return <main className="ed2" style={{ height: '100dvh', overflow: 'auto', padding: 24 }}>
    <div style={{ width: 'min(100%, 420px)' }}>
      <h1>Studio control fixture</h1>
      {error && <p role="alert">{error}</p>}
      {ready ? <p data-testid="fixture-ready">Draft loaded</p> : <p>Loading fixture</p>}
      <Slider label="Eye level" unit="m" value={height} min={0.5} max={3} typedMax={6} step={0.1} onChange={setHeight} />
      <output data-testid="height">{height}</output>
      <Segmented value={mode} options={['walk', 'fly'].map(value => [value, value] as const)} onChange={setMode} />
      <output data-testid="mode">{mode}</output>
      <Toggle label="Audio" value={audio} onChange={setAudio} />
      <output data-testid="audio">{String(audio)}</output>
      <button disabled={!ready} onClick={() => setLook('fixture', { brightness: 1.2 })}>Make unsaved change</button>
      {ready && <PublishButton sceneId="fixture" />}
      {ready && <InspectorFixture />}
    </div>
  </main>;
}

/** The renderer bridge is mocked; these are the actual hierarchy and inspectors. */
function InspectorFixture() {
  const [, bump] = useReducer(n => n + 1, 0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [panel, setPanel] = useState<'hotspot' | 'track' | 'collider'>('hotspot');
  const [commands, setCommands] = useState<string[]>([]);
  const [hotspot, setHotspot] = useState<Hotspot>({ id: 'hs_fixture', type: 'text', label: 'Welcome hotspot', position: [1, 2, 3], radius: 1, payload: { text: 'Original welcome', url: 'https://example.test/preserved' }, occludedBy: 'geometry' });
  const [track, setTrack] = useState<Viewpoint>({ id: 'track_fixture', label: 'Lobby track', seconds: 4, session: true, path: [{ pos: [0, 1, 0], look: [0, 1, 1] }, { pos: [2, 1, 0], look: [2, 1, 1] }] });
  useEffect(() => {
    hydrateScenes([{ id: 'fixture', title: 'Fixture lobby', building: 'Main', floor: 'Ground' }]);
    bump();
    return subscribeDoc(bump);
  }, []);
  const record = (name: string, ...args: unknown[]) => setCommands(items => [...items, JSON.stringify([name, ...args])]);
  const editor = new Proxy({
    updateHotspot: (_id: string, patch: Partial<Hotspot>) => setHotspot(value => ({ ...value, ...patch })),
    renameView: (_id: string, label: string) => setTrack(value => ({ ...value, label })),
    setViewSeconds: (_id: string, seconds: number) => setTrack(value => ({ ...value, seconds })),
  }, { get: (target, key) => key in target ? target[key as keyof typeof target] : (...args: unknown[]) => record(String(key), ...args) }) as EditorApi;
  const state = { activeId: 'fixture', select: (id: string) => record('selectScene', id) } as ViewerState;
  const collider = collidersFor('fixture')[0];
  return <>
    {/* Lay out isolated components in flow; production positions this panel over the canvas. */}
    <style>{'.ed2 [data-testid="hierarchy"] .ed2-left { position: static; display: block; width: 100%; }'}</style>
    <div data-testid="hierarchy">
      <SceneTree state={state} tracks={[track]} hotspots={[hotspot]} colliders={collider ? [collider] : []} sel={selection}
        onSelect={setSelection} onAddTrack={() => record('addTrack')} onAddHotspot={type => record('addHotspot', type)}
        onAddCollider={() => record('addCollider')} onNewSpace={() => record('newSpace')}
        onRename={(id, name) => { renameScene(id, name); bump(); }} />
      <output data-testid="selection">{JSON.stringify(selection)}</output>
    </div>
    <nav aria-label="Fixture inspector">
      <button onClick={() => setPanel('hotspot')}>Inspect hotspot</button>
      <button onClick={() => setPanel('track')}>Inspect track</button>
      <button onClick={() => setPanel('collider')}>Inspect collider</button>
      <button onClick={() => setTrack(value => ({ ...value, session: false }))}>Use baked track</button>
    </nav>
    <div data-testid="inspector">
      {panel === 'hotspot' && <HotspotInspector ed={editor} hs={hotspot} activeId="fixture" onDelete={() => record('deleteHotspot')} onAddTable={() => record('addTable')} />}
      {panel === 'track' && <TrackInspector ed={editor} track={track} sceneId="fixture" onDelete={() => record('deleteTrack')} onBump={bump} />}
      {panel === 'collider' && collider && <ColliderInspector ed={editor} c={collider} sceneId="fixture" onDelete={() => record('deleteCollider')} />}
    </div>
    <output data-testid="hotspot-doc">{JSON.stringify(hotspot)}</output>
    <output data-testid="collider-doc">{JSON.stringify(collider)}</output>
    <output data-testid="track-doc">{JSON.stringify(track)}</output>
    <output data-testid="commands">{commands.join('\n')}</output>
  </>;
}
