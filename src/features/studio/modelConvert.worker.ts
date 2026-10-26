/*
 * convertModel (modelConvert.ts) off the studio's main thread, so a big FBX or
 * OBJ no longer freezes the tab while it is read, exported and compressed.
 * upload.ts starts it, and converts on the main thread instead if it fails.
 */
import * as THREE from 'three';
import { convertModel } from './modelConvert';

// A worker has no <img>, and FBX and MTL textures load through ImageLoader:
// decode them with createImageBitmap instead. Same pixels and orientation, so
// the exporter (an OffscreenCanvas here) writes the same textures.
THREE.ImageLoader.prototype.load = function (url, onLoad, _onProgress, onError) {
  const src = this.manager.resolveURL((this.path ?? '') + url);
  this.manager.itemStart(src);
  fetch(src).then((r) => r.blob()).then((b) => createImageBitmap(b)).then(
    (image) => { onLoad?.(image as unknown as HTMLImageElement); this.manager.itemEnd(src); },
    (err) => { onError?.(err); this.manager.itemError(src); this.manager.itemEnd(src); }
  );
  return undefined as unknown as HTMLImageElement; // TextureLoader only uses onLoad
};

const ctx = self as unknown as { postMessage(m: unknown): void; onmessage: ((e: MessageEvent) => void) | null };
ctx.onmessage = async ({ data }) => {
  try {
    ctx.postMessage({ done: await convertModel(data.files, { up: data.up, onStage: (stage) => ctx.postMessage({ stage }) }) });
  } catch (e) {
    // our own messages (no geometry, a splat PLY…) are plain Errors: the main thread would only fail again
    ctx.postMessage({ error: e instanceof Error ? e.message : String(e), retry: !(e instanceof Error) || e.name !== 'Error' });
  }
};
