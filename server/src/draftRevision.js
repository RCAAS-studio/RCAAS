import { createHash } from 'node:crypto';

// A revision is derived from content, so old files need no migration. Compare
// inside the document's write queue, not in middleware before acquiring it.
export const draftRevision = doc => createHash('sha256').update(JSON.stringify(doc)).digest('hex');
export function checkDraftRevision(expected, current) {
  if (expected !== undefined && expected !== draftRevision(current)) {
    throw Object.assign(new Error('This draft changed in another tab or session. Your edits are still here. Copy any changes you want to keep, then reload the latest draft before saving.'), { status: 409 });
  }
}
export const sceneDraft = ({ status: _status, publishedVersion: _version, publishedAt: _at, embed: _embed, ...draft }) => draft;
