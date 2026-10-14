/* Floor plan from a Lixel Studio export, no Lixel Studio needed.
 *
 * Reads the export's collision mesh (data/mesh/*.ply: binary, Z-up, metres)
 * and the scanner's walked path (info/poses.json), then:
 *   1. finds the floor: the biggest flat level right under the walked path,
 *      within reach below the scanner (not a table top, not the ground outside
 *      or a storey below);
 *   2. cuts the mesh at floor + 1.5 m, as an architect's plan does (above
 *      desks, through windows);
 *   3. drops walls more than 3 m from the walked path (8 m outdoors, where
 *      there's no roof): rooms the scanner only saw through doors and
 *      windows. No path in the export: near the scanned floor instead;
 *   4. joins the cut into lines, removes the scan's wobble, turns the plan
 *      square to the building's own walls, snaps near-square walls square,
 *      joins a wall's pieces across small gaps, and drops furniture-sized
 *      round blobs (stools, plants) while keeping square ones (columns);
 *   5. tidies it as a draughtsman would (2026-10-14): a wall a few degrees
 *      off square is one straight wall, not a staircase (squared, unless that
 *      would put its ends more than 25 cm out); each wall line is exactly
 *      straight through its doors and windows; holes narrower than a door
 *      close; corners and T-junctions meet; whatever stands alone and doesn't
 *      reach 2 m (a lectern, a lamp, a person) goes; and each room's outline
 *      is squared onto the walls, so its size reads wall to wall.
 * Writes floorplan/plan.svg (2D), floorplan/3d.svg (walls raised, seen from
 * above at an angle) and floorplan/plan.json (walls, path, numbers) into the
 * asset. Runs on upload (routes/assets.js) and on demand from the studio.
 * Reads the export through storage.js, so it works with either driver. */
import { Readable } from 'node:stream';
import * as storage from './storage.js';

const CUT = 1.5; // m above the floor
const NEAR_IN = 3; // m: indoors, walls this close to the walked path
const NEAR_OUT = 8; // m: outdoors, facades stand further back from it
const SIMPLIFY = 0.05; // m: wobble smaller than this is scan noise
const SNAP = 6; // degrees: a wall this close to square is square
const SAME_LINE = 0.08; // m: pieces this close in offset are one wall face
const GAP = 0.25; // m: ... and join across gaps this narrow (a doorway is wider)
const SMALL = 0.8; // m: a curvy blob smaller than this is furniture or a plant
const SHORT = 0.25; // m: a straight piece shorter than this is clutter
const WALL_H = 2.4; // m, how high the 3D plan raises walls
const TEETH = 0.4; // m: what sticks out of a wall less than this at 1.5 m (flush cabinets, radiators) is against it, not part of it
const MIN_RUN = 0.4; // m: a straight stretch shorter than this isn't fitted as a wall
const SILL_CUT = 0.6; // m: the low cut, under window sills (windows)
const HIGH_CUT = 2.0; // m: the high cut: walls and columns reach it, furniture, lamps and people don't
const RCELL = 0.1; // m: the room grid
const SEAL = 0.3; // m: walls grow by this to seal scan gaps up to 0.6 m when finding rooms
const REACH = 3; // m: how far from the walked path an open-sided area still counts as room
const SLANT = 0.5; // m: a near-square wall whose ends differ by more than this across it is drawn slanted, as scanned
const ALIGN = 0.12; // m: pieces of one wall line (either side of a door, a window) this close in offset share one line
const HOLE = 0.6; // m: a gap narrower than a door, not walked through and with no sill under it, is a hole in the scan
const JOIN = 0.6; // m: a wall end this short of a wall across it is joined to it (a corner or a T)
const OVER = 0.3; // m: ... and one this far past it is cut back to it
const SCRAP = 0.6; // m: slanted scraps shorter than this in all are clutter

function readPly(buf) {
  const end = buf.indexOf('end_header\n') + 'end_header\n'.length;
  const head = buf.subarray(0, end).toString();
  const nv = +(head.match(/element vertex (\d+)/)?.[1] ?? 0);
  const nf = +(head.match(/element face (\d+)/)?.[1] ?? 0);
  const vprops = head.split('element face')[0].match(/property float \w+/g)?.length ?? 0;
  if (!/binary_little_endian/.test(head) || vprops < 3) return [];
  let o = end;
  const v = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++, o += vprops * 4) {
    v[i * 3] = buf.readFloatLE(o); v[i * 3 + 1] = buf.readFloatLE(o + 4); v[i * 3 + 2] = buf.readFloatLE(o + 8);
  }
  const tris = [];
  for (let i = 0; i < nf; i++) {
    const n = buf[o]; o += 1;
    const idx = [];
    for (let k = 0; k < n; k++, o += 4) idx.push(buf.readInt32LE(o));
    for (let k = 1; k + 1 < n; k++) {
      for (const j of [idx[0], idx[k], idx[k + 1]]) tris.push(v[j * 3], v[j * 3 + 1], v[j * 3 + 2]);
    }
  }
  return tris;
}

/** Pure: triangles (9 numbers each) + walked path (+ the author's marks,
 *  see markUp) → plan. Tested. */
