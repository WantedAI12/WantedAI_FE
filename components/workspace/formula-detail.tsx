'use client';

import Image from 'next/image';
import Link from '@/components/ui/app-link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { candidateApi, evidenceApi, experimentApi, predictionApi, requestApi, safetyApi } from '@/lib/api/resources';
import type { CandidateMemoResponse, CandidateMemoType, CandidateResponse, EvidenceLog, FragranceRequestResponse, PredictionResponse, SafetyEvaluationResponse } from '@/types/domain';

const tabs = ['조향식 구성', '성능 프록시', '안전 / 규제', '근거&데이터', '메모'] as const;
type Tab = (typeof tabs)[number];
const display = (value: string | number | boolean | null | undefined) => value === null || value === undefined || value === '' ? '정보 없음' : String(value);
const percent = (value: number | null | undefined) => value === null || value === undefined ? '정보 없음' : `${value}%`;
const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString('ko-KR') : '정보 없음';

export function FormulaDetail() {
  const pathname = usePathname();
  const candidateId = Number(pathname.split('/').filter(Boolean).at(-1));
  const [active, setActive] = useState<Tab>('조향식 구성');
  const [candidate, setCandidate] = useState<CandidateResponse | null>(null);
  const [request, setRequest] = useState<FragranceRequestResponse | null>(null);
  const [safety, setSafety] = useState<SafetyEvaluationResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [evidence, setEvidence] = useState<EvidenceLog[]>([]);
  const [memos, setMemos] = useState<CandidateMemoResponse[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [revisionPreview, setRevisionPreview] = useState('');

  useEffect(() => {
    if (!Number.isInteger(candidateId) || candidateId < 1) {
      queueMicrotask(() => { setNotice('잘못된 후보 주소입니다.'); setLoading(false); });
      return;
    }
    let alive = true;
    queueMicrotask(() => setLoading(true));
    candidateApi.detail(candidateId).then(async (item) => {
      if (!alive) return;
      setCandidate(item);
      const results = await Promise.allSettled([
        requestApi.detail(item.requestId), safetyApi.detail(candidateId),
        predictionApi.detail(candidateId), evidenceApi.logs(candidateId), candidateApi.memos(candidateId),
      ]);
      if (!alive) return;
      if (results[0].status === 'fulfilled') setRequest(results[0].value);
      if (results[1].status === 'fulfilled') setSafety(results[1].value);
      if (results[2].status === 'fulfilled') setPrediction(results[2].value);
      if (results[3].status === 'fulfilled') setEvidence(results[3].value);
      if (results[4].status === 'fulfilled') setMemos(results[4].value);
    }).catch((error: unknown) => {
      if (alive) setNotice(error instanceof Error ? error.message : '후보를 불러오지 못했습니다.');
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [candidateId]);

  async function selectFinalCandidate() {
    try {
      await experimentApi.update(candidateId, 'CONFIRMED_FOR_EXPERIMENT');
      setCandidate((item) => item ? { ...item, status: 'CONFIRMED_FOR_EXPERIMENT' } : item);
      setNotice('최종후보 선택이 서버에 저장됐습니다.');
    } catch (error) { setNotice(error instanceof Error ? error.message : '선택을 저장하지 못했습니다.'); }
  }

  async function duplicateCandidate() {
    const reason = window.prompt('복제 사유를 입력해 주세요.');
    if (!reason?.trim()) return;
    try {
      const copy = await candidateApi.duplicate(candidateId, reason.trim());
      window.location.assign(`/formulas/${copy.candidateId}`);
    } catch (error) { setNotice(error instanceof Error ? error.message : '후보를 복제하지 못했습니다.'); }
  }

  async function saveMemo(memoType: CandidateMemoType, content: string) {
    const existing = memos.find((item) => item.memoType === memoType);
    try {
      const saved = await candidateApi.saveMemo(candidateId, memoType, content, existing?.revision ?? 0);
      setMemos((items) => [...items.filter((item) => item.memoType !== memoType), saved]);
      setNotice('메모가 서버에 저장됐습니다.');
    } catch (error) { setNotice(error instanceof Error ? error.message : '메모를 저장하지 못했습니다.'); }
  }

  async function previewRevision() {
    if (!draft.trim()) return;
    try {
      const preview = await candidateApi.previewRevision(candidateId, draft.trim());
      setRevisionPreview(JSON.stringify(preview, null, 2));
      setNotice('수정 진단 결과를 받았습니다. 이 단계에서는 후보가 저장되지 않습니다.');
    } catch (error) { setNotice(error instanceof Error ? error.message : '수정 진단에 실패했습니다.'); }
  }

  const version = candidate?.currentVersion;
  const ingredients = version?.ingredients ?? [];
  const status = candidate?.status === 'CONFIRMED_FOR_EXPERIMENT' ? '최종후보 선택됨' : display(candidate?.status);

  return (
    <div className="wf-layout">
      <aside className="wf-rail wf-rail-left" />
      <section className="wf-detail">
        <div className="wf-detail-hero">
          <Link href="/formulas" className="wf-back"><Image className="wf-back-icon" src="/figma/back-arrow.svg" alt="" width={20} height={20} />후보 목록으로 돌아가기</Link>
          <h1 className="wf-detail-title">{candidate ? `FORMULA ${String(candidate.candidateId).padStart(2, '0')}` : '후보 조향식'}</h1>
          <p className="wf-detail-sub">{version?.generationRationale || request?.structuredIntent.rawText || (loading ? '불러오는 중…' : '설명 없음')}</p>
          <div className="wf-detail-meta"><span>생성일&nbsp;&nbsp; {date(version?.createdAt)}</span><span>버전&nbsp;&nbsp; {version ? `V${version.versionId}` : '정보 없음'}</span><span>상태&nbsp;&nbsp; {status}</span></div>
          <div className="wf-detail-actions">
            <button type="button" className="wf-btn wf-btn-dark" onClick={selectFinalCandidate} disabled={!candidate || candidate.status === 'CONFIRMED_FOR_EXPERIMENT'}>{candidate?.status === 'CONFIRMED_FOR_EXPERIMENT' ? '최종후보 선택됨' : '최종후보 선택'}</button>
            <button type="button" className="wf-btn" onClick={duplicateCandidate} disabled={!candidate}>후보 복제</button>
            <button type="button" className="wf-btn" onClick={() => setEditing(true)} disabled={!candidate}>후보 수정</button>
            {notice && <output className="wf-action-notice">{notice}</output>}
          </div>
        </div>
        <div className="wf-tabs">{tabs.map((tab) => <button type="button" className={`wf-tab ${active === tab ? 'active' : ''}`} onClick={() => setActive(tab)} key={tab}>{tab}</button>)}</div>
        <div className="wf-detail-body">
          {loading ? <p>후보 데이터를 불러오는 중입니다.</p> : !candidate ? <p>{notice || '후보를 찾을 수 없습니다.'}</p> : <>
            {active === '조향식 구성' && <div className="wf-formula-cols"><div><h2 className="wf-panel-title">향료 원액 배합비</h2><div className="wf-mix-card"><div className="wf-bars">{ingredients.length ? ingredients.map((item) => <div className="wf-bar-row" key={item.ingredientId}><span>{item.name}</span><div className="wf-bar-track"><div className="wf-bar-fill" style={{ width: `${Math.min(100, Math.max(0, item.concentratePercent))}%` }} /></div><span>{percent(item.concentratePercent)}</span></div>) : <p>배합 데이터가 없습니다.</p>}</div></div></div><div><h2 className="wf-panel-title">조향식 정보</h2><div className="wf-info-card">{[['원료 수', `${ingredients.length}개`], ['원액 원가', version?.cost == null ? '정보 없음' : `₩${version.cost.toLocaleString()} / kg`], ['제품 유형', display(request?.structuredIntent.productCategory)], ['사용 농도', percent(request?.structuredIntent.usageConcentrationPercent)], ['목표 지역', display(request?.structuredIntent.targetRegion)]].map(([label, value]) => <div className="wf-info-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div></div></div>}
            {active === '성능 프록시' && <div className="wf-performance"><h2 className="wf-panel-title">성능 예측</h2><div className="wf-info-card">{[['예측 상태', display(prediction?.status)], ['유사도 점수', display(prediction?.similarityScore)], ['신뢰도', display(prediction?.confidence)], ['모델 적용 가능성', percent(prediction?.modelApplicabilityPercent)], ['검증 상태', display(prediction?.olfactoryValidationStatus)]].map(([label, value]) => <div className="wf-info-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="wf-calculation-note"><b>시간 변화 데이터</b><span>{version?.temporal?.timepointsMinutes?.length ? version.temporal.timepointsMinutes.map((minute) => `${minute}분`).join(' · ') : '시간별 수치가 제공되지 않았습니다.'}</span><span>{version?.temporal?.claimBoundary || '최종 제품 성능은 별도 시험이 필요합니다.'}</span></div></div>}
            {active === '안전 / 규제' && <div className="wf-safety-layout"><div className="wf-safety-card">{[['제품 유형', display(safety?.productCategory ?? request?.structuredIntent.productCategory)], ['사용 농도', percent(request?.structuredIntent.usageConcentrationPercent)], ['검토 상태', display(safety?.status)], ['내부 게이트', display(safety?.internalGatePassed)], ['제조 준비', display(safety?.manufacturingReady)], ['근거 충족률', percent(safety?.evidenceCoveragePercent)]].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="wf-safety-copy"><h2>{safety?.status || '안전성 검토 데이터 없음'}</h2><p>{safety?.internalGatePassed ? '내부 안전 게이트를 통과했습니다.' : '안전·규제 검토 결과를 확인해 주세요.'}</p><small>※ 제품 적용 전 최신 기준과 실제 시험 결과를 별도 확인해야 합니다.</small></div></div>}
            {active === '근거&데이터' && <div><div className="wf-evidence"><div className="wf-evidence-metric"><h2>원료 데이터</h2><strong>{ingredients.length}</strong><span>후보에 사용된 원료</span></div><div className="wf-evidence-metric"><h2>근거 기록</h2><strong>{evidence.length}</strong><span>서버에 기록된 항목</span></div></div><div className="wf-evidence-strip"><div><span>모델 적용 가능성</span><b>{percent(prediction?.modelApplicabilityPercent)}</b></div><div><span>검증 수준</span><b>{display(safety?.validationLevel)}</b></div><div><span>기준 검토일</span><b>{display(safety?.standardsCheckedOn)}</b></div></div>{evidence.map((item, index) => <p key={`${item.occurredAt}-${index}`}>{item.action} · {date(item.occurredAt)} · {item.detail || '상세 내용 없음'}</p>)}</div>}
            {active === '메모' && <div className="wf-memos">{([['INPUT_NOTE', '입력 내용'], ['REVIEW_NOTE', '검토 사항'], ['NEXT_EXPERIMENT_NOTE', '다음 실험']] as const).map(([memoType, label]) => { const memo = memos.find((item) => item.memoType === memoType); return <MemoEditor key={memoType} label={label} initialContent={memo?.content ?? ''} updatedAt={memo?.updatedAt ?? null} onSave={(content) => saveMemo(memoType, content)} />; })}</div>}
          </>}
        </div>
      </section>
      {editing && <div className="wf-edit-backdrop"><dialog open className="wf-edit-modal" aria-labelledby="candidate-edit-title"><button type="button" className="wf-edit-close" onClick={() => setEditing(false)} aria-label="닫기">×</button><h2 id="candidate-edit-title">후보 수정 진단</h2><p>수정 요청을 서버에서 분석합니다. 이 결과는 새 후보를 저장하거나 승인하지 않습니다.</p><label><b>수정 요청</b><textarea value={draft} onChange={(event) => setDraft(event.target.value)} /></label>{revisionPreview && <pre className="wf-revision-preview">{revisionPreview}</pre>}<div className="wf-edit-actions"><button type="button" className="wf-btn" onClick={() => setEditing(false)}>닫기</button><button type="button" className="wf-btn wf-btn-dark" onClick={previewRevision} disabled={!draft.trim()}>진단 요청</button></div></dialog></div>}
    </div>
  );
}

function MemoEditor({ label, initialContent, updatedAt, onSave }: { label: string; initialContent: string; updatedAt: string | null; onSave: (content: string) => void }) {
  const [content, setContent] = useState(initialContent);
  useEffect(() => { queueMicrotask(() => setContent(initialContent)); }, [initialContent]);
  return <article><b>{label}</b><textarea className="wf-memo-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="메모를 입력해 주세요." /><span className="wf-memo-meta">{date(updatedAt)}</span><button type="button" className="wf-btn" onClick={() => onSave(content)} disabled={content === initialContent}>저장</button></article>;
}
