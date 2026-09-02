import { apiRequest, tokenStorage } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type {
  ApprovalGateResponse,
  CandidateCompareRow,
  CandidateResponse,
  CandidateVersionIngredient,
  CandidateVersionResponse,
  CatalogSyncResponse,
  EvidenceLog,
  EvidenceReportResponse,
  ExperimentStatusLog,
  FragranceRequestCreate,
  FragranceRequestResponse,
  IngredientResponse,
  JobResponse,
  LoginRequest,
  MemberResponse,
  PredictionResponse,
  ProjectCreate,
  ProjectMemberResponse,
  ProjectResponse,
  Role,
  SafetyEvaluationResponse,
  SensoryTestResponse,
  SensoryTestResultResponse,
  SignupRequest,
  SupplyChangeImpact,
  SupplyChangeResponse,
  SupplyReviewDecisionResponse,
  TokenResponse,
} from '@/types/domain';

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
});
const patch = (body: unknown): RequestInit => ({
  method: 'PATCH',
  body: JSON.stringify(body),
});

export const authApi = {
  async login(body: LoginRequest) {
    const tokens = await apiRequest<TokenResponse>(
      endpoints.auth.login,
      json(body),
      false,
    );
    tokenStorage.set(tokens);
    return tokens;
  },
  signup: (body: SignupRequest) =>
    apiRequest<MemberResponse>(endpoints.auth.signup, json(body), false),
  async logout() {
    await apiRequest<void>(endpoints.auth.logout, { method: 'POST' });
    tokenStorage.clear();
  },
  me: () => apiRequest<MemberResponse>(endpoints.me),
};

export const projectApi = {
  list: () => apiRequest<ProjectResponse[]>(endpoints.projects),
  create: (body: ProjectCreate) =>
    apiRequest<ProjectResponse>(endpoints.projects, json(body)),
  detail: (id: number) => apiRequest<ProjectResponse>(endpoints.project(id)),
  update: (id: number, body: Partial<ProjectCreate>) =>
    apiRequest<ProjectResponse>(endpoints.project(id), patch(body)),
  members: (id: number) =>
    apiRequest<ProjectMemberResponse[]>(endpoints.projectMembers(id)),
  invite: (id: number, email: string, role: Role) =>
    apiRequest<ProjectMemberResponse>(
      endpoints.projectMembers(id),
      json({ email, role }),
    ),
};

