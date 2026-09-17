'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { ApiError } from '@/lib/api/client';
import { candidateApi, evidenceApi, projectApi, requestApi } from '@/lib/api/resources';
import type { CandidateResponse, CandidateVersionResponse, EvidenceLog } from '@/types/domain';
import { EvidenceDownloadDialog } from './evidence-download-dialog';

type LoadState = 'loading' | 'ready' | 'error' | 'forbidden';
type Category = '전체' | '후보' | '조향식' | '데이터';
const name = (id: number) => `FORMULA ${String(id).padStart(2, '0')}`;
const errorState = (error: unknown): LoadState => error instanceof ApiError && (error.status === 401 || error.status === 403) ? 'forbidden' : 'error';
const actionNames: Record<string, string> = {
  CANDIDATE_VERSION_CREATED: '조향식 버전 생성',
  APPROVAL_GATE_APPROVED: '안전·규제 검토 승인',
  APPROVAL_GATE_REJECTED: '안전·규제 검토 반려',
  EXPERIMENT_STATUS_UNDER_REVIEW: '후보 검토 시작',
  EXPERIMENT_STATUS_CONFIRMED_FOR_EXPERIMENT: '실험 후보로 확정',
  EXPERIMENT_STATUS_IN_SENSORY_TEST: '관능 시험 진행',
  EXPERIMENT_STATUS_APPROVED: '후보 승인',
  EXPERIMENT_STATUS_REJECTED: '후보 반려',
};

function category(action: string): Category {
  if (/VERSION|FORMULA/.test(action)) return '조향식';
  if (/DATA|EVIDENCE|CATALOG|MODEL/.test(action)) return '데이터';
  return '후보';
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(date);
}

function AuditState({ state, retry, emptyText = '현재 확인할 수 있는 감사 이력이 없습니다.' }: { state: LoadState; retry: () => void; emptyText?: string }) {
  return <output className="ea-state">
    {state === 'loading' ? <p>이력을 불러오는 중입니다.</p> : state === 'forbidden' ? <><p>접근할 수 없습니다.</p><small>해당 이력을 확인할 권한이 없습니다.</small></> : state === 'error' ? <><p>조회에 실패했습니다.</p><button type="button" onClick={retry}>다시시도</button></> : <><p>등록된 이력이 없습니다.</p><small>{emptyText}</small></>}
  </output>;
}

export function EvidenceAuditWorkspace() {
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => {
      const projects = await projectApi.list();
      const groups = await Promise.all(projects.map(async (project) => {
        const first = await requestApi.list(project.projectId, undefined, 0, 100);
        const pages = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) => requestApi.list(project.projectId, undefined, index + 1, 100)));
        const requests = [first, ...pages].flatMap((page) => page.content);
        return (await Promise.all(requests.map((request) => candidateApi.list(request.requestId)))).flat();
      }));
      if (!alive) return;
      const items = [...new Map(groups.flat().map((candidate) => [candidate.candidateId, candidate])).values()];
      setCandidates(items);
      setSelectedId((current) => items.some((item) => item.candidateId === current) ? current : items[0]?.candidateId ?? null);
      setState('ready');
    })().catch((error: unknown) => { if (alive) setState(errorState(error)); });
    return () => { alive = false; };
  }, [attempt]);
  const selected = candidates.find((candidate) => candidate.candidateId === selectedId);
  return <div className="wf-layout wf-experiment-page is-audit"><ProjectSidebar /><section className="wf-main">
    <AuditContent key={selectedId ?? 'none'} candidate={selected} candidates={candidates} select={setSelectedId} parentState={state} retryParent={() => { setState('loading'); setAttempt((value) => value + 1); }} />
  </section></div>;
}

