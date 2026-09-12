'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

export function DataWorkspace() {
  const view = useSearchParams().get('view') ?? 'raw';
  return (
    <div className="wf-layout wf-data-page">
      <ProjectSidebar />
      <section className="wf-main">
        {view === 'sensory' ? (
          <SensoryValidation />
        ) : view === 'impact' ? (
          <ImpactAnalysis />
        ) : (
          <RawData />
        )}
      </section>
    </div>
  );
}

function SensoryValidation() {
  const [requested, setRequested] = useState(false);
  return (
    <>
      <header className="wf-data-hero">
        <h1>
          FORMULA 01
          <i className="wf-chevron" aria-hidden="true" />
        </h1>
        <p>후보 FORMULA 01 · 독립 블라인드 패널 검증</p>
      </header>
      <div className="wf-data-content wf-sensory">
        <div className="wf-sensory-progress">
          <span>
            <b>진행률</b> 패널 완료율 100% · 공개 예정일 2026-09-10
          </span>
          <div>
            <em>
              <i />
            </em>
            <strong>67%</strong>
          </div>
        </div>
        <section className="wf-plan-card">
          <h2>검증 계획</h2>
          {[
            ['패널 규모', '32명 (블라인드)'],
            ['측정 항목', '인지 강도, 지속성, 선호도'],
            ['측정 시점', '0h / 2h / 8h / 24h'],
            ['결과 공개 상태', '공개 전 — 블라인딩 유지 중'],
          ].map(([label, value]) => (
            <p key={label}>
              <b>{label}</b>
              <span>{value}</span>
            </p>
          ))}
        </section>
        <section className="wf-result-card">
          <span>
            <small>결과 공개 상태</small>
            <b>{requested ? '요청 완료' : '공개 전'}</b>
            <em>예측값은 결과 공개 전까지 패널·검토자에게 비공개됩니다.</em>
          </span>
          <button type="button" onClick={() => setRequested(true)}>
            {requested ? '요청 완료' : '결과 공개 요청'}
          </button>
        </section>
      </div>
    </>
  );
}

function ImpactAnalysis() {
  const rows = [
    [
      'FORMULA 01',
      '우디 머스크 바디로션',
      '공급 리스크 상승',
      '대체 원료 2건 검토',
    ],
    [
      'FORMULA 02',
      '남성 프래그런스 라인',
      '공급 리스크 상승',
      '재고 확보 우선순위 상향',
    ],
    ['FORMULA 03', '홈 프래그런스 시제품', '영향 미미', '모니터링만 유지'],
    ['FORMULA 01', '앰버 머스크 바디크림', '영향 미미', '모니터링만 유지'],
    [
      'FORMULA 01',
      '시트러스 프레시 샴푸',
      '공급 리스크 상승',
      '대체 원료 1건 검토',
    ],
  ];
  return (
    <>
      <header className="wf-data-title">
        <h1>원료·공급 변경 영향 분석</h1>
        <p>Cashmeran 리드타임 변경이 영향을 미치는 후보·프로젝트입니다.</p>
      </header>
      <div className="wf-data-content">
        <h2>업로드 현황</h2>
        <div className="wf-data-table wf-impact-table">
          <div className="head">
            <b>영향받은 후보</b>
            <b>프로젝트</b>
            <b>영향</b>
            <b>권장 조치</b>
          </div>
          {rows.map((row, index) => (
            <div key={`${row[0]}-${index}`}>
              {row.map((cell) => (
                <span key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RawData() {
  const [status, setStatus] = useState('');
  const rows = [
    ['cashmeran_sds_v4.csv', 'SDS', '검증 완료'],
    ['supplier_pricing_0829.xlsx', '가격', '검증 완료'],
    ['panel_results_C014.json', '관능 결과', '데이터 형식 오류'],
    ['supplier_pricing_0829.xlsx', '가격', '검증 완료'],
    ['panel_results_C014.json', '관능 결과', '데이터 형식 오류'],
  ];
  return (
    <>
      <header className="wf-data-title">
        <h1>원료·시험 데이터 가져오기</h1>
        <p>공급업체·시험기관 데이터를 업로드하고 검증합니다.</p>
      </header>
      <div className="wf-data-content">
        <h2>업로드 현황</h2>
        <div className="wf-data-table wf-upload-table">
          <div className="head">
            <b>파일</b>
            <b>유형</b>
            <b>상태</b>
          </div>
          {rows.map((row, index) => (
            <div key={`${row[0]}-${index}`}>
              {row.map((cell, i) => (
                <span key={`${cell}-${i}`}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
        <h2 className="wf-error-title">데이터 형식 오류</h2>
        <section className="wf-data-error">
          <span>
            <b>필수 필드 panelist_id 누락 (14행)</b>
            <small>재처리 전 원본 수정이 필요합니다</small>
          </span>
          <div>
            <button type="button" onClick={() => setStatus('재업로드 대기')}>
              재업로드
            </button>
            <button type="button" onClick={() => setStatus('재처리큐 보류')}>
              재처리큐에 보류
            </button>
          </div>
          {status && <output>{status}</output>}
        </section>
      </div>
    </>
  );
}
