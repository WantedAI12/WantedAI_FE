import test from 'node:test';
import assert from 'node:assert/strict';
import { readHiddenRequests, saveHiddenRequests } from '../lib/hidden-failed-requests.ts';

test('hidden requests persist across reads until explicitly restored, per project', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  assert.equal(saveHiddenRequests(storage, '10', [1, 2, 2]), true);
  assert.deepEqual(readHiddenRequests(storage, '10'), [1, 2]);
  assert.deepEqual(readHiddenRequests(storage, '11'), []);
  assert.deepEqual(readHiddenRequests(storage, '10'), [1, 2]);
  saveHiddenRequests(storage, '10', []);
  assert.deepEqual(readHiddenRequests(storage, '10'), []);
});

test('invalid or inaccessible storage does not break the list', () => {
  assert.deepEqual(readHiddenRequests({ getItem: () => '{broken' }, '10'), []);
  assert.deepEqual(readHiddenRequests({ getItem: () => '[1,"2",null,-1,1]' }, '10'), [1]);
  assert.equal(saveHiddenRequests({ setItem: () => { throw new Error('blocked'); } }, '10', [1]), false);
});
