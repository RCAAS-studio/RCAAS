'use client';

import { useEffect, useState } from "react";
import { updateSessionViewpoint } from "../../scene/viewpoints";
import { uploadAudio } from "../upload";
import { playClip, setMuted, stopClip, useSound } from "../../../lib/audio";
import { resolveAsset } from "../../../lib/api";
import type { EditorApi } from "../../../@types/app.types";
import type { Viewpoint } from "../../../@types/viewpoint.types";
import { Section, Slider } from "./controls";

interface TrackInspectorProps {
  ed: EditorApi;
  track: Viewpoint;
  sceneId: string;
  onDelete: () => void;
  onBump: () => void;
}

/** Narration on a camera track: plays as a visitor flies to it (and through a
 *  guided flythrough), with its transcript as a caption. */
function NarrationSection({ sceneId, track }: { sceneId: string; track: Viewpoint }) {
  const [upload, setUpload] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const sound = useSound();
  const url = resolveAsset(track.audio);
  const playing = !!url && sound.playing === url;
  const set = (patch: Partial<Viewpoint>) => updateSessionViewpoint(sceneId, track.id, patch);
  const mb = (n: number) => `${(n / 1048576).toFixed(2)} MB`;
  useEffect(() => () => stopClip(), []);
  const pick = (file?: File) => {
    if (!file) return;
    setError('');
    setUpload({ sent: 0, total: file.size });
    uploadAudio(file, (pr) => setUpload({ sent: pr.bytesSent, total: pr.bytesTotal }))
      .then((ref) => set({ audio: ref }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'The upload failed. Try again.'))
      .finally(() => setUpload(null));
  };
  return (
    <Section title="Narration">
      {track.audio ? (
        <>
          <p className="ed2-pose">{track.audio.split('/').pop()}</p>
          <div className="ed2-row">
            <button onClick={() => {
              if (playing) { stopClip(); return; }
              if (sound.muted) setMuted(false);
              if (url) playClip(url, track.transcript || null);
            }}>{playing ? '■ Stop' : sound.loading === url ? 'Loading…' : '▶ Play'}</button>
            <button onClick={() => { stopClip(); set({ audio: undefined }); }}>Remove</button>
          </div>
        </>
      ) : upload ? (
        <p className="ed2-pose">Uploading {mb(upload.sent)} of {mb(upload.total)}</p>
      ) : (
        <label className="ed2-filepick">
          <input type="file" accept=".m4a,audio/mp4" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          <span>＋ Add narration (.m4a)</span>
        </label>
      )}
      {error && <p className="ed2-warn ed2-fine">{error}</p>}
      <textarea
        className="ed2-name ed2-area" rows={3} style={{ marginTop: 8 }} key={track.id}
        placeholder="Transcript: shown as a caption while it plays"
        defaultValue={track.transcript ?? ''} onChange={(e) => set({ transcript: e.target.value })}
      />
      <p className="ed2-muted ed2-fine">Plays as a visitor flies to this view, and through a guided flythrough. AAC .m4a, mono, 96 kbps, 2 MB at most. The transcript shows as a caption, so visitors with sound off still get it.</p>
    </Section>
  );
}

export function TrackInspector({ ed, track, sceneId, onDelete, onBump }: TrackInspectorProps) {
  const editable = !!track.session;
  return (
    <>
      <Section title="Camera track">
        <input
          className="ed2-name" defaultValue={track.label} key={track.id} disabled={!editable}
          onChange={(e) => editable && ed.renameView(track.id, e.target.value)}
        />
        {!editable && <p className="ed2-muted ed2-fine">baked in code — read-only</p>}
      </Section>

      <Section title="Timing">
        <Slider label="Length" value={track.seconds || 4} min={1} max={12} step={0.5} typedMax={60} unit="s"
          onChange={(x) => editable && (ed.setViewSeconds(track.id, x), onBump())} />
      </Section>

      <Section title={`Path — ${track.path?.length || 0} waypoint(s)`}>
        {editable && (
          <div className="ed2-row">
            <button onClick={() => ed.updateViewToCurrent(track.id)} title="Replaces the whole path with where you are now">Set to current</button>
            <button onClick={() => ed.appendWpTo(track.id)}>＋ Waypoint</button>
          </div>
        )}
        <ol className="ed2-wps">
          {(track.path || []).map((w, i) => (
            <li key={i}>
              <span>{i === track.path.length - 1 ? 'View' : `#${i + 1}`} [{w.pos.map((n) => n.toFixed(1)).join(', ')}]</span>
              <span className="ed2-wp-tools">
                <button onClick={() => ed.goToWp(track.id, i)} title="Take the camera there">Go</button>
                {editable && <button onClick={() => ed.setWpTo(track.id, i)} title="Move this waypoint to where you are now">Set here</button>}
                {editable && track.path.length > 1 && (
                  <button onClick={() => ed.removeWpFrom(track.id, i)} aria-label={`Remove waypoint ${i + 1}`}>✕</button>
                )}
              </span>
            </li>
          ))}
        </ol>
        {editable && <p className="ed2-muted ed2-fine">To move a viewpoint: Go, adjust the view (WASD, drag to look), then Set here. The last one is where visitors arrive.</p>}
      </Section>

      {editable && <NarrationSection sceneId={sceneId} track={track} />}

      <div className="ed2-row ed2-viewactions">
        <button className="ed2-play" onClick={() => ed.play(track)}>▶ Play</button>
        {editable && <button className="ed2-del" onClick={onDelete}>🗑 Delete</button>}
      </div>
      <button className="ed2-export" onClick={() => ed.exportAll()}>⧉ Copy tracks JSON</button>
    </>
  );
}
