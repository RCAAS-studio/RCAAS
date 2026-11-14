'use client';

import { useState } from 'react';
import { ask } from '../../components/ui/Ask';
import { draftBackup, reloadDraft } from './draftActions';

/** Recovery is explicit: download local work, then choose whether to replace it. */
export function DraftRecovery({ sceneId, conflict, onReload }: { sceneId: string; conflict: boolean; onReload: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([draftBackup(sceneId)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sceneId.replace(/[^a-zA-Z0-9_-]/g, '_')}-local-draft.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Draft download started. Keep this copy before loading the server draft.');
    } catch { setMessage('The draft could not be downloaded. Your changes are still in this tab.'); }
  };
  const reload = async () => {
    if (busy) return;
    if (!(await ask({ title: 'Load the server draft?', body: 'This replaces your local edits and undo history with the latest saved draft. Download your local draft first if you want to keep it. The live tour will not change.', action: 'Load server draft', danger: true }))) return;
    setBusy(true); setMessage('');
    try { await reloadDraft(sceneId); onReload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load the draft. Your local edits are still here.'); }
    finally { setBusy(false); }
  };
  return <div className="ed2-recovery">
    <p>{conflict ? 'This draft changed in another tab or session. Your local edits are still here.' : 'Your local edits are still here. You can download a copy before trying again.'}</p>
    <div className="ed2-recovery-actions">
      <button type="button" onClick={download} disabled={busy}>Download local draft</button>
      {conflict && <button type="button" onClick={reload} disabled={busy}>{busy ? 'Loading…' : 'Load server draft'}</button>}
    </div>
    {message && <p role="status">{message}</p>}
  </div>;
}