export function planFrom(tris, walk = [], marks = null) {
  const nT = tris.length / 9;
  if (!nT) return null;

  // 1. flat horizontal area, in 5 cm height bins
  const bins = new Map();
  for (let t = 0; t < nT; t++) {
    const a = t * 9;
    const ux = tris[a + 3] - tris[a], uy = tris[a + 4] - tris[a + 1], uz = tris[a + 5] - tris[a + 2];
    const vx = tris[a + 6] - tris[a], vy = tris[a + 7] - tris[a + 1], vz = tris[a + 8] - tris[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz);
    if (len > 0 && Math.abs(nz) / len > 0.9) {
      const k = Math.round((tris[a + 2] + tris[a + 5] + tris[a + 8]) / 3 / 0.05);
      bins.set(k, (bins.get(k) ?? 0) + len / 2);
    }
  }
  if (!bins.size) return null;
  const floorZ = pickFloor(tris, bins, walk);
  const cutZ = floorZ + CUT;

  // indoors or out: a roof over most of what's underfoot means a room. The
  // ground outside slopes, so "underfoot" is everything flat up to 1 m over
  // the floor, not one level. (Outdoor scan: ~0.05; rooms: 0.3 and up.)
  let low = 0, ceiling = 0;
  for (const [k, area] of bins) {
    const z = k * 0.05 - floorZ;
    if (z > -0.5 && z <= 1) low += area;
    else if (z > 2 && z < 6) ceiling += area;
  }
  const near = ceiling < low * 0.2 ? NEAR_OUT : NEAR_IN;

  // 2. the cut. Each edge is cut with its two ends in a fixed order, so the
  //    two triangles sharing it get bit-identical points and chain up exactly.
  //    A second, low cut under the window sills finds windows later (glass
  //    is invisible to LiDAR: a window is a gap at 1.5 m, wall at 0.6 m).
  const cutAt = (z) => {
    const out = [];
    const hitOn = (a, b, hit) => {
      if (tris[a] > tris[b] || (tris[a] === tris[b] && tris[a + 1] > tris[b + 1])) [a, b] = [b, a];
      const za = tris[a + 2] - z, zb = tris[b + 2] - z;
      if (za * zb >= 0) return;
      const s = za / (za - zb);
      hit.push(tris[a] + (tris[b] - tris[a]) * s, tris[a + 1] + (tris[b + 1] - tris[a + 1]) * s);
    };
    for (let t = 0; t < nT; t++) {
      const hit = [];
      for (let e = 0; e < 3; e++) hitOn(t * 9 + e * 3, t * 9 + ((e + 1) % 3) * 3, hit);
      if (hit.length === 4) out.push(hit);
    }
    return out;
  };
  const segs = cutAt(cutZ);

  // 3. only walls near where the scanner walked — or, for an export without
  //    its path, near the floor it scanned
  let floorTris = [];
  for (let t = 0; t < nT; t++) {
    const a = t * 9;
    if (Math.abs((tris[a + 2] + tris[a + 5] + tris[a + 8]) / 3 - floorZ) > 0.25) continue;
    floorTris.push([tris[a], tris[a + 1], tris[a + 3], tris[a + 4], tris[a + 6], tris[a + 7]]);
  }
  const centre = (f) => [(f[0] + f[2] + f[4]) / 3, (f[1] + f[3] + f[5]) / 3];
  const refs = walk.length
    ? walk.filter((_, i) => i % 15 === 0).map((t) => [t[0], t[1]])
    : floorTris.filter((_, i) => i % Math.max(1, Math.ceil(floorTris.length / 4000)) === 0).map(centre);
  const isNear = nearTest(refs, near);
  const kept = segs.filter((s) => isNear((s[0] + s[2]) / 2, (s[1] + s[3]) / 2));
  if (!kept.length) return null;
  // the floor area counts only floor the scanner walked near: ground at the
  // same height outside a window isn't the room's
  if (walk.length) floorTris = floorTris.filter((f) => isNear(...centre(f)));
  const area = floorTris.reduce((s, f) => s + Math.abs((f[2] - f[0]) * (f[5] - f[1]) - (f[4] - f[0]) * (f[3] - f[1])) / 2, 0);

  // 4. join the cut into lines, and smooth out the scan's wobble
  const lines = chains(kept).map((c) => simplify(c, SIMPLIFY));

  // 5. square the plan up to the building's own walls
  const theta = dominantAngle(lines);
  const cos = Math.cos(theta), sin = Math.sin(theta);
  const rot = ([x, y]) => [x * cos + y * sin, -x * sin + y * cos];
  const rLines = lines.map((c) => c.map(rot));
  const rWalk = walk.map((t) => rot([t[0], t[1]]));
  // the low cut, under window sills (indoors only)
  const lowCut = near === NEAR_OUT ? [] : cutAt(floorZ + SILL_CUT)
    .filter((s) => isNear((s[0] + s[2]) / 2, (s[1] + s[3]) / 2))
    .map((s) => [...rot([s[0], s[1]]), ...rot([s[2], s[3]])]);

  // 6. straight walls snap square and join up; small curvy blobs (stools,
  //    plants) go; small square ones (columns) stay
  const H = [], V = [], other = [];
  for (const c of rLines) {
    const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]);
    const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const pieces = [];
    let square = true, axisLen = 0, allLen = 0;
    for (let i = 1; i < c.length; i++) {
      const [x0, y0] = c[i - 1], [x1, y1] = c[i];
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1e-3) continue;
      const deg = ((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 180) % 180;
      const kind = Math.min(deg, 180 - deg) < SNAP ? 'H' : Math.abs(deg - 90) < SNAP ? 'V' : 'O';
      if (kind === 'O' && len > 0.05) square = false;
      if (kind !== 'O') axisLen += len;
      allLen += len;
      pieces.push([kind, x0, y0, x1, y1, len, i]);
    }
    if (diag < SMALL && !square) continue;
    // a stretch of the line that stays inside a thin band along one axis is
    // one straight wall, teeth and all (curtain folds, radiators, shelving
    // against it at 1.5 m): fitted at its length-weighted median offset
    const fitted = new Uint8Array(c.length);
    for (const [i0, i1, kind, m] of straightRuns(c)) {
      const ax = kind === 'H' ? 0 : 1;
      const run = c.slice(i0, i1 + 1);
      const lo = Math.min(...run.map((q) => q[ax])), hi = Math.max(...run.map((q) => q[ax]));
      if (hi - lo < MIN_RUN) continue;
      // each piece's offset across the wall (on the leaning line, if it leans), by its length
      const offs = [];
      for (let i = i0 + 1; i <= i1; i++) {
        const mid = (k) => (c[i - 1][k] + c[i][k]) / 2;
        offs.push([mid(1 - ax) - m * mid(ax), Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1])]);
      }
      if (Math.abs(m) * (hi - lo) > SLANT) {
        // a long wall a few degrees off square: squaring it would put its
        // ends out by more than SLANT / 2, so it's drawn straight, as it leans
        const q = wMedian(offs), end = (t) => (ax === 0 ? [t, m * t + q] : [m * t + q, t]);
        other.push([...end(lo), ...end(hi)]);
      } else {
        // square, at the median offset: a wall a few degrees off square is
        // one wall, not a staircase of pieces
        const mid = (lo + hi) / 2;
        (kind === 'H' ? H : V).push({ at: wMedian(offs.map(([o, l]) => [o + m * mid, l])), a: lo, b: hi });
      }
      for (let i = i0 + 1; i <= i1; i++) fitted[i] = 1;
    }
    // a mostly square wall's short slanted bits are what's against it at
    // 1.5 m (curtain folds, frames, a lamp), not the wall: the zig-zag teeth
    const squareWall = axisLen >= allLen * 0.6;
    for (const [kind, x0, y0, x1, y1, len, i] of pieces) {
      if (fitted[i]) continue;
      if (kind === 'H') H.push({ at: (y0 + y1) / 2, a: Math.min(x0, x1), b: Math.max(x0, x1) });
      else if (kind === 'V') V.push({ at: (x0 + x1) / 2, a: Math.min(y0, y1), b: Math.max(y0, y1) });
      else if (!(squareWall && len < 0.3)) other.push([x0, y0, x1, y1]);
    }
  }
  // 7. tidy up, as a draughtsman would: each wall line exactly straight
  //    through its doors and windows, holes in the scan closed, corners and
  //    T-junctions meeting, and what's left loose and short of the ceiling
  //    dropped (a high cut tells walls and columns from furniture)
  const sillNear = nearTest(pointsAlong(lowCut), 0.12);
  const tallNear = nearTest(pointsAlong(cutAt(floorZ + HIGH_CUT)
    .filter((s) => isNear((s[0] + s[2]) / 2, (s[1] + s[3]) / 2))
    .map((s) => [...rot([s[0], s[1]]), ...rot([s[2], s[3]])])), 0.15);
  const sill = (o, c, a0, a1) => { // wall under the gap at sill height: a window
    let under = 0, n = 0;
    for (let a = a0 + 0.025; a < a1; a += 0.05, n++) if (o === 'h' ? sillNear(a, c) : sillNear(c, a)) under++;
    return n > 0 && under / n >= 0.6;
  };
  const tidy = (runs, o) => {
    const lined = alignRuns(mergeStairs(runs, o, other));
    return near === NEAR_OUT ? lined : closeHoles(lined, (c, a0, a1) => !walkedThrough(rWalk, o, c, a0, a1) && !sill(o, c, a0, a1));
  };
  const hRuns = tidy(joinSteps(mergeRuns(H)), 'h'), vRuns = tidy(joinSteps(mergeRuns(V)), 'v');
  const tidied = dropLoose(joinUp(dropScraps(dropStrays(clearTeeth([
    ...hRuns.map((r) => [r.a, r.at, r.b, r.at]),
    ...vRuns.map((r) => [r.at, r.a, r.at, r.b]),
    ...other
  ]))), rWalk), tallNear);
  // 7b. the author's own marks (the studio's floor plan section): rooms
  //     traced corner by corner, doors and windows side to side. They win.
  const { walls, traced, openings } = markUp(tidied, marks, rot);
  if (!walls.length) return null;

  // bounds: 0.2 % trimmed, so a last stray fragment can't stretch the drawing
  const xs = walls.flatMap((w) => [w[0], w[2]]).sort((a, b) => a - b);
  const ys = walls.flatMap((w) => [w[1], w[3]]).sort((a, b) => a - b);
  const pick = (arr, f) => arr[Math.floor((arr.length - 1) * f)];
  const box = [pick(xs, 0.002), pick(ys, 0.002), pick(xs, 0.998), pick(ys, 0.998)];
  const inBox = (x, y) => x > box[0] - 0.5 && x < box[2] + 0.5 && y > box[1] - 0.5 && y < box[3] + 0.5;

  const r2 = (n) => Math.round(n * 100) / 100;

  // 8. rooms, doors and windows (found indoors only; traced and marked anywhere)
  const inside = walls.filter((w) => inBox(w[0], w[1]) && inBox(w[2], w[3]));
  const byPath = near !== NEAR_OUT && rWalk.length > 0;
  const { rooms, doors, windows } = !byPath && !traced.length && !openings.length
    ? { rooms: [], doors: [], windows: [] }
    : roomsFrom(inside, byPath ? rWalk : [], lowCut, rLines, box, traced, openings);
  // a thick wall seen from both sides: two parallel faces 6–40 cm apart,
  // mostly overlapping → drawn solid between them
  const solids = [];
  for (const o of ['h', 'v']) {
    const f = inside
      .filter((w) => (o === 'h' ? Math.abs(w[1] - w[3]) < 0.02 : Math.abs(w[0] - w[2]) < 0.02))
      .map((w) => (o === 'h' ? [w[1], Math.min(w[0], w[2]), Math.max(w[0], w[2])] : [w[0], Math.min(w[1], w[3]), Math.max(w[1], w[3])]))
      .sort((m, n) => m[0] - n[0]);
    for (let i = 0; i < f.length; i++) {
      for (let j = i + 1; j < f.length && f[j][0] - f[i][0] <= 0.4; j++) {
        if (f[j][0] - f[i][0] < 0.06) continue;
        const a = Math.max(f[i][1], f[j][1]), b = Math.min(f[i][2], f[j][2]);
        if (b - a < 0.6 * Math.min(f[i][2] - f[i][1], f[j][2] - f[j][1])) continue;
        solids.push(o === 'h' ? [a, f[i][0], b, f[j][0]] : [f[i][0], a, f[j][0], b]);
      }
    }
  }

  return {
    version: 2,
    floorZ: r2(floorZ),
    cutHeight: CUT,
    /** degrees the scan was turned to square it up (scan frame -> plan frame) */
    rotation: r2((theta * 180) / Math.PI),
    outdoor: near === NEAR_OUT,
    rooms,
    doors,
    windows,
    solids: solids.map((b) => b.map(r2)),
    size: [r2(box[2] - box[0]), r2(box[3] - box[1])],
    floorArea: Math.round(area),
    box: box.map(r2),
    walls: walls.filter((w) => inBox(w[0], w[1]) && inBox(w[2], w[3])).map((w) => w.map(r2)),
    walk: rWalk.filter((p, i) => i % 5 === 0 && inBox(p[0], p[1])).map((p) => p.map(r2)),
    floor: floorTris
      .map((f) => [...rot([f[0], f[1]]), ...rot([f[2], f[3]]), ...rot([f[4], f[5]])])
      .filter((f) => inBox(f[0], f[1]))
      .map((f) => f.map(r2))
  };
}

/** The floor you stood on: the biggest flat level right under the walked
 *  path (within 1 m of it, sideways) and within reach below the scanner
 *  (0.3–2.2 m under its median height). Under the path, because the ground
 *  outside at a similar height is big too — on the team's canteen scan the
 *  ground outside (−1.15) is lower than the room's own floor (−0.8) and was
 *  picked before; within reach, so Floor 4's storey below (−4.35), seen down
 *  a stairwell, doesn't count. Without the path: the lowest level at least
 *  40 % the size of the biggest. Z-up metres. */
function pickFloor(tris, bins, walk) {
  const zs = walk.map((t) => t[2]).filter(Number.isFinite).sort((p, q) => p - q);
  if (zs.length) {
    const scanZ = zs[zs.length >> 1];
    const onPath = nearTest(walk.filter((_, i) => i % 5 === 0).map((t) => [t[0], t[1]]), 1);
    const under = new Map();
    for (let a = 0; a < tris.length; a += 9) {
      const z = (tris[a + 2] + tris[a + 5] + tris[a + 8]) / 3;
      if (z > scanZ - 0.3 || z < scanZ - 2.2) continue;
      const ux = tris[a + 3] - tris[a], uy = tris[a + 4] - tris[a + 1], uz = tris[a + 5] - tris[a + 2];
      const vx = tris[a + 6] - tris[a], vy = tris[a + 7] - tris[a + 1], vz = tris[a + 8] - tris[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz);
      if (!(len > 0 && Math.abs(nz) / len > 0.9)) continue;
      if (!onPath((tris[a] + tris[a + 3] + tris[a + 6]) / 3, (tris[a + 1] + tris[a + 4] + tris[a + 7]) / 3)) continue;
      const k = Math.round(z / 0.05);
      under.set(k, (under.get(k) ?? 0) + len / 2);
    }
    if (under.size) return [...under].reduce((m, q) => (q[1] > m[1] ? q : m))[0] * 0.05;
  }
  const top = Math.max(...bins.values());
  return [...bins].filter(([, a]) => a >= top * 0.4).map(([k]) => k * 0.05).sort((p, q) => p - q)[0];
}

/** A point test against a spatial hash of reference points. */
function nearTest(refs, r) {
  const grid = new Map();
  const cell = (v) => Math.floor(v / r);
  for (const [x, y] of refs) {
    const k = `${cell(x)},${cell(y)}`;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(x, y);
  }
  return (x, y) => {
    const cx = cell(x), cy = cell(y);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const pts = grid.get(`${cx + i},${cy + j}`);
        if (!pts) continue;
        for (let k = 0; k < pts.length; k += 2) if ((pts[k] - x) ** 2 + (pts[k + 1] - y) ** 2 < r * r) return true;
      }
    }
    return false;
  };
}

