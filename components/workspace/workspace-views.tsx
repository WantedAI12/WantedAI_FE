'use client';

import Link from '@/components/ui/app-link';
import Image from 'next/image';
import { routes } from '@/lib/routes';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { candidateApi, jobApi, projectApi, requestApi } from '@/lib/api/resources';
import { ApiError, tokenStorage } from '@/lib/api/client';
import type { CandidateCompareRow, CandidateResponse, FragranceRequestResponse, ProductCategory, ProjectResponse, TargetRegion } from '@/types/domain';

function Rail({ side = 'left' }: { side?: 'left' | 'right' }) {
  return side === 'left' ? <ProjectSidebar /> : <aside className="wf-rail wf-rail-right" />;
}

export function RequestWorkspace() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectId, setProjectId] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('EAU_DE_PARFUM');
  const [targetRegion, setTargetRegion] = useState<TargetRegion>('KR');
  const [riskTier, setRiskTier] = useState<1 | 2>(1);
  const [usageConcentration, setUsageConcentration] = useState('');
  const [maxPricePerKg, setMaxPricePerKg] = useState('');
  const [accords, setAccords] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const example = '원하는 향의 느낌과 사용 조건을 설명해 주세요.';

  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) return;
    projectApi.list().then((items) => {
      setProjects(items);
      setProjectId((current) => current || String(items[0]?.projectId ?? ''));
    }).catch(() => setError('프로젝트 목록을 불러오지 못했습니다.'));
  }, []);

  async function submitRequest() {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      router.push('/login');
      return;
    }
    if (!projectId) {
      setError('향 요청을 저장할 프로젝트를 선택해 주세요.');
      return;
    }
    if (!description.trim()) {
      setError('향 콘셉트를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const request = await requestApi.create(Number(projectId), {
        rawText: description.trim(), productCategory, targetRegion, riskTier,
        ...(usageConcentration ? { usageConcentrationPercent: Number(usageConcentration) } : {}),
        ...(maxPricePerKg ? { maxIngredientPricePerKg: Number(maxPricePerKg) } : {}),
        ...(accords.trim() ? { accords: accords.split(',').map((item) => item.trim()).filter(Boolean) } : {}),
      });
      router.push(`${routes.requestStructured}?requestId=${request.requestId}`);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '향 요청 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="wf-layout wf-request-page"><Rail /><section className="wf-main"><div className="wf-request"><h1 className="wf-title">새로운 향을 만들고 싶나요?</h1><p className="wf-sub">향 콘셉트를 자연어로 설명해주세요.</p><label className="wf-request-project">프로젝트<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">프로젝트를 선택해 주세요</option>{projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.name}</option>)}</select></label>{projects.length === 0 && <p className="wf-request-hint">프로젝트가 없다면 먼저 <Link href={routes.newProject}>새 프로젝트를 만들어 주세요.</Link></p>}<div className="wf-request-fields"><label>제품 유형<select value={productCategory} onChange={(event) => setProductCategory(event.target.value as ProductCategory)}><option value="EAU_DE_PARFUM">향수</option><option value="BODY_LOTION">바디로션</option></select></label><label>대상 지역<select value={targetRegion} onChange={(event) => setTargetRegion(event.target.value as TargetRegion)}><option value="KR">한국</option><option value="EU">유럽</option><option value="US">미국</option></select></label><label>검토 등급<select value={riskTier} onChange={(event) => setRiskTier(Number(event.target.value) as 1 | 2)}><option value={1}>1</option><option value={2}>2</option></select></label></div><div className="wf-request-input"><textarea className="wf-textarea" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} placeholder={example}/><p className="wf-count" aria-live="polite">{description.length}/2000</p></div><button type="button" className="wf-advanced-toggle" aria-expanded={advancedOpen} onClick={()=>setAdvancedOpen((open)=>!open)}><span>고급 설정</span><i className={`wf-chevron ${advancedOpen?'is-up':''}`} aria-hidden="true" /></button>{advancedOpen&&<div className="wf-request-fields"><label>사용 농도 (%)<input type="number" min="0" max="100" step="0.1" value={usageConcentration} onChange={(event) => setUsageConcentration(event.target.value)} /></label><label>원료 가격 상한 (원/kg)<input type="number" min="0" value={maxPricePerKg} onChange={(event) => setMaxPricePerKg(event.target.value)} /></label><label>향 계열 (쉼표로 구분)<input value={accords} onChange={(event) => setAccords(event.target.value)} placeholder="예: 시트러스, 우디" /></label></div>}{error && <p className="wf-request-error" role="alert">{error}</p>}<div className="wf-next"><button type="button" className="wf-btn wf-btn-dark" onClick={submitRequest} disabled={loading}>{loading ? '저장 중...' : '다음'}</button></div></div></section><Rail side="right" /></div>;
}

