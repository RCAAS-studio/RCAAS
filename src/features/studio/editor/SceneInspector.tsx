'use client';

import { SCENE_BY_ID, renameScene, setNight, setPlace, visibleScenes } from "../../scene/scenes";
import { walkerCfg } from "../../scene/walkerConfig";
import { bookingFor, setBooking, lookFor, setLook, DEFAULT_LOOK } from "../../scene/sceneDoc";
import { type PlanTool } from "../PlanMarker";
import { ClaudeSection } from "../ClaudeTools";
import { uiConfig, setUiConfig } from "../../../lib/uiConfig";
import { safeUrl } from "../../../lib/api";
import type { ViewerState } from "../../../@types/app.types";
import { Section, Slider, Segmented, Toggle } from "./controls";
import { FloorPlanSection } from './FloorPlanInspector';
import { PlacementSection } from './PlacementSection';
import type { Pose } from './types';

/** The space's colour (sceneDoc lookFor): for a dull or yellow capture. Saved and published with it. */
function ColourSection({ sceneId }: { sceneId: string }) {
  const l = lookFor(sceneId) ?? DEFAULT_LOOK;
  return (
    <details className="ed2-adv">
      <summary>Colour{lookFor(sceneId) ? ' (adjusted)' : ''}</summary>
      <Slider label="Brightness" value={l.brightness} min={0.5} max={1.6} step={0.01} onChange={(x) => setLook(sceneId, { brightness: x })} />
      <Slider label="Contrast" value={l.contrast} min={0.5} max={1.6} step={0.01} onChange={(x) => setLook(sceneId, { contrast: x })} />
      <Slider label="Saturation" value={l.saturation} min={0} max={2} step={0.01} onChange={(x) => setLook(sceneId, { saturation: x })} />
      <div className="ed2-row"><button onClick={() => setLook(sceneId, DEFAULT_LOOK)} disabled={!lookFor(sceneId)}>As scanned</button></div>
      <p className="ed2-muted ed2-fine">Visitors see it once you save and publish. It colours the whole view, view pictures included; hotspots and the tour&apos;s buttons stay as they are.</p>
    </details>
  );
}

