'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { candidateApi, evidenceApi, ingredientApi, projectApi, requestApi } from '@/lib/api/resources';
import type { CandidateResponse, IngredientResponse, ProjectResponse, SensoryTestResponse } from '@/types/domain';

export function DataWorkspace() {
  const view = useSearchParams().get('view') ?? 'raw';
  return <div className="wf-layout wf-data-page"><ProjectSidebar /><section className="wf-main">{view === 'sensory' ? <SensoryValidation /> : <RawData />}</section></div>;
}

function SensoryValidation() {
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [tests, setTests] = useState<SensoryTestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    projectApi.list().then(async (projects: ProjectResponse[]) => {
      const requests = await Promise.all(projects.map((item) => requestApi.list(item.projectId)));
      const candidatesByRequest = await Promise.all(requests.flatMap((page) => page.content).map((item) => candidateApi.list(item.requestId)));
      if (alive) setCandidates(candidatesByRequest.flat());
    }).catch((error: unknown) => { if (alive) setNotice(error instanceof Error ? error.message : '후보 목록을 불러오지 못했습니다.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!candidateId) return;
    let alive = true;
    evidenceApi.tests(candidateId).then((items) => { if (alive) setTests(items); }).catch((error: unknown) => { if (alive) setNotice(error instanceof Error ? error.message : '관능 시험을 불러오지 못했습니다.'); });
    return () => { alive = false; };
  }, [candidateId]);

  return <><header className="wf-data-hero"><h1>관능 검증 관리</h1><p>서버에 등록된 후보의 관능 시험을 확인합니다.</p><select aria-label="후보 선택" value={candidateId ?? ''} onChange={(event) => setCandidateId(Number(event.target.value) || null)}><option value="">후보를 선택하세요</option>{candidates.map((item) => <option value={item.candidateId} key={item.candidateId}>FORMULA {String(item.candidateId).padStart(2, '0')}</option>)}</select></header><div className="wf-data-content wf-sensory">{loading ? <p>후보를 불러오는 중입니다.</p> : !candidates.length ? <p>등록된 후보가 없습니다.</p> : !candidateId ? <p>조회할 후보를 선택해 주세요.</p> : !tests.length ? <p>등록된 관능 시험이 없습니다.</p> : tests.map((test) => <section className="wf-plan-card" key={test.testId}><h2>시험 #{test.testId}</h2><p><b>상태</b><span>{test.status}</span></p><p><b>시험 계획</b><span>{test.planDetail}</span></p><p><b>결과 수</b><span>{test.results.length}건</span></p><p><b>생성일</b><span>{new Date(test.createdAt).toLocaleDateString('ko-KR')}</span></p></section>)}{notice && <output>{notice}</output>}</div></>;
}

function RawData() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [notice, setNotice] = useState('');
  useEffect(() => { projectApi.list().then((items) => { setProjects(items); setProjectId(items[0]?.projectId ?? null); }).catch((error: unknown) => setNotice(error instanceof Error ? error.message : '프로젝트를 불러오지 못했습니다.')); }, []);
  useEffect(() => { if (!projectId) return; ingredientApi.list(projectId).then(setIngredients).catch((error: unknown) => setNotice(error instanceof Error ? error.message : '원료를 불러오지 못했습니다.')); }, [projectId]);
  return <><header className="wf-data-title wf-raw-data-title"><h1>원료·시험 데이터</h1><p>프로젝트에 등록된 원료 카탈로그를 조회합니다.</p></header><div className="wf-data-content wf-raw-data-content"><label>프로젝트 <select value={projectId ?? ''} onChange={(event) => setProjectId(Number(event.target.value) || null)}><option value="">선택</option>{projects.map((item) => <option key={item.projectId} value={item.projectId}>{item.name}</option>)}</select></label><h2>원료 데이터</h2><div className="wf-data-table wf-upload-table"><div className="head"><b>원료</b><b>향조</b><b>가격 / kg</b></div>{ingredients.length ? ingredients.map((item) => <div key={item.ingredientId}><span>{item.name}</span><span>{item.pyramid || '정보 없음'}</span><span>{item.pricePerKg == null ? '정보 없음' : `₩${item.pricePerKg.toLocaleString()}`}</span></div>) : <div><span>표시할 원료가 없습니다.</span></div>}</div><section className="wf-data-error"><span><b>파일 가져오기 준비 중</b><small>현재 백엔드에는 파일 업로드·매핑·행 검토 API가 제공되지 않습니다.</small></span></section>{notice && <output>{notice}</output>}</div></>;
}
