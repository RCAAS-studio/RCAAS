import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { stagingStorageConfig, exerciseStorage } from '../../scripts/staging-storage-acceptance.mjs';
import { createS3Driver } from '../src/storage-s3.js';
import { startFakeS3 } from './fakeS3.js';

test('live storage acceptance refuses implicit credentials and mismatched designations', () => {
  assert.throws(() => stagingStorageConfig({ S3_BUCKET: 'production' }), /designation/);
  const env = { RCAAS_STAGING_CONFIRMED: 'isolated-disposable', STAGING_S3_ENDPOINT: 'https://storage.example.test', STAGING_S3_BUCKET: 'test-bucket', STAGING_S3_ACCESS_KEY_ID: 'test', STAGING_S3_SECRET_ACCESS_KEY: 'test', STAGING_EXPECTED_ENDPOINT: 'https://storage.example.test', STAGING_EXPECTED_BUCKET: 'test-bucket' };
  assert.equal(stagingStorageConfig(env).S3_PREFIX, 'rcaas-acceptance/');
  assert.throws(() => stagingStorageConfig({ ...env, STAGING_EXPECTED_BUCKET: 'wrong' }), /match/);
  assert.throws(() => stagingStorageConfig({ ...env, STAGING_S3_ENDPOINT: 'http://storage.example.test' }), /HTTPS/);
});

test('acceptance exercises signed fake storage and leaves other objects intact', async () => {
  const credentials = { bucket: 'acceptance-bucket', accessKeyId: 'test', secretAccessKey: 'test' };
  const fake = await startFakeS3(credentials);
  try {
    const driver = createS3Driver({ S3_ENDPOINT: fake.url, S3_BUCKET: credentials.bucket, S3_ACCESS_KEY_ID: credentials.accessKeyId, S3_SECRET_ACCESS_KEY: credentials.secretAccessKey, S3_PREFIX: 'rcaas-acceptance/' });
    await driver.put('ast_unrelated', 'sentinel.txt', Readable.from(['keep']), 'text/plain');
    await exerciseStorage(driver);
    assert.equal(fake.stats.badSignatures, 0);
    assert.deepEqual([...await driver.inventory()], [['ast_unrelated', { files: 1, bytes: 4 }]]);
  } finally { await fake.close(); }
});

test('acceptance attempts exact-object cleanup after a failed write', async () => {
  let cleanup;
  await assert.rejects(exerciseStorage({ put: async () => { throw Error('interrupted'); }, remove: async (id, rel) => { cleanup = { id, rel }; } }), /interrupted/);
  assert.match(cleanup.id, /^ast_acceptance_/);
  assert.equal(cleanup.rel, 'probe.txt');
});
