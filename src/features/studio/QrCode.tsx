'use client';

import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** A QR code for a link (2026-10-13): for reception desks, brochures and table
 *  cards. Drawn as one SVG path from the code's modules; downloads as PNG (for
 *  printing) or SVG (for a designer). Give it the link with ?src=qr on it, so the
 *  report counts the visits it brings. */
export function QrCode({ url, name }: { url: string; name: string }) {
  const { n, d } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return { n: count, d: path };
  }, [url]);
  const pad = 3; // the quiet zone scanners need
  const size = n + pad * 2;

  const save = (href: string, ext: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = `${name}-qr.${ext}`;
    a.click();
  };
  const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${size} ${size}" shape-rendering="crispEdges"><rect x="${-pad}" y="${-pad}" width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  const png = () => {
    const cell = 16; // 1000-odd px: sharp on an A4 print
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size * cell;
    const g = canvas.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = '#000';
    g.setTransform(cell, 0, 0, cell, pad * cell, pad * cell);
    g.fill(new Path2D(d));
    save(canvas.toDataURL('image/png'), 'png');
  };

  return (
    <div className="qr">
      <svg viewBox={`${-pad} ${-pad} ${size} ${size}`} shapeRendering="crispEdges" role="img" aria-label={`QR code for ${url}`}>
        <rect x={-pad} y={-pad} width={size} height={size} fill="#fff" />
        <path d={d} fill="#000" />
      </svg>
      <span className="qr-actions">
        <button type="button" onClick={png}>Download PNG</button>
        <button type="button" onClick={() => save(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`, 'svg')}>SVG</button>
      </span>
    </div>
  );
}
