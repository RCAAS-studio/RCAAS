'use client';

import { ask } from '../../../components/ui/Ask';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SCENE_BY_ID } from '../../scene/scenes';
import { saveDraft, reloadDraft } from '../draftActions';
import { DraftRecovery } from '../DraftRecovery';
import { hasUnsavedChanges } from '../../scene/sceneDoc';
import { getPublishState, publishSceneNow, unpublishScene, revertScene, getVersions, restoreVersion, getEmbed, setEmbed, ApiError } from '../../../lib/api';
import { tourHref } from '../../../lib/hosts';
import type { PublishState, EmbedSettings, SceneVersion } from '../../../lib/api';
import { QrCode } from '../QrCode';
import type { SceneDoc } from '../../../@types/scene.types';


const CAMPAIGNS = ['Facebook', 'Instagram', 'Google', 'WhatsApp', 'Email', 'Print'];

const EMBED_SIZES = [
  { label: 'Responsive', w: '100%', h: '600' },
  { label: '1280 × 720', w: '1280', h: '720' },
  { label: '800 × 500', w: '800', h: '500' }
] as const;

export function PublishButton({ sceneId }: { sceneId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="ed2-pubbtn" onClick={() => setOpen(true)}>Publish</button>
      {/* Portalled: the top bar is its own stacking context, so a dialog inside
       *  it could sit under the inspector. The .ed2 wrapper keeps the tokens. */}
      {open && createPortal(
        <div className="ed2"><PublishPanel sceneId={sceneId} onClose={() => setOpen(false)} /></div>,
        document.body
      )}
    </>
  );
}

