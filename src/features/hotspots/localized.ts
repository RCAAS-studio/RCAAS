import type { Hotspot } from '../../@types/hotspot.types';

/** A hotspot in the visitor's language (2026-10-13): its translated name, text
 *  and caption where the studio has them (Hotspot.i18n), each one else as
 *  written. English, or no translation, gives the hotspot back unchanged. */
export function localized(h: Hotspot, lang: string): Hotspot {
  const w = lang === 'ne' || lang === 'zh' ? h.i18n?.[lang] : undefined;
  if (!w) return h;
  return {
    ...h,
    label: w.label?.trim() || h.label,
    payload: {
      ...h.payload,
      ...(w.text?.trim() && h.payload?.text ? { text: w.text } : {}),
      ...(w.caption?.trim() && h.payload?.caption ? { caption: w.caption } : {})
    }
  };
}
