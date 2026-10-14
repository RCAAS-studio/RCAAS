import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planFrom, planSvg, plan3dSvg, cleanMarks } from '../src/floorplan.js';

// A 4 × 3 m room, Z-up, walls 2.5 m high, plus one wall 20 m away that the
// scanner never walked near (a room seen through a window).
const quad = (a, b, c, d) => [...a, ...b, ...c, ...a, ...c, ...d];
const wall = (x0, y0, x1, y1) => quad([x0, y0, 0], [x1, y1, 0], [x1, y1, 2.5], [x0, y0, 2.5]);
const slab = (x0, y0, x1, y1, z) => quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]);
const room = [
  ...slab(0, 0, 4, 3, 0),
  ...wall(0, 0, 4, 0), ...wall(4, 0, 4, 3), ...wall(4, 3, 0, 3), ...wall(0, 3, 0, 0)
];
const tris = [...room, ...wall(24, 0, 24, 3)];
const walk = Array.from({ length: 60 }, (_, i) => [1 + (i % 20) * 0.1, 1.5, 1]);

/** Turn triangles (and a path) about the origin by `deg`, like a scan whose
 *  axes don't line up with the building. */
const turn = (list, deg, stride) => {
  const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180);
  const out = [...list];
  for (let i = 0; i < out.length; i += stride) [out[i], out[i + 1]] = [out[i] * c - out[i + 1] * s, out[i] * s + out[i + 1] * c];
  return out;
};

test('a room: floor found, walls cut, size and area right', () => {
  const p = planFrom(tris, walk);
  assert.equal(p.floorZ, 0);
  assert.deepEqual(p.size, [4, 3]);
  assert.equal(p.floorArea, 12);
  assert.equal(p.walls.length, 4, 'each wall is one straight line, its cut pieces joined');
});

test('walls far from the walked path are dropped — and far from the scanned floor when there is no path', () => {
  assert.ok(planFrom(tris, walk).walls.every((w) => w[0] < 5 && w[2] < 5));
  const noPath = planFrom(tris, []);
  assert.ok(noPath, 'still a plan without a path');
  assert.ok(noPath.walls.every((w) => w[0] < 5 && w[2] < 5), 'the wall 20 m off the floor goes too');
  assert.deepEqual(noPath.size, [4, 3]);
});

test('a scan that is turned comes out square', () => {
  const p = planFrom(turn(room, 20, 3), walk.map(([x, y, z]) => [...turn([x, y], 20, 2), z]));
  assert.ok(Math.abs(Math.abs(p.rotation) - 20) < 1, `turned back by about 20°, got ${p.rotation}`);
  for (const w of p.walls) {
    assert.ok(Math.abs(w[0] - w[2]) < 0.02 || Math.abs(w[1] - w[3]) < 0.02, `wall ${w} is square`);
  }
  assert.ok(Math.abs(p.size[0] - 4) < 0.05 && Math.abs(p.size[1] - 3) < 0.05, `size ${p.size}`);
});

test('the floor is the level under the path, not a table top, the ground outside, or a storey below', () => {
  const busy = [
    ...room,
    ...slab(1.2, 1.2, 2.8, 1.8, 0.75), // a table, under the path
    ...slab(-20, -20, 20, -5, -0.4), // the ground outside, bigger than the room and lower
    ...slab(-10, 10, 10, 30, -3.5) // a storey below, seen down a stairwell
  ];
  const high = walk.map(([x, y]) => [x, y, 1.3]);
  assert.equal(planFrom(busy, high).floorZ, 0);
});

test('a wall\'s wobble straightens out, and a stray scrap far off goes', () => {
  // the south wall, cut from many small wobbling panels (±2 cm)
  const wobbly = [];
  for (let i = 0; i < 40; i++) {
    const x0 = i * 0.1, x1 = x0 + 0.1;
    wobbly.push(...wall(x0, (i % 2) * 0.02, x1, ((i + 1) % 2) * 0.02));
  }
  const scene = [
    ...slab(0, 0, 4, 3, 0), ...wobbly, ...wall(4, 0, 4, 3), ...wall(4, 3, 0, 3), ...wall(0, 3, 0, 0),
    ...wall(9, 1, 9.4, 1) // a 40 cm scrap 5 m off, near enough the path to survive that test
  ];
  const p = planFrom(scene, walk);
  const south = p.walls.filter((w) => Math.abs(w[1]) < 0.05 && Math.abs(w[3]) < 0.05);
  assert.equal(south.length, 1, 'one straight south wall');
  assert.ok(Math.abs(Math.abs(south[0][2] - south[0][0]) - 4) < 0.05);
  assert.ok(p.walls.every((w) => w[0] < 5 && w[2] < 5), 'the scrap is gone');
});