function PublishPanel({ sceneId, onClose }: { sceneId: string; onClose: () => void }) {
  const [info, setInfo] = useState<PublishState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [note, setNote] = useState('');
  const [size, setSize] = useState(0);
  const [copied, setCopied] = useState('');
  const [embed, setEmbedState] = useState<EmbedSettings | null>(null);
  const [sitesDraft, setSitesDraft] = useState('');

  const refresh = () => getPublishState(sceneId).then(setInfo).catch((e: Error) => setError(e.message));
  useEffect(() => { refresh(); }, [sceneId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    getEmbed(sceneId).then((e) => { setEmbedState(e); setSitesDraft(e?.sites.join(', ') ?? ''); }).catch(() => {});
  }, [sceneId]);
  const saveEmbed = (patch: { rotate?: true; sites?: string[] }, done: string) => run('embed', async () => {
    const e = await setEmbed(sceneId, patch);
    setEmbedState(e);
    setSitesDraft(e?.sites.join(', ') ?? '');
    return done;
  });

  const run = async (label: string, fn: () => Promise<string | void>) => {
    setBusy(label); setError(''); setNote(''); setConflict(false);
    try {
      const msg = await fn();
      if (msg) setNote(msg);
      await refresh();
    } catch (e) {
      setConflict(e instanceof ApiError && e.status === 409);
      setError(e instanceof Error ? e.message : 'That didn’t work. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const publish = () => run('publish', async () => {
    if (hasUnsavedChanges(sceneId)) {
      await saveDraft(sceneId);
    }
    const r = await publishSceneNow(sceneId);
    if (!r.published) throw new Error(r.blockers?.join(' ') || 'Publish was refused.');
    await loadVersions();
    return `Published version ${r.version}. Visitors see it now.`;
  });
  const unpublish = () => run('unpublish', async () => {
    await unpublishScene(sceneId);
    return 'Unpublished. The link now shows a "not published" page.';
  });
  // The studio's copy of the space follows a draft the server just replaced.
  const adopt = async (doc: SceneDoc | null | undefined) => {
    if (!doc) return;
    await reloadDraft(sceneId);
  };
  const revert = async () => {
    if (!(await ask({ title: 'Throw away your changes?', body: 'Every change since the last publish is lost. The live tour stays as it is.', action: 'Throw them away', danger: true }))) return;
    run('revert', async () => {
      await adopt(await revertScene(sceneId));
      return 'Reverted to the published version.';
    });
  };
  const [versions, setVersions] = useState<SceneVersion[] | null>(null);
  const loadVersions = () => getVersions(sceneId).then(setVersions).catch(() => setVersions([]));
  useEffect(() => { loadVersions(); }, [sceneId]); // eslint-disable-line react-hooks/exhaustive-deps
  const restore = async (v: number) => {
    if (!(await ask({ title: `Put version ${v} live again?`, body: 'It is published as a new version, and your unpublished edits in the studio are replaced by it.', action: `Publish version ${v}`, danger: true }))) return;
    run(`restore-${v}`, async () => {
      const r = await restoreVersion(sceneId, v, true);
      await adopt(r?.doc);
      loadVersions();
      if (r?.publish && !r.publish.published) throw new Error(r.publish.blockers?.join(' ') || 'It was restored as the draft, but publishing it was refused.');
      return `Version ${v} is live again, as version ${r?.publish?.version}.`;
    });
  };

  const url = tourHref(sceneId, true);
  const s = EMBED_SIZES[size];
  // The key lets this snippet (and no hand-made one) show the tour; see embed.js.
  const embedSrc = `${url}&embed=1&key=${encodeURIComponent(embed?.key ?? '')}`;
  const snippet = `<iframe src="${embedSrc}" width="${s.w}" height="${s.h}" style="border:0" allow="fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy" title="3D tour"></iframe>`;
  const copy = (what: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(what); setTimeout(() => setCopied(''), 1600); });
  };

  const live = info?.status === 'published';
  const when = info?.publishedAt ? new Date(info.publishedAt).toLocaleString() : '';

  return (
    <div className="up-scrim" onClick={onClose}>
      <div className="up-panel pub-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Publish">
        <header className="up-head">
          <h2>Publish {SCENE_BY_ID[sceneId]?.name ?? sceneId}</h2>
          <button className="up-x" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {!info && !error && <p className="up-sub">Checking…</p>}
        {info && (
          <p className={`pub-status ${live ? 'is-live' : ''}`}>
            <span className="ed2-save-dot" aria-hidden />
            {live
              ? `Live: visitors see version ${info.publishedVersion}, published ${when}. Edits stay private until you publish again.`
              : 'Not published. Visitors can’t open this space.'}
          </p>
        )}

        {/* the ready checklist (server store.js readiness), of the saved space */}
        {!!info?.ready?.length && (
          <ul className="pub-ready" aria-label="Ready for visitors">
            {info.ready.map((c) => (
              <li key={c.key} className={c.done ? 'is-done' : undefined}><span aria-hidden>{c.done ? '✓' : ''}</span>{c.label}<span className="se-sr">{c.done ? ', done' : ', not yet'}</span></li>
            ))}
          </ul>
        )}
        {info && hasUnsavedChanges(sceneId) && <p className="up-sub">This checks the saved space: save to include your latest changes.</p>}

        {!!info?.blockers.length && (
          <ul className="pub-list is-block">{info.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        )}
        {!!info?.warnings.length && (
          <ul className="pub-list is-warn">{info.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        )}

        <div className="pub-actions">
          <button className="up-create" onClick={publish} disabled={!!busy || !info || info.blockers.length > 0}>
            {busy === 'publish' ? 'Publishing…' : live ? 'Publish changes' : 'Publish space'}
          </button>
          {live && (
            <>
              <button className="pub-secondary" onClick={revert} disabled={!!busy}>
                {busy === 'revert' ? 'Reverting…' : 'Revert to published'}
              </button>
              <button className="pub-secondary is-danger" onClick={unpublish} disabled={!!busy}>
                {busy === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
              </button>
            </>
          )}
        </div>
        {note && <p className="pub-note">{note}</p>}
        {error && <p className="up-error">{error}</p>}
        {conflict && <DraftRecovery sceneId={sceneId} conflict onReload={() => { setError(''); setConflict(false); setNote('Loaded the server draft.'); void refresh(); }} />}

        {!!versions?.length && (
          <details className="pub-history">
            <summary>History: {versions.length === 1 ? '1 published version' : `${versions.length} published versions`}</summary>
            <ol>
              {versions.map((v) => (
                <li key={v.version}>
                  <span>
                    <b>Version {v.version}</b>{v.version === info?.publishedVersion && live && <span className="pub-live-tag">live</span>}
                    <span className="pub-when">{v.publishedAt ? new Date(v.publishedAt).toLocaleString() : ''}</span>
                  </span>
                  {!(v.version === info?.publishedVersion && live) && (
                    <button className="pub-secondary" disabled={!!busy} onClick={() => restore(v.version)}>
                      {busy === `restore-${v.version}` ? 'Restoring…' : 'Put live again'}
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </details>
        )}

        {live && (
          <div className="pub-share">
            <p className="pub-label">Link</p>
            <div className="pub-copyrow">
              <input readOnly value={url} onFocus={(e) => e.target.select()} />
              <button onClick={() => copy('link', url)}>{copied === 'link' ? 'Copied' : 'Copy'}</button>
              <a href={url} target="_blank" rel="noreferrer">Open</a>
            </div>

            <p className="pub-label">QR code and campaign links</p>
            <div className="pub-qr">
              <QrCode url={`${url}&src=qr`} name={sceneId} />
              <div>
                <p className="up-slot-hint">
                  Print the code at reception, on table cards or brochures. Each link below opens the same tour, marked with
                  where you shared it, so the monthly report shows which one brought each visit and enquiry.
                </p>
                <div className="pub-sizes">
                  {CAMPAIGNS.map((c) => {
                    const link = `${url}&src=${c.toLowerCase()}`;
                    return <button key={c} onClick={() => copy(c, link)} title={link}>{copied === c ? 'Copied' : c}</button>;
                  })}
                </div>
              </div>
            </div>

            <p className="pub-label">Embed on a website</p>
            <div className="pub-sizes">
              {EMBED_SIZES.map((o, i) => (
                <button key={o.label} className={i === size ? 'on' : ''} onClick={() => setSize(i)}>{o.label}</button>
              ))}
            </div>
            <div className="pub-copyrow">
              <textarea readOnly rows={3} value={embed ? snippet : 'Getting this space’s embed key…'} onFocus={(e) => e.target.select()} />
              <button onClick={() => copy('embed', snippet)} disabled={!embed}>{copied === 'embed' ? 'Copied' : 'Copy'}</button>
            </div>
            <p className="up-slot-hint">
              Paste this into the client&apos;s page; it needs no build step. Only this code shows the tour in a frame:
              a hand-made one, or one from before you retire them below, shows a &ldquo;can&apos;t be shown here&rdquo; message instead.
            </p>

            <p className="pub-label">Websites allowed to embed it</p>
            <div className="pub-copyrow">
              <input
                value={sitesDraft} placeholder="Any website — or e.g. baserahotel.com, basera.com.np"
                onChange={(e) => setSitesDraft(e.target.value)}
              />
              <button
                disabled={!embed || !!busy || sitesDraft === (embed?.sites.join(', ') ?? '')}
                onClick={() => saveEmbed({ sites: sitesDraft.split(/[\s,]+/).filter(Boolean) }, 'Saved the website list.')}
              >Save</button>
            </div>
            <p className="up-slot-hint">Their subdomains count too. Leave it empty to allow any website.</p>
            <button
              className="pub-secondary is-danger" disabled={!embed || !!busy}
              onClick={async () => {
                if (await ask({ title: 'Retire every embed code?', body: 'Pages using an old code for this space stop showing the tour until they paste the new one.', action: 'Retire the old codes', danger: true })) {
                  saveEmbed({ rotate: true }, 'Old embed codes retired. Copy the new code above.');
                }
              }}
            >Retire old embed codes</button>
          </div>
        )}
      </div>
    </div>
  );
}
