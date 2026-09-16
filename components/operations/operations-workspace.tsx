'use client';

import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api/client';

export function OperationsWorkspace() {
  const [health, setHealth] = useState('확인 중');
  useEffect(() => {
    fetch(apiUrl('/actuator/health'))
      .then((response) => response.json())
      .then((result) => setHealth((result as { status?: string }).status === 'UP' ? '정상' : '확인 필요'))
      .catch(() => setHealth('연결 실패'));
  }, []);
  return (
    <div className="wf-layout wf-operations-page">
      <ProjectSidebar />
      <section className="wf-main">
        <header className="wf-operations-header">
          <h1>서비스 운영 상태</h1>
          <p>운영 API의 연결 상태를 확인합니다.</p>
        </header>
        <div className="wf-operations-content">
          <h2>전체 현황</h2>
          <div className="wf-operations-cards">
            <article><b>API 서버</b><strong>{health}</strong></article>
          </div>
          <h2 className="wf-events-title">최근 시스템 이벤트</h2>
          <section className="wf-events-table">
            <div className="head">
              <b>시각</b>
              <b>이벤트</b>
              <b>상태</b>
            </div>
            <div><span>시스템 이벤트 조회 API가 제공되지 않습니다.</span></div>
          </section>
        </div>
      </section>
    </div>
  );
}
