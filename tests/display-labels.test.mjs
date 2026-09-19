import test from 'node:test';
import assert from 'node:assert/strict';
import { displayLabel, displayPercent, previewPerfumeCategory, displayCandidateRationale } from '../lib/display-labels.ts';

test('concentration preview follows server boundaries without changing saved values', () => {
  for (const value of ['', ' ', '-1', 'NaN']) assert.equal(previewPerfumeCategory(value), null);
  for (const value of ['0', '2', '4.99']) assert.equal(previewPerfumeCategory(value), 'EAU_DE_COLOGNE');
  for (const value of ['5', '12', '14.99']) assert.equal(previewPerfumeCategory(value), 'EAU_DE_TOILETTE');
  for (const value of ['15', '20', '25']) assert.equal(previewPerfumeCategory(value), 'EAU_DE_PARFUM');
});

test('candidate wording replaces only the specified sentence', () => {
  const original = '앞 문장. closest_candidate는 미승인 후보입니다. 뒤 문장.';
  assert.equal(displayCandidateRationale(original), '앞 문장. 목표 점수(90점)를 넘는 조향식은 찾지 못해, 가장 가까운 후보를 보여드립니다. 참고용으로 확인해 주세요. 뒤 문장.');
  assert.equal(displayCandidateRationale('다른 설명'), '다른 설명');
});

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
  assert.equal(displayLabel('EAU_DE_PARFUM'), '오 드 퍼퓸');
  assert.equal(displayLabel('EAU_DE_TOILETTE'), '오 드 뚜왈렛');
  assert.equal(displayLabel('EAU_DE_COLOGNE'), '오 드 코롱');
  assert.equal(displayLabel('UNDER_REVIEW'), '검토 중');
  assert.equal(displayLabel('PERFUMER'), '조향사');
  assert.equal(displayLabel(null), '미제공');
  assert.equal(displayLabel('설명 문장'), '설명 문장');
  assert.match(displayLabel('research_candidate_only'), /연구용 후보/);
});