export function ComplementaryQuestionsWorkspace() {
  return <div className="wf-layout wf-structured-page wf-questions-page"><Rail /><section className="wf-main"><h1 className="wf-title">보완 질문</h1><p className="wf-sub">현재는 서버에서 필요한 조건을 향 요청 화면에 포함해 제출해 주세요. 답변을 임시 저장하거나 제출된 것처럼 표시하지 않습니다.</p><div className="wf-question-actions"><Link href={routes.request} className="wf-btn wf-btn-dark">향 요청으로 돌아가기</Link></div></section></div>;
}

export function StructuredWorkspace() {
  const searchParams = useSearchParams();
  const requestId = Number(searchParams.get('requestId'));
  const [request, setRequest] = useState<FragranceRequestResponse | null>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(requestId) || requestId <= 0) return;
    requestApi.detail(requestId).then(setRequest).catch((cause) =>
      setError(cause instanceof ApiError ? cause.message : '향 요청을 불러오지 못했습니다.'));
  }, [requestId]);

  async function confirmRequest() {
    setConfirming(true);
    setError('');
    try {
      const confirmed = await requestApi.confirm(requestId);
      setRequest(confirmed);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '향 요청 확정에 실패했습니다.');
    } finally {
      setConfirming(false);
    }
  }

  if (requestId > 0 && !request) {
    return <div className="wf-layout wf-structured-page"><Rail /><section className="wf-main"><h1 className="wf-title">향 요청 결과</h1><p className="wf-sub" role={error ? 'alert' : 'status'}>{error || '서버에서 구조화 결과를 불러오는 중...'}</p></section></div>;
  }

  const liveRows = request ? [
    ['ACCORD', request.structuredIntent.accords.join(', ') || '미지정'],
    ['INTENSITY', request.structuredIntent.intensity ?? '미지정'],
    ['LONGEVITY', request.structuredIntent.longevity ?? '미지정'],
    ['PRODUCT', request.structuredIntent.productCategory ?? '미지정'],
    ['REGION', request.structuredIntent.targetRegion ?? '미지정'],
    ['PRICE CAP', request.structuredIntent.maxIngredientPricePerKg == null ? '미지정' : `${request.structuredIntent.maxIngredientPricePerKg} / kg`],
  ] : [];

  return <div className="wf-layout wf-structured-page"><Rail /><section className="wf-main"><h1 className="wf-title">향 요청 결과</h1><p className="wf-sub">{request ? `요청 #${request.requestId} · ${request.status}` : '향 요청을 먼저 제출해 주세요.'}</p>{error && <p role="alert" className="wf-request-error">{error}</p>}{request && <div className="wf-structured-grid"><div><h2>입력 내용</h2><div className="wf-input-summary">{request.structuredIntent.rawText}</div><h2 className="wf-missing-title">누락 정보</h2><div className="wf-missing">{request.missingFields.length ? request.missingFields.join(', ') : '없음'}</div></div><div className="wf-intent-card">{liveRows.map(([label,value])=><div className="wf-intent-row" key={label}><b>{label}</b><span>{value}</span></div>)}</div></div>}<div className="wf-step-actions"><Link href={routes.request} className="wf-btn">이전</Link>{request && <button className="wf-btn wf-btn-dark" type="button" onClick={confirmRequest} disabled={confirming || request.missingFields.length > 0 || request.status === 'CONFIRMED'}>{request.status === 'CONFIRMED' ? '확정 완료' : confirming ? '확정 중...' : '향 요청 확정'}</button>}</div>{request && request.missingFields.length > 0 && <p className="wf-request-hint">누락 항목은 아직 이 화면에서 수정할 수 없습니다. 새 요청에 조건을 포함해 다시 제출해 주세요.</p>}</section></div>;
}