/** Segments that share end points, joined into polylines. */
function chains(segs) {
  const key = (x, y) => `${x},${y}`;
  const ends = new Map();
  segs.forEach((s, i) => {
    for (const k of [key(s[0], s[1]), key(s[2], s[3])]) {
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const out = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const fwd = [[segs[i][2], segs[i][3]]];
    const back = [[segs[i][0], segs[i][1]]];
    for (const line of [fwd, back]) {
      for (;;) {
        const [x, y] = line[line.length - 1];
        const k = key(x, y);
        const j = (ends.get(k) ?? []).find((n) => !used[n]);
        if (j === undefined) break;
        used[j] = 1;
        const s = segs[j];
        line.push(key(s[0], s[1]) === k ? [s[2], s[3]] : [s[0], s[1]]);
      }
    }
    out.push([...back.reverse(), ...fwd]);
  }
  return out;
}

/** Douglas–Peucker, iterative: drops points within `eps` of the line through
 *  their neighbours, so a straight wall's wobble becomes one segment. */
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const [ax, ay] = pts[i], [bx, by] = pts[j];
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    let far = -1, best = eps;
    for (let k = i + 1; k < j; k++) {
      const [px, py] = pts[k];
      let d;
      if (L2 === 0) d = Math.hypot(px - ax, py - ay);
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2));
        d = Math.hypot(px - ax - t * dx, py - ay - t * dy);
      }
      if (d > best) { best = d; far = k; }
    }
    if (far >= 0) { keep[far] = 1; stack.push([i, far], [far, j]); }
  }
  return pts.filter((_, k) => keep[k]);
}

/** The direction most wall length runs in, mod 90°, in radians (−45°…45°):
 *  a half-degree histogram finds the peak, then the walls near it are
 *  averaged exactly, the window narrowing (3°, 2°, 1.5°) so that a wall a
 *  few degrees off (a leaning facade) can't turn the square walls askew
 *  (until 2026-10-14 one 4° window did: one 8 m wall at 4.5° turned a room
 *  by 1.5°). Directions repeat every 90°, so the average is a circular one
 *  on 4θ: 89.8° and 0.1° are the same wall direction, not 45° apart. */
function dominantAngle(lines) {
  const segs = [];
  const hist = new Float64Array(180);
  for (const c of lines) {
    for (let i = 1; i < c.length; i++) {
      const dx = c[i][0] - c[i - 1][0], dy = c[i][1] - c[i - 1][1];
      const len = Math.hypot(dx, dy);
      if (len < 0.3) continue;
      const deg = (((Math.atan2(dy, dx) * 180) / Math.PI) % 90 + 90) % 90;
      segs.push([deg, len]);
      hist[Math.floor(deg * 2) % 180] += len;
    }
  }
  if (!segs.length) return 0;
  let peak = 0, best = -1;
  for (let d = 0; d < 180; d++) {
    let s = 0;
    for (let k = -2; k <= 2; k++) s += hist[(d + k + 180) % 180];
    if (s > best) { best = s; peak = d; }
  }
  let at = (peak + 0.5) / 2; // degrees
  for (const win of [3, 2, 1.5]) {
    let cx = 0, cy = 0;
    for (const [deg, len] of segs) {
      const off = ((deg - at) % 90 + 135) % 90 - 45; // signed, −45…45
      if (Math.abs(off) > win) continue;
      const r = (deg * 4 * Math.PI) / 180;
      cx += Math.cos(r) * len;
      cy += Math.sin(r) * len;
    }
    if (cx || cy) at = (Math.atan2(cy, cx) * 45) / Math.PI;
  }
  return (at * Math.PI) / 180;
}

/** One wall scanned as pieces that carry on end to end but step a few cm
 *  in or out (the scan drifts along a long wall): pieces within 15 cm of
 *  each other's line that meet end to end (overlapping 10 cm at most) become
 *  one wall on their length-weighted line. Parallel faces side by side (a
 *  thick wall's two sides) overlap more, and stay two. */
function joinSteps(runs) {
  const out = runs.map((r) => ({ ...r }));
  for (let again = true; again;) {
    again = false;
    out.sort((p, q) => p.a - q.a);
    for (let i = 0; i < out.length && !again; i++) {
      for (let j = 0; j < out.length; j++) {
        const p = out[i], q = out[j];
        if (i === j || Math.abs(p.at - q.at) > 0.15 || q.a < p.b - 0.1 || q.a - p.b > GAP) continue;
        const lp = p.b - p.a, lq = q.b - q.a;
        p.at = (p.at * lp + q.at * lq) / (lp + lq);
        p.b = Math.max(p.b, q.b);
        out.splice(j, 1);
        again = true;
        break;
      }
    }
  }
  return out;
}

/** A wall a few degrees off square that the cut broke into separate lines,
 *  each piece a few cm further out than the last (a staircase): three or more
 *  pieces end to end (within GAP), stepping the same way, that together stay
 *  inside a band TEETH wide around one line leaning less than SNAP, become one
 *  wall: square at the line's middle when its ends differ by SLANT or less
 *  across it, else as it leans (pushed onto `slanted` as [x0, y0, x1, y1]).
 *  Two pieces could be a real step in the wall, so they stay. */
function mergeStairs(runs, o, slanted) {
  const tan = Math.tan((SNAP * Math.PI) / 180);
  const fit = (seq) => { // least squares through the pieces' ends, each by its length
    let w = 0, su = 0, sv = 0, suu = 0, suv = 0;
    for (const r of seq) {
      const L = r.b - r.a;
      for (const u of [r.a, r.b]) { w += L; su += L * u; sv += L * r.at; suu += L * u * u; suv += L * u * r.at; }
    }
    const den = w * suu - su * su, m = den > 1e-9 ? (w * suv - su * sv) / den : 0, q = (sv - m * su) / w;
    if (Math.abs(m) > tan) return null;
    let lo = Infinity, hi = -Infinity;
    for (const r of seq) for (const u of [r.a, r.b]) { const d = r.at - (m * u + q); lo = Math.min(lo, d); hi = Math.max(hi, d); }
    return hi - lo <= TEETH ? { m, q } : null;
  };
  const sorted = [...runs].sort((p, q) => p.a - q.a), used = new Set(), out = [];
  for (const p of sorted) {
    if (used.has(p)) continue;
    const seq = [p];
    let line = null, step = 0;
    for (;;) {
      const last = seq.at(-1);
      const next = sorted
        .filter((q) => !used.has(q) && !seq.includes(q) && q.a >= last.b - 0.1 && q.a - last.b <= GAP
          && q.at !== last.at && Math.abs(q.at - last.at) <= TEETH && (!step || Math.sign(q.at - last.at) === step))
        .sort((x, y) => Math.abs(x.at - last.at) - Math.abs(y.at - last.at))[0];
      const f = next && fit([...seq, next]);
      if (!f) break;
      step = Math.sign(next.at - last.at);
      seq.push(next);
      line = f;
    }
    if (seq.length < 3) { out.push(p); continue; }
    for (const r of seq) used.add(r);
    const a = seq[0].a, b = Math.max(...seq.map((r) => r.b));
    if (Math.abs(line.m) * (b - a) > SLANT) {
      const end = (t) => (o === 'h' ? [t, line.m * t + line.q] : [line.m * t + line.q, t]);
      slanted.push([...end(a), ...end(b)]);
    } else out.push({ a, b, at: line.m * ((a + b) / 2) + line.q });
  }
  return out;
}

/** Pieces of one wall line, either side of a door, a window or a gap in the
 *  scan (within ALIGN of each other's offset, end to end and at most 4 m
 *  apart), take one offset, their length-weighted mean: the wall is one
 *  exactly straight line through its openings. Faces side by side (a thin
 *  wall's two sides) never share a line, nor do pieces more than ALIGN apart. */
function alignRuns(runs) {
  const out = runs.map((r) => ({ ...r }));
  const order = out.map((_, i) => i).sort((i, j) => out[i].at - out[j].at);
  const pairs = [];
  for (let x = 0; x < order.length; x++) {
    for (let y = x + 1; y < order.length && out[order[y]].at - out[order[x]].at <= ALIGN; y++) {
      const p = out[order[x]], q = out[order[y]];
      const gap = Math.max(p.a, q.a) - Math.min(p.b, q.b);
      if (gap >= -0.1 && gap <= 4) pairs.push([q.at - p.at, order[x], order[y]]);
    }
  }
  pairs.sort((m, n) => m[0] - n[0]);
  const group = out.map((_, i) => [i]), of = out.map((_, i) => i);
  const sideBySide = (p, q) => Math.min(p.b, q.b) - Math.max(p.a, q.a) > 0.1;
  for (const [, i, j] of pairs) {
    const gi = of[i], gj = of[j];
    if (gi === gj) continue;
    const all = [...group[gi], ...group[gj]], ats = all.map((k) => out[k].at);
    if (Math.max(...ats) - Math.min(...ats) > ALIGN) continue;
    if (group[gi].some((k) => group[gj].some((l) => sideBySide(out[k], out[l])))) continue;
    for (const l of group[gj]) of[l] = gi;
    group[gi] = all;
    group[gj] = [];
  }
  for (const g of group) {
    if (g.length < 2) continue;
    let w = 0, s = 0;
    for (const k of g) { const L = out[k].b - out[k].a; w += L; s += out[k].at * L; }
    for (const k of g) out[k].at = s / w;
  }
  return out;
}

/** Holes in the scan closed: two pieces of one wall line with a gap narrower
 *  than a door between them, which `hole(line, a0, a1)` says is no opening
 *  (nobody walked through it, no wall under it at sill height), become one
 *  wall. A plant, a curtain or a person in the way leaves such a hole. */
function closeHoles(runs, hole) {
  const lines = new Map();
  for (const r of runs) {
    const k = r.at.toFixed(4);
    if (!lines.has(k)) lines.set(k, []);
    lines.get(k).push({ ...r });
  }
  const out = [];
  for (const line of lines.values()) {
    line.sort((p, q) => p.a - q.a);
    let cur = line[0];
    for (const r of line.slice(1)) {
      const gap = r.a - cur.b;
      if (gap <= 0 || (gap <= HOLE && hole(cur.at, cur.b, r.a))) cur.b = Math.max(cur.b, r.b);
      else { out.push(cur); cur = r; }
    }
    out.push(cur);
  }
  return out;
}

/** Did the scanner walk through the opening from a0 to a1 in wall line c
 *  (o 'h': the line y = c)? Its path is seen on both sides of the line,
 *  within the opening's span. */
function walkedThrough(path, o, c, a0, a1) {
  const sides = new Set();
  for (const [pu, pv] of path) {
    const along = o === 'h' ? pu : pv, across = (o === 'h' ? pv : pu) - c;
    if (along > a0 && along < a1 && Math.abs(across) > 0.2 && Math.abs(across) < 1) sides.add(Math.sign(across));
  }
  return sides.size === 2;
}

/** Distance from a point to a wall (a segment). */
function segDist(px, py, [x0, y0, x1, y1]) {
  const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
  return Math.hypot(px - x0 - t * dx, py - y0 - t * dy);
}
const wallLen = (w) => Math.hypot(w[2] - w[0], w[3] - w[1]);
/** Is (x, y) inside the polygon [[x, y], …]? (even–odd rule) */
function inPoly(x, y, poly) {
  let isIn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) isIn = !isIn;
  }
  return isIn;
}
const isSquare = (w) => Math.abs(w[1] - w[3]) < 0.02 || Math.abs(w[0] - w[2]) < 0.02;
/** Is the end e (0, 1) of walls[i] on another wall (within 5 cm)? */
const joined = (walls, i, e) => walls.some((u, j) => j !== i && segDist(walls[i][e * 2], walls[i][e * 2 + 1], u) < 0.05);

