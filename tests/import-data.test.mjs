import test from 'node:test';
import assert from 'node:assert/strict';
import { parseImport, mappedRow, rowError } from '../components/data/import-data.ts';

test('CSV handles BOM, CRLF, quoted commas, escaped quotes and multiline cells', () => {
  assert.deepEqual(parseImport('\uFEFFid,name\r\nA,"Oil, fresh"\r\nB,"A ""quote""\nline"', false), [
    { id: 'A', name: 'Oil, fresh' }, { id: 'B', name: 'A "quote"\nline' },
  ]);
});
test('CSV rejects invalid headers, mismatched columns and unclosed quotes', () => {
  for (const source of ['', 'id,id\n1,2', 'id,\n1,2', 'id,name\n1', 'id,name\n1,"oil']) {
    assert.throws(() => parseImport(source, false));
  }
});
test('JSON accepts object arrays and normalizes values', () => {
  assert.deepEqual(parseImport('[{"id":1,"name":null,"active":true}]', true), [{ id: '1', name: '', active: 'true' }]);
  for (const source of ['{}', '[null]', '[1]', '[[]]', 'invalid']) assert.throws(() => parseImport(source, true));
});
test('mapping trims values and excludes unmapped columns', () => {
  assert.deepEqual(mappedRow({ id: ' A ', label: ' Oil ', note: 'unused' }, { id: 'externalId', label: 'name', note: '' }), { externalId: 'A', name: 'Oil' });
});
test('validation rejects missing identifiers and invalid prices', () => {
  assert.ok(rowError({ name: 'Oil' }));
  assert.ok(rowError({ externalId: 'A'.repeat(101), name: 'Oil' }));
  for (const pricePerKg of ['-1', 'NaN', 'Infinity']) assert.ok(rowError({ externalId: 'A', name: 'Oil', pricePerKg }));
  for (const pricePerKg of ['', '0', '12.5']) assert.equal(rowError({ externalId: 'A', name: 'Oil', pricePerKg }), '');
});