export function WorldInspector({ state, pose, onBump, onPlanTool }: { state: ViewerState; pose: Pose | null; onBump: () => void; onPlanTool: (t: PlanTool) => void }) {
  const u = walkerCfg.unitScale || 1;
  const fmt = (n?: number) => (n ?? 0).toFixed(2);

  return (
    <>
      <Section title="Start view">
        <p className="ed2-pose">
          {pose ? `[${fmt(pose.x)}, ${fmt(pose.y)}, ${fmt(pose.z)}]  yaw ${fmt(pose.yaw)}` : '…'}
        </p>
        <div className="ed2-row">
          <button onClick={() => state.editor.setSceneSpawn()}>Set to current</button>
          <button onClick={() => state.editor.copySpawn()}>Copy</button>
        </div>
      </Section>

      <BookingSection sceneId={state.activeId} />
      <NightSection sceneId={state.activeId} onBump={onBump} />
      <PlaceSection sceneId={state.activeId} onBump={onBump} />
      <FloorPlanSection sceneId={state.activeId} onPlanTool={onPlanTool} />
      <ColourSection sceneId={state.activeId} />
      <ClaudeSection ed={state.editor} sceneId={state.activeId} pose={pose} onRename={(t) => { if (renameScene(state.activeId, t)) onBump(); }} />

      <Section title="Movement mode">
        <Segmented
          value={walkerCfg.mode}
          options={[['walk', 'Walk'], ['fly', 'Fly'], ['orbit', 'Orbit']] as const}
          onChange={(m) => { walkerCfg.mode = m; onBump(); }}
        />
        <p className="ed2-muted ed2-fine">How the studio camera moves. Visitors choose their own in the tour (keys 1–4).</p>
      </Section>

      <Section title="Feel">
        <Slider label="Eye level" value={walkerCfg.eyeHeight}
          min={0.2 * u} max={3 * u} step={0.01 * u} scale={u} unit="m"
          onChange={(x) => { walkerCfg.eyeHeight = x; onBump(); }} />
        <Slider label="Wall clearance" value={walkerCfg.radius}
          min={0.05 * u} max={1.5 * u} step={0.01 * u} scale={u} unit="m"
          onChange={(x) => { walkerCfg.radius = x; onBump(); }} />
        <Slider label="Near clip — fixes edge spikes" value={walkerCfg.near}
          min={0.02} max={1} step={0.01}
          onChange={(x) => { walkerCfg.near = x; onBump(); }} />
        <Slider label="Movement speed" value={walkerCfg.speedMul}
          min={0.25} max={3} step={0.05} unit="×"
          onChange={(x) => { walkerCfg.speedMul = x; onBump(); }} />
        <div className="ed2-seg-mini">
          {([['Slow', 0.5], ['Normal', 1], ['Fast', 2]] as const).map(([l, v]) => (
            <button key={l} className={walkerCfg.speedMul === v ? 'on' : ''}
              onClick={() => { walkerCfg.speedMul = v; onBump(); }}>{l}</button>
          ))}
        </div>
        <p className="ed2-muted ed2-fine">unit scale ≈ {u.toFixed(3)}</p>
      </Section>

      {/* Rarely needed once a space is set up: kept out of the way, one click to open. */}
      <details className="ed2-adv">
        <summary>Advanced</summary>
        <PlacementSection state={state} />

        <Section title="Background">
          <div className="ed2-row">
            <input
              type="color" defaultValue={uiConfig.background}
              onChange={(e) => { setUiConfig({ background: e.target.value }); state.editor.setBackground(e.target.value); }}
            />
            <span className="ed2-muted">clear colour</span>
          </div>
        </Section>

        <div className="ed2-row">
          <button className="ed2-export" onClick={() => state.editor.exportScene()}>
            ⧉ Copy scene JSON
          </button>
        </div>
      </details>
    </>
  );
}

/**
 * Book now (§7.6) — off unless a hotel asks for it. When on, the tour shows
 * one button, top right, that opens the hotel's own booking page. Saved with
 * the space and snapshotted on publish like everything else.
 */
