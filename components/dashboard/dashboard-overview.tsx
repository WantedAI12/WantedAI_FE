'use client';

import Link from '@/components/ui/app-link';
import Image from 'next/image';
import { routes } from '@/lib/routes';
import { useEffect, useState } from 'react';
import { hubApi } from '@/lib/api/resources';
import { tokenStorage } from '@/lib/api/client';
import type { HubSummaryResponse } from '@/types/domain';

export function DashboardOverview() {
  const [activityOpen, setActivityOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [summary, setSummary] = useState<HubSummaryResponse | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      queueMicrotask(() => setStatus('로그인하면 내 프로젝트 현황을 확인할 수 있습니다.'));
      return;
    }
    hubApi.summary().then(setSummary).catch(() => setStatus('현황을 불러오지 못했습니다.'));
  }, []);

  return (
    <div className="wf-home-canvas">
      <section className="wf-home-hero">
        <div className="wf-home-inner">
          <h1 className="wf-home-title">
            <Image className="wf-home-script" src="/figma/home-script-logo.svg" alt="Design" width={354} height={109} priority />
            Scents.
            <br />
            With Intelligence.
          </h1>
          <p className="wf-home-copy">
            향의 언어를 데이터로, 데이터를 조향식으로,
            <br />
            조향식을 검증 가능한 연구로.
          </p>
          <div className="wf-home-actions">
            <Link
              href={routes.newProject}
              className="wf-btn wf-btn-dark"
            >
              새 프로젝트
            </Link>
            <Link href="/requests" className="wf-btn wf-btn-dark">
              새 향 요청하기
            </Link>
            <Link href="/formulas" className="wf-btn">
              프로젝트 보기
            </Link>
          </div>
        </div>
      </section>
      <section className="wf-activity" id="home-activity">
        <p className="wf-eyebrow">TODAY&apos;S ACTIVITY</p>
        <div className="wf-metrics">
          {[
            [summary ? String(summary.projects.length) : '—', '내 프로젝트'],
            [summary ? String(summary.pendingChecklistItems.length) : '—', '미완료 작업'],
            [summary ? String(summary.dueSoonProjects.length) : '—', '마감 임박'],
          ].map(([value, label]) => (
            <div className="wf-metric" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="wf-home-panels">
          <HomePanel
            title="미완료 작업"
            open={activityOpen}
            onToggle={() => setActivityOpen((open) => !open)}
          >
            <div className="wf-home-activity-list">
              {summary?.pendingChecklistItems.map((item) => (
                <p key={`${item.requestId}-${item.itemType}`}>
                  <span><b>{item.itemType}</b><small>요청 #{item.requestId} · 프로젝트 #{item.projectId}</small></span>
                </p>
              ))}
              {summary && summary.pendingChecklistItems.length === 0 && <p>미완료 작업이 없습니다.</p>}
              {!summary && <p>{status || '현황을 불러오는 중...'}</p>}
            </div>
          </HomePanel>
          <HomePanel
            title="마감 임박 프로젝트"
            open={scheduleOpen}
            onToggle={() => setScheduleOpen((open) => !open)}
          >
            <div className="wf-home-schedule-list">
              {summary?.dueSoonProjects.map((project) => (
                <p key={project.projectId}>
                  <b>마감</b>
                  <time>{project.dueDate ?? '미정'}</time>
                  <span><strong>{project.name}</strong><small>{project.description ?? '설명 없음'}</small></span>
                </p>
              ))}
              {summary && summary.dueSoonProjects.length === 0 && <p className="wf-home-schedule-message">마감이 임박한 프로젝트가 없습니다.</p>}
              {!summary && <p className="wf-home-schedule-message">{status || '일정을 불러오는 중...'}</p>}
            </div>
          </HomePanel>
        </div>
      </section>
    </div>
  );
}

function HomePanel({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`wf-home-panel ${open ? '' : 'is-collapsed'}`}>
      <header>
        <h2>{title}</h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${title} 펼치기 또는 접기`}
        >
          <i className={`wf-chevron ${open ? 'is-up' : ''}`} />
        </button>
      </header>
      <div className="wf-home-panel-content">{children}</div>
    </section>
  );
}
