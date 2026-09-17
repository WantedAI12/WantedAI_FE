'use client';

import Link from '@/components/ui/app-link';
import Image from 'next/image';
import { routes } from '@/lib/routes';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import {
  candidateApi,
  jobApi,
  predictionApi,
  projectApi,
  requestApi,
} from '@/lib/api/resources';
import { ApiError, tokenStorage } from '@/lib/api/client';
import { subscribeJobUpdates } from '@/lib/api/job-stream';
import type {
  CandidateCompareRow,
  CandidateResponse,
  FragranceRequestResponse,
  JobResponse,
  LotionDetailResponse,
  ProductCategory,
  ProjectResponse,
  TargetRegion,
} from '@/types/domain';

const candidateJobStorageKey = 'perfumery:candidate-jobs:v1';
const hiddenFailedRequestStorageKey = 'perfumery:hidden-failed-requests:v1';
// Confirmed requests are immutable on the server; keep replacement attempts in one visible card.
const replacementRequestStorageKey = 'perfumery:replacement-requests:v1';

function savedReplacementRequests(projectId: string): Record<number, number> {
  if (!projectId) return {};
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(
        `${replacementRequestStorageKey}:${projectId}`,
      ) || '{}',
    );
    if (!stored || typeof stored !== 'object' || Array.isArray(stored))
      return {};
    return Object.fromEntries(
      Object.entries(stored)
        .filter(
          ([oldId, newId]) =>
            Number.isSafeInteger(Number(oldId)) &&
            Number(oldId) > 0 &&
            Number.isSafeInteger(newId) &&
            Number(newId) > 0,
        )
        .map(([oldId, newId]) => [Number(oldId), Number(newId)]),
    );
  } catch {
    return {};
  }
}

function rememberReplacementRequest(
  projectId: string,
  oldId: number,
  newId: number,
) {
  if (!projectId) return;
  try {
    window.localStorage.setItem(
      `${replacementRequestStorageKey}:${projectId}`,
      JSON.stringify({
        ...savedReplacementRequests(projectId),
        [oldId]: newId,
      }),
    );
  } catch {
    /* The new request still exists on the server if local storage is unavailable. */
  }
}

function originalRequestId(
  id: number,
  replacements: Record<number, number>,
): number {
  const visited = new Set<number>([id]);
  let current = id;
  while (true) {
    const parent = Object.entries(replacements).find(
      ([, child]) => child === current,
    );
    if (!parent) return current;
    const next = Number(parent[0]);
    if (visited.has(next)) return current;
    visited.add(next);
    current = next;
  }
}

function savedHiddenFailedRequests(projectId: string): number[] {
  if (!projectId) return [];
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(
        `${hiddenFailedRequestStorageKey}:${projectId}`,
      ) || '[]',
    );
    return Array.isArray(stored)
      ? stored.filter((id): id is number => Number.isSafeInteger(id) && id > 0)
      : [];
  } catch {
    return [];
  }
}

function rememberHiddenFailedRequests(projectId: string, requestIds: number[]) {
  if (!projectId) return;
  try {
    window.localStorage.setItem(
      `${hiddenFailedRequestStorageKey}:${projectId}`,
      JSON.stringify([...new Set(requestIds)]),
    );
  } catch {
    /* Hiding still works for the current page when storage is unavailable. */
  }
}

function savedCandidateJobs(): Record<number, number> {
  try {
    return JSON.parse(
      window.localStorage.getItem(candidateJobStorageKey) || '{}',
    ) as Record<number, number>;
  } catch {
    return {};
  }
}

function rememberCandidateJob(requestId: number, jobId: number) {
  try {
    window.localStorage.setItem(
      candidateJobStorageKey,
      JSON.stringify({ ...savedCandidateJobs(), [requestId]: jobId }),
    );
  } catch {
    /* The current page can still track the job when storage is unavailable. */
  }
}

function Rail({ side = 'left' }: { side?: 'left' | 'right' }) {
  return side === 'left' ? (
    <ProjectSidebar />
  ) : (
    <aside className="wf-rail wf-rail-right" />
  );
}

