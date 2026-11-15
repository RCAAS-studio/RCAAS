'use client';

import { useRef, useState } from "react";
import { visibleScenes } from "../../scene/scenes";
import { matchesHierarchy } from "../draftActions";
import { HotspotIcon } from "../../hotspots/HotspotIcon";
import type { ViewerState } from "../../../@types/app.types";
import type { Hotspot, HotspotType } from "../../../@types/hotspot.types";
import type { Collider, Scene } from "../../../@types/scene.types";
import type { Viewpoint } from "../../../@types/viewpoint.types";
import { HS_TYPES } from './controls';
import type { Selection } from './types';

/** One scene in the tree. Double-click (or F2 when it has focus) turns the row
 *  into a field; Enter or blur commits, Escape puts the old name back. */
function SceneRow({ scene, active, onSelect, onRename }: {
  scene: Scene;
  active: boolean;
  onSelect: () => void;
  onRename: (sceneId: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(scene.name);

  const open = () => { setDraft(scene.name); setEditing(true); };

  if (editing) {
    const commit = () => { onRename(scene.id, draft); setEditing(false); };
    return (
      <input
        className="ed2-tree-rename"
        value={draft}
        autoFocus
        aria-label={`Rename ${scene.name}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          else if (e.key === 'Escape') setEditing(false);
        }}
        onFocus={(e) => e.target.select()}
      />
    );
  }

  return (
    <button
      className={`ed2-tree-row ${active ? 'on' : ''}`}
      onClick={onSelect}
      onDoubleClick={open}
      onKeyDown={(e) => { if (e.key === 'F2') { e.preventDefault(); open(); } }}
      title="Double-click to rename"
    >
      <span className="ed2-tree-ic">◈</span>
      <span className="ed2-tree-nm">{scene.name}</span>
    </button>
  );
}

interface SceneTreeProps {
  state: ViewerState;
  tracks: Viewpoint[];
  hotspots: Hotspot[];
  colliders: Collider[];
  sel: Selection | null;
  /** null = the space itself (its Scene pane). */
  onSelect: (sel: Selection | null) => void;
  onAddTrack: () => void;
  onAddHotspot: (type: HotspotType) => void;
  onAddCollider: () => void;
  onNewSpace: () => void;
  onRename: (sceneId: string, name: string) => void;
  /** Copy hotspots and tracks to other spaces (CopyToSpaces). */
  onCopy?: () => void;
}

export function SceneTree({ state, tracks, hotspots, colliders, sel, onSelect, onAddTrack, onAddHotspot, onAddCollider, onNewSpace, onRename, onCopy }: SceneTreeProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const scenes = visibleScenes().filter(s => matchesHierarchy(query, s.name, s.id, s.building, s.floor));
  const shownHotspots = hotspots.filter(h => matchesHierarchy(query, h.label, h.id, h.type));
  const shownColliders = colliders.filter(c => matchesHierarchy(query, c.label, c.id, 'collision box'));
  const shownTracks = tracks.filter(t => matchesHierarchy(query, t.label, t.id, 'camera track'));
  const count = scenes.length + shownHotspots.length + shownColliders.length + shownTracks.length;
  return (
    <div className="ed2-left">
      <div className="ed2-tree-search">
        <label htmlFor="studio-hierarchy-search">Search hierarchy</label>
        <div>
          <input ref={search} id="studio-hierarchy-search" type="search" value={query} placeholder="Name, type or location"
            onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); setQuery(''); } }} />
          {query && <button type="button" aria-label="Clear hierarchy search" onClick={() => { setQuery(''); search.current?.focus(); }}>×</button>}
        </div>
        {query.trim() && <p role="status">{count ? `${count} matching item${count === 1 ? '' : 's'}` : 'No matching items. Try another name or clear the search.'}</p>}
      </div>
      <div className="ed2-tree-grp">
        Scenes <span className="ed2-tree-n">{scenes.length}</span>
        <button type="button" className="ed2-tree-add" onClick={onNewSpace} title="New space" aria-label="New space">＋</button>
      </div>
      {scenes.map((s) => (
        <SceneRow
          key={s.id}
          scene={s}
          active={s.id === state.activeId}
          onSelect={() => { onSelect(null); state.select(s.id); }}
          onRename={onRename}
        />
      ))}

      <div className="ed2-tree-grp">
        Hotspots <span className="ed2-tree-n">{shownHotspots.length}</span>
        {onCopy && <button type="button" className="ed2-tree-add ed2-tree-copy" onClick={onCopy} title="Copy hotspots and tracks to other spaces" aria-label="Copy hotspots and tracks to other spaces">⧉</button>}
        <button type="button" className="ed2-tree-add" onClick={() => setAddOpen((v) => !v)} title="Add a hotspot" aria-label="Add a hotspot" aria-expanded={addOpen}>＋</button>
      </div>
      {addOpen && (
        <div className="ed2-tree-addmenu">
          {HS_TYPES.map((t) => (
            <button key={t} onClick={() => { onAddHotspot(t); setAddOpen(false); }}>
              <HotspotIcon type={t} /> {t}
            </button>
          ))}
        </div>
      )}
      {shownHotspots.map((h) => (
        <button
          key={h.id}
          className={`ed2-tree-row ${sel?.type === 'hotspot' && sel.id === h.id ? 'on' : ''}`}
          aria-pressed={sel?.type === 'hotspot' && sel.id === h.id}
          onClick={() => onSelect({ type: 'hotspot', id: h.id })}
        >
          <span className="ed2-tree-ic"><HotspotIcon type={h.type} /></span>
          <span className="ed2-tree-nm">{h.label}</span>
        </button>
      ))}
      {!hotspots.length && !addOpen && (
        <button type="button" className="ed2-tree-empty" onClick={() => setAddOpen(true)}>＋ Add a hotspot <kbd>H</kbd></button>
      )}

      <div className="ed2-tree-grp">
        Collision boxes <span className="ed2-tree-n">{shownColliders.length}</span>
        <button type="button" className="ed2-tree-add" onClick={onAddCollider} title="Add an invisible wall or floor" aria-label="Add a collision box">＋</button>
      </div>
      {shownColliders.map((c) => (
        <button
          key={c.id}
          className={`ed2-tree-row ${sel?.type === 'collider' && sel.id === c.id ? 'on' : ''}`}
          aria-pressed={sel?.type === 'collider' && sel.id === c.id}
          onClick={() => onSelect({ type: 'collider', id: c.id })}
        >
          <span className="ed2-tree-ic" style={{ color: c.color }}>■</span>
          <span className="ed2-tree-nm">{c.label}</span>
        </button>
      ))}
      {!colliders.length && (
        <button type="button" className="ed2-tree-empty" onClick={onAddCollider} title="An invisible wall or floor that blocks a hole in the scan">＋ Add a collision box</button>
      )}

      <div className="ed2-tree-grp">
        Camera tracks <span className="ed2-tree-n">{shownTracks.length}</span>
        <button type="button" className="ed2-tree-add" onClick={onAddTrack} title="Add a camera track from this view" aria-label="Add a camera track">＋</button>
      </div>
      {shownTracks.map((t) => (
        <button
          key={t.id}
          className={`ed2-tree-row ${sel?.type === 'track' && sel.id === t.id ? 'on' : ''}`}
          aria-pressed={sel?.type === 'track' && sel.id === t.id}
          onClick={() => onSelect({ type: 'track', id: t.id })}
        >
          <span className="ed2-tree-ic">▸</span>
          <span className="ed2-tree-nm">{t.label}</span>
          {!t.session && <span className="ed2-tree-lock">baked</span>}
        </button>
      ))}
      {!tracks.length && (
        <button type="button" className="ed2-tree-empty" onClick={onAddTrack} title="A flythrough that starts from this view">＋ Add a camera track</button>
      )}
    </div>
  );
}

interface FilmstripProps {
  vps: Viewpoint[];
  selId?: string;
  onSelect: (id: string) => void;
  onPlay: (vp: Viewpoint) => void;
  onAdd: () => void;
}

export function Filmstrip({ vps, selId, onSelect, onPlay, onAdd }: FilmstripProps) {
  return (
    <div className="ed2-strip">
      {vps.map((vp) => (
        <button
          key={vp.id}
          className={`ed2-tile ${vp.id === selId ? 'on' : ''}`}
          onClick={() => (vp.id === selId ? onPlay(vp) : onSelect(vp.id))}
          title={vp.id === selId ? 'click again to play' : vp.label}
        >
          {vp.thumb ? <img src={vp.thumb} alt="" /> : <span className="ed2-tile-ph" />}
          <span className="ed2-tile-nm">{vp.label}</span>
        </button>
      ))}
      <button className="ed2-tile ed2-tile-add" onClick={onAdd}>＋</button>
    </div>
  );
}