function FormulaCard({ candidate, index }: { candidate: CandidateResponse; index: number }) {
  const ingredients = candidate.currentVersion.ingredients;
  return <Link href={routes.formulaDetail(candidate.candidateId)} className={`wf-card wf-card-${(index % 4) + 1}`}><div className="wf-tags"><span className="wf-tag">{candidate.status}</span><span className="wf-tag">{ingredients.length}개 원료</span></div><Image className="wf-arrow" src="/figma/asset-2.svg" alt="상세 보기" width={55} height={55}/><h2 className="wf-card-name">FORMULA {String(candidate.candidateId).padStart(2,'0')}</h2><div className="wf-card-meta"><span>원료 수</span><b>{ingredients.length}</b><span>예상비용</span><b>{candidate.currentVersion.cost == null ? '—' : candidate.currentVersion.cost.toLocaleString()}</b><span>상태</span><b>{candidate.status}</b></div></Link>;
}

export function FormulaWorkspace() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectId, setProjectId] = useState('');
  const [requests, setRequests] = useState<FragranceRequestResponse[]>([]);
  const [requestId, setRequestId] = useState(searchParams.get('requestId') ?? '');
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [comparison, setComparison] = useState<CandidateCompareRow[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      queueMicrotask(() => setMessage('후보를 보려면 로그인해 주세요.'));
      return;
    }
    projectApi.list().then((items) => {
      setProjects(items);
      setProjectId(String(items[0]?.projectId ?? ''));
    }).catch(() => setMessage('프로젝트 목록을 불러오지 못했습니다.'));
  }, []);
  useEffect(() => {
    if (!projectId) return;
    requestApi.list(Number(projectId)).then((page) => {
      setRequests(page.content);
      setRequestId((current) => current || String(page.content[0]?.requestId ?? ''));
    }).catch(() => setMessage('향 요청 목록을 불러오지 못했습니다.'));
  }, [projectId]);
  useEffect(() => {
    if (!requestId) return;
    candidateApi.list(Number(requestId)).then(setCandidates).catch(() => setMessage('후보 목록을 불러오지 못했습니다.'));
  }, [requestId]);
  useEffect(() => {
    if (!comparisonOpen || !requestId || selected.length < 2) return;
    candidateApi.compare(Number(requestId), selected).then(setComparison).catch(() => setMessage('비교 결과를 불러오지 못했습니다.'));
  }, [comparisonOpen, requestId, selected]);

  async function generate() {
    if (!requestId) return;
    setLoading(true);
    setMessage('후보 생성 요청 중...');
    try {
      const job = await candidateApi.generate(Number(requestId));
      setMessage(`후보 생성 작업 #${job.jobId} 진행 중`);
      const poll = async () => {
        try {
          const current = await jobApi.detail(job.jobId);
          if (current.status === 'SUCCEEDED') {
            setCandidates(await candidateApi.list(Number(requestId)));
            setMessage('후보 생성이 완료되었습니다.');
            setLoading(false);
          } else if (current.status === 'FAILED' || current.status === 'CANCELLED') {
            setMessage(current.failureReason ?? '후보 생성에 실패했습니다.');
            setLoading(false);
          } else {
            window.setTimeout(poll, 3000);
          }
        } catch (error) {
          setMessage(error instanceof Error ? error.message : '후보 생성 상태 확인에 실패했습니다.');
          setLoading(false);
        }
      };
      window.setTimeout(poll, 3000);
    } catch (cause) {
      setMessage(cause instanceof ApiError ? cause.message : '후보 생성 요청에 실패했습니다.');
      setLoading(false);
    }
  }

  const addCandidate = () => setSelected((current) => {
    const next = candidates.find((candidate) => !current.includes(candidate.candidateId));
    return next && current.length < 3 ? [...current, next.candidateId] : current;
  });
  const selectedRequest = requests.find((request) => String(request.requestId) === requestId);
  return <div className={`wf-layout wf-formula-page ${comparisonOpen ? 'is-comparing' : ''}`}><Rail /><section className="wf-main"><h1 className="wf-title">후보 조향식 목록</h1><p className="wf-sub">상세를 확인하고 최적의 조향식을 선택하세요.</p><div className="wf-catalog-selectors"><label>프로젝트<select value={projectId} onChange={(event) => { setProjectId(event.target.value); setRequestId(''); setCandidates([]); }}><option value="">선택</option>{projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.name}</option>)}</select></label><label>향 요청<select value={requestId} onChange={(event) => { setRequestId(event.target.value); setCandidates([]); setSelected([]); }}><option value="">선택</option>{requests.map((request) => <option key={request.requestId} value={request.requestId}>#{request.requestId} {request.structuredIntent.rawText.slice(0, 30)}</option>)}</select></label></div>{message && <output className="wf-request-hint">{message}</output>}<div className="wf-cards">{candidates.map((candidate, index) => <FormulaCard candidate={candidate} index={index} key={candidate.candidateId} />)}{requestId && candidates.length === 0 && <p>이 요청에 생성된 후보가 없습니다.</p>}</div>{selectedRequest?.status === 'CONFIRMED' && candidates.length === 0 && <button className="wf-btn wf-btn-dark" type="button" onClick={generate} disabled={loading}>후보 생성</button>}<div className="wf-compare-heading"><div><h2 className="wf-compare-title">후보 조향식 비교</h2><p className="wf-sub">최대 3개까지 비교할 수 있습니다.</p></div>{comparisonOpen && <button type="button" className="wf-compare-reset" onClick={() => { setSelected([]); setComparison([]); }}>비교 초기화</button>}</div>{!comparisonOpen ? <button type="button" className="wf-compare-add" onClick={() => { setComparisonOpen(true); setSelected(candidates.slice(0, 3).map((candidate) => candidate.candidateId)); }} disabled={candidates.length < 2}>+ 비교할 후보 선택하기</button> : <div className="wf-comparison"><div className="wf-comparison-picks">{selected.map((id) => <button type="button" className="wf-comparison-pick" onClick={() => setSelected((current) => current.filter((value) => value !== id))} key={id}><span><small>후보 #{id}</small></span><b>FORMULA {String(id).padStart(2, '0')}</b><i>×</i></button>)}{selected.length < 3 && candidates.some((candidate) => !selected.includes(candidate.candidateId)) && <button type="button" className="wf-comparison-plus" onClick={addCandidate} aria-label="비교 후보 추가">+</button>}</div>{comparison.length > 0 && <div className="wf-comparison-table"><div className="wf-comparison-row head"><b>후보</b><b>목표 일치도</b><b>비용</b><b>공급 안정성</b></div>{comparison.map((row) => <div className="wf-comparison-row" key={row.candidateId}><span>#{row.candidateId}</span><span>{row.goalMatchScore ?? '—'}</span><span>{row.cost ?? '—'}</span><span>{row.supplyStability ?? '—'}</span></div>)}</div>}</div>}</section></div>;
}

export function EmptyWorkspace({ title, sub }: { title: string; sub: string }) {
  return <div className="wf-layout wf-empty-page"><Rail /><section className="wf-main"><h1 className="wf-title">{title}</h1><p className="wf-sub">{sub}</p></section></div>;
}
