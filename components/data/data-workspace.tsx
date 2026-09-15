'use client';

import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

export function DataWorkspace() {
  const view = useSearchParams().get('view') ?? 'raw';
  return (
    <div className="wf-layout wf-data-page">
      <ProjectSidebar />
      <section className="wf-main">
        {view === 'sensory' ? <SensoryValidation /> : <RawData />}
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

function RawData() {
  const [step, setStep] = useState<'upload' | 'mapping' | 'review'>('upload');
  const [status, setStatus] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const rows = [
    ['cashmeran_sds_v4.csv', 'SDS', '검증 완료'],
    ['supplier_pricing_0829.xlsx', '가격', '검증 완료'],
    ['panel_results_C014.json', '관능 결과', '데이터 형식 오류'],
    ['supplier_pricing_0829.xlsx', '가격', '검증 완료'],
    ['panel_results_C014.json', '관능 결과', '데이터 형식 오류'],
  ];
  const tabs = [
    ['upload', '업로드 현황'],
    ['mapping', '데이터 매핑'],
    ['review', '검토'],
  ] as const;
  const mappingRows = [
    ['panelist_id', 'P013', '평가자 ID', true],
    ['formula_id', 'C013', '조향식 ID', true],
    ['evaluation_date', '2026.09.20', '평가일', true],
    ['overall_score', '4.2', '종합 평가', true],
    ['evaluation_note', 'citrus too sharp', '매핑 안함', false],
  ] as const;
  const errorRows = [
    ['14', '-', '4.2', '데이터 형식 오류'],
    ['27', '-', '3.8', '데이터 형식오류'],
    ['45', 'P003', '4.1', '데이터 형식 오류'],
    ['67', 'P015', '-', '필수 필드 누락'],
    ['89', 'P022', '4.3', '데이터 형식오류'],
    ['103', '-', '3.6', '필수 필드 누락'],
  ];
  return (
    <>
      <header className="wf-data-title wf-raw-data-title">
        <h1>
          {step === 'upload'
            ? '원료·시험 데이터 가져오기'
            : step === 'mapping'
              ? '데이터 매핑'
              : '오류 행 검토'}
        </h1>
        <p>공급업체·시험기관 데이터를 업로드하고 검증합니다.</p>
        {step === 'upload' && (
          <>
            <input
              ref={fileInput}
              type="file"
              hidden
              accept=".csv,.xlsx,.xls,.json"
              onChange={(event) => {
                if (event.target.files?.[0]) {
                  setStatus(`${event.target.files[0].name} 업로드 완료`);
                }
              }}
            />
            <button type="button" onClick={() => fileInput.current?.click()}>
              업로드
            </button>
          </>
        )}
      </header>
      <div className="wf-data-steps">
        {tabs.map(([value, label]) => (
          <button
            type="button"
            className={step === value ? 'active' : ''}
            onClick={() => setStep(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="wf-data-content wf-raw-data-content">
        {step === 'upload' && (
          <>
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
          </>
        )}
        {step === 'mapping' && (
          <>
            <div className="wf-data-table wf-mapping-table">
              <div className="head">
                <b>파일 필드</b>
                <b>샘플 데이터</b>
                <b>시스템 필드</b>
                <b>상태</b>
              </div>
              {mappingRows.map(([field, sample, mapped, complete]) => (
                <div key={field}>
                  <b>{field}</b>
                  <span>{sample}</span>
                  <select defaultValue={mapped} aria-label={`${field} 시스템 필드`}>
                    <option>{mapped}</option>
                    <option>매핑 안함</option>
                  </select>
                  <span className={complete ? 'is-mapped' : 'is-required'}>
                    {complete ? '매핑됨' : '매핑 필요'} <i />
                  </span>
                </div>
              ))}
            </div>
            <button className="wf-data-next" type="button" onClick={() => setStep('review')}>
              다음:검토
            </button>
          </>
        )}
        {step === 'review' && (
          <>
            <section className="wf-review-summary">
              <span>
                <b>총 6개의 행이 오류로 발견되었습니다.</b>
                <small>필수 필드 누락, 형식 불일치 등의 이유로 오류가 발생했습니다. 행을 수정하거나 파일을 재업로드하세요.</small>
              </span>
              <button type="button">전체 오류 다운로드</button>
            </section>
            <div className="wf-data-table wf-review-table">
              <div className="head">
                <b>행 번호</b><b>panelist_id</b><b>평가값</b><b>상태</b><b>오류 내용</b><b>수정하기</b>
              </div>
              {errorRows.map(([row, panelist, value, error]) => (
                <div key={row}>
                  <b>{row}</b><span>{panelist}</span><span>{value}</span>
                  <span className="wf-row-error"><i /> 오류</span><span>{error}</span>
                  <button type="button" onClick={() => setStatus(`${row}행 수정 선택`)}>수정하기</button>
                </div>
              ))}
            </div>
            <div className="wf-review-actions">
              <p>수정한 행은 재처리를 통해 검증해야 최종 반영됩니다.</p>
              <button type="button" onClick={() => setStep('upload')}>재업로드</button>
              <button type="button" onClick={() => setStatus('오류 행 재처리 완료')}>오류 행 재처리</button>
            </div>
            {status && <output className="wf-data-status">{status}</output>}
          </>
        )}
      </div>
    </>
  );
}