/** Slanted scraps: slanted bits joined only to each other and under SCRAP
 *  long together (a chair back, a plant or a lamp at the end of a wall).
 *  They go, and the wall's end is joined up after. */
function dropScraps(walls) {
  const slanted = walls.map((_, i) => i).filter((i) => !isSquare(walls[i]));
  const parent = new Map(slanted.map((i) => [i, i]));
  const root = (i) => { while (parent.get(i) !== i) i = parent.get(i); return i; };
  for (const i of slanted) {
    for (const j of slanted) {
      if (j <= i) continue;
      const a = walls[i], b = walls[j];
      if (Math.min(segDist(a[0], a[1], b), segDist(a[2], a[3], b), segDist(b[0], b[1], a), segDist(b[2], b[3], a)) < 0.05) parent.set(root(i), root(j));
    }
  }
  const total = new Map();
  for (const i of slanted) total.set(root(i), (total.get(root(i)) ?? 0) + wallLen(walls[i]));
  return walls.filter((_, i) => !parent.has(i) || total.get(root(i)) >= SCRAP);
}

/** Wall ends that stop short of a wall across them, or run just past it,
 *  joined the way a draughtsman closes a plan: a loose end within JOIN of
 *  another wall's line moves to where the two meet (a T), and when that
 *  wall's own loose end is within JOIN of the meeting point too, it moves
 *  there as well (a corner); an end up to OVER past the wall is cut back to
 *  it. Never across a third wall, nor across a stretch wider than 30 cm that
 *  the scanner walked through (a doorway by a corner). The smallest moves go
 *  first; a second round finishes what the first one made possible. */
function joinUp(walls, path) {
  const W = walls.map((w) => [...w]);
  const steps = []; // the walked path in 20 cm steps
  for (const p of path) if (!steps.length || Math.hypot(p[0] - steps.at(-1)[0], p[1] - steps.at(-1)[1]) >= 0.2) steps.push(p);
  const across = (s, w) => { // does stretch s cross segment w (not at s's far end)?
    const rx = s[2] - s[0], ry = s[3] - s[1], qx = w[2] - w[0], qy = w[3] - w[1], den = rx * qy - ry * qx;
    if (Math.abs(den) < 1e-12) return false;
    const t = ((w[0] - s[0]) * qy - (w[1] - s[1]) * qx) / den, v = ((w[0] - s[0]) * ry - (w[1] - s[1]) * rx) / den;
    return t > 0 && t < 1 - 0.02 / Math.hypot(rx, ry) && v >= 0 && v <= 1;
  };
  const walked = (s) => steps.some((p, k) => k > 0 && across(s, [...steps[k - 1], ...p]));
  for (let round = 0; round < 2; round++) {
    const cands = [];
    W.forEach((w, i) => {
      const L = wallLen(w);
      if (L < 1e-6) return;
      const dx = (w[2] - w[0]) / L, dy = (w[3] - w[1]) / L;
      for (const e of [0, 1]) {
        if (joined(W, i, e)) continue;
        const ex = w[e * 2], ey = w[e * 2 + 1], out = e ? 1 : -1;
        W.forEach((u, j) => {
          const uL = wallLen(u);
          if (j === i || uL < 1e-6) return;
          const ux = (u[2] - u[0]) / uL, uy = (u[3] - u[1]) / uL, cross = dx * uy - dy * ux;
          if (Math.abs(cross) < 0.5) return; // within 30° of parallel: not across it
          const t = ((u[0] - ex) * uy - (u[1] - ey) * ux) / cross; // from w's end to where they meet
          const s = ((u[0] - ex) * dy - (u[1] - ey) * dx) / cross; // along u
          const grow = t * out; // > 0: w grows; < 0: w is cut back
          if (grow > JOIN || grow < -OVER || -grow > L - 0.05) return;
          const ue = s < -0.02 ? 0 : s > uL + 0.02 ? 1 : -1, ugrow = ue === 0 ? -s : ue === 1 ? s - uL : 0;
          if (ugrow > JOIN || (ue >= 0 && joined(W, j, ue))) return;
          if (grow < 0 && ue >= 0) return; // cut back only onto the wall itself
          if (Math.abs(grow) < 0.005 && ugrow < 0.005) return;
          cands.push({ cost: Math.abs(grow) + ugrow, i, e, j, ue, grow, x: ex + t * dx, y: ey + t * dy });
        });
      }
    });
    cands.sort((a, b) => a.cost - b.cost);
    const moved = new Set();
    for (const c of cands) {
      if (moved.has(`${c.i}:${c.e}`) || (c.ue >= 0 && moved.has(`${c.j}:${c.ue}`))) continue;
      const w = W[c.i], u = W[c.j];
      const news = [];
      if (c.grow > 0) news.push([w[c.e * 2], w[c.e * 2 + 1], c.x, c.y]);
      if (c.ue >= 0) news.push([u[c.ue * 2], u[c.ue * 2 + 1], c.x, c.y]);
      if (news.some((s) => W.some((o, k) => k !== c.i && k !== c.j && across(s, o)))) continue;
      if (news.some((s) => wallLen(s) > 0.3 && walked(s))) continue;
      w[c.e * 2] = c.x; w[c.e * 2 + 1] = c.y;
      moved.add(`${c.i}:${c.e}`);
      if (c.ue >= 0) { u[c.ue * 2] = c.x; u[c.ue * 2 + 1] = c.y; moved.add(`${c.j}:${c.ue}`); }
    }
  }
  return W;
}

/** Something in the room, not a wall: whatever stands on its own (touching
 *  no wall), under 2 m across, and not tall (less than half of it reaches
 *  the high cut, `tall(x, y)`): a lectern, a screen, a lamp, a plant, a
 *  person. A column or a free-standing wall reaches the ceiling and stays;
 *  so does anything joined to the building. */
function dropLoose(walls, tall) {
  const n = walls.length, parent = Array.from({ length: n }, (_, i) => i);
  const root = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  const touch = (a, b) => Math.min(segDist(a[0], a[1], b), segDist(a[2], a[3], b), segDist(b[0], b[1], a), segDist(b[2], b[3], a)) < 0.05;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (touch(walls[i], walls[j])) parent[root(i)] = root(j);
  const parts = new Map();
  walls.forEach((w, i) => {
    const r = root(i), p = parts.get(r) ?? { box: [Infinity, Infinity, -Infinity, -Infinity], walls: [] };
    p.box = [Math.min(p.box[0], w[0], w[2]), Math.min(p.box[1], w[1], w[3]), Math.max(p.box[2], w[0], w[2]), Math.max(p.box[3], w[1], w[3])];
    p.walls.push(w);
    parts.set(r, p);
  });
  for (const p of parts.values()) {
    const pts = pointsAlong(p.walls);
    p.keep = Math.hypot(p.box[2] - p.box[0], p.box[3] - p.box[1]) >= 2 || pts.filter(([x, y]) => tall(x, y)).length >= pts.length / 2;
  }
  return walls.filter((_, i) => parts.get(root(i)).keep);
}

/** The author's marks on the plan (2026-10-14), in the plan frame (`rot`
 *  turns the scan's x, y into it). `marks`, as the studio saves them in the
 *  scan's own frame (cleanMarks): { rooms: [{ corners: [[x, y, z], …] }],
 *  openings: [{ kind: 'door' | 'window', a: [x, y, z], b: [x, y, z] }] }.
 *  A traced room's edges are squared when within MARK_SNAP of square and
 *  moved onto the scanned wall face they follow (within ONTO), its corners
 *  where those meet: the outline is the author's, its precision the scan's.
 *  Its edges become walls, in place of the ones guessed on the same lines.
 *  A marked opening is cut into the wall it's in and is what it was marked,
 *  whatever the scan suggested. → { walls, traced: outlines, openings:
 *  [{ kind, o, a0, a1, c }] } */
function markUp(walls, marks, rot) {
  if (!marks) return { walls, traced: [], openings: [] };
  const traced = (marks.rooms ?? []).map((r) => traceRoom(r.corners.map((p) => rot([p[0], p[1]])), walls)).filter(Boolean);
  let all = walls;
  for (const t of traced.flatMap(edgesOf)) all = all.flatMap((w) => besides(w, t));
  all = [...all, ...traced.flatMap(edgesOf)];
  const openings = [];
  for (const m of marks.openings ?? []) {
    const a = rot([m.a[0], m.a[1]]), b = rot([m.b[0], m.b[1]]);
    const o = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]) ? 'h' : 'v', k = o === 'h' ? 1 : 0, u = 1 - k;
    const a0 = Math.min(a[u], b[u]), a1 = Math.max(a[u], b[u]), mid = (a[k] + b[k]) / 2;
    if (a1 - a0 < 0.2) continue;
    // the wall it's in: the nearest one that way within 50 cm, reaching it
    const host = all
      .filter((w) => axisOf(w) === o && Math.abs(w[k] - mid) <= 0.5 && Math.min(w[u], w[u + 2]) < a1 + 1 && Math.max(w[u], w[u + 2]) > a0 - 1)
      .sort((p, q) => Math.abs(p[k] - mid) - Math.abs(q[k] - mid))[0];
    const c = host ? host[k] : mid;
    all = all.flatMap((w) => (axisOf(w) === o && Math.abs(w[k] - c) < 0.05 ? cutOut(w, a0, a1) : [w]));
    openings.push({ kind: m.kind, o, a0, a1, c });
  }
  return { walls: all, traced, openings };
}

const MARK_SNAP = 12; // degrees: a traced edge this close to square is square (clicks land a few cm out)
const ONTO = 0.25; // m: a traced edge moves onto a scanned wall face this close to it
const axisOf = (w) => (Math.abs(w[1] - w[3]) < 0.02 ? 'h' : Math.abs(w[0] - w[2]) < 0.02 ? 'v' : null);
const edgesOf = (poly) => poly.map((p, i) => [...p, ...poly[(i + 1) % poly.length]]);

/** A room traced corner by corner (plan frame), cleaned up: repeated
 *  clicks dropped, each edge squared when within MARK_SNAP of square and
 *  moved onto the scanned wall face it runs along (within ONTO, along at
 *  least a third of it), corners where neighbouring edges meet. A click
 *  partway along a straight wall is dropped; two parallel edges that don't
 *  line up get a step between them, at the click. Null under 3 corners. */
