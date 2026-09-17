'use client';

import { BadgeCheck, ChevronDown, FileText, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { SafetyDecisionDialog } from './safety-decision-dialog';
import { EvidenceAuditWorkspace } from './evidence-audit-workspace';
import { candidateApi, evidenceApi, projectApi, requestApi, safetyApi } from '@/lib/api/resources';
import type { ApprovalGateResponse, CandidateResponse, EvidenceLog, SafetyEvaluationResponse } from '@/types/domain';

interface Row {
  candidate: CandidateResponse;
  safety: SafetyEvaluationResponse | null;
  gates: ApprovalGateResponse[] | null;
}
const formulaName = (id: number) => `FORMULA ${String(id).padStart(2, '0')}`;
const ratio = (part: number, total: number) => total ? `${Math.round(part / total * 100)}%` : '0%';
const checkText = (value: boolean | null | undefined) => value === true ? '충족' : value === false ? '검토 필요' : '미확인';
const checkClass = (value: boolean | null | undefined) => value === true ? 'is-pass' : value === false ? 'is-review' : 'is-unknown';

function issueTexts(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(issueTexts);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const message = record.message ?? record.detail ?? record.reason ?? record.name;
    return typeof message === 'string' && message.trim() ? [message] : [];
  }
  return [];
}

export function ExperimentWorkspace() {
  const audit = useSearchParams().get('view') === 'audit';
  return audit ? <EvidenceAuditWorkspace /> : <SafetyWorkspace />;
}