test('no geometry, no plan; titles are escaped', () => {
  assert.equal(planFrom([], walk), null);
  const p = planFrom(tris, walk);
  assert.match(planSvg(p, 'Bar & <b>'), /Bar &amp; &lt;b&gt;/);
  assert.match(planSvg(p, 'Lab'), />4 m</, 'overall width dimension');
  assert.match(plan3dSvg(p, 'Lab'), /^<svg/);
});

// rooms are an indoor thing: these have a ceiling (no ceiling reads as outdoors)
const roof = slab(0, 0, 4, 3, 2.6);
const line = (x0, y0, x1, y1, n = 40) => Array.from({ length: n }, (_, i) => [x0 + ((x1 - x0) * i) / (n - 1), y0 + ((y1 - y0) * i) / (n - 1), 1]);

test('a room is found, with its size and area; outdoors there are none', () => {
  assert.equal(planFrom(room, line(1, 1.5, 3, 1.5)).rooms.length, 0, 'no ceiling: outdoors');
  const p = planFrom([...room, ...roof], line(1, 1.5, 3, 1.5));
  assert.equal(p.rooms.length, 1);
  assert.ok(Math.abs(p.rooms[0].area - 12) <= 1.5, `area ${p.rooms[0].area}`);
});

test('a partition with a doorway the scanner walked through: two rooms and a door', () => {
  const p = planFrom([...room, ...roof, ...wall(2, 0, 2, 1.1), ...wall(2, 1.9, 2, 3)], line(0.6, 1.5, 3.4, 1.5));
  assert.equal(p.rooms.length, 2);
  assert.equal(p.doors.length, 1);
  assert.ok(Math.abs(p.doors[0].a1 - p.doors[0].a0 - 0.8) < 0.15, JSON.stringify(p.doors[0]));
  assert.match(planSvg(p, 'Two rooms'), /Room 2/);
});

// the tidying of 2026-10-14
const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.02;
const ends = (w) => [[w[0], w[1]], [w[2], w[3]]];
const along = (p, y) => p.walls.filter((w) => Math.abs(w[1] - y) < 0.1 && Math.abs(w[3] - y) < 0.1);

test('wall ends left short of a corner are joined, and the room reads wall to wall', () => {
  // every wall stops 30 cm short of the next one's corner (a hole in the scan)
  const p = planFrom([...slab(0, 0, 4, 3, 0), ...roof,
    ...wall(0.3, 0, 4, 0), ...wall(4, 0.3, 4, 3), ...wall(3.7, 3, 0, 3), ...wall(0, 2.7, 0, 0)], line(1, 1.5, 3, 1.5));
  for (const c of [[0, 0], [4, 0], [4, 3], [0, 3]]) {
    assert.equal(p.walls.flatMap(ends).filter((e) => near(e, c)).length, 2, `two walls meet at ${c}: ${JSON.stringify(p.walls)}`);
  }
  assert.deepEqual(p.rooms[0].size, [4, 3], 'the fill meets the walls');
  assert.equal(p.rooms[0].area, 12);
});