function traceRoom(clicked, walls) {
  const pts = clicked.filter((p, i) => {
    const q = clicked[(i + clicked.length - 1) % clicked.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.05;
  });
  const n = pts.length;
  if (n < 3) return null;
  const edges = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    const deg = (((Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI) + 180) % 180;
    const o = Math.min(deg, 180 - deg) <= MARK_SNAP ? 'h' : Math.abs(deg - 90) <= MARK_SNAP ? 'v' : null;
    if (!o) return { p, q };
    const k = o === 'h' ? 1 : 0, u = 1 - k, lo = Math.min(p[u], q[u]), hi = Math.max(p[u], q[u]);
    let c = (p[k] + q[k]) / 2, near = ONTO;
    for (const w of walls) {
      if (axisOf(w) !== o) continue;
      const along = Math.min(hi, Math.max(w[u], w[u + 2])) - Math.max(lo, Math.min(w[u], w[u + 2]));
      if (along >= (hi - lo) / 3 && Math.abs(w[k] - (p[k] + q[k]) / 2) < near) { near = Math.abs(w[k] - (p[k] + q[k]) / 2); c = w[k]; }
    }
    return { o, c };
  });
  const line = (e) => (e.o === 'h' ? [0, e.c, 1, 0] : e.o === 'v' ? [e.c, 0, 0, 1] : [e.p[0], e.p[1], e.q[0] - e.p[0], e.q[1] - e.p[1]]);
  const out = [];
  pts.forEach((p, i) => {
    const e0 = edges[(i + n - 1) % n], e1 = edges[i];
    if (e0.o && e0.o === e1.o) {
      if (Math.abs(e0.c - e1.c) < 0.05) return; // a click along a straight wall
      out.push(e0.o === 'h' ? [p[0], e0.c] : [e0.c, p[1]], e0.o === 'h' ? [p[0], e1.c] : [e1.c, p[1]]); // a step
      return;
    }
    const [ax, ay, adx, ady] = line(e0), [bx, by, bdx, bdy] = line(e1), cr = adx * bdy - ady * bdx;
    const t = Math.abs(cr) > 1e-9 ? ((bx - ax) * bdy - (by - ay) * bdx) / cr : NaN;
    const at = [ax + t * adx, ay + t * ady];
    out.push(Number.isFinite(t) && Math.hypot(at[0] - p[0], at[1] - p[1]) < 1 ? at : [p[0], p[1]]);
  });
  return out.length >= 3 ? out : null;
}

/** What's left of guessed wall w beside traced edge t: the part of it on
 *  t's line goes, so the wall isn't drawn twice. */
function besides(w, t) {
  const o = axisOf(w);
  if (!o || axisOf(t) !== o) return segDist(w[0], w[1], t) < 0.05 && segDist(w[2], w[3], t) < 0.05 ? [] : [w];
  const k = o === 'h' ? 1 : 0;
  return Math.abs(w[k] - t[k]) < 0.05 ? cutOut(w, Math.min(t[1 - k], t[3 - k]) - 0.05, Math.max(t[1 - k], t[3 - k]) + 0.05) : [w];
}

/** A square wall with the stretch from a0 to a1 along it cut out: the
 *  pieces either side (none shorter than 10 cm). */
function cutOut(w, a0, a1) {
  const o = axisOf(w), u = o === 'h' ? 0 : 1;
  const lo = Math.min(w[u], w[u + 2]), hi = Math.max(w[u], w[u + 2]);
  if (a1 <= lo || a0 >= hi) return [w];
  const piece = (s, e) => (o === 'h' ? [s, w[1], e, w[3]] : [w[0], s, w[2], e]);
  return [...(a0 - lo >= 0.1 ? [piece(lo, a0)] : []), ...(hi - a1 >= 0.1 ? [piece(a1, hi)] : [])];
}

/** Points every 5 cm along segments [x0, y0, x1, y1]. */
function pointsAlong(segs) {
  return segs.flatMap(([x0, y0, x1, y1]) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.05);
    return Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  });
}

/** What stands against a wall at 1.5 m (cabinets, shelving, frames) is cut
 *  as scraps just in front of it: slanted bits within 35 cm of a long
 *  straight wall, and short straight bits parallel to one, in front of it
 *  and within its length. They go; the wall stays. */
function clearTeeth(walls) {
  const NEAR = 0.35;
  const axis = (w) => (Math.abs(w[1] - w[3]) < 0.02 ? 'h' : Math.abs(w[0] - w[2]) < 0.02 ? 'v' : null);
  const len = (w) => Math.hypot(w[2] - w[0], w[3] - w[1]);
  const long = walls.filter((w) => axis(w) && len(w) >= 1);
  const toWall = (x, y, w) => (axis(w) === 'h'
    ? (x >= Math.min(w[0], w[2]) - 0.1 && x <= Math.max(w[0], w[2]) + 0.1 ? Math.abs(y - w[1]) : Infinity)
    : (y >= Math.min(w[1], w[3]) - 0.1 && y <= Math.max(w[1], w[3]) + 0.1 ? Math.abs(x - w[0]) : Infinity));
  return walls.filter((w) => {
    const o = axis(w);
    if (!o) return !long.some((l) => toWall(w[0], w[1], l) < NEAR && toWall(w[2], w[3], l) < NEAR);
    if (len(w) >= 1) return true;
    return !long.some((l) => l !== w && axis(l) === o && toWall(w[0], w[1], l) < NEAR && toWall(w[2], w[3], l) < NEAR
      && toWall(w[0], w[1], l) > 0.03);
  });
}

/** A line (plan frame) cut into stretches that each stay inside a band
 *  TEETH wide around one straight line within SNAP of an axis: [first point,
 *  last point, 'H' | 'V', its lean (across per along)]. The band may lean, so
 *  a wall a few degrees off square is one stretch, not a staircase of pieces
 *  stepping out a few cm at a time (before 2026-10-14 the band was square to
 *  the axis). Stretches that are neither (a real slanted wall) aren't returned.
 *  ponytail: refits the stretch per point, O(n²) per line; lines are short
 *  after simplify(). */
function straightRuns(c) {
  const out = [];
  if (c.length < 2) return out;
  const tan = Math.tan((SNAP * Math.PI) / 180);
  const fit = (s, e) => { // the stretch c[s..e] as [kind, lean], or null
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = s; i <= e; i++) {
      x0 = Math.min(x0, c[i][0]); x1 = Math.max(x1, c[i][0]); y0 = Math.min(y0, c[i][1]); y1 = Math.max(y1, c[i][1]);
    }
    const kind = x1 - x0 >= y1 - y0 ? 'H' : 'V', u = kind === 'H' ? 0 : 1, v = 1 - u;
    let n = 0, su = 0, sv = 0, suu = 0, suv = 0; // least squares: across = m · along + q
    for (let i = s; i <= e; i++) { const a = c[i][u], b = c[i][v]; n++; su += a; sv += b; suu += a * a; suv += a * b; }
    const den = n * suu - su * su, fitM = den > 1e-9 ? (n * suv - su * sv) / den : 0;
    // leaning less than SNAP, or else square to the axis (teeth and all)
    const m = Math.abs(fitM) <= tan ? fitM : 0;
    let lo = Infinity, hi = -Infinity;
    for (let i = s; i <= e; i++) { const r = c[i][v] - m * c[i][u]; lo = Math.min(lo, r); hi = Math.max(hi, r); }
    return hi - lo <= TEETH ? [kind, m] : null;
  };
  let s = 0, cur = fit(0, 1);
  for (let i = 2; i < c.length; i++) {
    const next = fit(s, i);
    if (next) { cur = next; continue; }
    if (cur && i - 1 > s) out.push([s, i - 1, ...cur]);
    s = i - 1;
    cur = fit(s, i);
  }
  if (cur && c.length - 1 > s) out.push([s, c.length - 1, ...cur]);
  return out;
}

/** The length-weighted median of [value, length] pairs. */
function wMedian(pairs) {
  const sorted = [...pairs].sort((m, n) => m[0] - n[0]);
  let half = sorted.reduce((t, o) => t + o[1], 0) / 2, at = sorted[0][0];
  for (const [o, l] of sorted) { at = o; if ((half -= l) <= 0) break; }
  return at;
}

/** Walls grouped by touching (ends within 0.6 m of another wall). The
 *  biggest group is the building; another group stays if it's substantial
 *  on its own (10 % of the building's length: a second block, outdoors), or
 *  is within 3 m of the building and not a scrap (3 % of all the walls: a
 *  corridor, a detached wall). Anything else is a stray seen through a window or a door, and
 *  goes, so it can't stretch the plan's size either.
 *  ponytail: O(n²) over walls; fine to a few thousand, grid it past that. */
function dropStrays(walls) {
  const n = walls.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const root = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  const toSeg = segDist;
  const TOUCH = 0.6;
  for (let i = 0; i < n; i++) {
    const a = walls[i];
    for (let j = i + 1; j < n; j++) {
      const b = walls[j];
      // cheap reject on bounding boxes first
      if (Math.min(a[0], a[2]) > Math.max(b[0], b[2]) + TOUCH || Math.min(b[0], b[2]) > Math.max(a[0], a[2]) + TOUCH) continue;
      if (Math.min(a[1], a[3]) > Math.max(b[1], b[3]) + TOUCH || Math.min(b[1], b[3]) > Math.max(a[1], a[3]) + TOUCH) continue;
      if (Math.min(toSeg(a[0], a[1], b), toSeg(a[2], a[3], b), toSeg(b[0], b[1], a), toSeg(b[2], b[3], a)) < TOUCH) {
        parent[root(i)] = root(j);
      }
    }
  }
  const len = (w) => Math.hypot(w[2] - w[0], w[3] - w[1]);
  const groups = new Map(); // root -> { len, box }
  walls.forEach((w, i) => {
    const r = root(i);
    const g = groups.get(r) ?? { len: 0, box: [Infinity, Infinity, -Infinity, -Infinity] };
    g.len += len(w);
    g.box = [Math.min(g.box[0], w[0], w[2]), Math.min(g.box[1], w[1], w[3]), Math.max(g.box[2], w[0], w[2]), Math.max(g.box[3], w[1], w[3])];
    groups.set(r, g);
  });
  if (!groups.size) return walls;
  const main = [...groups.values()].reduce((m, g) => (g.len > m.len ? g : m));
  const gap = (a, b) => Math.hypot(Math.max(0, a[0] - b[2], b[0] - a[2]), Math.max(0, a[1] - b[3], b[1] - a[3]));
  const total = [...groups.values()].reduce((t, g) => t + g.len, 0);
  const keep = (g) => g === main || g.len >= main.len * 0.1 || (gap(g.box, main.box) < 3 && g.len >= total * 0.03);
  return walls.filter((_, i) => keep(groups.get(root(i))));
}

/** Pieces of one wall face (same offset, give or take) joined across gaps
 *  narrower than a doorway; what's left too short is clutter. */
function mergeRuns(pieces) {
  pieces.sort((p, q) => p.at - q.at);
  const out = [];
  let i = 0;
  while (i < pieces.length) {
    let j = i + 1;
    while (j < pieces.length && pieces[j].at - pieces[i].at < SAME_LINE) j++;
    const group = pieces.slice(i, j).sort((p, q) => p.a - q.a);
    let run = null;
    for (const p of group) {
      if (run && p.a <= run.b + GAP) {
        run.b = Math.max(run.b, p.b);
        run.w += p.b - p.a;
        run.s += p.at * (p.b - p.a);
      } else {
        if (run) out.push(run);
        run = { a: p.a, b: p.b, w: p.b - p.a, s: p.at * (p.b - p.a) };
      }
    }
    if (run) out.push(run);
    i = j;
  }
  return out
    .filter((r) => r.b - r.a >= SHORT)
    .map((r) => ({ a: r.a, b: r.b, at: r.w ? r.s / r.w : 0 }));
}

