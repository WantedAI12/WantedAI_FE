import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowUsageGuide, dismissUsageGuide } from '../lib/usage-guide.ts';

const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };

test('guide auto-opens only for guests and normal close lasts for this tab session', () => {
  const local = storage(), session = storage();
  assert.equal(shouldShowUsageGuide(false, local, session), false);
  assert.equal(shouldShowUsageGuide(true, local, session), true);
  assert.equal(dismissUsageGuide(false, local, session), true);
  assert.equal(shouldShowUsageGuide(true, local, session), false);
  assert.equal(shouldShowUsageGuide(true, local, storage()), true);
});

test('do not show again persists across tab sessions', () => {
  const local = storage();
  dismissUsageGuide(true, local, storage());
  assert.equal(shouldShowUsageGuide(true, local, storage()), false);
});

test('storage errors do not throw', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(shouldShowUsageGuide(true, blocked, blocked), true);
  assert.equal(dismissUsageGuide(true, blocked, blocked), false);
});
