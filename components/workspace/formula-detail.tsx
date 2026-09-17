'use client';

import Image from 'next/image';
import Link from '@/components/ui/app-link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { candidateApi, evidenceApi, experimentApi, predictionApi, requestApi, safetyApi } from '@/lib/api/resources';
import { CompositionSection, EvidenceSection, PerformanceSection, SafetySection } from './formula-detail-sections';
import type { CandidateMemoResponse, CandidateMemoType, CandidateResponse, CandidateRevisionPreview, EvidenceLog, FragranceRequestResponse, PredictionResponse, SafetyEvaluationResponse } from '@/types/domain';

const tabs = ['조향식 구성', '성능 프록시', '안전 / 규제', '근거&데이터', '메모'] as const;
type Tab = (typeof tabs)[number];
const display = (value: string | number | boolean | null | undefined) => value === null || value === undefined || value === '' ? '정보 없음' : String(value);
const percent = (value: number | null | undefined) => value === null || value === undefined ? '정보 없음' : `${value}%`;
const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString('ko-KR') : '정보 없음';

export function FormulaDetail({ requestOnly = false }: { requestOnly?: boolean }) {
  const pathname = usePathname();
  const candidateId = Number(pathname.split('/').filter(Boolean).at(-1));
  const [active, setActive] = useState<Tab>('조향식 구성');
  const [candidate, setCandidate] = useState<CandidateResponse | null>(null);
  const [request, setRequest] = useState<FragranceRequestResponse | null>(null);
  const [safety, setSafety] = useState<SafetyEvaluationResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [evidence, setEvidence] = useState<EvidenceLog[]>([]);
  const [evidenceError, setEvidenceError] = useState(false);
  const [memos, setMemos] = useState<CandidateMemoResponse[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [revisionPreview, setRevisionPreview] = useState<CandidateRevisionPreview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<'download' | 'revision' | null>(null);

  useEffect(() => {
    if (!Number.isInteger(candidateId) || candidateId < 1) {
      queueMicrotask(() => { setNotice('잘못된 후보 주소입니다.'); setLoading(false); });
      return;
    }
    let alive = true;
    queueMicrotask(() => setLoading(true));
    if (requestOnly) {
      requestApi.detail(candidateId).then((item) => { if (alive) setRequest(item); })
        .catch((error: unknown) => { if (alive) setNotice(error instanceof Error ? error.message : '향 요청을 불러오지 못했습니다.'); })
        .finally(() => { if (alive) setLoading(false); });
      return () => { alive = false; };
    }
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
      if (results[3].status === 'fulfilled') { setEvidence(results[3].value); setEvidenceError(false); }
      else setEvidenceError(true);
      if (results[4].status === 'fulfilled') setMemos(results[4].value);
    }).catch((error: unknown) => {
      if (alive) setNotice(error instanceof Error ? error.message : '후보를 불러오지 못했습니다.');
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [candidateId, requestOnly]);

  async function selectFinalCandidate() {
    try {
      await experimentApi.update(candidateId, 'CONFIRMED_FOR_EXPERIMENT');
      setCandidate((item) => item ? { ...item, status: 'CONFIRMED_FOR_EXPERIMENT' } : item);
      setNotice('최종후보 선택이 서버에 저장됐습니다.');
      setConfirmOpen(false);
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
      setRevisionPreview(preview);
      setNotice('수정 진단 결과를 받았습니다. 이 단계에서는 후보가 저장되지 않습니다.');
    } catch (error) { setNotice(error instanceof Error ? error.message : '수정 진단에 실패했습니다.'); setFeedback('revision'); }
  }

  async function retryEvidence() {
    if (!candidate) return;
    try { setEvidence(await evidenceApi.logs(candidate.candidateId)); setEvidenceError(false); }
    catch { setEvidenceError(true); }
  }

  function downloadNotes() {
    if (!candidate || !version) return;
    try {
      const lines = [`FORMULA ${candidate.candidateId}`, `버전 V${version.versionId}`, '', '향료 원액 배합비', ...version.ingredients.map((item) => `${item.name}: ${item.concentratePercent}%`), '', '검토 메모', ...memos.map((item) => `${item.memoType}: ${item.content ?? ''}`)];
      const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `formula-${candidate.candidateId}-notes.txt`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setFeedback('download'); }
  }

  const version = candidate?.currentVersion;
  const ingredients = version?.ingredients ?? [];
  const status = candidate?.status === 'CONFIRMED_FOR_EXPERIMENT' ? '최종후보 선택됨' : requestOnly ? '후보 생성 전' : display(candidate?.status);

  return (
    <div className="wf-layout">
      <aside className="wf-rail wf-rail-left" />
      <section className="wf-detail">
        <div className="wf-detail-hero">
          <Link href="/formulas" className="wf-back"><Image className="wf-back-icon" src="/figma/back-arrow.svg" alt="" width={20} height={20} />후보 목록으로 돌아가기</Link>
          <h1 className="wf-detail-title">{candidate ? `FORMULA ${String(candidate.candidateId).padStart(2, '0')}` : requestOnly ? `향 요청 ${String(candidateId).padStart(2, '0')}` : '후보 조향식'}</h1>
          <p className="wf-detail-sub">{requestOnly ? '후보 조향식이 생성되면 이곳에서 배합과 검증 정보를 확인할 수 있습니다.' : version?.generationRationale || (loading ? '불러오는 중…' : '후보 설명이 제공되지 않았습니다.')}</p>
          <div className="wf-detail-meta"><span>생성일&nbsp;&nbsp; {date(requestOnly ? request?.createdAt : version?.createdAt)}</span><span>버전&nbsp;&nbsp; {version ? `V${version.versionId}` : '—'}</span><span>상태&nbsp;&nbsp; {status}</span></div>
          <div className="wf-detail-actions">
            <button type="button" className="wf-btn wf-btn-dark" onClick={() => setConfirmOpen(true)} disabled={!candidate || candidate.status === 'CONFIRMED_FOR_EXPERIMENT'}>{candidate?.status === 'CONFIRMED_FOR_EXPERIMENT' ? '최종후보 선택됨' : '최종후보 선택'}</button>
            <button type="button" className="wf-btn" onClick={duplicateCandidate} disabled={!candidate}>후보 복제</button>
            <button type="button" className="wf-btn" onClick={() => setEditing(true)} disabled={!candidate}>후보 수정</button>
            {notice && <output className="wf-action-notice">{notice}</output>}
          </div>
        </div>
        <div className="wf-tabs">{tabs.map((tab) => <button type="button" className={`wf-tab ${active === tab ? 'active' : ''}`} onClick={() => setActive(tab)} key={tab}>{tab}</button>)}</div>
        <div className="wf-detail-body">
          {loading ? <p>데이터를 불러오는 중입니다.</p> : !candidate && !requestOnly ? <p>{notice || '후보를 찾을 수 없습니다.'}</p> : !candidate && !request ? <p>{notice || '향 요청을 찾을 수 없습니다.'}</p> : <>
            {active === '조향식 구성' && <CompositionSection version={version ?? null} request={request} onDownload={downloadNotes} />}
            {active === '성능 프록시' && <PerformanceSection version={version ?? null} request={request} prediction={prediction} />}
            {active === '안전 / 규제' && <SafetySection safety={safety} request={request} />}
            {active === '근거&데이터' && <EvidenceSection evidence={evidence} ingredientCount={ingredients.length} prediction={prediction} safety={safety} error={evidenceError} onRetry={retryEvidence} />}
            {active === '메모' && <div className="wf-memos">{([['INPUT_NOTE', '입력 내용'], ['REVIEW_NOTE', '검토 사항'], ['NEXT_EXPERIMENT_NOTE', '다음 실험']] as const).map(([memoType, label]) => { const memo = memos.find((item) => item.memoType === memoType); return <MemoEditor key={memoType} label={label} initialContent={memo?.content ?? (memoType === 'INPUT_NOTE' ? request?.structuredIntent.rawText ?? '' : '')} updatedAt={memo?.updatedAt ?? null} editable={Boolean(candidate)} onSave={(content) => saveMemo(memoType, content)} />; })}</div>}
          </>}
        </div>
      </section>
      {confirmOpen && candidate && <div className="fd-overlay"><dialog open className="fd-confirm-dialog" aria-labelledby="fd-confirm-title"><h2 id="fd-confirm-title">최종 후보 확인</h2><p>최종 후보로 선택하시겠습니까?</p><div className="fd-confirm-summary"><strong>FORMULA {String(candidate.candidateId).padStart(2, '0')}</strong><span>버전　 V{version?.versionId ?? '—'}</span><span>원료　 {ingredients.length}종</span><span>예상 원가　 {version?.cost == null ? '—' : `₩${version.cost.toLocaleString()} / kg`}</span><span>상태　 {status}</span></div><footer><button type="button" onClick={() => setConfirmOpen(false)}>취소</button><button type="button" className="is-primary" onClick={selectFinalCandidate}>최종 후보 확정</button></footer></dialog></div>}
      {editing && <div className="fd-overlay"><dialog open className="fd-edit-dialog" aria-labelledby="candidate-edit-title"><button type="button" className="fd-dialog-close" onClick={() => setEditing(false)} aria-label="닫기">×</button><h2 id="candidate-edit-title">후보 수정</h2><label><b>자연어로 수정 요청을 입력해주세요.</b><textarea value={draft} onChange={(event) => { setDraft(event.target.value); setRevisionPreview(null); }} placeholder="어떤 향을 어떻게 조정할지 입력해 주세요." /></label><h3>수정 전 / 후 비교</h3><div className="fd-revision-compare"><section><h4>BEFORE</h4>{ingredients.length ? ingredients.slice(0, 4).map((item) => <p key={item.ingredientId}><span>{item.name}</span><span>{percent(item.concentratePercent)}</span></p>) : <p>배합 데이터가 없습니다.</p>}</section><section><h4>AFTER</h4>{revisionPreview ? <div className="fd-revision-result"><p><span>변경 제안</span><span>{revisionPreview.stateChanged === true ? '있음' : revisionPreview.stateChanged === false ? '없음' : '확인 필요'}</span></p><p><span>다음 단계</span><span>{display(revisionPreview.nextOperation)}</span></p><details><summary>진단 세부 내용</summary><pre>{JSON.stringify(revisionPreview.adjustments ?? revisionPreview.prepared ?? {}, null, 2)}</pre></details></div> : <p>진단 후 변경 제안이 여기에 표시됩니다.</p>}</section></div><p className="fd-dialog-hint">수정 진단 결과는 아직 저장된 후보가 아닙니다. 최종 배합과 점수는 재평가 후 확인할 수 있습니다.</p><footer><button type="button" onClick={() => setEditing(false)}>취소</button><button type="button" className="is-primary" onClick={previewRevision} disabled={!draft.trim()}>진단 요청</button></footer></dialog></div>}
      {feedback && <div className="fd-overlay"><dialog open className="fd-feedback-dialog" aria-labelledby="fd-feedback-title"><h2 id="fd-feedback-title">{feedback === 'download' ? '내려받기에 실패했습니다.' : '수정에 실패했습니다.'}</h2><p>{feedback === 'download' ? '잠시 후 다시 시도해주세요.' : '입력 내용을 확인한 뒤 다시 시도해주세요.'}</p><footer><button type="button" onClick={() => { const retry = feedback; setFeedback(null); if (retry === 'download') downloadNotes(); else void previewRevision(); }}>다시 시도</button><button type="button" className="is-primary" onClick={() => setFeedback(null)}>닫기</button></footer></dialog></div>}
    </div>
  );
}

function MemoEditor({ label, initialContent, updatedAt, editable, onSave }: { label: string; initialContent: string; updatedAt: string | null; editable: boolean; onSave: (content: string) => void }) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => { queueMicrotask(() => setContent(initialContent)); }, [initialContent]);
  return <article className="fd-memo-card"><header><b>{label}</b>{editable && <button type="button" onClick={() => setIsEditing((open) => !open)} aria-label={`${label} 편집`}>✎</button>}</header>{isEditing ? <><textarea className="wf-memo-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="메모를 입력해 주세요." /><button type="button" className="wf-btn" onClick={() => { onSave(content); setIsEditing(false); }} disabled={content === initialContent}>저장</button></> : <p>{content || '내용이 없습니다.'}</p>}{updatedAt && <span className="wf-memo-meta">{date(updatedAt)}</span>}</article>;
}
