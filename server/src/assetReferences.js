import path from 'node:path';

export const validAssetId = id => typeof id === 'string' && /^[A-Za-z0-9_-]+$/.test(id);

export function cleanAssetPath(value) {
  if (typeof value !== 'string' || !value) return null;
  let rel = value.replace(/\\/g, '/');
  if (rel.startsWith('/') || rel.split('/').includes('..') || /[:\0]/.test(rel)) return null;
  rel = path.posix.normalize(rel);
  return rel === '.' ? null : rel;
}

/** Structured asset IDs and complete media references, never substring matches. */
export function assetReferences(value, out = new Map()) {
  const add = (id, file = null) => {
    if (!validAssetId(id) || id.startsWith('local:')) return;
    const found = out.get(id) ?? { all: false, paths: new Set() };
    if (file === null) found.all = true;
    else { const rel = cleanAssetPath(file); if (rel) found.paths.add(rel); }
    out.set(id, found);
  };
  if (Array.isArray(value)) { for (const item of value) assetReferences(item, out); }
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'assetId' && typeof item === 'string') add(item);
      else assetReferences(item, out);
    }
  } else if (typeof value === 'string' && value.length < 8192) {
    const raw = /^asset:\/\/([A-Za-z0-9_-]+)\/(.+)$/.exec(value);
    if (raw) add(raw[1], raw[2]);
    else {
      const url = /^(?:https?:\/\/[^/]+)?\/api\/assets\/([A-Za-z0-9_-]+)\/(.+)$/.exec(value);
      if (url) { try { add(url[1], decodeURIComponent(url[2].split(/[?#]/)[0])); } catch { /* invalid URL grants nothing */ } }
      else {
        const stored = /^((?:ast|site|brand)_[A-Za-z0-9_-]+)\/(.+)$/.exec(value);
        if (stored) add(stored[1], stored[2].split(/[?#]/)[0]);
      }
    }
  }
  return out;
}

export function mergeAssetReferences(into, references) {
  for (const [id, value] of references) {
    const current = into.get(id) ?? { all: false, paths: new Set() };
    current.all ||= value.all;
    for (const file of value.paths) current.paths.add(file);
    into.set(id, current);
  }
}
export const referencesFile = (refs, id, file) => !!refs.get(id) && (refs.get(id).all || refs.get(id).paths.has(file));