function AuditContent({ candidate, candidates, select, parentState, retryParent }: { candidate?: CandidateResponse; candidates: CandidateResponse[]; select: (id: number) => void; parentState: LoadState; retryParent: () => void }) {
  const [tab, setTab] = useState<'logs' | 'versions'>('logs');
  const [filter, setFilter] = useState<Category>('전체');
  const [logs, setLogs] = useState<EvidenceLog[]>([]);
  const [versions, setVersions] = useState<CandidateVersionResponse[]>([]);
  const [logsState, setLogsState] = useState<LoadState>('loading');
  const [versionsState, setVersionsState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const id = candidate?.candidateId;
  useEffect(() => {
    if (!id) return;
    let alive = true;
    evidenceApi.logs(id).then((items) => { if (alive) { setLogs(items); setLogsState('ready'); } }).catch((error: unknown) => { if (alive) setLogsState(errorState(error)); });
    candidateApi.versions(id).then((items) => { if (alive) { setVersions(items); setVersionsState('ready'); } }).catch((error: unknown) => { if (alive) setVersionsState(errorState(error)); });
    return () => { alive = false; };
  }, [id, attempt]);
  const state = parentState !== 'ready' || !candidate ? parentState : tab === 'logs' ? logsState : versionsState;
  const filtered = logs.filter((log) => filter === '전체' || category(log.action) === filter);
  const retry = () => {
    if (parentState !== 'ready') { retryParent(); return; }
    setLogsState('loading');
    setVersionsState('loading');
    setAttempt((value) => value + 1);
  };
  return <>
    <header className="wf-audit-header ea-header">
      <h1><label className="ea-candidate-select"><span className="sr-only">후보 선택</span><select value={id ?? ''} onChange={(event) => select(Number(event.target.value))} disabled={!candidates.length}>{!candidates.length && <option value="">증거·감사 이력</option>}{candidates.map((item) => <option key={item.candidateId} value={item.candidateId}>{name(item.candidateId)}</option>)}</select><ChevronDown size={23} aria-hidden="true" /></label></h1>
      <p>{candidate ? `후보 ${name(candidate.candidateId)}의 생성부터 승인까지 전체 이력입니다.` : '후보 조향식의 생성부터 승인까지 전체 이력을 확인합니다.'}</p>
      <button className="ea-download" type="button" onClick={() => setDownloadOpen(true)} disabled={!candidate || state === 'forbidden'}>보고서 다운로드</button>
    </header>
    <nav className="ea-tabs" aria-label="이력 보기"><button type="button" className={tab === 'logs' ? 'active' : ''} aria-pressed={tab === 'logs'} onClick={() => setTab('logs')}>감사 로그</button><button type="button" className={tab === 'versions' ? 'active' : ''} aria-pressed={tab === 'versions'} onClick={() => setTab('versions')}>버전 이력</button></nav>
    {tab === 'versions' ? <section className="ea-version-body">
      <div className="ea-version-panel">
        <table className="ea-version-table">
          <thead><tr><th scope="col"><h2>버전 이력</h2></th><th scope="col">생성일자</th></tr></thead>
          <tbody>{state !== 'ready' || !candidate || !versions.length ? <tr><td colSpan={2}><AuditState state={state} retry={retry} emptyText="현재 확인할 수 있는 버전 이력이 없습니다." /></td></tr> : [...versions].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.versionId - b.versionId).map((version, index) => {
            const current = version.versionId === candidate.currentVersion.versionId;
            return <tr key={version.versionId} className={current ? 'is-current' : ''}>
              <td><strong>{current ? '현재버전' : '이전버전'}: V{index + 1}</strong><p>{version.generationRationale?.trim() || (version.parentVersionId == null ? '초기 생성' : '기록된 변경 내용이 없습니다.')}</p></td>
              <td><time dateTime={version.createdAt} title={dateLabel(version.createdAt)}>{dateLabel(version.createdAt).slice(0, 10).replaceAll('-', '.')}</time></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </section> : <section className="ea-body"><div className="ea-timeline">
      <h2>감사 로그</h2>
      {<div className="ea-filters">{(['전체', '후보', '조향식', '데이터'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>}
      {state !== 'ready' || !candidate || !filtered.length ? <AuditState state={state} retry={retry} emptyText={filter === '전체' ? '현재 확인할 수 있는 감사 이력이 없습니다.' : '선택한 분류에 해당하는 감사 이력이 없습니다.'} /> : <div className="ea-events">
        {filtered.map((log, index) => <article className="ea-event" key={`${log.action}-${log.occurredAt}-${index}`}><time dateTime={log.occurredAt}>{dateLabel(log.occurredAt)}</time><details className="ea-event-card"><summary><span><b>{actionNames[log.action] ?? log.action.replaceAll('_', ' ')}</b><small>{log.actorId == null || log.actorId === 0 ? 'system' : `사용자 #${log.actorId}`}</small></span><ChevronDown size={21} /></summary><dl><div><dt>변경 사유</dt><dd>{log.detail || '기록된 상세 사유가 없습니다.'}</dd></div><div><dt>변경 항목</dt><dd>{actionNames[log.action] ?? log.action}</dd></div><div><dt>조향식 버전</dt><dd>{log.candidateVersionId ? `버전 #${log.candidateVersionId}` : '해당 없음'}</dd></div><div><dt>기록 일시</dt><dd>{dateLabel(log.occurredAt)}</dd></div></dl></details></article>)}
      </div>}
    </div></section>}
    {downloadOpen && candidate && <EvidenceDownloadDialog candidate={candidate} onClose={() => setDownloadOpen(false)} />}
  </>;
}