export function RequestWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [description, setDescription] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectId, setProjectId] = useState('');
  const [productCategory, setProductCategory] =
    useState<ProductCategory>('EAU_DE_PARFUM');
  const [targetRegion, setTargetRegion] = useState<TargetRegion>('KR');
  const [riskTier, setRiskTier] = useState<1 | 2>(1);
  const [usageConcentration, setUsageConcentration] = useState('');
  const [maxPricePerKg, setMaxPricePerKg] = useState('');
  const [accords, setAccords] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sourceRequest, setSourceRequest] =
    useState<FragranceRequestResponse | null>(null);
  const retryFromId = Number(searchParams.get('retryFrom'));
  const editingFailedRequest =
    Number.isSafeInteger(retryFromId) && retryFromId > 0;
  const example = '원하는 향의 느낌과 사용 조건을 설명해 주세요.';

  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken())
      return;
    projectApi
      .list()
      .then((items) => {
        setProjects(items);
        setProjectId((current) => current || String(items[0]?.projectId ?? ''));
      })
      .catch(() => setError('프로젝트 목록을 불러오지 못했습니다.'));
  }, []);
  useEffect(() => {
    if (!editingFailedRequest) return;
    requestApi
      .detail(retryFromId)
      .then((source) => {
        setSourceRequest(source);
        const intent = source.structuredIntent;
        setDescription(intent.rawText);
        setProductCategory(
          intent.productCategory === 'BODY_LOTION'
            ? 'BODY_LOTION'
            : 'EAU_DE_PARFUM',
        );
        if (intent.targetRegion) setTargetRegion(intent.targetRegion);
        if (intent.riskTier) setRiskTier(intent.riskTier);
        setUsageConcentration(
          intent.usageConcentrationPercent == null
            ? ''
            : String(intent.usageConcentrationPercent),
        );
        setMaxPricePerKg(
          intent.maxIngredientPricePerKg == null
            ? ''
            : String(intent.maxIngredientPricePerKg),
        );
        setAccords(intent.accords.join(', '));
        setAdvancedOpen(true);
        const sourceProjectId = searchParams.get('projectId');
        if (sourceProjectId) setProjectId(sourceProjectId);
      })
      .catch(() =>
        setError(
          '수정할 향 요청을 불러오지 못했습니다. 후보 목록에서 다시 시도해 주세요.',
        ),
      );
  }, [editingFailedRequest, retryFromId, searchParams]);

  async function submitRequest() {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      router.push('/login');
      return;
    }
    if (!projectId) {
      setError('향 요청을 저장할 프로젝트를 선택해 주세요.');
      return;
    }
    if (editingFailedRequest && !sourceRequest) {
      setError(
        '수정할 향 요청을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.',
      );
      return;
    }
    if (!description.trim()) {
      setError('향 콘셉트를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    let createdRequestId: number | null = null;
    try {
      const request = await requestApi.create(Number(projectId), {
        rawText: description.trim(),
        productCategory,
        targetRegion,
        riskTier,
        ...(sourceRequest?.structuredIntent.intensity
          ? { intensity: sourceRequest.structuredIntent.intensity }
          : {}),
        ...(sourceRequest?.structuredIntent.longevity
          ? { longevity: sourceRequest.structuredIntent.longevity }
          : {}),
        ...(sourceRequest?.structuredIntent.maxIngredientCount
          ? {
              maxIngredientCount:
                sourceRequest.structuredIntent.maxIngredientCount,
            }
          : {}),
        ...(usageConcentration
          ? { usageConcentrationPercent: Number(usageConcentration) }
          : {}),
        ...(maxPricePerKg
          ? { maxIngredientPricePerKg: Number(maxPricePerKg) }
          : {}),
        ...(accords.trim()
          ? {
              accords: accords
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : {}),
      });
      createdRequestId = request.requestId;
      if (editingFailedRequest) {
        rememberReplacementRequest(projectId, retryFromId, request.requestId);
        if (request.missingFields.length > 0) {
          router.push(
            `${routes.requestStructured}?requestId=${request.requestId}&projectId=${projectId}`,
          );
          return;
        }
        const confirmed = await requestApi.confirm(request.requestId);
        if (confirmed.status === 'CONFIRMED') {
          const job = await candidateApi.generate(request.requestId);
          rememberCandidateJob(request.requestId, job.jobId);
          router.push(
            `${routes.formulas}?requestId=${request.requestId}&projectId=${projectId}&jobId=${job.jobId}`,
          );
          return;
        }
      }
      router.push(
        `${routes.requestStructured}?requestId=${request.requestId}&projectId=${projectId}`,
      );
    } catch (cause) {
      if (editingFailedRequest && createdRequestId) {
        router.push(
          `${routes.requestStructured}?requestId=${createdRequestId}&projectId=${projectId}`,
        );
        return;
      }
      setError(
        cause instanceof ApiError
          ? cause.message
          : '향 요청 저장에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wf-layout wf-request-page">
      <Rail />
      <section className="wf-main">
        <div className="wf-request">
          <h1 className="wf-title">
            {editingFailedRequest
              ? '향 요청 조건 수정'
              : '새로운 향을 만들고 싶나요?'}
          </h1>
          <p className="wf-sub">
            {editingFailedRequest
              ? '조건을 바꾸면 기존 후보 카드에서 다시 생성합니다.'
              : '향 콘셉트를 자연어로 설명해주세요.'}
          </p>
          <label className="wf-request-project">
            프로젝트
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              disabled={editingFailedRequest}
            >
              <option value="">프로젝트를 선택해 주세요</option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          {projects.length === 0 && (
            <p className="wf-request-hint">
              프로젝트가 없다면 먼저{' '}
              <Link href={routes.newProject}>새 프로젝트를 만들어 주세요.</Link>
            </p>
          )}
          <div className="wf-request-fields">
            <label>
              제품 유형
              <select
                value={productCategory}
                onChange={(event) =>
                  setProductCategory(event.target.value as ProductCategory)
                }
              >
                <option value="EAU_DE_PARFUM">향수</option>
                <option value="BODY_LOTION">바디로션</option>
              </select>
            </label>
            <label>
              대상 지역
              <select
                value={targetRegion}
                onChange={(event) =>
                  setTargetRegion(event.target.value as TargetRegion)
                }
              >
                <option value="KR">한국</option>
                <option value="EU">유럽</option>
                <option value="US">미국</option>
              </select>
            </label>
            <label>
              검토 등급
              <select
                value={riskTier}
                onChange={(event) =>
                  setRiskTier(Number(event.target.value) as 1 | 2)
                }
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
          </div>
          <div className="wf-request-input">
            <textarea
              className="wf-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              placeholder={example}
            />
            <p className="wf-count" aria-live="polite">
              {description.length}/2000
            </p>
          </div>
          <button
            type="button"
            className="wf-advanced-toggle"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            <span>고급 설정</span>
            <i
              className={`wf-chevron ${advancedOpen ? 'is-up' : ''}`}
              aria-hidden="true"
            />
          </button>
          {advancedOpen && (
            <div className="wf-request-fields">
              <label>
                사용 농도 (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={usageConcentration}
                  onChange={(event) =>
                    setUsageConcentration(event.target.value)
                  }
                />
              </label>
              <label>
                원료 가격 상한 (원/kg)
                <input
                  type="number"
                  min="0"
                  value={maxPricePerKg}
                  onChange={(event) => setMaxPricePerKg(event.target.value)}
                />
              </label>
              <label>
                향 계열 (쉼표로 구분)
                <input
                  value={accords}
                  onChange={(event) => setAccords(event.target.value)}
                  placeholder="예: 시트러스, 우디"
                />
              </label>
            </div>
          )}
          {error && (
            <p className="wf-request-error" role="alert">
              {error}
            </p>
          )}
          <div className="wf-next">
            <button
              type="button"
              className="wf-btn wf-btn-dark"
              onClick={submitRequest}
              disabled={loading || (editingFailedRequest && !sourceRequest)}
            >
              {loading
                ? '저장 중...'
                : editingFailedRequest
                  ? '조건 수정하고 재생성'
                  : '다음'}
            </button>
          </div>
        </div>
      </section>
      <Rail side="right" />
    </div>
  );
}

export function ComplementaryQuestionsWorkspace() {
  return (
    <div className="wf-layout wf-structured-page wf-questions-page">
      <Rail />
      <section className="wf-main">
        <h1 className="wf-title">보완 질문</h1>
        <p className="wf-sub">
          현재는 서버에서 필요한 조건을 향 요청 화면에 포함해 제출해 주세요.
          답변을 임시 저장하거나 제출된 것처럼 표시하지 않습니다.
        </p>
        <div className="wf-question-actions">
          <Link href={routes.request} className="wf-btn wf-btn-dark">
            향 요청으로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
}

export function StructuredWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = Number(searchParams.get('requestId'));
  const projectId = searchParams.get('projectId');
  const viewOnly = searchParams.get('viewOnly') === '1';
  const [request, setRequest] = useState<FragranceRequestResponse | null>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(requestId) || requestId <= 0) return;
    let alive = true;
    requestApi
      .detail(requestId)
      .then(async (item) => {
        if (!alive) return;
        setRequest(item);
        if (item.status !== 'CONFIRMED' || !projectId) return;
        const existing = await candidateApi.list(requestId);
        if (!alive) return;
        if (existing.length > 0) {
          router.replace(routes.formulaDetail(existing[0].candidateId));
        } else if (viewOnly) {
          setError(
            '이 향 요청에는 아직 생성된 후보 조향식이 없습니다. 후보가 생성되어야 조향식 상세 화면을 볼 수 있습니다.',
          );
        } else {
          const previousJobId = savedCandidateJobs()[requestId];
          const job = previousJobId
            ? await jobApi.detail(previousJobId)
            : await candidateApi.generate(requestId);
          rememberCandidateJob(requestId, job.jobId);
          if (alive)
            router.replace(
              `${routes.formulas}?requestId=${requestId}&projectId=${projectId}&jobId=${job.jobId}`,
            );
        }
      })
      .catch((cause) => {
        if (alive)
          setError(
            cause instanceof ApiError
              ? cause.message
              : '향 요청을 불러오지 못했습니다.',
          );
      });
    return () => {
      alive = false;
    };
  }, [requestId, projectId, viewOnly, router]);

  async function confirmRequest() {
    setConfirming(true);
    setError('');
    try {
      const confirmed = await requestApi.confirm(requestId);
      setRequest(confirmed);
      try {
        const job = await candidateApi.generate(requestId);
        rememberCandidateJob(requestId, job.jobId);
        const query = new URLSearchParams({
          requestId: String(requestId),
          jobId: String(job.jobId),
        });
        if (projectId) query.set('projectId', projectId);
        router.push(`${routes.formulas}?${query}`);
      } catch (cause) {
        setError(
          `향 요청은 확정됐지만 후보 생성은 시작하지 못했습니다. ${cause instanceof ApiError ? cause.message : ''}`,
        );
      }
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : '향 요청 확정에 실패했습니다.',
      );
    } finally {
      setConfirming(false);
    }
  }

  if (requestId > 0 && !request) {
    return (
      <div className="wf-layout wf-structured-page">
        <Rail />
        <section className="wf-main">
          <h1 className="wf-title">향 요청 결과</h1>
          <p className="wf-sub" role={error ? 'alert' : 'status'}>
            {error || '서버에서 구조화 결과를 불러오는 중...'}
          </p>
        </section>
      </div>
    );
  }

  const liveRows = request
    ? [
        ['ACCORD', request.structuredIntent.accords.join(', ') || '미지정'],
        ['INTENSITY', request.structuredIntent.intensity ?? '미지정'],
        ['LONGEVITY', request.structuredIntent.longevity ?? '미지정'],
        ['PRODUCT', request.structuredIntent.productCategory ?? '미지정'],
        ['REGION', request.structuredIntent.targetRegion ?? '미지정'],
        [
          'PRICE CAP',
          request.structuredIntent.maxIngredientPricePerKg == null
            ? '미지정'
            : `${request.structuredIntent.maxIngredientPricePerKg} / kg`,
        ],
      ]
    : [];

  return (
    <div className="wf-layout wf-structured-page">
      <Rail />
      <section className="wf-main">
        <h1 className="wf-title">
          {viewOnly ? '향 요청 상세' : '향 요청 결과'}
        </h1>
        <p className="wf-sub">
          {request
            ? `요청 #${request.requestId} · ${request.status}`
            : '향 요청을 먼저 제출해 주세요.'}
        </p>
        {error && (
          <p role="alert" className="wf-request-error">
            {error}
          </p>
        )}
        {request && (
          <div className="wf-structured-grid">
            <div>
              <h2>입력 내용</h2>
              <div className="wf-input-summary">
                {request.structuredIntent.rawText}
              </div>
              <h2 className="wf-missing-title">누락 정보</h2>
              <div className="wf-missing">
                {request.missingFields.length
                  ? request.missingFields.join(', ')
                  : '없음'}
              </div>
            </div>
            <div className="wf-intent-card">
              {liveRows.map(([label, value]) => (
                <div className="wf-intent-row" key={label}>
                  <b>{label}</b>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="wf-step-actions">
          <Link
            href={viewOnly ? routes.formulas : routes.request}
            className="wf-btn"
          >
            {viewOnly ? '후보 목록으로 돌아가기' : '이전'}
          </Link>
          {request && (
            <button
              className="wf-btn wf-btn-dark"
              type="button"
              onClick={confirmRequest}
              disabled={
                confirming ||
                request.missingFields.length > 0 ||
                request.status === 'CONFIRMED'
              }
            >
              {request.status === 'CONFIRMED'
                ? '확정 완료'
                : confirming
                  ? '확정 중...'
                  : '향 요청 확정'}
            </button>
          )}
        </div>
        {request && request.missingFields.length > 0 && (
          <p className="wf-request-hint">
            누락 항목은 아직 이 화면에서 수정할 수 없습니다. 새 요청에 조건을
            포함해 다시 제출해 주세요.
          </p>
        )}
      </section>
    </div>
  );
}

function FormulaCard({
  candidate,
  index,
  productCategory,
  jobStatus,
}: {
  candidate: CandidateResponse;
  index: number;
  productCategory: ProductCategory | null;
  jobStatus?: JobResponse['status'];
}) {
  const [lotionDetail, setLotionDetail] = useState<LotionDetailResponse | null>(
    null,
  );
  useEffect(() => {
    if (productCategory !== 'BODY_LOTION') return;
    let alive = true;
    candidateApi
      .lotionDetail(candidate.candidateId)
      .then((detail) => {
        if (alive) setLotionDetail(detail);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [candidate.candidateId, productCategory]);
  const ingredients = candidate.currentVersion.ingredients;
  const mainNotes = ingredients
    .slice(0, 2)
    .map((ingredient) => ingredient.name)
    .join(' · ');
  const generationState =
    jobStatus === 'PENDING' || jobStatus === 'RUNNING'
      ? '일부 완료'
      : productCategory === 'BODY_LOTION' && !lotionDetail
        ? '판정 확인 중'
        : lotionDetail?.profileTargetMet === false
          ? '목표 미달'
          : lotionDetail?.searchIncomplete === true
            ? '일부 완료'
            : '생성 완료';
  const statusLabel: Record<CandidateResponse['status'], string> = {
    UNDER_REVIEW: '검토 중',
    CONFIRMED_FOR_EXPERIMENT: '시험 확정',
    IN_SENSORY_TEST: '관능 시험 중',
    APPROVED: '승인',
    REJECTED: '반려',
  };
  return (
    <Link
      href={routes.formulaDetail(candidate.candidateId)}
      className={`wf-card wf-card-${(index % 4) + 1}`}
    >
      <div className="wf-tags">
        <span className="wf-tag" title={mainNotes}>
          {mainNotes || '원료 정보 없음'}
        </span>
        <span className="wf-tag">{generationState}</span>
      </div>
      <Image
        className="wf-arrow"
        src="/figma/asset-2.svg"
        alt="상세 보기"
        width={55}
        height={55}
      />
      <h2 className="wf-card-name">
        FORMULA {String(candidate.candidateId).padStart(2, '0')}
      </h2>
      <div className="wf-card-meta">
        <span>원료 수</span>
        <b>{ingredients.length}</b>
        <span>예상비용</span>
        <b>
          {candidate.currentVersion.cost == null
            ? '—'
            : `₩${candidate.currentVersion.cost.toLocaleString()}`}
        </b>
        <span>상태</span>
        <b>{statusLabel[candidate.status]}</b>
      </div>
    </Link>
  );
}

function GenerationCard({
  request,
  displayRequestId,
  projectId,
  index,
  job,
  knownJobId,
  busy,
  error,
  onStart,
  onRetry,
  onHide,
  partial,
}: {
  request: FragranceRequestResponse;
  displayRequestId: number;
  projectId: string;
  index: number;
  job?: JobResponse;
  knownJobId?: number;
  busy: boolean;
  error?: string;
  onStart: () => void;
  onRetry: () => void;
  onHide: () => void;
  partial?: boolean;
}) {
  const active = busy || job?.status === 'PENDING' || job?.status === 'RUNNING';
  const failureCode = job?.failureReason?.split(':', 1)[0]?.trim();
  const rejected =
    job?.status === 'FAILED' &&
    (failureCode === 'GENERATION_REJECTED' || failureCode === 'NO_SAFE_MATCH');
  const title = partial
    ? '일부 완료'
    : active
      ? '조향식 생성 중...'
      : job?.status === 'FAILED'
        ? rejected
          ? '생성 불가'
          : '생성 실패'
        : job?.status === 'CANCELLED'
          ? '생성 취소'
          : job?.status === 'SUCCEEDED'
            ? '결과 확인 중'
            : knownJobId
              ? '상태 확인 중...'
              : request.status === 'CONFIRMED'
                ? '생성 대기'
                : '향 요청 확인 필요';
  const description = partial
    ? '완료된 후보를 먼저 확인할 수 있습니다. 나머지 결과를 확인 중입니다.'
    : active
      ? '향 요청에 맞는 후보를 만들고 있습니다.'
      : job?.status === 'FAILED'
        ? rejected
          ? '현재 조건에 맞는 안전한 후보를 만들 수 없습니다.'
          : failureCode === 'AI_SERVICE_ERROR'
            ? 'AI 서버 처리 오류입니다. 요청 조건 문제인지는 아직 확인되지 않았습니다.'
            : job.failureReason || '생성 작업을 완료하지 못했습니다.'
        : job?.status === 'SUCCEEDED'
          ? '작업은 완료됐지만 후보 데이터를 아직 확인하지 못했습니다.'
          : knownJobId
            ? '기존 생성 작업의 최신 상태를 불러오고 있습니다.'
            : request.status === 'CONFIRMED'
              ? '확정된 향 요청의 후보 생성을 시작할 수 있습니다.'
              : '향 요청을 먼저 확인하고 확정해 주세요.';
  return (
    <article
      className={`wf-card wf-card-${(index % 4) + 1} wf-generation-card ${active ? 'is-generating' : ''}`}
      aria-live="polite"
    >
      <span className="wf-generation-request">
        향 요청 {String(displayRequestId).padStart(2, '0')}
      </span>
      <div className="wf-generation-center">
        <h2>{title}</h2>
        <p>{description}</p>
        {error && (
          <p className="wf-generation-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="wf-generation-actions">
        {request.status !== 'CONFIRMED' ? (
          <Link
            href={`${routes.requestStructured}?requestId=${request.requestId}&projectId=${projectId}`}
            className="wf-btn"
          >
            요청 확인
          </Link>
        ) : !job && !knownJobId && !busy ? (
          <button
            type="button"
            className="wf-btn wf-btn-dark"
            onClick={onStart}
          >
            생성 시작
          </button>
        ) : job?.status === 'FAILED' && job.retryable ? (
          <button
            type="button"
            className="wf-btn"
            onClick={onRetry}
            disabled={busy}
          >
            재시도
          </button>
        ) : null}
        {job?.status === 'FAILED' && (
          <Link
            href={`${routes.request}?retryFrom=${request.requestId}&projectId=${projectId}`}
            className="wf-btn wf-btn-dark"
          >
            조건 수정
          </Link>
        )}
        {job?.status === 'FAILED' && (
          <button
            type="button"
            className="wf-btn"
            onClick={onHide}
            aria-label={`향 요청 ${request.requestId} 실패 카드 숨기기`}
          >
            숨기기
          </button>
        )}
      </div>
    </article>
  );
}

export function FormulaWorkspace() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectId, setProjectId] = useState('');
  const [requests, setRequests] = useState<FragranceRequestResponse[]>([]);
  const [candidateGroups, setCandidateGroups] = useState<
    Record<number, CandidateResponse[]>
  >({});
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [comparison, setComparison] = useState<CandidateCompareRow[]>([]);
  const [comparing, setComparing] = useState(false);
  const [message, setMessage] = useState('');
  const [jobIds, setJobIds] = useState<Record<number, number>>({});
  const [jobs, setJobs] = useState<Record<number, JobResponse>>({});
  const [jobErrors, setJobErrors] = useState<Record<number, string>>({});
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [hiddenFailedByProject, setHiddenFailedByProject] = useState<
    Record<string, number[]>
  >({});
  const [replacementsByProject, setReplacementsByProject] = useState<
    Record<string, Record<number, number>>
  >({});

  useEffect(() => {
    if (!projectId) return;
    const stored = savedHiddenFailedRequests(projectId);
    queueMicrotask(() =>
      setHiddenFailedByProject((current) => ({
        ...current,
        [projectId]: stored,
      })),
    );
    const replacements = savedReplacementRequests(projectId);
    queueMicrotask(() =>
      setReplacementsByProject((current) => ({
        ...current,
        [projectId]: replacements,
      })),
    );
  }, [projectId]);

  useEffect(() => {
    const stored = savedCandidateJobs();
    const urlRequestId = Number(searchParams.get('requestId'));
    const urlJobId = Number(searchParams.get('jobId'));
    if (urlRequestId > 0 && urlJobId > 0) {
      stored[urlRequestId] = urlJobId;
      rememberCandidateJob(urlRequestId, urlJobId);
    }
    queueMicrotask(() => setJobIds(stored));
  }, [searchParams]);

  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      queueMicrotask(() => setMessage('후보를 보려면 로그인해 주세요.'));
      return;
    }
    projectApi
      .list()
      .then((items) => {
        setProjects(items);
        const requestedProject = searchParams.get('projectId');
        setProjectId(
          String(
            items.find((item) => String(item.projectId) === requestedProject)
              ?.projectId ??
              items[0]?.projectId ??
              '',
          ),
        );
      })
      .catch(() => setMessage('프로젝트 목록을 불러오지 못했습니다.'));
  }, [searchParams]);
  useEffect(() => {
    if (!projectId) return;
    let alive = true;
    const loadProjectRequests = async () => {
      const all: FragranceRequestResponse[] = [];
      let pageNumber = 0;
      while (true) {
        const page = await requestApi.list(
          Number(projectId),
          undefined,
          pageNumber,
          100,
        );
        all.push(...page.content);
        if (!page.hasNext || !page.content.length) return all;
        pageNumber += 1;
      }
    };
    loadProjectRequests()
      .then((items) => {
        if (!alive) return;
        setRequests(items);
        setCandidateGroups({});
      })
      .catch(() => {
        if (alive) setMessage('향 요청 목록을 불러오지 못했습니다.');
      });
    return () => {
      alive = false;
    };
  }, [projectId]);
  useEffect(() => {
    if (!requests.length) return;
    let alive = true;
    void (async () => {
      for (let offset = 0; offset < requests.length; offset += 8) {
        const batch = requests.slice(offset, offset + 8);
        const results = await Promise.allSettled(
          batch.map(
            async (request) =>
              [
                request.requestId,
                await candidateApi.list(request.requestId),
              ] as const,
          ),
        );
        if (!alive) return;
        const entries = results
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<
              readonly [number, CandidateResponse[]]
            > => result.status === 'fulfilled',
          )
          .map((result) => result.value);
        setCandidateGroups((current) => ({
          ...current,
          ...Object.fromEntries(entries),
        }));
        if (results.some((result) => result.status === 'rejected'))
          setMessage('일부 후보 목록을 불러오지 못했습니다.');
      }
    })();
    return () => {
      alive = false;
    };
  }, [requests]);
  useEffect(() => {
    const tracked = requests.filter((request) => jobIds[request.requestId] > 0);
    if (!tracked.length) return;
    let alive = true;
    const timers: number[] = [];
    const closeStreams: Array<() => void> = [];
    const later = (work: () => void) => {
      timers.push(window.setTimeout(work, 3000));
    };

    const loadCandidates = async (id: number, attempt = 0) => {
      try {
        const items = await candidateApi.list(id);
        if (!alive) return;
        setCandidateGroups((current) => ({ ...current, [id]: items }));
        if (!items.length && attempt < 5)
          later(() => {
            void loadCandidates(id, attempt + 1);
          });
        else if (!items.length)
          setMessage('생성 작업은 완료됐지만 표시할 후보가 없습니다.');
      } catch {
        if (alive && attempt < 5)
          later(() => {
            void loadCandidates(id, attempt + 1);
          });
        else if (alive) setMessage('완료된 후보 목록을 불러오지 못했습니다.');
      }
    };
    const applyJob = (id: number, job: JobResponse) => {
      if (!alive) return;
      setJobs((current) => ({ ...current, [id]: job }));
      setJobErrors((current) => ({ ...current, [id]: '' }));
      if (job.status === 'SUCCEEDED') void loadCandidates(id);
    };
    const poll = async (id: number, jobId: number) => {
      try {
        const job = await jobApi.detail(jobId);
        if (!alive) return;
        applyJob(id, job);
        if (job.status === 'PENDING' || job.status === 'RUNNING')
          later(() => {
            void poll(id, jobId);
          });
      } catch (cause) {
        if (!alive) return;
        setJobErrors((current) => ({
          ...current,
          [id]:
            cause instanceof ApiError
              ? cause.message
              : '작업 상태를 확인하지 못했습니다.',
        }));
        if (
          !(
            cause instanceof ApiError &&
            (cause.status === 401 ||
              cause.status === 403 ||
              cause.status === 404)
          )
        ) {
          later(() => {
            void poll(id, jobId);
          });
        }
      }
    };
    for (const request of tracked) {
      const id = request.requestId;
      const jobId = jobIds[id];
      void jobApi
        .detail(jobId)
        .then((job) => {
          if (!alive) return;
          applyJob(id, job);
          if (job.status === 'PENDING' || job.status === 'RUNNING') {
            closeStreams.push(
              subscribeJobUpdates(
                jobId,
                (updated) => applyJob(id, updated),
                () => {
                  if (alive) void poll(id, jobId);
                },
              ),
            );
          }
        })
        .catch(() => {
          if (alive) void poll(id, jobId);
        });
    }
    return () => {
      alive = false;
      for (const close of closeStreams) close();
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [requests, jobIds]);
  const replacements = replacementsByProject[projectId] ?? {};
  const replacedRequestIds = new Set(Object.keys(replacements).map(Number));
  const currentRequests = requests.filter(
    (request) => !replacedRequestIds.has(request.requestId),
  );
  const hiddenFailedIds = new Set(hiddenFailedByProject[projectId] ?? []);
  const failedRequestIds = currentRequests
    .filter(
      (request) =>
        jobs[request.requestId]?.status === 'FAILED' &&
        (candidateGroups[request.requestId]?.length ?? 0) === 0,
    )
    .map((request) => request.requestId);
  const visibleFailedIds = failedRequestIds.filter(
    (id) => !hiddenFailedIds.has(id),
  );
  const hiddenFailedCount = failedRequestIds.length - visibleFailedIds.length;
  const visibleRequests = currentRequests
    .filter(
      (request) =>
        !hiddenFailedIds.has(request.requestId) ||
        jobs[request.requestId]?.status !== 'FAILED' ||
        (candidateGroups[request.requestId]?.length ?? 0) > 0,
    )
    .sort(
      (a, b) =>
        originalRequestId(b.requestId, replacements) -
        originalRequestId(a.requestId, replacements),
    );
  const availableCandidates = useMemo(() => {
    const projectReplacements = replacementsByProject[projectId] ?? {};
    const replaced = new Set(Object.keys(projectReplacements).map(Number));
    return requests
      .filter((request) => !replaced.has(request.requestId))
      .flatMap((request) =>
        (candidateGroups[request.requestId] ?? []).map((candidate) => ({
          candidate,
          requestId: request.requestId,
          displayRequestId: originalRequestId(
            request.requestId,
            projectReplacements,
          ),
        })),
      );
  }, [candidateGroups, projectId, replacementsByProject, requests]);

  useEffect(() => {
    if (!comparisonOpen || selected.length < 2) {
      queueMicrotask(() => {
        setComparison([]);
        setComparing(false);
      });
      return;
    }
    const selectedCandidates = selected.map((id) =>
      availableCandidates.find(({ candidate }) => candidate.candidateId === id),
    );
    if (selectedCandidates.some((item) => !item)) {
      queueMicrotask(() => {
        setComparison([]);
        setComparing(false);
      });
      return;
    }
    let alive = true;
    queueMicrotask(() => {
      if (alive) setComparing(true);
    });
    void Promise.all(
      selectedCandidates.map(
        async (item): Promise<CandidateCompareRow | null> => {
          if (!item) return null;
          const { candidate } = item;
          const prediction = await predictionApi
            .detail(candidate.candidateId)
            .catch(() => null);
          const availability = candidate.currentVersion.ingredients
            .map((ingredient) => ingredient.availability)
            .filter(
              (value) => typeof value === 'number' && Number.isFinite(value),
            );
          return {
            candidateId: candidate.candidateId,
            status: candidate.status,
            goalMatchScore: prediction?.similarityScore ?? null,
            cost: candidate.currentVersion.cost,
            supplyStability: availability.length
              ? (availability.reduce((sum, value) => sum + value, 0) /
                  availability.length) *
                100
              : null,
            modelApplicabilityPercent:
              prediction?.modelApplicabilityPercent ?? null,
          };
        },
      ),
    )
      .then((rows) => {
        if (!alive) return;
        setComparison(
          rows.filter((row): row is CandidateCompareRow => row !== null),
        );
      })
      .catch(() => {
        if (alive) {
          setComparison([]);
          setMessage('비교 결과를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (alive) setComparing(false);
      });
    return () => {
      alive = false;
    };
  }, [comparisonOpen, selected, availableCandidates]);

  function toggleComparisonCandidate(id: number) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
  }

  function hideFailedRequests(ids: number[]) {
    const updated = [...new Set([...hiddenFailedIds, ...ids])];
    setHiddenFailedByProject((current) => ({
      ...current,
      [projectId]: updated,
    }));
    rememberHiddenFailedRequests(projectId, updated);
  }

  function restoreFailedRequests() {
    setHiddenFailedByProject((current) => ({ ...current, [projectId]: [] }));
    rememberHiddenFailedRequests(projectId, []);
  }

  async function startGeneration(id: number) {
    setBusyRequestId(id);
    setJobErrors((current) => ({ ...current, [id]: '' }));
    try {
      const job = await candidateApi.generate(id);
      rememberCandidateJob(id, job.jobId);
      setJobs((current) => ({ ...current, [id]: job }));
      setJobIds((current) => ({ ...current, [id]: job.jobId }));
    } catch (cause) {
      setJobErrors((current) => ({
        ...current,
        [id]:
          cause instanceof ApiError
            ? cause.message
            : '후보 생성을 시작하지 못했습니다.',
      }));
    } finally {
      setBusyRequestId(null);
    }
  }
  async function retryGeneration(id: number) {
    const job = jobs[id];
    if (!job?.retryable) return;
    setBusyRequestId(id);
    setJobErrors((current) => ({ ...current, [id]: '' }));
    try {
      await jobApi.retry(job.jobId);
      setJobs((current) => ({
        ...current,
        [id]: { ...job, status: 'PENDING', failureReason: null },
      }));
      setJobIds((current) => ({ ...current, [id]: job.jobId }));
    } catch (cause) {
      setJobErrors((current) => ({
        ...current,
        [id]:
          cause instanceof ApiError ? cause.message : '재시도하지 못했습니다.',
      }));
    } finally {
      setBusyRequestId(null);
    }
  }
  return (
    <div
      className={`wf-layout wf-formula-page ${comparisonOpen ? 'is-comparing' : ''}`}
    >
      <Rail />
      <section className="wf-main">
        <div className="wf-formula-top">
          <div>
            <h1 className="wf-title">후보 조향식 목록</h1>
            <p className="wf-sub">
              상세를 확인하고 최적의 조향식을 선택하세요.
            </p>
          </div>
          <div className="wf-catalog-controls">
            <div className="wf-catalog-selectors">
              <label>
                프로젝트
                <select
                  value={projectId}
                  onChange={(event) => {
                    setProjectId(event.target.value);
                    setRequests([]);
                    setCandidateGroups({});
                    setSelected([]);
                    setComparison([]);
                    setComparisonOpen(false);
                    setMessage('');
                  }}
                >
                  <option value="">선택</option>
                  {projects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {(visibleFailedIds.length > 0 || hiddenFailedCount > 0) && (
              <div className="wf-failed-card-controls">
                {visibleFailedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => hideFailedRequests(visibleFailedIds)}
                  >
                    실패 항목 정리 ({visibleFailedIds.length})
                  </button>
                )}
                {hiddenFailedCount > 0 && (
                  <button type="button" onClick={restoreFailedRequests}>
                    숨긴 항목 다시 보기 ({hiddenFailedCount})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {message && <output className="wf-request-hint">{message}</output>}
        {visibleRequests.length > 0 ? (
          <div className="wf-cards wf-request-cards">
            {visibleRequests.flatMap((request, index) => {
              const items = candidateGroups[request.requestId] ?? [];
              const job = jobs[request.requestId];
              const partial =
                items.length > 0 &&
                (job?.status === 'PENDING' || job?.status === 'RUNNING');
              const cards = items.map((candidate, candidateIndex) => (
                <FormulaCard
                  candidate={candidate}
                  index={index + candidateIndex}
                  productCategory={request.structuredIntent.productCategory}
                  jobStatus={job?.status}
                  key={`candidate-${candidate.candidateId}`}
                />
              ));
              if (!items.length || partial)
                cards.push(
                  <GenerationCard
                    request={request}
                    displayRequestId={originalRequestId(
                      request.requestId,
                      replacements,
                    )}
                    projectId={projectId}
                    index={index}
                    job={job}
                    knownJobId={jobIds[request.requestId]}
                    busy={busyRequestId === request.requestId}
                    error={jobErrors[request.requestId]}
                    partial={partial}
                    onStart={() => void startGeneration(request.requestId)}
                    onRetry={() => void retryGeneration(request.requestId)}
                    onHide={() => hideFailedRequests([request.requestId])}
                    key={`job-${request.requestId}`}
                  />,
                );
              return cards;
            })}
          </div>
        ) : (
          <p className="wf-formula-empty-note">
            {requests.length > 0
              ? '실패 항목을 모두 숨겼습니다. 필요하면 위에서 다시 볼 수 있습니다.'
              : projectId
                ? '이 프로젝트에는 아직 향 요청이 없습니다.'
                : '프로젝트를 선택해 주세요.'}
          </p>
        )}
        <div className="wf-compare-heading">
          <div>
            <h2 className="wf-compare-title">후보 조향식 비교</h2>
            <p className="wf-sub">
              같은 프로젝트의 후보를 최대 3개까지 비교할 수 있습니다.
            </p>
          </div>
          {comparisonOpen && (
            <button
              type="button"
              className="wf-compare-reset"
              onClick={() => {
                setSelected([]);
                setComparison([]);
              }}
            >
              비교 초기화
            </button>
          )}
        </div>
        {!comparisonOpen ? (
          <button
            type="button"
            className="wf-compare-add"
            onClick={() => setComparisonOpen(true)}
            disabled={availableCandidates.length < 2}
          >
            + 비교할 후보 선택하기
          </button>
        ) : (
          <div className="wf-comparison">
            <div className="wf-comparison-options" aria-label="비교할 후보">
              <p>
                비교할 후보를 선택해 주세요 <span>{selected.length}/3</span>
              </p>
              <div>
                {availableCandidates.map(({ candidate, displayRequestId }) => (
                  <button
                    type="button"
                    key={candidate.candidateId}
                    className={
                      selected.includes(candidate.candidateId)
                        ? 'is-selected'
                        : ''
                    }
                    onClick={() =>
                      toggleComparisonCandidate(candidate.candidateId)
                    }
                    disabled={
                      !selected.includes(candidate.candidateId) &&
                      selected.length >= 3
                    }
                    aria-pressed={selected.includes(candidate.candidateId)}
                  >
                    <b>
                      FORMULA {String(candidate.candidateId).padStart(2, '0')}
                    </b>
                    <small>
                      향 요청 {String(displayRequestId).padStart(2, '0')}
                    </small>
                  </button>
                ))}
              </div>
            </div>
            {selected.length > 0 && (
              <div className="wf-comparison-picks">
                {selected.map((id) => (
                  <button
                    type="button"
                    className="wf-comparison-pick"
                    onClick={() => toggleComparisonCandidate(id)}
                    key={id}
                  >
                    <span>
                      <small>
                        향 요청{' '}
                        {String(
                          availableCandidates.find(
                            ({ candidate }) => candidate.candidateId === id,
                          )?.displayRequestId ?? '—',
                        )}
                      </small>
                    </span>
                    <b>FORMULA {String(id).padStart(2, '0')}</b>
                    <i>×</i>
                  </button>
                ))}
              </div>
            )}
            {comparing && selected.length >= 2 && (
              <output className="wf-comparison-status">
                비교 결과를 불러오는 중입니다.
              </output>
            )}
            {comparison.length > 0 && (
              <div className="wf-comparison-table">
                <div className="wf-comparison-row head">
                  <b>후보</b>
                  <b>향 요청</b>
                  <b>목표 일치도</b>
                  <b>비용</b>
                  <b>공급 안정성</b>
                  <b>모델 적용성</b>
                </div>
                {comparison.map((row) => (
                  <div className="wf-comparison-row" key={row.candidateId}>
                    <span>
                      FORMULA {String(row.candidateId).padStart(2, '0')}
                    </span>
                    <span>
                      {availableCandidates.find(
                        ({ candidate }) =>
                          candidate.candidateId === row.candidateId,
                      )?.displayRequestId ?? '—'}
                    </span>
                    <span>{row.goalMatchScore ?? '—'}</span>
                    <span>{row.cost ?? '—'}</span>
                    <span>
                      {row.supplyStability == null
                        ? '—'
                        : `${Number(row.supplyStability.toFixed(1))}%`}
                    </span>
                    <span>
                      {row.modelApplicabilityPercent == null
                        ? '—'
                        : `${row.modelApplicabilityPercent}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {comparison.length > 0 && (
              <p className="wf-comparison-footnote">
                목표 일치도는 각 후보의 향 요청을 기준으로 계산된 값입니다.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export function EmptyWorkspace({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="wf-layout wf-empty-page">
      <Rail />
      <section className="wf-main">
        <h1 className="wf-title">{title}</h1>
        <p className="wf-sub">{sub}</p>
      </section>
    </div>
  );
}
