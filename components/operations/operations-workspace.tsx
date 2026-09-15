import { ProjectSidebar } from '@/components/layout/project-sidebar';

const statusCards = [
  ['후보 생성 큐 대기', '3'],
  ['평균 후보 생성 시간', '41s'],
  ['기권 현황', '6.2%'],
];

const events = [
  ['11:02', '원료 데이터 동기화 (공급업체 A)', '정상'],
  ['10:47', '안전 게이트 평가 모델 배포 v2.3.1', '정상'],
  ['09:15', '관능 데이터 스키마 검증 실패 3건', '주의'],
];

export function OperationsWorkspace() {
  return (
    <div className="wf-layout wf-operations-page">
      <ProjectSidebar />
      <section className="wf-main">
        <header className="wf-operations-header">
          <h1>서비스 운영 상태</h1>
          <p>작업 큐, 감사 로그, 관측성 지표입니다.</p>
        </header>
        <div className="wf-operations-content">
          <h2>전체 현황</h2>
          <div className="wf-operations-cards">
            {statusCards.map(([label, value]) => (
              <article key={label}>
                <b>{label}</b>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <h2 className="wf-events-title">최근 시스템 이벤트</h2>
          <section className="wf-events-table">
            <div className="head">
              <b>시각</b>
              <b>이벤트</b>
              <b>상태</b>
            </div>
            {events.map(([time, event, status]) => (
              <div key={time}>
                <time>{time}</time>
                <span>{event}</span>
                <span>{status}</span>
              </div>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
