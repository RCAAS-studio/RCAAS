// Regression checks use only a disposable data directory, never server/.env.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const dir = await mkdtemp(path.join(os.tmpdir(), 'rcaas-persistence-'));
process.env.DATA_DIR = dir;
process.env.ASSET_DIR = path.join(dir, 'assets');
process.env.ASSET_DRIVER = 'local';
process.env.DATABASE_URL = '';
const store = await import('../src/store.js');
const users = await import('../src/usersStore-file.js');
const { readReservations, withReservations } = await import('../src/reservations.js');
const { readSite } = await import('../src/routes/sites.js');
after(() => rm(dir, { recursive: true, force: true }));

test('overlapping changes preserve project fields and every new member', async () => {
  const p = await store.createProperty('Concurrent project');
  await Promise.all([
    store.setPropertyKind(p.id, 'hotel'),
    store.setPropertyStatus(p.id, 'delivered'),
    store.setPropertyTheme(p.id, { brand: 'Test hotel' }),
    store.setPropertyInfo(p.id, { about: 'A test hotel.' }),
    ...Array.from({ length: 8 }, (_, i) => store.addPropertyMember(p.id, `member-${i}`))
  ]);
  const saved = await store.getProperty(p.id);
  assert.equal(saved.kind, 'hotel');
  assert.equal(saved.status, 'delivered');
  assert.equal(saved.theme.brand, 'Test hotel');
  assert.equal(saved.info.about, 'A test hotel.');
  assert.equal(saved.members.length, 8);
  await assert.rejects(store.setPropertyTheme(p.id, { accent: 'invalid' }));
  await store.renameProperty(p.id, 'Still editable');
  assert.equal((await store.getProperty(p.id)).title, 'Still editable', 'a failed change does not block later saves');
});

test('concurrent publications create distinct immutable snapshots', async () => {
  const id = 'concurrent-scene';
  await store.saveScene(id, { id, title: 'Before', spawn: { position: [1, 2, 3] }, splat: { variants: { high: { assetId: 'ast_test' } } } });
  const published = await Promise.all([store.publishScene(id), store.publishScene(id)]);
  assert.deepEqual(published.map(p => p.version).sort(), [1, 2]);
  assert.equal((await store.getPublishedScene(id)).publishedVersion, 2);
  assert.equal((await store.listVersions(id)).length, 2);
});

test('unreadable or malformed bookings are preserved and refuse new writes', async () => {
  await mkdir(path.join(dir, 'reservations'), { recursive: true });
  assert.deepEqual(await readReservations('missing'), []);
  for (const [id, contents] of [['broken', '{"broken":'], ['wrong-shape', '{}']]) {
    const file = path.join(dir, 'reservations', `${id}.json`);
    await writeFile(file, contents);
    await assert.rejects(readReservations(id));
    await assert.rejects(withReservations(id, list => list.push({ id: 'new' })));
    assert.equal(await readFile(file, 'utf8'), contents);
    await writeFile(file, '[]');
    await withReservations(id, list => list.push({ id: 'recovered' }));
    assert.deepEqual(await readReservations(id), [{ id: 'recovered' }]);
  }
  await mkdir(path.join(dir, 'reservations', 'unreadable.json'));
  await assert.rejects(readReservations('unreadable'), 'I/O errors must not mean empty inventory');
});

test('a corrupt website is not mistaken for a new empty draft', async () => {
  await mkdir(path.join(dir, 'sites'), { recursive: true });
  await writeFile(path.join(dir, 'sites', 'broken.json'), '{"broken":');
  await assert.rejects(readSite('broken'));
  assert.equal(await readSite('missing'), null);
});

test('a reset token is consumed once even when two passwords arrive together', async () => {
  const u = await users.createUser({ name: 'Reset test', email: 'reset@example.test', password: 'Original password' });
  const { token } = await users.createResetToken(u.id);
  const passwords = ['First replacement', 'Second replacement'];
  const results = await Promise.all(passwords.map(password => users.resetPassword(token, password)));
  assert.equal(results.filter(Boolean).length, 1);
  const winner = results.findIndex(Boolean);
  assert.ok(await users.verifyUser(u.email, passwords[winner]));
  assert.equal(await users.verifyUser(u.email, passwords[1 - winner]), null);
  assert.equal(await users.resetPassword(token, 'Third replacement'), null);
});

test('concurrent admin demotions cannot remove the last admin', async () => {
  const a = await users.createUser({ name: 'A', email: 'admin-a@example.test', password: 'Test password' });
  const b = await users.createUser({ name: 'B', email: 'admin-b@example.test', password: 'Test password' });
  await users.setUserRole(a.id, 'admin');
  await users.setUserRole(b.id, 'admin');
  for (const u of await users.listUsers()) if (u.role === 'admin' && ![a.id, b.id].includes(u.id)) await users.setUserRole(u.id, 'editor');
  const results = await Promise.allSettled([users.setUserRole(a.id, 'editor'), users.setUserRole(b.id, 'editor')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.status, 409);
  assert.equal((await users.listUsers()).filter(u => u.role === 'admin').length, 1);
});
