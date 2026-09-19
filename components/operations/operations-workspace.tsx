'use client';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { useEffect, useState } from 'react';
import { operationsApi, type OperationsOverview, type OperationsEvent } from '@/lib/api/operations';

const metric = (value: number | null | undefined) => value == null ? '—' : String(Number(value.toFixed(1)));
export function OperationsWorkspace() {
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [events, setEvents] = useState<OperationsEvent[]>([]);
  const [errors, setErrors] = useState({ overview: '', events: '' });
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    void Promise.allSettled([operationsApi.overview(), operationsApi.events()]).then(([summary, history]) => {
      if (!alive) return;
      setOverview(summary.status === 'fulfilled' ? summary.value : null);
      setEvents(history.status === 'fulfilled' ? history.value : []);
      const message = (error: unknown) => error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.';
      setErrors({ overview: summary.status === 'rejected' ? message(summary.reason) : '', events: history.status === 'rejected' ? message(history.reason) : '' });
      setLoading(false);
    });
    return () => { alive = false; };
  }, [attempt]);
  return <div className="wf-layout wf-operations-page"><ProjectSidebar /><section className="wf-main">
    <header className="wf-operations-header"><h1>서비스 운영 상태</h1><p>내가 속한 프로젝트의 작업 큐와 최근 이벤트입니다.</p></header>
    <div className="wf-operations-content" aria-busy={loading}>
      <div className="ops-section-heading"><h2>전체 현황</h2><button type="button" disabled={loading} onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>{loading ? '조회 중…' : '새로고침'}</button></div>
      {errors.overview && <p role="alert">현황 조회 실패: {errors.overview}</p>}
      <div className="wf-operations-cards">
        <article><b>후보 생성 큐 대기</b><strong>{metric(overview?.queue.waiting)}</strong><p>실행 중 {metric(overview?.queue.running)}건</p></article>
        <article><b>평균 후보 생성 시간</b><strong>{metric(overview?.generationTime.averageSeconds)}{overview?.generationTime.averageSeconds != null ? '초' : ''}</strong><p>집계 대상 {metric(overview?.generationTime.sampleSize)}건</p></article>
        <article><b>기권 현황</b><strong>{metric(overview?.abstention.count)}</strong><p>기권율 {metric(overview?.abstention.ratePercent)}{overview?.abstention.ratePercent != null ? '%' : ''}</p></article>
      </div>
      <p className="ops-data-note">{loading ? '운영 지표를 불러오는 중입니다.' : overview?.projectCount === 0 ? '참여 중인 프로젝트가 없습니다. 프로젝트를 만든 뒤 이용해 주세요.' : overview ? `참여 프로젝트 ${overview.projectCount}개 · 생성 이력이 없으면 0 또는 —로 표시됩니다.` : '현황을 확인할 수 없습니다.'}</p>
      <h2 className="wf-events-title">최근 시스템 이벤트</h2><p>시각은 한국 시간(KST) 기준입니다.</p>
      <section className="ops-events" aria-label="최근 시스템 이벤트"><table><thead><tr><th scope="col">시각</th><th scope="col">이벤트</th><th scope="col">상태</th></tr></thead><tbody>
        {loading ? <tr><td colSpan={3}>불러오는 중입니다.</td></tr> : errors.events ? <tr><td colSpan={3}><p role="alert">이벤트 조회 실패: {errors.events}</p></td></tr> : events.length === 0 ? <tr><td colSpan={3} className="ops-empty">아직 기록된 시스템 이벤트가 없습니다.</td></tr> : events.map((event, index) => <tr key={`${event.category}-${event.referenceId}-${event.occurredAt}-${index}`}><td>{event.occurredAt.replace('T', ' ').slice(0, 19)}</td><td>{event.event}<p>{event.projectName}</p>{event.detail && <p style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{event.detail}</p>}</td><td>{event.statusLabel}</td></tr>)}
      </tbody></table></section>
    </div>
  </section></div>;
}