test('a wall a few degrees off square is one wall, not a staircase; leaning further across, it stays as it leans', () => {
  const room = (w, rise) => [...slab(0, 0, w, 3, 0), ...slab(0, 0, w, 3 + rise, 2.6),
    ...wall(0, 0, w, 0), ...wall(w, 0, w, 3 + rise), ...wall(w, 3 + rise, 0, 3), ...wall(0, 3, 0, 0)];
  const tops = (p) => p.walls.filter((x) => Math.min(x[1], x[3]) > 2.5);
  // 4.5° over 6 m: its ends 47 cm apart across it, more than the 40 cm band a
  // square-only fit allows, so it used to come out as two stepped pieces
  const top = tops(planFrom(room(6, 0.47), line(1, 1.5, 5, 1.5)));
  assert.equal(top.length, 1, `one top wall: ${JSON.stringify(top)}`);
  assert.ok(Math.abs(top[0][1] - top[0][3]) < 0.02 && Math.abs(top[0][1] - 3.235) < 0.05, `square, at its middle: ${top[0]}`);
  // 5° over 8 m: 70 cm across; squared, its ends would be 35 cm out
  const slant = tops(planFrom(room(8, 0.7), line(1, 1.5, 7, 1.5)));
  assert.equal(slant.length, 1, `one top wall: ${JSON.stringify(slant)}`);
  const [a, b] = slant[0][0] < slant[0][2] ? [slant[0].slice(0, 2), slant[0].slice(2)] : [slant[0].slice(2), slant[0].slice(0, 2)];
  assert.ok(Math.abs(a[1] - 3) < 0.06 && Math.abs(b[1] - 3.7) < 0.06, `as it leans: ${slant[0]}`);
});

test('a hole in a wall narrower than a door closes; a doorway someone walked through stays a door', () => {
  const scene = [...slab(0, -2, 6, 3, 0), ...slab(0, 0, 6, 3, 2.6),
    ...wall(0, 0, 1.5, 0), ...wall(1.9, 0, 4, 0), ...wall(4.9, 0, 6, 0), // a 40 cm hole, a 90 cm doorway
    ...wall(6, 0, 6, 3), ...wall(6, 3, 0, 3), ...wall(0, 3, 0, 0)];
  const walk = [...line(1, 1.5, 4.45, 1.5), ...line(4.45, 1.5, 4.45, -1.5)];
  const p = planFrom(scene, walk);
  const south = along(p, 0).map((w) => [Math.min(w[0], w[2]), Math.max(w[0], w[2])]).sort((a, b) => a[0] - b[0]);
  assert.deepEqual(south.map((s) => s.map((v) => Math.round(v * 10) / 10)), [[0, 4], [4.9, 6]], 'the hole closed, the doorway open');
  assert.equal(p.doors.length, 1);
});

test('something standing on its own that doesn\'t reach 2 m goes (a lectern); a column stays', () => {
  const box = (x0, y0, x1, y1, h) => [
    ...quad([x0, y0, 0], [x1, y0, 0], [x1, y0, h], [x0, y0, h]), ...quad([x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h]),
    ...quad([x1, y1, 0], [x0, y1, 0], [x0, y1, h], [x1, y1, h]), ...quad([x0, y1, 0], [x0, y0, 0], [x0, y0, h], [x0, y1, h])
  ];
  const scene = [...slab(0, 0, 8, 6, 0), ...slab(0, 0, 8, 6, 2.6),
    ...wall(0, 0, 8, 0), ...wall(8, 0, 8, 6), ...wall(8, 6, 0, 6), ...wall(0, 6, 0, 0),
    ...box(2, 2, 2.6, 2.4, 1.6), // a lectern, 1.6 m
    ...box(5.8, 3.8, 6.2, 4.2, 2.6)]; // a column, floor to ceiling
  const p = planFrom(scene, line(1, 1, 7, 5));
  const inside = (x0, y0, x1, y1) => p.walls.some((w) => ends(w).every(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1));
  assert.ok(!inside(1.9, 1.9, 2.7, 2.5), 'the lectern is gone');
  assert.ok(inside(5.7, 3.7, 6.3, 4.3), 'the column stays');
});

// the author's marks (2026-10-14): what the scan can't tell
const full = (x0, y0, x1, y1) => p => p.walls.some((w) => near(ends(w)[0], [x0, y0]) && near(ends(w)[1], [x1, y1]) || near(ends(w)[1], [x0, y0]) && near(ends(w)[0], [x1, y1]));