/** Rooms, doors and windows, from the squared-up walls (plan frame, metres).
 *  A 0.3–4 m gap between two pieces of one straight wall line parts rooms:
 *  walked through (path seen on both sides) and 0.6–1.8 m wide, it's a door;
 *  nobody walked through and there's wall under it at sill height, a window.
 *  Rooms flood-fill from the walked path over indoor cells (walls in at least
 *  three of four directions: open ground outside has two open sides), with
 *  walls grown to seal scan gaps, then grow back out to the wall faces.
 *  Wider openings don't part rooms: that's an open-plan hall. */
function roomsFrom(walls, path, low, cut, box, traced = [], marked = []) {
  const r2 = (n) => Math.round(n * 100) / 100;
  const ou = box[0] - 1, ov = box[1] - 1;
  const RW = Math.ceil((box[2] - box[0] + 2) / RCELL), RH = Math.ceil((box[3] - box[1] + 2) / RCELL), N = RW * RH;
  const cellOf = (u, v) => {
    const x = Math.floor((u - ou) / RCELL), y = Math.floor((v - ov) / RCELL);
    return x >= 0 && y >= 0 && x < RW && y < RH ? y * RW + x : -1;
  };
  const draw = (m, x0, y0, x1, y1, pad = 0) => { // a line into a grid, thickened by pad
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (RCELL / 2)) + 1, r = Math.ceil(pad / RCELL);
    for (let i = 0; i <= n; i++) {
      const k = cellOf(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
      if (k < 0) continue;
      const cx = k % RW, cy = (k / RW) | 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx, y = cy + dy;
          if (x >= 0 && y >= 0 && x < RW && y < RH) m[y * RW + x] = 1;
        }
      }
    }
  };
  const lowAt = new Uint8Array(N), cutAtCell = new Uint8Array(N);
  for (const s of low) draw(lowAt, ...s);
  for (const c of cut) for (let i = 1; i < c.length; i++) draw(cutAtCell, c[i - 1][0], c[i - 1][1], c[i][0], c[i][1]);

  // openings: gaps between two pieces of one straight wall line
  const doors = [], windows = [], gaps = [];
  for (const o of ['h', 'v']) {
    const line = walls
      .filter((w) => (o === 'h' ? Math.abs(w[1] - w[3]) < 0.02 : Math.abs(w[0] - w[2]) < 0.02))
      .map((w) => (o === 'h'
        ? { c: w[1], a: Math.min(w[0], w[2]), b: Math.max(w[0], w[2]) }
        : { c: w[0], a: Math.min(w[1], w[3]), b: Math.max(w[1], w[3]) }));
    for (const w of line) {
      const next = line.filter((x) => x !== w && Math.abs(x.c - w.c) < 0.15 && x.a >= w.b).sort((p, q) => p.a - q.a)[0];
      if (!next || next.a - w.b < 0.3 || next.a - w.b > 4) continue;
      const g = { o, a0: w.b, a1: next.a, c: (w.c + next.c) / 2 };
      gaps.push(g);
      if (walkedThrough(path, o, g.c, g.a0, g.a1)) {
        if (g.a1 - g.a0 >= 0.6 && g.a1 - g.a0 <= 2) doors.push(g);
        continue;
      }
      let under = 0, n = 0;
      for (let a = g.a0 + RCELL / 2; a < g.a1; a += RCELL, n++) {
        for (const d of [-0.1, 0, 0.1]) {
          const k = o === 'h' ? cellOf(a, g.c + d) : cellOf(g.c + d, a);
          if (k >= 0 && lowAt[k]) { under++; break; }
        }
      }
      if (n && under / n >= 0.6) windows.push(g);
    }
  }
  // the author's doors and windows (markUp) are what they say, wherever they are
  const markedThere = (g) => marked.some((m) => m.o === g.o && Math.abs(m.c - g.c) <= 0.45 && Math.min(m.a1, g.a1) > Math.max(m.a0, g.a0));
  for (const list of [doors, windows]) list.splice(0, list.length, ...list.filter((g) => !markedThere(g)));
  for (const m of marked) { gaps.push(m); (m.kind === 'door' ? doors : windows).push(m); }

  const wallAt = new Uint8Array(N), shut = new Uint8Array(N);
  for (const w of walls) { draw(wallAt, ...w); draw(shut, ...w, SEAL); }
  for (const g of gaps) {
    const seg = g.o === 'h' ? [g.a0, g.c, g.a1, g.c] : [g.c, g.a0, g.c, g.a1];
    draw(wallAt, ...seg); draw(shut, ...seg, RCELL);
  }
  // indoors: a wall somewhere in at least three of the four directions
  const hits = new Uint8Array(N);
  for (let y = 0; y < RH; y++) {
    for (let x = 0, seen = 0; x < RW; x++) { const k = y * RW + x; if (wallAt[k]) seen = 1; else hits[k] += seen; }
    for (let x = RW - 1, seen = 0; x >= 0; x--) { const k = y * RW + x; if (wallAt[k]) seen = 1; else hits[k] += seen; }
  }
  for (let x = 0; x < RW; x++) {
    for (let y = 0, seen = 0; y < RH; y++) { const k = y * RW + x; if (wallAt[k]) seen = 1; else hits[k] += seen; }
    for (let y = RH - 1, seen = 0; y >= 0; y--) { const k = y * RW + x; if (wallAt[k]) seen = 1; else hits[k] += seen; }
  }
  const nearPath = new Uint8Array(N); // within REACH of the path, for open-sided areas
  const R = Math.ceil(REACH / RCELL);
  let last = null;
  for (const p of path) {
    if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.5) continue;
    last = p;
    const k = cellOf(p[0], p[1]);
    if (k < 0) continue;
    const px = k % RW, py = (k / RW) | 0;
    for (let y = Math.max(0, py - R); y <= Math.min(RH - 1, py + R); y++) {
      for (let x = Math.max(0, px - R); x <= Math.min(RW - 1, px + R); x++) if ((x - px) ** 2 + (y - py) ** 2 <= R * R) nearPath[y * RW + x] = 1;
    }
  }
  const nbrs = (q) => { const x = q % RW; return [x > 0 ? q - 1 : -1, x < RW - 1 ? q + 1 : -1, q - RW, q + RW]; };
  const label = new Int32Array(N).fill(-1);
  const found = [];
  // rooms the author traced (markUp) come first and are kept as they are:
  // the cells inside each outline
  for (const poly of traced) {
    const id = found.length, cells = [];
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    for (let v = Math.min(...ys) + RCELL / 2; v < Math.max(...ys); v += RCELL) {
      for (let u = Math.min(...xs) + RCELL / 2; u < Math.max(...xs); u += RCELL) {
        const k = cellOf(u, v);
        if (k >= 0 && label[k] < 0 && !wallAt[k] && inPoly(u, v, poly)) { label[k] = id; cells.push(k); }
      }
    }
    found.push({ cells, open: false, traced: true });
  }
  for (const p of path) {
    const k = cellOf(p[0], p[1]);
    if (k < 0 || shut[k] || hits[k] < 3 || label[k] >= 0) continue;
    const id = found.length, cells = [k], stack = [k];
    let open = false;
    label[k] = id;
    while (stack.length) {
      const q = stack.pop(), x = q % RW, y = (q / RW) | 0;
      if (x === 0 || y === 0 || x === RW - 1 || y === RH - 1) open = true;
      for (const n of nbrs(q)) if (n >= 0 && n < N && !shut[n] && hits[n] >= 3 && label[n] < 0) { label[n] = id; cells.push(n); stack.push(n); }
    }
    found.push({ cells, open });
  }
  for (const r of found) {
    if (r.open) r.cells = r.cells.filter((k) => { if (nearPath[k]) return true; label[k] = -1; return false; });
  }
  let front = found.flatMap((r) => r.cells); // grow back out to the wall faces
  for (let step = 0; step <= Math.ceil(SEAL / RCELL) + 3 && front.length; step++) {
    const next = [];
    for (const q of front) {
      for (const n of nbrs(q)) {
        if (n >= 0 && n < N && label[n] < 0 && !wallAt[n] && hits[n] >= 2 && (nearPath[n] || !found[label[q]].open)) {
          label[n] = label[q]; found[label[q]].cells.push(n); next.push(n);
        }
      }
    }
    front = next;
  }
  // an alcove (under 4 m², open along a third of its outline or more to a
  // room beside it, directly or across an opening that's no door or window:
  // a bay, a niche) is part of that room. A closet behind a door stays one.
  const openAt = new Uint8Array(N), solid = new Uint8Array(N);
  for (const g of gaps) if (!doors.includes(g) && !windows.includes(g)) draw(openAt, ...(g.o === 'h' ? [g.a0, g.c, g.a1, g.c] : [g.c, g.a0, g.c, g.a1]));
  for (const w of walls) draw(solid, ...w);
  found.forEach((r, id) => {
    if (r.traced || !r.cells.length || r.cells.length * RCELL * RCELL >= 4) return;
    const touch = new Map();
    let edge = 0;
    for (const k of r.cells) {
      for (const d of [1, -1, RW, -RW]) {
        const a = k + d, b = k + 2 * d;
        if (label[a] === id) continue;
        edge++;
        const to = label[a] >= 0 ? label[a] : openAt[a] && !solid[a] && label[b] >= 0 && label[b] !== id ? label[b] : -1;
        if (to >= 0) touch.set(to, (touch.get(to) ?? 0) + 1);
      }
    }
    const [to, n] = [...touch].sort((p, q) => q[1] - p[1])[0] ?? [-1, 0];
    if (to < 0 || n * 3 < edge) return;
    for (const k of r.cells) label[k] = to;
    found[to].cells.push(...r.cells);
    r.cells = [];
  });

  // a room is 60 cm across somewhere, both ways: a strip between the two
  // faces of a thick wall is no room
  const longest = (cells, step) => {
    const set = new Set(cells);
    let most = 0;
    for (const k of cells) {
      if (set.has(k - step) && (step !== 1 || k % RW)) continue; // not where a run starts
      let n = 1;
      while (set.has(k + n * step) && (step !== 1 || (k + n) % RW)) n++;
      most = Math.max(most, n);
    }
    return most;
  };
  const roomy = (r) => Math.min(longest(r.cells, 1), longest(r.cells, RW)) * RCELL >= 0.6;
  const rooms = found.filter((r) => (r.traced ? r.cells.length > 0 : r.cells.length * RCELL * RCELL >= 2 && roomy(r))).sort((a, b) => b.cells.length - a.cells.length).map((r, i) => {
    const set = new Set(r.cells);
    let x0 = RW, y0 = RH, x1 = 0, y1 = 0, sx = 0, sy = 0;
    for (const k of r.cells) {
      const x = k % RW, y = (k / RW) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); sx += x; sy += y;
    }
    const boxes = [], growing = new Map(); // row runs, stacked while identical
    for (let y = y0; y <= y1; y++) {
      const seen = new Set();
      for (let x = x0; x <= x1;) {
        if (!set.has(y * RW + x)) { x++; continue; }
        const s0 = x;
        while (x <= x1 && set.has(y * RW + x)) x++;
        const key = `${s0},${x}`, b = growing.get(key);
        seen.add(key);
        if (b && b[3] === y) b[3] = y + 1;
        else { const nb = [s0, y, x, y + 1]; boxes.push(nb); growing.set(key, nb); }
      }
      for (const key of [...growing.keys()]) if (!seen.has(key)) growing.delete(key);
    }
    // its label goes where the room is roomiest: furthest from its edges and
    // from anything cut inside it (ties: nearest the middle)
    const depth = new Map();
    let ring = r.cells.filter((k) => cutAtCell[k] || nbrs(k).some((n) => n < 0 || n >= N || !set.has(n)));
    for (const k of ring) depth.set(k, 0);
    for (let d = 1; ring.length; d++) {
      const next = [];
      for (const k of ring) for (const n of nbrs(k)) if (n >= 0 && n < N && set.has(n) && !depth.has(n)) { depth.set(n, d); next.push(n); }
      ring = next;
    }
    const mx = sx / r.cells.length, my = sy / r.cells.length;
    let at = r.cells[0], best = -Infinity;
    for (const [k, d] of depth) {
      const score = d - Math.hypot((k % RW) - mx, ((k / RW) | 0) - my) * 0.05;
      if (score > best) { best = score; at = k; }
    }
    const cellBoxes = boxes.map((b) => [ou + b[0] * RCELL, ov + b[1] * RCELL, ou + b[2] * RCELL, ov + b[3] * RCELL]);
    const sq = squareRoom(cellBoxes, walls);
    const rects = sq.length ? sq : cellBoxes;
    const ext = [Math.min(...rects.map((b) => b[0])), Math.min(...rects.map((b) => b[1])), Math.max(...rects.map((b) => b[2])), Math.max(...rects.map((b) => b[3]))];
    return {
      id: `r${i + 1}`,
      name: `Room ${i + 1}`,
      area: Math.round(rects.reduce((s, b) => s + (b[2] - b[0]) * (b[3] - b[1]), 0)),
      size: [r2(ext[2] - ext[0]), r2(ext[3] - ext[1])],
      at: [r2(ou + ((at % RW) + 0.5) * RCELL), r2(ov + (((at / RW) | 0) + 0.5) * RCELL)],
      rects: rects.map((b) => b.map(r2))
    };
  });
  const out = (g) => ({ o: g.o, a0: r2(g.a0), a1: r2(g.a1), c: r2(g.c) });
  // an opening seen in both faces of a thick wall is one door (or window):
  // the narrower of the two, the frame's own width
  const once = (list) => {
    const kept = [];
    for (const g of [...list].sort((p, q) => (p.a1 - p.a0) - (q.a1 - q.a0))) {
      if (!kept.some((k) => k.o === g.o && Math.abs(k.c - g.c) <= 0.45 && Math.min(k.a1, g.a1) - Math.max(k.a0, g.a0) > (k.a1 - k.a0) / 2)) kept.push(g);
    }
    return kept;
  };
  return { rooms, doors: once(doors).map(out), windows: once(windows).map(out) };
}