function SafetyWorkspace() {
  const audit = useSearchParams().get('view') === 'audit';
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<EvidenceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [regulation, setRegulation] = useState('전체');
  const [issuesOpen, setIssuesOpen] = useState(true);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionComment, setDecisionComment] = useState('');
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    let alive = true;
    projectApi.list().then(async (projects) => {
      const requests = await Promise.all(projects.map((project) => requestApi.list(project.projectId)));
      const candidateGroups = await Promise.all(requests.flatMap((page) => page.content).map((request) => candidateApi.list(request.requestId)));
      const candidates = candidateGroups.flat();
      const [safetyResults, gateResults] = await Promise.all([
        Promise.allSettled(candidates.map((candidate) => safetyApi.detail(candidate.candidateId))),
        Promise.allSettled(candidates.map((candidate) => safetyApi.gates(candidate.candidateId))),
      ]);
      if (!alive) return;
      setRows(candidates.map((candidate, index) => ({
        candidate,
        safety: safetyResults[index].status === 'fulfilled' ? safetyResults[index].value : null,
        gates: gateResults[index].status === 'fulfilled' ? gateResults[index].value : null,
      })));
      if (candidates.length) setSelectedId((current) => current ?? candidates[0].candidateId);
    }).catch((error: unknown) => {
      if (alive) setNotice(error instanceof Error ? error.message : '안전성 데이터를 불러오지 못했습니다.');
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!audit || !selectedId) return;
    let alive = true;
    evidenceApi.logs(selectedId).then((items) => { if (alive) setLogs(items); }).catch((error: unknown) => {
      if (alive) setNotice(error instanceof Error ? error.message : '이력을 불러오지 못했습니다.');
    });
    return () => { alive = false; };
  }, [audit, selectedId]);

  const total = rows.length;
  const passed = rows.filter(({ safety }) => safety?.internalGatePassed === true).length;
  const review = rows.filter(({ safety }) => safety?.internalGatePassed === false).length;
  const unknown = total - passed - review;
  const regulatoryPassed = rows.filter(({ safety }) => safety?.regulatoryDataComplete === true).length;
  const approved = rows.filter(({ gates }) => gates?.at(-1)?.decision === 'APPROVED').length;
  const approvalAvailable = rows.some(({ gates }) => gates !== null);
  const selected = rows.find(({ candidate }) => candidate.candidateId === selectedId);
  const issues = selected?.safety ? [
    ...issueTexts(selected.safety.violations),
    ...issueTexts(selected.safety.warnings),
    ...issueTexts(selected.safety.missingDocuments),
  ] : [];
  const gateSegments = total ? [passed, review, unknown].map((count) => count / total * 100) : [0, 0, 100];
  const donutStyle = { background: `conic-gradient(#d1b67d 0 ${gateSegments[0]}%, #dfdfdf ${gateSegments[0]}% ${gateSegments[0] + gateSegments[1]}%, #542d13 ${gateSegments[0] + gateSegments[1]}% 100%)` };

  async function submitDecision(decision: 'APPROVED' | 'REJECTED') {
    if (!selectedId || deciding) return;
    setDeciding(true);
    setNotice('');
    try {
      const gate = await safetyApi.decide(selectedId, decision, decisionComment.trim() || undefined);
      setRows((current) => current.map((row) => row.candidate.candidateId === selectedId
        ? { ...row, gates: [...(row.gates ?? []), gate] }
        : row));
      setDecisionOpen(false);
      setDecisionComment('');
      setNotice(decision === 'APPROVED' ? '안전 검토가 승인되었습니다.' : '안전 검토가 반려되었습니다.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '검토 결정을 저장하지 못했습니다.');
    } finally {
      setDeciding(false);
    }
  }

  return (
    <div className={`wf-layout wf-experiment-page ${audit ? 'is-audit' : 'is-safety'}`}>
      <ProjectSidebar />
      <section className="wf-main">
        <header className="wf-safety-header">
          <h1>{audit ? '증거·감사 이력' : '안전 규제'}</h1>
          <p>{audit ? '서버에 기록된 후보별 근거와 감사 이력을 확인합니다.' : '후보 조향식의 원료 안전성, 규제 기준 충족 여부와 제품 적용에 필요한 검토·승인 현황을 확인합니다.'}</p>
        </header>
        <div className="wf-safety-content">
          {loading ? <p>데이터를 불러오는 중입니다.</p> : audit ? (
            <div className="wf-safety-audit">
              <label>후보 선택 <select value={selectedId ?? ''} onChange={(event) => setSelectedId(Number(event.target.value) || null)}><option value="">후보를 선택하세요</option>{rows.map(({ candidate }) => <option key={candidate.candidateId} value={candidate.candidateId}>{formulaName(candidate.candidateId)}</option>)}</select></label>
              {selectedId && (logs.length ? logs.map((log, index) => <article className="wf-audit-row" key={`${log.occurredAt}-${index}`}><time>{new Date(log.occurredAt).toLocaleString('ko-KR')}</time><span>{log.action}</span><span>{log.detail || '상세 내용 없음'}</span></article>) : <p>기록된 근거·감사 이력이 없습니다.</p>)}
            </div>
          ) : (
            <>
              <section className="wf-safety-overview">
                <h2>전체 현황</h2>
                <p>후보 조향식의 안전성, 규제준수, 승인현황을 요약한 결과입니다.</p>
                <div className="wf-safety-summary-grid">
                  <article><i><ShieldCheck size={29} strokeWidth={1.8} /></i><span><b>안전 게이트 현황</b><strong>{passed}/{total} 통과</strong><em><u style={{ width: ratio(passed, total) }} /></em></span></article>
                  <article><i><FileText size={27} strokeWidth={1.8} /></i><span><b>규제 검토 자료</b><strong>{regulatoryPassed}/{total} 충족</strong><em><u style={{ width: ratio(regulatoryPassed, total) }} /></em></span></article>
                  <article><i><BadgeCheck size={29} strokeWidth={1.8} /></i><span><b>승인 현황</b><strong>{approvalAvailable ? `${approved}/${total} 승인` : '조회 불가'}</strong><em><u style={{ width: ratio(approved, total) }} /></em></span></article>
                </div>
              </section>

              <section className="wf-required-checks">
                <div className="wf-section-head">
                  <div className="wf-required-title"><h2>필수 평가 항목</h2><label><span className="sr-only">후보 선택</span><select value={selectedId ?? ''} onChange={(event) => setSelectedId(Number(event.target.value) || null)}><option value="">후보를 선택하세요</option>{rows.map(({ candidate }) => <option key={candidate.candidateId} value={candidate.candidateId}>{formulaName(candidate.candidateId)}</option>)}</select></label></div>
                  <button type="button" className="wf-review-button" onClick={() => { setNotice(''); setDecisionOpen(true); }} disabled={!selected?.safety}>안전 검토 결정하기</button>
                </div>
                {selected?.safety ? <div className="wf-required-list">
                  <div className="wf-check-row"><b>안전 게이트</b><span>{checkText(selected.safety.internalGatePassed)}</span><small>{selected.safety.validationLevel || '검증 수준 미제공'}</small></div>
                  <div className="wf-check-row"><b>규제 데이터 완전성</b><span>{checkText(selected.safety.regulatoryDataComplete)}</span><small>{selected.safety.targetRegion || '대상 지역 미제공'}</small></div>
                  <div className="wf-check-row"><b>알레르겐 정량 검토</b><span>{checkText(selected.safety.allergenQuantificationComplete)}</span><small>{issueTexts(selected.safety.potentialEuAllergens).length ? '잠재 알레르겐 확인 필요' : ''}</small></div>
                  <div className="wf-check-row"><b>근거·기준 검토</b><span>{checkText(selected.safety.internalEvidenceComplete)}</span><small>{selected.safety.standardsCheckedOn ? `기준 검토 ${selected.safety.standardsCheckedOn}` : '기준 검토일 미제공'}</small></div>
                </div> : <p className="wf-safety-empty">{rows.length ? '이 후보의 안전성 평가 결과가 없습니다.' : '조회할 후보 조향식이 없습니다.'}</p>}
              </section>

              <div className="wf-safety-lower">
                <section className="wf-compliance">
                  <h2>규제 준수 현황</h2>
                  <div className="wf-filter-pills" aria-label="규제 기준 선택">{['전체', 'IFRA', 'EU REACH', 'K-REACH', 'FDA'].map((item) => <button type="button" key={item} className={regulation === item ? 'active' : ''} onClick={() => setRegulation(item)}>{item}</button>)}</div>
                  <div className="wf-compliance-head"><span>후보 명</span><span>IFRA</span><span>EU REACH</span><span>K-REACH</span><span>FDA</span><span>자료 상태</span></div>
                  {rows.map(({ candidate, safety }) => <div className="wf-compliance-row" key={candidate.candidateId}>
                    <span>{formulaName(candidate.candidateId)}</span>
                    {['IFRA', 'EU REACH', 'K-REACH', 'FDA'].map((item) => <span key={item} className={`wf-compliance-dot is-unknown ${regulation !== '전체' && regulation !== item ? 'is-muted' : ''}`} data-regulation={item} title={`${item} 개별 판정 미제공`} aria-label={`${item} 개별 판정 미제공`} />)}
                    <b className={checkClass(safety?.regulatoryDataComplete)}>{checkText(safety?.regulatoryDataComplete)}</b>
                  </div>)}
                  <p className="wf-regulation-note">개별 규제 기준별 판정은 서버 응답에 없어 미확인으로 표시합니다.</p>
                </section>
                <section className="wf-gate">
                  <h2>안전 게이트 현황</h2>
                  <div className="wf-gate-summary">
                    <div className="wf-donut" style={donutStyle} title={`전체 ${total}개 중 통과 ${passed}개, 검토 필요 ${review}개, 결과 없음 ${unknown}개`}><b>{total}</b></div>
                    <ul><li><i />통과 <b>{passed}</b></li><li><i />검토 필요 <b>{review}</b></li><li><i />결과 없음 <b>{unknown}</b></li></ul>
                  </div>
                  <div className={`wf-major-issue ${issuesOpen ? 'is-expanded' : ''}`}>
                    <div className="wf-major-issue-head"><h3>주요 이슈 {selected ? `· ${formulaName(selected.candidate.candidateId)}` : ''}</h3><button type="button" onClick={() => setIssuesOpen((open) => !open)} aria-label={issuesOpen ? '주요 이슈 접기' : '주요 이슈 펼치기'} aria-expanded={issuesOpen}><ChevronDown size={20} /></button></div>
                    {issuesOpen && (!selected?.safety ? <p>안전성 평가 결과가 없습니다.</p> : issues.length ? <ul>{issues.slice(0, 4).map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}</ul> : <p>기록된 주요 이슈가 없습니다.</p>)}
                  </div>
                </section>
              </div>
            </>
          )}
          {notice && <output className="wf-safety-notice">{notice}</output>}
        </div>
      </section>
      {decisionOpen && selected && <SafetyDecisionDialog candidate={selected.candidate} comment={decisionComment} onCommentChange={setDecisionComment} busy={deciding} notice={notice} onClose={() => setDecisionOpen(false)} onSubmit={submitDecision} />}
    </div>
  );
}
