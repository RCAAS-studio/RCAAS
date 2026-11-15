'use client';

import { useEffect, useState } from 'react';
import { useEscape } from '../../hooks/useEscape';
import { ask, toast } from '../../components/ui/Ask';
import { getStorage, removeIdleUploads, type StorageReport } from '../../lib/api';
import { formatBytes } from './Uploader';

const IDLE_DAYS = 7;
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Storage, opened from the Projects page's top bar. Admin-only: the server
 * refuses anyone else (routes/storage.js) and the button is hidden for them.
 * Shows what each project stores, finished uploads nothing uses (listed only,
 * never deleted here), and unfinished uploads, which can be removed once
 * they've been idle for a week.
 */
export function StorageDialog({ onClose }: { onClose: () => void }) {
  useEscape(onClose);
  const [report, setReport] = useState<StorageReport | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => getStorage().then(setReport).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load storage.'));
  useEffect(() => { load(); }, []);

  const cutoff = Date.now() - IDLE_DAYS * 86400000;
  const idle = report?.unfinished.filter((u) => Date.parse(u.lastActivityAt) <= cutoff) ?? [];
  const clean = async () => {
    if (!(await ask({
      title: `Remove ${idle.length === 1 ? 'the unfinished upload' : `${idle.length} unfinished uploads`} idle for ${IDLE_DAYS} days or more?`,
      body: 'What was sent is deleted and can’t be resumed: whoever started it would upload again. Finished uploads are never touched.',
      action: 'Remove idle uploads', danger: true
    }))) return;
    setBusy(true);
    setError('');
    try {
      const r = await removeIdleUploads(IDLE_DAYS);
      const n = r?.removed.length ?? 0;
      toast(n ? `Removed ${n} unfinished upload${n === 1 ? '' : 's'}.` : `No upload was idle for ${IDLE_DAYS} days or more.`);
      if (r?.kept.length) setError(`Kept ${r.kept.length}: ${r.kept[0].reason}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That didn’t work. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="np-scrim" onClick={onClose}>
      <div className="pl-dialog pl-dialog-wide" role="dialog" aria-modal="true" aria-label="Storage" onClick={(e) => e.stopPropagation()}>
        <header className="np-head">
          <h2>Storage</h2>
          <button className="np-x" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="pl-dialog-body">
          {error && <p className="ed2-warn ed2-fine">{error}</p>}
          {!report && !error && <p className="pl-sub">Loading…</p>}
          {report && (
            <>
              <p className="pl-sub">
                {formatBytes(report.totalBytes)} in {report.totalFiles.toLocaleString()} files, {report.driver === 's3' ? 'in the cloud bucket' : 'on this computer'}.
              </p>

              <p className="pl-sub">
                Claude this month: {(report.ai.inputTokens + report.ai.outputTokens).toLocaleString()} tokens in {report.ai.calls} answer{report.ai.calls === 1 ? '' : 's'}
                {report.ai.limit ? ` of a ${report.ai.limit.toLocaleString()}-token budget.` : ', no budget set (AI_MONTHLY_TOKENS).'}
              </p>

              <h3 className="pl-dialog-h">By project</h3>
              {report.projects.length ? (
                <ul className="pl-team-list">
                  {report.projects.map((p) => (
                    <li key={p.id || '-'}>
                      <span className="pl-team-who">{p.title ?? 'Not in a project'} <span className="pl-sub">{p.assets} upload{p.assets === 1 ? '' : 's'}</span></span>
                      <span>{formatBytes(p.bytes)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="pl-sub">No project stores anything yet.</p>}
              {report.projects.length > 1 && <p className="pl-sub">A file two projects share counts in both.</p>}

              <h3 className="pl-dialog-h">Not used by any project</h3>
              {report.unused.length ? (
                <>
                  <ul className="pl-team-list">
                    {report.unused.map((u) => (
                      <li key={u.id}>
                        <span className="pl-team-who">{u.id} <span className="pl-sub">{u.uploadedAt ? `Uploaded ${day(u.uploadedAt)}${u.uploadedBy ? ` by ${u.uploadedBy}` : ''}` : 'Upload date not recorded'}</span></span>
                        <span>{formatBytes(u.bytes)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pl-sub">Listed only: nothing here is deleted from this page. Usually a deleted space’s scan or a replaced photo.</p>
                </>
              ) : <p className="pl-sub">Every finished upload is in use.</p>}

              <h3 className="pl-dialog-h">Unfinished uploads</h3>
              {report.unfinished.length ? (
                <ul className="pl-team-list">
                  {report.unfinished.map((u) => (
                    <li key={u.id}>
                      <span className="pl-team-who">
                        {u.ownerName ?? 'Unknown account'}
                        <span className="pl-sub">
                          {u.finished ? 'Finished; its upload folder was left behind' : `${formatBytes(u.stagedBytes)}${u.declaredBytes ? ` of ${formatBytes(u.declaredBytes)}` : ''} sent`}
                          {u.partialBytes ? `, ${formatBytes(u.partialBytes)} half-copied to the cloud` : ''}. Last activity {day(u.lastActivityAt)}.
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="pl-sub">None.</p>}
              {idle.length > 0 ? (
                <span className="pl-team-acts">
                  <button type="button" className="pl-btn pl-btn-danger" disabled={busy} onClick={clean}>
                    Remove {idle.length === 1 ? 'the upload' : `${idle.length} uploads`} idle for {IDLE_DAYS} days or more
                  </button>
                </span>
              ) : report.unfinished.length > 0 && <p className="pl-sub">None has been idle for {IDLE_DAYS} days yet, so none can be removed: it may still be resumed.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