export const jobApi = {
  detail: (id: number) => apiRequest<JobResponse>(endpoints.job(id)),
  retry: (id: number) =>
    apiRequest<void>(endpoints.jobRetry(id), { method: 'POST' }),
  cancel: (id: number) =>
    apiRequest<void>(endpoints.jobCancel(id), { method: 'POST' }),
};
export const requestApi = {
  list: (projectId: number, status?: string) =>
    apiRequest<FragranceRequestResponse[]>(
      `${endpoints.projectRequests(projectId)}${status ? `?status=${encodeURIComponent(status)}` : ''}`,
    ),
  create: (projectId: number, body: FragranceRequestCreate) =>
    apiRequest<FragranceRequestResponse>(
      endpoints.projectRequests(projectId),
      json(body),
    ),
  detail: (id: number) =>
    apiRequest<FragranceRequestResponse>(endpoints.request(id)),
  update: (id: number, structuredIntent: Record<string, unknown>) =>
    apiRequest<FragranceRequestResponse>(
      endpoints.request(id),
      patch({ structuredIntent }),
    ),
  confirm: (id: number) =>
    apiRequest<FragranceRequestResponse>(endpoints.requestConfirm(id), {
      method: 'POST',
    }),
};
export const candidateApi = {
  generate: (requestId: number) =>
    apiRequest<JobResponse>(endpoints.requestCandidates(requestId), {
      method: 'POST',
    }),
  list: (requestId: number) =>
    apiRequest<CandidateResponse[]>(endpoints.requestCandidates(requestId)),
  compare: (requestId: number, ids: number[]) =>
    apiRequest<CandidateCompareRow[]>(
      `${endpoints.compareCandidates(requestId)}?candidateIds=${ids.join(',')}`,
    ),
  detail: (id: number) =>
    apiRequest<CandidateResponse>(endpoints.candidate(id)),
  update: (id: number, ingredients: CandidateVersionIngredient[]) =>
    apiRequest<CandidateResponse>(
      endpoints.candidate(id),
      patch({ ingredients }),
    ),
  duplicate: (id: number) =>
    apiRequest<CandidateResponse>(endpoints.candidateDuplicate(id), {
      method: 'POST',
    }),
  versions: (id: number) =>
    apiRequest<CandidateVersionResponse[]>(endpoints.candidateVersions(id)),
};
export const safetyApi = {
  detail: (id: number) =>
    apiRequest<SafetyEvaluationResponse>(endpoints.safety(id)),
  rerun: (id: number) =>
    apiRequest<void>(endpoints.safety(id), { method: 'POST' }),
  gates: (id: number) =>
    apiRequest<ApprovalGateResponse[]>(endpoints.approvalGate(id)),
  decide: (id: number, decision: 'APPROVED' | 'REJECTED', comment?: string) =>
    apiRequest<ApprovalGateResponse>(
      endpoints.approvalGate(id),
      json({ decision, comment }),
    ),
};
export const predictionApi = {
  detail: (id: number) =>
    apiRequest<PredictionResponse>(endpoints.predictions(id)),
  recalculate: (id: number) =>
    apiRequest<void>(endpoints.predictions(id), { method: 'POST' }),
  uncertainty: (id: number) =>
    apiRequest<PredictionResponse>(endpoints.uncertainty(id)),
};
export const evidenceApi = {
  logs: (id: number) => apiRequest<EvidenceLog[]>(endpoints.evidence(id)),
  tests: (id: number) =>
    apiRequest<SensoryTestResponse[]>(endpoints.sensoryTests(id)),
  createTest: (id: number, planDetail: string) =>
    apiRequest<SensoryTestResponse>(
      endpoints.sensoryTests(id),
      json({ planDetail }),
    ),
  test: (id: number) =>
    apiRequest<SensoryTestResponse>(endpoints.sensoryTest(id)),
  addResult: (id: number, resultData: Record<string, unknown>) =>
    apiRequest<SensoryTestResultResponse>(
      endpoints.sensoryResults(id),
      json({ resultData }),
    ),
  createReport: (id: number) =>
    apiRequest<JobResponse>(endpoints.evidenceReports(id), { method: 'POST' }),
  report: (id: number) =>
    apiRequest<EvidenceReportResponse>(endpoints.evidenceReport(id)),
};
export const ingredientApi = {
  list: (keyword?: string) =>
    apiRequest<IngredientResponse[]>(
      `${endpoints.ingredients}${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`,
    ),
  detail: (id: number) =>
    apiRequest<IngredientResponse>(endpoints.ingredient(id)),
  sync: () =>
    apiRequest<JobResponse>(endpoints.catalogSync, { method: 'POST' }),
  syncStatus: (jobId: number) =>
    apiRequest<CatalogSyncResponse>(endpoints.catalogSyncJob(jobId)),
};
export const experimentApi = {
  history: (id: number) =>
    apiRequest<ExperimentStatusLog[]>(endpoints.experimentStatus(id)),
  update: (id: number, status: ExperimentStatusLog['status']) =>
    apiRequest<ExperimentStatusLog>(
      endpoints.experimentStatus(id),
      json({ status }),
    ),
};

export const supplyApi = {
  createChange: (
    ingredientId: number,
    body: { changeType: string; description: string; effectiveDate: string },
  ) =>
    apiRequest<JobResponse>(endpoints.supplyChanges(ingredientId), json(body)),
  change: (changeId: number) =>
    apiRequest<SupplyChangeResponse>(endpoints.supplyChange(changeId)),
  affectedCandidates: (changeId: number) =>
    apiRequest<SupplyChangeImpact[]>(endpoints.affectedCandidates(changeId)),
  decisions: (candidateId: number) =>
    apiRequest<SupplyReviewDecisionResponse[]>(
      endpoints.supplyDecisions(candidateId),
    ),
  decide: (
    candidateId: number,
    body: {
      supplyChangeId: number;
      decision: 'KEEP' | 'MODIFY' | 'DISCARD';
      comment?: string;
    },
  ) =>
    apiRequest<SupplyReviewDecisionResponse>(
      endpoints.supplyDecisions(candidateId),
      json(body),
    ),
};
