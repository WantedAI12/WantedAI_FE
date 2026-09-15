'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

const auditEntries = [
  [
    '2026-08-14 10:02',
    '안전 게이트 자동 평가 통과, 데이터 적용범위 내 확인',
    'system',
  ],
  ['2026-08-15 09:14', '후보 비교에서 선택, 실험 후보로 확정', '박서연'],
  ['2026-08-16 15:40', '안전·규제 조건부 승인, SDS 갱신 조건 부여', '김멋사'],
  [
    '2026-08-16 15:40',
    '구조화 의도 v3 기반 후보 생성, 모델 버전 pf-core-2.3',
    'system',
  ],
  ['2026-08-17 11:20', '원료 데이터 최신 버전 동기화 완료', 'system'],
  ['2026-08-18 14:05', '조향식 배합비 수정 및 성능 프록시 재평가', '김멋사'],
  ['2026-08-19 09:32', '규제 담당자 검토 의견 반영', '정민아'],
  ['2026-08-20 16:18', '최종 승인 완료, 배포 가능한 버전으로 확정', '박서연'],
];

export function ExperimentWorkspace() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') === 'audit' ? 'audit' : 'safety';
  return (
    <div
      className={`wf-layout wf-experiment-page ${view === 'safety' ? 'is-safety' : 'is-audit'}`}
    >
      <ProjectSidebar />
      <section className="wf-main">
        {view === 'safety' ? <SafetyDashboard /> : <AuditHistory />}
      </section>
    </div>
  );
}

