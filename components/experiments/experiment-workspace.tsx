'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { candidateApi, evidenceApi, projectApi, requestApi, safetyApi } from '@/lib/api/resources';
import type { CandidateResponse, EvidenceLog, SafetyEvaluationResponse } from '@/types/domain';

interface Row { candidate: CandidateResponse; safety: SafetyEvaluationResponse | null }

export function ExperimentWorkspace() {
  const audit = useSearchParams().get('view') === 'audit';
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<EvidenceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    projectApi.list().then(async (projects) => {
      const requests = await Promise.all(projects.map((project) => requestApi.list(project.projectId)));
      const candidateGroups = await Promise.all(requests.flatMap((page) => page.content).map((request) => candidateApi.list(request.requestId)));
      const candidates = candidateGroups.flat();
      const safetyResults = await Promise.allSettled(candidates.map((candidate) => safetyApi.detail(candidate.candidateId)));
      if (alive) setRows(candidates.map((candidate, index) => ({ candidate, safety: safetyResults[index].status === 'fulfilled' ? safetyResults[index].value : null })));
    }).catch((error: unknown) => { if (alive) setNotice(error instanceof Error ? error.message : '안전성 데이터를 불러오지 못했습니다.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    evidenceApi.logs(selectedId).then((items) => { if (alive) setLogs(items); }).catch((error: unknown) => { if (alive) setNotice(error instanceof Error ? error.message : '이력을 불러오지 못했습니다.'); });
    return () => { alive = false; };
  }, [selectedId]);

  const passed = rows.filter((row) => row.safety?.internalGatePassed === true).length;
  const review = rows.filter((row) => row.safety && row.safety.internalGatePassed !== true).length;
  const unknown = rows.length - passed - review;
  const selected = rows.find((row) => row.candidate.candidateId === selectedId);
  return <div className={`wf-layout wf-experiment-page ${audit ? 'is-audit' : 'is-safety'}`}><ProjectSidebar /><section className="wf-main"><header className="wf-safety-header"><h1>{audit ? '증거·감사 이력' : '안전 규제'}</h1><p>서버에 기록된 후보별 안전성 및 근거 데이터를 확인합니다.</p></header><div className="wf-safety-content">{loading ? <p>데이터를 불러오는 중입니다.</p> : !rows.length ? <p>조회할 후보 조향식이 없습니다.</p> : audit ? <><label>후보 선택 <select value={selectedId ?? ''} onChange={(event) => setSelectedId(Number(event.target.value) || null)}><option value="">후보를 선택하세요</option>{rows.map((row) => <option key={row.candidate.candidateId} value={row.candidate.candidateId}>FORMULA {String(row.candidate.candidateId).padStart(2, '0')}</option>)}</select></label>{selectedId && (logs.length ? logs.map((log, index) => <article className="wf-audit-row" key={`${log.occurredAt}-${index}`}><time>{new Date(log.occurredAt).toLocaleString('ko-KR')}</time><span>{log.action}</span><span>{log.detail || '상세 내용 없음'}</span></article>) : <p>기록된 근거·감사 이력이 없습니다.</p>)}</> : <><section className="wf-safety-overview"><h2>전체 현황</h2><p>등록된 후보 조향식의 서버 안전 게이트 결과입니다.</p><div><article><b>통과</b><strong>{passed} / {rows.length}</strong></article><article><b>검토 필요</b><strong>{review}</strong></article><article><b>결과 없음</b><strong>{unknown}</strong></article></div></section><section className="wf-safety-compliance"><h2>규제 준수 현황</h2><div className="wf-safety-table"><div className="head"><b>후보명</b><b>검토 상태</b><b>안전 게이트</b><b>승인 상태</b></div>{rows.map((row) => <div key={row.candidate.candidateId}><span>FORMULA {String(row.candidate.candidateId).padStart(2, '0')}</span><span>{row.safety?.status || '결과 없음'}</span><span>{row.safety?.internalGatePassed === true ? '통과' : row.safety ? '검토 필요' : '결과 없음'}</span><span>{row.candidate.status}</span></div>)}</div></section><section className="wf-safety-overview"><h2>필수 평가 항목</h2><label>후보 선택 <select value={selectedId ?? ''} onChange={(event) => setSelectedId(Number(event.target.value) || null)}><option value="">후보를 선택하세요</option>{rows.map((row) => <option key={row.candidate.candidateId} value={row.candidate.candidateId}>FORMULA {String(row.candidate.candidateId).padStart(2, '0')}</option>)}</select></label>{selected && <div><p>검증 수준: {selected.safety?.validationLevel || '정보 없음'}</p><p>규제 데이터 완전성: {selected.safety?.regulatoryDataComplete === true ? '충족' : '미확인'}</p><p>알레르겐 정량 검토: {selected.safety?.allergenQuantificationComplete === true ? '충족' : '미확인'}</p><p>기준 검토일: {selected.safety?.standardsCheckedOn || '정보 없음'}</p></div>}</section></>}{notice && <output>{notice}</output>}</div></section></div>;
}
