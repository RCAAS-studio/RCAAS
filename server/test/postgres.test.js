import { test } from 'node:test';
import assert from 'node:assert/strict';

// Explicitly opt in with a disposable database, never server/.env. Run this
// before api.test.js, which leaves its account fixtures in the test database.
test('PostgreSQL migrations, concurrent account mutations and transaction recovery', {
  skip: !process.env.API_TEST_DATABASE_URL,
  timeout: 30000
}, async () => {
  process.env.DATABASE_URL = process.env.API_TEST_DATABASE_URL;
  const { pool, migrate, tx } = await import('../src/db.js');
  const created = [];
  try {
    await Promise.all([migrate(), migrate(), migrate()]);
    assert.equal((await pool.query('select count(*)::int as count from app.schema_migrations')).rows[0].count, 1);
    assert.equal((await pool.query('select count(*)::int as count from app.users')).rows[0].count, 0,
      'Refusing to run account regression tests against a nonempty database; use a disposable database.');

    const users = await import('../src/usersStore-pg.js');
    const signups = await Promise.allSettled(['a', 'b', 'c'].map(async name => {
      const user = await users.createUser({ name, email: `pg-${name}@example.test`, password: 'Original test password' });
      if (user) created.push(user.id);
      return user;
    }));
    for (const result of signups) assert.equal(result.status, 'fulfilled');
    const accounts = signups.map(result => result.value);
    assert.equal(accounts.filter(user => user.role === 'admin').length, 1, 'Only one first signup may become admin');
    const admin = accounts.find(user => user.role === 'admin');
    const editor = accounts.find(user => user.role === 'editor');
    await users.setUserRole(editor.id, 'admin');
    const demotions = await Promise.allSettled([admin.id, editor.id].map(id => users.setUserRole(id, 'editor')));
    assert.equal(demotions.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(demotions.find(result => result.status === 'rejected').reason.status, 409);
    assert.equal((await users.listUsers()).filter(user => user.role === 'admin').length, 1);

    const reset = await users.createResetToken(editor.id);
    const passwords = ['New test password one', 'New test password two'];
    const resets = await Promise.all(passwords.map(password => users.resetPassword(reset.token, password)));
    assert.equal(resets.filter(Boolean).length, 1, 'Only one concurrent use may consume a reset token');
    assert.equal((await users.verifyUser(editor.email, passwords[resets.findIndex(Boolean)])).id, editor.id);
    assert.equal(await users.verifyUser(editor.email, passwords[resets.findIndex(value => !value)]), null);

    await assert.rejects(tx(async client => {
      await client.query('update app.users set name = $2 where id = $1', [editor.id, 'Rolled back']);
      throw new Error('transaction test failure');
    }), /transaction test failure/);
    assert.equal((await users.getUserById(editor.id)).name, editor.name);

    await assert.rejects(tx(async client => {
      await client.query("set local statement_timeout = '50ms'");
      await client.query('select pg_sleep(1)');
    }), error => error.code === '57014');
    assert.equal((await pool.query('select 1 as ok')).rows[0].ok, 1, 'Pool recovers after a cancelled statement');
    assert.ok(pool.options.connectionTimeoutMillis > 0);
    assert.ok(pool.options.statement_timeout > 0);
  } finally {
    try {
      if (created.length) await pool.query('delete from app.users where id = any($1::uuid[])', [created]);
    } finally {
      await pool.end();
    }
  }
});