function SafetyDashboard() {
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const summary = [
    ['◯', '안전 게이트 현황'],
    ['▤', '규제 준수'],
    ['⬡', '승인 현황'],
  ];
  return (
    <>
      <header className="wf-safety-header">
        <h1>안전 규제</h1>
        <p>규제 준수 및 승인 현황을 확인할 수 있습니다.</p>
      </header>
      <div className="wf-safety-content">
        <section className="wf-safety-overview">
          <h2>전체 현황</h2>
          <p>후보 조향식의 안전성, 규제준수, 승인현황을 요약한 결과입니다.</p>
          <div>
            {summary.map(([icon, title]) => (
              <article key={title}>
                <i>{icon}</i>
                <span>
                  <b>{title}</b>
                  <strong>4/6 통과</strong>
                  <em>
                    <u />
                  </em>
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="wf-required-checks">
          <div className="wf-section-head">
            <h2>필수 평가 항목</h2>
            <button>
              FORMULA 02
              <i className="wf-chevron" aria-hidden="true" />
            </button>
          </div>
          {[
            ['IFRA 51차 카테고리 한도', '전 원료 한도 내 확인 완료', ''],
            ['KFDA 화장품 안전기준', '배합금지·한도성분 해당 없음', ''],
            ['EU 알러젠 표기', '임계값 이하, 표기 의무 없음', ''],
            [
              'SDS·독성 데이터 최신성',
              '1개 원료 SDS 갱신일 18개월 경과',
              '담당자 확인 필요',
            ],
          ].map(([title, copy, status]) => (
            <div className="wf-check-row" key={title}>
              <b>{title}</b>
              <span>{copy}</span>
              <small>{status}</small>
            </div>
          ))}
        </section>
        <div className="wf-safety-lower">
          <section className="wf-compliance">
            <h2>규제 준수 현황</h2>
            <div className="wf-filter-pills">
              {['전체', 'IFRA', 'EU REACH', 'K-REACH', 'FDA'].map((item) => (
                <button key={item}>{item}</button>
              ))}
            </div>
            <div className="wf-compliance-head">
              <span>후보 명</span>
              <span>IFRA</span>
              <span>EU REACH</span>
              <span>K-REACH</span>
              <span>FDA</span>
              <span>규제 상태</span>
            </div>
            {[
              ['02', ['pass', 'pass', 'pass', 'pass'], '통과'],
              ['03', ['pass', 'pass', 'review', 'pass'], '검토필요'],
              ['04', ['pass', 'pass', 'pass', 'pass'], '통과'],
              ['05', ['pass', 'pass', 'review', 'blocked'], '검토필요'],
              ['06', ['empty', 'empty', 'empty', 'empty'], '미확인'],
              ['07', ['pass', 'pass', 'pass', 'pass'], '통과'],
            ].map(([n, checks, status]) => (
              <div className="wf-compliance-row" key={n as string}>
                <span>FORMULA {n as string}</span>
                {(checks as string[]).map((check, index) => (
                  <span
                    className={`wf-compliance-dot is-${check}`}
                    aria-label={
                      check === 'pass'
                        ? '통과'
                        : check === 'review'
                          ? '검토 필요'
                          : check === 'blocked'
                            ? '차단'
                            : '미확인'
                    }
                    key={`${String(n)}-${index}`}
                  />
                ))}
                <b>{status as string}</b>
              </div>
            ))}
          </section>
          <section className="wf-gate">
            <h2>안전 게이트 현황</h2>
            <div className="wf-gate-summary">
              <div className="wf-donut">
                <b>6</b>
              </div>
              <ul>
                <li>
                  <i />
                  통과 <b>4</b>
                </li>
                <li>
                  <i />
                  검토 필요 <b>1</b>
                </li>
                <li>
                  <i />
                  차단 <b>1</b>
                </li>
              </ul>
            </div>
            <div
              className={`wf-major-issue ${issuesExpanded ? 'is-expanded' : ''}`}
            >
              <div className="wf-major-issue-head">
                <h3>주요 이슈</h3>
                <button
                  type="button"
                  aria-expanded={issuesExpanded}
                  aria-label={
                    issuesExpanded ? '주요 이슈 접기' : '주요 이슈 펼치기'
                  }
                  onClick={() => setIssuesExpanded((open) => !open)}
                >
                  <i
                    className={`wf-chevron ${issuesExpanded ? 'is-up' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              {(issuesExpanded ? [1, 2, 3, 4] : [1]).map((issue) => (
                <p key={issue}>
                  Lorem ipsum
                  <br />
                  IFRA 기준 일부 원료 검토 필요
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function AuditHistory() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'audit' | 'versions'>('audit');
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'json'>('pdf');

  useEffect(() => {
    if (!downloadOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDownloadOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [downloadOpen]);

  function downloadReport() {
    const report = {
      target: 'FORMULA 01',
      version: 'V3',
      scope: '전체 감사 이력',
      generatedAt: new Date().toISOString(),
      entries: auditEntries.map(([date, description, user]) => ({
        date,
        description,
        user,
      })),
    };
    const isJson = fileType === 'json';
    const contents = isJson
      ? JSON.stringify(report, null, 2)
      : [
          'PERFUMERY AI CORE — AUDIT REPORT',
          '',
          `Target: ${report.target}`,
          `Version: ${report.version}`,
          `Scope: Full audit history`,
          '',
          ...report.entries.map(
            (entry) =>
              `${entry.date} | ${entry.description} | ${entry.user}`,
          ),
        ].join('\n');
    const blob = new Blob([contents], {
      type: isJson ? 'application/json' : 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `FORMULA-01-V3-audit.${fileType}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  }
  return (
    <>
      <header className="wf-audit-header">
        <h1>
          FORMULA 01
          <i className="wf-chevron" aria-hidden="true" />
        </h1>
        <p>후보 FORMULA 01 의 생성부터 승인까지 전체 이력입니다.</p>
        <button type="button" onClick={() => setDownloadOpen(true)}>
          보고서 다운로드
        </button>
      </header>
      <div className="wf-audit-tabs">
        <button
          type="button"
          className={activeTab === 'audit' ? 'active' : ''}
          onClick={() => setActiveTab('audit')}
        >
          감사 로그
        </button>
        <button
          type="button"
          className={activeTab === 'versions' ? 'active' : ''}
          onClick={() => setActiveTab('versions')}
        >
          버전 이력
        </button>
      </div>
      {activeTab === 'audit' ? (
        <section className="wf-audit-log">
          <h2>감사 로그</h2>
          <div className="wf-filter-pills">
            {['전체', '후보', '조향식', '데이터'].map((item) => (
              <button key={item}>{item}</button>
            ))}
          </div>
          <div className="wf-audit-scroll">
            <div className="wf-timeline">
              {auditEntries.map(([date, copy, user], index) => {
                const isExpanded = expanded === index;
                return (
                  <article
                    className={isExpanded ? 'is-expanded' : ''}
                    key={`${date}-${copy}`}
                  >
                    <time>{date}</time>
                    <button
                      type="button"
                      className="wf-audit-entry"
                      onClick={() => setExpanded(isExpanded ? null : index)}
                      aria-expanded={isExpanded}
                    >
                      <span className="wf-audit-entry-summary">
                        <b>{copy}</b>
                        <small>{user}</small>
                        <i
                          className={`wf-chevron ${isExpanded ? 'is-up' : ''}`}
                          aria-hidden="true"
                        />
                      </span>
                      {isExpanded && (
                        <span className="wf-audit-details">
                          <span>
                            <b>변경 사유</b>
                            <em>
                              {index === 0
                                ? '안전 규제 조건 자동 평가 완료'
                                : '검토 및 변경 이력 기록'}
                            </em>
                          </span>
                          <span>
                            <b>변경 항목</b>
                            <em>{copy}</em>
                          </span>
                          <span>
                            <b>모델 버전</b>
                            <em>Performance Proxy v1.8</em>
                          </span>
                          <span>
                            <b>데이터 버전</b>
                            <em>Fragrance R&amp;D Dataset v2.4</em>
                          </span>
                        </span>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="wf-version-history">
          <div className="wf-version-table">
            <div className="wf-version-head">
              <h2>버전 이력</h2>
              <span>생성일자</span>
            </div>
            {[
              ['V1', '초기 생성', '2026.08.24'],
              ['V2', 'Cashmeran 비율 조정', '2026.08.24'],
              ['V3', '공급 리스크 재평가', '2026.08.25'],
            ].map(([version, description, date]) => (
              <div className="wf-version-row" key={version}>
                <span>
                  <b>{version}</b>
                  <small>{description}</small>
                </span>
                <time>{date}</time>
              </div>
            ))}
          </div>
        </section>
      )}
      {downloadOpen && (
        <div
          className="wf-download-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setDownloadOpen(false);
          }}
        >
          <dialog
            open
            className="wf-download-modal"
            aria-labelledby="download-modal-title"
          >
            <h2 id="download-modal-title">다운로드</h2>
            <div className="wf-download-fields">
              <label>
                <span>다운로드 대상</span>
                <input value="FORMULA 01" readOnly />
              </label>
              <label>
                <span>버전</span>
                <input value="V3" readOnly />
              </label>
              <label>
                <span>범위</span>
                <input value="전체 감사 이력" readOnly />
              </label>
              <fieldset>
                <legend>파일형식</legend>
                <label>
                  <input
                    type="radio"
                    name="audit-file-type"
                    checked={fileType === 'pdf'}
                    onChange={() => setFileType('pdf')}
                  />
                  <span>PDF</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="audit-file-type"
                    checked={fileType === 'json'}
                    onChange={() => setFileType('json')}
                  />
                  <span>JSON</span>
                </label>
              </fieldset>
            </div>
            <footer>
              <button type="button" onClick={() => setDownloadOpen(false)}>
                취소
              </button>
              <button type="button" onClick={downloadReport}>
                다운로드
              </button>
            </footer>
          </dialog>
        </div>
      )}
    </>
  );
}
