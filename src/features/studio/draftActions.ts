/** Explicit draft actions; never replace local edits after a failed request. */
import { saveScene } from '../../lib/api';
import { docLoaded, loadSceneDoc, markSaved, sceneDocFor } from '../scene/sceneDoc';

export async function saveDraft(sceneId: string) {
  if (!docLoaded(sceneId)) await loadSceneDoc(sceneId, 'draft', { strict: true });
  // Store setters mutate arrays/objects. Freeze the payload in time so edits
  // made while fetch is pending cannot be incorrectly marked saved.
  const sent = structuredClone(sceneDocFor(sceneId));
  await saveScene(sceneId, sent);
  markSaved(sceneId, sent);
  return sent;
}

export const reloadDraft = (sceneId: string) => loadSceneDoc(sceneId, 'draft', { force: true, strict: true });
export const draftBackup = (sceneId: string) => JSON.stringify(sceneDocFor(sceneId), null, 2);

/** All words must match, in any order; Unicode labels are kept intact. */
export const matchesHierarchy = (query: string, ...values: (string | null | undefined)[]) => {
  const text = values.filter(Boolean).join(' ').toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).every(word => text.includes(word));
};
