import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/api/client.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}
async function fixture(t, name) {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const destinations = [];
  globalThis.window = { sessionStorage: storage(), localStorage: storage(), location: { replace: path => destinations.push(path) } };
  t.after(() => { globalThis.window = previousWindow; globalThis.fetch = previousFetch; });
  const client = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${name}`);
  return { ...client, destinations };
}
const response = (data, status = 200) => new Response(JSON.stringify({ success: status === 200, data }), { status });

test('guest 401 creates one new session without replaying old requests', async t => {
  const { tokenStorage, apiRequest, destinations } = await fixture(t, 'guest');
  tokenStorage.set({ accessToken: 'old', refreshToken: 'old-refresh' }, true, true);
  let restarts = 0;
  let originals = 0;
  globalThis.fetch = async url => {
    if (url.endsWith('/auth/guest')) {
      restarts++;
      return response({ accessToken: 'new', refreshToken: 'new-refresh' });
    }
    originals++;
    return response(null, 401);
  };
  const results = await Promise.allSettled([apiRequest('/projects/1', { method: 'PATCH' }), apiRequest('/ops/overview')]);
  assert.equal(restarts, 1);
  assert.equal(originals, 2);
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(tokenStorage.getAccessToken(), 'new');
  assert.deepEqual(destinations, ['/']);
  assert.match(window.sessionStorage.getItem('perfumery:guest-session-notice'), /이전 데이터/);
});

test('normal user refresh retries with renewed credentials, not guest creation', async t => {
  const { tokenStorage, apiRequest } = await fixture(t, 'member');
  tokenStorage.set({ accessToken: 'old', refreshToken: 'refresh' }, true);
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    assert.ok(!url.endsWith('/auth/guest'));
    if (url.endsWith('/auth/refresh')) return response({ accessToken: 'renewed', refreshToken: 'refresh2' });
    calls++;
    if (calls === 1) return response(null, 401);
    assert.equal(init.headers.get('Authorization'), 'Bearer renewed');
    return response({ projectCount: 0 });
  };
  assert.deepEqual(await apiRequest('/ops/overview'), { projectCount: 0 });
  assert.equal(calls, 2);
  assert.equal(tokenStorage.isGuest(), false);
});
