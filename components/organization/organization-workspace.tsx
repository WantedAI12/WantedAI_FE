'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

const projects = [
  ['CITRUS FRESH', '시트러스 계열 향 개발', '조향팀'],
  ['WOODY MUSK', '우디 머스크 계열 향 연구', '조향팀'],
  ['CITRUS FRESH', '플로럴 향 개발', '데이터팀'],
  ['WOODY MUSK', '우디 머스크 계열 향 연구', '조향팀'],
  ['CITRUS FRESH', '플로럴 향 개발', '데이터팀'],
];
const formulas = [
  'Woody Amber v1.3',
  'Citrus Musk v2.1',
  'Floral Woods v1.2',
  'Fresh Green v2.0',
  'Soft Musk v1.4',
  'Powdery Iris v1.1',
  'Warm Sandal v2.3',
  'Woody Amber v1.3',
];

export function OrganizationWorkspace() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'overview';
  const team = searchParams.get('team') ?? '조향팀';
  return (
    <div
      className={`wf-layout wf-org-page ${view === 'all' ? 'is-long' : ''} ${view === 'team' ? 'is-compact' : ''}`}
    >
      <ProjectSidebar />
      <section className="wf-main">
        {view === 'members' ? (
          <Members />
        ) : view === 'team' ? (
          <Team name={team} />
        ) : view === 'projects' ? (
          <Projects />
        ) : view === 'formulas' ? (
          <Formulas />
        ) : (
          <Overview expanded={view === 'all'} />
        )}
      </section>
    </div>
  );
}