/** A room's outline squared up. `boxes` are its row bands in metres
 *  ([x0, y0, x1, y1], from the 10 cm room grid). Each edge within 0.2 m of a
 *  wall line along the room moves onto it, so the fill meets the walls and
 *  the room's size reads wall to wall; the ragged edges where no wall is (an
 *  open side, where the scanned floor ends unevenly) gather onto one line
 *  per 0.4 m, their length-weighted median. */
function squareRoom(boxes, walls) {
  const rx0 = Math.min(...boxes.map((b) => b[0])), rx1 = Math.max(...boxes.map((b) => b[2]));
  const ry0 = Math.min(...boxes.map((b) => b[1])), ry1 = Math.max(...boxes.map((b) => b[3]));
  // the wall lines along the room: x of the upright ones beside its rows, y of the level ones
  const xs = walls.filter((w) => Math.abs(w[0] - w[2]) < 0.02 && Math.max(w[1], w[3]) > ry0 && Math.min(w[1], w[3]) < ry1).map((w) => w[0]);
  const ys = walls.filter((w) => Math.abs(w[1] - w[3]) < 0.02 && Math.max(w[0], w[2]) > rx0 && Math.min(w[0], w[2]) < rx1).map((w) => w[1]);
  const weigh = (pairs) => { // [value, weight] with equal values added up
    const m = new Map();
    for (const [v, w] of pairs) m.set(v, (m.get(v) ?? 0) + w);
    return [...m];
  };
  const squared = (vals, lines) => { // value → where it goes
    const map = new Map(), loose = [];
    for (const [v, w] of vals) {
      const l = lines.reduce((m, x) => (Math.abs(x - v) < Math.abs(m - v) ? x : m), Infinity);
      if (Math.abs(l - v) <= 0.2) map.set(v, l); else loose.push([v, w]);
    }
    loose.sort((p, q) => p[0] - q[0]);
    for (let i = 0, j; i < loose.length; i = j) {
      for (j = i; j < loose.length && loose[j][0] - loose[i][0] <= 0.4; j++);
      const at = wMedian(loose.slice(i, j));
      for (let k = i; k < j; k++) map.set(loose[k][0], at);
    }
    return map;
  };
  const L = squared(weigh(boxes.map((b) => [b[0], b[3] - b[1]])), xs);
  const R = squared(weigh(boxes.map((b) => [b[2], b[3] - b[1]])), xs);
  const Y = squared(weigh(boxes.flatMap((b) => [[b[1], b[2] - b[0]], [b[3], b[2] - b[0]]])), ys);
  const out = [];
  for (const b of boxes) {
    const n = [L.get(b[0]), Y.get(b[1]), R.get(b[2]), Y.get(b[3])];
    if (n[2] - n[0] < 0.05 || n[3] - n[1] < 0.05) continue; // squeezed out
    const last = out.at(-1); // on the band below, as wide: one box
    if (last && last[0] === n[0] && last[2] === n[2] && last[3] === n[1]) last[3] = n[3];
    else out.push(n);
  }
  return out;
}

/** Screen colours (the studio, the tour, a dark site) and print colours
 *  (the plan sheet: white paper, dark ink, pale room tints). */
export const DARK = {
  bg: '#131419', floor: '#1E1F26', wall: '#F6F7FA', path: '#3364FF', text: '#B9BCCC', door: '#7C9CFF',
  floor3d: '#262833', tone: 150, edge: '#131419', label: '#F6F7FA',
  tints: ['#1E2233', '#1F2A2E', '#2A2233', '#22262E', '#1D2A36', '#2B2A22']
};
export const LIGHT = {
  bg: '#FFFFFF', floor: '#F3F4F7', wall: '#1D1D1F', path: '#3364FF', text: '#555A6B', door: '#2450E6',
  floor3d: '#E9EBF0', tone: 178, edge: '#3A3C44', label: '#1D1D1F',
  tints: ['#E8EDFB', '#E2F1EC', '#F1E7F5', '#ECEEF2', '#E1EEF8', '#F5EFDF']
};

/** 2D plan: walls, floor, walked path, 5 m scale bar, a caption. */
export function planSvg(p, title, ink = DARK) {
  const S = 40;
  const [x0, y0, x1, y1] = [p.box[0] - 0.5, p.box[1] - 0.5, p.box[2] + 0.5, p.box[3] + 0.5];
  const W = (x1 - x0) * S, H = (y1 - y0) * S;
  // Line weights and type grow with the building, so a 100 m site doesn't
  // come out hair-thin when it's shown at the same size as one room.
  const k = Math.max(1, Math.max(W, H) / 700);
  const sw = (3 * k).toFixed(1), fs = Math.round(16 * k), pad = Math.round(70 * k);
  const X = (x) => ((x - x0) * S).toFixed(1), Y = (y) => ((y1 - y) * S).toFixed(1);
  // overall dimensions, architect-style: a line with end ticks, the length on it
  const L = (p.box[0] - x0) * S, R = (p.box[2] - x0) * S, T = (y1 - p.box[3]) * S, B = (y1 - p.box[1]) * S;
  const d = -pad * 0.45, t = 6 * k;
  const bar = [100, 50, 20, 10, 5, 2, 1].find((m) => m <= Math.max(p.size[0], p.size[1]) / 4) ?? 1; // a round length, about a quarter of the plan
  const rooms = p.rooms ?? [];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2 + fs * 3}" font-family="Inter,Segoe UI,sans-serif">
<rect x="${-pad}" y="${-pad}" width="${W + pad * 2}" height="${H + pad * 2 + fs * 3}" fill="${ink.bg}"/>
<g fill="${ink.floor}">${p.floor.map((f) => `<path d="M${X(f[0])} ${Y(f[1])}L${X(f[2])} ${Y(f[3])}L${X(f[4])} ${Y(f[5])}Z"/>`).join('')}</g>
${rooms.length ? '' : `<polyline fill="none" stroke="${ink.path}" stroke-width="${(sw * 0.6).toFixed(1)}" stroke-dasharray="${4 * k} ${5 * k}" opacity="0.7" points="${p.walk.map((q) => `${X(q[0])},${Y(q[1])}`).join(' ')}"/>`}
${rooms.map((r, i) => `<path d="${r.rects.map((b) => `M${X(b[0])} ${Y(b[3])}H${X(b[2])}V${Y(b[1])}H${X(b[0])}Z`).join('')}" fill="${ink.tints[i % ink.tints.length]}" opacity="0.85" shape-rendering="crispEdges"/>`).join('')}
<g fill="${ink.wall}" opacity="0.55">${(p.solids ?? []).map((b) => `<path d="M${X(b[0])} ${Y(b[3])}H${X(b[2])}V${Y(b[1])}H${X(b[0])}Z"/>`).join('')}</g>
<g stroke="${ink.wall}" stroke-width="${sw}" stroke-linecap="square">${p.walls.map((w) => `<line x1="${X(w[0])}" y1="${Y(w[1])}" x2="${X(w[2])}" y2="${Y(w[3])}"/>`).join('')}</g>
<g stroke="${ink.wall}" stroke-width="${(k * 1.2).toFixed(1)}" fill="none">${(p.windows ?? []).map((g) => {
    const o = 4 * k; // a window: two thin lines along the opening
    return g.o === 'h'
      ? `<path d="M${X(g.a0)} ${(+Y(g.c) - o).toFixed(1)}H${X(g.a1)}M${X(g.a0)} ${(+Y(g.c) + o).toFixed(1)}H${X(g.a1)}"/>`
      : `<path d="M${(+X(g.c) - o).toFixed(1)} ${Y(g.a0)}V${Y(g.a1)}M${(+X(g.c) + o).toFixed(1)} ${Y(g.a0)}V${Y(g.a1)}"/>`;
  }).join('')}</g>
