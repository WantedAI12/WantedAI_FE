'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import Link from '@/components/ui/app-link';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { candidateApi, projectApi, requestApi } from '@/lib/api/resources';
import { routes } from '@/lib/routes';
import type { CandidateResponse, CandidateStatus } from '@/types/domain';

type Row = { candidate: CandidateResponse; accords: string[] };
const statuses: Record<CandidateStatus, string> = {
  UNDER_REVIEW: '검토대기',
  CONFIRMED_FOR_EXPERIMENT: '실험 후보 확정',
  IN_SENSORY_TEST: '관능 시험 중',
  APPROVED: '적합',
  REJECTED: '반려',
};

export function FormulaManagementWorkspace() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const projects = await projectApi.list();
        const groups = await Promise.all(
          projects.map(async (project) => {
            const first = await requestApi.list(
              project.projectId,
              undefined,
              0,
              100,
            );
            const rest = await Promise.all(
              Array.from(
                { length: Math.max(0, first.totalPages - 1) },
                (_, index) =>
                  requestApi.list(project.projectId, undefined, index + 1, 100),
              ),
            );
            const requests = [first, ...rest].flatMap((page) => page.content);
            return (
              await Promise.all(
                requests.map(async (request) =>
                  (await candidateApi.list(request.requestId)).map(
                    (candidate) => ({
                      candidate,
                      accords: request.structuredIntent?.accords ?? [],
                    }),
                  ),
                ),
              )
            ).flat();
          }),
        );
        if (active)
          setRows(
            groups
              .flat()
              .sort(
                (a, b) => a.candidate.candidateId - b.candidate.candidateId,
              ),
          );
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [attempt]);
  const filtered = rows.filter(({ candidate }) =>
    `FORMULA ${String(candidate.candidateId).padStart(2, '0')}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="wf-layout wf-org-page fm-page">
      <ProjectSidebar />
      <section className="wf-main">
        <header className="fm-hero">
          <nav aria-label="현재 위치">
            <Link href={routes.organization}>
              <ArrowLeft size={19} />
              조직 관리
            </Link>
            <span aria-hidden="true">›</span>
            <span>진행 중인 조향식</span>
          </nav>
          <h1>조향식</h1>
          <p>진행 중인 조향식을 확인할 수 있습니다.</p>
          <Link className="fm-create" href={routes.request}>
            + 새 향 만들기
          </Link>
        </header>
        <div className="fm-content">
          <section
            className="fm-panel"
            aria-labelledby="fm-heading"
            aria-busy={loading}
          >
            <h2 id="fm-heading">진행 중인 조향식</h2>
            <div className="fm-summary">
              <strong>{loading || error ? '—' : `${rows.length}개`}</strong>
              <span>
                검토대기{' '}
                {loading || error
                  ? '—'
                  : rows.filter(
                      (row) => row.candidate.status === 'UNDER_REVIEW',
                    ).length}
                개
              </span>
            </div>
            <label className="fm-search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label="번호 또는 후보명으로 검색"
                placeholder="번호 또는 후보명으로 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="fm-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>후보명</th>
                    <th>향조</th>
                    <th>승인현황</th>
                    <th>최종검토일</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading &&
                    !error &&
                    filtered.map(({ candidate, accords }) => (
                      <tr key={candidate.candidateId}>
                        <td>
                          {String(candidate.candidateId).padStart(2, '0')}
                        </td>
                        <td>
                          <Link
                            href={routes.formulaDetail(candidate.candidateId)}
                          >
                            FORMULA{' '}
                            {String(candidate.candidateId).padStart(2, '0')}
                          </Link>
                        </td>
                        <td>{accords.join(', ') || '—'}</td>
                        <td>
                          <span
                            className={`fm-status fm-status-${candidate.status}`}
                          >
                            <i aria-hidden="true" />
                            {statuses[candidate.status]}
                          </span>
                        </td>
                        <td>
                          <span title="최종 검토일 정보가 제공되지 않습니다.">
                            —
                          </span>
                        </td>
                      </tr>
                    ))}
                  {(loading || error || !filtered.length) && (
                    <tr>
                      <td colSpan={5} className="fm-empty">
                        {loading ? (
                          '조향식을 불러오는 중입니다.'
                        ) : error ? (
                          <>
                            <p>조향식을 불러오지 못했습니다.</p>
                            <button
                              onClick={() => {
                                setLoading(true);
                                setError(false);
                                setAttempt((value) => value + 1);
                              }}
                            >
                              다시 조회
                            </button>
                          </>
                        ) : query.trim() ? (
                          '검색 결과가 없습니다.'
                        ) : (
                          '등록된 조향식이 없습니다.'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!loading && !error && rows.length > 0 && (
              <p className="fm-note">
                향조는 향 요청 기준입니다. 최종 검토일은 제공된 정보가 없어
                표시하지 않습니다.
              </p>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