test('a traced room closes what the scan left open, its corners on the scanned walls', () => {
  // the top-left corner unscanned (a curtain): the left wall stops 1.5 m short, the top 1.2 m short
  const scene = [...slab(0, 0, 6, 4, 0), ...slab(0, 0, 6, 4, 2.6),
    ...wall(0, 0, 6, 0), ...wall(6, 0, 6, 4), ...wall(6, 4, 1.2, 4), ...wall(0, 0, 0, 2.5)];
  const walk = line(1, 1, 5, 3);
  assert.ok(!full(0, 0, 0, 4)(planFrom(scene, walk)), 'too big a hole to close on its own');
  // corners clicked a few cm out, the way a hand clicks
  const marks = { rooms: [{ corners: [[0.05, -0.04, 0], [5.96, 0.06, 0], [6.04, 3.95, 1], [-0.03, 4.05, 1]] }] };
  const p = planFrom(scene, walk, marks);
  for (const edge of [[0, 0, 6, 0], [6, 0, 6, 4], [6, 4, 0, 4], [0, 4, 0, 0]]) assert.ok(full(...edge)(p), `wall ${edge}: ${JSON.stringify(p.walls)}`);
  assert.equal(p.rooms.length, 1);
  assert.deepEqual(p.rooms[0].size, [6, 4]);
  assert.equal(p.rooms[0].area, 24);
});

test('a marked door is cut into a solid wall, and a marked window is a window', () => {
  const scene = [...slab(0, 0, 6, 4, 0), ...slab(0, 0, 6, 4, 2.6),
    ...wall(0, 0, 6, 0), ...wall(6, 0, 6, 4), ...wall(6, 4, 0, 4), ...wall(0, 4, 0, 0)];
  const p = planFrom(scene, line(1, 1, 5, 3), { openings: [
    { kind: 'door', a: [2, 0.03, 1], b: [2.9, -0.02, 1] }, // a closed door scans as wall
    { kind: 'window', a: [6.02, 1, 1.4], b: [5.98, 2.2, 1.4] }
  ] });
  assert.equal(p.doors.length, 1);
  assert.deepEqual([p.doors[0].o, p.doors[0].c, p.doors[0].a0, p.doors[0].a1], ['h', 0, 2, 2.9]);
  assert.equal(p.windows.length, 1);
  assert.deepEqual([p.windows[0].o, p.windows[0].c, p.windows[0].a0, p.windows[0].a1], ['v', 6, 1, 2.2]);
  assert.ok(full(0, 0, 2, 0)(p) && full(2.9, 0, 6, 0)(p), `the wall either side of the door: ${JSON.stringify(along(p, 0))}`);
});

test('marks are cleaned: points in metres, rooms of 3 corners or more, doors and windows only', () => {
  const m = cleanMarks({
    rooms: [{ corners: [[0, 0, 0], [1.23456, 0], [1, 1, 0]] }, { corners: [[0, 0], [1, 1]] }, { corners: [[0, 0], ['x', 1], [1, 1]] }],
    openings: [{ kind: 'door', a: [0, 0, 0], b: [1, 0, 0] }, { kind: 'stairs', a: [0, 0], b: [1, 0] }, { kind: 'window', a: [0, 0], b: [1e9, 0] }],
    extra: 'dropped'
  });
  assert.deepEqual(m, { version: 1, rooms: [{ corners: [[0, 0, 0], [1.235, 0, 0], [1, 1, 0]] }], openings: [{ kind: 'door', a: [0, 0, 0], b: [1, 0, 0] }] });
  assert.deepEqual(cleanMarks(null), { version: 1, rooms: [], openings: [] });
});

test('a gap nobody walked through, with wall under it at sill height, is a window', () => {
  const sill = quad([4, 1, 0], [4, 2, 0], [4, 2, 0.9], [4, 1, 0.9]);
  const east = [...wall(4, 0, 4, 1), ...wall(4, 2, 4, 3), ...sill];
  const box3 = [...slab(0, 0, 4, 3, 0), ...wall(0, 0, 4, 0), ...east, ...wall(4, 3, 0, 3), ...wall(0, 3, 0, 0), ...roof];
  const p = planFrom(box3, line(1, 1.5, 3, 1.5));
  assert.equal(p.windows.length, 1);
  assert.equal(p.rooms.length, 1, 'the window keeps the room shut');
});