<g stroke="${ink.door}" stroke-width="${(k * 1.5).toFixed(1)}" fill="none">${(p.doors ?? []).map((g) => {
    const w = (g.a1 - g.a0) * S; // a door: its leaf, open, and its swing
    return g.o === 'h'
      ? `<path d="M${X(g.a0)} ${Y(g.c)}V${(+Y(g.c) - w).toFixed(1)}A${w.toFixed(1)} ${w.toFixed(1)} 0 0 1 ${X(g.a1)} ${Y(g.c)}"/>`
      : `<path d="M${X(g.c)} ${Y(g.a0)}H${(+X(g.c) + w).toFixed(1)}A${w.toFixed(1)} ${w.toFixed(1)} 0 0 0 ${X(g.c)} ${Y(g.a1)}"/>`;
  }).join('')}</g>
<g text-anchor="middle" fill="${ink.wall}" font-size="${fs}">${rooms.filter((r) => r.area >= 4).map((r) => {
    const x = X(r.at[0]), y = Y(r.at[1]), name = rooms.length === 1 && !r.named ? title : r.name;
    return `<text x="${x}" y="${y}" font-weight="700">${esc(name)}<tspan x="${x}" dy="${(fs * 1.2).toFixed(0)}" font-weight="400" fill="${ink.text}" font-size="${Math.round(fs * 0.85)}">${r.size[0].toFixed(1)} × ${r.size[1].toFixed(1)} m, ${r.area} m²</tspan></text>`;
  }).join('')}</g>
<g stroke="${ink.text}" stroke-width="${(k * 1.2).toFixed(1)}" fill="${ink.text}" font-size="${fs}">
<path d="M${L} ${d}H${R}M${L} ${d - t}V${d + t}M${R} ${d - t}V${d + t}" fill="none"/><text stroke="none" x="${(L + R) / 2}" y="${d - fs * 0.5}" text-anchor="middle">${p.size[0]} m</text>
<path d="M${d} ${T}V${B}M${d - t} ${T}H${d + t}M${d - t} ${B}H${d + t}" fill="none"/><text stroke="none" transform="translate(${d - fs * 0.5} ${(T + B) / 2}) rotate(-90)" text-anchor="middle">${p.size[1]} m</text>
<path d="M${W - bar * S} ${H + fs * 1.4}H${W}" stroke-width="${sw}"/><text stroke="none" x="${W - bar * S}" y="${H + fs * 0.9}">${bar} m</text>
<text stroke="none" x="0" y="${H + fs * 2.9}">${esc(title)}: ${p.size[0]} × ${p.size[1]} m, about ${p.floorArea} m² of floor scanned</text></g></svg>`;
}

/** 3D plan: walls raised from the cut, floor and path, from above-left. */
export function plan3dSvg(p, title, ink = DARK) {
  const cx = (p.box[0] + p.box[2]) / 2, cy = (p.box[1] + p.box[3]) / 2;
  const dist = Math.max(p.size[0], p.size[1]) * 1.6 + 4, f = 900, yaw = -0.6, pitch = 0.95;
  const proj = (x, y, z) => {
    const dx = x - cx, dy = y - cy;
    const rx = dx * Math.cos(yaw) - dy * Math.sin(yaw), ry = dx * Math.sin(yaw) + dy * Math.cos(yaw);
    const up = ry * Math.cos(pitch) + z * Math.sin(pitch);
    const depth = dist + ry * Math.sin(pitch) - z * Math.cos(pitch);
    return [(rx * f) / depth, (-up * f) / depth, depth];
  };
  const quads = p.walls.map((w) => {
    const pts = [proj(w[0], w[1], 0), proj(w[2], w[3], 0), proj(w[2], w[3], WALL_H), proj(w[0], w[1], WALL_H)];
    const tone = Math.round(ink.tone + (Math.abs(Math.atan2(w[3] - w[1], w[2] - w[0]) % Math.PI) / Math.PI) * 70);
    return { d: pts.reduce((m, q) => m + q[2], 0) / 4, pts, tone };
  }).sort((a, b) => b.d - a.d);
  const floors = p.floor.map((t) => [proj(t[0], t[1], 0), proj(t[2], t[3], 0), proj(t[4], t[5], 0)]);
  const all = [...quads.flatMap((q) => q.pts), ...floors.flat()];
  const bx0 = Math.min(...all.map((q) => q[0])) - 40, bx1 = Math.max(...all.map((q) => q[0])) + 40;
  const by0 = Math.min(...all.map((q) => q[1])) - 40, by1 = Math.max(...all.map((q) => q[1])) + 70;
  const P = (q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx0.toFixed(0)} ${by0.toFixed(0)} ${(bx1 - bx0).toFixed(0)} ${(by1 - by0).toFixed(0)}" font-family="Inter,Segoe UI,sans-serif">
<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" fill="${ink.bg}"/>
<g fill="${ink.floor3d}">${floors.map((t) => `<path d="M${P(t[0])}L${P(t[1])}L${P(t[2])}Z"/>`).join('')}</g>
${(p.rooms ?? []).length ? '' : `<polyline fill="none" stroke="${ink.path}" stroke-width="2" stroke-dasharray="4 5" points="${p.walk.map((t) => P(proj(t[0], t[1], 0.02)).replace(' ', ',')).join(' ')}"/>`}
${quads.map((q) => `<path d="M${q.pts.map(P).join('L')}Z" fill="rgb(${q.tone},${Math.min(255, q.tone + 4)},${Math.min(255, q.tone + 18)})" fill-opacity="0.92" stroke="${ink.edge}" stroke-width="0.5"/>`).join('')}
<g text-anchor="middle" fill="${ink.label}" font-size="16" font-weight="700">${(p.rooms ?? []).length > 1 ? p.rooms.filter((r) => r.area >= 4).map((r) => { const q = proj(r.at[0], r.at[1], 0.05); return `<text x="${q[0].toFixed(1)}" y="${q[1].toFixed(1)}">${esc(r.name)}</text>`; }).join('') : ''}</g>
<text x="${bx0 + 30}" y="${by1 - 24}" fill="${ink.text}" font-size="18">${esc(title)}: ${p.size[0]} × ${p.size[1]} m</text></svg>`;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Build and store the plan for an uploaded Lixel export. Null when the
 *  export has no collision mesh (a 3D-model space, or an old export). */
export async function buildFloorPlan(assetId, title = 'Floor plan') {
  // Through the storage seam, so it works whether the export is on this PC or in the bucket.
  const meshes = (await storage.list(assetId))
    .filter((rel) => !rel.startsWith('floorplan/') && rel.toLowerCase().endsWith('.ply') && rel.split('/').at(-2) === 'mesh');
  if (!meshes.length) return null;

  const tris = [];
  for (const rel of meshes) for (const n of readPly(await storage.readAll(assetId, rel))) tris.push(n);

  let path3 = [];
  const poses = meshes[0].replace(/(^|\/)data\/mesh\/[^/]+$/, '$1info/poses.json');
  try { path3 = JSON.parse((await storage.readAll(assetId, poses)).toString('utf8')).poses.map((q) => q.T); } catch { /* no path in this export */ }

  const plan = planFrom(tris, path3, await readMarks(assetId));
  if (!plan) return null;
  plan.title = title;
  await keepRoomNames(assetId, plan);
  await savePlan(assetId, plan);
  return { size: plan.size, floorArea: plan.floorArea, walls: plan.walls.length, rooms: plan.rooms.length, doors: plan.doors.length, windows: plan.windows.length };
}

/** Write the plan and every drawing of it: for screen (dark) and for print (light). */
export async function savePlan(assetId, plan) {
  const put = (rel, text) => storage.put(assetId, `floorplan/${rel}`, Readable.from([text]));
  const title = plan.title || 'Floor plan';
  await put('plan.json', JSON.stringify(plan));
  await put('plan.svg', planSvg(plan, title));
  await put('3d.svg', plan3dSvg(plan, title));
  await put('plan-print.svg', planSvg(plan, title, LIGHT));
  await put('3d-print.svg', plan3dSvg(plan, title, LIGHT));
}

/** The author's marks for a space's plan (the studio's floor plan section,
 *  used by markUp on the next redraw), cleaned: rooms traced corner by
 *  corner (3 to 64 corners, at most 40 rooms) and doors and windows marked
 *  side to side (at most 200); points [x, y, z] in the scan's own frame,
 *  metres to the millimetre. Anything else is dropped. */
export function cleanMarks(body) {
  const pt = (p) => (Array.isArray(p) && (p.length === 2 || p.length === 3)
    && p.every((n) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 1e4)
    ? [p[0], p[1], p[2] ?? 0].map((n) => Math.round(n * 1000) / 1000) : null);
  const rooms = (Array.isArray(body?.rooms) ? body.rooms : []).slice(0, 40)
    .map((r) => (Array.isArray(r?.corners) ? r.corners.slice(0, 64).map(pt) : []))
    .filter((c) => c.length >= 3 && c.every(Boolean))
    .map((corners) => ({ corners }));
  const openings = (Array.isArray(body?.openings) ? body.openings : []).slice(0, 200)
    .map((m) => ({ kind: m?.kind === 'door' || m?.kind === 'window' ? m.kind : null, a: pt(m?.a), b: pt(m?.b) }))
    .filter((m) => m.kind && m.a && m.b);
  return { version: 1, rooms, openings };
}

/** Null when the space has no drawn plan to mark. */
export async function saveMarks(assetId, body) {
  if (!(await readPlan(assetId))) return null;
  const marks = cleanMarks(body);
  await storage.put(assetId, 'floorplan/marks.json', Readable.from([JSON.stringify(marks)]));
  return marks;
}

async function readMarks(assetId) {
  try { return cleanMarks(JSON.parse((await storage.readAll(assetId, 'floorplan/marks.json')).toString('utf8'))); } catch { return null; }
}

async function readPlan(assetId) {
  try { return JSON.parse((await storage.readAll(assetId, 'floorplan/plan.json')).toString('utf8')); } catch { return null; }
}

/** A redraw keeps the names people gave rooms: each new room takes the name
 *  of an old named room whose label point falls inside it. */
async function keepRoomNames(assetId, plan) {
  const old = await readPlan(assetId);
  if (!old?.rooms?.length || !plan.rooms?.length) return;
  for (const r of plan.rooms) {
    const was = old.rooms.find((o) => o.named && r.rects.some((b) => o.at[0] >= b[0] && o.at[0] <= b[2] && o.at[1] >= b[1] && o.at[1] <= b[3]));
    if (was) { r.name = was.name; r.named = true; }
  }
}

/** Name rooms, e.g. { r1: 'Lobby', r2: 'Bar' }; an empty name puts a room
 *  back to its number. Redraws every drawing. Null when there's no plan. */
export async function renameRooms(assetId, names) {
  const plan = await readPlan(assetId);
  if (!plan?.rooms) return null;
  plan.rooms.forEach((r, i) => {
    if (!Object.hasOwn(names, r.id)) return;
    const name = String(names[r.id] ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
    r.name = name || `Room ${i + 1}`;
    r.named = !!name;
  });
  await savePlan(assetId, plan);
  return plan.rooms.map(({ id, name, area }) => ({ id, name, area }));
}
