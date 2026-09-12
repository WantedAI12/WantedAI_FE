import { apiRequest, tokenStorage } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type {
  ApprovalGateResponse,
  CandidateCompareRow,
  CandidateResponse,
  CandidateVersionResponse,
  CatalogSyncResponse,
  EvidenceLog,
  EvidenceReportResponse,
  ExperimentStatusLog,
  FragranceRequestCreate,
  FragranceRequestResponse,
  FragranceRequestUpdate,
  IngredientResponse,
  IngredientDetailResponse,
  JobResponse,
  LoginRequest,
  MemberResponse,
  PredictionResponse,
  PredictionUncertaintyResponse,
  ProjectCreate,
  ProjectMemberResponse,
  ProjectResponse,
  Role,
  SafetyEvaluationResponse,
  SensoryTestResponse,
  SensoryTestDetailResponse,
  SensoryTestResultResponse,
  SignupRequest,
  SupplyChangeImpact,
  SupplyChangeResponse,
  SupplyChangeType,
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
  async login(body: LoginRequest, remember = false) {
    const tokens = await apiRequest<TokenResponse>(
      endpoints.auth.login,
      json(body),
      false,
    );
    tokenStorage.set(tokens, remember);
    return tokens;
  },
  signup: (body: SignupRequest) =>
    apiRequest<MemberResponse>(endpoints.auth.signup, json(body), false),
  async refresh() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    const tokens = await apiRequest<TokenResponse>(
      endpoints.auth.refresh,
      json({ refreshToken }),
      false,
    );
    tokenStorage.set(tokens);
    return tokens;
  },
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiRequest<void>(
          endpoints.auth.logout,
          json({ refreshToken }),
          false,
        );
      }
    } finally {
      tokenStorage.clear();
    }
  },
  me: () => apiRequest<MemberResponse>(endpoints.me),
  updateProfile: (name: string) =>
    apiRequest<MemberResponse>(endpoints.me, patch({ name })),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<void>(
      endpoints.mePassword,
      patch({ currentPassword, newPassword }),
    ),
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
  changeMemberRole: (id: number, memberId: number, role: Role) =>
    apiRequest<ProjectMemberResponse>(
      endpoints.projectMember(id, memberId),
      patch({ role }),
    ),
  removeMember: (id: number, memberId: number) =>
    apiRequest<void>(endpoints.projectMember(id, memberId), {
      method: 'DELETE',
    }),
};

export const jobApi = {
  detail: (id: number) => apiRequest<JobResponse>(endpoints.job(id)),
  retry: (id: number) =>
    apiRequest<void>(endpoints.jobRetry(id), { method: 'POST' }),
  cancel: (id: number) =>
    apiRequest<JobResponse>(endpoints.jobCancel(id), { method: 'POST' }),
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
  update: (id: number, body: FragranceRequestUpdate) =>
    apiRequest<FragranceRequestResponse>(
      endpoints.request(id),
      patch(body),
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
  versions: (id: number) =>
    apiRequest<CandidateVersionResponse[]>(endpoints.candidateVersions(id)),
  version: (id: number) =>
    apiRequest<CandidateVersionResponse>(endpoints.candidateVersion(id)),
};
export const safetyApi = {
  detail: (id: number) =>
    apiRequest<SafetyEvaluationResponse>(endpoints.safety(id)),
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
  uncertainty: (id: number) =>
    apiRequest<PredictionUncertaintyResponse>(endpoints.uncertainty(id)),
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
    apiRequest<SensoryTestDetailResponse>(endpoints.sensoryTest(id)),
  addResult: (
    id: number,
    resultData: Record<string, unknown>,
    correlationWithPrediction?: number,
  ) =>
    apiRequest<SensoryTestResultResponse>(
      endpoints.sensoryResults(id),
      json({ resultData, correlationWithPrediction }),
    ),
  createReport: (id: number) =>
    apiRequest<JobResponse>(endpoints.evidenceReports(id), { method: 'POST' }),
  report: (id: number) =>
    apiRequest<EvidenceReportResponse>(endpoints.evidenceReport(id)),
};
export const ingredientApi = {
  list: (query?: string, pyramid?: string) => {
    const search = new URLSearchParams({
        ...(query ? { query } : {}),
        ...(pyramid ? { pyramid } : {}),
      }).toString();
    return apiRequest<IngredientResponse[]>(
      `${endpoints.ingredients}${search ? `?${search}` : ''}`,
    );
  },
  detail: (id: string) =>
    apiRequest<IngredientDetailResponse>(endpoints.ingredient(id)),
  sync: (projectId: number) =>
    apiRequest<JobResponse>(endpoints.catalogSync, json({ projectId })),
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
    ingredientId: string,
    body: {
      projectId: number;
      changeType: SupplyChangeType;
      previousPricePerKg?: number;
      newPricePerKg?: number;
      note?: string;
    },
  ) =>
    apiRequest<SupplyChangeResponse>(
      endpoints.supplyChanges(ingredientId),
      json(body),
    ),
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
      supplyChangeId?: number;
      decision: 'KEEP_FORMULA' | 'REVISE_FORMULA' | 'DISCARD_CANDIDATE';
      rationale: string;
    },
  ) =>
    apiRequest<SupplyReviewDecisionResponse>(
      endpoints.supplyDecisions(candidateId),
      json(body),
    ),
};
