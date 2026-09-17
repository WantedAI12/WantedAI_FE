'use client';

import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api/client';

export function OperationsWorkspace() {
  const [health, setHealth] = useState('확인 중');
  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl('/actuator/health'), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Health check failed');
        return response.json();
      })
      .then((result) =>
        setHealth(
          (result as { status?: string }).status === 'UP'
            ? '정상'
            : '확인 필요',
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted) setHealth('연결 실패');
      });
    return () => controller.abort();
  }, []);
  return (
    <div className="wf-layout wf-operations-page">
      <ProjectSidebar />
      <section className="wf-main">
        <header className="wf-operations-header">
          <h1>서비스 운영 상태</h1>
          <p>작업 큐, 감사 로그, 관측성 지표입니다.</p>
        </header>
        <div className="wf-operations-content">
          <div className="ops-section-heading">
            <h2>전체 현황</h2>
            <output className="ops-health">API 서버 · {health}</output>
          </div>
          <div className="wf-operations-cards">
            {['후보 생성 큐 대기', '평균 후보 생성 시간', '기권 현황'].map(
              (label) => (
                <article key={label}>
                  <b>{label}</b>
                  <strong aria-label="데이터 미제공">—</strong>
                </article>
              ),
            )}
          </div>
          <p className="ops-data-note">운영 지표는 아직 제공되지 않습니다.</p>
          <h2 className="wf-events-title">최근 시스템 이벤트</h2>
          <section className="ops-events" aria-label="최근 시스템 이벤트">
            <table>
              <thead>
                <tr>
                  <th scope="col">시각</th>
                  <th scope="col">이벤트</th>
                  <th scope="col">상태</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3} className="ops-empty">
                    시스템 이벤트 조회 기능이 아직 제공되지 않습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </section>
    </div>
  );
}