function OrgHeader({
  title = '조직·프로젝트 관리',
  crumb,
  backHref = '/organization',
  backToMembers = false,
  showTeamTotal = false,
}: {
  title?: string;
  crumb?: string;
  backHref?: string;
  backToMembers?: boolean;
  showTeamTotal?: boolean;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState('');
  return (
    <header className="wf-org-header">
      {crumb && (
        <p className="wf-org-crumb">
          <button
            type="button"
            className="wf-org-back"
            aria-label="이전 페이지로 돌아가기"
            onClick={() =>
              router.push(
                backToMembers ? '/organization?view=members' : backHref,
              )
            }
          >
            ←
          </button>
          <Link href="/organization">조직·프로젝트 관리</Link>
          <span>›</span>
          {backHref.includes('view=members') ? (
            <>
              <Link href="/organization?view=members">전체 멤버</Link>
              <span>›</span>
              <span>{title}</span>
            </>
          ) : (
            <span>{crumb}</span>
          )}
        </p>
      )}
      <h1>{title}</h1>
      <p>조직 구성과 팀별 역할을 확인할 수 있습니다.</p>
      {showTeamTotal && (
        <div className="wf-team-total">
          총 8명　
          <span>
            ●●●●●●　<small>+2</small>
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={() => setNotice('새 프로젝트 생성 준비 완료')}
      >
        + 새 프로젝트
      </button>
      {notice && <output>{notice}</output>}
    </header>
  );
}

function Overview({ expanded }: { expanded: boolean }) {
  const [projectsOpen, setProjectsOpen] = useState(expanded);
  const [activityOpen, setActivityOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  return (
    <>
      <OrgHeader />
      <div className="wf-org-content">
        <div className="wf-org-summary">
          <Link href="/organization?view=members">
            <b>●　전체 멤버</b>
            <strong>24명</strong>
            <span className="wf-people">
              ●●●●●　<small>+18</small>
            </span>
            <i>›</i>
          </Link>
          <Link href="/organization?view=projects">
            <b>▣　진행 중인 프로젝트</b>
            <strong>5개</strong>
            <span>이번 주 신규 2개</span>
            <i>›</i>
          </Link>
          <Link href="/organization?view=formulas">
            <b>◉　진행 중인 조향식</b>
            <strong>8개</strong>
            <span>검토대기 3개</span>
            <i>›</i>
          </Link>
        </div>
        <ProjectList
          expanded={projectsOpen}
          onToggle={() => setProjectsOpen((open) => !open)}
        />
        {expanded && (
          <div className="wf-org-lower">
            <Activity
              expanded={activityOpen}
              onToggle={() => setActivityOpen((open) => !open)}
            />
            <Schedule
              expanded={scheduleOpen}
              onToggle={() => setScheduleOpen((open) => !open)}
            />
          </div>
        )}
      </div>
    </>
  );
}

function ProjectList({
  expanded = true,
  onToggle,
}: {
  expanded?: boolean;
  onToggle: () => void;
}) {
  const shown = expanded ? projects : [];
  return (
    <section className={`wf-project-list ${expanded ? '' : 'is-collapsed'}`}>
      <div className="wf-org-section-head">
        <span>
          <h2>프로젝트 목록</h2>
          <p>진행 중인 프로젝트와 업데이트된 프로젝트를 확인할 수 있습니다.</p>
        </span>
        <button type="button" onClick={onToggle} aria-expanded={expanded}>
          전체 보기 <i className={`wf-chevron ${expanded ? 'is-up' : ''}`} />
        </button>
      </div>
      {shown.map(([name, copy, team], index) => (
        <div className="wf-project-row" key={`${name}-${index}`}>
          <i />
          <span>
            <b>{name}</b>
            <small>{copy}</small>
          </span>
          <em />
          <span>{team}</span>
          <div>
            <u style={{ width: `${index === 0 ? 49 : 34}%` }} />
          </div>
          <b>49%</b>
          <time>
            {index === 2 || index === 4 ? '보류' : '마감일 2026.10.11'}
          </time>
        </div>
      ))}
    </section>
  );
}

function Activity({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section className={`wf-org-feed ${expanded ? '' : 'is-collapsed'}`}>
      <div className="wf-org-feed-head">
        <h2>최근 활동</h2>
        <button type="button" onClick={onToggle} aria-expanded={expanded}>
          전체 보기 <i className={`wf-chevron ${expanded ? 'is-up' : ''}`} />
        </button>
      </div>
      {expanded &&
        [
          '조향식 생성 완료',
          '프로젝트 업데이트',
          '팀원 초대',
          '데이터 검증 완료',
          '조향식 승인',
          '조향식 생성 완료',
        ].map((v, i) => (
          <p key={`${v}-${i}`}>
            <span>
              <b>{v}</b>
              <small>
                {i === 1
                  ? 'FORMULA 01 데이터 검증 진행중'
                  : i === 2
                    ? '김멋사 님이 팀에 합류했습니다'
                    : 'FORMULA 01'}
              </small>
            </span>
            <time>10:42</time>
          </p>
        ))}
    </section>
  );
}
function Schedule({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      className={`wf-org-feed wf-schedule ${expanded ? '' : 'is-collapsed'}`}
    >
      <div className="wf-org-feed-head">
        <h2>이번주 주요 일정</h2>
        <button type="button" onClick={onToggle} aria-expanded={expanded}>
          전체 보기 <i className={`wf-chevron ${expanded ? 'is-up' : ''}`} />
        </button>
      </div>
      {expanded &&
        [
          '프로젝트 미팅',
          '조향식 검토 회의',
          '데이터 검증 리뷰',
          '프로젝트 미팅',
          '조향식 검토 회의',
          '데이터 검증 리뷰',
        ].map((v, i) => (
          <p key={`${v}-${i}`}>
            <time>
              {i < 3 ? '오늘　 9.06' : i < 5 ? '내일　 9.07' : '금요일　 9.11'}
            </time>
            <span>
              <b>{v}</b>
              <small>오전 10:00 {i % 2 ? '회의실' : '온라인'}</small>
            </span>
          </p>
        ))}
    </section>
  );
}

function Members() {
  return (
    <>
      <OrgHeader title="전체 멤버" crumb="전체 멤버" />
      <div className="wf-org-content">
        <div className="wf-team-cards">
          {['기획팀', '조향팀', '데이터팀', '개발팀'].map((team) => (
            <Link
              href={`/organization?view=team&team=${encodeURIComponent(team)}`}
              key={team}
            >
              <b>●　{team}</b>
              <span>5명</span>
              <em>●●●●●　●</em>
              <i>›</i>
            </Link>
          ))}
        </div>
        <MemberArea title="전체 멤버" count={10} />
      </div>
    </>
  );
}
function Team({ name }: { name: string }) {
  return (
    <>
      <OrgHeader
        title={name}
        crumb={`전체 멤버　›　${name}`}
        backHref="/organization?view=members"
        backToMembers
        showTeamTotal
      />
      <div className="wf-org-content">
        <MemberArea title="팀원 목록" count={8} team={name} />
      </div>
    </>
  );
}

function MemberArea({
  title,
  count,
  team,
}: {
  title: string;
  count: number;
  team?: string;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="wf-member-grid">
      <section className="wf-member-list">
        <h2>{title}</h2>
        <input placeholder="멤버 이름 또는 이메일 검색" />
        <div className="wf-member-head">
          <span>이름</span>
          <span>이메일</span>
          <span>역할</span>
          <span>팀</span>
          <span>상태</span>
        </div>
        {Array.from({ length: count }, (_, i) => (
          <button
            type="button"
            className={selected === i ? 'active' : ''}
            onClick={() => setSelected(i)}
            key={i}
          >
            <span>● 김멋사</span>
            <b>eocnmlknd@gmail.com</b>
            <b>{i ? '팀원' : '관리자'}</b>
            <b>{team ?? (i % 3 ? '조향팀' : '기획팀')}</b>
            <span>
              <i />
              활성
            </span>
          </button>
        ))}
      </section>
      <MemberDetail />
    </div>
  );
}
function MemberDetail() {
  return (
    <aside className="wf-member-detail">
      <div>
        <i />
        <span>
          <b>
            김멋사　<small>팀장</small>
          </b>
          <em>
            조향사
            <br />
            eocnmlknd@gmail.com
          </em>
        </span>
        <u />
      </div>
      <section>
        <span>
          소속 프로젝트<b>3개</b>
        </span>
        <span>
          담당 조향식<b>5개</b>
        </span>
      </section>
      <hr />
      <h3>상세 정보</h3>
      {[
        ['직책', '조향팀장'],
        ['입사일', '2022.03.02'],
        ['소속 프로젝트', 'Citrus Fresh, Woody Musk'],
        ['연락처', '010-1234-5678'],
        ['이메일', 'eocnmlknd@gmail.com'],
      ].map(([l, v]) => (
        <p key={l}>
          <b>{l}</b>
          <span>{v}</span>
        </p>
      ))}
    </aside>
  );
}

function Projects() {
  return (
    <>
      <OrgHeader title="진행 중인 프로젝트" crumb="진행 중인 프로젝트" />
      <div className="wf-org-content">
        <section className="wf-focus-card">
          <h2>진행 중인 프로젝트</h2>
          <p>
            <strong>5개</strong>　이번 주 신규 2개
          </p>
          {projects.map(([n, c, t], i) => (
            <div className="wf-project-row" key={i}>
              <i />
              <span>
                <b>{n}</b>
                <small>{c}</small>
              </span>
              <em />
              <span>{t}</span>
              <div>
                <u />
              </div>
              <b>49%</b>
              <time>{i === 2 ? '보류' : '마감일 2026.10.11'}</time>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
function Formulas() {
  return (
    <>
      <OrgHeader title="조향식" crumb="진행 중인 조향식" />
      <div className="wf-org-content">
        <section className="wf-formula-list">
          <h2>진행 중인 조향식</h2>
          <p>
            <strong>8개</strong>　검토대기 3개
          </p>
          <input placeholder="번호 또는 후보명으로 검색" />
          <div className="head">
            <span>번호</span>
            <span>후보명</span>
            <span>향조</span>
            <span>승인현황</span>
            <span>최종검토일</span>
          </div>
          {formulas.map((name, i) => (
            <div key={name + i}>
              <b>0{i + 1}</b>
              <b>{name}</b>
              <span>우디 엠버</span>
              <span>
                <i className={i === 2 || i === 3 || i === 5 ? 'wait' : ''} />
                {i === 2 || i === 3 || i === 5 ? '검토대기' : '적합'}
              </span>
              <b>2026.09.18</b>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
