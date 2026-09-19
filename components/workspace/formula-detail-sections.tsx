import type { CandidateVersionResponse, EvidenceLog, FragranceRequestResponse, PredictionResponse, SafetyEvaluationResponse } from '@/types/domain';

import { displayLabel, displayPercent } from '@/lib/display-labels';
const shown = (value: string | number | null | undefined) => displayLabel(value == null ? null : String(value));
const pct = displayPercent;
const productName = (value: string | null | undefined) => shown(value);
const concentration = (request: FragranceRequestResponse | null) => request?.structuredIntent.usageConcentrationPercent;

export function CompositionSection({ version, request, onDownload }: { version: CandidateVersionResponse | null; request: FragranceRequestResponse | null; onDownload: () => void }) {
  const ingredients = version?.ingredients ?? [];
  const ranked = [...ingredients].sort((a, b) => b.concentratePercent - a.concentratePercent);
  const displayed = ranked.slice(0, 4).map((item) => ({ key: item.ingredientId, name: item.name, value: item.concentratePercent }));
  if (ranked.length > 4) displayed.push({ key: 'other', name: `기타 ${ranked.length - 4}종`, value: ranked.slice(4).reduce((sum, item) => sum + item.concentratePercent, 0) });
  const largest = Math.max(50, ...displayed.map((item) => item.value));
  const fragranceAmount = ingredients.length && ingredients.every((item) => typeof item.finishedProductPercent === 'number' && Number.isFinite(item.finishedProductPercent)) ? ingredients.reduce((sum, item) => sum + item.finishedProductPercent, 0) : null;
  return <div className="fd-composition">
    <div className="wf-formula-cols">
      <section><h2 className="wf-panel-title">향료 원액 배합비</h2><div className="wf-mix-card">{displayed.length ? displayed.map((item) => <div className="wf-bar-row" key={item.key}><span title={item.name}>{item.name}</span><div className="wf-bar-track"><div className="wf-bar-fill" style={{ width: `${Math.min(100, Math.max(0, item.value / largest * 100))}%` }} /></div><span>{pct(Number(item.value.toFixed(1)))}</span></div>) : <p className="fd-no-data">후보 생성 후 배합비가 표시됩니다.</p>}</div></section>
      <section><h2 className="wf-panel-title">조향식 정보</h2><div className="wf-info-card">{[['목표 일치도', '미제공'], ['예상 원가', version?.cost == null ? '—' : `₩${version.cost.toLocaleString()} / kg`], ['요청 농도', pct(concentration(request))], ['제품 유형', productName(request?.structuredIntent.productCategory)], ['지속성 예측', '미제공']].map(([label, value]) => <div className="wf-info-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div></section>
    </div>
    <div className="fd-composition-footer"><section><h2 className="wf-panel-title">완제품 함량</h2><div className="fd-finished-rows"><div><span>요청 농도</span><b>{pct(concentration(request))}</b></div><div><span>배치 기준</span><b>—</b></div><div className="is-highlighted"><span>서버 배합의 향료 함량</span><b>{pct(fragranceAmount)}</b></div><div><span>기타 원료</span><b>—</b></div></div></section><button type="button" className="wf-btn wf-btn-dark" onClick={onDownload} disabled={!version}>노트 내려받기</button></div>
  </div>;
}

function temporalSeries(version: CandidateVersionResponse | null) {
  const temporal = version?.temporal;
  if (!temporal?.profile?.length || !temporal.timepointsMinutes?.length) return [];
  const keys = Object.keys(temporal.profile[0]).filter((key) => temporal.profile.some((point) => typeof point[key] === 'number') && !/time|minute/i.test(key)).slice(0, 4);
  return keys.map((key, index) => ({ name: key, color: ['#e8bb71', '#c99429', '#484848', '#638e0a'][index], values: temporal.profile.map((point) => typeof point[key] === 'number' ? Number(point[key]) : null) }));
}

export function PerformanceSection({ version, request, prediction }: { version: CandidateVersionResponse | null; request: FragranceRequestResponse | null; prediction: PredictionResponse | null }) {
  const series = temporalSeries(version);
  const times = version?.temporal?.timepointsMinutes ?? [];
  const values = series.flatMap((item) => item.values.filter((value): value is number => value !== null));
  const max = Math.max(100, ...values);
  const x = (index: number) => 45 + index * 830 / Math.max(1, times.length - 1);
  const y = (value: number) => 210 - value * 185 / max;
  const ratios = series.map((item) => ({ name: item.name, value: item.values.find((value) => value !== null) }));
  return <div className="fd-performance"><h2 className="wf-panel-title">시간에 따른 향 변화</h2>{series.length && times.length ? <div className="fd-chart-wrap"><svg viewBox="0 0 900 265" aria-label="시간에 따른 향 변화"><line x1="45" x2="875" y1="210" y2="210" stroke="#c8c8c8"/><line x1="45" x2="45" y1="18" y2="210" stroke="#e0e0e0"/>{[0, 0.5, 1].map((step) => <text key={step} x="35" y={215 - step * 185} textAnchor="end" fontSize="13" fill="#555">{Math.round(max * step)}</text>)}{series.map((item) => <g key={item.name}><polyline fill="none" stroke={item.color} strokeWidth="1.5" strokeLinejoin="round" points={item.values.map((value, index) => value === null ? '' : `${x(index)},${y(value)}`).filter(Boolean).join(' ')} />{item.values.map((value, index) => value === null ? null : <circle key={index} cx={x(index)} cy={y(value)} r="6" fill={item.color} />)}</g>)}{times.map((minute, index) => <text key={index} x={x(index)} y="250" textAnchor="middle" fontSize="13" fill="#555">{minute >= 60 ? `${minute / 60}h` : `${minute}m`}</text>)}</svg><div className="fd-chart-legend">{series.map((item) => <span key={item.name}><i style={{ background: item.color }} /><b className="fd-legend-label">{item.name}</b></span>)}</div></div> : <div className="fd-empty-graph">표시할 시간별 향 변화 데이터가 없습니다.</div>}
    <div className="wf-performance-cards"><div className="wf-performance-summary"><span>요청 농도</span><b>{pct(concentration(request))}</b><span>예측 상태</span><b>{shown(prediction?.status)}</b><span>모델 적용 가능성</span><b>{pct(prediction?.modelApplicabilityPercent)}</b></div><div className="wf-scent-ratios">{ratios.length ? ratios.map((item) => <div key={item.name}><span>{item.name}</span><b>{item.value == null ? '—' : pct(Number(item.value.toFixed(1)))}</b></div>) : <p>계열별 예측 수치가 없습니다.</p>}</div></div>
    <div className="wf-calculation-note"><b>ⓘ 계산조건</b><span>요청 농도 {pct(concentration(request))}</span><span>베이스: {productName(request?.structuredIntent.productCategory)}</span><span>{version?.temporal?.claimBoundary ? displayLabel(version.temporal.claimBoundary) : '실제 성능은 별도 측정 결과와 다를 수 있습니다.'}</span></div>
  </div>;
}

export function SafetySection({ safety, request }: { safety: SafetyEvaluationResponse | null; request: FragranceRequestResponse | null }) {
  const review = safety?.internalGatePassed === null || safety?.internalGatePassed === undefined;
  const rows: Array<[string, string, string]> = [
    ['사용 제품', productName(safety?.productCategory ?? request?.structuredIntent.productCategory), 'good'],
    ['요청 농도', pct(request?.structuredIntent.usageConcentrationPercent), 'good'],
    ['안전성', safety?.internalGatePassed === true ? '통과' : safety?.internalGatePassed === false ? '검토 필요' : '정보 없음', safety?.internalGatePassed === true ? 'good' : 'review'],
    ['원료 제한', safety?.regulatoryDataComplete === true ? '검토 완료' : '검토 필요', safety?.regulatoryDataComplete === true ? 'good' : 'review'],
    ['제조 준비', safety?.manufacturingReady === true ? '준비 완료' : '확인 필요', safety?.manufacturingReady === true ? 'good' : 'review'],
    ['근거 충족률', pct(safety?.evidenceCoveragePercent), safety?.evidenceCoveragePercent == null ? 'missing' : 'good'],
  ];
  return <div className="wf-safety-layout"><div className="wf-safety-card">{rows.map(([label, value, tone]) => <div key={label}><span>{label}</span><b className={`wf-safety-value ${tone === 'review' ? 'is-review' : tone === 'missing' ? 'is-missing' : ''}`}><i />{value}</b></div>)}</div><div className="wf-safety-copy"><h2>{safety?.internalGatePassed === true ? 'SAFE TO REVIEW' : review ? '검토 데이터 없음' : '검토 필요'}</h2><p>{safety?.internalGatePassed === true ? '등록된 원료·제품 조건을 기준으로 내부 안전 검토 조건을 충족했습니다.' : '현재 확인 가능한 안전·규제 결과를 확인해 주세요.'}</p><small>※ 최종 제품 적용 전 제품별 안전성 및 최신 규제 기준에 대한 별도 검토가 필요합니다.</small></div></div>;
}

export function EvidenceSection({ evidence, ingredientCount, prediction, safety, onRetry, error }: { evidence: EvidenceLog[]; ingredientCount: number; prediction: PredictionResponse | null; safety: SafetyEvaluationResponse | null; onRetry: () => void; error: boolean }) {
  if (error) return <div className="fd-evidence-empty"><p>데이터를 불러오지 못했습니다.</p><button type="button" className="wf-btn wf-btn-dark" onClick={onRetry}>다시 시도</button></div>;
  if (!evidence.length) return <div className="fd-evidence-empty">현재 확인 가능한 근거 데이터가 없습니다.</div>;
  return <div className="fd-evidence"><div className="wf-evidence"><div className="wf-evidence-metric"><h2>원료 데이터</h2><strong>{ingredientCount}</strong><span>사용 원료</span><p>후보 조향식에 포함된 원료 정보</p></div><div className="wf-evidence-metric"><h2>근거 기록</h2><strong>{evidence.length}</strong><span>기록</span><p>서버에 저장된 검토·생성 기록</p></div></div><div className="wf-evidence-strip"><div><span>데이터 적용범위</span><b>{prediction?.scientificModelDomainPassed === true ? 'IN-DOMAIN' : prediction?.scientificModelDomainPassed === false ? 'OUT-OF-DOMAIN' : '미확인'}</b></div><div><span>불확실성</span><b>{shown(prediction?.scientificUncertaintyKind)}</b></div><div><span>검증 수준</span><b>{shown(safety?.validationLevel)}</b></div><small>기준 검토일<br/>{shown(safety?.standardsCheckedOn)}</small></div>{evidence.length > 0 && <div className="fd-evidence-logs">{evidence.map((item, index) => <p key={`${item.occurredAt}-${index}`}>{item.action} · {new Date(item.occurredAt).toLocaleDateString('ko-KR')} · {item.detail || '상세 내용 없음'}</p>)}</div>}</div>;
}