function BookingSection({ sceneId }: { sceneId: string }) {
  const b = bookingFor(sceneId) ?? { enabled: false, label: 'Book now', url: '' };
  const badUrl = !!b.url.trim() && !safeUrl(b.url);
  return (
    <Section title="Book now">
      <Toggle label="Show a Book now button" value={b.enabled} onChange={(v) => setBooking(sceneId, { enabled: v })} />
      {b.enabled && (
        <>
          <input className="ed2-name" aria-label="Button text" placeholder="Book now"
            value={b.label} onChange={(e) => setBooking(sceneId, { label: e.target.value })} />
          <input className="ed2-name" style={{ marginTop: 6 }} aria-label="Booking page link"
            placeholder="https://… the hotel's booking page"
            value={b.url} onChange={(e) => setBooking(sceneId, { url: e.target.value })} />
          {badUrl && <p className="ed2-warn ed2-fine">That isn&apos;t a web address. Start it with https://</p>}
          {!b.url.trim() && <p className="ed2-muted ed2-fine">The button stays hidden until it has a link.</p>}

          <div className="ed2-lbl" style={{ marginTop: 14 }}>The card</div>
          <input className="ed2-name" aria-label="Room or offer" placeholder="Room or offer, e.g. Deluxe Suite"
            value={b.title ?? ''} onChange={(e) => setBooking(sceneId, { title: e.target.value })} />
          <input className="ed2-name" style={{ marginTop: 6 }} aria-label="Tagline" placeholder="Tagline, e.g. Traditional charm, modern comfort"
            value={b.subtitle ?? ''} onChange={(e) => setBooking(sceneId, { subtitle: e.target.value })} />
          <div className="ed2-row" style={{ flexWrap: 'nowrap' }}>
            <input className="ed2-name" aria-label="Price" placeholder="Price, e.g. $120"
              value={b.price ?? ''} onChange={(e) => setBooking(sceneId, { price: e.target.value })} />
            <input className="ed2-name" aria-label="Price per" placeholder="/ night"
              value={b.priceUnit ?? ''} onChange={(e) => setBooking(sceneId, { priceUnit: e.target.value })} />
          </div>
          <input className="ed2-name" style={{ marginTop: 6 }} aria-label="Price note" placeholder="Note, e.g. Includes taxes & fees"
            value={b.priceNote ?? ''} onChange={(e) => setBooking(sceneId, { priceNote: e.target.value })} />
          <Toggle label="Ask for dates and guests" value={!!b.askDates} onChange={(v) => setBooking(sceneId, { askDates: v })} />
          {b.askDates && (
            <p className="ed2-muted ed2-fine">
              To pass them on, put <code>{'{checkin}'}</code> <code>{'{checkout}'}</code> <code>{'{guests}'}</code> in the link where the hotel&apos;s
              booking page expects them, e.g. <code>?arrive={'{checkin}'}&amp;depart={'{checkout}'}&amp;adults={'{guests}'}</code>.
            </p>
          )}
        </>
      )}
      <p className="ed2-muted ed2-fine">
        Opens a card in the tour; its button continues on the hotel&apos;s own booking page. The price is
        what you type here: there is no live availability. Set per space.
      </p>
    </Section>
  );
}

/** Where in a large site this space is: its building and floor. The tour
 *  then offers floors as lift buttons and lists each floor's spaces. */
function PlaceSection({ sceneId, onBump }: { sceneId: string; onBump: () => void }) {
  const here = SCENE_BY_ID[sceneId];
  const others = visibleScenes();
  const values = (k: 'building' | 'floor') => [...new Set(others.map((s) => s[k]).filter(Boolean))] as string[];
  return (
    <Section title="Building and floor">
      <div className="ed2-row2">
        <input className="ed2-name" list="ed2-buildings" aria-label="Building" placeholder="Building, e.g. Main block" maxLength={60}
          value={here?.building ?? ''} onChange={(e) => { setPlace(sceneId, { building: e.target.value }); onBump(); }} />
        <input className="ed2-name" list="ed2-floors" aria-label="Floor" placeholder="Floor, e.g. Ground floor" maxLength={60}
          value={here?.floor ?? ''} onChange={(e) => { setPlace(sceneId, { floor: e.target.value }); onBump(); }} />
      </div>
      <datalist id="ed2-buildings">{values('building').map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="ed2-floors">{values('floor').map((v) => <option key={v} value={v} />)}</datalist>
      <p className="ed2-muted ed2-fine">
        For campuses and large hotels. Give each space its building and floor; visitors get a building choice and
        floor buttons, and the list shows one floor at a time. Name floors so they sort: Basement, Ground floor,
        1st floor… Leave both empty on a small site.
      </p>
    </Section>
  );
}

/** Day and night: another space in this project, scanned after dark from the
 *  same spot, as this one's night version. */
function NightSection({ sceneId, onBump }: { sceneId: string; onBump: () => void }) {
  const others = visibleScenes().filter((s) => s.id !== sceneId);
  if (!others.length) return null;
  return (
    <Section title="Night version">
      <select className="ed2-name" aria-label="Night version" value={SCENE_BY_ID[sceneId]?.night ?? ''}
        onChange={(e) => { setNight(sceneId, e.target.value || null); onBump(); }}>
        <option value="">None</option>
        {others.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <p className="ed2-muted ed2-fine">
        Upload the night scan as its own space, then pick it here. Visitors get a day/night switch that keeps
        them where they stand, and the night space leaves the tour&apos;s list. Publish both. Scans started from
        the same spot usually line up; if the switch jumps, nudge the night one with Model placement (under Advanced).
      </p>
    </Section>
  );
}
