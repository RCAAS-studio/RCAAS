import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './dataDir.js';
import { propertyIsVisible } from './store.js';
import { assetReferences, mergeAssetReferences, referencesFile } from './assetReferences.js';
import { assetRecord } from './assetCatalog.js';
import { assetDataRevision } from './assetChanges.js';
import { withWriteLock } from './writeQueue.js';
import * as storage from './storage.js';

let cached;
async function records(group) {
  const dir = path.join(DATA_DIR, group);
  let files;
  try { files = await fs.readdir(dir); } catch (error) { if (error.code === 'ENOENT') return new Map(); throw error; }
  const out = new Map();
  for (const name of files.filter(name => name.endsWith('.json'))) {
    const value = JSON.parse(await fs.readFile(path.join(dir, name), 'utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid asset reference document.');
    out.set(name.slice(0, -5), value);
  }
  return out;
}

/** Indexed once per data change, with a short refresh for out-of-process repairs.
 * All in-process document mutations and deletions share the documents queue. */
export const assetGraph = () => withWriteLock('documents', async () => {
  const revision = assetDataRevision();
  if (cached?.revision === revision && Date.now() - cached.at < 1000) return cached;
  const [properties, scenes, sites] = await Promise.all([records('properties'), records('scenes'), records('sites')]);
  const publicFiles = new Map(), references = new Map();
  const add = (type, id, value, scope) => {
    for (const [assetId, ref] of assetReferences(value)) {
      const list = references.get(assetId) ?? [];
      list.push({ type, id, ...scope, ref }); references.set(assetId, list);
    }
  };
  for (const [id, property] of properties) {
    add('project', id, property, { propertyId: id });
    // Branding is already returned by the public /properties/:id/theme endpoint.
    mergeAssetReferences(publicFiles, assetReferences(property.theme));
  }
  for (const [key, scene] of scenes) {
    const id = key.split('@')[0], draft = scenes.get(id);
    add('scene', key, scene, { propertyId: draft?.propertyId ?? scene.propertyId ?? null, ownerId: draft?.ownerId ?? scene.ownerId ?? null });
    if (!key.includes('@') && scene.status === 'published' && Number.isInteger(scene.publishedVersion)) {
      const snapshot = scenes.get(`${key}@${scene.publishedVersion}`);
      if (snapshot) mergeAssetReferences(publicFiles, assetReferences(snapshot));
    }
  }
  for (const [id, site] of sites) {
    add('website', id, site, { propertyId: id });
    if (!site.published || !properties.has(id) || properties.get(id).features?.website === false) continue;
    for (const [assetId, ref] of assetReferences(site.published)) {
      // A website's image folder is shared with its draft: publish exact files.
      // Scan-derived plans must come from a space of this same project.
      const own = assetId === `site_${id}` || assetId === `brand_${id}` || references.get(assetId)?.some(source => source.type === 'scene' && source.propertyId === id);
      if (own) mergeAssetReferences(publicFiles, new Map([[assetId, ref]]));
    }
  }
  cached = { revision, at: Date.now(), properties, publicFiles, references };
  return cached;
});

const scopeAllows = (graph, session, source) => {
  if (!session || session.role === 'staff') return false;
  if (!session.sub) return true; // authenticated legacy development mode only
  const property = graph.properties.get(source.propertyId);
  return property ? propertyIsVisible(property, session) : source.ownerId === session.sub;
};
function privatelyAllows(graph, session, id, record) {
  if (!session || session.role === 'staff') return false;
  if (!session.sub || record?.ownerId === session.sub) return true;
  const projectId = /^(?:site|brand)_(.+)$/.exec(id)?.[1];
  if (projectId && scopeAllows(graph, session, { propertyId: projectId })) return true;
  return (graph.references.get(id) ?? []).some(source => scopeAllows(graph, session, source));
}

export async function readAssetAccess(session, id, file) {
  const [graph, record] = await Promise.all([assetGraph(), assetRecord(id)]);
  if (record && record.status !== 'ready') return { allowed: false, public: false };
  const published = referencesFile(graph.publicFiles, id, file);
  return { allowed: published || privatelyAllows(graph, session, id, record), public: published };
}

export async function mayManageAsset(session, id) {
  if (!session || session.role === 'staff') return false;
  const [graph, record] = await Promise.all([assetGraph(), assetRecord(id)]);
  const sources = graph.references.get(id) ?? [];
  if (sources.some(source => !scopeAllows(graph, session, source))) return false;
  return privatelyAllows(graph, session, id, record);
}

/** Prevent inserting a guessed private asset ID into one's own scene/site to
 * manufacture access. Missing legacy references keep the existing warning path. */
export async function assertAssetReferences(session, value) {
  const graph = await assetGraph();
  for (const [id, ref] of assetReferences(value)) {
    const record = await assetRecord(id);
    if (!record && !(await storage.exists(id))) continue;
    const publicRef = graph.publicFiles.get(id);
    const publicUse = !!publicRef && (publicRef.all || (!ref.all && [...ref.paths].every(file => publicRef.paths.has(file))));
    if ((record && record.status !== 'ready') || (!publicUse && !privatelyAllows(graph, session, id, record))) {
      throw Object.assign(new Error('An asset in this document is not available to your account. Upload it or ask its project owner to share access.'), { status: 403 });
    }
  }
}

export async function assertAssetUnreferenced(id) {
  const graph = await assetGraph();
  if (graph.references.get(id)?.length) throw Object.assign(new Error('This asset is still used by a draft, retained published version or website. Remove those references before deleting it.'), { status: 409 });
}
