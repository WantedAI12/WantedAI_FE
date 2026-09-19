import test from 'node:test';
import assert from 'node:assert/strict';
import { displayLabel, displayPercent } from '../lib/display-labels.ts';

test('percent display rounds without changing the source value', () => {
  const value = 1.5075012255824591;
  assert.equal(displayPercent(value), '1.51%');
  assert.equal(value, 1.5075012255824591);
  assert.equal(displayPercent(0), '0%');
  assert.equal(displayPercent(0.0005), '0.01% 미만');
  assert.equal(displayPercent(null), '미제공');
  assert.equal(displayPercent(NaN), '미제공');
});

test('known status and role codes have readable labels', () => {
  assert.equal(displayLabel('EAU_DE_PARFUM'), '오 드 퍼퓸 (향수)');
  assert.equal(displayLabel('EAU_DE_TOILETTE'), '오 드 뚜왈렛 (향수)');
  assert.equal(displayLabel('EAU_DE_COLOGNE'), '오 드 코롱 (향수)');
  assert.equal(displayLabel('UNDER_REVIEW'), '검토 중');
  assert.equal(displayLabel('PERFUMER'), '조향사');
  assert.equal(displayLabel(null), '미제공');
  assert.equal(displayLabel('설명 문장'), '설명 문장');
  assert.match(displayLabel('research_candidate_only'), /연구용 후보/);
});
