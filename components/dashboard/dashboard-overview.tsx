'use client';

import Link from 'next/link';
import { useState } from 'react';

const activities = [
  ['조향식 생성 완료', 'FORMULA 01'],
  ['프로젝트 업데이트', 'FORMULA 01 데이터 검증 진행중'],
  ['팀원 초대', '김멋사 님이 팀에 합류했습니다'],
  ['데이터 검증 완료', 'FORMULA 01 성능 예측'],
  ['조향식 승인', '안전 규제 승인'],
  ['조향식 생성 완료', 'FORMULA 01'],
];

const schedules = [
  ['오늘', '9.06', '프로젝트 미팅', '오전 10:00 온라인'],
  ['', '9.06', '조향식 검토 회의', '오전 10:00 회의실'],
  ['', '9.06', '데이터 검증 리뷰', '오전 10:00'],
  ['내일', '9.07', '프로젝트 미팅', '오전 10:00 온라인'],
  ['', '9.07', '조향식 검토 회의', '오전 10:00 회의실'],
  ['', '9.07', '데이터 검증 리뷰', '오전 10:00'],
];

export function DashboardOverview() {
  const [activityOpen, setActivityOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  return (
    <div className="wf-home-canvas">
      <section className="wf-home-hero">
        <div className="wf-home-inner">
          <h1 className="wf-home-title">
            <span>Design</span>
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
              href="/organization/new-project"
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
            ['12', 'Active Projects'],
            ['28', 'Formulations'],
            ['7', 'Experiments'],
          ].map(([value, label]) => (
            <div className="wf-metric" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="wf-home-panels">
          <HomePanel
            title="최근 활동"
            open={activityOpen}
            onToggle={() => setActivityOpen((open) => !open)}
          >
            <div className="wf-home-activity-list">
              {activities.map(([title, copy], index) => (
                <p key={`${title}-${index}`}>
                  <span>
                    <b>{title}</b>
                    <small>{copy}</small>
                  </span>
                  <time>10:42</time>
                </p>
              ))}
            </div>
          </HomePanel>
          <HomePanel
            title="이번주 주요 일정"
            open={scheduleOpen}
            onToggle={() => setScheduleOpen((open) => !open)}
          >
            <div className="wf-home-schedule-list">
              {schedules.map(([day, date, title, copy], index) => (
                <p key={`${title}-${index}`}>
                  <b>{day}</b>
                  <time>{date}</time>
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </p>
              ))}
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
      {open && children}
    </section>
  );
}
